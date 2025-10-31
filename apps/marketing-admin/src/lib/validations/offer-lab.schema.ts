import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const affiliateNetworkSchema = z.enum([
  'maxbounty',
  'clickbank',
  'digistore24',
  'cj',
  'awin',
  'rakuten',
  'shareasale',
  'partnerstack',
  'impact',
  'flexoffers',
]);

export const offerStatusSchema = z.enum(['pending', 'testing', 'paused', 'scaling', 'inactive']);

export const funnelTemplateSchema = z.enum([
  'aida-standard',
  'vsl-short',
  'vsl-long',
  'listicle',
  'case-study',
  'quiz',
  'comparison',
]);

export const funnelStatusSchema = z.enum(['draft', 'published', 'archived']);

export const leadMagnetFormatSchema = z.enum(['pdf', 'html', 'doc', 'checklist']);

// ============================================
// SYNC OFFERS
// ============================================

export const syncOffersSchema = z.object({
  network: affiliateNetworkSchema,
  forceRefresh: z.boolean().optional(),
});

export type SyncOffersFormData = z.infer<typeof syncOffersSchema>;

// ============================================
// UPDATE TRACKING LINK
// ============================================

export const updateTrackingLinkSchema = z.object({
  trackingLink: z.string().url('Must be a valid URL').min(10, 'Tracking link is too short'),
});

export type UpdateTrackingLinkFormData = z.infer<typeof updateTrackingLinkSchema>;

// ============================================
// GENERATE FUNNEL
// ============================================

export const generateFunnelSchema = z.object({
  offerId: z.string().min(1, 'Offer is required'),
  template: funnelTemplateSchema.optional(),
  includeLeadMagnet: z.boolean().optional().default(false),
  targetGeo: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'urgent', 'friendly']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

export type GenerateFunnelFormData = z.infer<typeof generateFunnelSchema>;

// ============================================
// UPDATE FUNNEL
// ============================================

export const updateFunnelSchema = z.object({
  headline: z.string().min(10, 'Headline must be at least 10 characters').max(200).optional(),
  subheadline: z.string().max(300).optional(),
  heroImageUrl: z.string().url('Must be a valid URL').optional(),
  bodyContent: z.string().optional(),
  ctaText: z.string().min(3).max(50).optional(),
  ctaUrl: z.string().url('Must be a valid URL').optional(),
  leadMagnetId: z.string().optional(),
  status: funnelStatusSchema.optional(),
});

export type UpdateFunnelFormData = z.infer<typeof updateFunnelSchema>;

// ============================================
// CAPTURE LEAD
// ============================================

export const captureLeadSchema = z.object({
  funnelId: z.string().min(1, 'Funnel ID is required'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type CaptureLeadFormData = z.infer<typeof captureLeadSchema>;

// ============================================
// GENERATE LEAD MAGNET
// ============================================

export const generateLeadMagnetSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(500).optional(),
  format: leadMagnetFormatSchema,
  content: z.string().optional(),
  offerId: z.string().optional(),
});

export type GenerateLeadMagnetFormData = z.infer<typeof generateLeadMagnetSchema>;

// ============================================
// OFFER FILTERS
// ============================================

export const offerFiltersSchema = z.object({
  network: affiliateNetworkSchema.optional(),
  status: offerStatusSchema.optional(),
  minScore: z.number().min(0).max(100).optional(),
  minPayout: z.number().min(0).optional(),
  category: z.string().optional(),
  geoTarget: z.string().optional(),
  searchQuery: z.string().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['score', 'payout', 'epc', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type OfferFiltersFormData = z.infer<typeof offerFiltersSchema>;

// ============================================
// FUNNEL FILTERS
// ============================================

export const funnelFiltersSchema = z.object({
  status: funnelStatusSchema.optional(),
  offerId: z.string().optional(),
  searchQuery: z.string().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['views', 'clicks', 'leads', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type FunnelFiltersFormData = z.infer<typeof funnelFiltersSchema>;

// ============================================
// LEAD FILTERS
// ============================================

export const leadFiltersSchema = z.object({
  funnelId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  searchQuery: z.string().optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

export type LeadFiltersFormData = z.infer<typeof leadFiltersSchema>;
