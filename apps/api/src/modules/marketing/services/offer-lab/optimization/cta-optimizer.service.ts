import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * CTA Optimizer Service
 *
 * Optimizes call-to-action elements:
 * - Tests different CTA copy variations
 * - Analyzes CTA performance
 * - Provides data-driven recommendations
 * - Generates high-converting CTA suggestions
 */

export interface CTAVariation {
  text: string;
  style: 'urgent' | 'benefit' | 'action' | 'curiosity' | 'social-proof';
  score: number; // 0-100 predicted effectiveness
}

export interface CTARecommendation {
  campaignId: string;
  campaignName: string;
  currentPerformance: number; // Current CVR
  recommendations: CTAVariation[];
  expectedLift: number; // % improvement
  reasoning: string;
}

@Injectable()
export class CTAOptimizerService {
  private readonly logger = new Logger(CTAOptimizerService.name);

  // High-performing CTA templates by category
  private readonly CTA_TEMPLATES = {
    urgent: [
      'Get {offer} Now - Limited Time!',
      'Claim Your {offer} Today',
      'Act Fast - Only {number} Left',
      'Last Chance: Get {offer}',
      'Ends Soon: Grab {offer} Now',
    ],
    benefit: [
      'Get {benefit} in {timeframe}',
      'Start {action} {benefit} Today',
      'Unlock {benefit} Now',
      'Yes! I Want {benefit}',
      'Get Instant Access to {benefit}',
    ],
    action: [
      'Start Your Free Trial',
      'Download Now',
      'Get Started Free',
      'Try It Risk-Free',
      'See How It Works',
    ],
    curiosity: [
      'Discover {benefit}',
      'See Why {number}+ Users Love This',
      'Find Out How',
      'Learn the Secret to {benefit}',
      'Reveal {benefit}',
    ],
    'social-proof': [
      'Join {number}+ Happy Users',
      'See What Others Are Saying',
      'Used by {number}+ Professionals',
      'Trusted by {category} Leaders',
      'Join the Movement',
    ],
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate CTA recommendations for a campaign
   */
  async generateCTARecommendations(campaignId: string): Promise<CTARecommendation> {
    this.logger.log(`Generating CTA recommendations for campaign: ${campaignId}`);

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

    // Calculate current performance
    const totals = campaign.metrics.reduce(
      (acc, m) => ({
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
      }),
      { clicks: 0, conversions: 0 },
    );

    const currentPerformance = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    // Determine campaign characteristics
    const characteristics = this.analyzeCampaignCharacteristics(campaign, currentPerformance);

    // Generate tailored CTA variations
    const recommendations = this.generateVariations(characteristics);

    // Calculate expected lift
    const expectedLift = this.calculateExpectedLift(currentPerformance, recommendations);

    // Generate reasoning
    const reasoning = this.generateReasoning(characteristics, currentPerformance);

    return {
      campaignId,
      campaignName: campaign.name,
      currentPerformance,
      recommendations,
      expectedLift,
      reasoning,
    };
  }

  /**
   * Analyze campaign characteristics
   */
  private analyzeCampaignCharacteristics(campaign: any, cvr: number): {
    performance: 'low' | 'medium' | 'high';
    needsUrgency: boolean;
    needsBenefitFocus: boolean;
    needsSocialProof: boolean;
  } {
    const performance = cvr < 1 ? 'low' : cvr < 3 ? 'medium' : 'high';

    return {
      performance,
      needsUrgency: cvr < 2, // Low CVR needs urgency
      needsBenefitFocus: cvr < 3, // Medium CVR needs clearer benefits
      needsSocialProof: cvr < 1.5, // Very low CVR needs trust building
    };
  }

  /**
   * Generate CTA variations based on characteristics
   */
  private generateVariations(characteristics: any): CTAVariation[] {
    const variations: CTAVariation[] = [];

    // Always include action-oriented CTA
    variations.push({
      text: 'Get Started Now',
      style: 'action',
      score: 75,
    });

    // Add urgent CTAs for low performance
    if (characteristics.needsUrgency) {
      variations.push({
        text: 'Claim Your Offer Now - Limited Time!',
        style: 'urgent',
        score: 85,
      });
      variations.push({
        text: 'Act Fast - Start Today',
        style: 'urgent',
        score: 80,
      });
    }

    // Add benefit-focused CTAs
    if (characteristics.needsBenefitFocus) {
      variations.push({
        text: 'Get Instant Results',
        style: 'benefit',
        score: 82,
      });
      variations.push({
        text: 'Unlock Your Benefits Today',
        style: 'benefit',
        score: 78,
      });
    }

    // Add social proof CTAs for trust issues
    if (characteristics.needsSocialProof) {
      variations.push({
        text: 'Join 10,000+ Happy Customers',
        style: 'social-proof',
        score: 88,
      });
      variations.push({
        text: 'See Why Thousands Trust Us',
        style: 'social-proof',
        score: 84,
      });
    }

    // Add curiosity-based CTAs
    variations.push({
      text: 'Discover How',
      style: 'curiosity',
      score: 76,
    });

    // Sort by score (highest first)
    return variations.sort((a, b) => b.score - a.score).slice(0, 5); // Top 5
  }

  /**
   * Calculate expected lift from CTA optimization
   */
  private calculateExpectedLift(currentCVR: number, variations: CTAVariation[]): number {
    if (currentCVR === 0) return 50; // If no baseline, estimate 50% lift

    // Top CTA typically lifts 15-30% over poorly performing CTAs
    const topScore = variations[0]?.score || 75;
    const baselineScore = 60; // Assume current CTA scores 60/100

    const liftPercentage = ((topScore - baselineScore) / baselineScore) * 100;

    return Math.round(Math.min(50, Math.max(10, liftPercentage))); // Cap between 10-50%
  }

  /**
   * Generate reasoning for recommendations
   */
  private generateReasoning(characteristics: any, cvr: number): string {
    if (characteristics.performance === 'low') {
      return `Current CVR is low (${cvr.toFixed(2)}%). Recommended CTAs focus on urgency, social proof, and clear benefits to overcome visitor hesitation and build trust.`;
    }

    if (characteristics.performance === 'medium') {
      return `Moderate CVR (${cvr.toFixed(2)}%). Recommended CTAs emphasize benefits and action to push performance higher. Test urgent CTAs for quick wins.`;
    }

    return `Good CVR (${cvr.toFixed(2)}%). Recommended CTAs fine-tune messaging for incremental improvements. Focus on benefit clarity and social proof.`;
  }

  /**
   * Get all campaigns needing CTA optimization
   */
  async getCampaignsNeedingCTAOptimization(): Promise<CTARecommendation[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const recommendations: CTARecommendation[] = [];

    for (const campaign of campaigns) {
      try {
        const rec = await this.generateCTARecommendations(campaign.id);

        // Include if CVR < 3% (has room for improvement)
        if (rec.currentPerformance < 3) {
          recommendations.push(rec);
        }
      } catch (error) {
        this.logger.warn(
          `Could not generate CTA recommendations for campaign ${campaign.id}: ${error.message}`,
        );
      }
    }

    // Sort by expected lift (highest first)
    return recommendations.sort((a, b) => b.expectedLift - a.expectedLift);
  }

  /**
   * Generate custom CTA for specific offer/benefit
   */
  generateCustomCTA(params: {
    offer?: string;
    benefit?: string;
    timeframe?: string;
    number?: string;
    action?: string;
    style: 'urgent' | 'benefit' | 'action' | 'curiosity' | 'social-proof';
  }): string[] {
    const templates = this.CTA_TEMPLATES[params.style] || this.CTA_TEMPLATES.action;

    return templates.map((template) => {
      let cta = template;

      if (params.offer) cta = cta.replace('{offer}', params.offer);
      if (params.benefit) cta = cta.replace('{benefit}', params.benefit);
      if (params.timeframe) cta = cta.replace('{timeframe}', params.timeframe);
      if (params.number) cta = cta.replace(/{number}/g, params.number);
      if (params.action) cta = cta.replace('{action}', params.action);

      // Remove unreplaced placeholders
      cta = cta.replace(/\{[^}]+\}/g, '');

      return cta;
    });
  }

  /**
   * Get CTA best practices
   */
  getBestPractices(): {
    category: string;
    practices: string[];
  }[] {
    return [
      {
        category: 'Copy Guidelines',
        practices: [
          'Use action verbs (Get, Start, Claim, Unlock)',
          'Keep it short (2-5 words ideal)',
          'Create urgency without being pushy',
          'Focus on benefit, not features',
          'Make it personal ("your" not "the")',
        ],
      },
      {
        category: 'Design Guidelines',
        practices: [
          'Use contrasting colors',
          'Make button large enough to click easily',
          'Add white space around CTA',
          'Use arrow or pointer for direction',
          'Test button vs. text link',
        ],
      },
      {
        category: 'Placement Guidelines',
        practices: [
          'Above the fold for high-intent traffic',
          'After key benefits for cold traffic',
          'Multiple CTAs on long pages',
          'Sticky CTA for mobile',
          'Exit-intent popup for leaving visitors',
        ],
      },
      {
        category: 'Testing Guidelines',
        practices: [
          'Test one element at a time',
          'Run test for at least 100 conversions',
          'Test during similar traffic conditions',
          'Measure beyond click rate (full funnel)',
          'Document and iterate on winners',
        ],
      },
    ];
  }
}
