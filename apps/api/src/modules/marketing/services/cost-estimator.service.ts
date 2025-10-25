import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class CostEstimator {
  private readonly logger = new Logger('CostEstimator');

  // API costs per request (USD)
  private readonly apiCosts = {
    anthropic: 0.001, // $0.001 per API call for content generation
    twitter: 0.0001,
    linkedin: 0.00015,
    facebook: 0.0001,
    instagram: 0.00012,
    tiktok: 0.00008,
    youtube: 0.00005,
    reddit: 0.00003,
    threads: 0.0001,
  };

  // Advertising costs (CPM - cost per thousand impressions, in USD)
  private readonly platformCPM = {
    twitter: 5.0,
    linkedin: 8.5,
    facebook: 6.0,
    instagram: 7.0,
    tiktok: 9.0,
    youtube: 6.5,
    reddit: 4.5,
    threads: 5.5,
  };

  // Estimated impressions per organic post
  private readonly organicReach = {
    twitter: 500,
    linkedin: 1500,
    facebook: 2000,
    instagram: 3000,
    tiktok: 5000,
    youtube: 2500,
    reddit: 1000,
    threads: 800,
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Estimate costs for a multi-platform campaign
   */
  async estimateCampaignCosts(input: {
    platforms: string[];
    contentPieces: number;
    estimatedReach: number;
    paidBoost: boolean;
    dailyBudget?: number;
  }): Promise<{
    breakdown: Record<string, any>;
    total: number;
    roi: number;
    recommendations: string[];
  }> {
    this.logger.log('Estimating campaign costs');

    const breakdown: Record<string, any> = {};
    let totalCost = 0;

    for (const platform of input.platforms) {
      const platformCost = this.calculatePlatformCost({
        platform,
        contentPieces: input.contentPieces,
        reach: input.estimatedReach,
        paidBoost: input.paidBoost,
        dailyBudget: input.dailyBudget,
      });

      breakdown[platform] = platformCost;
      totalCost += platformCost.total;
    }

    const roi = this.calculateEstimatedROI(totalCost, input.estimatedReach);
    const recommendations = this.generateCostOptimizationRecommendations(
      breakdown,
      totalCost,
    );

    return { breakdown, total: totalCost, roi, recommendations };
  }

  /**
   * Calculate cost for a single platform
   */
  private calculatePlatformCost(input: {
    platform: string;
    contentPieces: number;
    reach: number;
    paidBoost: boolean;
    dailyBudget?: number;
  }): {
    apiCost: number;
    organicReach: number;
    paidReach: number;
    paidCost: number;
    total: number;
  } {
    const apiCost = this.apiCosts[input.platform] * input.contentPieces;
    const organicReach = this.organicReach[input.platform] * input.contentPieces;
    let paidReach = 0;
    let paidCost = 0;

    if (input.paidBoost && input.dailyBudget) {
      paidCost = input.dailyBudget * 7; // Weekly campaign
      const cpm = this.platformCPM[input.platform];
      paidReach = (paidCost / cpm) * 1000; // Convert to impressions
    }

    const total = apiCost + paidCost;

    return {
      apiCost,
      organicReach,
      paidReach,
      paidCost,
      total,
    };
  }

  /**
   * Calculate estimated ROI
   */
  private calculateEstimatedROI(spend: number, reach: number): number {
    // Assumptions:
    // - Average conversion rate: 2%
    // - Average order value: $50
    const estimatedConversions = reach * 0.02;
    const revenue = estimatedConversions * 50;
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

    return Math.round(roi);
  }

  /**
   * Generate cost optimization recommendations
   */
  private generateCostOptimizationRecommendations(
    breakdown: Record<string, any>,
    totalCost: number,
  ): string[] {
    const recommendations: string[] = [];

    // Find most expensive platforms
    const sortedPlatforms = Object.entries(breakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);

    if (sortedPlatforms.length > 0) {
      const topPlatform = sortedPlatforms[0];
      const percentage = ((topPlatform[1].total / totalCost) * 100).toFixed(1);
      recommendations.push(
        `${topPlatform[0]} accounts for ${percentage}% of costs. Consider adjusting allocation.`,
      );
    }

    // Check for low-cost high-ROI platforms
    const efficientPlatforms = Object.entries(breakdown)
      .filter((entry) => entry[1].total < totalCost * 0.15)
      .map((entry) => entry[0]);

    if (efficientPlatforms.length > 0) {
      recommendations.push(
        `Consider increasing budget for ${efficientPlatforms.join(', ')} - high ROI per dollar.`,
      );
    }

    // General recommendations
    recommendations.push(
      'Monitor metrics daily and adjust allocation based on performance.',
    );
    recommendations.push(
      'Test different content formats on each platform to optimize engagement.',
    );

    return recommendations;
  }

  /**
   * Log API usage cost
   */
  async logAPICost(input: {
    workflowId: string;
    service: string;
    operation: string;
    tokensUsed?: number;
    requestsUsed?: number;
  }): Promise<void> {
    const serviceCost = this.apiCosts[input.service] || 0.001;
    const cost = (input.requestsUsed || 1) * serviceCost;

    await this.prisma.publishingAPILog.create({
      data: {
        workflowId: input.workflowId,
        service: input.service,
        operation: input.operation,
        tokensUsed: input.tokensUsed,
        requestsUsed: input.requestsUsed || 1,
        cost: cost,
      },
    });

    this.logger.log(
      `Logged API cost: ${input.service} - ${input.operation} - $${cost.toFixed(4)}`,
    );
  }

  /**
   * Calculate costs for publishing content
   */
  async calculatePublishingCosts(input: {
    contentId: string;
    platform: string;
    paidBoost: boolean;
    boostBudget?: number;
  }): Promise<{
    generationCost: number;
    publishingCost: number;
    totalCost: number;
    estimatedReach: number;
  }> {
    const generationCost = this.apiCosts.anthropic;
    const publishingCost = this.apiCosts[input.platform] || 0.0001;
    let boostCost = 0;
    let estimatedReach = this.organicReach[input.platform] || 1000;

    if (input.paidBoost && input.boostBudget) {
      boostCost = input.boostBudget;
      const cpm = this.platformCPM[input.platform] || 5;
      estimatedReach += (boostCost / cpm) * 1000;
    }

    const totalCost = generationCost + publishingCost + boostCost;

    // Update content piece with cost information
    await this.prisma.publishedContent.update({
      where: { id: input.contentId },
      data: {
        generationCost,
        publishingCost,
        totalCost,
      },
    });

    return {
      generationCost,
      publishingCost,
      totalCost,
      estimatedReach,
    };
  }

  /**
   * Get cost breakdown for workflow
   */
  async getWorkflowCostBreakdown(workflowId: string): Promise<{
    generationCost: number;
    publishingCost: number;
    paidBoostCost: number;
    totalCost: number;
    costPerContent: number;
    costPerImpression: number;
    contentCount: number;
    estimatedTotalReach: number;
  }> {
    const costLogs = await this.prisma.publishingAPILog.findMany({
      where: { workflowId },
    });

    const content = await this.prisma.publishedContent.findMany({
      where: { workflowId },
      include: { platform: true },
    });

    const generationCost = costLogs
      .filter((log) => log.service === 'anthropic')
      .reduce((sum, log) => sum + Number(log.cost), 0);

    const publishingCost = costLogs
      .filter((log) => log.service !== 'anthropic')
      .reduce((sum, log) => sum + Number(log.cost), 0);

    const paidBoostCost = content.reduce(
      (sum, piece) => sum + Number(piece.publishingCost || 0),
      0,
    );

    const totalCost = generationCost + publishingCost + paidBoostCost;
    const estimatedTotalReach = content.reduce((sum, piece) => {
      const platform = piece.platform?.slug || 'twitter';
      return sum + (this.organicReach[platform] || 1000);
    }, 0);

    return {
      generationCost: Math.round(generationCost * 100) / 100,
      publishingCost: Math.round(publishingCost * 100) / 100,
      paidBoostCost: Math.round(paidBoostCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      costPerContent: Math.round((totalCost / (content.length || 1)) * 100) / 100,
      costPerImpression:
        Math.round(
          ((totalCost / estimatedTotalReach) * 1000) * 100
        ) / 100,
      contentCount: content.length,
      estimatedTotalReach,
    };
  }

  /**
   * Project campaign performance and ROI
   */
  projectCampaignROI(input: {
    totalCost: number;
    estimatedReach: number;
    conversionRate: number; // percentage (e.g., 2 for 2%)
    averageOrderValue: number;
  }): {
    projectedConversions: number;
    projectedRevenue: number;
    projectedProfit: number;
    roi: number;
    paybackPeriod: string;
  } {
    const conversionRate = input.conversionRate / 100;
    const projectedConversions = Math.round(
      input.estimatedReach * conversionRate,
    );
    const projectedRevenue = projectedConversions * input.averageOrderValue;
    const projectedProfit = projectedRevenue - input.totalCost;
    const roi = input.totalCost > 0
      ? Math.round((projectedProfit / input.totalCost) * 100)
      : 0;

    // Simple payback calculation (assuming daily revenue spread)
    const dailyRevenue = projectedRevenue / 7; // Assuming 1-week campaign
    const paybackDays =
      dailyRevenue > 0
        ? Math.ceil(input.totalCost / dailyRevenue)
        : 999;
    const paybackPeriod =
      paybackDays <= 7
        ? `${paybackDays} days`
        : paybackDays <= 30
          ? `${Math.round(paybackDays / 7)} weeks`
          : `${Math.round(paybackDays / 30)} months`;

    return {
      projectedConversions,
      projectedRevenue,
      projectedProfit,
      roi,
      paybackPeriod,
    };
  }

  /**
   * Get platform cost efficiency ranking
   */
  getPlatformEfficiencyRanking(): Array<{
    platform: string;
    costPerThousandImpressions: number;
    organicReach: number;
    efficiency: number;
  }> {
    return Object.entries(this.platformCPM)
      .map(([platform, cpm]) => ({
        platform,
        costPerThousandImpressions: cpm,
        organicReach: this.organicReach[platform] || 1000,
        efficiency: (this.organicReach[platform] || 1000) / cpm,
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }
}
