/**
 * CAMPAIGNS REACT QUERY HOOKS
 *
 * Custom hooks for campaign data management with React Query.
 * Includes automatic caching, refetching, and optimistic updates.
 *
 * @module lib/hooks/useCampaignsQuery
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  launchCampaign,
  pauseCampaign,
  cancelCampaign,
  deleteCampaign,
  getCampaignMetrics,
  getCampaignSummary,
  Campaign,
  CampaignMetrics,
} from '@/lib/api/campaigns';
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
 * Query key factory for campaigns
 * Provides type-safe query keys for React Query
 */
export const CAMPAIGN_QUERY_KEYS = {
  all: ['campaigns'] as const,
  lists: () => [...CAMPAIGN_QUERY_KEYS.all, 'list'] as const,
  list: (params?: CampaignQueryParams) =>
    [...CAMPAIGN_QUERY_KEYS.lists(), params] as const,
  details: () => [...CAMPAIGN_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CAMPAIGN_QUERY_KEYS.details(), id] as const,
  metrics: (id: string) => [...CAMPAIGN_QUERY_KEYS.detail(id), 'metrics'] as const,
  summary: (id: string) => [...CAMPAIGN_QUERY_KEYS.detail(id), 'summary'] as const,
};

/**
 * Get all campaigns with optional filtering
 * @param params Query parameters for filtering campaigns
 */
export const useCampaigns = (params?: CampaignQueryParams) => {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.list(params),
    queryFn: () => getCampaigns(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single campaign by ID
 * @param id Campaign ID
 */
export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.detail(id),
    queryFn: () => getCampaignById(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Get campaign metrics
 * @param params Campaign metrics parameters
 */
export const useCampaignMetrics = (params: CampaignMetricsParams) => {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.metrics(params.campaignId),
    queryFn: () => getCampaignMetrics(params),
    enabled: !!params.campaignId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get campaign summary (campaign + metrics)
 * @param id Campaign ID
 */
export const useCampaignSummary = (id: string) => {
  return useQuery({
    queryKey: CAMPAIGN_QUERY_KEYS.summary(id),
    queryFn: () => getCampaignSummary(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

/**
 * Create new campaign
 */
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignFormData) => createCampaign(data),
    onSuccess: (newCampaign) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.lists() });

      toast.success('CAMPAIGN CREATED', {
        description: `${newCampaign.name} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error('CREATION FAILED', {
        description: error?.response?.data?.message || 'Failed to create campaign. Please try again.',
      });
    },
  });
};

/**
 * Update campaign
 */
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignFormData }) =>
      updateCampaign(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CAMPAIGN_QUERY_KEYS.detail(id) });

      // Snapshot previous value
      const previousCampaign = queryClient.getQueryData<Campaign>(
        CAMPAIGN_QUERY_KEYS.detail(id)
      );

      // Optimistically update
      if (previousCampaign) {
        queryClient.setQueryData<Campaign>(CAMPAIGN_QUERY_KEYS.detail(id), {
          ...previousCampaign,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousCampaign };
    },
    onSuccess: (updatedCampaign) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CAMPAIGN_QUERY_KEYS.detail(updatedCampaign.id),
      });

      toast.success('CAMPAIGN UPDATED', {
        description: 'Changes saved successfully.',
      });
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousCampaign) {
        queryClient.setQueryData(
          CAMPAIGN_QUERY_KEYS.detail(variables.id),
          context.previousCampaign
        );
      }

      toast.error('UPDATE FAILED', {
        description: error?.response?.data?.message || 'Failed to update campaign. Please try again.',
      });
    },
  });
};

/**
 * Launch campaign
 */
export const useLaunchCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LaunchCampaignFormData) => launchCampaign(data),
    onSuccess: (campaign, variables) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CAMPAIGN_QUERY_KEYS.detail(campaign.id),
      });

      toast.success('CAMPAIGN LAUNCHED', {
        description: variables.publishImmediately
          ? `${campaign.name} is now live!`
          : `${campaign.name} scheduled successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error('LAUNCH FAILED', {
        description: error?.response?.data?.message || 'Failed to launch campaign. Please try again.',
      });
    },
  });
};

/**
 * Pause campaign
 */
export const usePauseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PauseCampaignFormData) => pauseCampaign(data),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CAMPAIGN_QUERY_KEYS.detail(campaign.id),
      });

      toast.success('CAMPAIGN PAUSED', {
        description: `${campaign.name} has been paused.`,
      });
    },
    onError: (error: any) => {
      toast.error('PAUSE FAILED', {
        description: error?.response?.data?.message || 'Failed to pause campaign. Please try again.',
      });
    },
  });
};

/**
 * Cancel campaign
 */
export const useCancelCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelCampaignFormData) => cancelCampaign(data),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CAMPAIGN_QUERY_KEYS.detail(campaign.id),
      });

      toast.success('CAMPAIGN CANCELLED', {
        description: `${campaign.name} has been cancelled.`,
      });
    },
    onError: (error: any) => {
      toast.error('CANCELLATION FAILED', {
        description: error?.response?.data?.message || 'Failed to cancel campaign. Please try again.',
      });
    },
  });
};

/**
 * Delete campaign
 */
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: CAMPAIGN_QUERY_KEYS.lists() });

      toast.success('CAMPAIGN DELETED', {
        description: 'Campaign has been permanently deleted.',
      });
    },
    onError: (error: any) => {
      toast.error('DELETION FAILED', {
        description: error?.response?.data?.message || 'Failed to delete campaign. Please try again.',
      });
    },
  });
};
