/**
 * CAMPAIGNS API
 *
 * API client functions for campaign management.
 * Maps to backend CampaignController endpoints.
 *
 * @module lib/api/campaigns
 */

import apiClient from './client';
import {
  CreateCampaignFormData,
  UpdateCampaignFormData,
  LaunchCampaignFormData,
  PauseCampaignFormData,
  CancelCampaignFormData,
  CampaignQueryParams,
  CampaignMetricsParams,
} from '@/lib/validations';

/**
 * Campaign response type
 * TODO: Import from @dryjets/types when available
 */
export interface Campaign {
  id: string;
  profileId: string;
  name: string;
  description?: string;
  type: 'social' | 'content' | 'email' | 'seo' | 'video' | 'multi-channel';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetPlatforms: string[];
  startDate: string;
  endDate?: string;
  budget?: number;
  targetAudience?: string;
  goals?: string[];
  kpis?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  launchedAt?: string;
}

/**
 * Campaign metrics type
 */
export interface CampaignMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  engagement: number;
  conversions: number;
  reach: number;
  ctr: number;
  cpc?: number;
  spent?: number;
  roi?: number;
  platformBreakdown?: Record<string, any>;
  timeline?: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

/**
 * Paginated campaigns response
 */
export interface PaginatedCampaigns {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BASE_PATH = '/marketing/campaigns';

/**
 * Get all campaigns with optional filtering
 * @useCase UC040 - List Campaigns
 */
export const getCampaigns = async (
  params?: CampaignQueryParams
): Promise<PaginatedCampaigns> => {
  const response = await apiClient.get<PaginatedCampaigns>(BASE_PATH, { params });
  return response.data;
};

/**
 * Get single campaign by ID
 * @useCase UC040 - Get Campaign Details
 */
export const getCampaignById = async (id: string): Promise<Campaign> => {
  const response = await apiClient.get<Campaign>(`${BASE_PATH}/${id}`);
  return response.data;
};

/**
 * Create new campaign
 * @useCase UC040 - Create Campaign
 */
export const createCampaign = async (
  data: CreateCampaignFormData
): Promise<Campaign> => {
  const response = await apiClient.post<Campaign>(BASE_PATH, data);
  return response.data;
};

/**
 * Update existing campaign
 * @useCase UC041 - Update Campaign
 */
export const updateCampaign = async (
  id: string,
  data: UpdateCampaignFormData
): Promise<Campaign> => {
  const response = await apiClient.put<Campaign>(`${BASE_PATH}/${id}`, data);
  return response.data;
};

/**
 * Launch campaign
 * @useCase UC042 - Launch Campaign
 */
export const launchCampaign = async (
  data: LaunchCampaignFormData
): Promise<Campaign> => {
  const { campaignId, ...launchData } = data;
  const response = await apiClient.post<Campaign>(
    `${BASE_PATH}/${campaignId}/launch`,
    launchData
  );
  return response.data;
};

/**
 * Pause campaign
 * @useCase UC043 - Pause Campaign
 */
export const pauseCampaign = async (
  data: PauseCampaignFormData
): Promise<Campaign> => {
  const { campaignId, ...pauseData } = data;
  const response = await apiClient.post<Campaign>(
    `${BASE_PATH}/${campaignId}/pause`,
    pauseData
  );
  return response.data;
};

/**
 * Cancel campaign
 * @useCase UC044 - Cancel Campaign
 */
export const cancelCampaign = async (
  data: CancelCampaignFormData
): Promise<Campaign> => {
  const { campaignId, ...cancelData } = data;
  const response = await apiClient.post<Campaign>(
    `${BASE_PATH}/${campaignId}/cancel`,
    cancelData
  );
  return response.data;
};

/**
 * Delete campaign
 * @useCase UC045 - Delete Campaign
 */
export const deleteCampaign = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/${id}`);
};

/**
 * Get campaign metrics
 * @useCase UC049 - Get Campaign Metrics
 */
export const getCampaignMetrics = async (
  params: CampaignMetricsParams
): Promise<CampaignMetrics> => {
  const { campaignId, ...queryParams } = params;
  const response = await apiClient.get<CampaignMetrics>(
    `${BASE_PATH}/${campaignId}/metrics`,
    { params: queryParams }
  );
  return response.data;
};

/**
 * Get campaign performance summary
 */
export const getCampaignSummary = async (id: string): Promise<{
  campaign: Campaign;
  metrics: CampaignMetrics;
}> => {
  const response = await apiClient.get<{
    campaign: Campaign;
    metrics: CampaignMetrics;
  }>(`${BASE_PATH}/${id}/summary`);
  return response.data;
};
