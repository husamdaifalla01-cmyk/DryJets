/**
 * CAMPAIGN DTOs
 *
 * @description Data Transfer Objects for campaign operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#campaign-orchestrator
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#campaign-apis
 * @useCase UC040-UC049 (Campaign Management)
 */

import type { CampaignType, CampaignStatus, CampaignPriority } from '../marketing/campaign.types';

/**
 * Create Campaign DTO
 * @useCase UC040 - Create Campaign
 */
export class CreateCampaignDto {
  /** Campaign name */
  name: string;

  /** Campaign description */
  description: string;

  /** Campaign type */
  type: CampaignType;

  /** Priority level */
  priority?: CampaignPriority;

  /** Target platforms */
  targetPlatforms: string[];

  /** Target audience description */
  targetAudience: string;

  /** Target geographies */
  targetGeographies?: string[];

  /** Campaign start date */
  startDate: string;

  /** Campaign end date */
  endDate: string;

  /** Timezone */
  timezone?: string;

  /** Total budget */
  budget?: number;

  /** Currency */
  currency?: string;

  /** Whether AI generated */
  aiGenerated?: boolean;

  /** AI agent used */
  aiAgent?: string;
}

/**
 * Update Campaign DTO
 * @useCase UC041 - Update Campaign
 */
export class UpdateCampaignDto {
  name?: string;
  description?: string;
  type?: CampaignType;
  priority?: CampaignPriority;
  status?: CampaignStatus;
  targetPlatforms?: string[];
  targetAudience?: string;
  targetGeographies?: string[];
  startDate?: string;
  endDate?: string;
  timezone?: string;
  budget?: number;
  currency?: string;
}

/**
 * Launch Campaign DTO
 * @useCase UC042 - Launch Campaign
 */
export class LaunchCampaignDto {
  /** Campaign ID to launch */
  campaignId: string;

  /** Whether to publish immediately */
  publishImmediately?: boolean;

  /** Scheduled launch time */
  scheduledAt?: string;

  /** Platforms to launch on */
  platforms?: string[];
}

/**
 * Pause Campaign DTO
 * @useCase UC043 - Pause Campaign
 */
export class PauseCampaignDto {
  /** Campaign ID to pause */
  campaignId: string;

  /** Reason for pausing */
  reason?: string;
}

/**
 * Cancel Campaign DTO
 * @useCase UC044 - Cancel Campaign
 */
export class CancelCampaignDto {
  /** Campaign ID to cancel */
  campaignId: string;

  /** Reason for cancellation */
  reason?: string;

  /** Whether to delete associated content */
  deleteContent?: boolean;
}

/**
 * Campaign Query Parameters
 */
export class CampaignQueryDto {
  status?: CampaignStatus;
  type?: CampaignType;
  priority?: CampaignPriority;
  platform?: string;
  startDateFrom?: string;
  startDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get Campaign Metrics DTO
 */
export class GetCampaignMetricsDto {
  /** Campaign ID */
  campaignId: string;

  /** Time range start */
  startDate?: string;

  /** Time range end */
  endDate?: string;

  /** Group by dimension */
  groupBy?: 'platform' | 'date' | 'content';
}
