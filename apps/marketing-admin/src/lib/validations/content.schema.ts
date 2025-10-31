/**
 * CONTENT VALIDATION SCHEMAS
 *
 * Zod schemas for content creation and publishing form validation.
 * Maps to backend DTOs from @dryjets/types/dtos
 */

import { z } from 'zod';

/**
 * Content types
 */
export const CONTENT_TYPES = [
  'blog',
  'social-post',
  'video-script',
  'email',
  'newsletter',
  'thread',
  'carousel',
  'infographic',
] as const;

/**
 * Content status
 */
export const CONTENT_STATUS = [
  'draft',
  'pending-review',
  'approved',
  'scheduled',
  'published',
  'failed',
  'archived',
] as const;

/**
 * Publishing platforms
 */
export const PUBLISHING_PLATFORMS = [
  'linkedin',
  'youtube',
  'tiktok',
  'twitter',
  'facebook',
  'instagram',
  'pinterest',
  'medium',
  'substack',
] as const;

/**
 * Create Content Schema (Generic)
 * @useCase UC050 - Create Content
 */
export const createContentSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  campaignId: z
    .string()
    .uuid('Invalid campaign ID')
    .optional(),

  type: z.enum(CONTENT_TYPES, {
    errorMap: () => ({ message: 'Please select a content type' }),
  }),

  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300, 'Title must be less than 300 characters'),

  body: z
    .string()
    .min(10, 'Content body must be at least 10 characters')
    .max(50000, 'Content body is too long'),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),

  targetPlatforms: z
    .array(z.enum(PUBLISHING_PLATFORMS))
    .min(1, 'Select at least one platform')
    .max(9, 'Maximum 9 platforms allowed'),

  tags: z
    .array(z.string())
    .max(30, 'Maximum 30 tags allowed')
    .optional(),

  keywords: z
    .array(z.string())
    .max(20, 'Maximum 20 keywords allowed')
    .optional(),

  mediaUrls: z
    .array(z.string().url('Invalid media URL'))
    .max(10, 'Maximum 10 media items allowed')
    .optional(),

  metadata: z
    .record(z.unknown())
    .optional(),
});

/**
 * Update Content Schema
 * @useCase UC051 - Update Content
 */
export const updateContentSchema = createContentSchema.partial().extend({
  id: z.string().uuid('Invalid content ID'),
});

/**
 * Create Blog Post Schema (Specialized)
 * @useCase UC052 - Create Blog Post
 */
export const createBlogPostSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  campaignId: z.string().uuid('Invalid campaign ID').optional(),

  title: z
    .string()
    .min(10, 'Blog title must be at least 10 characters')
    .max(200, 'Blog title must be less than 200 characters'),

  content: z
    .string()
    .min(100, 'Blog content must be at least 100 characters')
    .max(50000, 'Blog content is too long'),

  excerpt: z
    .string()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),

  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),

  seoTitle: z
    .string()
    .max(70, 'SEO title should be less than 70 characters for optimal display')
    .optional(),

  seoDescription: z
    .string()
    .max(160, 'SEO description should be less than 160 characters for optimal display')
    .optional(),

  keywords: z
    .array(z.string())
    .min(3, 'Add at least 3 keywords for better SEO')
    .max(15, 'Maximum 15 keywords allowed')
    .optional(),

  tags: z
    .array(z.string())
    .max(20, 'Maximum 20 tags allowed')
    .optional(),

  categories: z
    .array(z.string())
    .max(5, 'Maximum 5 categories allowed')
    .optional(),

  featuredImage: z
    .string()
    .url('Invalid image URL')
    .optional(),

  author: z
    .string()
    .optional(),

  publishAt: z
    .string()
    .datetime('Invalid publish date')
    .or(z.date())
    .optional(),

  platform: z.enum(['medium', 'substack']).optional(),
});

/**
 * Publish Content Schema
 * @useCase UC053 - Publish Content
 */
export const publishContentSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),

  platforms: z
    .array(z.enum(PUBLISHING_PLATFORMS))
    .min(1, 'Select at least one platform'),

  publishImmediately: z.boolean().optional(),

  scheduledAt: z
    .string()
    .datetime('Invalid schedule date')
    .or(z.date())
    .optional(),

  platformSpecificSettings: z
    .record(z.unknown())
    .optional(),
}).refine(
  (data) => {
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
 * Schedule Content Schema
 * @useCase UC054 - Schedule Content
 */
export const scheduleContentSchema = z.object({
  contentId: z.string().uuid('Invalid content ID'),

  platforms: z
    .array(z.enum(PUBLISHING_PLATFORMS))
    .min(1, 'Select at least one platform'),

  scheduledAt: z
    .string()
    .datetime('Invalid schedule date')
    .or(z.date())
    .refine((date) => new Date(date) > new Date(), {
      message: 'Schedule date must be in the future',
    }),

  timezone: z
    .string()
    .optional(),
});

/**
 * Generate Content with AI Schema
 * @useCase UC055 - Generate Content with AI
 */
export const generateContentSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  type: z.enum(CONTENT_TYPES),

  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(500, 'Topic must be less than 500 characters'),

  keywords: z
    .array(z.string())
    .min(1, 'Add at least one keyword')
    .max(10, 'Maximum 10 keywords allowed')
    .optional(),

  tone: z
    .string()
    .max(100, 'Tone must be less than 100 characters')
    .optional(),

  length: z.enum(['short', 'medium', 'long']).optional(),

  targetPlatform: z.enum(PUBLISHING_PLATFORMS).optional(),

  additionalInstructions: z
    .string()
    .max(1000, 'Instructions must be less than 1000 characters')
    .optional(),
});

/**
 * Content Query Schema
 */
export const contentQuerySchema = z.object({
  profileId: z.string().uuid('Invalid profile ID').optional(),
  campaignId: z.string().uuid('Invalid campaign ID').optional(),
  type: z.enum(CONTENT_TYPES).optional(),
  status: z.enum(CONTENT_STATUS).optional(),
  platform: z.enum(PUBLISHING_PLATFORMS).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['title', 'createdAt', 'publishedAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().positive().optional(),
  limit: z.number().positive().max(100).optional(),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateContentFormData = z.infer<typeof createContentSchema>;
export type UpdateContentFormData = z.infer<typeof updateContentSchema>;
export type CreateBlogPostFormData = z.infer<typeof createBlogPostSchema>;
export type PublishContentFormData = z.infer<typeof publishContentSchema>;
export type ScheduleContentFormData = z.infer<typeof scheduleContentSchema>;
export type GenerateContentFormData = z.infer<typeof generateContentSchema>;
export type ContentQueryParams = z.infer<typeof contentQuerySchema>;
