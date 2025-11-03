import { Injectable, Logger } from '@nestjs/common';

/**
 * COST CALCULATOR SERVICE
 *
 * Calculates estimated costs for marketing campaigns based on:
 * - Content volume (blogs, videos, social posts)
 * - Platform distribution
 * - AI API usage (Claude, video generation, etc.)
 * - Publishing and automation costs
 *
 * Provides transparent cost breakdowns and ROI projections.
 */

export interface CampaignCostEstimate {
  campaignName: string;
  duration: number; // days

  // Content Costs
  contentCosts: {
    category: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    description: string;
  }[];

  // AI API Costs
  aiCosts: {
    service: string;
    usage: string;
    cost: number;
    description: string;
  }[];

  // Platform Costs
  platformCosts: {
    platform: string;
    posts: number;
    cost: number;
    description: string;
  }[];

  // Labor/Time Costs
  laborCosts: {
    task: string;
    hours: number;
    rate: number;
    totalCost: number;
  }[];

  // Summary
  summary: {
    contentTotal: number;
    aiTotal: number;
    platformTotal: number;
    laborTotal: number;
    subtotal: number;
    buffer: number; // 10% buffer
    totalEstimate: number;
  };

  // ROI Projection
  roiProjection: {
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedLeads: number;
    estimatedRevenue: number;
    roi: number; // percentage
    paybackPeriod: string;
  };

  // Cost Per Metrics
  costPer: {
    perPost: number;
    perReach: number;
    perEngagement: number;
    perLead: number;
  };

  calculatedAt: Date;
}

export interface CostingRules {
  // Content unit costs
  blogPostCost: number; // default: $0 (AI generated)
  videoScriptCost: number; // default: $0 (AI generated)
  socialPostCost: number; // default: $0 (AI generated)

  // AI API costs (per 1K tokens or per generation)
  claudeApiCost: number; // $0.003 per 1K tokens
  videoGenerationCost: number; // $0.50 per video generation
  imageGenerationCost: number; // $0.02 per image

  // Labor costs (if applicable)
  reviewHourlyRate: number; // default: $0 (fully automated)
  editingHourlyRate: number; // default: $0 (fully automated)

  // Platform costs (API/automation)
  platformApiCost: number; // $0 (using free APIs)

  // Buffer percentage
  bufferPercentage: number; // default: 10%

  // ROI assumptions
  avgReachPerPost: number; // default: 500
  engagementRate: number; // default: 2%
  leadConversionRate: number; // default: 1%
  avgLeadValue: number; // default: $100
}

@Injectable()
export class CostCalculatorService {
  private readonly logger = new Logger(CostCalculatorService.name);

  private defaultRules: CostingRules = {
    // Content costs (AI-generated, nearly free)
    blogPostCost: 0.10, // Just AI API cost
    videoScriptCost: 0.05,
    socialPostCost: 0.01,

    // AI API costs
    claudeApiCost: 0.003, // per 1K tokens
    videoGenerationCost: 0.50, // if using video AI
    imageGenerationCost: 0.02, // if using image AI

    // Labor costs (automated, so $0)
    reviewHourlyRate: 0,
    editingHourlyRate: 0,

    // Platform costs
    platformApiCost: 0, // Most platforms have free APIs

    // Buffer
    bufferPercentage: 10,

    // ROI assumptions
    avgReachPerPost: 500,
    engagementRate: 0.02,
    leadConversionRate: 0.01,
    avgLeadValue: 100,
  };

  /**
   * Calculate campaign cost estimate
   */
  async calculateCampaignCost(
    campaign: {
      name: string;
      duration: number; // days
      content: {
        blogs: number;
        videos: number;
        socialPosts: number;
        images: number;
      };
      platforms: string[];
      humanReview?: boolean;
    },
    rules?: Partial<CostingRules>,
  ): Promise<CampaignCostEstimate> {
    this.logger.log(`= Calculating cost for campaign: ${campaign.name}`);

    const costRules = { ...this.defaultRules, ...rules };

    // 1. Content Costs
    const contentCosts = [
      {
        category: 'Blog Posts',
        quantity: campaign.content.blogs,
        unitCost: costRules.blogPostCost,
        totalCost: campaign.content.blogs * costRules.blogPostCost,
        description: 'AI-generated blog posts (1500-2500 words)',
      },
      {
        category: 'Video Scripts',
        quantity: campaign.content.videos,
        unitCost: costRules.videoScriptCost,
        totalCost: campaign.content.videos * costRules.videoScriptCost,
        description: 'AI-generated video scripts and outlines',
      },
      {
        category: 'Social Posts',
        quantity: campaign.content.socialPosts,
        unitCost: costRules.socialPostCost,
        totalCost: campaign.content.socialPosts * costRules.socialPostCost,
        description: 'Platform-optimized social media posts',
      },
    ];

    // 2. AI API Costs
    const aiCosts = [];

    // Claude API usage (estimate 10K tokens per blog, 2K per social post)
    const totalTokens =
      (campaign.content.blogs * 10) +
      (campaign.content.videos * 5) +
      (campaign.content.socialPosts * 2);

    aiCosts.push({
      service: 'Claude API',
      usage: `${totalTokens}K tokens`,
      cost: totalTokens * costRules.claudeApiCost,
      description: 'AI content generation (Claude 3.5 Sonnet)',
    });

    // Video generation costs (if applicable)
    if (campaign.content.videos > 0) {
      aiCosts.push({
        service: 'Video Generation',
        usage: `${campaign.content.videos} videos`,
        cost: campaign.content.videos * costRules.videoGenerationCost,
        description: 'AI video generation (optional)',
      });
    }

    // Image generation costs (if applicable)
    if (campaign.content.images > 0) {
      aiCosts.push({
        service: 'Image Generation',
        usage: `${campaign.content.images} images`,
        cost: campaign.content.images * costRules.imageGenerationCost,
        description: 'AI image generation (optional)',
      });
    }

    // 3. Platform Costs
    const platformCosts = campaign.platforms.map(platform => ({
      platform,
      posts: Math.floor(campaign.content.socialPosts / campaign.platforms.length),
      cost: 0, // Free APIs
      description: 'Free API usage (no platform fees)',
    }));

    // 4. Labor Costs (if human review enabled)
    const laborCosts = [];

    if (campaign.humanReview) {
      const reviewHours = (campaign.content.blogs * 0.25) + (campaign.content.socialPosts * 0.05);
      laborCosts.push({
        task: 'Content Review',
        hours: reviewHours,
        rate: costRules.reviewHourlyRate,
        totalCost: reviewHours * costRules.reviewHourlyRate,
      });
    }

    // 5. Summary
    const contentTotal = contentCosts.reduce((sum, c) => sum + c.totalCost, 0);
    const aiTotal = aiCosts.reduce((sum, c) => sum + c.cost, 0);
    const platformTotal = platformCosts.reduce((sum, c) => sum + c.cost, 0);
    const laborTotal = laborCosts.reduce((sum, c) => sum + c.totalCost, 0);
    const subtotal = contentTotal + aiTotal + platformTotal + laborTotal;
    const buffer = subtotal * (costRules.bufferPercentage / 100);
    const totalEstimate = subtotal + buffer;

    // 6. ROI Projection
    const estimatedReach = campaign.content.socialPosts * costRules.avgReachPerPost;
    const estimatedEngagement = estimatedReach * costRules.engagementRate;
    const estimatedLeads = estimatedEngagement * costRules.leadConversionRate;
    const estimatedRevenue = estimatedLeads * costRules.avgLeadValue;
    const roi = ((estimatedRevenue - totalEstimate) / totalEstimate) * 100;

    // 7. Cost Per Metrics
    const costPer = {
      perPost: totalEstimate / (campaign.content.blogs + campaign.content.videos + campaign.content.socialPosts),
      perReach: totalEstimate / estimatedReach,
      perEngagement: totalEstimate / estimatedEngagement,
      perLead: totalEstimate / estimatedLeads,
    };

    const estimate: CampaignCostEstimate = {
      campaignName: campaign.name,
      duration: campaign.duration,
      contentCosts,
      aiCosts,
      platformCosts,
      laborCosts,
      summary: {
        contentTotal,
        aiTotal,
        platformTotal,
        laborTotal,
        subtotal,
        buffer,
        totalEstimate,
      },
      roiProjection: {
        estimatedReach,
        estimatedEngagement,
        estimatedLeads,
        estimatedRevenue,
        roi,
        paybackPeriod: this.calculatePaybackPeriod(totalEstimate, estimatedRevenue, campaign.duration),
      },
      costPer,
      calculatedAt: new Date(),
    };

    this.logger.log(` Cost calculated: $${totalEstimate.toFixed(2)} | ROI: ${roi.toFixed(0)}%`);

    return estimate;
  }

  /**
   * Quick cost estimate
   */
  async quickEstimate(
    contentVolume: { blogs?: number; videos?: number; social?: number },
    platforms?: number,
  ): Promise<{ total: number; breakdown: string }> {
    const blogs = contentVolume.blogs || 0;
    const videos = contentVolume.videos || 0;
    const social = contentVolume.social || 0;

    const estimate = await this.calculateCampaignCost({
      name: 'Quick Estimate',
      duration: 30,
      content: {
        blogs,
        videos,
        socialPosts: social,
        images: 0,
      },
      platforms: Array(platforms || 3).fill('platform'),
    });

    return {
      total: estimate.summary.totalEstimate,
      breakdown: `AI: $${estimate.summary.aiTotal.toFixed(2)} | Content: $${estimate.summary.contentTotal.toFixed(2)} | Buffer: $${estimate.summary.buffer.toFixed(2)}`,
    };
  }

  /**
   * Compare traditional vs automated costs
   */
  async compareCosts(campaign: {
    name: string;
    duration: number;
    content: any;
    platforms: string[];
  }): Promise<{
    traditional: number;
    automated: number;
    savings: number;
    savingsPercentage: number;
  }> {
    // Automated costs
    const automated = await this.calculateCampaignCost(campaign);

    // Traditional costs (manual content creation)
    const traditionalBlogCost = 200; // $200 per blog post
    const traditionalVideoCost = 500; // $500 per video
    const traditionalSocialCost = 20; // $20 per social post

    const traditional =
      (campaign.content.blogs * traditionalBlogCost) +
      (campaign.content.videos * traditionalVideoCost) +
      (campaign.content.socialPosts * traditionalSocialCost);

    const savings = traditional - automated.summary.totalEstimate;
    const savingsPercentage = (savings / traditional) * 100;

    return {
      traditional,
      automated: automated.summary.totalEstimate,
      savings,
      savingsPercentage,
    };
  }

  /**
   * Calculate monthly budget recommendation
   */
  async recommendMonthlyBudget(
    goals: {
      targetLeads?: number;
      targetRevenue?: number;
      targetReach?: number;
    },
    rules?: Partial<CostingRules>,
  ): Promise<{
    recommendedBudget: number;
    contentVolume: {
      blogs: number;
      videos: number;
      socialPosts: number;
    };
    expectedResults: {
      reach: number;
      leads: number;
      revenue: number;
    };
    breakdown: any;
  }> {
    const costRules = { ...this.defaultRules, ...rules };

    // Calculate content volume needed
    let blogs = 0;
    let videos = 0;
    let socialPosts = 0;

    if (goals.targetLeads) {
      // Work backwards from leads
      const engagementsNeeded = goals.targetLeads / costRules.leadConversionRate;
      const reachNeeded = engagementsNeeded / costRules.engagementRate;
      socialPosts = Math.ceil(reachNeeded / costRules.avgReachPerPost);
      blogs = Math.ceil(socialPosts / 10); // 1 blog per 10 social posts
    } else if (goals.targetReach) {
      socialPosts = Math.ceil(goals.targetReach / costRules.avgReachPerPost);
      blogs = Math.ceil(socialPosts / 10);
    } else {
      // Default recommendation
      blogs = 10;
      socialPosts = 50;
      videos = 2;
    }

    // Calculate costs
    const estimate = await this.calculateCampaignCost({
      name: 'Monthly Budget Estimate',
      duration: 30,
      content: {
        blogs,
        videos,
        socialPosts,
        images: socialPosts,
      },
      platforms: ['twitter', 'linkedin', 'facebook'],
    });

    return {
      recommendedBudget: Math.ceil(estimate.summary.totalEstimate / 100) * 100, // Round to nearest $100
      contentVolume: {
        blogs,
        videos,
        socialPosts,
      },
      expectedResults: {
        reach: estimate.roiProjection.estimatedReach,
        leads: estimate.roiProjection.estimatedLeads,
        revenue: estimate.roiProjection.estimatedRevenue,
      },
      breakdown: estimate.summary,
    };
  }

  /**
   * Calculate payback period
   */
  private calculatePaybackPeriod(cost: number, revenue: number, duration: number): string {
    if (revenue <= cost) {
      return `${duration}+ days`;
    }

    const dailyRevenue = revenue / duration;
    const daysToPayback = Math.ceil(cost / dailyRevenue);

    if (daysToPayback <= 7) return `${daysToPayback} days`;
    if (daysToPayback <= 30) return `${Math.ceil(daysToPayback / 7)} weeks`;
    return `${Math.ceil(daysToPayback / 30)} months`;
  }

  /**
   * Get default costing rules
   */
  getDefaultRules(): CostingRules {
    return this.defaultRules;
  }

  /**
   * Update costing rules
   */
  updateRules(updates: Partial<CostingRules>): CostingRules {
    this.defaultRules = { ...this.defaultRules, ...updates };
    return this.defaultRules;
  }
}
