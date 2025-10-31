import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getActiveCampaigns,
  getTodaySchedule,
  getPlatformHealth,
  getRecentActivity,
  DashboardStats,
  ActiveCampaign,
  ScheduleItem,
  PlatformHealthStatus,
  ActivityItem,
} from '@/lib/api/dashboard';

/**
 * DASHBOARD REACT QUERY HOOKS
 *
 * Custom hooks for dashboard data management with React Query.
 * Includes automatic caching and refetching for dashboard widgets.
 */

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  stats: () => [...DASHBOARD_QUERY_KEYS.all, 'stats'] as const,
  campaigns: () => [...DASHBOARD_QUERY_KEYS.all, 'campaigns'] as const,
  schedule: () => [...DASHBOARD_QUERY_KEYS.all, 'schedule'] as const,
  health: () => [...DASHBOARD_QUERY_KEYS.all, 'health'] as const,
  activity: () => [...DASHBOARD_QUERY_KEYS.all, 'activity'] as const,
};

/**
 * Get dashboard overview stats
 * Refetches every 5 minutes
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_QUERY_KEYS.stats(),
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};

/**
 * Get active campaigns across all profiles
 * Refetches every 2 minutes
 */
export const useActiveCampaigns = () => {
  return useQuery<ActiveCampaign[]>({
    queryKey: DASHBOARD_QUERY_KEYS.campaigns(),
    queryFn: getActiveCampaigns,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
};

/**
 * Get today's publishing schedule
 * Refetches every 1 minute
 */
export const useTodaySchedule = () => {
  return useQuery<ScheduleItem[]>({
    queryKey: DASHBOARD_QUERY_KEYS.schedule(),
    queryFn: getTodaySchedule,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Auto-refetch every minute
  });
};

/**
 * Get platform health status
 * Refetches every 3 minutes
 */
export const usePlatformHealth = () => {
  return useQuery<PlatformHealthStatus[]>({
    queryKey: DASHBOARD_QUERY_KEYS.health(),
    queryFn: getPlatformHealth,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refetch every 3 minutes
  });
};

/**
 * Get recent activity feed
 * Refetches every 2 minutes
 */
export const useRecentActivity = () => {
  return useQuery<ActivityItem[]>({
    queryKey: DASHBOARD_QUERY_KEYS.activity(),
    queryFn: getRecentActivity,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
};
