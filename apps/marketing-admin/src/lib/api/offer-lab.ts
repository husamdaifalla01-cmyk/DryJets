import apiClient from './client';
import type {
  Offer,
  Funnel,
  FunnelLead,
  LeadMagnet,
  ScraperLog,
  SyncOffersRequest,
  SyncOffersResponse,
  UpdateTrackingLinkRequest,
  GenerateFunnelRequest,
  CaptureLeadRequest,
  GenerateLeadMagnetRequest,
  PaginatedOffers,
  PaginatedFunnels,
  PaginatedLeads,
  OfferFilters,
  FunnelFilters,
  LeadFilters,
} from '@dryjets/types';

const BASE_PATH = '/marketing/offer-lab';

// ============================================
// OFFER SYNC & MANAGEMENT
// ============================================

export const syncOffers = async (data: SyncOffersRequest): Promise<SyncOffersResponse> => {
  const response = await apiClient.post(`${BASE_PATH}/sync`, data);
  return response.data;
};

export const getOffers = async (filters?: OfferFilters): Promise<PaginatedOffers> => {
  const response = await apiClient.get(`${BASE_PATH}/offers`, { params: filters });
  return response.data;
};

export const getOffer = async (id: string): Promise<Offer> => {
  const response = await apiClient.get(`${BASE_PATH}/offers/${id}`);
  return response.data;
};

export const updateTrackingLink = async (
  offerId: string,
  data: UpdateTrackingLinkRequest,
): Promise<{ success: boolean; offer: Offer; message: string }> => {
  const response = await apiClient.patch(`${BASE_PATH}/offers/${offerId}/tracking-link`, data);
  return response.data;
};

export const updateOfferStatus = async (
  offerId: string,
  status: string,
): Promise<{ success: boolean; offer: Offer; message: string }> => {
  const response = await apiClient.patch(`${BASE_PATH}/offers/${offerId}/status`, { status });
  return response.data;
};

// ============================================
// FUNNEL GENERATION & PUBLISHING
// ============================================

export const generateFunnel = async (data: GenerateFunnelRequest) => {
  const response = await apiClient.post(`${BASE_PATH}/funnels/generate`, data);
  return response.data;
};

export const getFunnels = async (filters?: FunnelFilters): Promise<PaginatedFunnels> => {
  const response = await apiClient.get(`${BASE_PATH}/funnels`, { params: filters });
  return response.data;
};

export const getFunnel = async (id: string): Promise<Funnel> => {
  const response = await apiClient.get(`${BASE_PATH}/funnels/${id}`);
  return response.data;
};

export const updateFunnel = async (
  funnelId: string,
  data: Partial<Funnel>,
): Promise<{ success: boolean; funnel: Funnel; message: string }> => {
  const response = await apiClient.patch(`${BASE_PATH}/funnels/${funnelId}`, data);
  return response.data;
};

export const publishFunnel = async (
  funnelId: string,
  overrideValidation?: boolean,
): Promise<{ success: boolean; funnel: Funnel; message: string; publicUrl: string }> => {
  const response = await apiClient.post(`${BASE_PATH}/funnels/${funnelId}/publish`, {
    overrideValidation,
  });
  return response.data;
};

// ============================================
// LEAD CAPTURE & MANAGEMENT
// ============================================

export const captureLead = async (data: CaptureLeadRequest) => {
  const response = await apiClient.post(`${BASE_PATH}/leads`, data);
  return response.data;
};

export const getLeads = async (filters?: LeadFilters): Promise<PaginatedLeads> => {
  const response = await apiClient.get(`${BASE_PATH}/leads`, { params: filters });
  return response.data;
};

// ============================================
// LEAD MAGNET GENERATION
// ============================================

export const generateLeadMagnet = async (data: GenerateLeadMagnetRequest) => {
  const response = await apiClient.post(`${BASE_PATH}/lead-magnets/generate`, data);
  return response.data;
};

// ============================================
// SCRAPER LOGS & DEBUGGING
// ============================================

export const getScraperLogs = async (network?: string, limit?: number) => {
  const response = await apiClient.get(`${BASE_PATH}/scraper-logs`, {
    params: { network, limit },
  });
  return response.data;
};
