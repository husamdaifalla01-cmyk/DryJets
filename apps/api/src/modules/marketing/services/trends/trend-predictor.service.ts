import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

export interface TrendPrediction {
  trendId: string;
  keyword: string;
  currentLifecycle: string;
  predictedPeak: Date;
  daysUntilPeak: number;
  opportunityWindow: {
    start: Date;
    end: Date;
    daysRemaining: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  velocity: number; // Rate of growth change
  acceleration: number; // Rate of velocity change
  confidence: number; // 0-100
  reasoning: string;
  recommendedActions: string[];
}

export interface TrendVelocityData {
  keyword: string;
  dataPoints: Array<{
    date: Date;
    volume: number;
    growth: number;
  }>;
  currentVelocity: number;
  currentAcceleration: number;
}

@Injectable()
export class TrendPredictorService {
  private readonly logger = new Logger('TrendPredictor');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Predict trend peak and opportunity window
   */
  async predictTrendPeak(trendId: string): Promise<TrendPrediction> {
    this.logger.log(`Predicting peak for trend ${trendId}...`);

    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend ${trendId} not found`);
    }

    // Calculate velocity and acceleration
    const velocityData = await this.calculateVelocity(trend.keyword);

    // Get AI prediction
    const aiPrediction = await this.getAIPrediction(trend, velocityData);

    // Calculate opportunity window
    const opportunityWindow = this.calculateOpportunityWindow(
      aiPrediction.predictedPeak,
      trend.lifecycle as string,
      velocityData.currentVelocity,
    );

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(
      trend,
      aiPrediction.predictedPeak,
      opportunityWindow,
    );

    const prediction: TrendPrediction = {
      trendId: trend.id,
      keyword: trend.keyword,
      currentLifecycle: trend.lifecycle,
      predictedPeak: aiPrediction.predictedPeak,
      daysUntilPeak: aiPrediction.daysUntilPeak,
      opportunityWindow,
      velocity: velocityData.currentVelocity,
      acceleration: velocityData.currentAcceleration,
      confidence: aiPrediction.confidence,
      reasoning: aiPrediction.reasoning,
      recommendedActions,
    };

    // Store prediction in database
    await this.storePrediction(prediction);

    this.logger.log(`Predicted peak for "${trend.keyword}": ${aiPrediction.daysUntilPeak} days`);
    return prediction;
  }

  /**
   * Calculate trend velocity and acceleration
   */
  private async calculateVelocity(keyword: string): Promise<TrendVelocityData> {
    // Get historical data for this keyword (last 30 days)
    const historicalData = await this.prisma.trendData.findMany({
      where: {
        keyword,
        capturedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { capturedAt: 'asc' },
    });

    if (historicalData.length < 2) {
      // Not enough data, return defaults
      return {
        keyword,
        dataPoints: [],
        currentVelocity: 0,
        currentAcceleration: 0,
      };
    }

    const dataPoints = historicalData.map(d => ({
      date: d.capturedAt,
      volume: d.volume,
      growth: parseFloat(d.growth.toString()),
    }));

    // Calculate velocity (rate of change in growth)
    const velocities: number[] = [];
    for (let i = 1; i < dataPoints.length; i++) {
      const timeDiff = (dataPoints[i].date.getTime() - dataPoints[i - 1].date.getTime()) / (1000 * 60 * 60 * 24); // days
      const growthDiff = dataPoints[i].growth - dataPoints[i - 1].growth;
      velocities.push(growthDiff / timeDiff);
    }

    const currentVelocity = velocities.length > 0 ? velocities[velocities.length - 1] : 0;

    // Calculate acceleration (rate of change in velocity)
    const accelerations: number[] = [];
    for (let i = 1; i < velocities.length; i++) {
      accelerations.push(velocities[i] - velocities[i - 1]);
    }

    const currentAcceleration = accelerations.length > 0 ? accelerations[accelerations.length - 1] : 0;

    return {
      keyword,
      dataPoints,
      currentVelocity: parseFloat(currentVelocity.toFixed(2)),
      currentAcceleration: parseFloat(currentAcceleration.toFixed(2)),
    };
  }

  /**
   * Get AI-powered prediction
   */
  private async getAIPrediction(
    trend: any,
    velocityData: TrendVelocityData,
  ): Promise<{
    predictedPeak: Date;
    daysUntilPeak: number;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `You are a trend forecasting expert. Analyze this trend and predict when it will reach its peak.

Trend Data:
- Keyword: "${trend.keyword}"
- Source: ${trend.source}
- Current Volume: ${trend.volume}
- Current Growth: ${parseFloat(trend.growth.toString())}%
- Current Lifecycle: ${trend.lifecycle}
- Competition: ${trend.competition}/100
- Velocity: ${velocityData.currentVelocity} (rate of growth change per day)
- Acceleration: ${velocityData.currentAcceleration} (rate of velocity change)

Historical Context:
${velocityData.dataPoints.length > 0 ? `
- Data points collected: ${velocityData.dataPoints.length}
- Growth trend: ${velocityData.dataPoints.map(d => d.growth).join(', ')}%
` : 'Limited historical data available'}

Consider:
1. Current lifecycle stage
2. Velocity and acceleration patterns
3. Typical trend lifecycles for this type of content
4. Seasonality and external factors
5. Competition level

Provide your prediction in JSON format:
{
  "daysUntilPeak": <number between 1-30>,
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentence explanation>"
}

Return ONLY the JSON object.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const predictedPeak = new Date(Date.now() + result.daysUntilPeak * 24 * 60 * 60 * 1000);

        return {
          predictedPeak,
          daysUntilPeak: result.daysUntilPeak,
          confidence: Math.min(100, Math.max(0, result.confidence)),
          reasoning: result.reasoning,
        };
      }
    } catch (error) {
      this.logger.error(`Error getting AI prediction: ${error.message}`);
    }

    // Fallback: rule-based prediction
    return this.getRuleBasedPrediction(trend, velocityData);
  }

  /**
   * Rule-based prediction fallback
   */
  private getRuleBasedPrediction(
    trend: any,
    velocityData: TrendVelocityData,
  ): {
    predictedPeak: Date;
    daysUntilPeak: number;
    confidence: number;
    reasoning: string;
  } {
    let daysUntilPeak = 7; // Default
    let confidence = 50;

    const growth = parseFloat(trend.growth.toString());
    const velocity = velocityData.currentVelocity;
    const acceleration = velocityData.currentAcceleration;

    if (trend.lifecycle === 'EMERGING') {
      if (velocity > 10 && acceleration > 0) {
        daysUntilPeak = 3; // Fast-moving emerging trend
        confidence = 70;
      } else {
        daysUntilPeak = 7;
        confidence = 60;
      }
    } else if (trend.lifecycle === 'GROWING') {
      if (acceleration < 0) {
        daysUntilPeak = 2; // Decelerating, peak soon
        confidence = 75;
      } else {
        daysUntilPeak = 5;
        confidence = 65;
      }
    } else if (trend.lifecycle === 'PEAK') {
      daysUntilPeak = 1; // Already at peak
      confidence = 90;
    } else if (trend.lifecycle === 'DECLINING') {
      daysUntilPeak = 0; // Past peak
      confidence = 95;
    }

    const predictedPeak = new Date(Date.now() + daysUntilPeak * 24 * 60 * 60 * 1000);

    return {
      predictedPeak,
      daysUntilPeak,
      confidence,
      reasoning: `Rule-based prediction: ${trend.lifecycle} stage with velocity ${velocity.toFixed(2)}/day`,
    };
  }

  /**
   * Calculate opportunity window
   */
  private calculateOpportunityWindow(
    predictedPeak: Date,
    lifecycle: string,
    velocity: number,
  ): {
    start: Date;
    end: Date;
    daysRemaining: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  } {
    const now = new Date();
    const peakTime = predictedPeak.getTime();
    const nowTime = now.getTime();

    // Opportunity window: 3-5 days before peak to 1 day after peak
    const windowStart = new Date(peakTime - 5 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(peakTime + 1 * 24 * 60 * 60 * 1000);

    const daysRemaining = Math.max(0, Math.floor((windowEnd.getTime() - nowTime) / (1000 * 60 * 60 * 24)));

    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (daysRemaining <= 1) {
      urgency = 'CRITICAL';
    } else if (daysRemaining <= 3) {
      urgency = 'HIGH';
    } else if (daysRemaining <= 5) {
      urgency = 'MEDIUM';
    } else {
      urgency = 'LOW';
    }

    // If velocity is very high, increase urgency
    if (velocity > 20 && urgency !== 'CRITICAL') {
      urgency = urgency === 'LOW' ? 'MEDIUM' : urgency === 'MEDIUM' ? 'HIGH' : 'CRITICAL';
    }

    return {
      start: windowStart,
      end: windowEnd,
      daysRemaining,
      urgency,
    };
  }

  /**
   * Generate recommended actions
   */
  private generateRecommendedActions(
    trend: any,
    predictedPeak: Date,
    opportunityWindow: any,
  ): string[] {
    const actions: string[] = [];
    const daysUntilPeak = Math.floor((predictedPeak.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (opportunityWindow.urgency === 'CRITICAL') {
      actions.push('🔴 URGENT: Create content within 24 hours to catch this trend');
      actions.push('Publish immediately to social media platforms');
      actions.push('Consider paid promotion to amplify reach');
    } else if (opportunityWindow.urgency === 'HIGH') {
      actions.push('🟠 HIGH PRIORITY: Schedule content creation this week');
      actions.push('Prepare social media posts and blog content');
      actions.push('Alert content team to prioritize this trend');
    } else if (opportunityWindow.urgency === 'MEDIUM') {
      actions.push('🟡 Plan content strategy for this trend');
      actions.push('Research related keywords and angles');
      actions.push('Schedule content creation for next week');
    } else {
      actions.push('🟢 Monitor trend development');
      actions.push('Add to content calendar for future consideration');
      actions.push('Track velocity changes for timing optimization');
    }

    // Add pillar-specific actions
    if (Array.isArray(trend.pillar)) {
      if (trend.pillar.includes('core-service')) {
        actions.push('Create service-focused content highlighting DryJets offerings');
      }
      if (trend.pillar.includes('sustainability')) {
        actions.push('Emphasize eco-friendly practices in content');
      }
      if (trend.pillar.includes('technology')) {
        actions.push('Highlight tech innovations in laundry/dry cleaning');
      }
    }

    return actions;
  }

  /**
   * Store prediction in database
   */
  private async storePrediction(prediction: TrendPrediction): Promise<void> {
    try {
      await this.prisma.trendData.update({
        where: { id: prediction.trendId },
        data: {
          peakPrediction: prediction.predictedPeak,
          opportunityWindow: {
            start: prediction.opportunityWindow.start,
            end: prediction.opportunityWindow.end,
            daysRemaining: prediction.opportunityWindow.daysRemaining,
            urgency: prediction.opportunityWindow.urgency,
            velocity: prediction.velocity,
            acceleration: prediction.acceleration,
            confidence: prediction.confidence,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to store prediction: ${error.message}`);
    }
  }

  /**
   * Run algorithm experiment: Compare AI vs Rule-based predictions
   */
  async runAlgorithmExperiment(trendId: string): Promise<{
    experimentId: string;
    aiPrediction: any;
    ruleBasedPrediction: any;
    recommendation: string;
  }> {
    this.logger.log(`Running algorithm experiment for trend ${trendId}...`);

    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend ${trendId} not found`);
    }

    const velocityData = await this.calculateVelocity(trend.keyword);

    // Run both algorithms
    const aiPrediction = await this.getAIPrediction(trend, velocityData);
    const ruleBasedPrediction = this.getRuleBasedPrediction(trend, velocityData);

    // Calculate variance between predictions
    const daysDifference = Math.abs(aiPrediction.daysUntilPeak - ruleBasedPrediction.daysUntilPeak);
    const confidenceDifference = Math.abs(aiPrediction.confidence - ruleBasedPrediction.confidence);

    // Store experiment in database
    const experiment = await this.prisma.algorithmExperiment.create({
      data: {
        platform: 'trend_prediction', // Using this field to indicate prediction experiments
        variable: `AI vs Rule-Based: ${trend.keyword}`,
        hypothesis: `AI prediction (${aiPrediction.daysUntilPeak}d) vs Rule-based (${ruleBasedPrediction.daysUntilPeak}d) for trend "${trend.keyword}"`,
        control: {
          type: 'RULE_BASED',
          trendId,
          keyword: trend.keyword,
          lifecycle: trend.lifecycle,
          velocity: velocityData.currentVelocity,
          acceleration: velocityData.currentAcceleration,
          prediction: {
            daysUntilPeak: ruleBasedPrediction.daysUntilPeak,
            confidence: ruleBasedPrediction.confidence,
            reasoning: ruleBasedPrediction.reasoning,
          },
        },
        variant: {
          type: 'AI_POWERED',
          prediction: {
            daysUntilPeak: aiPrediction.daysUntilPeak,
            confidence: aiPrediction.confidence,
            reasoning: aiPrediction.reasoning,
          },
          variance: {
            daysDifference,
            confidenceDifference,
          },
        },
        controlPerformance: ruleBasedPrediction.confidence,
        variantPerformance: aiPrediction.confidence,
        status: 'RUNNING',
        learning: 'Experiment in progress - awaiting actual trend peak data',
        startedAt: new Date(),
      },
    });

    // Determine recommendation based on confidence and variance
    let recommendation: string;
    if (daysDifference <= 1 && aiPrediction.confidence > 70) {
      recommendation = 'Use AI prediction - High confidence with low variance';
    } else if (daysDifference > 5) {
      recommendation = 'Significant variance detected - Monitor both predictions and wait for more data';
    } else if (aiPrediction.confidence > ruleBasedPrediction.confidence + 15) {
      recommendation = 'Use AI prediction - Significantly higher confidence';
    } else if (ruleBasedPrediction.confidence > aiPrediction.confidence + 15) {
      recommendation = 'Use rule-based prediction - More confident in this case';
    } else {
      recommendation = 'Use average of both predictions for balanced approach';
    }

    this.logger.log(`Experiment ${experiment.id} created: ${recommendation}`);

    return {
      experimentId: experiment.id,
      aiPrediction,
      ruleBasedPrediction,
      recommendation,
    };
  }

  /**
   * Complete algorithm experiment with actual results
   */
  async completeExperiment(experimentId: string, actualPeakDate: Date): Promise<void> {
    this.logger.log(`Completing experiment ${experimentId}...`);

    const experiment = await this.prisma.algorithmExperiment.findUnique({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const control = experiment.control as any;
    const variant = experiment.variant as any;
    const aiDaysUntilPeak = variant.prediction.daysUntilPeak;
    const ruleDaysUntilPeak = control.prediction.daysUntilPeak;

    const startDate = experiment.startedAt;
    const actualDaysUntilPeak = Math.floor((actualPeakDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate accuracy for each algorithm
    const aiError = Math.abs(aiDaysUntilPeak - actualDaysUntilPeak);
    const ruleError = Math.abs(ruleDaysUntilPeak - actualDaysUntilPeak);
    const aiAccuracy = Math.max(0, 100 - (aiError / (actualDaysUntilPeak || 1)) * 100);
    const ruleAccuracy = Math.max(0, 100 - (ruleError / (actualDaysUntilPeak || 1)) * 100);

    // Determine winner
    const winner = aiAccuracy > ruleAccuracy ? 'AI' : 'RULE_BASED';
    const improvement = Math.abs(aiAccuracy - ruleAccuracy);

    // Determine statistical significance (simple p-value estimation)
    const isSignificant = improvement > 10; // >10% difference considered significant
    const pValue = isSignificant ? 0.05 : 0.15;

    await this.prisma.algorithmExperiment.update({
      where: { id: experimentId },
      data: {
        controlPerformance: ruleAccuracy,
        variantPerformance: aiAccuracy,
        improvement,
        statistically_significant: isSignificant,
        confidence: Math.max(aiAccuracy, ruleAccuracy),
        pValue,
        status: 'COMPLETED',
        completedAt: new Date(),
        learning: `${winner} algorithm won with ${improvement.toFixed(1)}% better accuracy. AI: ${aiAccuracy.toFixed(1)}%, Rule-based: ${ruleAccuracy.toFixed(1)}%. Actual peak was ${actualDaysUntilPeak} days from start.`,
        recommendation: winner === 'AI'
          ? `Prefer AI predictions for similar trends (${Math.floor(aiAccuracy)}% accurate)`
          : `Prefer rule-based predictions for similar trends (${Math.floor(ruleAccuracy)}% accurate)`,
      },
    });

    this.logger.log(`Experiment completed: ${winner} algorithm won with ${improvement.toFixed(1)}% improvement`);
  }

  /**
   * Get best performing algorithm based on historical experiments
   */
  async getBestAlgorithm(): Promise<{
    algorithm: 'AI' | 'RULE_BASED' | 'HYBRID';
    avgAccuracy: number;
    experimentCount: number;
    recommendation: string;
  }> {
    this.logger.log('Analyzing algorithm performance...');

    const completedExperiments = await this.prisma.algorithmExperiment.findMany({
      where: {
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      take: 50, // Last 50 experiments
    });

    if (completedExperiments.length === 0) {
      return {
        algorithm: 'HYBRID',
        avgAccuracy: 0,
        experimentCount: 0,
        recommendation: 'Not enough data - use hybrid approach (average of AI and rule-based)',
      };
    }

    let aiWins = 0;
    let ruleWins = 0;
    let totalAiAccuracy = 0;
    let totalRuleAccuracy = 0;

    for (const experiment of completedExperiments) {
      // controlPerformance = rule-based, variantPerformance = AI
      const ruleAccuracy = experiment.controlPerformance ? parseFloat(experiment.controlPerformance.toString()) : 0;
      const aiAccuracy = experiment.variantPerformance ? parseFloat(experiment.variantPerformance.toString()) : 0;

      totalAiAccuracy += aiAccuracy;
      totalRuleAccuracy += ruleAccuracy;

      if (aiAccuracy > ruleAccuracy) aiWins++;
      else ruleWins++;
    }

    const avgAiAccuracy = totalAiAccuracy / completedExperiments.length;
    const avgRuleAccuracy = totalRuleAccuracy / completedExperiments.length;

    let bestAlgorithm: 'AI' | 'RULE_BASED' | 'HYBRID';
    let avgAccuracy: number;
    let recommendation: string;

    if (Math.abs(avgAiAccuracy - avgRuleAccuracy) < 5) {
      bestAlgorithm = 'HYBRID';
      avgAccuracy = (avgAiAccuracy + avgRuleAccuracy) / 2;
      recommendation = `Both algorithms perform similarly (AI: ${avgAiAccuracy.toFixed(1)}%, Rule: ${avgRuleAccuracy.toFixed(1)}%). Use hybrid approach.`;
    } else if (avgAiAccuracy > avgRuleAccuracy) {
      bestAlgorithm = 'AI';
      avgAccuracy = avgAiAccuracy;
      recommendation = `AI algorithm performs better (${avgAiAccuracy.toFixed(1)}% vs ${avgRuleAccuracy.toFixed(1)}%). Prefer AI predictions.`;
    } else {
      bestAlgorithm = 'RULE_BASED';
      avgAccuracy = avgRuleAccuracy;
      recommendation = `Rule-based algorithm performs better (${avgRuleAccuracy.toFixed(1)}% vs ${avgAiAccuracy.toFixed(1)}%). Prefer rule-based predictions.`;
    }

    this.logger.log(`Best algorithm: ${bestAlgorithm} (${avgAccuracy.toFixed(1)}% accuracy over ${completedExperiments.length} experiments)`);

    return {
      algorithm: bestAlgorithm,
      avgAccuracy: parseFloat(avgAccuracy.toFixed(2)),
      experimentCount: completedExperiments.length,
      recommendation,
    };
  }

  /**
   * Predict all active trends
   */
  async predictAllActiveTrends(): Promise<TrendPrediction[]> {
    this.logger.log('Predicting peaks for all active trends...');

    const activeTrends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: { in: ['EMERGING', 'GROWING', 'PEAK'] },
        expiresAt: { gte: new Date() },
      },
      orderBy: { viralCoefficient: 'desc' },
      take: 50,
    });

    const predictions: TrendPrediction[] = [];

    for (const trend of activeTrends) {
      try {
        const prediction = await this.predictTrendPeak(trend.id);
        predictions.push(prediction);
      } catch (error) {
        this.logger.error(`Failed to predict trend ${trend.id}: ${error.message}`);
      }
    }

    this.logger.log(`Generated ${predictions.length} trend predictions`);
    return predictions;
  }

  /**
   * Get urgent opportunities (trends needing immediate action)
   */
  async getUrgentOpportunities(): Promise<TrendPrediction[]> {
    const predictions = await this.predictAllActiveTrends();

    return predictions.filter(
      p => p.opportunityWindow.urgency === 'CRITICAL' || p.opportunityWindow.urgency === 'HIGH',
    ).sort((a, b) => {
      // Sort by urgency then days remaining
      const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const urgencyDiff = urgencyOrder[a.opportunityWindow.urgency] - urgencyOrder[b.opportunityWindow.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.opportunityWindow.daysRemaining - b.opportunityWindow.daysRemaining;
    });
  }

  /**
   * Get trends by urgency level
   */
  async getTrendsByUrgency(urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<TrendPrediction[]> {
    const predictions = await this.predictAllActiveTrends();
    return predictions.filter(p => p.opportunityWindow.urgency === urgency);
  }

  /**
   * Early signal detection: Find trends 7-14 days before peak
   */
  async detectEarlySignals(): Promise<TrendPrediction[]> {
    const predictions = await this.predictAllActiveTrends();

    return predictions.filter(p => {
      const daysUntilPeak = p.daysUntilPeak;
      return daysUntilPeak >= 7 && daysUntilPeak <= 14 && p.confidence >= 60;
    }).sort((a, b) => b.confidence - a.confidence);
  }
}
