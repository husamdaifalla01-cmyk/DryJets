/**
 * STRATEGY & ANALYSIS TYPES
 *
 * Type definitions for landscape analysis and marketing strategy.
 */

export interface LandscapeAnalysis {
  id: string;
  profileId: string;
  analyzedAt: string;

  // Market size
  totalAddressableMarket: string; // TAM
  serviceableAddressableMarket: string; // SAM
  serviceableObtainableMarket: string; // SOM

  // Competitors
  competitors: Competitor[];

  // SWOT
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];

  // Content analysis
  contentGaps: ContentGap[];
  trendingTopics: TrendingTopic[];

  // Platform opportunities
  platformOpportunities: PlatformOpportunity[];

  // Recommendations
  recommendations: string[];
  confidenceScore: number; // 0-100
}

export interface Competitor {
  name: string;
  website?: string;
  platforms: string[];
  contentVolume: number;
  avgEngagement: number;
  strengths: string[];
  weaknesses: string[];
  contentStrategy: string;
}

export interface ContentGap {
  topic: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  priority: number; // 1-10
  reason: string;
}

export interface TrendingTopic {
  topic: string;
  volume: number;
  trend: 'rising' | 'stable' | 'falling';
  relevance: number; // 0-100
}

export interface PlatformOpportunity {
  platform: string;
  score: number; // 0-100
  reason: string;
  audienceSize: string;
  competitorPresence: 'low' | 'medium' | 'high';
}

export interface MarketingStrategy {
  id: string;
  profileId: string;
  generatedAt: string;

  // Positioning
  positioning: {
    statement: string;
    differentiators: string[];
    targetSegments: string[];
  };

  // Content strategy
  contentStrategy: {
    pillarTopics: PillarTopic[];
    contentMix: ContentMix;
    postingFrequency: Record<string, number>; // platform -> posts per week
  };

  // Channel strategy
  channelStrategy: {
    primaryChannels: string[];
    secondaryChannels: string[];
    reasonings: Record<string, string>;
  };

  // Campaign roadmap
  campaigns: PlannedCampaign[];

  // Budget
  budgetAllocation: BudgetAllocation[];

  // KPIs
  kpis: KPI[];
}

export interface PillarTopic {
  name: string;
  description: string;
  keywords: string[];
  contentIdeas: string[];
}

export interface ContentMix {
  educational: number; // percentage
  promotional: number;
  engagement: number;
  entertainment: number;
}

export interface PlannedCampaign {
  name: string;
  week: number;
  duration: string;
  description: string;
  contentPieces: number;
  platforms: string[];
  budget: number;
  expectedReach: number;
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
}

export interface KPI {
  metric: string;
  target: string;
  timeframe: string;
}
