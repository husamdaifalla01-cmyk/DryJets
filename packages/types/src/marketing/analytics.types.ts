/**
 * ANALYTICS TYPES
 *
 * @description Type definitions for marketing analytics and reporting
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#analytics-attribution
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#analytics-apis
 */

export type MetricType =
  | 'impressions'
  | 'clicks'
  | 'conversions'
  | 'revenue'
  | 'engagement'
  | 'reach'
  | 'ctr'
  | 'cpc'
  | 'cpa'
  | 'roas';

export type TimeRange = 'today' | '7days' | '30days' | '90days' | 'custom';
export type Dimension = 'platform' | 'campaign' | 'content' | 'audience' | 'device' | 'location';

export interface AnalyticsOverview {
  profileId: string;
  timeRange: {
    start: string;
    end: string;
  };

  // Top-level metrics
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalSpent: number;

  // Rates
  avgCTR: number;
  avgConversionRate: number;
  avgCPC: number;
  avgCPA: number;
  roas: number;

  // Engagement
  totalEngagement: number;
  avgEngagementRate: number;
  totalReach: number;
  uniqueVisitors: number;

  // Comparisons (vs previous period)
  impressionsChange: number;
  clicksChange: number;
  conversionsChange: number;
  revenueChange: number;
}

export interface MetricDataPoint {
  date: string;
  value: number;
  metric: MetricType;
}

export interface DimensionBreakdown {
  dimension: Dimension;
  data: {
    label: string;
    value: number;
    percentage: number;
    change?: number;
  }[];
}

export interface Attribution {
  id: string;
  profileId: string;
  conversionId: string;
  conversionValue: number;

  // Touchpoints
  touchpoints: Touchpoint[];
  totalTouchpoints: number;

  // Attribution model results
  firstTouch: AttributionCredit[];
  lastTouch: AttributionCredit[];
  linear: AttributionCredit[];
  timeDecay: AttributionCredit[];
  positionBased: AttributionCredit[];

  // Journey
  journeyDuration: number; // hours
  averageTimeBetweenTouchpoints: number;

  // Metadata
  convertedAt: string;
  analyzedAt: string;
}

export interface Touchpoint {
  id: string;
  channel: string;
  campaign?: string;
  content?: string;
  platform: string;
  timestamp: string;
  position: number; // 1-indexed position in journey
  timeSinceLastTouch?: number; // minutes
}

export interface AttributionCredit {
  channel: string;
  campaign?: string;
  credit: number; // 0-1
  creditValue: number; // monetary value
  touchpointIndices: number[];
}

export interface FunnelAnalysis {
  id: string;
  profileId: string;
  analyzedAt: string;
  timeRange: {
    start: string;
    end: string;
  };

  // Funnel stages
  stages: FunnelStage[];

  // Overall stats
  totalEntries: number;
  totalConversions: number;
  conversionRate: number;
  avgTimeToConvert: number; // hours
  dropoffRate: number;

  // Insights
  biggestDropoff: string; // stage name
  bottlenecks: string[];
  recommendations: string[];
}

export interface FunnelStage {
  name: string;
  order: number;
  entries: number;
  exits: number;
  conversions: number;
  conversionRate: number;
  avgTimeInStage: number; // minutes
  dropoffRate: number;
}

export interface AudienceSegment {
  id: string;
  profileId: string;
  name: string;
  description: string;

  // Segment criteria
  criteria: SegmentCriteria[];

  // Size
  size: number;
  percentage: number; // of total audience

  // Performance
  avgEngagementRate: number;
  avgConversionRate: number;
  avgOrderValue: number;
  lifetimeValue: number;

  // Demographics
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
    interests: string[];
  };

  // Behavior
  behavior: {
    avgSessionDuration: number;
    avgPagesPerSession: number;
    preferredChannels: string[];
    preferredContentTypes: string[];
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: unknown;
  logicalOperator?: 'and' | 'or';
}

export interface Dashboard {
  id: string;
  profileId: string;
  name: string;
  description?: string;

  // Widgets
  widgets: DashboardWidget[];
  layout: WidgetLayout[];

  // Access
  isDefault: boolean;
  sharedWith: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'map' | 'text';
  title: string;
  config: WidgetConfig;
}

export interface WidgetConfig {
  metric?: MetricType;
  dimensions?: Dimension[];
  timeRange?: TimeRange;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  filters?: Record<string, unknown>;
  customQuery?: string;
}

export interface WidgetLayout {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Report {
  id: string;
  profileId: string;
  name: string;
  type: 'campaign' | 'content' | 'seo' | 'trends' | 'attribution' | 'custom';
  timeRange: {
    start: string;
    end: string;
  };

  // Sections
  summary: ReportSection;
  sections: ReportSection[];

  // Export
  format: 'pdf' | 'excel' | 'csv' | 'json';
  generatedAt: string;
  fileUrl?: string;

  // Scheduling
  scheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];

  // Metadata
  createdAt: string;
  createdBy: string;
}

export interface ReportSection {
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'text' | 'insights';
  content: unknown;
  order: number;
}
