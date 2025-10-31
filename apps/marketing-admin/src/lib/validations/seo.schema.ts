/**
 * SEO VALIDATION SCHEMAS
 *
 * Zod schemas for SEO optimization form validation.
 * Maps to backend DTOs from @dryjets/types/dtos
 */

import { z } from 'zod';

/**
 * Create SEO Page Schema
 * @useCase UC060 - Create SEO Page
 */
export const createSeoPageSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  url: z
    .string()
    .url('Must be a valid URL')
    .max(2000, 'URL is too long'),

  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(70, 'Title should be less than 70 characters for optimal SEO')
    .optional(),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(160, 'Description should be less than 160 characters for optimal SEO')
    .optional(),

  keywords: z
    .array(z.string())
    .min(1, 'Add at least one keyword')
    .max(20, 'Maximum 20 keywords allowed')
    .optional(),

  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
});

/**
 * Keyword Research Schema
 * @useCase UC062 - Keyword Research
 */
export const keywordResearchSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  seedKeywords: z
    .array(z.string().min(1, 'Keyword cannot be empty'))
    .min(1, 'Add at least one seed keyword')
    .max(10, 'Maximum 10 seed keywords allowed'),

  geo: z
    .string()
    .length(2, 'Must be a 2-letter country code')
    .optional(),

  language: z
    .string()
    .length(2, 'Must be a 2-letter language code')
    .optional(),

  includeCompetitorAnalysis: z.boolean().optional(),

  maxResults: z
    .number()
    .positive()
    .max(500, 'Maximum 500 results')
    .optional(),
});

/**
 * Analyze Keyword Schema
 * @useCase UC063 - Analyze Keyword
 */
export const analyzeKeywordSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  keyword: z
    .string()
    .min(2, 'Keyword must be at least 2 characters')
    .max(200, 'Keyword is too long'),

  competitors: z
    .array(z.string().url('Invalid competitor URL'))
    .max(10, 'Maximum 10 competitors allowed')
    .optional(),

  includeSearchVolume: z.boolean().optional(),

  includeDifficulty: z.boolean().optional(),

  includeTrends: z.boolean().optional(),
});

/**
 * Track Rank Schema
 * @useCase UC064 - Track Rank
 */
export const trackRankSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  url: z
    .string()
    .url('Must be a valid URL'),

  keywords: z
    .array(z.string().min(1))
    .min(1, 'Add at least one keyword to track')
    .max(100, 'Maximum 100 keywords allowed'),

  geo: z
    .string()
    .length(2, 'Must be a 2-letter country code')
    .optional(),

  device: z
    .enum(['desktop', 'mobile', 'both'])
    .optional(),

  frequency: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional(),
});

/**
 * Run SEO Audit Schema
 * @useCase UC065 - Run SEO Audit
 */
export const runSeoAuditSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  url: z
    .string()
    .url('Must be a valid URL'),

  depth: z
    .enum(['quick', 'standard', 'comprehensive'])
    .optional(),

  includeContentAnalysis: z.boolean().optional(),

  includeTechnicalSeo: z.boolean().optional(),

  includeBacklinks: z.boolean().optional(),

  includeCompetitorAnalysis: z.boolean().optional(),
});

/**
 * Get Recommendations Schema
 * @useCase UC066 - Get SEO Recommendations
 */
export const getSeoRecommendationsSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  pageId: z
    .string()
    .uuid('Invalid page ID')
    .optional(),

  priority: z
    .enum(['critical', 'high', 'medium', 'low'])
    .optional(),

  category: z
    .enum(['content', 'technical', 'backlinks', 'keywords', 'all'])
    .optional(),

  limit: z
    .number()
    .positive()
    .max(100)
    .optional(),
});

/**
 * Optimize Content Schema
 * @useCase UC067 - Optimize Content for SEO
 */
export const optimizeContentSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  contentId: z
    .string()
    .uuid('Invalid content ID')
    .optional(),

  content: z
    .string()
    .min(100, 'Content must be at least 100 characters')
    .optional(),

  targetKeywords: z
    .array(z.string())
    .min(1, 'Add at least one target keyword')
    .max(5, 'Maximum 5 target keywords allowed'),

  autoApply: z.boolean().optional(),
}).refine(
  (data) => data.contentId || data.content,
  {
    message: 'Either contentId or content text must be provided',
    path: ['content'],
  }
);

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateSeoPageFormData = z.infer<typeof createSeoPageSchema>;
export type KeywordResearchFormData = z.infer<typeof keywordResearchSchema>;
export type AnalyzeKeywordFormData = z.infer<typeof analyzeKeywordSchema>;
export type TrackRankFormData = z.infer<typeof trackRankSchema>;
export type RunSeoAuditFormData = z.infer<typeof runSeoAuditSchema>;
export type GetSeoRecommendationsFormData = z.infer<typeof getSeoRecommendationsSchema>;
export type OptimizeContentFormData = z.infer<typeof optimizeContentSchema>;
