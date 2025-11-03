import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * ROI Predictor Service
 *
 * Predicts future campaign ROI based on historical performance using:
 * - Simple moving average
 * - Linear regression trend analysis
 * - Confidence intervals
 */

export interface ROIPrediction {
  campaignId: string;
  campaignName: string;
  currentROI: number;
  predictedROI7Days: number;
  predictedROI14Days: number;
  predictedROI30Days: number;
  confidence: 'high' | 'medium' | 'low';
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
}

export interface TrendAnalysis {
  slope: number; // Daily ROI change rate
  intercept: number;
  rSquared: number; // Correlation coefficient (0-1)
  volatility: number; // Standard deviation
}

@Injectable()
export class ROIPredictorService {
  private readonly logger = new Logger(ROIPredictorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Predict ROI for a specific campaign
   */
  async predictCampaignROI(campaignId: string): Promise<ROIPrediction> {
    this.logger.log(`Predicting ROI for campaign: ${campaignId}`);

    // Get campaign with historical metrics
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 30, // Last 30 data points
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.metrics.length < 3) {
      throw new Error('Insufficient data for prediction (need at least 3 data points)');
    }

    // Calculate historical ROI values
    const roiHistory = campaign.metrics
      .reverse() // Chronological order
      .map((m) => {
        const spent = parseFloat(m.spend.toString());
        const revenue = parseFloat(m.revenue?.toString() || '0');
        return spent > 0 ? ((revenue - spent) / spent) * 100 : 0;
      });

    // Analyze trend
    const trend = this.analyzeTrend(roiHistory);

    // Current ROI
    const currentROI = roiHistory[roiHistory.length - 1] || 0;

    // Predict future ROI using linear regression
    const predictedROI7Days = this.predictROI(trend, roiHistory.length, 7);
    const predictedROI14Days = this.predictROI(trend, roiHistory.length, 14);
    const predictedROI30Days = this.predictROI(trend, roiHistory.length, 30);

    // Determine confidence based on R-squared and volatility
    const confidence = this.determineConfidence(trend);

    // Determine trend direction
    const trendDirection = this.determineTrend(trend);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      currentROI,
      predictedROI30Days,
      trendDirection,
      confidence,
    );

    return {
      campaignId,
      campaignName: campaign.name,
      currentROI,
      predictedROI7Days,
      predictedROI14Days,
      predictedROI30Days,
      confidence,
      trend: trendDirection,
      recommendation,
    };
  }

  /**
   * Predict ROI for all active campaigns
   */
  async predictAllCampaigns(): Promise<ROIPrediction[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const predictions: ROIPrediction[] = [];

    for (const campaign of campaigns) {
      try {
        const prediction = await this.predictCampaignROI(campaign.id);
        predictions.push(prediction);
      } catch (error) {
        this.logger.warn(`Could not predict ROI for campaign ${campaign.id}: ${error.message}`);
      }
    }

    // Sort by predicted 30-day ROI (descending)
    return predictions.sort((a, b) => b.predictedROI30Days - a.predictedROI30Days);
  }

  /**
   * Analyze trend using linear regression
   */
  private analyzeTrend(values: number[]): TrendAnalysis {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i); // Time points: 0, 1, 2, ...

    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;

    // Calculate slope and intercept using least squares
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (values[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Calculate R-squared (coefficient of determination)
    let ssTotal = 0;
    let ssResidual = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      ssTotal += Math.pow(values[i] - meanY, 2);
      ssResidual += Math.pow(values[i] - predicted, 2);
    }

    const rSquared = ssTotal !== 0 ? 1 - ssResidual / ssTotal : 0;

    // Calculate volatility (standard deviation)
    const squaredDiffs = values.map((val) => Math.pow(val - meanY, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / n;
    const volatility = Math.sqrt(variance);

    return {
      slope,
      intercept,
      rSquared: Math.max(0, Math.min(1, rSquared)),
      volatility,
    };
  }

  /**
   * Predict ROI at a future time point
   */
  private predictROI(trend: TrendAnalysis, currentIndex: number, daysAhead: number): number {
    const futureIndex = currentIndex + daysAhead - 1;
    const predicted = trend.slope * futureIndex + trend.intercept;

    // Apply confidence adjustment based on R-squared
    // Lower R-squared = regress more towards current average
    const confidenceWeight = trend.rSquared;
    const avgROI = trend.intercept; // Y-intercept approximates average

    return predicted * confidenceWeight + avgROI * (1 - confidenceWeight);
  }

  /**
   * Determine prediction confidence
   */
  private determineConfidence(trend: TrendAnalysis): 'high' | 'medium' | 'low' {
    // High R-squared and low volatility = high confidence
    // Low R-squared or high volatility = low confidence

    if (trend.rSquared > 0.7 && trend.volatility < 20) {
      return 'high';
    } else if (trend.rSquared > 0.4 && trend.volatility < 40) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Determine trend direction
   */
  private determineTrend(trend: TrendAnalysis): 'improving' | 'stable' | 'declining' {
    // Slope represents daily ROI change percentage
    if (trend.slope > 0.5) {
      return 'improving';
    } else if (trend.slope < -0.5) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Generate recommendation based on prediction
   */
  private generateRecommendation(
    currentROI: number,
    predictedROI: number,
    trend: 'improving' | 'stable' | 'declining',
    confidence: 'high' | 'medium' | 'low',
  ): string {
    if (trend === 'improving' && predictedROI > 50) {
      return `Strong growth trajectory. Predicted ROI: ${predictedROI.toFixed(0)}%. Consider scaling budget.`;
    }

    if (trend === 'improving' && predictedROI > 0) {
      return `Improving performance (${predictedROI.toFixed(0)}% ROI predicted). Monitor and scale gradually.`;
    }

    if (trend === 'stable' && currentROI > 50) {
      return `Stable high performance (${predictedROI.toFixed(0)}% ROI). Maintain or scale conservatively.`;
    }

    if (trend === 'stable' && currentROI > 0) {
      return `Stable profitable performance. Predicted ROI: ${predictedROI.toFixed(0)}%.`;
    }

    // FIX: Use explicit 'declining' check instead of double-negative logic
    if (trend === 'declining' && predictedROI < 0) {
      return `Declining performance. Predicted negative ROI (${predictedROI.toFixed(0)}%). Consider pausing or pivoting.`;
    }

    if (trend === 'declining') {
      return `Performance declining. Predicted ROI: ${predictedROI.toFixed(0)}%. Investigate and optimize.`;
    }

    if (confidence === 'low') {
      return `High volatility or insufficient data. Prediction confidence is low. Continue monitoring.`;
    }

    // FIX: At this point, TypeScript has narrowed trend to 'stable' with non-positive ROI
    // Handle this remaining stable case explicitly
    return `Stable performance. Predicted 30-day ROI: ${predictedROI.toFixed(0)}%. Monitor closely.`;
  }

  /**
   * Get campaigns predicted to decline
   */
  async getCampaignsPredictedToDecline(): Promise<ROIPrediction[]> {
    const predictions = await this.predictAllCampaigns();

    // FIX: Changed 'trend' to 'p.trend' to reference the prediction object
    return predictions.filter(
      (p) => (p.trend !== 'improving' && p.trend !== 'stable') || (p.predictedROI30Days < 0 && p.confidence !== 'low'),
    );
  }

  /**
   * Get campaigns predicted to improve
   */
  async getCampaignsPredictedToImprove(): Promise<ROIPrediction[]> {
    const predictions = await this.predictAllCampaigns();

    return predictions.filter(
      (p) =>
        p.trend === 'improving' &&
        p.predictedROI30Days > p.currentROI * 1.2 &&
        p.confidence !== 'low',
    );
  }

  /**
   * Calculate portfolio predicted ROI
   */
  async getPortfolioPrediction(): Promise<{
    currentWeightedROI: number;
    predicted7DayROI: number;
    predicted14DayROI: number;
    predicted30DayROI: number;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    const predictions = await this.predictAllCampaigns();

    if (predictions.length === 0) {
      return {
        currentWeightedROI: 0,
        predicted7DayROI: 0,
        predicted14DayROI: 0,
        predicted30DayROI: 0,
        trend: 'stable',
      };
    }

    // Simple average (in production, weight by budget)
    const currentWeightedROI =
      predictions.reduce((sum, p) => sum + p.currentROI, 0) / predictions.length;
    const predicted7DayROI =
      predictions.reduce((sum, p) => sum + p.predictedROI7Days, 0) / predictions.length;
    const predicted14DayROI =
      predictions.reduce((sum, p) => sum + p.predictedROI14Days, 0) / predictions.length;
    const predicted30DayROI =
      predictions.reduce((sum, p) => sum + p.predictedROI30Days, 0) / predictions.length;

    // Determine overall trend
    let trend: 'improving' | 'stable' | 'declining';
    if (predicted30DayROI > currentWeightedROI * 1.1) {
      trend = 'improving';
    } else if (predicted30DayROI < currentWeightedROI * 0.9) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    return {
      currentWeightedROI,
      predicted7DayROI,
      predicted14DayROI,
      predicted30DayROI,
      trend,
    };
  }
}
