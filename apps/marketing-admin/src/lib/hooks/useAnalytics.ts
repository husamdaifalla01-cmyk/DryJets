import { useQuery } from '@tanstack/react-query';
import {
  getPerformanceStats,
  getPlatformAnalytics,
  getTopContent,
  PerformanceStats,
  PlatformPerformance,
  ContentPerformance,
} from '@/lib/api/analytics';

/**
 * ANALYTICS REACT QUERY HOOKS
 *
 * Custom hooks for analytics data management with React Query.
 * Includes automatic caching and refetching for performance metrics.
 */

export const ANALYTICS_QUERY_KEYS = {
  all: (profileId: string) => ['analytics', profileId] as const,
  performance: (profileId: string) => [...ANALYTICS_QUERY_KEYS.all(profileId), 'performance'] as const,
  platforms: (profileId: string) => [...ANALYTICS_QUERY_KEYS.all(profileId), 'platforms'] as const,
  topContent: (profileId: string, limit: number) => [...ANALYTICS_QUERY_KEYS.all(profileId), 'top-content', limit] as const,
};

/**
 * Get performance stats for a profile
 * Refetches every 5 minutes
 */
export const usePerformanceStats = (profileId: string) => {
  return useQuery<PerformanceStats>({
    queryKey: ANALYTICS_QUERY_KEYS.performance(profileId),
    queryFn: () => getPerformanceStats(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};

/**
 * Get platform analytics
 * Refetches every 5 minutes
 */
export const usePlatformAnalytics = (profileId: string, platform?: string) => {
  return useQuery<PlatformPerformance[]>({
    queryKey: [...ANALYTICS_QUERY_KEYS.platforms(profileId), platform],
    queryFn: () => getPlatformAnalytics(profileId, platform),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};

/**
 * Get top performing content
 * Refetches every 10 minutes
 */
export const useTopContent = (profileId: string, limit: number = 10) => {
  return useQuery<ContentPerformance[]>({
    queryKey: ANALYTICS_QUERY_KEYS.topContent(profileId, limit),
    queryFn: () => getTopContent(profileId, limit),
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refetch every 10 minutes
  });
};
