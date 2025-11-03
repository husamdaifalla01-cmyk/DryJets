import { Decimal } from '@prisma/client/runtime/library';

/**
 * Traffic Network Adapter Interface
 *
 * Generic interface for traffic network integrations (PopAds, PropellerAds, etc.)
 * Handles campaign creation, management, and metrics synchronization.
 */

export interface TrafficAdapterConfig {
  apiKey: string;
  isSandbox: boolean;
}

export interface CampaignCreateOptions {
  campaignName: string;
  targetUrl: string;
  dailyBudget: number;
  targetGeos: string[];
  targetDevices?: string[];
  bidAmount?: number;
}

export interface CampaignUpdateOptions {
  externalCampaignId: string;
  dailyBudget?: number;
  status?: 'active' | 'paused';
  bidAmount?: number;
}

export interface CampaignMetrics {
  externalCampaignId: string;
  impressions: number;
  clicks: number;
  spend: number; // Match Prisma AdMetric.spend field
  ctr: number;
  cpc: number;
  timestamp: Date;
}

export interface CreateCampaignResult {
  success: boolean;
  externalCampaignId?: string;
  message?: string;
  errors?: string[];
}

export interface MetricsSyncResult {
  success: boolean;
  metrics?: CampaignMetrics[];
  errors?: string[];
  duration: number;
}

export interface PauseCampaignResult {
  success: boolean;
  message?: string;
}

export interface TrafficAdapter {
  /**
   * Validates API credentials
   */
  validateConfig(config: TrafficAdapterConfig): Promise<boolean>;

  /**
   * Creates a new ad campaign
   */
  createCampaign(
    config: TrafficAdapterConfig,
    options: CampaignCreateOptions,
  ): Promise<CreateCampaignResult>;

  /**
   * Updates an existing campaign
   */
  updateCampaign(
    config: TrafficAdapterConfig,
    options: CampaignUpdateOptions,
  ): Promise<CreateCampaignResult>;

  /**
   * Pauses a campaign immediately
   */
  pauseCampaign(
    config: TrafficAdapterConfig,
    externalCampaignId: string,
    reason?: string,
  ): Promise<PauseCampaignResult>;

  /**
   * Fetches performance metrics for campaigns
   */
  syncMetrics(
    config: TrafficAdapterConfig,
    externalCampaignIds: string[],
  ): Promise<MetricsSyncResult>;

  /**
   * Gets minimum daily budget for the network
   */
  getMinimumDailyBudget(): number;

  /**
   * Gets supported GEO targets
   */
  getSupportedGeos(): string[];

  /**
   * Gets network name
   */
  getNetworkName(): string;
}
