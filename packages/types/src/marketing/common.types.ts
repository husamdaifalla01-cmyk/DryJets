/**
 * COMMON MARKETING TYPES
 *
 * @description Shared types, enums, and utilities for the marketing engine
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md
 */

// Job and Queue Types
export type JobStatus = 'pending' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
export type JobPriority = 1 | 2 | 3 | 4 | 5; // 1 = highest, 5 = lowest

export interface BackgroundJob {
  id: string;
  name: string;
  type: string;
  status: JobStatus;
  priority: JobPriority;

  // Data
  data: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;

  // Progress
  progress: number; // 0-100
  progressMessage?: string;

  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // milliseconds

  // Retry
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;

  // Metadata
  profileId?: string;
  userId?: string;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;

  // Content
  title: string;
  message: string;
  link?: string;
  actionLabel?: string;

  // Status
  read: boolean;
  readAt?: string;
  sent: boolean;
  sentAt?: string;

  // Metadata
  createdAt: string;
  expiresAt?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter and Search
export interface FilterParams {
  search?: string;
  status?: string;
  platform?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// File Upload
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Tags and Categories
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  usageCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  icon?: string;
  order: number;
}

// User Activity
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Feature Flags
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  enabledFor?: string[]; // User IDs
}

// AI Model Configuration
export interface AIModelConfig {
  model: 'claude-3-5-sonnet' | 'claude-3-5-haiku' | 'claude-3-opus';
  maxTokens: number;
  temperature: number;
  streaming?: boolean;
  caching?: boolean;
}

// Webhook
export interface Webhook {
  id: string;
  profileId: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;

  // Stats
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastCalledAt?: string;
  lastError?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Rate Limit
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: string; // ISO timestamp
  resetInSeconds: number;
}

// Health Check
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      message?: string;
    };
  };
}

// Currency and Money
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface Money {
  amount: number;
  currency: Currency;
  formatted: string;
}

// Time Period
export interface TimePeriod {
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  duration?: number; // milliseconds
}

// Geo Location
export interface GeoLocation {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}
