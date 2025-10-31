/**
 * PLATFORM CONNECTION VALIDATION SCHEMAS
 *
 * Zod schemas for platform connection form validation.
 * Maps to backend DTOs from @dryjets/types/dtos
 */

import { z } from 'zod';

/**
 * Platform types enum
 */
export const PLATFORM_TYPES = [
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
 * Connect Platform Schema (OAuth flow)
 * @useCase UC030 - Connect Platform
 */
export const connectPlatformSchema = z.object({
  platform: z.enum(PLATFORM_TYPES, {
    errorMap: () => ({ message: 'Please select a valid platform' }),
  }),

  profileId: z.string().uuid('Invalid profile ID'),

  // Optional configuration
  scope: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Complete OAuth Schema
 * @useCase UC031 - Complete OAuth Flow
 */
export const completeOAuthSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  platform: z.enum(PLATFORM_TYPES),
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

/**
 * Connect with API Key Schema (for platforms without OAuth)
 * @useCase UC032 - Connect Platform with API Key
 */
export const connectApiKeySchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  platform: z.enum(PLATFORM_TYPES),

  apiKey: z
    .string()
    .min(10, 'API key must be at least 10 characters')
    .max(500, 'API key is too long'),

  apiSecret: z
    .string()
    .min(10, 'API secret must be at least 10 characters')
    .max(500, 'API secret is too long')
    .optional(),

  accessToken: z.string().optional(),

  // Optional additional credentials
  credentials: z.record(z.string()).optional(),
});

/**
 * Disconnect Platform Schema
 */
export const disconnectPlatformSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  platform: z.enum(PLATFORM_TYPES),
  connectionId: z.string().uuid('Invalid connection ID'),

  // Confirmation
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm disconnection' }),
  }),
});

/**
 * Platform Health Check Schema
 */
export const platformHealthCheckSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  connectionId: z.string().uuid('Invalid connection ID'),
});

/**
 * Refresh Connection Schema
 */
export const refreshConnectionSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  connectionId: z.string().uuid('Invalid connection ID'),
});

/**
 * Platform Query Schema
 */
export const platformQuerySchema = z.object({
  profileId: z.string().uuid('Invalid profile ID').optional(),
  platform: z.enum(PLATFORM_TYPES).optional(),
  status: z.enum(['connected', 'expired', 'failed']).optional(),
  sortBy: z.enum(['platform', 'connectedAt', 'lastSync']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type ConnectPlatformFormData = z.infer<typeof connectPlatformSchema>;
export type CompleteOAuthFormData = z.infer<typeof completeOAuthSchema>;
export type ConnectApiKeyFormData = z.infer<typeof connectApiKeySchema>;
export type DisconnectPlatformFormData = z.infer<typeof disconnectPlatformSchema>;
export type PlatformQueryParams = z.infer<typeof platformQuerySchema>;
