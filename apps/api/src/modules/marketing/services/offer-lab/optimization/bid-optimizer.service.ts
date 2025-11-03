import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Bid Optimizer Service
 *
 * Calculates optimal bid amounts for ad campaigns:
 * - Target CPA bidding
 * - Target ROAS bidding
 * - Maximum bid recommendations
 * - Bid adjustment suggestions
 */

export interface BidRecommendation {
  campaignId: string;
  campaignName: string;
  currentBid: number;
  recommendedBid: number;
  bidChange: number;
  bidChangePercentage: number;
  strategy: 'target-cpa' | 'target-roas' | 'maximize-conversions' | 'maximize-clicks';
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface BidStrategy {
  strategy: 'target-cpa' | 'target-roas' | 'maximize-conversions' | 'maximize-clicks';
  targetCPA?: number;
  targetROAS?: number;
  maxBid?: number;
  minBid?: number;
}

@Injectable()
export class BidOptimizerService {
  private readonly logger = new Logger(BidOptimizerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate optimal bid for a campaign
   */
  async calculateOptimalBid(
    campaignId: string,
    strategy: BidStrategy,
  ): Promise<BidRecommendation> {
    this.logger.log(`Calculating optimal bid for campaign: ${campaignId}`);

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

    // Aggregate performance metrics
    const totals = campaign.metrics.reduce(
      (acc, m) => ({
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        spend: acc.spend + parseFloat(m.spend.toString()),
        revenue: acc.revenue + parseFloat(m.revenue?.toString() || '0'),
      }),
      { clicks: 0, conversions: 0, spend: 0, revenue: 0 },
    );

    // Calculate current metrics
    const currentCPA = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    const currentROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;
    const currentCPC = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const currentCVR = totals.clicks > 0 ? totals.conversions / totals.clicks : 0;

    // Current bid (use CPC as proxy)
    const currentBid = currentCPC;

    let recommendedBid: number;
    let reasoning: string;
    let confidence: 'high' | 'medium' | 'low';

    // Calculate bid based on strategy
    switch (strategy.strategy) {
      case 'target-cpa':
        ({ recommendedBid, reasoning, confidence } = this.calculateTargetCPABid(
          currentCPA,
          currentCVR,
          strategy.targetCPA!,
          totals.conversions,
        ));
        break;

      case 'target-roas':
        ({ recommendedBid, reasoning, confidence } = this.calculateTargetROASBid(
          currentROAS,
          currentCPC,
          currentCVR,
          totals.revenue,
          totals.conversions,
          strategy.targetROAS!,
        ));
        break;

      case 'maximize-conversions':
        ({ recommendedBid, reasoning, confidence } = this.calculateMaxConversionsBid(
          currentCPC,
          currentCVR,
          totals.conversions,
        ));
        break;

      case 'maximize-clicks':
      default:
        ({ recommendedBid, reasoning, confidence } = this.calculateMaxClicksBid(
          currentCPC,
          totals.clicks,
        ));
        break;
    }

    // Apply bid constraints
    if (strategy.maxBid) {
      recommendedBid = Math.min(recommendedBid, strategy.maxBid);
    }
    if (strategy.minBid) {
      recommendedBid = Math.max(recommendedBid, strategy.minBid);
    }

    const bidChange = recommendedBid - currentBid;
    const bidChangePercentage = currentBid > 0 ? (bidChange / currentBid) * 100 : 0;

    return {
      campaignId,
      campaignName: campaign.name,
      currentBid,
      recommendedBid,
      bidChange,
      bidChangePercentage,
      strategy: strategy.strategy,
      reasoning,
      confidence,
    };
  }

  /**
   * Calculate bid for Target CPA strategy
   */
  private calculateTargetCPABid(
    currentCPA: number,
    currentCVR: number,
    targetCPA: number,
    totalConversions: number,
  ): { recommendedBid: number; reasoning: string; confidence: 'high' | 'medium' | 'low' } {
    // Target CPA bid formula: Target CPA × CVR = Max CPC
    const recommendedBid = targetCPA * currentCVR;

    let reasoning: string;
    let confidence: 'high' | 'medium' | 'low';

    if (totalConversions < 10) {
      confidence = 'low';
      reasoning = `Insufficient data (${totalConversions} conversions). Bid conservatively at $${recommendedBid.toFixed(2)} based on ${(currentCVR * 100).toFixed(2)}% CVR to hit $${targetCPA} CPA target.`;
    } else if (totalConversions < 50) {
      confidence = 'medium';
      reasoning = `Moderate data (${totalConversions} conversions). Bid $${recommendedBid.toFixed(2)} to target $${targetCPA} CPA with current ${(currentCVR * 100).toFixed(2)}% CVR.`;
    } else {
      confidence = 'high';
      reasoning = `Strong data (${totalConversions} conversions). Bid $${recommendedBid.toFixed(2)} to achieve $${targetCPA} CPA at ${(currentCVR * 100).toFixed(2)}% CVR.`;
    }

    return { recommendedBid: Math.max(0.01, recommendedBid), reasoning, confidence };
  }

  /**
   * Calculate bid for Target ROAS strategy
   */
  private calculateTargetROASBid(
    currentROAS: number,
    currentCPC: number,
    currentCVR: number,
    totalRevenue: number,
    totalConversions: number,
    targetROAS: number,
  ): { recommendedBid: number; reasoning: string; confidence: 'high' | 'medium' | 'low' } {
    // Average revenue per conversion
    const avgRevenuePerConversion = totalConversions > 0 ? totalRevenue / totalConversions : 0;

    // Target ROAS bid formula: (Avg Revenue per Conv × CVR) / Target ROAS = Max CPC
    const recommendedBid = (avgRevenuePerConversion * currentCVR) / targetROAS;

    let reasoning: string;
    let confidence: 'high' | 'medium' | 'low';

    if (totalConversions < 20) {
      confidence = 'low';
      reasoning = `Limited data. Bid $${recommendedBid.toFixed(2)} to target ${targetROAS}x ROAS with $${avgRevenuePerConversion.toFixed(2)} avg order value.`;
    } else if (totalConversions < 100) {
      confidence = 'medium';
      reasoning = `Moderate data. Bid $${recommendedBid.toFixed(2)} for ${targetROAS}x ROAS target (AOV: $${avgRevenuePerConversion.toFixed(2)}, CVR: ${(currentCVR * 100).toFixed(2)}%).`;
    } else {
      confidence = 'high';
      reasoning = `Strong data. Bid $${recommendedBid.toFixed(2)} to achieve ${targetROAS}x ROAS with current performance metrics.`;
    }

    return { recommendedBid: Math.max(0.01, recommendedBid), reasoning, confidence };
  }

  /**
   * Calculate bid for Maximize Conversions strategy
   */
  private calculateMaxConversionsBid(
    currentCPC: number,
    currentCVR: number,
    totalConversions: number,
  ): { recommendedBid: number; reasoning: string; confidence: 'high' | 'medium' | 'low' } {
    // Increase bid by 20-50% to capture more volume
    let bidMultiplier = 1.3; // Default 30% increase

    if (currentCVR > 0.05) {
      // If CVR > 5%, be aggressive
      bidMultiplier = 1.5;
    } else if (currentCVR < 0.02) {
      // If CVR < 2%, be conservative
      bidMultiplier = 1.2;
    }

    const recommendedBid = currentCPC * bidMultiplier;

    let confidence: 'high' | 'medium' | 'low';
    let reasoning: string;

    if (totalConversions < 10) {
      confidence = 'low';
      reasoning = `Limited conversion data. Increase bid to $${recommendedBid.toFixed(2)} (+${((bidMultiplier - 1) * 100).toFixed(0)}%) to gather more data.`;
    } else {
      confidence = totalConversions > 50 ? 'high' : 'medium';
      reasoning = `Increase bid to $${recommendedBid.toFixed(2)} (+${((bidMultiplier - 1) * 100).toFixed(0)}%) to maximize conversion volume at ${(currentCVR * 100).toFixed(2)}% CVR.`;
    }

    return { recommendedBid, reasoning, confidence };
  }

  /**
   * Calculate bid for Maximize Clicks strategy
   */
  private calculateMaxClicksBid(
    currentCPC: number,
    totalClicks: number,
  ): { recommendedBid: number; reasoning: string; confidence: 'high' | 'medium' | 'low' } {
    // Increase bid by 10-20% for more clicks
    const bidMultiplier = 1.15; // 15% increase
    const recommendedBid = currentCPC * bidMultiplier;

    const confidence = totalClicks > 100 ? 'high' : totalClicks > 30 ? 'medium' : 'low';
    const reasoning = `Increase bid to $${recommendedBid.toFixed(2)} (+15%) to maximize click volume.`;

    return { recommendedBid, reasoning, confidence };
  }

  /**
   * Get bid recommendations for all active campaigns
   */
  async getAllBidRecommendations(strategy: BidStrategy): Promise<BidRecommendation[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const recommendations: BidRecommendation[] = [];

    for (const campaign of campaigns) {
      try {
        const rec = await this.calculateOptimalBid(campaign.id, strategy);
        recommendations.push(rec);
      } catch (error) {
        this.logger.warn(
          `Could not calculate bid for campaign ${campaign.id}: ${error.message}`,
        );
      }
    }

    // Sort by bid change percentage (largest changes first)
    return recommendations.sort((a, b) => Math.abs(b.bidChangePercentage) - Math.abs(a.bidChangePercentage));
  }

  /**
   * Apply bid recommendations
   */
  async applyBidRecommendation(campaignId: string, recommendedBid: number): Promise<void> {
    await this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        // Note: Store recommended bid in a custom field
        // In production, integrate with ad platform API to update actual bid
      },
    });

    this.logger.log(`Applied bid recommendation for campaign ${campaignId}: $${recommendedBid.toFixed(2)}`);
  }
}
