/**
 * OFFER-LAB TYPES
 *
 * @description Type definitions for the Offer-Lab affiliate marketing automation engine
 * @module @dryjets/types/marketing/offer-lab
 */

// ============================================
// PHASE 1: AFFILIATE INTELLIGENCE + FUNNELS
// ============================================

/**
 * Scraper execution log
 */
export interface ScraperLog {
  id: string;
  network: AffiliateNetwork;
  status: ScraperStatus;
  offersFound: number;
  errorMessage?: string;
  duration?: number; // milliseconds
  createdAt: string;
}

/**
 * Affiliate offer imported from networks
 */
export interface Offer {
  id: string;
  network: AffiliateNetwork;
  externalId: string;
  title: string;
  category: string[];
  description?: string;
  epc: number; // Earnings per click
  payout: number;
  currency: string;
  conversionRate?: number;
  geoTargets: string[];
  allowedTraffic: TrafficType[];
  creativeUrls: string[];
  previewUrl?: string;
  terms?: string;
  score: number; // 0-100
  trackingLink?: string;
  activatedAt?: string;
  status: OfferStatus;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generated funnel for an offer
 */
export interface Funnel {
  id: string;
  offerId: string;
  offer?: Offer; // Optional populated relation
  templateUsed: FunnelTemplate;
  headline: string;
  subheadline?: string;
  heroImageUrl?: string;
  bodyContent: string; // HTML
  ctaText: string;
  ctaUrl: string;
  leadMagnetId?: string;
  leadMagnet?: LeadMagnet; // Optional populated relation
  fleschScore?: number;
  ctrEstimate?: number;
  status: FunnelStatus;
  publishedAt?: string;
  views: number;
  clicks: number;
  leads: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lead magnet (PDF, checklist, etc.)
 */
export interface LeadMagnet {
  id: string;
  title: string;
  description?: string;
  format: LeadMagnetFormat;
  fileUrl: string;
  fileSize?: number; // bytes
  downloads: number;
  createdAt: string;
}

/**
 * Lead captured through a funnel
 */
export interface FunnelLead {
  id: string;
  funnelId: string;
  funnel?: Funnel; // Optional populated relation
  email: string;
  firstName?: string;
  lastName?: string;
  ipAddress?: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
}

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type AffiliateNetwork =
  | 'maxbounty'
  | 'clickbank'
  | 'digistore24'
  | 'cj'
  | 'awin'
  | 'rakuten'
  | 'shareasale'
  | 'partnerstack'
  | 'impact'
  | 'flexoffers';

export type ScraperStatus = 'success' | 'error' | 'timeout';

export type OfferStatus =
  | 'pending'
  | 'testing'
  | 'paused'
  | 'scaling'
  | 'inactive';

export type TrafficType =
  | 'email'
  | 'social'
  | 'search'
  | 'display'
  | 'native'
  | 'push'
  | 'pop';

export type FunnelTemplate =
  | 'aida-standard'
  | 'vsl-short'
  | 'vsl-long'
  | 'listicle'
  | 'case-study'
  | 'quiz'
  | 'comparison';

export type FunnelStatus = 'draft' | 'published' | 'archived';

export type LeadMagnetFormat = 'pdf' | 'html' | 'doc' | 'checklist';

// ============================================
// SCORING & ANALYSIS
// ============================================

/**
 * Offer scoring breakdown
 */
export interface OfferScore {
  total: number; // 0-100
  breakdown: {
    epcScore: number; // Weight: 0.4
    payoutScore: number; // Weight: 0.25
    conversionScore: number; // Weight: 0.2
    geoScore: number; // Weight: 0.1
    reliabilityScore: number; // Weight: 0.05
  };
}

/**
 * Funnel generation options
 */
export interface FunnelGenerationOptions {
  offerId: string;
  template?: FunnelTemplate;
  includeLeadMagnet?: boolean;
  targetGeo?: string;
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
  length?: 'short' | 'medium' | 'long';
}

/**
 * Funnel performance metrics
 */
export interface FunnelPerformance {
  funnelId: string;
  views: number;
  clicks: number;
  leads: number;
  ctr: number; // Click-through rate
  conversionRate: number; // Lead capture rate
  revenue?: number;
  roi?: number;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Sync offers request
 */
export interface SyncOffersRequest {
  network: AffiliateNetwork;
  forceRefresh?: boolean;
}

/**
 * Sync offers response
 */
export interface SyncOffersResponse {
  success: boolean;
  network: AffiliateNetwork;
  offersFound: number;
  offersNew: number;
  offersUpdated: number;
  duration: number;
  logId: string;
}

/**
 * Update tracking link request
 */
export interface UpdateTrackingLinkRequest {
  offerId: string;
  trackingLink: string;
}

/**
 * Generate funnel request
 */
export interface GenerateFunnelRequest {
  offerId: string;
  options?: FunnelGenerationOptions;
}

/**
 * Capture lead request (public endpoint)
 */
export interface CaptureLeadRequest {
  funnelId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Generate lead magnet request
 */
export interface GenerateLeadMagnetRequest {
  title: string;
  description?: string;
  format: LeadMagnetFormat;
  content?: string; // Optional pre-filled content
  offerId?: string; // Generate based on offer
}

/**
 * Paginated offers response
 */
export interface PaginatedOffers {
  offers: Offer[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Paginated funnels response
 */
export interface PaginatedFunnels {
  funnels: Funnel[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Paginated leads response
 */
export interface PaginatedLeads {
  leads: FunnelLead[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FILTERS & QUERY PARAMS
// ============================================

/**
 * Offer filters
 */
export interface OfferFilters {
  network?: AffiliateNetwork | AffiliateNetwork[];
  status?: OfferStatus | OfferStatus[];
  minScore?: number;
  maxScore?: number;
  minPayout?: number;
  category?: string | string[];
  geoTarget?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'score' | 'payout' | 'epc' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Funnel filters
 */
export interface FunnelFilters {
  status?: FunnelStatus | FunnelStatus[];
  offerId?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'views' | 'clicks' | 'leads' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Lead filters
 */
export interface LeadFilters {
  funnelId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// SETTINGS & CONFIGURATION
// ============================================

/**
 * Offer-Lab system settings
 */
export interface OfferLabSettings {
  id: string;
  globalBudgetCap: number;
  defaultTestBudget: number;
  syncFrequency: number; // hours
  autoSyncEnabled: boolean;
  killSwitchActive: boolean;
  enabledNetworks: AffiliateNetwork[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Network adapter configuration
 */
export interface NetworkAdapterConfig {
  network: AffiliateNetwork;
  baseUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  isSandbox: boolean;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}
