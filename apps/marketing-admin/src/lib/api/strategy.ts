import apiClient from './client';
import { LandscapeAnalysis, MarketingStrategy } from '@/types/strategy';

/**
 * STRATEGY API FUNCTIONS
 */

const getBasePath = (profileId: string) => `/marketing/profiles/${profileId}`;

/**
 * Analyze landscape (trigger AI analysis)
 */
export const analyzeLandscape = async (profileId: string): Promise<LandscapeAnalysis> => {
  const response = await apiClient.post<LandscapeAnalysis>(
    `${getBasePath(profileId)}/analyze-landscape`
  );
  return response.data;
};

/**
 * Get cached landscape analysis
 */
export const getLandscape = async (profileId: string): Promise<LandscapeAnalysis> => {
  const response = await apiClient.get<LandscapeAnalysis>(
    `${getBasePath(profileId)}/landscape`
  );
  return response.data;
};

/**
 * Generate marketing strategy
 */
export const generateStrategy = async (profileId: string): Promise<MarketingStrategy> => {
  const response = await apiClient.post<MarketingStrategy>(
    `${getBasePath(profileId)}/generate-strategy`
  );
  return response.data;
};

/**
 * Get cached strategy
 */
export const getStrategy = async (profileId: string): Promise<MarketingStrategy> => {
  const response = await apiClient.get<MarketingStrategy>(
    `${getBasePath(profileId)}/strategy`
  );
  return response.data;
};
