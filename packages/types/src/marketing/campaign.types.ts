/**
 * CAMPAIGN TYPES
 *
 * @description Type definitions for marketing campaigns and campaign management
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#campaign-orchestrator
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#campaign-apis
 */

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignType = 'launch' | 'awareness' | 'engagement' | 'conversion' | 'retention';
export type CampaignPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Campaign {
  id: string;
  profileId: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  priority: CampaignPriority;

  // Schedule
  startDate: string;
  endDate: string;
  timezone: string;

  // Budget
  budget: number;
  spent: number;
  currency: string;

  // Targeting
  targetAudience: string;
  targetPlatforms: string[];
  targetGeographies?: string[];

  // Content
  contentCount: number;
  publishedCount: number;

  // Performance
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CampaignMetrics {
  campaignId: string;
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  conversions: number;
  conversionRate: number;
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  platformBreakdown: PlatformMetrics[];
  contentPerformance: ContentPerformance[];
}

export interface PlatformMetrics {
  platform: string;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  platform: string;
  publishedAt: string;
  impressions: number;
  clicks: number;
  engagement: number;
  conversionRate: number;
  score: number; // Performance score 0-100
}
