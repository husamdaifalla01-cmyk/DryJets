import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Drop-off Detector Service
 *
 * Identifies specific funnel drop-off points and diagnoses causes:
 * - High bounce rate points
 * - Unusual exit patterns
 * - Technical issues (slow loading, errors)
 * - User experience problems
 */

export interface DropoffPoint {
  stage: string;
  dropoffRate: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedLostConversions: number;
  estimatedLostRevenue: number;
  likelyCauses: string[];
  recommendations: string[];
}

export interface DropoffAnalysis {
  campaignId: string;
  campaignName: string;
  totalDropoff: number;
  dropoffPoints: DropoffPoint[];
  priorityFix: DropoffPoint;
  potentialRevenueRecovery: number;
}

@Injectable()
export class DropoffDetectorService {
  private readonly logger = new Logger(DropoffDetectorService.name);

  // Dropoff severity thresholds
  private readonly THRESHOLDS = {
    critical: 80, // >80% dropoff
    high: 60, // >60% dropoff
    medium: 40, // >40% dropoff
    low: 20, // >20% dropoff
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Detect dropoff points for a campaign
   */
  async detectDropoffs(campaignId: string): Promise<DropoffAnalysis> {
    this.logger.log(`Detecting dropoff points for campaign: ${campaignId}`);

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
        revenue: acc.revenue + parseFloat(m.revenue?.toString() || '0'),
      }),
      { impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    );

    const dropoffPoints: DropoffPoint[] = [];

    // Dropoff 1: Impression → Click
    if (totals.impressions > 0) {
      const dropoffRate = ((totals.impressions - totals.clicks) / totals.impressions) * 100;
      const ctr = (totals.clicks / totals.impressions) * 100;
      const avgCVR = totals.clicks > 0 ? totals.conversions / totals.clicks : 0;
      const lostClicks = totals.impressions - totals.clicks;
      const estimatedLostConversions = lostClicks * avgCVR;
      const avgRevenuePerConversion =
        totals.conversions > 0 ? totals.revenue / totals.conversions : 0;
      const estimatedLostRevenue = estimatedLostConversions * avgRevenuePerConversion;

      const likelyCauses: string[] = [];
      const recommendations: string[] = [];

      if (ctr < 0.5) {
        likelyCauses.push('Very low CTR - ad creative not compelling');
        likelyCauses.push('Poor targeting - wrong audience');
        likelyCauses.push('Weak value proposition');
        recommendations.push('A/B test new ad creatives with stronger hooks');
        recommendations.push('Refine audience targeting');
        recommendations.push('Highlight unique selling points in ad copy');
      } else if (ctr < 1.0) {
        likelyCauses.push('Below-average CTR');
        likelyCauses.push('Ad creative needs improvement');
        recommendations.push('Test variations of ad imagery and headlines');
        recommendations.push('Add urgency or scarcity elements');
      }

      dropoffPoints.push({
        stage: 'Impression → Click',
        dropoffRate,
        severity: this.determineSeverity(dropoffRate),
        estimatedLostConversions,
        estimatedLostRevenue,
        likelyCauses,
        recommendations,
      });
    }

    // Dropoff 2: Click → Landing Page
    if (totals.clicks > 0) {
      const landingPageVisits = Math.floor(totals.clicks * 0.95); // Assume 95% reach landing
      const dropoffRate = ((totals.clicks - landingPageVisits) / totals.clicks) * 100;
      const avgCVR = landingPageVisits > 0 ? totals.conversions / landingPageVisits : 0;
      const lostVisits = totals.clicks - landingPageVisits;
      const estimatedLostConversions = lostVisits * avgCVR;
      const avgRevenuePerConversion =
        totals.conversions > 0 ? totals.revenue / totals.conversions : 0;
      const estimatedLostRevenue = estimatedLostConversions * avgRevenuePerConversion;

      const likelyCauses: string[] = [];
      const recommendations: string[] = [];

      if (dropoffRate > 10) {
        likelyCauses.push('Slow landing page load time');
        likelyCauses.push('Broken or incorrect landing page URL');
        likelyCauses.push('Ad blocker or redirect issues');
        recommendations.push('Check landing page load speed');
        recommendations.push('Verify landing page URL is correct');
        recommendations.push('Test landing page across devices and browsers');
      }

      dropoffPoints.push({
        stage: 'Click → Landing',
        dropoffRate,
        severity: this.determineSeverity(dropoffRate),
        estimatedLostConversions,
        estimatedLostRevenue,
        likelyCauses,
        recommendations,
      });
    }

    // Dropoff 3: Landing → Conversion
    const landingPageVisits = Math.floor(totals.clicks * 0.95);
    if (landingPageVisits > 0) {
      const dropoffRate = ((landingPageVisits - totals.conversions) / landingPageVisits) * 100;
      const landingCVR = (totals.conversions / landingPageVisits) * 100;
      const lostVisitors = landingPageVisits - totals.conversions;
      const estimatedLostConversions = lostVisitors * 0.03; // Assume 3% could convert
      const avgRevenuePerConversion =
        totals.conversions > 0 ? totals.revenue / totals.conversions : 0;
      const estimatedLostRevenue = estimatedLostConversions * avgRevenuePerConversion;

      const likelyCauses: string[] = [];
      const recommendations: string[] = [];

      if (landingCVR < 1) {
        likelyCauses.push('Weak landing page copy');
        likelyCauses.push('Unclear or weak call-to-action');
        likelyCauses.push('Lack of trust signals');
        likelyCauses.push('Ad-to-page message mismatch');
        recommendations.push('Rewrite landing page headline and copy');
        recommendations.push('Make CTA more prominent and compelling');
        recommendations.push('Add testimonials, reviews, or trust badges');
        recommendations.push('Ensure ad promise matches landing page content');
      } else if (landingCVR < 3) {
        likelyCauses.push('Below-average conversion rate');
        likelyCauses.push('CTA placement or design issues');
        likelyCauses.push('Form friction (too many fields)');
        recommendations.push('A/B test different CTA buttons');
        recommendations.push('Simplify form fields');
        recommendations.push('Add social proof above the fold');
      }

      dropoffPoints.push({
        stage: 'Landing → Conversion',
        dropoffRate,
        severity: this.determineSeverity(dropoffRate),
        estimatedLostConversions,
        estimatedLostRevenue,
        likelyCauses,
        recommendations,
      });
    }

    // Calculate totals
    const totalDropoff =
      totals.impressions > 0 ? ((totals.impressions - totals.conversions) / totals.impressions) * 100 : 100;
    const potentialRevenueRecovery = dropoffPoints.reduce(
      (sum, dp) => sum + dp.estimatedLostRevenue,
      0,
    );

    // Identify priority fix (highest severity + revenue impact)
    const priorityFix = this.determinePriorityFix(dropoffPoints);

    return {
      campaignId,
      campaignName: campaign.name,
      totalDropoff,
      dropoffPoints,
      priorityFix,
      potentialRevenueRecovery,
    };
  }

  /**
   * Determine severity level
   */
  private determineSeverity(dropoffRate: number): 'critical' | 'high' | 'medium' | 'low' {
    if (dropoffRate >= this.THRESHOLDS.critical) return 'critical';
    if (dropoffRate >= this.THRESHOLDS.high) return 'high';
    if (dropoffRate >= this.THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  /**
   * Determine priority fix
   */
  private determinePriorityFix(dropoffPoints: DropoffPoint[]): DropoffPoint {
    const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };

    return dropoffPoints.reduce((priority, current) => {
      const priorityScore =
        severityScores[priority.severity] * 1000 + priority.estimatedLostRevenue;
      const currentScore = severityScores[current.severity] * 1000 + current.estimatedLostRevenue;
      return currentScore > priorityScore ? current : priority;
    });
  }

  /**
   * Get campaigns with critical dropoffs
   */
  async getCriticalDropoffs(): Promise<DropoffAnalysis[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const criticalCampaigns: DropoffAnalysis[] = [];

    for (const campaign of campaigns) {
      try {
        const analysis = await this.detectDropoffs(campaign.id);

        // Include if any dropoff point is critical
        if (analysis.dropoffPoints.some((dp) => dp.severity === 'critical')) {
          criticalCampaigns.push(analysis);
        }
      } catch (error) {
        this.logger.warn(`Could not analyze dropoffs for campaign ${campaign.id}: ${error.message}`);
      }
    }

    // Sort by potential revenue recovery (highest first)
    return criticalCampaigns.sort(
      (a, b) => b.potentialRevenueRecovery - a.potentialRevenueRecovery,
    );
  }

  /**
   * Get revenue recovery opportunities
   */
  async getRevenueRecoveryOpportunities(): Promise<{
    totalPotentialRevenue: number;
    opportunities: Array<{
      campaignId: string;
      campaignName: string;
      stage: string;
      potentialRevenue: number;
      quickWins: string[];
    }>;
  }> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const opportunities: Array<{
      campaignId: string;
      campaignName: string;
      stage: string;
      potentialRevenue: number;
      quickWins: string[];
    }> = [];

    for (const campaign of campaigns) {
      try {
        const analysis = await this.detectDropoffs(campaign.id);

        for (const dropoff of analysis.dropoffPoints) {
          if (dropoff.estimatedLostRevenue > 100) {
            // Only include if >$100 potential
            opportunities.push({
              campaignId: analysis.campaignId,
              campaignName: analysis.campaignName,
              stage: dropoff.stage,
              potentialRevenue: dropoff.estimatedLostRevenue,
              quickWins: dropoff.recommendations.slice(0, 2), // Top 2 recommendations
            });
          }
        }
      } catch (error) {
        // Skip failed analyses
      }
    }

    // Sort by revenue (highest first)
    opportunities.sort((a, b) => b.potentialRevenue - a.potentialRevenue);

    const totalPotentialRevenue = opportunities.reduce((sum, opp) => sum + opp.potentialRevenue, 0);

    return {
      totalPotentialRevenue,
      opportunities: opportunities.slice(0, 10), // Top 10
    };
  }
}
