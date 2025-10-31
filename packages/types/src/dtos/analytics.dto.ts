/**
 * ANALYTICS DTOs
 *
 * @description Data Transfer Objects for analytics and reporting
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#analytics-attribution
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#analytics-apis
 * @useCase UC090-UC099 (Analytics & Reporting)
 */

import type { MetricType, TimeRange, Dimension } from '../marketing/analytics.types';

/**
 * Get Analytics Overview DTO
 * @useCase UC090 - Get Analytics Overview
 */
export class GetAnalyticsOverviewDto {
  /** Profile ID */
  profileId: string;

  /** Time range preset */
  timeRange?: TimeRange;

  /** Custom start date */
  startDate?: string;

  /** Custom end date */
  endDate?: string;

  /** Compare with previous period */
  comparePrevious?: boolean;
}

/**
 * Get Metrics DTO
 * @useCase UC091 - Get Specific Metrics
 */
export class GetMetricsDto {
  /** Profile ID */
  profileId: string;

  /** Metrics to retrieve */
  metrics: MetricType[];

  /** Dimensions to break down by */
  dimensions?: Dimension[];

  /** Time range */
  timeRange?: TimeRange;

  /** Start date */
  startDate?: string;

  /** End date */
  endDate?: string;

  /** Filters */
  filters?: {
    platform?: string;
    campaign?: string;
    content?: string;
  };

  /** Group by time period */
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Get Attribution DTO
 * @useCase UC092 - Get Attribution Analysis
 */
export class GetAttributionDto {
  /** Profile ID */
  profileId: string;

  /** Attribution models */
  models?: Array<'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based'>;

  /** Time range */
  startDate?: string;
  endDate?: string;

  /** Conversion type filter */
  conversionType?: string;

  /** Minimum conversion value */
  minConversionValue?: number;
}

/**
 * Get Funnel Analysis DTO
 * @useCase UC093 - Analyze Funnel
 */
export class GetFunnelAnalysisDto {
  /** Profile ID */
  profileId: string;

  /** Funnel stages */
  stages?: string[];

  /** Time range */
  startDate?: string;
  endDate?: string;

  /** Segment filter */
  segment?: string;
}

/**
 * Get Audience Segments DTO
 * @useCase UC094 - Get Audience Segments
 */
export class GetAudienceSegmentsDto {
  /** Profile ID */
  profileId: string;

  /** Minimum segment size */
  minSize?: number;

  /** Sort by */
  sortBy?: 'size' | 'engagement' | 'conversion_rate' | 'lifetime_value';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';

  /** Limit */
  limit?: number;
}

/**
 * Create Audience Segment DTO
 * @useCase UC095 - Create Custom Segment
 */
export class CreateSegmentDto {
  /** Segment name */
  name: string;

  /** Description */
  description: string;

  /** Profile ID */
  profileId: string;

  /** Segment criteria */
  criteria: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
    value: unknown;
    logicalOperator?: 'and' | 'or';
  }>;
}

/**
 * Create Dashboard DTO
 * @useCase UC096 - Create Custom Dashboard
 */
export class CreateDashboardDto {
  /** Dashboard name */
  name: string;

  /** Description */
  description?: string;

  /** Profile ID */
  profileId: string;

  /** Widgets */
  widgets: Array<{
    type: 'metric' | 'chart' | 'table' | 'funnel' | 'map' | 'text';
    title: string;
    config: {
      metric?: MetricType;
      dimensions?: Dimension[];
      timeRange?: TimeRange;
      chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
      filters?: Record<string, unknown>;
    };
  }>;

  /** Widget layout */
  layout: Array<{
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;

  /** Whether to set as default */
  isDefault?: boolean;

  /** Share with users */
  sharedWith?: string[];
}

/**
 * Generate Report DTO
 * @useCase UC097 - Generate Report
 */
export class GenerateReportDto {
  /** Profile ID */
  profileId: string;

  /** Report type */
  type: 'campaign' | 'content' | 'seo' | 'trends' | 'attribution' | 'custom';

  /** Report name */
  name: string;

  /** Time range */
  startDate: string;
  endDate: string;

  /** Export format */
  format: 'pdf' | 'excel' | 'csv' | 'json';

  /** Include sections */
  sections?: Array<'summary' | 'metrics' | 'charts' | 'insights' | 'recommendations'>;

  /** Custom filters */
  filters?: {
    campaigns?: string[];
    platforms?: string[];
    content?: string[];
  };

  /** Whether to schedule */
  scheduled?: boolean;

  /** Schedule frequency */
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';

  /** Recipients */
  recipients?: string[];
}

/**
 * Get Content Performance DTO
 * @useCase UC098 - Get Content Performance
 */
export class GetContentPerformanceDto {
  /** Profile ID */
  profileId: string;

  /** Content IDs */
  contentIds?: string[];

  /** Time range */
  startDate?: string;
  endDate?: string;

  /** Metrics to include */
  metrics?: MetricType[];

  /** Group by */
  groupBy?: 'platform' | 'type' | 'campaign';

  /** Sort by */
  sortBy?: 'views' | 'clicks' | 'engagement' | 'conversions';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';

  /** Limit */
  limit?: number;
}

/**
 * Compare Campaigns DTO
 * @useCase UC099 - Compare Campaign Performance
 */
export class CompareCampaignsDto {
  /** Profile ID */
  profileId: string;

  /** Campaign IDs to compare */
  campaignIds: string[];

  /** Metrics to compare */
  metrics?: MetricType[];

  /** Time range */
  startDate?: string;
  endDate?: string;
}

/**
 * Export Analytics Data DTO
 */
export class ExportAnalyticsDto {
  /** Profile ID */
  profileId: string;

  /** Data type */
  dataType: 'metrics' | 'attribution' | 'funnel' | 'segments' | 'content' | 'campaigns';

  /** Export format */
  format: 'csv' | 'json' | 'excel';

  /** Time range */
  startDate?: string;
  endDate?: string;

  /** Filters */
  filters?: Record<string, unknown>;
}
