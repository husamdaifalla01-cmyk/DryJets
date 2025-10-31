import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '../api/offer-lab';
import type {
  SyncOffersRequest,
  GenerateFunnelRequest,
  CaptureLeadRequest,
  GenerateLeadMagnetRequest,
  OfferFilters,
  FunnelFilters,
  LeadFilters,
} from '@dryjets/types';

// ============================================
// QUERY KEYS
// ============================================

export const OFFER_LAB_QUERY_KEYS = {
  all: ['offer-lab'] as const,
  offers: () => [...OFFER_LAB_QUERY_KEYS.all, 'offers'] as const,
  offerList: (filters?: OfferFilters) => [...OFFER_LAB_QUERY_KEYS.offers(), 'list', filters] as const,
  offerDetail: (id: string) => [...OFFER_LAB_QUERY_KEYS.offers(), 'detail', id] as const,
  funnels: () => [...OFFER_LAB_QUERY_KEYS.all, 'funnels'] as const,
  funnelList: (filters?: FunnelFilters) => [...OFFER_LAB_QUERY_KEYS.funnels(), 'list', filters] as const,
  funnelDetail: (id: string) => [...OFFER_LAB_QUERY_KEYS.funnels(), 'detail', id] as const,
  leads: () => [...OFFER_LAB_QUERY_KEYS.all, 'leads'] as const,
  leadList: (filters?: LeadFilters) => [...OFFER_LAB_QUERY_KEYS.leads(), 'list', filters] as const,
  scraperLogs: (network?: string) => [...OFFER_LAB_QUERY_KEYS.all, 'scraper-logs', network] as const,
};

// ============================================
// OFFER QUERIES & MUTATIONS
// ============================================

export const useOffers = (filters?: OfferFilters) => {
  return useQuery({
    queryKey: OFFER_LAB_QUERY_KEYS.offerList(filters),
    queryFn: () => api.getOffers(filters),
    staleTime: 30000, // 30 seconds
  });
};

export const useOffer = (id: string) => {
  return useQuery({
    queryKey: OFFER_LAB_QUERY_KEYS.offerDetail(id),
    queryFn: () => api.getOffer(id),
    enabled: !!id,
  });
};

export const useSyncOffers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SyncOffersRequest) => api.syncOffers(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.offers() });
      toast.success(`Sync started: ${result.network}`, {
        description: `Job ID: ${result.jobId}`,
      });
    },
    onError: (error: any) => {
      toast.error('Sync failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

export const useUpdateTrackingLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, trackingLink }: { offerId: string; trackingLink: string }) =>
      api.updateTrackingLink(offerId, { trackingLink }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.offerDetail(variables.offerId) });
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.offers() });
      toast.success('Tracking link updated', {
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: string }) =>
      api.updateOfferStatus(offerId, status),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.offerDetail(variables.offerId) });
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.offers() });
      toast.success('Status updated', {
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

// ============================================
// FUNNEL QUERIES & MUTATIONS
// ============================================

export const useFunnels = (filters?: FunnelFilters) => {
  return useQuery({
    queryKey: OFFER_LAB_QUERY_KEYS.funnelList(filters),
    queryFn: () => api.getFunnels(filters),
    staleTime: 30000,
  });
};

export const useFunnel = (id: string) => {
  return useQuery({
    queryKey: OFFER_LAB_QUERY_KEYS.funnelDetail(id),
    queryFn: () => api.getFunnel(id),
    enabled: !!id,
  });
};

export const useGenerateFunnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateFunnelRequest) => api.generateFunnel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.funnels() });
      toast.success('Funnel generated successfully!', {
        description: 'Your funnel is ready for review',
      });
    },
    onError: (error: any) => {
      toast.error('Generation failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

export const useUpdateFunnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ funnelId, data }: { funnelId: string; data: any }) =>
      api.updateFunnel(funnelId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.funnelDetail(variables.funnelId) });
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.funnels() });
      toast.success('Funnel updated', {
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

export const usePublishFunnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ funnelId, overrideValidation }: { funnelId: string; overrideValidation?: boolean }) =>
      api.publishFunnel(funnelId, overrideValidation),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.funnelDetail(variables.funnelId) });
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.funnels() });
      toast.success('Funnel published!', {
        description: `Live at: ${result.publicUrl}`,
      });
    },
    onError: (error: any) => {
      toast.error('Publish failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

// ============================================
// LEAD QUERIES & MUTATIONS
// ============================================

export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: OFFER_LAB_QUERY_KEYS.leadList(filters),
    queryFn: () => api.getLeads(filters),
    staleTime: 10000, // 10 seconds (leads update frequently)
  });
};

export const useCaptureLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CaptureLeadRequest) => api.captureLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFER_LAB_QUERY_KEYS.leads() });
      toast.success('Lead captured!');
    },
    onError: (error: any) => {
      toast.error('Capture failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

// ============================================
// LEAD MAGNET MUTATIONS
// ============================================

export const useGenerateLeadMagnet = () => {
  return useMutation({
    mutationFn: (data: GenerateLeadMagnetRequest) => api.generateLeadMagnet(data),
    onSuccess: () => {
      toast.success('Lead magnet generated!', {
        description: 'Your lead magnet is ready to download',
      });
    },
    onError: (error: any) => {
      toast.error('Generation failed', {
        description: error.message || 'An error occurred',
      });
    },
  });
};

// ============================================
// SCRAPER LOGS QUERY
// ============================================

export const useScraperLogs = (network?: string, limit?: number) => {
  return useQuery({
    queryKey: OFFER_LAB_QUERY_KEYS.scraperLogs(network),
    queryFn: () => api.getScraperLogs(network, limit),
    staleTime: 60000, // 1 minute
  });
};
