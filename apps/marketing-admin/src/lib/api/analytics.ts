import apiClient from './client';

/**
 * ANALYTICS API FUNCTIONS
 *
 * API calls for performance analytics and metrics.
 * Maps to backend endpoints in ProfileController.
 */

/**
 * Performance Stats
 */
export interface PerformanceStats {
  totalReach: number;
  totalEngagements: number;
  engagementRate: number;
  conversions: number;
  byPlatform: Record<string, PlatformPerformance>;
  topContent: ContentPerformance[];
  trends: {
    reach: string;
    engagements: string;
    engagementRate: string;
    conversions: string;
  };
}

/**
 * Platform Performance
 */
export interface PlatformPerformance {
  platform: string;
  reach: number;
  engagement: number;
  rate: number;
  posts: number;
}

/**
 * Content Performance
 */
export interface ContentPerformance {
  id: string;
  title: string;
  platform: string;
  reach: number;
  engagement: number;
  roi: number;
}

/**
 * Get performance analytics for a profile
 */
export const getPerformanceStats = async (
  profileId: string
): Promise<PerformanceStats> => {
  const response = await apiClient.get<PerformanceStats>(
    `/marketing/profiles/${profileId}/performance`
  );
  return response.data;
};

/**
 * Get platform-specific analytics
 */
export const getPlatformAnalytics = async (
  profileId: string,
  platform?: string
): Promise<PlatformPerformance[]> => {
  const params = platform ? { platform } : {};
  const response = await apiClient.get<{ byPlatform: Record<string, PlatformPerformance> }>(
    `/marketing/profiles/${profileId}/performance`,
    { params }
  );

  // Convert object to array
  return Object.values(response.data.byPlatform || {});
};

/**
 * Get top performing content
 */
export const getTopContent = async (
  profileId: string,
  limit: number = 10
): Promise<ContentPerformance[]> => {
  const response = await apiClient.get<{ topContent: ContentPerformance[] }>(
    `/marketing/profiles/${profileId}/performance`,
    { params: { limit } }
  );
  return response.data.topContent || [];
};
