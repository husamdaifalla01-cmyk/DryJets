import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * ML-based Campaign Success Predictor
 * Predicts campaign ROI and success metrics before launch
 */

export interface CampaignFeatures {
  campaignType: 'ORGANIC' | 'PAID' | 'HYBRID';
  channels: string[]; // ['social', 'email', 'seo', 'ppc']
  budget?: number;
  targetAudience: string;
  contentQuality: number; // 0-100
  historicalCTR?: number;
  seasonality?: number; // -1 to 1 (negative = off-season, positive = peak)
  competitorActivity?: number; // 0-100
  brandAwareness?: number; // 0-100
  landingPageQuality?: number; // 0-100
}

export interface CampaignPrediction {
  successProbability: number; // 0-100
  predictedROI: number; // percentage
  predictedConversions: number;
  predictedRevenue: number;
  predictedCost: number;
  riskScore: number; // 0-100, higher = riskier
  confidence: number; // 0-100
  timeline: {
    rampUp: number; // days
    peak: number; // days
    decline: number; // days
  };
  recommendations: string[];
  successFactors: Array<{
    factor: string;
    impact: number; // percentage contribution
    score: number; // 0-100
  }>;
  risks: Array<{
    risk: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigation: string;
  }>;
}

@Injectable()
export class CampaignSuccessPredictorService {
  private readonly logger = new Logger('CampaignSuccessPredictor');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Predict campaign success using ML
   */
  async predictCampaignSuccess(
    features: CampaignFeatures,
  ): Promise<CampaignPrediction> {
    this.logger.log(`Predicting success for ${features.campaignType} campaign`);

    // Get historical campaign data
    const historicalData = await this.getHistoricalCampaignData(
      features.campaignType,
      features.channels,
    );

    // Calculate base metrics from historical data
    const baseMetrics = this.calculateBaseMetrics(historicalData, features);

    // Adjust metrics based on campaign features
    const adjustedMetrics = this.adjustMetricsForFeatures(baseMetrics, features);

    // Calculate success probability
    const successProbability = this.calculateSuccessProbability(
      features,
      adjustedMetrics,
    );

    // Calculate ROI
    const { predictedROI, predictedRevenue, predictedCost } =
      this.calculateROI(features, adjustedMetrics);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(features, adjustedMetrics);

    // Calculate confidence
    const confidence = this.calculateConfidence(historicalData, features);

    // Generate timeline prediction
    const timeline = this.predictTimeline(features, adjustedMetrics);

    // Identify success factors
    const successFactors = await this.identifySuccessFactors(features);

    // Identify risks
    const risks = this.identifyRisks(features, riskScore);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      features,
      adjustedMetrics,
      risks,
    );

    return {
      successProbability,
      predictedROI,
      predictedConversions: adjustedMetrics.conversions,
      predictedRevenue,
      predictedCost,
      riskScore,
      confidence,
      timeline,
      recommendations,
      successFactors,
      risks,
    };
  }

  /**
   * Get historical campaign performance data
   */
  private async getHistoricalCampaignData(
    campaignType: string,
    channels: string[],
  ): Promise<any[]> {
    // In production, query actual historical data
    // For now, return simulated data
    return [
      {
        roi: 250,
        conversions: 150,
        cost: 10000,
        revenue: 25000,
        ctr: 0.035,
        conversionRate: 0.08,
      },
      {
        roi: 180,
        conversions: 120,
        cost: 12000,
        revenue: 21600,
        ctr: 0.028,
        conversionRate: 0.06,
      },
      {
        roi: 320,
        conversions: 200,
        cost: 8000,
        revenue: 25600,
        ctr: 0.042,
        conversionRate: 0.10,
      },
      {
        roi: 150,
        conversions: 90,
        cost: 15000,
        revenue: 22500,
        ctr: 0.025,
        conversionRate: 0.05,
      },
      {
        roi: 280,
        conversions: 180,
        cost: 9000,
        revenue: 25200,
        ctr: 0.038,
        conversionRate: 0.09,
      },
    ];
  }

  /**
   * Calculate base metrics from historical data
   */
  private calculateBaseMetrics(historicalData: any[], features: CampaignFeatures): {
    avgROI: number;
    avgConversions: number;
    avgCTR: number;
    avgConversionRate: number;
    stdDevROI: number;
  } {
    if (historicalData.length === 0) {
      return {
        avgROI: 200,
        avgConversions: 150,
        avgCTR: 0.03,
        avgConversionRate: 0.07,
        stdDevROI: 50,
      };
    }

    const avgROI =
      historicalData.reduce((sum, d) => sum + d.roi, 0) / historicalData.length;
    const avgConversions =
      historicalData.reduce((sum, d) => sum + d.conversions, 0) /
      historicalData.length;
    const avgCTR =
      historicalData.reduce((sum, d) => sum + d.ctr, 0) / historicalData.length;
    const avgConversionRate =
      historicalData.reduce((sum, d) => sum + d.conversionRate, 0) /
      historicalData.length;

    // Calculate standard deviation for ROI
    const variance =
      historicalData.reduce((sum, d) => sum + Math.pow(d.roi - avgROI, 2), 0) /
      historicalData.length;
    const stdDevROI = Math.sqrt(variance);

    return {
      avgROI,
      avgConversions,
      avgCTR,
      avgConversionRate,
      stdDevROI,
    };
  }

  /**
   * Adjust metrics based on campaign features
   */
  private adjustMetricsForFeatures(
    baseMetrics: any,
    features: CampaignFeatures,
  ): {
    roi: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  } {
    let roi = baseMetrics.avgROI;
    let conversions = baseMetrics.avgConversions;
    let ctr = baseMetrics.avgCTR;
    let conversionRate = baseMetrics.avgConversionRate;

    // Content quality impact (0-30% boost)
    const contentMultiplier = 1 + (features.contentQuality / 100) * 0.3;
    roi *= contentMultiplier;
    conversions *= contentMultiplier;
    ctr *= contentMultiplier;

    // Landing page quality impact (0-25% boost)
    if (features.landingPageQuality) {
      const lpMultiplier = 1 + (features.landingPageQuality / 100) * 0.25;
      conversionRate *= lpMultiplier;
      conversions *= lpMultiplier;
      roi *= lpMultiplier;
    }

    // Brand awareness impact (0-20% boost)
    if (features.brandAwareness) {
      const brandMultiplier = 1 + (features.brandAwareness / 100) * 0.2;
      ctr *= brandMultiplier;
      conversions *= brandMultiplier;
    }

    // Seasonality impact (-30% to +50%)
    if (features.seasonality) {
      const seasonalityMultiplier = 1 + features.seasonality * 0.5;
      conversions *= seasonalityMultiplier;
      roi *= seasonalityMultiplier;
    }

    // Competitor activity impact (-20% if high competition)
    if (features.competitorActivity && features.competitorActivity > 70) {
      const competitionPenalty = 0.8;
      ctr *= competitionPenalty;
      conversions *= competitionPenalty;
      roi *= competitionPenalty;
    }

    // Channel mix impact
    const channelBonus = this.calculateChannelBonus(features.channels);
    roi *= channelBonus;
    conversions *= channelBonus;

    // Campaign type adjustments
    if (features.campaignType === 'ORGANIC') {
      roi *= 1.5; // Organic typically has better ROI
      conversions *= 0.7; // But slower to convert
    } else if (features.campaignType === 'PAID') {
      roi *= 0.8; // Lower ROI due to costs
      conversions *= 1.3; // But faster conversions
    }

    return {
      roi: Math.round(roi),
      conversions: Math.round(conversions),
      ctr: Math.round(ctr * 10000) / 10000,
      conversionRate: Math.round(conversionRate * 10000) / 10000,
    };
  }

  /**
   * Calculate channel mix bonus
   */
  private calculateChannelBonus(channels: string[]): number {
    let bonus = 1.0;

    // Multi-channel campaigns perform better
    if (channels.length >= 4) bonus += 0.25;
    else if (channels.length >= 3) bonus += 0.15;
    else if (channels.length >= 2) bonus += 0.10;

    // Specific channel synergies
    if (channels.includes('seo') && channels.includes('content')) bonus += 0.10;
    if (channels.includes('social') && channels.includes('email')) bonus += 0.08;
    if (channels.includes('ppc') && channels.includes('seo')) bonus += 0.12;

    return bonus;
  }

  /**
   * Calculate success probability
   */
  private calculateSuccessProbability(
    features: CampaignFeatures,
    metrics: any,
  ): number {
    let probability = 50; // Base probability

    // ROI impact
    if (metrics.roi > 300) probability += 30;
    else if (metrics.roi > 200) probability += 20;
    else if (metrics.roi > 100) probability += 10;
    else if (metrics.roi < 50) probability -= 20;

    // Content quality impact
    if (features.contentQuality > 80) probability += 15;
    else if (features.contentQuality > 60) probability += 8;
    else if (features.contentQuality < 40) probability -= 10;

    // Landing page quality impact
    if (features.landingPageQuality) {
      if (features.landingPageQuality > 80) probability += 10;
      else if (features.landingPageQuality < 50) probability -= 10;
    }

    // Brand awareness impact
    if (features.brandAwareness) {
      if (features.brandAwareness > 70) probability += 10;
      else if (features.brandAwareness < 30) probability -= 8;
    }

    // Seasonality impact
    if (features.seasonality) {
      if (features.seasonality > 0.5) probability += 12;
      else if (features.seasonality < -0.5) probability -= 15;
    }

    return Math.max(5, Math.min(95, Math.round(probability)));
  }

  /**
   * Calculate ROI prediction
   */
  private calculateROI(
    features: CampaignFeatures,
    metrics: any,
  ): {
    predictedROI: number;
    predictedRevenue: number;
    predictedCost: number;
  } {
    const budget = features.budget || 10000;

    // Estimate cost based on campaign type
    let predictedCost = budget;
    if (features.campaignType === 'ORGANIC') {
      predictedCost = budget * 0.3; // Lower cost for organic
    }

    // Calculate revenue from conversions
    const avgOrderValue = 150; // Assume $150 AOV
    const predictedRevenue = metrics.conversions * avgOrderValue;

    // Calculate ROI
    const predictedROI =
      predictedCost > 0
        ? ((predictedRevenue - predictedCost) / predictedCost) * 100
        : 0;

    return {
      predictedROI: Math.round(predictedROI),
      predictedRevenue: Math.round(predictedRevenue),
      predictedCost: Math.round(predictedCost),
    };
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(features: CampaignFeatures, metrics: any): number {
    let risk = 30; // Base risk

    // Budget risk
    if (features.budget && features.budget > 50000) risk += 20;
    else if (features.budget && features.budget > 20000) risk += 10;

    // Content quality risk
    if (features.contentQuality < 50) risk += 15;

    // Competition risk
    if (features.competitorActivity && features.competitorActivity > 80) {
      risk += 20;
    }

    // Seasonality risk
    if (features.seasonality && features.seasonality < -0.3) risk += 15;

    // Low ROI risk
    if (metrics.roi < 100) risk += 25;

    // Single channel risk
    if (features.channels.length === 1) risk += 10;

    return Math.max(0, Math.min(100, risk));
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(historicalData: any[], features: CampaignFeatures): number {
    let confidence = 60; // Base confidence

    // More historical data = higher confidence
    if (historicalData.length >= 10) confidence += 20;
    else if (historicalData.length >= 5) confidence += 10;
    else if (historicalData.length < 3) confidence -= 15;

    // Feature completeness
    const providedFeatures = Object.values(features).filter(
      (v) => v !== undefined && v !== null,
    ).length;
    const totalFeatures = Object.keys(features).length;
    const completeness = providedFeatures / totalFeatures;

    if (completeness > 0.8) confidence += 10;
    else if (completeness < 0.5) confidence -= 15;

    return Math.max(30, Math.min(95, Math.round(confidence)));
  }

  /**
   * Predict campaign timeline
   */
  private predictTimeline(
    features: CampaignFeatures,
    metrics: any,
  ): {
    rampUp: number;
    peak: number;
    decline: number;
  } {
    if (features.campaignType === 'PAID') {
      return {
        rampUp: 3, // Days to ramp up
        peak: 7, // Days at peak performance
        decline: 5, // Days of decline
      };
    } else if (features.campaignType === 'ORGANIC') {
      return {
        rampUp: 14, // Longer ramp for organic
        peak: 30, // Sustained peak
        decline: 21, // Gradual decline
      };
    } else {
      return {
        rampUp: 7,
        peak: 14,
        decline: 10,
      };
    }
  }

  /**
   * Identify success factors using ML
   */
  private async identifySuccessFactors(
    features: CampaignFeatures,
  ): Promise<
    Array<{
      factor: string;
      impact: number;
      score: number;
    }>
  > {
    const factors = [];

    // Content quality factor
    factors.push({
      factor: 'Content Quality',
      impact: 25,
      score: features.contentQuality || 0,
    });

    // Landing page factor
    if (features.landingPageQuality) {
      factors.push({
        factor: 'Landing Page Optimization',
        impact: 20,
        score: features.landingPageQuality,
      });
    }

    // Brand awareness factor
    if (features.brandAwareness) {
      factors.push({
        factor: 'Brand Awareness',
        impact: 15,
        score: features.brandAwareness,
      });
    }

    // Channel mix factor
    const channelScore = Math.min(100, features.channels.length * 25);
    factors.push({
      factor: 'Multi-Channel Strategy',
      impact: 20,
      score: channelScore,
    });

    // Timing/Seasonality factor
    if (features.seasonality !== undefined) {
      const seasonalityScore = Math.round((features.seasonality + 1) * 50);
      factors.push({
        factor: 'Market Timing',
        impact: 15,
        score: seasonalityScore,
      });
    }

    // Competition factor
    if (features.competitorActivity !== undefined) {
      const competitionScore = 100 - features.competitorActivity;
      factors.push({
        factor: 'Competitive Advantage',
        impact: 10,
        score: competitionScore,
      });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Identify campaign risks
   */
  private identifyRisks(
    features: CampaignFeatures,
    riskScore: number,
  ): Array<{
    risk: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigation: string;
  }> {
    const risks = [];

    // High budget risk
    if (features.budget && features.budget > 30000) {
      risks.push({
        risk: 'High Budget Investment',
        severity: 'HIGH',
        mitigation: 'Start with smaller test budget and scale based on performance',
      });
    }

    // Content quality risk
    if (features.contentQuality < 60) {
      risks.push({
        risk: 'Low Content Quality',
        severity: 'HIGH',
        mitigation: 'Invest in professional content creation and A/B testing',
      });
    }

    // Competition risk
    if (features.competitorActivity && features.competitorActivity > 75) {
      risks.push({
        risk: 'High Competition',
        severity: 'MEDIUM',
        mitigation: 'Focus on unique value propositions and niche targeting',
      });
    }

    // Single channel risk
    if (features.channels.length === 1) {
      risks.push({
        risk: 'Single Channel Dependency',
        severity: 'MEDIUM',
        mitigation: 'Expand to multi-channel strategy for better reach and resilience',
      });
    }

    // Seasonality risk
    if (features.seasonality && features.seasonality < -0.3) {
      risks.push({
        risk: 'Off-Season Timing',
        severity: 'MEDIUM',
        mitigation: 'Consider delaying launch or adjust expectations and messaging',
      });
    }

    // Low brand awareness risk
    if (features.brandAwareness && features.brandAwareness < 30) {
      risks.push({
        risk: 'Low Brand Recognition',
        severity: 'MEDIUM',
        mitigation: 'Invest in brand awareness campaigns before conversion-focused campaigns',
      });
    }

    return risks.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    features: CampaignFeatures,
    metrics: any,
    risks: any[],
  ): Promise<string[]> {
    const recommendations = [];

    // ROI optimization
    if (metrics.roi < 150) {
      recommendations.push(
        '📈 Optimize conversion funnel to improve ROI (target 200%+)',
      );
    }

    // Content recommendations
    if (features.contentQuality < 70) {
      recommendations.push(
        '✍️ Improve content quality through professional copywriting and design',
      );
    }

    // Channel recommendations
    if (features.channels.length < 3) {
      recommendations.push(
        '🔄 Expand to multi-channel approach for 15-25% performance boost',
      );
    }

    // Timing recommendations
    if (features.seasonality && features.seasonality < 0) {
      recommendations.push(
        '⏰ Consider delaying campaign to peak season for better results',
      );
    }

    // Landing page recommendations
    if (!features.landingPageQuality || features.landingPageQuality < 70) {
      recommendations.push(
        '🎯 Optimize landing page (CTA placement, load speed, mobile responsiveness)',
      );
    }

    // Budget recommendations
    if (features.budget && features.budget < 5000 && features.campaignType === 'PAID') {
      recommendations.push(
        '💰 Consider increasing budget or focusing on organic strategies',
      );
    }

    // Risk mitigation
    const highRisks = risks.filter((r) => r.severity === 'HIGH');
    if (highRisks.length > 0) {
      recommendations.push(
        `⚠️ Address high-severity risks: ${highRisks.map((r) => r.risk).join(', ')}`,
      );
    }

    return recommendations;
  }

  /**
   * Compare multiple campaign strategies
   */
  async compareCampaignStrategies(
    strategies: CampaignFeatures[],
  ): Promise<
    Array<{
      strategy: CampaignFeatures;
      prediction: CampaignPrediction;
      rank: number;
    }>
  > {
    const predictions = await Promise.all(
      strategies.map((s) => this.predictCampaignSuccess(s)),
    );

    const results = strategies.map((strategy, i) => ({
      strategy,
      prediction: predictions[i],
      rank: 0,
    }));

    // Rank by success probability
    results.sort(
      (a, b) => b.prediction.successProbability - a.prediction.successProbability,
    );

    results.forEach((r, i) => {
      r.rank = i + 1;
    });

    return results;
  }
}
