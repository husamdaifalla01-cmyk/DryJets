/**
 * SEO DTOs
 *
 * @description Data Transfer Objects for SEO operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#seo-reactor
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#seo-apis
 * @useCase UC060-UC069 (SEO Management)
 */

import type { SeoPageType, SeoHealthStatus } from '../marketing/seo.types';

/**
 * Create SEO Page DTO
 * @useCase UC060 - Add Page to SEO Tracking
 */
export class CreateSeoPageDto {
  /** Page URL */
  url: string;

  /** Page title */
  title: string;

  /** Page type */
  type: SeoPageType;

  /** Meta title */
  metaTitle: string;

  /** Meta description */
  metaDescription: string;

  /** Canonical URL */
  canonicalUrl?: string;

  /** Primary keyword */
  primaryKeyword: string;

  /** Secondary keywords */
  secondaryKeywords?: string[];

  /** Target rank */
  targetRank?: number;
}

/**
 * Update SEO Page DTO
 * @useCase UC061 - Update SEO Page
 */
export class UpdateSeoPageDto {
  url?: string;
  title?: string;
  type?: SeoPageType;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  targetRank?: number;
}

/**
 * Keyword Research DTO
 * @useCase UC062 - Research Keywords
 */
export class KeywordResearchDto {
  /** Seed keywords */
  keywords: string[];

  /** Industry/niche */
  industry?: string;

  /** Target location */
  location?: string;

  /** Language */
  language?: string;

  /** Competitor URLs */
  competitorUrls?: string[];

  /** Minimum search volume */
  minSearchVolume?: number;

  /** Maximum difficulty */
  maxDifficulty?: number;
}

/**
 * Analyze Keyword DTO
 * @useCase UC063 - Analyze Keyword
 */
export class AnalyzeKeywordDto {
  /** Keyword to analyze */
  keyword: string;

  /** Target location */
  location?: string;

  /** Target language */
  language?: string;
}

/**
 * Track Rank DTO
 * @useCase UC064 - Track Keyword Rank
 */
export class TrackRankDto {
  /** Page ID */
  pageId: string;

  /** Keyword to track */
  keyword: string;

  /** Search engine */
  searchEngine?: 'google' | 'bing' | 'yahoo';

  /** Location */
  location?: string;

  /** Device */
  device?: 'desktop' | 'mobile';
}

/**
 * Run SEO Audit DTO
 * @useCase UC065 - Run SEO Audit
 */
export class RunSeoAuditDto {
  /** Profile ID */
  profileId: string;

  /** URLs to audit */
  urls?: string[];

  /** Whether to crawl entire site */
  crawlEntireSite?: boolean;

  /** Maximum pages to crawl */
  maxPages?: number;

  /** Depth of crawl */
  depth?: number;
}

/**
 * Fix SEO Issue DTO
 * @useCase UC066 - Fix SEO Issue
 */
export class FixSeoIssueDto {
  /** Issue ID */
  issueId: string;

  /** Fix description */
  fixDescription?: string;

  /** Whether to auto-fix */
  autoFix?: boolean;
}

/**
 * Analyze Backlinks DTO
 * @useCase UC067 - Analyze Backlinks
 */
export class AnalyzeBacklinksDto {
  /** Profile ID */
  profileId: string;

  /** Domain to analyze */
  domain?: string;

  /** Include historical data */
  includeHistory?: boolean;

  /** Date range */
  dateFrom?: string;
  dateTo?: string;
}

/**
 * SEO Query Parameters
 */
export class SeoQueryDto {
  type?: SeoPageType;
  healthStatus?: SeoHealthStatus;
  keyword?: string;
  minRank?: number;
  maxRank?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rank' | 'traffic' | 'healthScore' | 'lastOptimized';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get SEO Recommendations DTO
 * @useCase UC068 - Get SEO Recommendations
 */
export class GetSeoRecommendationsDto {
  /** Page ID */
  pageId?: string;

  /** Profile ID */
  profileId?: string;

  /** Priority level */
  priority?: 'critical' | 'high' | 'medium' | 'low';

  /** Limit */
  limit?: number;
}

/**
 * Optimize Page DTO
 * @useCase UC069 - Optimize Page
 */
export class OptimizePageDto {
  /** Page ID */
  pageId: string;

  /** Target keyword */
  targetKeyword?: string;

  /** Auto-apply recommendations */
  autoApply?: boolean;

  /** Specific optimizations to apply */
  optimizations?: Array<'title' | 'meta-description' | 'headings' | 'content' | 'images' | 'links'>;
}
