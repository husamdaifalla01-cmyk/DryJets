import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BidStrategy } from './bid-optimizer.service';

/**
 * Bid Strategy Selector Service
 *
 * Automatically selects the optimal bidding strategy for campaigns:
 * - Analyzes campaign characteristics
 * - Recommends best bidding approach
 * - Provides strategy rationale
 * - Adapts strategy based on performance
 */

export interface StrategyRecommendation {
  campaignId: string;
  campaignName: string;
  currentStrategy?: string;
  recommendedStrategy: BidStrategy;
  rationale: string;
  expectedImprovement: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface CampaignProfile {
  maturity: 'new' | 'testing' | 'mature' | 'declining';
  dataQuality: 'insufficient' | 'limited' | 'sufficient' | 'excellent';
  profitability: 'losing' | 'break-even' | 'profitable' | 'highly-profitable';
  consistency: 'volatile' | 'moderate' | 'stable';
}

@Injectable()
export class BidStrategySelectorService {
  private readonly logger = new Logger(BidStrategySelectorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Select optimal bidding strategy for a campaign
   */
  async selectBidStrategy(campaignId: string): Promise<StrategyRecommendation> {
    this.logger.log(`Selecting bid strategy for campaign: ${campaignId}`);

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 30,
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Profile the campaign
    const profile = this.profileCampaign(campaign);

    // Select strategy based on profile
    const { strategy, rationale, expectedImprovement, confidence } = this.selectStrategyByProfile(
      profile,
      campaign,
    );

    return {
      campaignId,
      campaignName: campaign.name,
      recommendedStrategy: strategy,
      rationale,
      expectedImprovement,
      confidence,
    };
  }

  /**
   * Profile campaign characteristics
   */
  private profileCampaign(campaign: any): CampaignProfile {
    // Calculate metrics
    const totals = campaign.metrics.reduce(
      (acc, m) => ({
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        spend: acc.spend + parseFloat(m.spend.toString()),
        revenue: acc.revenue + parseFloat(m.revenue?.toString() || '0'),
      }),
      { clicks: 0, conversions: 0, spend: 0, revenue: 0 },
    );

    const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;
    const daysRunning = Math.floor(
      (Date.now() - (campaign.startedAt || campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    // Determine maturity
    let maturity: CampaignProfile['maturity'];
    if (daysRunning < 3) maturity = 'new';
    else if (daysRunning < 14 || totals.conversions < 20) maturity = 'testing';
    else if (roi > 20) maturity = 'mature';
    else maturity = 'declining';

    // Determine data quality
    let dataQuality: CampaignProfile['dataQuality'];
    if (totals.conversions < 10) dataQuality = 'insufficient';
    else if (totals.conversions < 30) dataQuality = 'limited';
    else if (totals.conversions < 100) dataQuality = 'sufficient';
    else dataQuality = 'excellent';

    // Determine profitability
    let profitability: CampaignProfile['profitability'];
    if (roi < -10) profitability = 'losing';
    else if (roi < 10) profitability = 'break-even';
    else if (roi < 50) profitability = 'profitable';
    else profitability = 'highly-profitable';

    // Determine consistency (variance in ROI)
    const roiValues = campaign.metrics.slice(0, 10).map((m) => {
      const spent = parseFloat(m.spend.toString());
      const revenue = parseFloat(m.revenue?.toString() || '0');
      return spent > 0 ? ((revenue - spent) / spent) * 100 : 0;
    });

    const avgROI = roiValues.reduce((sum, v) => sum + v, 0) / Math.max(1, roiValues.length);
    const variance =
      roiValues.reduce((sum, v) => sum + Math.pow(v - avgROI, 2), 0) / Math.max(1, roiValues.length);
    const stdDev = Math.sqrt(variance);

    let consistency: CampaignProfile['consistency'];
    if (stdDev > 50) consistency = 'volatile';
    else if (stdDev > 25) consistency = 'moderate';
    else consistency = 'stable';

    return { maturity, dataQuality, profitability, consistency };
  }

  /**
   * Select strategy based on campaign profile
   */
  private selectStrategyByProfile(
    profile: CampaignProfile,
    campaign: any,
  ): {
    strategy: BidStrategy;
    rationale: string;
    expectedImprovement: string;
    confidence: 'high' | 'medium' | 'low';
  } {
    const totals = campaign.metrics.reduce(
      (acc: any, m: any) => ({
        spend: acc.spend + parseFloat(m.spend.toString()),
        revenue: acc.revenue + parseFloat(m.revenue?.toString() || '0'),
        conversions: acc.conversions + m.conversions,
      }),
      { spend: 0, revenue: 0, conversions: 0 },
    );

    const currentCPA = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    const currentROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;

    // New campaigns: Start with maximize clicks
    if (profile.maturity === 'new' || profile.dataQuality === 'insufficient') {
      return {
        strategy: {
          strategy: 'maximize-clicks',
          minBid: 0.01,
          maxBid: 1.0,
        },
        rationale: `New campaign with insufficient data. Focus on gathering clicks and conversions data first.`,
        expectedImprovement: 'Builds foundation for optimization',
        confidence: 'medium',
      };
    }

    // Testing phase with limited data: Maximize conversions
    if (profile.maturity === 'testing' && profile.dataQuality === 'limited') {
      return {
        strategy: {
          strategy: 'maximize-conversions',
          minBid: 0.05,
          maxBid: 2.0,
        },
        rationale: `Campaign in testing phase. Focus on maximizing conversion volume to gather statistically significant data.`,
        expectedImprovement: '20-40% more conversions',
        confidence: 'medium',
      };
    }

    // Highly profitable + sufficient data: Target ROAS
    if (profile.profitability === 'highly-profitable' && profile.dataQuality === 'excellent' || profile.dataQuality === 'sufficient' || profile.dataQuality === 'limited') {
      const targetROAS = Math.max(2, currentROAS * 0.9); // Target 90% of current ROAS

      return {
        strategy: {
          strategy: 'target-roas',
          targetROAS,
          minBid: 0.10,
        },
        rationale: `Highly profitable campaign (${currentROAS.toFixed(1)}x ROAS). Use Target ROAS to scale while maintaining profitability.`,
        expectedImprovement: 'Scale volume while protecting ${targetROAS.toFixed(1)}x+ ROAS',
        confidence: 'high',
      };
    }

    // Profitable + excellent data: Target CPA
    if (profile.profitability === 'profitable' && profile.dataQuality === 'excellent') {
      const targetCPA = currentCPA * 1.2; // Allow 20% higher CPA for scale

      return {
        strategy: {
          strategy: 'target-cpa',
          targetCPA,
          minBid: 0.05,
        },
        rationale: `Profitable campaign with excellent data. Use Target CPA at $${targetCPA.toFixed(2)} to scale efficiently.`,
        expectedImprovement: 'Scale conversions while maintaining $${targetCPA.toFixed(2)} CPA',
        confidence: 'high',
      };
    }

    // Break-even or struggling: Target CPA with tight control
    if (profile.profitability === 'break-even' || profile.profitability === 'losing') {
      const targetCPA = currentCPA > 0 ? currentCPA * 0.8 : 10; // Target 20% lower CPA

      return {
        strategy: {
          strategy: 'target-cpa',
          targetCPA,
          maxBid: currentCPA > 0 ? currentCPA * 0.5 : 1.0,
        },
        rationale: `Campaign at break-even or losing. Use strict Target CPA ($${targetCPA.toFixed(2)}) to improve profitability.`,
        expectedImprovement: 'Reduce CPA by 20%+',
        confidence: 'medium',
      };
    }

    // Volatile performance: Target CPA for stability
    if (profile.consistency === 'volatile') {
      const targetCPA = currentCPA > 0 ? currentCPA : 15;

      return {
        strategy: {
          strategy: 'target-cpa',
          targetCPA,
          minBid: 0.05,
          maxBid: targetCPA * 0.5,
        },
        rationale: `Performance is volatile. Use Target CPA to stabilize results and reduce variance.`,
        expectedImprovement: 'More consistent performance',
        confidence: 'medium',
      };
    }

    // Default: Maximize conversions
    return {
      strategy: {
        strategy: 'maximize-conversions',
        minBid: 0.05,
        maxBid: 2.0,
      },
      rationale: `Standard campaign. Focus on maximizing conversion volume.`,
      expectedImprovement: '15-30% more conversions',
      confidence: 'medium',
    };
  }

  /**
   * Get strategy recommendations for all active campaigns
   */
  async getAllStrategyRecommendations(): Promise<StrategyRecommendation[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const recommendations: StrategyRecommendation[] = [];

    for (const campaign of campaigns) {
      try {
        const rec = await this.selectBidStrategy(campaign.id);
        recommendations.push(rec);
      } catch (error) {
        this.logger.warn(
          `Could not select strategy for campaign ${campaign.id}: ${error.message}`,
        );
      }
    }

    return recommendations;
  }

  /**
   * Get campaigns using suboptimal strategies
   */
  async getCampaignsNeedingStrategyChange(): Promise<StrategyRecommendation[]> {
    const recommendations = await this.getAllStrategyRecommendations();

    // Filter campaigns where strategy change would help
    // (In production, compare with actual current strategy)
    return recommendations.filter((rec) => rec.confidence === 'high');
  }

  /**
   * Get strategy distribution across campaigns
   */
  async getStrategyDistribution(): Promise<{
    maximizeClicks: number;
    maximizeConversions: number;
    targetCPA: number;
    targetROAS: number;
  }> {
    const recommendations = await this.getAllStrategyRecommendations();

    return {
      maximizeClicks: recommendations.filter((r) => r.recommendedStrategy.strategy === 'maximize-clicks').length,
      maximizeConversions: recommendations.filter(
        (r) => r.recommendedStrategy.strategy === 'maximize-conversions',
      ).length,
      targetCPA: recommendations.filter((r) => r.recommendedStrategy.strategy === 'target-cpa').length,
      targetROAS: recommendations.filter((r) => r.recommendedStrategy.strategy === 'target-roas').length,
    };
  }
}
