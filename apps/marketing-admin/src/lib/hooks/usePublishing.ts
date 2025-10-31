import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPublishingStats,
  getPublishingQueue,
  publishContent,
  cancelScheduledPost,
  retryFailedPost,
  PublishingStats,
  PublishedPost,
  PublishContentDto,
} from '@/lib/api/publishing';

/**
 * PUBLISHING REACT QUERY HOOKS
 *
 * Custom hooks for publishing queue management with React Query.
 * Includes automatic caching and refetching for publishing data.
 */

export const PUBLISHING_QUERY_KEYS = {
  all: (profileId: string) => ['publishing', profileId] as const,
  stats: (profileId: string) => [...PUBLISHING_QUERY_KEYS.all(profileId), 'stats'] as const,
  queue: (profileId: string) => [...PUBLISHING_QUERY_KEYS.all(profileId), 'queue'] as const,
};

/**
 * Get publishing stats for a profile
 * Refetches every 2 minutes
 */
export const usePublishingStats = (profileId: string) => {
  return useQuery<PublishingStats>({
    queryKey: PUBLISHING_QUERY_KEYS.stats(profileId),
    queryFn: () => getPublishingStats(profileId),
    enabled: !!profileId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
};

/**
 * Get publishing queue for a profile
 * Refetches every 1 minute
 */
export const usePublishingQueue = (profileId: string) => {
  return useQuery<PublishedPost[]>({
    queryKey: PUBLISHING_QUERY_KEYS.queue(profileId),
    queryFn: () => getPublishingQueue(profileId),
    enabled: !!profileId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Auto-refetch every minute
  });
};

/**
 * Publish content mutation
 */
export const usePublishContent = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublishContentDto) => publishContent(profileId, data),
    onSuccess: (publishedPost) => {
      // Invalidate publishing queries
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.all(profileId) });

      toast.success('CONTENT SCHEDULED', {
        description: `Publishing to ${publishedPost.platform} ${publishedPost.scheduledFor ? 'at scheduled time' : 'now'}.`,
      });
    },
    onError: (error: any) => {
      toast.error('PUBLISHING FAILED', {
        description: error.response?.data?.message || 'Failed to schedule content. Please try again.',
      });
    },
  });
};

/**
 * Cancel scheduled post mutation
 */
export const useCancelScheduledPost = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => cancelScheduledPost(profileId, postId),
    onSuccess: () => {
      // Invalidate publishing queries
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.all(profileId) });

      toast.success('POST CANCELLED', {
        description: 'Scheduled post has been cancelled.',
      });
    },
    onError: () => {
      toast.error('CANCELLATION FAILED', {
        description: 'Failed to cancel post. Please try again.',
      });
    },
  });
};

/**
 * Retry failed post mutation
 */
export const useRetryFailedPost = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => retryFailedPost(profileId, postId),
    onSuccess: () => {
      // Invalidate publishing queries
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.all(profileId) });

      toast.success('POST RETRYING', {
        description: 'Post is being retried for publishing.',
      });
    },
    onError: () => {
      toast.error('RETRY FAILED', {
        description: 'Failed to retry post. Please try again.',
      });
    },
  });
};
