import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';
import {
  Campaign,
  CampaignType,
  CampaignStatus,
} from '@dryjets/database';

/**
 * Campaign Memory Seeding Service
 * Generates 5,000 realistic campaigns spanning 2021-2024 with learned patterns
 *
 * Success/Failure Distribution:
 * - 30% High Success (ROI 6-12x)
 * - 50% Moderate Success (ROI 2-5x)
 * - 20% Failed (ROI 0.3-1.5x)
 *
 * Campaign Categories (mapped to schema types):
 * - AWARENESS (Brand awareness, SEO content): 40%
 * - ENGAGEMENT (Social media, community): 30%
 * - CONVERSION (Paid ads, email): 25%
 * - RETENTION (Loyalty, re-engagement): 5%
 */

interface SeededCampaign {
  name: string;
  type: CampaignType;
  categoryDetail: string; // SEO, Social, Video, Email, Paid
  budget: number;
  roi: number;
  startDate: Date;
  endDate: Date;
  platforms: string[]; // ['meta', 'google', 'linkedin', 'tiktok', etc.]
  contentCount: number;
  reach: number; // impressions
  engagement: number; // likes, shares, comments
  conversions: number;
  revenue: number;
  spend: number;
  successTier: 'HIGH' | 'MODERATE' | 'FAILED';
  whatWorked: string[];
  whatDidnt: string[];
  patterns: string[];
  recommendations: string[];
}

@Injectable()
export class CampaignSeedingService {
  private readonly logger = new Logger('CampaignSeeding');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate and seed 5,000 campaigns with realistic patterns
   */
  async seedCampaigns(count: number = 5000): Promise<{
    seeded: number;
    highSuccess: number;
    moderate: number;
    failed: number;
  }> {
    this.logger.log(`Starting campaign seeding: ${count} campaigns`);

    let highSuccessCount = 0;
    let moderateCount = 0;
    let failedCount = 0;

    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const campaignsToGenerate = Math.min(batchSize, count - batch * batchSize);
      const campaigns: SeededCampaign[] = [];

      for (let i = 0; i < campaignsToGenerate; i++) {
        const campaign = this.generateRealisticCampaign(batch * batchSize + i);
        campaigns.push(campaign);

        // Track distribution
        if (campaign.successTier === 'HIGH') highSuccessCount++;
        else if (campaign.successTier === 'MODERATE') moderateCount++;
        else failedCount++;
      }

      // Insert batch into database
      await this.insertCampaignBatch(campaigns);

      this.logger.log(
        `Seeded batch ${batch + 1}/${batches} (${campaigns.length} campaigns)`,
      );

      // Small delay to avoid overwhelming database
      await this.sleep(100);
    }

    this.logger.log(
      `Campaign seeding complete: ${count} campaigns seeded`,
    );
    this.logger.log(
      `Distribution: High ${highSuccessCount}, Moderate ${moderateCount}, Failed ${failedCount}`,
    );

    return {
      seeded: count,
      highSuccess: highSuccessCount,
      moderate: moderateCount,
      failed: failedCount,
    };
  }

  /**
   * Generate a single realistic campaign
   */
  private generateRealisticCampaign(index: number): SeededCampaign {
    // 1. Determine success tier (30% high, 50% moderate, 20% failed)
    const rand = Math.random();
    const successTier: 'HIGH' | 'MODERATE' | 'FAILED' =
      rand < 0.3 ? 'HIGH' : rand < 0.8 ? 'MODERATE' : 'FAILED';

    // 2. Choose campaign type and category (AWARENESS: 40%, ENGAGEMENT: 30%, CONVERSION: 25%, RETENTION: 5%)
    const { type, categoryDetail } = this.selectCampaignType();

    // 3. Generate budget (power law distribution: most $1K-5K, few $20K-50K)
    const budget = this.generateBudget();

    // 4. Generate realistic date range (2021-2024)
    const { startDate, endDate } = this.generateDateRange();

    // 5. Determine ROI based on success tier
    const roi = this.generateROI(successTier, budget, categoryDetail, startDate);

    // 6. Select platforms based on campaign category
    const platforms = this.selectPlatforms(categoryDetail, successTier);

    // 7. Generate correlated metrics
    const metrics = this.generateCorrelatedMetrics(
      budget,
      roi,
      categoryDetail,
      successTier,
    );

    // 8. Encode success/failure patterns
    const patterns = this.generatePatterns(successTier, categoryDetail, startDate);

    // 9. Generate campaign name
    const name = this.generateCampaignName(categoryDetail, index, startDate);

    return {
      name,
      type,
      categoryDetail,
      budget,
      roi,
      startDate,
      endDate,
      platforms,
      contentCount: metrics.contentCount,
      reach: metrics.reach,
      engagement: metrics.engagement,
      conversions: metrics.conversions,
      revenue: metrics.revenue,
      spend: budget,
      successTier,
      whatWorked: patterns.whatWorked,
      whatDidnt: patterns.whatDidnt,
      patterns: patterns.patterns,
      recommendations: patterns.recommendations,
    };
  }

  /**
   * Select campaign type with weighted distribution
   */
  private selectCampaignType(): { type: CampaignType; categoryDetail: string } {
    const rand = Math.random();

    // AWARENESS: 40% (SEO, content marketing)
    if (rand < 0.40) {
      const categories = ['SEO_CONTENT', 'BLOG', 'CONTENT_MARKETING', 'PR'];
      return {
        type: CampaignType.AWARENESS,
        categoryDetail: categories[Math.floor(Math.random() * categories.length)],
      };
    }

    // ENGAGEMENT: 30% (Social media)
    if (rand < 0.70) {
      const categories = ['SOCIAL_MEDIA', 'VIDEO', 'COMMUNITY', 'INFLUENCER'];
      return {
        type: CampaignType.ENGAGEMENT,
        categoryDetail: categories[Math.floor(Math.random() * categories.length)],
      };
    }

    // CONVERSION: 25% (Paid ads, email)
    if (rand < 0.95) {
      const categories = ['PAID_ADS', 'EMAIL', 'LANDING_PAGE', 'FUNNEL'];
      return {
        type: CampaignType.CONVERSION,
        categoryDetail: categories[Math.floor(Math.random() * categories.length)],
      };
    }

    // RETENTION: 5% (Loyalty, re-engagement)
    const categories = ['LOYALTY', 'RE_ENGAGEMENT', 'UPSELL'];
    return {
      type: CampaignType.RETENTION,
      categoryDetail: categories[Math.floor(Math.random() * categories.length)],
    };
  }

  /**
   * Generate budget following power law distribution
   */
  private generateBudget(): number {
    // Power law: most campaigns $1K-5K, few $20K-50K
    const alpha = 2.5;
    const min = 500;
    const max = 50000;

    const u = Math.random();
    const budget = min * Math.pow(max / min, u ** (1 / alpha));

    return Math.round(budget);
  }

  /**
   * Generate realistic date range (2021-2024)
   */
  private generateDateRange(): { startDate: Date; endDate: Date } {
    // Random start date between Jan 2021 and Nov 2024
    const start = new Date('2021-01-01');
    const end = new Date('2024-11-01');
    const range = end.getTime() - start.getTime();
    const randomTime = start.getTime() + Math.random() * range;
    const startDate = new Date(randomTime);

    // Campaign duration: 14-90 days
    const durationDays = Math.floor(Math.random() * 76) + 14;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    return { startDate, endDate };
  }

  /**
   * Generate ROI based on success tier, budget, category, and seasonality
   */
  private generateROI(
    successTier: 'HIGH' | 'MODERATE' | 'FAILED',
    budget: number,
    categoryDetail: string,
    startDate: Date,
  ): number {
    // Base ROI by tier
    let baseROI: number;
    if (successTier === 'HIGH') {
      baseROI = 6 + Math.random() * 6; // 6-12x
    } else if (successTier === 'MODERATE') {
      baseROI = 2 + Math.random() * 3; // 2-5x
    } else {
      baseROI = 0.3 + Math.random() * 1.2; // 0.3-1.5x
    }

    // Seasonality adjustment
    const month = startDate.getMonth();
    let seasonalityMultiplier = 1.0;

    // Q4 boost (Oct-Dec)
    if (month >= 9 && month <= 11) {
      seasonalityMultiplier = 1.4;
    }
    // Summer dip (Jun-Aug)
    else if (month >= 5 && month <= 7) {
      seasonalityMultiplier = 0.75;
    }
    // Back-to-school boost (Sep)
    else if (month === 8) {
      seasonalityMultiplier = 1.2;
    }

    // Apply seasonality
    baseROI *= seasonalityMultiplier;

    // Category-specific adjustment
    const categoryMultipliers: Record<string, number> = {
      SEO_CONTENT: 1.2, // SEO has better long-term ROI
      SOCIAL_MEDIA: 1.0,
      VIDEO: 0.9, // Video is expensive
      EMAIL: 1.3, // Email has high ROI
      PAID_ADS: 0.8, // Paid ads have lower ROI
      INFLUENCER: 1.1,
      BLOG: 1.15,
      CONTENT_MARKETING: 1.1,
      PR: 1.0,
      COMMUNITY: 0.95,
      LANDING_PAGE: 1.05,
      FUNNEL: 1.2,
      LOYALTY: 1.4, // Retention has highest ROI
      RE_ENGAGEMENT: 1.3,
      UPSELL: 1.25,
    };

    baseROI *= categoryMultipliers[categoryDetail] || 1.0;

    // Budget diminishing returns (higher budget ≠ proportional ROI)
    if (budget > 20000) {
      baseROI *= 0.85;
    } else if (budget > 10000) {
      baseROI *= 0.95;
    }

    // Add variance (±30%)
    const variance = 0.7 + Math.random() * 0.6; // 0.7-1.3
    baseROI *= variance;

    return Math.max(0.1, Math.round(baseROI * 100) / 100);
  }

  /**
   * Select platforms based on campaign category and success tier
   */
  private selectPlatforms(
    categoryDetail: string,
    successTier: string,
  ): string[] {
    const platformSets: Record<string, string[][]> = {
      SEO_CONTENT: [
        ['google', 'blog'],
        ['google', 'blog', 'linkedin', 'medium'],
        ['google', 'blog', 'linkedin'],
      ],
      SOCIAL_MEDIA: [
        ['meta', 'instagram'],
        ['meta', 'instagram', 'tiktok', 'twitter', 'linkedin'],
        ['meta', 'instagram', 'tiktok'],
      ],
      VIDEO: [
        ['youtube', 'tiktok'],
        ['youtube', 'tiktok', 'instagram', 'linkedin'],
        ['youtube'],
      ],
      EMAIL: [
        ['email'],
        ['email', 'linkedin'],
        ['email', 'meta'],
      ],
      PAID_ADS: [
        ['google', 'meta'],
        ['google', 'meta', 'instagram', 'linkedin'],
        ['google'],
      ],
      INFLUENCER: [
        ['instagram', 'tiktok'],
        ['instagram', 'tiktok', 'youtube'],
      ],
      BLOG: [
        ['blog', 'linkedin'],
        ['blog', 'linkedin', 'twitter', 'medium'],
      ],
      CONTENT_MARKETING: [
        ['google', 'blog', 'linkedin'],
        ['google', 'blog', 'linkedin', 'twitter', 'medium'],
      ],
      PR: [
        ['blog', 'linkedin', 'twitter'],
        ['blog', 'linkedin', 'twitter', 'meta'],
      ],
      COMMUNITY: [
        ['discord', 'reddit'],
        ['discord', 'reddit', 'slack'],
      ],
      LANDING_PAGE: [
        ['google', 'meta'],
        ['google', 'meta', 'linkedin'],
      ],
      FUNNEL: [
        ['google', 'email'],
        ['google', 'email', 'meta'],
      ],
      LOYALTY: [
        ['email', 'app'],
        ['email', 'app', 'sms'],
      ],
      RE_ENGAGEMENT: [
        ['email'],
        ['email', 'sms', 'push'],
      ],
      UPSELL: [
        ['email', 'app'],
        ['email', 'app', 'retargeting'],
      ],
    };

    const options = platformSets[categoryDetail] || [['google']];

    // High success campaigns use more platforms (multi-platform)
    if (successTier === 'HIGH' && options.length > 1) {
      return options[1]; // Choose the multi-platform option
    } else if (successTier === 'MODERATE' && options.length > 2) {
      return options[2]; // Choose moderate platforms
    } else {
      return options[0]; // Choose minimal platforms (common in failed campaigns)
    }
  }

  /**
   * Generate correlated metrics based on budget and ROI
   */
  private generateCorrelatedMetrics(
    budget: number,
    roi: number,
    categoryDetail: string,
    successTier: string,
  ): {
    contentCount: number;
    reach: number;
    engagement: number;
    conversions: number;
    revenue: number;
  } {
    // Revenue is determined by budget * ROI
    const revenue = budget * roi;

    // Content count based on budget and category
    let contentCount: number;
    if (categoryDetail.includes('SEO') || categoryDetail.includes('BLOG')) {
      contentCount = Math.floor(budget / 50); // ~$50 per piece
    } else if (categoryDetail.includes('SOCIAL')) {
      contentCount = Math.floor(budget / 15); // ~$15 per post
    } else if (categoryDetail === 'VIDEO') {
      contentCount = Math.floor(budget / 500); // ~$500 per video
    } else if (categoryDetail === 'EMAIL') {
      contentCount = Math.floor(budget / 200); // ~$200 per email campaign
    } else {
      contentCount = Math.floor(budget / 100);
    }
    contentCount = Math.max(1, contentCount);

    // Reach (impressions) scales with budget and success
    const baseReach = budget * 100; // $1 = 100 impressions
    const successMultiplier =
      successTier === 'HIGH' ? 3 : successTier === 'MODERATE' ? 1.5 : 0.5;
    const reach = Math.floor(baseReach * successMultiplier);

    // Engagement varies by campaign category (1-10% of reach)
    const engagementRateByCategory: Record<string, number> = {
      SEO_CONTENT: 0.02, // 2% engagement
      SOCIAL_MEDIA: 0.04, // 4% engagement
      VIDEO: 0.06, // 6% engagement (higher for video)
      EMAIL: 0.15, // 15% open rate
      PAID_ADS: 0.01, // 1% engagement
      INFLUENCER: 0.08,
      BLOG: 0.03,
      CONTENT_MARKETING: 0.03,
      PR: 0.02,
      COMMUNITY: 0.12,
      LANDING_PAGE: 0.05,
      FUNNEL: 0.08,
      LOYALTY: 0.20,
      RE_ENGAGEMENT: 0.18,
      UPSELL: 0.15,
    };

    const baseEngagementRate = engagementRateByCategory[categoryDetail] || 0.03;
    const engagementVariance = 0.5 + Math.random(); // 0.5-1.5x
    const engagementRate = baseEngagementRate * engagementVariance;

    const engagement = Math.floor(reach * engagementRate);

    // Conversion rate (2-10% of engagement)
    const baseConversionRate =
      successTier === 'HIGH' ? 0.08 : successTier === 'MODERATE' ? 0.04 : 0.015;
    const conversionVariance = 0.7 + Math.random() * 0.6;
    const conversionRate = baseConversionRate * conversionVariance;

    const conversions = Math.floor(engagement * conversionRate);

    return {
      contentCount,
      reach,
      engagement,
      conversions,
      revenue: Math.round(revenue),
    };
  }

  /**
   * Generate success/failure patterns based on tier
   */
  private generatePatterns(
    successTier: 'HIGH' | 'MODERATE' | 'FAILED',
    categoryDetail: string,
    startDate: Date,
  ): {
    whatWorked: string[];
    whatDidnt: string[];
    patterns: string[];
    recommendations: string[];
  } {
    const month = startDate.getMonth();
    const isQ4 = month >= 9 && month <= 11;
    const isSummer = month >= 5 && month <= 7;

    if (successTier === 'HIGH') {
      // High success campaigns
      const whatWorked = [
        'Early trend adoption captured market opportunity',
        'Long-form comprehensive content drove engagement',
        'Consistent multi-platform posting schedule',
        'Strong multi-channel distribution strategy',
        'A/B testing optimized conversion rates',
        'High-quality visuals and professional creative',
        'Clear and compelling call-to-action',
        'Mobile-optimized user experience',
      ];

      // Select 4-6 random success factors
      const selectedWorked = this.selectRandom(whatWorked, 4, 6);

      // Add seasonal success if Q4
      if (isQ4) {
        selectedWorked.push('Strategic Q4 timing captured high-intent traffic');
      }

      const patterns = [
        `${categoryDetail === 'SEO_CONTENT' ? 'Long-form SEO content' : 'Engaging content'} drove ${Math.floor(60 + Math.random() * 20)}% of results`,
        `Multi-platform approach increased reach by ${Math.floor(150 + Math.random() * 100)}%`,
        'Early trend adoption provided competitive advantage',
        'Consistent posting built sustained audience growth',
        'Data-driven optimization improved performance over time',
      ];

      const recommendations = [
        'Replicate successful multi-platform strategy in future campaigns',
        'Maintain consistent content quality and posting schedule',
        'Continue investing in A/B testing and optimization',
        'Expand winning content formats and channels',
        'Document and share best practices across team',
      ];

      return {
        whatWorked: selectedWorked,
        whatDidnt: [],
        patterns: this.selectRandom(patterns, 3, 5),
        recommendations: this.selectRandom(recommendations, 3, 5),
      };
    } else if (successTier === 'MODERATE') {
      // Moderate success campaigns
      const whatWorked = [
        'Decent content quality achieved baseline results',
        'Regular posting schedule maintained audience',
        'Some multi-channel presence expanded reach',
        'Basic optimization improved performance',
        'Responsive engagement built community',
      ];

      const whatDidnt = [
        'Limited A/B testing missed optimization opportunities',
        'Content length could have been more comprehensive',
        'Posting frequency not optimized for algorithm',
        'Missed some trending opportunities',
        'Single-platform focus limited potential reach',
      ];

      const patterns = [
        'Solid execution but room for improvement',
        'Would benefit from more systematic testing',
        'Multi-channel expansion could increase reach',
        'Content quality competitive but not exceptional',
      ];

      const recommendations = [
        'Increase content depth and quality for better performance',
        'Implement systematic A/B testing program',
        'Expand to additional high-potential channels',
        'Develop more consistent posting cadence',
        'Invest in better creative and production quality',
      ];

      return {
        whatWorked: this.selectRandom(whatWorked, 2, 4),
        whatDidnt: this.selectRandom(whatDidnt, 2, 4),
        patterns: this.selectRandom(patterns, 2, 3),
        recommendations: this.selectRandom(recommendations, 3, 5),
      };
    } else {
      // Failed campaigns
      const whatDidnt = [
        'Late trend adoption missed opportunity window',
        'Thin content quality failed to engage audience',
        'Inconsistent posting disrupted momentum',
        'Single-platform focus severely limited reach',
        'No A/B testing or optimization performed',
        'Poor call-to-action placement hurt conversions',
        'Generic messaging failed to differentiate',
        'Insufficient budget allocation for category',
        'Poor timing relative to market conditions',
      ];

      // Add seasonal failure if summer
      if (isSummer) {
        whatDidnt.push('Summer timing faced low audience intent');
      }

      const patterns = [
        'Execution quality below industry standards',
        'Lack of systematic approach to optimization',
        'Insufficient resource allocation',
        'Poor understanding of platform algorithms',
        'Missed fundamental best practices',
      ];

      const recommendations = [
        'Adopt trends 7-14 days earlier for maximum impact',
        'Invest in comprehensive, high-quality content',
        'Establish consistent multi-platform presence',
        'Implement systematic A/B testing framework',
        'Increase budget to competitive levels',
        'Study successful campaigns for proven patterns',
        'Avoid launching major campaigns during low-intent periods',
      ];

      return {
        whatWorked: [],
        whatDidnt: this.selectRandom(whatDidnt, 4, 7),
        patterns: this.selectRandom(patterns, 3, 5),
        recommendations: this.selectRandom(recommendations, 4, 7),
      };
    }
  }

  /**
   * Generate campaign name
   */
  private generateCampaignName(
    categoryDetail: string,
    index: number,
    startDate: Date,
  ): string {
    const month = startDate.toLocaleString('default', { month: 'short' });
    const year = startDate.getFullYear();
    const quarter = `Q${Math.floor(startDate.getMonth() / 3) + 1}`;

    const themes = [
      'Brand Awareness',
      'Lead Generation',
      'Product Launch',
      'Seasonal Promotion',
      'Engagement Boost',
      'Authority Building',
      'Traffic Growth',
      'Conversion Optimization',
      'Retention Campaign',
      'Awareness Drive',
    ];

    const theme = themes[index % themes.length];

    return `${quarter} ${year} ${theme} - ${categoryDetail}`;
  }

  /**
   * Insert batch of campaigns into database
   */
  private async insertCampaignBatch(
    campaigns: SeededCampaign[],
  ): Promise<void> {
    for (const campaign of campaigns) {
      try {
        // Create campaign
        const createdCampaign = await this.prisma.campaign.create({
          data: {
            name: campaign.name,
            type: campaign.type,
            status: CampaignStatus.COMPLETED,
            platforms: campaign.platforms, // Json field
            budgetTotal: campaign.budget,
            targetAudience: {
              type: 'general',
              category: campaign.categoryDetail,
            },
            aiGenerated: true,
            aiAgent: 'seeding',
            createdAt: campaign.startDate,
            updatedAt: campaign.endDate,
          },
        });

        // Create campaign metrics
        await this.prisma.campaignMetric.create({
          data: {
            campaignId: createdCampaign.id,
            date: campaign.endDate,
            channel: campaign.platforms[0], // Primary channel
            impressions: campaign.reach,
            clicks: campaign.engagement,
            conversions: campaign.conversions,
            spend: campaign.spend,
            revenue: campaign.revenue,
          },
        });

        // Create campaign memory (lessons learned)
        await this.prisma.campaignMemory.create({
          data: {
            campaignId: createdCampaign.id,
            campaignName: campaign.name,
            objective: campaign.type.toLowerCase(),
            campaignType: campaign.categoryDetail.toLowerCase(),
            execution: {
              startDate: campaign.startDate.toISOString(),
              endDate: campaign.endDate.toISOString(),
              platforms: campaign.platforms,
              contentCount: campaign.contentCount,
              successTier: campaign.successTier,
            },
            reach: campaign.reach,
            engagement: campaign.engagement,
            conversions: campaign.conversions,
            revenue: campaign.revenue,
            spend: campaign.spend,
            roi: campaign.roi,
            whatWorked: campaign.whatWorked,
            whatDidnt: campaign.whatDidnt,
            patterns: campaign.patterns,
            recommendations: campaign.recommendations,
            confidence: campaign.successTier === 'HIGH' ? 90 : campaign.successTier === 'MODERATE' ? 70 : 40,
            aiInsights: this.generateAIInsights(campaign),
          },
        });
      } catch (error) {
        this.logger.error(`Failed to insert campaign: ${error.message}`);
        // Continue with next campaign
      }
    }
  }

  /**
   * Generate AI insights for campaign
   */
  private generateAIInsights(campaign: SeededCampaign): string {
    if (campaign.successTier === 'HIGH') {
      return `This ${campaign.categoryDetail} campaign achieved exceptional ${campaign.roi}x ROI through ${campaign.whatWorked.length} key success factors. The multi-platform strategy across ${campaign.platforms.join(', ')} platforms generated ${campaign.reach.toLocaleString()} reach and ${campaign.conversions} conversions. This represents a blueprint for future high-performing campaigns.`;
    } else if (campaign.successTier === 'MODERATE') {
      return `This campaign achieved moderate ${campaign.roi}x ROI. While ${campaign.whatWorked.length} factors contributed to success, ${campaign.whatDidnt.length} areas need improvement. Implementing the recommendations could potentially increase ROI to 3-5x range.`;
    } else {
      return `This campaign underperformed with ${campaign.roi}x ROI due to ${campaign.whatDidnt.length} critical execution gaps. Key lessons: ${campaign.recommendations.slice(0, 2).join(', ')}. Future campaigns should address these fundamental issues to achieve positive ROI.`;
    }
  }

  /**
   * Helper: Select random items from array
   */
  private selectRandom<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Helper: Sleep for ms
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get seeding summary statistics
   */
  async getSeedingSummary(): Promise<{
    totalCampaigns: number;
    avgROI: number;
    successRate: number;
    totalRevenue: number;
    totalSpend: number;
    campaignsByType: Record<string, number>;
  }> {
    const campaigns = await this.prisma.campaign.findMany({
      include: {
        campaignMetrics: true,
      },
    });

    const memories = await this.prisma.campaignMemory.findMany();

    const totalCampaigns = campaigns.length;
    const avgROI =
      memories.reduce((sum, m) => sum + (m.roi?.toNumber() || 0), 0) /
      Math.max(memories.length, 1);
    const successfulCampaigns = memories.filter(
      (m) => (m.roi?.toNumber() || 0) >= 2,
    ).length;
    const successRate = (successfulCampaigns / Math.max(totalCampaigns, 1)) * 100;
    const totalRevenue = memories.reduce(
      (sum, m) => sum + m.revenue.toNumber(),
      0,
    );
    const totalSpend = memories.reduce((sum, m) => sum + m.spend.toNumber(), 0);

    const campaignsByType: Record<string, number> = {};
    campaigns.forEach((c) => {
      campaignsByType[c.type] = (campaignsByType[c.type] || 0) + 1;
    });

    return {
      totalCampaigns,
      avgROI: Math.round(avgROI * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      totalRevenue: Math.round(totalRevenue),
      totalSpend: Math.round(totalSpend),
      campaignsByType,
    };
  }
}
