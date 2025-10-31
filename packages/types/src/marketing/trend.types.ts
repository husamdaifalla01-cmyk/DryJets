/**
 * TREND TYPES
 *
 * @description Type definitions for trend intelligence and analysis
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#trend-intelligence-suite
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#trend-apis
 */

export type TrendSource = 'google' | 'twitter' | 'reddit' | 'youtube' | 'tiktok' | 'news';
export type TrendStatus = 'rising' | 'peaked' | 'declining' | 'stable';
export type TrendCategory =
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'health'
  | 'politics'
  | 'sports'
  | 'lifestyle'
  | 'science'
  | 'other';

export interface Trend {
  id: string;
  profileId?: string;
  topic: string;
  source: TrendSource;
  category: TrendCategory;
  status: TrendStatus;

  // Metrics
  volume: number;
  growthRate: number; // percentage
  viralityScore: number; // 0-100
  relevanceScore: number; // 0-100 (to profile)

  // Analysis
  sentiment: 'positive' | 'neutral' | 'negative';
  demographics: TrendDemographics;
  geography: TrendGeography[];

  // Content opportunity
  contentOpportunity: number; // 0-100
  estimatedReach: number;
  competitionLevel: 'low' | 'medium' | 'high';

  // Keywords and hashtags
  keywords: string[];
  hashtags: string[];
  relatedTopics: string[];

  // Prediction
  predictedPeak?: string;
  predictedDuration?: number; // days
  confidence: number; // 0-100

  // Metadata
  firstDetected: string;
  lastUpdated: string;
  expiresAt?: string;
}

export interface TrendDemographics {
  age: Record<string, number>; // age group -> percentage
  gender: Record<string, number>;
  interests: string[];
}

export interface TrendGeography {
  country: string;
  region?: string;
  volume: number;
  percentage: number;
}

export interface WeakSignal {
  id: string;
  profileId: string;
  topic: string;
  source: TrendSource;

  // Early indicators
  volume: number;
  growthRate: number;
  momentum: number; // Rate of acceleration

  // Analysis
  potentialImpact: 'high' | 'medium' | 'low';
  relevanceScore: number; // 0-100
  confidenceLevel: number; // 0-100

  // Recommendations
  recommendedAction: 'monitor' | 'investigate' | 'capitalize' | 'ignore';
  actionableInsights: string[];

  // Metadata
  detectedAt: string;
  status: 'active' | 'investigating' | 'validated' | 'dismissed';
}

export interface TrendOpportunity {
  id: string;
  trendId: string;
  profileId: string;

  // Opportunity details
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  estimatedROI: number;

  // Content recommendations
  contentIdeas: ContentIdea[];
  targetPlatforms: string[];
  targetAudience: string;

  // Timing
  optimalPublishWindow: {
    start: string;
    end: string;
  };
  timeRemaining: number; // hours until opportunity expires

  // Metadata
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'executed' | 'missed' | 'dismissed';
}

export interface ContentIdea {
  title: string;
  description: string;
  format: string; // blog, video, tweet, etc.
  keywords: string[];
  estimatedReach: number;
  estimatedEngagement: number;
}

export interface TrendPrediction {
  id: string;
  trendId: string;

  // Prediction
  predictedVolume: number;
  predictedPeak: string;
  predictedDuration: number; // days
  confidence: number; // 0-100

  // Model info
  modelUsed: string;
  modelAccuracy: number;
  predictionMadeAt: string;

  // Actual vs predicted (once trend completes)
  actualVolume?: number;
  actualPeak?: string;
  actualDuration?: number;
  predictionAccuracy?: number;
}

export interface TrendAnalysis {
  id: string;
  profileId: string;
  analyzedAt: string;
  timeRange: {
    start: string;
    end: string;
  };

  // Overview
  totalTrends: number;
  risingTrends: number;
  decliningTrends: number;
  opportunitiesFound: number;

  // Top trends
  topTrends: Trend[];
  urgentOpportunities: TrendOpportunity[];
  weakSignals: WeakSignal[];

  // Insights
  industryShifts: string[];
  competitorActivity: string[];
  recommendations: string[];

  // Performance
  trendsCapitalized: number;
  avgReachFromTrends: number;
  trendContentPerformance: number; // 0-100
}
