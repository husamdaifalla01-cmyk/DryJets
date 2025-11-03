import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Funnel Analyzer Service
 *
 * Analyzes conversion funnels to identify:
 * - Conversion rates at each stage
 * - Drop-off points
 * - Funnel health scores
 * - Optimization opportunities
 */

export interface FunnelStage {
  stage: 'impression' | 'click' | 'landing' | 'conversion';
  count: number;
  dropoffRate: number; // % lost from previous stage
  conversionRate: number; // % from impressions
}

export interface FunnelAnalysis {
  campaignId: string;
  campaignName: string;
  stages: FunnelStage[];
  overallConversionRate: number;
  totalDropoff: number;
  funnelHealth: number; // 0-100 score
  weakestStage: 'impression-to-click' | 'click-to-landing' | 'landing-to-conversion';
  recommendation: string;
}

export interface FunnelBenchmark {
  stage: string;
  industryAverage: number;
  topPerformer: number;
  yourPerformance: number;
  gap: number;
}

@Injectable()
export class FunnelAnalyzerService {
  private readonly logger = new Logger(FunnelAnalyzerService.name);

  // Industry benchmarks (placeholder - would come from database)
  private readonly BENCHMARKS = {
    ctr: 2.0, // 2% click-through rate
    landingRate: 90, // 90% reach landing page
    cvr: 3.0, // 3% conversion rate from clicks
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze funnel for a specific campaign
   */
  async analyzeFunnel(campaignId: string): Promise<FunnelAnalysis> {
    this.logger.log(`Analyzing funnel for campaign: ${campaignId}`);

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Aggregate metrics
    const totals = campaign.metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
      }),
      { impressions: 0, clicks: 0, conversions: 0 },
    );

    // Estimate landing page visits (assume 95% of clicks reach landing)
    const landingPageVisits = Math.floor(totals.clicks * 0.95);

    // Build funnel stages
    const stages: FunnelStage[] = [
      {
        stage: 'impression',
        count: totals.impressions,
        dropoffRate: 0,
        conversionRate: 100,
      },
      {
        stage: 'click',
        count: totals.clicks,
        dropoffRate:
          totals.impressions > 0
            ? ((totals.impressions - totals.clicks) / totals.impressions) * 100
            : 0,
        conversionRate: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      },
      {
        stage: 'landing',
        count: landingPageVisits,
        dropoffRate: totals.clicks > 0 ? ((totals.clicks - landingPageVisits) / totals.clicks) * 100 : 0,
        conversionRate: totals.impressions > 0 ? (landingPageVisits / totals.impressions) * 100 : 0,
      },
      {
        stage: 'conversion',
        count: totals.conversions,
        dropoffRate:
          landingPageVisits > 0
            ? ((landingPageVisits - totals.conversions) / landingPageVisits) * 100
            : 0,
        conversionRate:
          totals.impressions > 0 ? (totals.conversions / totals.impressions) * 100 : 0,
      },
    ];

    // Calculate overall metrics
    const overallConversionRate =
      totals.impressions > 0 ? (totals.conversions / totals.impressions) * 100 : 0;
    const totalDropoff =
      totals.impressions > 0
        ? ((totals.impressions - totals.conversions) / totals.impressions) * 100
        : 100;

    // Identify weakest stage
    const dropoffRates = [
      { stage: 'impression-to-click' as const, rate: stages[1].dropoffRate },
      { stage: 'click-to-landing' as const, rate: stages[2].dropoffRate },
      { stage: 'landing-to-conversion' as const, rate: stages[3].dropoffRate },
    ];
    const weakestStage = dropoffRates.reduce((max, current) =>
      current.rate > max.rate ? current : max,
    ).stage;

    // Calculate funnel health score
    const funnelHealth = this.calculateFunnelHealth(stages);

    // Generate recommendation
    const recommendation = this.generateRecommendation(stages, weakestStage, funnelHealth);

    return {
      campaignId,
      campaignName: campaign.name,
      stages,
      overallConversionRate,
      totalDropoff,
      funnelHealth,
      weakestStage,
      recommendation,
    };
  }

  /**
   * Calculate funnel health score (0-100)
   */
  private calculateFunnelHealth(stages: FunnelStage[]): number {
    // Health based on:
    // - CTR (40%)
    // - Landing page retention (20%)
    // - Conversion rate from landing (40%)

    const ctr = stages[1].conversionRate;
    const landingRetention = 100 - stages[2].dropoffRate;
    const landingCVR = stages[2].count > 0 ? (stages[3].count / stages[2].count) * 100 : 0;

    // Score each metric vs benchmark
    const ctrScore = Math.min(100, (ctr / this.BENCHMARKS.ctr) * 100);
    const landingScore = Math.min(100, (landingRetention / this.BENCHMARKS.landingRate) * 100);
    const cvrScore = Math.min(100, (landingCVR / this.BENCHMARKS.cvr) * 100);

    const healthScore = ctrScore * 0.4 + landingScore * 0.2 + cvrScore * 0.4;

    return Math.round(Math.max(0, Math.min(100, healthScore)));
  }

  /**
   * Generate optimization recommendation
   */
  private generateRecommendation(
    stages: FunnelStage[],
    weakestStage: string,
    health: number,
  ): string {
    if (health >= 80) {
      return 'Excellent funnel performance. Continue current strategy and consider scaling.';
    }

    if (weakestStage === 'impression-to-click') {
      const ctr = stages[1].conversionRate;
      if (ctr < 0.5) {
        return `Critical: Very low CTR (${ctr.toFixed(2)}%). Improve ad creative, targeting, and offers.`;
      }
      return `Low CTR (${ctr.toFixed(2)}%). Test new ad creatives and refine targeting.`;
    }

    if (weakestStage === 'click-to-landing') {
      const dropoff = stages[2].dropoffRate;
      return `${dropoff.toFixed(0)}% of clicks don't reach landing page. Check for slow loading, broken links, or ad/page mismatch.`;
    }

    if (weakestStage === 'landing-to-conversion') {
      const landingCVR = stages[2].count > 0 ? (stages[3].count / stages[2].count) * 100 : 0;
      if (landingCVR < 1) {
        return `Critical: Very low landing page CVR (${landingCVR.toFixed(2)}%). Optimize landing page copy, CTA, and trust elements.`;
      }
      return `Low landing page CVR (${landingCVR.toFixed(2)}%). A/B test landing page variations and CTAs.`;
    }

    return 'Funnel needs optimization. Focus on weakest conversion points.';
  }

  /**
   * Compare campaign funnel to benchmarks
   */
  async compareToBenchmarks(campaignId: string): Promise<FunnelBenchmark[]> {
    const analysis = await this.analyzeFunnel(campaignId);

    const ctr = analysis.stages[1].conversionRate;
    const landingRetention = 100 - analysis.stages[2].dropoffRate;
    const landingCVR =
      analysis.stages[2].count > 0 ? (analysis.stages[3].count / analysis.stages[2].count) * 100 : 0;

    return [
      {
        stage: 'Click-Through Rate',
        industryAverage: this.BENCHMARKS.ctr,
        topPerformer: this.BENCHMARKS.ctr * 2,
        yourPerformance: ctr,
        gap: ctr - this.BENCHMARKS.ctr,
      },
      {
        stage: 'Landing Page Retention',
        industryAverage: this.BENCHMARKS.landingRate,
        topPerformer: 98,
        yourPerformance: landingRetention,
        gap: landingRetention - this.BENCHMARKS.landingRate,
      },
      {
        stage: 'Landing to Conversion',
        industryAverage: this.BENCHMARKS.cvr,
        topPerformer: this.BENCHMARKS.cvr * 2.5,
        yourPerformance: landingCVR,
        gap: landingCVR - this.BENCHMARKS.cvr,
      },
    ];
  }

  /**
   * Get funnels that need attention
   */
  async getFunnelsNeedingAttention(): Promise<FunnelAnalysis[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const analyses: FunnelAnalysis[] = [];

    for (const campaign of campaigns) {
      try {
        const analysis = await this.analyzeFunnel(campaign.id);

        // Include if health < 60 or any stage has >80% dropoff
        if (
          analysis.funnelHealth < 60 ||
          analysis.stages.some((s) => s.dropoffRate > 80)
        ) {
          analyses.push(analysis);
        }
      } catch (error) {
        this.logger.warn(`Could not analyze funnel for campaign ${campaign.id}: ${error.message}`);
      }
    }

    // Sort by health (worst first)
    return analyses.sort((a, b) => a.funnelHealth - b.funnelHealth);
  }

  /**
   * Get top performing funnels
   */
  async getTopPerformingFunnels(limit: number = 5): Promise<FunnelAnalysis[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const analyses: FunnelAnalysis[] = [];

    for (const campaign of campaigns) {
      try {
        const analysis = await this.analyzeFunnel(campaign.id);
        analyses.push(analysis);
      } catch (error) {
        this.logger.warn(`Could not analyze funnel for campaign ${campaign.id}: ${error.message}`);
      }
    }

    // Sort by health (best first)
    return analyses.sort((a, b) => b.funnelHealth - a.funnelHealth).slice(0, limit);
  }

  /**
   * Calculate average funnel metrics across all campaigns
   */
  async getAverageFunnelMetrics(): Promise<{
    avgCTR: number;
    avgLandingRetention: number;
    avgConversionRate: number;
    avgFunnelHealth: number;
  }> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    if (campaigns.length === 0) {
      return {
        avgCTR: 0,
        avgLandingRetention: 0,
        avgConversionRate: 0,
        avgFunnelHealth: 0,
      };
    }

    let totalCTR = 0;
    let totalLandingRetention = 0;
    let totalConversionRate = 0;
    let totalHealth = 0;
    let count = 0;

    for (const campaign of campaigns) {
      try {
        const analysis = await this.analyzeFunnel(campaign.id);
        totalCTR += analysis.stages[1].conversionRate;
        totalLandingRetention += 100 - analysis.stages[2].dropoffRate;
        totalConversionRate += analysis.overallConversionRate;
        totalHealth += analysis.funnelHealth;
        count++;
      } catch (error) {
        // Skip failed analyses
      }
    }

    return {
      avgCTR: count > 0 ? totalCTR / count : 0,
      avgLandingRetention: count > 0 ? totalLandingRetention / count : 0,
      avgConversionRate: count > 0 ? totalConversionRate / count : 0,
      avgFunnelHealth: count > 0 ? totalHealth / count : 0,
    };
  }
}
