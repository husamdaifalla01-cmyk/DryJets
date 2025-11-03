import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Traffic Quality Service
 *
 * Scores traffic sources on a 0-100 scale based on:
 * - Conversion rate (40%)
 * - Time on page (20%)
 * - Bounce rate (20%)
 * - Device fingerprint diversity (10%)
 * - IP reputation (10%)
 */

export interface TrafficQualityMetrics {
  connectionId: string;
  network: string;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: number;
  deviceDiversity: number;
  ipReputation: number;
}

export interface QualityScoreResult {
  connectionId: string;
  network: string;
  qualityScore: number; // 0-100
  conversionRateScore: number; // 0-100
  bounceRateScore: number; // 0-100
  timeOnPageScore: number; // 0-100
  fraudScore: number; // 0-100 (higher = more fraud)
  recommendation: string;
  isBlacklisted: boolean;
}

@Injectable()
export class TrafficQualityService {
  private readonly logger = new Logger(TrafficQualityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate traffic quality score
   */
  async calculateQualityScore(connectionId: string): Promise<QualityScoreResult> {
    this.logger.log(`Calculating quality score for connection: ${connectionId}`);

    // Get connection
    const connection = await this.prisma.trafficConnection.findUnique({
      where: { id: connectionId },
      include: {
        campaigns: {
          include: {
            metrics: {
              orderBy: { timestamp: 'desc' },
              take: 10, // Last 10 metric snapshots
            },
          },
        },
      },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Aggregate metrics from all campaigns
    const aggregatedMetrics = this.aggregateCampaignMetrics(connection.campaigns);

    // Calculate individual scores
    const conversionRateScore = this.scoreConversionRate(aggregatedMetrics.conversionRate);
    const bounceRateScore = this.scoreBounceRate(aggregatedMetrics.bounceRate);
    const timeOnPageScore = this.scoreTimeOnPage(aggregatedMetrics.avgTimeOnPage);
    const fraudScore = this.calculateFraudScore(aggregatedMetrics);

    // Calculate weighted total quality score
    const qualityScore = Math.round(
      conversionRateScore * 0.4 +
        bounceRateScore * 0.2 +
        timeOnPageScore * 0.2 +
        (100 - fraudScore) * 0.1 + // Invert fraud score for quality
        80 * 0.1, // IP reputation (placeholder - would come from external service)
    );

    // Determine if should be blacklisted
    const isBlacklisted = qualityScore < 40 || fraudScore > 70;

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      qualityScore,
      fraudScore,
      isBlacklisted,
    );

    const result: QualityScoreResult = {
      connectionId,
      network: connection.network,
      qualityScore,
      conversionRateScore,
      bounceRateScore,
      timeOnPageScore,
      fraudScore,
      recommendation,
      isBlacklisted,
    };

    // Save quality score to database
    await this.saveQualityScore(connectionId, result, aggregatedMetrics);

    this.logger.log(
      `Quality score for ${connection.network}: ${qualityScore}/100 (Fraud: ${fraudScore}/100)`,
    );

    return result;
  }

  /**
   * Aggregate metrics from all campaigns
   */
  private aggregateCampaignMetrics(campaigns: any[]): TrafficQualityMetrics & {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
  } {
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalTimeOnPage = 0;
    let metricsCount = 0;

    for (const campaign of campaigns) {
      for (const metric of campaign.metrics) {
        totalImpressions += metric.impressions;
        totalClicks += metric.clicks;
        totalConversions += metric.conversions;
        metricsCount++;
      }
    }

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const bounceRate = this.estimateBounceRate(totalClicks, totalConversions);
    const avgTimeOnPage = totalTimeOnPage / Math.max(1, metricsCount) || 120; // Default 120s

    return {
      connectionId: '', // Filled by caller
      network: '', // Filled by caller
      conversionRate,
      bounceRate,
      avgTimeOnPage,
      deviceDiversity: 75, // Placeholder - would track actual device fingerprints
      ipReputation: 80, // Placeholder - would use IP reputation service
      totalImpressions,
      totalClicks,
      totalConversions,
    };
  }

  /**
   * Estimate bounce rate (simplified - would track actual bounces in production)
   */
  private estimateBounceRate(clicks: number, conversions: number): number {
    if (clicks === 0) return 100;

    // Assume non-converters have ~70% bounce rate
    const converters = conversions;
    const nonConverters = clicks - conversions;

    const bouncedVisitors = nonConverters * 0.7;
    const bounceRate = (bouncedVisitors / clicks) * 100;

    return Math.min(100, bounceRate);
  }

  /**
   * Score conversion rate (0-100)
   */
  private scoreConversionRate(conversionRate: number): number {
    // Conversion rate scoring:
    // 0% = 0 points
    // 1% = 50 points
    // 2% = 75 points
    // 5%+ = 100 points

    if (conversionRate >= 5) return 100;
    if (conversionRate >= 2) return 75;
    if (conversionRate >= 1) return 50 + (conversionRate - 1) * 25;
    if (conversionRate >= 0.5) return 25 + (conversionRate - 0.5) * 50;
    return conversionRate * 50;
  }

  /**
   * Score bounce rate (0-100, lower is better)
   */
  private scoreBounceRate(bounceRate: number): number {
    // Bounce rate scoring (inverted - lower is better):
    // 0-30% = 100 points
    // 30-50% = 75 points
    // 50-70% = 50 points
    // 70-90% = 25 points
    // 90%+ = 0 points

    if (bounceRate <= 30) return 100;
    if (bounceRate <= 50) return 100 - ((bounceRate - 30) / 20) * 25;
    if (bounceRate <= 70) return 75 - ((bounceRate - 50) / 20) * 25;
    if (bounceRate <= 90) return 50 - ((bounceRate - 70) / 20) * 25;
    return Math.max(0, 25 - ((bounceRate - 90) / 10) * 25);
  }

  /**
   * Score time on page (0-100)
   */
  private scoreTimeOnPage(seconds: number): number {
    // Time on page scoring:
    // 0-10s = 0 points (bots)
    // 10-30s = 25 points
    // 30-60s = 50 points
    // 60-120s = 75 points
    // 120s+ = 100 points

    if (seconds >= 120) return 100;
    if (seconds >= 60) return 75 + ((seconds - 60) / 60) * 25;
    if (seconds >= 30) return 50 + ((seconds - 30) / 30) * 25;
    if (seconds >= 10) return 25 + ((seconds - 10) / 20) * 25;
    return (seconds / 10) * 25;
  }

  /**
   * Calculate fraud score (0-100, higher = more fraud)
   */
  private calculateFraudScore(metrics: any): number {
    let fraudScore = 0;

    // Very high CTR but no conversions (click fraud)
    const ctr = metrics.totalClicks / Math.max(1, metrics.totalImpressions);
    if (ctr > 0.05 && metrics.totalConversions === 0 && metrics.totalClicks > 100) {
      fraudScore += 30;
    }

    // Very low time on page (bots)
    if (metrics.avgTimeOnPage < 10) {
      fraudScore += 40;
    }

    // Very high bounce rate + no conversions
    if (metrics.bounceRate > 90 && metrics.totalConversions === 0) {
      fraudScore += 20;
    }

    // Suspicious conversion rate (too perfect)
    if (metrics.conversionRate > 10) {
      fraudScore += 10;
    }

    return Math.min(100, fraudScore);
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    qualityScore: number,
    fraudScore: number,
    isBlacklisted: boolean,
  ): string {
    if (isBlacklisted) {
      return 'BLACKLIST this traffic source immediately. High fraud risk or very low quality.';
    }

    if (qualityScore >= 80) {
      return 'Excellent traffic quality. Scale budget on this source.';
    }

    if (qualityScore >= 60) {
      return 'Good traffic quality. Maintain current budget.';
    }

    if (qualityScore >= 40) {
      return 'Moderate traffic quality. Monitor closely and consider reducing budget.';
    }

    if (fraudScore > 50) {
      return 'High fraud risk detected. Pause campaigns and investigate.';
    }

    return 'Poor traffic quality. Consider pausing this source.';
  }

  /**
   * Save quality score to database
   */
  private async saveQualityScore(
    connectionId: string,
    result: QualityScoreResult,
    metrics: any,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.trafficQualityScore.upsert({
      where: {
        connectionId_date: {
          connectionId,
          date: today,
        },
      },
      update: {
        qualityScore: result.qualityScore,
        conversionRate: new Decimal(metrics.conversionRate.toFixed(2)),
        bounceRate: new Decimal(metrics.bounceRate.toFixed(2)),
        avgTimeOnPage: metrics.avgTimeOnPage,
        fraudScore: result.fraudScore,
        isBlacklisted: result.isBlacklisted,
      },
      create: {
        connectionId,
        date: today,
        qualityScore: result.qualityScore,
        conversionRate: new Decimal(metrics.conversionRate.toFixed(2)),
        bounceRate: new Decimal(metrics.bounceRate.toFixed(2)),
        avgTimeOnPage: metrics.avgTimeOnPage,
        fraudScore: result.fraudScore,
        isBlacklisted: result.isBlacklisted,
      },
    });
  }

  /**
   * Get quality score history
   */
  async getQualityHistory(connectionId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.trafficQualityScore.findMany({
      where: {
        connectionId,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get all blacklisted connections
   */
  async getBlacklistedConnections(): Promise<any[]> {
    return this.prisma.trafficQualityScore.findMany({
      where: { isBlacklisted: true },
      include: { connection: true },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Manually blacklist a connection
   */
  async blacklistConnection(connectionId: string, reason: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.trafficQualityScore.upsert({
      where: {
        connectionId_date: {
          connectionId,
          date: today,
        },
      },
      update: {
        isBlacklisted: true,
      },
      create: {
        connectionId,
        date: today,
        qualityScore: 0,
        conversionRate: new Decimal(0),
        bounceRate: new Decimal(100),
        avgTimeOnPage: 0,
        fraudScore: 100,
        isBlacklisted: true,
      },
    });

    this.logger.log(`Blacklisted connection ${connectionId}: ${reason}`);
  }

  /**
   * Remove from blacklist
   */
  async removeFromBlacklist(connectionId: string): Promise<void> {
    await this.prisma.trafficQualityScore.updateMany({
      where: { connectionId },
      data: { isBlacklisted: false },
    });

    this.logger.log(`Removed connection ${connectionId} from blacklist`);
  }
}
