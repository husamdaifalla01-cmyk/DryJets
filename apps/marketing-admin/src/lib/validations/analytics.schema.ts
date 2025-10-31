/**
 * ANALYTICS VALIDATION SCHEMAS
 *
 * Zod schemas for analytics and reporting form validation.
 * Maps to backend DTOs from @dryjets/types/dtos
 */

import { z } from 'zod';

/**
 * Time ranges
 */
export const TIME_RANGES = [
  'today',
  'yesterday',
  'last-7-days',
  'last-30-days',
  'last-90-days',
  'this-month',
  'last-month',
  'this-year',
  'custom',
] as const;

/**
 * Metrics
 */
export const METRIC_TYPES = [
  'views',
  'clicks',
  'impressions',
  'engagement',
  'reach',
  'conversions',
  'revenue',
  'ctr',
  'cpm',
  'cpc',
] as const;

/**
 * Get Analytics Overview Schema
 * @useCase UC090 - Get Analytics Overview
 */
export const getAnalyticsOverviewSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  timeRange: z.enum(TIME_RANGES).optional(),

  startDate: z
    .string()
    .datetime('Invalid start date')
    .or(z.date())
    .optional(),

  endDate: z
    .string()
    .datetime('Invalid end date')
    .or(z.date())
    .optional(),

  comparePrevious: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.timeRange === 'custom') {
      return data.startDate && data.endDate;
    }
    return true;
  },
  {
    message: 'Start and end dates are required for custom time range',
    path: ['startDate'],
  }
);

/**
 * Get Metrics Schema
 * @useCase UC091 - Get Specific Metrics
 */
export const getMetricsSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  metrics: z
    .array(z.enum(METRIC_TYPES))
    .min(1, 'Select at least one metric')
    .max(10, 'Maximum 10 metrics allowed'),

  dimensions: z
    .array(z.string())
    .max(5, 'Maximum 5 dimensions allowed')
    .optional(),

  timeRange: z.enum(TIME_RANGES).optional(),

  startDate: z.string().datetime().or(z.date()).optional(),

  endDate: z.string().datetime().or(z.date()).optional(),

  filters: z
    .object({
      platform: z.string().optional(),
      campaign: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),

  groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

/**
 * Create Dashboard Schema
 * @useCase UC096 - Create Custom Dashboard
 */
export const createDashboardSchema = z.object({
  name: z
    .string()
    .min(3, 'Dashboard name must be at least 3 characters')
    .max(100, 'Dashboard name must be less than 100 characters'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  profileId: z.string().uuid('Invalid profile ID'),

  widgets: z
    .array(
      z.object({
        type: z.enum(['metric', 'chart', 'table', 'funnel', 'map', 'text']),
        title: z.string().min(1, 'Widget title is required'),
        config: z.record(z.unknown()),
      })
    )
    .min(1, 'Add at least one widget')
    .max(20, 'Maximum 20 widgets allowed'),

  layout: z
    .array(
      z.object({
        widgetId: z.string(),
        x: z.number().min(0),
        y: z.number().min(0),
        width: z.number().positive(),
        height: z.number().positive(),
      })
    )
    .optional(),

  isDefault: z.boolean().optional(),

  sharedWith: z
    .array(z.string().email('Invalid email address'))
    .max(50, 'Maximum 50 shared users')
    .optional(),
});

/**
 * Generate Report Schema
 * @useCase UC097 - Generate Report
 */
export const generateReportSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),

  type: z.enum(['campaign', 'content', 'seo', 'trends', 'attribution', 'custom'], {
    errorMap: () => ({ message: 'Please select a report type' }),
  }),

  name: z
    .string()
    .min(3, 'Report name must be at least 3 characters')
    .max(200, 'Report name must be less than 200 characters'),

  startDate: z
    .string()
    .datetime('Invalid start date')
    .or(z.date()),

  endDate: z
    .string()
    .datetime('Invalid end date')
    .or(z.date()),

  format: z.enum(['pdf', 'excel', 'csv', 'json'], {
    errorMap: () => ({ message: 'Please select an export format' }),
  }),

  sections: z
    .array(z.enum(['summary', 'metrics', 'charts', 'insights', 'recommendations']))
    .optional(),

  filters: z
    .object({
      campaigns: z.array(z.string()).optional(),
      platforms: z.array(z.string()).optional(),
      content: z.array(z.string()).optional(),
    })
    .optional(),

  scheduled: z.boolean().optional(),

  scheduleFrequency: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional(),

  recipients: z
    .array(z.string().email('Invalid email address'))
    .max(50, 'Maximum 50 recipients')
    .optional(),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.scheduled && !data.scheduleFrequency) {
      return false;
    }
    return true;
  },
  {
    message: 'Schedule frequency is required for scheduled reports',
    path: ['scheduleFrequency'],
  }
);

/**
 * Create Segment Schema
 * @useCase UC095 - Create Custom Segment
 */
export const createSegmentSchema = z.object({
  name: z
    .string()
    .min(3, 'Segment name must be at least 3 characters')
    .max(100, 'Segment name must be less than 100 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),

  profileId: z.string().uuid('Invalid profile ID'),

  criteria: z
    .array(
      z.object({
        field: z.string().min(1, 'Field is required'),
        operator: z.enum([
          'equals',
          'not_equals',
          'greater_than',
          'less_than',
          'contains',
          'in',
          'not_in',
        ]),
        value: z.unknown(),
        logicalOperator: z.enum(['and', 'or']).optional(),
      })
    )
    .min(1, 'Add at least one criteria')
    .max(20, 'Maximum 20 criteria allowed'),
});

/**
 * TypeScript types derived from Zod schemas
 */
export type GetAnalyticsOverviewFormData = z.infer<typeof getAnalyticsOverviewSchema>;
export type GetMetricsFormData = z.infer<typeof getMetricsSchema>;
export type CreateDashboardFormData = z.infer<typeof createDashboardSchema>;
export type GenerateReportFormData = z.infer<typeof generateReportSchema>;
export type CreateSegmentFormData = z.infer<typeof createSegmentSchema>;
