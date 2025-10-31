/**
 * CAMPAIGN VALIDATION SCHEMAS
 *
 * Zod schemas for campaign form validation.
 * Maps to backend DTOs from @dryjets/types/dtos
 */

import { z } from 'zod';

/**
 * Campaign types
 */
export const CAMPAIGN_TYPES = [
  'social',
  'content',
  'email',
  'seo',
  'video',
  'multi-channel',
] as const;

/**
 * Campaign status
 */
export const CAMPAIGN_STATUS = [
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'cancelled',
] as const;

/**
 * Base Campaign Schema (without refinements)
 * Used as foundation for create/update schemas
 */
const baseCampaignSchema = z.object({
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(200, 'Campaign name must be less than 200 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),

  profileId: z.string().uuid('Invalid profile ID'),

  type: z.enum(CAMPAIGN_TYPES, {
    errorMap: () => ({ message: 'Please select a campaign type' }),
  }),

  targetPlatforms: z
    .array(z.string())
    .min(1, 'Select at least one platform')
    .max(9, 'Maximum 9 platforms allowed'),

  startDate: z
    .string()
    .datetime('Invalid start date')
    .or(z.date()),

  endDate: z
    .string()
    .datetime('Invalid end date')
    .or(z.date())
    .optional(),

  budget: z
    .number()
    .positive('Budget must be positive')
    .max(10000000, 'Budget too large')
    .optional(),

  targetAudience: z
    .string()
    .max(1000, 'Target audience must be less than 1000 characters')
    .optional(),

  goals: z
    .array(z.string())
    .optional(),

  kpis: z
    .array(z.string())
    .optional(),

  tags: z
    .array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
});

/**
 * Date validation refinement
 */
const dateRefinement = (data: any) => {
  if (!data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
};

/**
 * Create Campaign Schema
 * @useCase UC040 - Create Campaign
 */
export const createCampaignSchema = baseCampaignSchema.refine(
  dateRefinement,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Update Campaign Schema
 * @useCase UC041 - Update Campaign
 */
export const updateCampaignSchema = baseCampaignSchema.partial().extend({
  id: z.string().uuid('Invalid campaign ID'),
}).refine(
  dateRefinement,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Launch Campaign Schema
 * @useCase UC042 - Launch Campaign
 */
export const launchCampaignSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),

  publishImmediately: z.boolean().optional(),

  scheduledAt: z
    .string()
    .datetime('Invalid schedule date')
    .or(z.date())
    .optional(),

  platforms: z
    .array(z.string())
    .optional(),

  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm launch' }),
  }),
}).refine(
  (data) => {
    // If not publishing immediately, scheduledAt is required
    if (!data.publishImmediately && !data.scheduledAt) {
      return false;
    }
    return true;
  },
  {
    message: 'Schedule date is required when not publishing immediately',
    path: ['scheduledAt'],
  }
);

/**
 * Pause Campaign Schema
 */
export const pauseCampaignSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

/**
 * Cancel Campaign Schema
 */
export const cancelCampaignSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm cancellation' }),
  }),
});

/**
 * Campaign Query Schema
 */
export const campaignQuerySchema = z.object({
  profileId: z.string().uuid('Invalid profile ID').optional(),
  status: z.enum(CAMPAIGN_STATUS).optional(),
  type: z.enum(CAMPAIGN_TYPES).optional(),
  platform: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'startDate', 'createdAt', 'budget']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().positive().optional(),
  limit: z.number().positive().max(100).optional(),
});

/**
 * Get Campaign Metrics Schema
 */
export const getCampaignMetricsSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'platform']).optional(),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignFormData = z.infer<typeof updateCampaignSchema>;
export type LaunchCampaignFormData = z.infer<typeof launchCampaignSchema>;
export type PauseCampaignFormData = z.infer<typeof pauseCampaignSchema>;
export type CancelCampaignFormData = z.infer<typeof cancelCampaignSchema>;
export type CampaignQueryParams = z.infer<typeof campaignQuerySchema>;
export type CampaignMetricsParams = z.infer<typeof getCampaignMetricsSchema>;
