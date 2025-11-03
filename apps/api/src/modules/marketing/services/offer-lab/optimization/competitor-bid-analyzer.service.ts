import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Competitor Bid Analyzer Service
 *
 * Monitors and analyzes competitor bidding activity:
 * - Estimates competitor bids based on ad rank changes
 * - Tracks impression share fluctuations
 * - Identifies bidding wars
 * - Provides competitive positioning insights
 */

export interface CompetitorBidEstimate {
  network: string;
  estimatedMinBid: number;
  estimatedMaxBid: number;
  estimatedAvgBid: number;
  confidence: 'high' | 'medium' | 'low';
  biddingPressure: 'high' | 'medium' | 'low';
}

export interface CompetitiveAnalysis {
  campaignId: string;
  campaignName: string;
  yourBid: number;
  marketPosition: 'leader' | 'competitive' | 'lagging';
  competitorBids: CompetitorBidEstimate[];
  recommendedAction: string;
  biddingWarDetected: boolean;
}

@Injectable()
export class CompetitorBidAnalyzerService {
  private readonly logger = new Logger(CompetitorBidAnalyzerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze competitor bidding for a campaign
   */
  async analyzeCompetitorBids(campaignId: string): Promise<CompetitiveAnalysis> {
    this.logger.log(`Analyzing competitor bids for campaign: ${campaignId}`);

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        connection: true,
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Calculate current metrics
    const totals = campaign.metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        spend: acc.spend + parseFloat(m.spend.toString()),
      }),
      { impressions: 0, clicks: 0, spend: 0 },
    );

    const yourBid = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    // Estimate competitor bids based on market indicators
    const competitorBids = await this.estimateCompetitorBids(campaign, totals);

    // Determine market position
    const marketPosition = this.determineMarketPosition(yourBid, competitorBids);

    // Detect bidding wars
    const biddingWarDetected = this.detectBiddingWar(campaign.metrics);

    // Generate recommendation
    const recommendedAction = this.generateCompetitiveRecommendation(
      yourBid,
      marketPosition,
      competitorBids,
      biddingWarDetected,
    );

    return {
      campaignId,
      campaignName: campaign.name,
      yourBid,
      marketPosition,
      competitorBids,
      recommendedAction,
      biddingWarDetected,
    };
  }

  /**
   * Estimate competitor bids based on performance indicators
   */
  private async estimateCompetitorBids(
    campaign: any,
    totals: any,
  ): Promise<CompetitorBidEstimate[]> {
    const network = campaign.connection?.network || 'Unknown';
    const yourCPC = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    // Estimate based on CTR and impression share
    // Lower CTR suggests higher competition (higher bids needed)
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

    let biddingPressure: 'high' | 'medium' | 'low';
    let estimatedAvgBid: number;

    if (ctr < 1) {
      // High competition
      biddingPressure = 'high';
      estimatedAvgBid = yourCPC * 1.3; // Competitors bidding ~30% higher
    } else if (ctr < 2) {
      // Medium competition
      biddingPressure = 'medium';
      estimatedAvgBid = yourCPC * 1.1; // Competitors bidding ~10% higher
    } else {
      // Low competition
      biddingPressure = 'low';
      estimatedAvgBid = yourCPC * 0.9; // Competitors bidding ~10% lower
    }

    const estimatedMinBid = estimatedAvgBid * 0.7;
    const estimatedMaxBid = estimatedAvgBid * 1.5;

    const confidence = totals.clicks > 100 ? 'high' : totals.clicks > 30 ? 'medium' : 'low';

    return [
      {
        network,
        estimatedMinBid,
        estimatedMaxBid,
        estimatedAvgBid,
        confidence,
        biddingPressure,
      },
    ];
  }

  /**
   * Determine market position relative to competitors
   */
  private determineMarketPosition(
    yourBid: number,
    competitorBids: CompetitorBidEstimate[],
  ): 'leader' | 'competitive' | 'lagging' {
    if (competitorBids.length === 0) return 'competitive';

    const avgCompetitorBid = competitorBids[0].estimatedAvgBid;

    if (yourBid >= avgCompetitorBid * 1.2) {
      return 'leader'; // Bidding 20%+ above market
    } else if (yourBid >= avgCompetitorBid * 0.8) {
      return 'competitive'; // Within 20% of market
    } else {
      return 'lagging'; // Bidding below market
    }
  }

  /**
   * Detect bidding wars (rapid CPC increases)
   */
  private detectBiddingWar(metrics: any[]): boolean {
    if (metrics.length < 5) return false;

    // Calculate CPC for each metric
    const recentCPCs = metrics.slice(0, 5).map((m) => {
      const clicks = m.clicks;
      const spent = parseFloat(m.spend.toString());
      return clicks > 0 ? spent / clicks : 0;
    });

    // Check if CPC has increased >30% in last 5 periods
    const oldestCPC = recentCPCs[4] || 0;
    const newestCPC = recentCPCs[0] || 0;

    if (oldestCPC > 0 && newestCPC > oldestCPC * 1.3) {
      return true; // CPC increased >30% = bidding war
    }

    return false;
  }

  /**
   * Generate competitive recommendation
   */
  private generateCompetitiveRecommendation(
    yourBid: number,
    position: 'leader' | 'competitive' | 'lagging',
    competitorBids: CompetitorBidEstimate[],
    biddingWar: boolean,
  ): string {
    if (biddingWar) {
      return `⚠️ BIDDING WAR DETECTED. CPCs rising rapidly. Consider pausing or switching to alternative traffic sources.`;
    }

    const pressure = competitorBids[0]?.biddingPressure || 'medium';
    const avgBid = competitorBids[0]?.estimatedAvgBid || 0;

    if (position === 'leader') {
      if (pressure === 'low') {
        return `You're bidding above market ($${yourBid.toFixed(2)} vs $${avgBid.toFixed(2)} avg). Consider reducing bid to increase ROI.`;
      }
      return `Leading market position at $${yourBid.toFixed(2)}. Maintain current bid to dominate traffic.`;
    }

    if (position === 'lagging') {
      if (pressure === 'high') {
        return `Highly competitive market. Your bid ($${yourBid.toFixed(2)}) is below market ($${avgBid.toFixed(2)}). Increase to $${(avgBid * 1.1).toFixed(2)}+ to compete, or find alternative traffic sources.`;
      }
      return `Increase bid from $${yourBid.toFixed(2)} to $${avgBid.toFixed(2)} to match market and improve ad position.`;
    }

    // Competitive position
    if (pressure === 'high') {
      return `Competitive market. Monitor closely and adjust bids based on performance. Current bid: $${yourBid.toFixed(2)}.`;
    }

    return `Good competitive position at $${yourBid.toFixed(2)}. Maintain current strategy.`;
  }

  /**
   * Get all campaigns in bidding wars
   */
  async getCampaignsInBiddingWars(): Promise<CompetitiveAnalysis[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const biddingWars: CompetitiveAnalysis[] = [];

    for (const campaign of campaigns) {
      try {
        const analysis = await this.analyzeCompetitorBids(campaign.id);

        if (analysis.biddingWarDetected) {
          biddingWars.push(analysis);
        }
      } catch (error) {
        this.logger.warn(
          `Could not analyze competitor bids for campaign ${campaign.id}: ${error.message}`,
        );
      }
    }

    return biddingWars;
  }

  /**
   * Get campaigns lagging in competitive position
   */
  async getLaggingCampaigns(): Promise<CompetitiveAnalysis[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const lagging: CompetitiveAnalysis[] = [];

    for (const campaign of campaigns) {
      try {
        const analysis = await this.analyzeCompetitorBids(campaign.id);

        if (analysis.marketPosition === 'lagging') {
          lagging.push(analysis);
        }
      } catch (error) {
        // Skip failed analyses
      }
    }

    return lagging;
  }

  /**
   * Calculate market pressure index (0-100)
   */
  async getMarketPressureIndex(): Promise<{
    overallPressure: number;
    highPressureCampaigns: number;
    mediumPressureCampaigns: number;
    lowPressureCampaigns: number;
  }> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const campaign of campaigns) {
      try {
        const analysis = await this.analyzeCompetitorBids(campaign.id);

        const pressure = analysis.competitorBids[0]?.biddingPressure;
        if (pressure === 'high') highCount++;
        else if (pressure === 'medium') mediumCount++;
        else lowCount++;
      } catch (error) {
        // Skip
      }
    }

    const total = highCount + mediumCount + lowCount;
    const overallPressure = total > 0 ? ((highCount * 100 + mediumCount * 50 + lowCount * 0) / total) : 50;

    return {
      overallPressure: Math.round(overallPressure),
      highPressureCampaigns: highCount,
      mediumPressureCampaigns: mediumCount,
      lowPressureCampaigns: lowCount,
    };
  }
}
