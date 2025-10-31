/**
 * SEO TYPES
 *
 * @description Type definitions for SEO management and optimization
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#seo-reactor
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#seo-apis
 */

export type SeoPageType = 'homepage' | 'blog' | 'product' | 'landing' | 'category';
export type SeoHealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface SeoPage {
  id: string;
  profileId: string;
  url: string;
  title: string;
  type: SeoPageType;

  // Meta tags
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;

  // Keywords
  primaryKeyword: string;
  secondaryKeywords: string[];

  // Performance
  currentRank?: number;
  targetRank: number;
  traffic: number;
  clicks: number;
  impressions: number;
  ctr: number;

  // Health
  healthStatus: SeoHealthStatus;
  healthScore: number; // 0-100

  // Technical SEO
  loadTime: number;
  mobileScore: number;
  desktopScore: number;

  // Metadata
  lastOptimized?: string;
  lastCrawled?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordResearch {
  id: string;
  profileId: string;
  keyword: string;

  // Search volume
  monthlySearchVolume: number;
  trend: 'rising' | 'stable' | 'falling';
  seasonality: Record<string, number>; // month -> volume

  // Competition
  difficulty: number; // 0-100
  cpc: number; // Cost per click
  competition: 'low' | 'medium' | 'high';

  // Relevance
  relevanceScore: number; // 0-100
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';

  // Related keywords
  relatedKeywords: string[];
  longTailVariants: string[];

  // Recommendations
  recommended: boolean;
  reason?: string;

  // Metadata
  researchedAt: string;
}

export interface RankTracking {
  id: string;
  profileId: string;
  pageId: string;
  keyword: string;

  // Rankings
  currentRank: number;
  previousRank: number;
  change: number;
  bestRank: number;
  worstRank: number;

  // Search engine
  searchEngine: 'google' | 'bing' | 'yahoo';
  location: string;
  device: 'desktop' | 'mobile';

  // History
  history: RankHistory[];

  // Metadata
  lastChecked: string;
  nextCheck: string;
}

export interface RankHistory {
  date: string;
  rank: number;
  url: string;
}

export interface SeoAudit {
  id: string;
  profileId: string;
  auditedAt: string;

  // Overall score
  overallScore: number; // 0-100
  previousScore?: number;

  // Category scores
  technicalScore: number;
  contentScore: number;
  mobileFriendlyScore: number;
  performanceScore: number;
  accessibilityScore: number;

  // Issues
  criticalIssues: SeoIssue[];
  warnings: SeoIssue[];
  recommendations: SeoIssue[];

  // Summary
  pagesAnalyzed: number;
  issuesFound: number;
  issuesFixed: number;
  estimatedImpact: string;
}

export interface SeoIssue {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedPages: string[];
  recommendation: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  fixed: boolean;
  fixedAt?: string;
}

export interface BacklinkProfile {
  id: string;
  profileId: string;
  analyzedAt: string;

  // Overall stats
  totalBacklinks: number;
  totalDomains: number;
  domainAuthority: number;
  trustFlow: number;
  citationFlow: number;

  // Quality breakdown
  dofollowLinks: number;
  nofollowLinks: number;
  toxicLinks: number;

  // Top referring domains
  topDomains: ReferringDomain[];

  // Anchor text distribution
  anchorTexts: AnchorText[];

  // Link velocity
  newLinksLastMonth: number;
  lostLinksLastMonth: number;
  linkVelocityTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface ReferringDomain {
  domain: string;
  domainAuthority: number;
  backlinks: number;
  dofollow: number;
  nofollow: number;
  firstSeen: string;
  lastSeen: string;
}

export interface AnchorText {
  text: string;
  count: number;
  percentage: number;
  type: 'branded' | 'exact' | 'partial' | 'generic' | 'naked';
}
