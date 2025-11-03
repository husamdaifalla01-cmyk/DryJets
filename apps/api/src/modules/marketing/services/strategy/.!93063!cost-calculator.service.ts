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
