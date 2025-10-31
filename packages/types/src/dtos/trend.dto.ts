/**
 * TREND DTOs
 *
 * @description Data Transfer Objects for trend intelligence operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#trend-intelligence-suite
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#trend-apis
 * @useCase UC070-UC079 (Trend Intelligence)
 */

import type { TrendSource, TrendCategory, TrendStatus } from '../marketing/trend.types';

/**
 * Collect Trends DTO
 * @useCase UC070 - Collect Trends
 */
export class CollectTrendsDto {
  /** Sources to collect from */
  sources?: TrendSource[];

  /** Keywords to search */
  keywords?: string[];

  /** Categories to focus on */
  categories?: TrendCategory[];

  /** Location */
  location?: string;

  /** Language */
  language?: string;

  /** Limit per source */
  limitPerSource?: number;
}

/**
 * Collect Google Trends DTO
 * @useCase UC071 - Collect Google Trends
 */
export class CollectGoogleTrendsDto {
  /** Keywords to track */
  keywords: string[];

  /** Geo location */
  geo?: string;

  /** Time range */
  timeRange?: 'now 1-H' | 'now 4-H' | 'now 1-d' | 'now 7-d' | 'today 1-m' | 'today 3-m' | 'today 12-m';

  /** Category */
  category?: number;
}

/**
 * Collect Twitter Trends DTO
 * @useCase UC072 - Collect Twitter Trends
 */
export class CollectTwitterTrendsDto {
  /** Location WOEID */
  woeid?: number;

  /** Limit */
  limit?: number;
}

/**
 * Collect Reddit Trends DTO
 * @useCase UC073 - Collect Reddit Trends
 */
export class CollectRedditTrendsDto {
  /** Subreddits to monitor */
  subreddits?: string[];

  /** Time filter */
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

  /** Limit */
  limit?: number;
}

/**
 * Collect TikTok Trends DTO
 * @useCase UC074 - Collect TikTok Trends
 */
export class CollectTikTokTrendsDto {
  /** Region */
  region?: string;

  /** Limit */
  limit?: number;
}

/**
 * Analyze Trend DTO
 * @useCase UC075 - Analyze Trend
 */
export class AnalyzeTrendDto {
  /** Trend ID */
  trendId: string;

  /** Profile ID for relevance scoring */
  profileId?: string;

  /** Include predictions */
  includePredictions?: boolean;

  /** Include content opportunities */
  includeOpportunities?: boolean;
}

/**
 * Predict Trend DTO
 * @useCase UC076 - Predict Trend
 */
export class PredictTrendDto {
  /** Trend ID */
  trendId: string;

  /** Prediction horizon (days) */
  horizonDays?: number;

  /** Model to use */
  model?: 'linear' | 'exponential' | 'prophet' | 'lstm';
}

/**
 * Detect Weak Signals DTO
 * @useCase UC077 - Detect Weak Signals
 */
export class DetectWeakSignalsDto {
  /** Profile ID */
  profileId: string;

  /** Minimum relevance score */
  minRelevanceScore?: number;

  /** Minimum growth rate */
  minGrowthRate?: number;

  /** Limit */
  limit?: number;
}

/**
 * Get Trend Opportunities DTO
 * @useCase UC078 - Get Trend Opportunities
 */
export class GetTrendOpportunitiesDto {
  /** Profile ID */
  profileId: string;

  /** Urgency filter */
  urgency?: 'critical' | 'high' | 'medium' | 'low';

  /** Status filter */
  status?: 'active' | 'executed' | 'missed' | 'dismissed';

  /** Limit */
  limit?: number;

  /** Sort by */
  sortBy?: 'urgency' | 'estimatedROI' | 'timeRemaining';
}

/**
 * Trend Query Parameters
 */
export class TrendQueryDto {
  source?: TrendSource;
  category?: TrendCategory;
  status?: TrendStatus;
  minVolume?: number;
  minRelevance?: number;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'volume' | 'growthRate' | 'relevance' | 'viralityScore' | 'firstDetected';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Execute Trend Opportunity DTO
 * @useCase UC079 - Execute Trend Opportunity
 */
export class ExecuteTrendOpportunityDto {
  /** Opportunity ID */
  opportunityId: string;

  /** Content ideas to execute */
  contentIdeas?: string[];

  /** Platforms to publish on */
  platforms?: string[];

  /** Whether to schedule or publish immediately */
  publishImmediately?: boolean;

  /** Scheduled time */
  scheduledAt?: string;
}
