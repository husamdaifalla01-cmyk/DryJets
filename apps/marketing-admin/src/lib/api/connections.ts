import apiClient from './client';
import {
  PlatformConnection,
  OAuth2AuthUrl,
  ConnectionHealth,
  ConnectPlatformDto,
  CompleteOAuthDto,
  ConnectApiKeyDto,
  Platform,
} from '@/types/connection';

/**
 * CONNECTION API FUNCTIONS
 *
 * All API calls for platform connection management.
 */

const getBasePath = (profileId: string) => `/marketing/profiles/${profileId}/connections`;

/**
 * Get all connections for a profile
 */
export const getConnections = async (profileId: string): Promise<PlatformConnection[]> => {
  const response = await apiClient.get<PlatformConnection[]>(getBasePath(profileId));
  return response.data;
};

/**
 * Initiate OAuth flow
 */
export const initiateOAuth = async (
  profileId: string,
  data: ConnectPlatformDto
): Promise<OAuth2AuthUrl> => {
  const response = await apiClient.post<OAuth2AuthUrl>(
    `${getBasePath(profileId)}/oauth/initiate`,
    data
  );
  return response.data;
};

/**
 * Complete OAuth flow
 */
export const completeOAuth = async (
  profileId: string,
  data: CompleteOAuthDto
): Promise<PlatformConnection> => {
  const response = await apiClient.post<PlatformConnection>(
    `${getBasePath(profileId)}/oauth/complete`,
    data
  );
  return response.data;
};

/**
 * Connect via API key
 */
export const connectApiKey = async (
  profileId: string,
  data: ConnectApiKeyDto
): Promise<PlatformConnection> => {
  const response = await apiClient.post<PlatformConnection>(
    `${getBasePath(profileId)}/api-key`,
    data
  );
  return response.data;
};

/**
 * Disconnect platform
 */
export const disconnectPlatform = async (
  profileId: string,
  platform: Platform
): Promise<void> => {
  await apiClient.delete(`${getBasePath(profileId)}/${platform}`);
};

/**
 * Check platform health
 */
export const checkPlatformHealth = async (
  profileId: string,
  platform: Platform
): Promise<ConnectionHealth> => {
  const response = await apiClient.get<ConnectionHealth>(
    `${getBasePath(profileId)}/${platform}/health`
  );
  return response.data;
};
