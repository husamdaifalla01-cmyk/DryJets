import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsEmail,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum AffiliateNetworkEnum {
  MAXBOUNTY = 'maxbounty',
  CLICKBANK = 'clickbank',
  DIGISTORE24 = 'digistore24',
  CJ = 'cj',
  AWIN = 'awin',
  RAKUTEN = 'rakuten',
  SHAREASALE = 'shareasale',
  PARTNERSTACK = 'partnerstack',
  IMPACT = 'impact',
  FLEXOFFERS = 'flexoffers',
}

export enum OfferStatusEnum {
  PENDING = 'pending',
  TESTING = 'testing',
  PAUSED = 'paused',
  SCALING = 'scaling',
  INACTIVE = 'inactive',
}

export enum FunnelTemplateEnum {
  AIDA_STANDARD = 'aida-standard',
  VSL_SHORT = 'vsl-short',
  VSL_LONG = 'vsl-long',
  LISTICLE = 'listicle',
  CASE_STUDY = 'case-study',
  QUIZ = 'quiz',
  COMPARISON = 'comparison',
}

export enum FunnelStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum LeadMagnetFormatEnum {
  PDF = 'pdf',
  HTML = 'html',
  DOC = 'doc',
  CHECKLIST = 'checklist',
}

// ============================================
// PHASE 1: AFFILIATE INTELLIGENCE
// ============================================

/**
 * Sync offers from affiliate network
 */
export class SyncOffersDto {
  @IsEnum(AffiliateNetworkEnum)
  network: AffiliateNetworkEnum;

  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}

/**
 * Query/filter offers
 */
export class QueryOffersDto {
  @IsOptional()
  @IsEnum(AffiliateNetworkEnum)
  network?: AffiliateNetworkEnum;

  @IsOptional()
  @IsEnum(OfferStatusEnum)
  status?: OfferStatusEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPayout?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  geoTarget?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(['score', 'payout', 'epc', 'createdAt'])
  sortBy?: 'score' | 'payout' | 'epc' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

/**
 * Update offer tracking link (after manual activation)
 */
export class UpdateTrackingLinkDto {
  @IsString()
  @MinLength(10)
  @IsUrl()
  trackingLink: string;
}

/**
 * Update offer status
 */
export class UpdateOfferStatusDto {
  @IsEnum(OfferStatusEnum)
  status: OfferStatusEnum;
}

// ============================================
// PHASE 1: FUNNEL GENERATION
// ============================================

/**
 * Generate funnel for an offer
 */
export class GenerateFunnelDto {
  @IsString()
  offerId: string;

  @IsOptional()
  @IsEnum(FunnelTemplateEnum)
  template?: FunnelTemplateEnum;

  @IsOptional()
  @IsBoolean()
  includeLeadMagnet?: boolean;

  @IsOptional()
  @IsString()
  targetGeo?: string;

  @IsOptional()
  @IsIn(['professional', 'casual', 'urgent', 'friendly'])
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';

  @IsOptional()
  @IsIn(['short', 'medium', 'long'])
  length?: 'short' | 'medium' | 'long';
}

/**
 * Query/filter funnels
 */
export class QueryFunnelsDto {
  @IsOptional()
  @IsEnum(FunnelStatusEnum)
  status?: FunnelStatusEnum;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(['views', 'clicks', 'leads', 'createdAt'])
  sortBy?: 'views' | 'clicks' | 'leads' | 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

/**
 * Update funnel
 */
export class UpdateFunnelDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subheadline?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  heroImageUrl?: string;

  @IsOptional()
  @IsString()
  bodyContent?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  ctaText?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  ctaUrl?: string;

  @IsOptional()
  @IsString()
  leadMagnetId?: string;

  @IsOptional()
  @IsEnum(FunnelStatusEnum)
  status?: FunnelStatusEnum;
}

/**
 * Publish funnel
 */
export class PublishFunnelDto {
  @IsOptional()
  @IsBoolean()
  overrideValidation?: boolean; // Allow publishing even if tracking link is missing
}

// ============================================
// PHASE 1: LEAD CAPTURE
// ============================================

/**
 * Capture lead (public endpoint)
 */
export class CaptureLeadDto {
  @IsString()
  funnelId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;
}

/**
 * Query/filter leads
 */
export class QueryLeadsDto {
  @IsOptional()
  @IsString()
  funnelId?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  startDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  endDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

// ============================================
// PHASE 1: LEAD MAGNETS
// ============================================

/**
 * Generate lead magnet
 */
export class GenerateLeadMagnetDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(LeadMagnetFormatEnum)
  format: LeadMagnetFormatEnum;

  @IsOptional()
  @IsString()
  content?: string; // Pre-filled content

  @IsOptional()
  @IsString()
  offerId?: string; // Generate based on offer
}

// ============================================
// PHASE 1: SETTINGS
// ============================================

/**
 * Update Offer-Lab settings
 */
export class UpdateOfferLabSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  globalBudgetCap?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultTestBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168) // Max 1 week
  syncFrequency?: number; // hours

  @IsOptional()
  @IsBoolean()
  autoSyncEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  killSwitchActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(AffiliateNetworkEnum, { each: true })
  enabledNetworks?: AffiliateNetworkEnum[];
}

// ============================================
// PHASE 2: TRAFFIC DEPLOYMENT
// ============================================

export enum TrafficNetworkEnum {
  POPADS = 'popads',
  PROPELLERADS = 'propellerads',
}

export enum CampaignStatusEnum {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error',
}

/**
 * Create traffic connection
 */
export class CreateTrafficConnectionDto {
  @IsEnum(TrafficNetworkEnum)
  network: TrafficNetworkEnum;

  @IsString()
  @MinLength(10)
  apiKey: string;

  @IsOptional()
  @IsBoolean()
  isSandbox?: boolean;
}

/**
 * Launch campaign
 */
export class LaunchCampaignDto {
  @IsString()
  offerId: string;

  @IsString()
  funnelId: string;

  @IsString()
  connectionId: string;

  @IsArray()
  @IsString({ each: true })
  targetGeos: string[];

  @IsNumber()
  @Min(5)
  @Max(1000)
  dailyBudget: number;

  @IsOptional()
  @IsArray()
  @IsIn(['desktop', 'mobile', 'tablet'], { each: true })
  targetDevices?: string[];
}

/**
 * Query campaigns
 */
export class QueryCampaignsDto {
  @IsOptional()
  @IsEnum(CampaignStatusEnum)
  status?: CampaignStatusEnum;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsString()
  connectionId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(['createdAt', 'dailyBudget', 'totalSpent'])
  sortBy?: 'createdAt' | 'dailyBudget' | 'totalSpent';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pause campaign
 */
export class PauseCampaignDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  reason: string;
}

/**
 * Postback handler (public endpoint)
 */
export class PostbackDto {
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @IsOptional()
  @IsString()
  click_id?: string;

  @IsOptional()
  @IsString()
  lead_id?: string;

  @IsOptional()
  @IsString()
  payout?: string;

  @IsOptional()
  @IsIn(['approved', 'pending', 'rejected'])
  status?: 'approved' | 'pending' | 'rejected';

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  offer_id?: string;
}
