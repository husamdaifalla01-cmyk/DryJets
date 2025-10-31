import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getConnections,
  initiateOAuth,
  completeOAuth,
  connectApiKey,
  disconnectPlatform,
  checkPlatformHealth,
} from '@/lib/api/connections';
import {
  ConnectPlatformDto,
  CompleteOAuthDto,
  ConnectApiKeyDto,
  Platform,
} from '@/types/connection';

/**
 * CONNECTION REACT QUERY HOOKS
 */

export const CONNECTION_QUERY_KEYS = {
  all: (profileId: string) => ['connections', profileId] as const,
  list: (profileId: string) => [...CONNECTION_QUERY_KEYS.all(profileId), 'list'] as const,
  health: (profileId: string, platform: Platform) =>
    [...CONNECTION_QUERY_KEYS.all(profileId), 'health', platform] as const,
};

/**
 * Get all connections for a profile
 */
export const useConnections = (profileId: string) => {
  return useQuery({
    queryKey: CONNECTION_QUERY_KEYS.list(profileId),
    queryFn: () => getConnections(profileId),
    enabled: !!profileId,
  });
};

/**
 * Initiate OAuth flow
 */
export const useInitiateOAuth = () => {
  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: ConnectPlatformDto }) =>
      initiateOAuth(profileId, data),
    onSuccess: (authUrl) => {
      // Store state for validation
      localStorage.setItem('oauth_state', authUrl.state);
      // Redirect to platform auth
      window.location.href = authUrl.authUrl;
    },
    onError: () => {
      toast.error('OAUTH INITIATION FAILED', {
        description: 'Failed to start authentication flow.',
      });
    },
  });
};

/**
 * Complete OAuth flow
 */
export const useCompleteOAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: CompleteOAuthDto }) =>
      completeOAuth(profileId, data),
    onSuccess: (connection, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: CONNECTION_QUERY_KEYS.list(profileId) });
      localStorage.removeItem('oauth_state');

      toast.success('PLATFORM CONNECTED', {
        description: `${connection.platform} has been connected successfully.`,
      });
    },
    onError: () => {
      toast.error('CONNECTION FAILED', {
        description: 'Failed to complete platform connection.',
      });
    },
  });
};

/**
 * Connect via API key
 */
export const useConnectApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: ConnectApiKeyDto }) =>
      connectApiKey(profileId, data),
    onSuccess: (connection, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: CONNECTION_QUERY_KEYS.list(profileId) });

      toast.success('PLATFORM CONNECTED', {
        description: `${connection.platform} has been connected via API key.`,
      });
    },
    onError: () => {
      toast.error('CONNECTION FAILED', {
        description: 'Invalid API credentials. Please check and try again.',
      });
    },
  });
};

/**
 * Disconnect platform
 */
export const useDisconnectPlatform = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, platform }: { profileId: string; platform: Platform }) =>
      disconnectPlatform(profileId, platform),
    onSuccess: (_, { profileId, platform }) => {
      queryClient.invalidateQueries({ queryKey: CONNECTION_QUERY_KEYS.list(profileId) });

      toast.success('PLATFORM DISCONNECTED', {
        description: `${platform} has been disconnected.`,
      });
    },
    onError: () => {
      toast.error('DISCONNECTION FAILED', {
        description: 'Failed to disconnect platform.',
      });
    },
  });
};

/**
 * Check platform health
 */
export const usePlatformHealth = (profileId: string, platform: Platform, enabled = true) => {
  return useQuery({
    queryKey: CONNECTION_QUERY_KEYS.health(profileId, platform),
    queryFn: () => checkPlatformHealth(profileId, platform),
    enabled: enabled && !!profileId && !!platform,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
