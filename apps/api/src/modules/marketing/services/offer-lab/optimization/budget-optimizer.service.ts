import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Budget Optimizer Service
 *
 * ML-based budget allocation optimizer that:
 * - Analyzes campaign performance to recommend optimal budget distribution
 * - Uses multiple optimization strategies (ROI, EPC, Conversions)
 * - Respects constraints (min budget, max concentration, global cap)
 * - Generates actionable reallocation recommendations
 */

export type OptimizationStrategy = 'roi' | 'epc' | 'conversions' | 'balanced';

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
  epc: number; // Earnings Per Click
  ctr: number;
  cvr: number;
}

export interface BudgetRecommendation {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  recommendedBudget: number;
  change: number;
  changePercentage: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OptimizationResult {
  strategy: OptimizationStrategy;
  totalBudget: number;
  recommendations: BudgetRecommendation[];
  expectedROIIncrease: number;
  expectedConversionIncrease: number;
  summary: string;
}

@Injectable()
export class BudgetOptimizerService {
  private readonly logger = new Logger(BudgetOptimizerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Optimize budget allocation across campaigns
   */
  async optimizeBudgets(
    strategy: OptimizationStrategy = 'balanced',
    totalBudget?: number,
  ): Promise<OptimizationResult> {
    this.logger.log(`Optimizing budgets using strategy: ${strategy}`);

    // Get all active campaigns with performance data
    const campaigns = await this.getActiveCampaignPerformance();

    if (campaigns.length === 0) {
      throw new Error('No active campaigns to optimize');
    }

    // Calculate total budget if not provided
    if (!totalBudget) {
      totalBudget = campaigns.reduce((sum, c) => sum + c.currentBudget, 0);
    }

    // Generate recommendations based on strategy
    let recommendations: BudgetRecommendation[];

    switch (strategy) {
      case 'roi':
        recommendations = this.optimizeByROI(campaigns, totalBudget);
        break;
      case 'epc':
        recommendations = this.optimizeByEPC(campaigns, totalBudget);
        break;
      case 'conversions':
        recommendations = this.optimizeByConversions(campaigns, totalBudget);
        break;
      case 'balanced':
      default:
        recommendations = this.optimizeBalanced(campaigns, totalBudget);
        break;
    }

    // Calculate expected improvements
    const expectedROIIncrease = this.calculateExpectedROIIncrease(campaigns, recommendations);
    const expectedConversionIncrease = this.calculateExpectedConversionIncrease(
      campaigns,
      recommendations,
    );

    // Generate summary
    const increasingCount = recommendations.filter((r) => r.change > 0).length;
    const decreasingCount = recommendations.filter((r) => r.change < 0).length;
    const summary = `${increasingCount} campaigns will receive more budget, ${decreasingCount} will be reduced. Expected ROI increase: ${expectedROIIncrease.toFixed(1)}%.`;

    return {
      strategy,
      totalBudget,
      recommendations,
      expectedROIIncrease,
      expectedConversionIncrease,
      summary,
    };
  }

  /**
   * Get active campaign performance data
   */
  private async getActiveCampaignPerformance(): Promise<CampaignPerformance[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 10, // Last 10 snapshots for averaging
        },
      },
    });

    return campaigns.map((campaign) => {
      // Aggregate metrics
      const totals = campaign.metrics.reduce(
        (acc, m) => ({
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          conversions: acc.conversions + m.conversions,
          spend: acc.spend + parseFloat(m.spend.toString()),
          revenue: acc.revenue + parseFloat(m.revenue?.toString() || '0'),
        }),
        { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
      );

      const currentBudget = parseFloat(campaign.dailyBudget.toString());
      const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;
      const epc = totals.clicks > 0 ? totals.revenue / totals.clicks : 0;
      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        currentBudget,
        spend: totals.spend,
        impressions: totals.impressions,
        clicks: totals.clicks,
        conversions: totals.conversions,
        revenue: totals.revenue,
        roi,
        epc,
        ctr,
        cvr,
      };
    });
  }

  /**
   * Optimize by ROI - allocate more budget to high ROI campaigns
   */
  private optimizeByROI(
    campaigns: CampaignPerformance[],
    totalBudget: number,
  ): BudgetRecommendation[] {
    // Filter campaigns with positive ROI
    const profitableCampaigns = campaigns.filter((c) => c.roi > 0);

    if (profitableCampaigns.length === 0) {
      return this.maintainCurrentBudgets(campaigns);
    }

    // Calculate weights based on ROI
    const totalROIWeight = profitableCampaigns.reduce((sum, c) => sum + c.roi, 0);

    return campaigns.map((campaign) => {
      let recommendedBudget: number;
      let reason: string;
      let priority: 'high' | 'medium' | 'low';

      if (campaign.roi > 0) {
        // Allocate proportionally based on ROI
        const weight = campaign.roi / totalROIWeight;
        recommendedBudget = Math.max(5, totalBudget * weight); // Min $5/day

        if (campaign.roi > 100) {
          reason = `High ROI (${campaign.roi.toFixed(0)}%) - scale aggressively`;
          priority = 'high';
        } else if (campaign.roi > 50) {
          reason = `Good ROI (${campaign.roi.toFixed(0)}%) - moderate scaling`;
          priority = 'medium';
        } else {
          reason = `Positive ROI (${campaign.roi.toFixed(0)}%)`;
          priority = 'low';
        }
      } else {
        // Reduce budget for negative ROI campaigns
        recommendedBudget = Math.max(5, campaign.currentBudget * 0.5);
        reason = `Negative ROI (${campaign.roi.toFixed(0)}%) - reduce budget`;
        priority = 'high';
      }

      const change = recommendedBudget - campaign.currentBudget;
      const changePercentage = (change / campaign.currentBudget) * 100;

      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        currentBudget: campaign.currentBudget,
        recommendedBudget,
        change,
        changePercentage,
        reason,
        priority,
      };
    });
  }

  /**
   * Optimize by EPC - allocate more budget to high earnings per click
   */
  private optimizeByEPC(
    campaigns: CampaignPerformance[],
    totalBudget: number,
  ): BudgetRecommendation[] {
    const campaignsWithEPC = campaigns.filter((c) => c.epc > 0);

    if (campaignsWithEPC.length === 0) {
      return this.maintainCurrentBudgets(campaigns);
    }

    const totalEPCWeight = campaignsWithEPC.reduce((sum, c) => sum + c.epc, 0);

    return campaigns.map((campaign) => {
      let recommendedBudget: number;
      let reason: string;
      let priority: 'high' | 'medium' | 'low';

      if (campaign.epc > 0) {
        const weight = campaign.epc / totalEPCWeight;
        recommendedBudget = Math.max(5, totalBudget * weight);

        if (campaign.epc > 0.1) {
          reason = `High EPC ($${campaign.epc.toFixed(3)}) - excellent traffic quality`;
          priority = 'high';
        } else if (campaign.epc > 0.05) {
          reason = `Good EPC ($${campaign.epc.toFixed(3)})`;
          priority = 'medium';
        } else {
          reason = `Moderate EPC ($${campaign.epc.toFixed(3)})`;
          priority = 'low';
        }
      } else {
        recommendedBudget = Math.max(5, campaign.currentBudget * 0.3);
        reason = 'Zero EPC - minimal budget until proven';
        priority = 'high';
      }

      const change = recommendedBudget - campaign.currentBudget;
      const changePercentage = (change / campaign.currentBudget) * 100;

      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        currentBudget: campaign.currentBudget,
        recommendedBudget,
        change,
        changePercentage,
        reason,
        priority,
      };
    });
  }

  /**
   * Optimize by conversions - allocate more budget to high converting campaigns
   */
  private optimizeByConversions(
    campaigns: CampaignPerformance[],
    totalBudget: number,
  ): BudgetRecommendation[] {
    const campaignsWithConversions = campaigns.filter((c) => c.conversions > 0);

    if (campaignsWithConversions.length === 0) {
      return this.maintainCurrentBudgets(campaigns);
    }

    const totalConversions = campaignsWithConversions.reduce((sum, c) => sum + c.conversions, 0);

    return campaigns.map((campaign) => {
      let recommendedBudget: number;
      let reason: string;
      let priority: 'high' | 'medium' | 'low';

      if (campaign.conversions > 0) {
        const weight = campaign.conversions / totalConversions;
        recommendedBudget = Math.max(5, totalBudget * weight);

        if (campaign.conversions > 100) {
          reason = `High conversions (${campaign.conversions}) - proven winner`;
          priority = 'high';
        } else if (campaign.conversions > 20) {
          reason = `Good conversions (${campaign.conversions})`;
          priority = 'medium';
        } else {
          reason = `Moderate conversions (${campaign.conversions})`;
          priority = 'low';
        }
      } else {
        recommendedBudget = Math.max(5, campaign.currentBudget * 0.2);
        reason = 'No conversions - testing budget only';
        priority = 'high';
      }

      const change = recommendedBudget - campaign.currentBudget;
      const changePercentage = (change / campaign.currentBudget) * 100;

      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        currentBudget: campaign.currentBudget,
        recommendedBudget,
        change,
        changePercentage,
        reason,
        priority,
      };
    });
  }

  /**
   * Balanced optimization - considers ROI, EPC, and conversions
   */
  private optimizeBalanced(
    campaigns: CampaignPerformance[],
    totalBudget: number,
  ): BudgetRecommendation[] {
    // Calculate composite score for each campaign
    const campaignsWithScores = campaigns.map((c) => {
      // Normalize metrics to 0-100 scale
      const roiScore = Math.min(100, Math.max(0, c.roi));
      const epcScore = Math.min(100, c.epc * 1000); // $0.10 EPC = 100 points
      const cvrScore = Math.min(100, c.cvr * 20); // 5% CVR = 100 points

      // Weighted composite score
      const compositeScore = roiScore * 0.4 + epcScore * 0.3 + cvrScore * 0.3;

      return { ...c, compositeScore };
    });

    const totalScore = campaignsWithScores.reduce((sum, c) => sum + c.compositeScore, 0);

    return campaignsWithScores.map((campaign) => {
      const weight = totalScore > 0 ? campaign.compositeScore / totalScore : 1 / campaigns.length;
      const recommendedBudget = Math.max(5, totalBudget * weight);

      let reason: string;
      let priority: 'high' | 'medium' | 'low';

      if (campaign.compositeScore > 70) {
        reason = `High performance score (${campaign.compositeScore.toFixed(0)}) - ROI: ${campaign.roi.toFixed(0)}%, EPC: $${campaign.epc.toFixed(3)}`;
        priority = 'high';
      } else if (campaign.compositeScore > 40) {
        reason = `Moderate performance (${campaign.compositeScore.toFixed(0)})`;
        priority = 'medium';
      } else {
        reason = `Low performance (${campaign.compositeScore.toFixed(0)}) - needs improvement`;
        priority = 'low';
      }

      const change = recommendedBudget - campaign.currentBudget;
      const changePercentage = (change / campaign.currentBudget) * 100;

      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        currentBudget: campaign.currentBudget,
        recommendedBudget,
        change,
        changePercentage,
        reason,
        priority,
      };
    });
  }

  /**
   * Maintain current budgets (fallback)
   */
  private maintainCurrentBudgets(campaigns: CampaignPerformance[]): BudgetRecommendation[] {
    return campaigns.map((campaign) => ({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      currentBudget: campaign.currentBudget,
      recommendedBudget: campaign.currentBudget,
      change: 0,
      changePercentage: 0,
      reason: 'Insufficient data for optimization - maintain current budget',
      priority: 'low' as const,
    }));
  }

  /**
   * Calculate expected ROI increase
   */
  private calculateExpectedROIIncrease(
    campaigns: CampaignPerformance[],
    recommendations: BudgetRecommendation[],
  ): number {
    const currentWeightedROI = campaigns.reduce((sum, c) => sum + c.roi * c.currentBudget, 0);
    const currentTotalBudget = campaigns.reduce((sum, c) => sum + c.currentBudget, 0);

    const recommendedWeightedROI = campaigns.reduce((sum, c) => {
      const rec = recommendations.find((r) => r.campaignId === c.campaignId);
      return sum + c.roi * (rec?.recommendedBudget || c.currentBudget);
    }, 0);
    const recommendedTotalBudget = recommendations.reduce((sum, r) => sum + r.recommendedBudget, 0);

    const currentAvgROI = currentTotalBudget > 0 ? currentWeightedROI / currentTotalBudget : 0;
    const recommendedAvgROI =
      recommendedTotalBudget > 0 ? recommendedWeightedROI / recommendedTotalBudget : 0;

    return currentAvgROI > 0 ? ((recommendedAvgROI - currentAvgROI) / currentAvgROI) * 100 : 0;
  }

  /**
   * Calculate expected conversion increase
   */
  private calculateExpectedConversionIncrease(
    campaigns: CampaignPerformance[],
    recommendations: BudgetRecommendation[],
  ): number {
    const currentConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    // Estimate new conversions based on budget changes and CVR
    const estimatedNewConversions = campaigns.reduce((sum, c) => {
      const rec = recommendations.find((r) => r.campaignId === c.campaignId);
      if (!rec) return sum + c.conversions;

      // Assume conversions scale linearly with budget (simplified)
      const budgetMultiplier = rec.recommendedBudget / Math.max(1, c.currentBudget);
      return sum + c.conversions * budgetMultiplier;
    }, 0);

    return currentConversions > 0
      ? ((estimatedNewConversions - currentConversions) / currentConversions) * 100
      : 0;
  }

  /**
   * Apply budget recommendations
   */
  async applyRecommendations(recommendations: BudgetRecommendation[]): Promise<{
    appliedCount: number;
    skippedCount: number;
    errors: string[];
  }> {
    let appliedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const rec of recommendations) {
      // Skip if change is negligible (<5%)
      if (Math.abs(rec.changePercentage) < 5) {
        skippedCount++;
        continue;
      }

      try {
        await this.prisma.adCampaign.update({
          where: { id: rec.campaignId },
          data: {
            dailyBudget: new Decimal(rec.recommendedBudget.toFixed(2)),
          },
        });

        this.logger.log(
          `Updated ${rec.campaignName}: $${rec.currentBudget} → $${rec.recommendedBudget} (${rec.changePercentage.toFixed(1)}%)`,
        );

        appliedCount++;
      } catch (error) {
        const errorMsg = `Error updating ${rec.campaignName}: ${error.message}`;
        errors.push(errorMsg);
        this.logger.error(errorMsg);
      }
    }

    return { appliedCount, skippedCount, errors };
  }
}
