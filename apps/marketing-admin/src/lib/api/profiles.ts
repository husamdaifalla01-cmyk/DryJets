import apiClient from './client';
import {
  MarketingProfile,
  ProfileStats,
  CreateProfileDto,
  UpdateProfileDto,
} from '@/types/profile';

/**
 * PROFILE API FUNCTIONS
 *
 * All API calls for marketing profile management.
 * Maps to backend endpoints in ProfileController.
 */

const BASE_PATH = '/marketing/profiles';

/**
 * Get all profiles for current user
 */
export const getAllProfiles = async (): Promise<MarketingProfile[]> => {
  const response = await apiClient.get<MarketingProfile[]>(BASE_PATH);
  return response.data;
};

/**
 * Get single profile by ID
 */
export const getProfileById = async (id: string): Promise<MarketingProfile> => {
  const response = await apiClient.get<MarketingProfile>(`${BASE_PATH}/${id}`);
  return response.data;
};

/**
 * Create new profile
 */
export const createProfile = async (
  data: CreateProfileDto
): Promise<MarketingProfile> => {
  const response = await apiClient.post<MarketingProfile>(BASE_PATH, data);
  return response.data;
};

/**
 * Update existing profile
 */
export const updateProfile = async (
  id: string,
  data: UpdateProfileDto
): Promise<MarketingProfile> => {
  const response = await apiClient.put<MarketingProfile>(
    `${BASE_PATH}/${id}`,
    data
  );
  return response.data;
};

/**
 * Delete profile
 */
export const deleteProfile = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/${id}`);
};

/**
 * Get profile statistics
 */
export const getProfileStats = async (id: string): Promise<ProfileStats> => {
  const response = await apiClient.get<ProfileStats>(`${BASE_PATH}/${id}/stats`);
  return response.data;
};

/**
 * Activate profile
 */
export const activateProfile = async (id: string): Promise<MarketingProfile> => {
  const response = await apiClient.post<MarketingProfile>(
    `${BASE_PATH}/${id}/activate`
  );
  return response.data;
};

/**
 * Pause profile
 */
export const pauseProfile = async (id: string): Promise<MarketingProfile> => {
  const response = await apiClient.post<MarketingProfile>(
    `${BASE_PATH}/${id}/pause`
  );
  return response.data;
};

/**
 * Archive profile
 */
export const archiveProfile = async (id: string): Promise<MarketingProfile> => {
  const response = await apiClient.post<MarketingProfile>(
    `${BASE_PATH}/${id}/archive`
  );
  return response.data;
};
