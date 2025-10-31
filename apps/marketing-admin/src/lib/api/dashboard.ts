import apiClient from './client';
import { MarketingProfile } from '@/types/profile';
import { PlatformConnection } from '@/types/connection';

/**
 * DASHBOARD API FUNCTIONS
 *
 * Aggregates data from multiple endpoints for the home dashboard.
 * Maps to backend endpoints in ProfileController.
 */

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  activeCampaigns: number;
  totalReach: string;
  contentPublished: number;
  engagementRate: string;
}

/**
 * Active Campaign Summary
 */
export interface ActiveCampaign {
  id: string;
  name: string;
  profileName: string;
  progress: number;
  published: number;
  scheduled: number;
  status: 'active' | 'paused';
}

/**
 * Publishing Schedule Item
 */
export interface ScheduleItem {
  id: string;
  time: string;
  platform: string;
  title: string;
  campaignName: string;
}

/**
 * Platform Health Status
 */
export interface PlatformHealthStatus {
  platform: string;
  status: 'healthy' | 'warning' | 'error';
  connections: number;
}

/**
 * Recent Activity Item
 */
export interface ActivityItem {
  id: string;
  action: string;
  campaignName: string;
  time: string;
}

/**
 * Publishing Stats Response from Backend
 */
interface PublishingStats {
  totalPublished: number;
  scheduledCount: number;
  byPlatform: Record<string, number>;
  recentActivity: Array<{
    id: string;
    content: string;
    platform: string;
    publishedAt: string;
    campaignId?: string;
  }>;
}

/**
 * Performance Stats Response from Backend
 */
interface PerformanceStats {
  totalReach: number;
  totalEngagements: number;
  engagementRate: number;
  byPlatform: Record<string, {
    reach: number;
    engagements: number;
  }>;
}

/**
 * Get dashboard overview stats
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get all profiles to count active campaigns
    const profilesResponse = await apiClient.get<MarketingProfile[]>('/marketing/profiles');
    const profiles = profilesResponse.data;

    // Count active campaigns across all profiles
    const activeCampaigns = profiles.reduce((count, profile) => {
      return count + (profile.campaigns?.filter(c => c.status === 'ACTIVE').length || 0);
    }, 0);

    // Get aggregate stats from first profile (or aggregate across all profiles)
    let totalPublished = 0;
    let totalReach = 0;
    let totalEngagements = 0;

    for (const profile of profiles.slice(0, 3)) { // Limit to first 3 for performance
      try {
        // Get publishing stats
        const publishingStatsRes = await apiClient.get<PublishingStats>(
          `/marketing/profiles/${profile.id}/publishing-stats`
        );
        totalPublished += publishingStatsRes.data.totalPublished || 0;

        // Get performance stats
        const performanceRes = await apiClient.get<PerformanceStats>(
          `/marketing/profiles/${profile.id}/performance`
        );
        totalReach += performanceRes.data.totalReach || 0;
        totalEngagements += performanceRes.data.totalEngagements || 0;
      } catch (err) {
        // Silently ignore errors for individual profiles
        console.warn(`Failed to fetch stats for profile ${profile.id}`, err);
      }
    }

    const engagementRate = totalReach > 0
      ? ((totalEngagements / totalReach) * 100).toFixed(1)
      : '0.0';

    return {
      activeCampaigns,
      totalReach: formatNumber(totalReach),
      contentPublished: totalPublished,
      engagementRate: `${engagementRate}%`,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    // Return default/empty stats on error
    return {
      activeCampaigns: 0,
      totalReach: '0',
      contentPublished: 0,
      engagementRate: '0.0%',
    };
  }
};

/**
 * Get active campaigns across all profiles
 */
export const getActiveCampaigns = async (): Promise<ActiveCampaign[]> => {
  try {
    const response = await apiClient.get<MarketingProfile[]>('/marketing/profiles');
    const profiles = response.data;

    const campaigns: ActiveCampaign[] = [];

    for (const profile of profiles) {
      if (profile.campaigns) {
        for (const campaign of profile.campaigns) {
          if (campaign.status === 'ACTIVE' || campaign.status === 'PAUSED') {
            // Get publishing stats for this campaign
            let published = 0;
            let scheduled = 0;
            try {
              const statsRes = await apiClient.get<PublishingStats>(
                `/marketing/profiles/${profile.id}/publishing-stats`
              );
              published = statsRes.data.totalPublished || 0;
              scheduled = statsRes.data.scheduledCount || 0;
            } catch (err) {
              console.warn(`Failed to fetch campaign stats`, err);
            }

            // Calculate progress (simple: published / total)
            const total = published + scheduled;
            const progress = total > 0 ? Math.round((published / total) * 100) : 0;

            campaigns.push({
              id: campaign.id,
              name: campaign.name || 'Untitled Campaign',
              profileName: profile.brandName || profile.name,
              progress,
              published,
              scheduled,
              status: campaign.status.toLowerCase() as 'active' | 'paused',
            });
          }
        }
      }
    }

    return campaigns.slice(0, 5); // Return top 5
  } catch (error) {
    console.error('Failed to fetch active campaigns:', error);
    return [];
  }
};

/**
 * Get today's publishing schedule
 */
export const getTodaySchedule = async (): Promise<ScheduleItem[]> => {
  try {
    const response = await apiClient.get<MarketingProfile[]>('/marketing/profiles');
    const profiles = response.data;

    const scheduleItems: ScheduleItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const profile of profiles.slice(0, 3)) {
      try {
        const statsRes = await apiClient.get<PublishingStats>(
          `/marketing/profiles/${profile.id}/publishing-stats`
        );

        // Extract scheduled items for today (mock for now, adjust based on actual API)
        // In real implementation, backend should return scheduled posts with timestamps
        if (statsRes.data.scheduledCount > 0) {
          // Add placeholder schedule items
          scheduleItems.push({
            id: `${profile.id}-1`,
            time: '2:00 PM',
            platform: 'Twitter',
            title: 'Scheduled content post',
            campaignName: profile.campaigns?.[0]?.name || 'Campaign',
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch schedule for profile ${profile.id}`, err);
      }
    }

    return scheduleItems.slice(0, 5);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return [];
  }
};

/**
 * Get platform health across all profiles
 */
export const getPlatformHealth = async (): Promise<PlatformHealthStatus[]> => {
  try {
    const response = await apiClient.get<MarketingProfile[]>('/marketing/profiles');
    const profiles = response.data;

    const platformMap = new Map<string, { connections: number; errors: number }>();

    for (const profile of profiles) {
      try {
        const connectionsRes = await apiClient.get<PlatformConnection[]>(
          `/marketing/profiles/${profile.id}/connections`
        );
        const connections = connectionsRes.data;

        for (const conn of connections) {
          const existing = platformMap.get(conn.platform) || { connections: 0, errors: 0 };
          existing.connections += 1;
          if (conn.status !== 'ACTIVE') {
            existing.errors += 1;
          }
          platformMap.set(conn.platform, existing);
        }
      } catch (err) {
        console.warn(`Failed to fetch connections for profile ${profile.id}`, err);
      }
    }

    const healthStatuses: PlatformHealthStatus[] = [];
    for (const [platform, data] of platformMap.entries()) {
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (data.errors > 0) {
        status = data.errors >= data.connections ? 'error' : 'warning';
      }

      healthStatuses.push({
        platform: capitalize(platform),
        status,
        connections: data.connections,
      });
    }

    return healthStatuses;
  } catch (error) {
    console.error('Failed to fetch platform health:', error);
    return [];
  }
};

/**
 * Get recent activity feed
 */
export const getRecentActivity = async (): Promise<ActivityItem[]> => {
  try {
    const response = await apiClient.get<MarketingProfile[]>('/marketing/profiles');
    const profiles = response.data;

    const activities: ActivityItem[] = [];

    for (const profile of profiles.slice(0, 3)) {
      try {
        const statsRes = await apiClient.get<PublishingStats>(
          `/marketing/profiles/${profile.id}/publishing-stats`
        );

        // Extract recent activity from publishing stats
        if (statsRes.data.recentActivity) {
          for (const item of statsRes.data.recentActivity.slice(0, 3)) {
            const timeAgo = formatTimeAgo(new Date(item.publishedAt));
            activities.push({
              id: item.id,
              action: `Published on ${item.platform}`,
              campaignName: profile.campaigns?.[0]?.name || 'Campaign',
              time: timeAgo,
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch activity for profile ${profile.id}`, err);
      }
    }

    return activities.slice(0, 5);
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return [];
  }
};

/**
 * Helper: Format large numbers (e.g., 2400000 -> "2.4M")
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Helper: Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Helper: Format time ago (e.g., "2 hours ago")
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffMins > 0) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
