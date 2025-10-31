/**
 * PROFILE VALIDATION SCHEMAS
 *
 * Zod schemas for profile form validation.
 * Maps to backend DTOs from @dryjets/types/dtos
 */

import { z } from 'zod';

/**
 * Create Profile Schema
 * @useCase UC010 - Create Marketing Profile
 */
export const createProfileSchema = z.object({
  name: z
    .string()
    .min(3, 'Profile name must be at least 3 characters')
    .max(100, 'Profile name must be less than 100 characters'),

  brandName: z
    .string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(100, 'Brand name must be less than 100 characters'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  industry: z
    .string()
    .min(2, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters'),

  niche: z
    .string()
    .min(2, 'Niche is required')
    .max(200, 'Niche must be less than 200 characters'),

  targetAudience: z
    .string()
    .min(10, 'Target audience description must be at least 10 characters')
    .max(1000, 'Target audience must be less than 1000 characters'),

  brandVoice: z
    .string()
    .min(3, 'Brand voice is required')
    .max(200, 'Brand voice must be less than 200 characters'),

  brandValues: z
    .array(z.string().min(1))
    .min(1, 'At least one brand value is required')
    .max(10, 'Maximum 10 brand values allowed'),

  primaryObjective: z.enum([
    'brand-awareness',
    'lead-generation',
    'customer-acquisition',
    'engagement',
    'thought-leadership',
  ], {
    errorMap: () => ({ message: 'Please select a primary objective' }),
  }),

  goals: z
    .array(z.string().min(1))
    .min(1, 'At least one goal is required')
    .max(20, 'Maximum 20 goals allowed'),

  // Optional fields
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  companySize: z.string().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
});

/**
 * Update Profile Schema (all fields optional except what user wants to update)
 * @useCase UC011 - Update Marketing Profile
 */
export const updateProfileSchema = createProfileSchema.partial();

/**
 * Profile Query/Filter Schema
 */
export const profileQuerySchema = z.object({
  status: z.enum(['active', 'paused', 'archived']).optional(),
  industry: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().positive().optional(),
  limit: z.number().positive().max(100).optional(),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type CreateProfileFormData = z.infer<typeof createProfileSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ProfileQueryParams = z.infer<typeof profileQuerySchema>;
