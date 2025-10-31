import apiClient from './client';

/**
 * PUBLISHING API FUNCTIONS
 *
 * API calls for content publishing and queue management.
 * Maps to backend endpoints in ProfileController.
 */

/**
 * Publishing Stats Response from Backend
 */
export interface PublishingStats {
  totalPublished: number;
  scheduledCount: number;
  publishedToday: number;
  inQueue: number;
  byPlatform: Record<string, number>;
  recentActivity: PublishedPost[];
}

/**
 * Published Post
 */
export interface PublishedPost {
  id: string;
  contentId: string;
  title: string;
  content: string;
  platform: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduledFor: string; // ISO date string
  publishedAt?: string; // ISO date string
  externalId?: string;
  externalUrl?: string;
  campaignId?: string;
  campaignName?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Publish Content DTO
 */
export interface PublishContentDto {
  contentId: string;
  platform: string;
  scheduledFor?: string; // ISO date string, optional (now if not provided)
}

/**
 * Get publishing stats for a profile
 */
export const getPublishingStats = async (
  profileId: string
): Promise<PublishingStats> => {
  const response = await apiClient.get<PublishingStats>(
    `/marketing/profiles/${profileId}/publishing-stats`
  );
  return response.data;
};

/**
 * Get publishing queue for a profile
 */
export const getPublishingQueue = async (
  profileId: string
): Promise<PublishedPost[]> => {
  const response = await apiClient.get<{ recentActivity: PublishedPost[] }>(
    `/marketing/profiles/${profileId}/publishing-stats`
  );
  return response.data.recentActivity || [];
};

/**
 * Publish content to a platform
 */
export const publishContent = async (
  profileId: string,
  data: PublishContentDto
): Promise<PublishedPost> => {
  const response = await apiClient.post<PublishedPost>(
    `/marketing/profiles/${profileId}/publish`,
    data
  );
  return response.data;
};

/**
 * Delete/cancel scheduled post
 */
export const cancelScheduledPost = async (
  profileId: string,
  postId: string
): Promise<void> => {
  await apiClient.delete(
    `/marketing/profiles/${profileId}/published-posts/${postId}`
  );
};

/**
 * Retry failed post
 */
export const retryFailedPost = async (
  profileId: string,
  postId: string
): Promise<PublishedPost> => {
  const response = await apiClient.post<PublishedPost>(
    `/marketing/profiles/${profileId}/published-posts/${postId}/retry`
  );
  return response.data;
};
