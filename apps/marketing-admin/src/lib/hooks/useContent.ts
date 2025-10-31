/**
 * CONTENT REACT QUERY HOOKS
 *
 * Custom hooks for content and blog post management with React Query.
 * Includes automatic caching, refetching, and optimistic updates.
 *
 * @module lib/hooks/useContent
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getContent,
  getContentById,
  getBlogPostById,
  createContent,
  createBlogPost,
  updateContent,
  updateBlogPost,
  deleteContent,
  publishContent,
  scheduleContent,
  generateContent,
  getPublishingHistory,
  unpublishContent,
  duplicateContent,
  Content,
  BlogPost,
  PublishingResult,
} from '@/lib/api/content';
import {
  CreateContentFormData,
  UpdateContentFormData,
  CreateBlogPostFormData,
  PublishContentFormData,
  ScheduleContentFormData,
  GenerateContentFormData,
  ContentQueryParams,
} from '@/lib/validations';

/**
 * Query key factory for content
 */
export const CONTENT_QUERY_KEYS = {
  all: ['content'] as const,
  lists: () => [...CONTENT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ContentQueryParams) =>
    [...CONTENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...CONTENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CONTENT_QUERY_KEYS.details(), id] as const,
  blogs: () => [...CONTENT_QUERY_KEYS.all, 'blogs'] as const,
  blog: (id: string) => [...CONTENT_QUERY_KEYS.blogs(), id] as const,
  publishingHistory: (id: string) =>
    [...CONTENT_QUERY_KEYS.detail(id), 'publishing-history'] as const,
};

/**
 * Get all content with optional filtering
 */
export const useContent = (params?: ContentQueryParams) => {
  return useQuery({
    queryKey: CONTENT_QUERY_KEYS.list(params),
    queryFn: () => getContent(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single content by ID
 */
export const useContentById = (id: string) => {
  return useQuery({
    queryKey: CONTENT_QUERY_KEYS.detail(id),
    queryFn: () => getContentById(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Get blog post by ID
 */
export const useBlogPost = (id: string) => {
  return useQuery({
    queryKey: CONTENT_QUERY_KEYS.blog(id),
    queryFn: () => getBlogPostById(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Get publishing history for content
 */
export const usePublishingHistory = (contentId: string) => {
  return useQuery({
    queryKey: CONTENT_QUERY_KEYS.publishingHistory(contentId),
    queryFn: () => getPublishingHistory(contentId),
    enabled: !!contentId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Create new content
 */
export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContentFormData) => createContent(data),
    onSuccess: (newContent) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });

      toast.success('CONTENT CREATED', {
        description: `${newContent.title} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error('CREATION FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to create content. Please try again.',
      });
    },
  });
};

/**
 * Create new blog post
 */
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogPostFormData) => createBlogPost(data),
    onSuccess: (newBlog) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.blogs() });

      toast.success('BLOG POST CREATED', {
        description: `${newBlog.title} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      toast.error('CREATION FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to create blog post. Please try again.',
      });
    },
  });
};

/**
 * Update content
 */
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContentFormData }) =>
      updateContent(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: CONTENT_QUERY_KEYS.detail(id) });

      const previousContent = queryClient.getQueryData<Content>(
        CONTENT_QUERY_KEYS.detail(id)
      );

      if (previousContent) {
        queryClient.setQueryData<Content>(CONTENT_QUERY_KEYS.detail(id), {
          ...previousContent,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousContent };
    },
    onSuccess: (updatedContent) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.detail(updatedContent.id),
      });

      toast.success('CONTENT UPDATED', {
        description: 'Changes saved successfully.',
      });
    },
    onError: (error: any, variables, context) => {
      if (context?.previousContent) {
        queryClient.setQueryData(
          CONTENT_QUERY_KEYS.detail(variables.id),
          context.previousContent
        );
      }

      toast.error('UPDATE FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to update content. Please try again.',
      });
    },
  });
};

/**
 * Update blog post
 */
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateBlogPostFormData>;
    }) => updateBlogPost(id, data),
    onSuccess: (updatedBlog) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.blogs() });
      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.blog(updatedBlog.id),
      });

      toast.success('BLOG POST UPDATED', {
        description: 'Changes saved successfully.',
      });
    },
    onError: (error: any) => {
      toast.error('UPDATE FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to update blog post. Please try again.',
      });
    },
  });
};

/**
 * Delete content
 */
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });

      toast.success('CONTENT DELETED', {
        description: 'Content has been permanently deleted.',
      });
    },
    onError: (error: any) => {
      toast.error('DELETION FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to delete content. Please try again.',
      });
    },
  });
};

/**
 * Publish content to platforms
 */
export const usePublishContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublishContentFormData) => publishContent(data),
    onSuccess: (results, variables) => {
      const successCount = results.filter((r) => r.status === 'success').length;
      const failCount = results.filter((r) => r.status === 'failed').length;

      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.detail(variables.contentId),
      });
      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.publishingHistory(variables.contentId),
      });

      if (failCount === 0) {
        toast.success('CONTENT PUBLISHED', {
          description: `Successfully published to ${successCount} platform${
            successCount > 1 ? 's' : ''
          }.`,
        });
      } else {
        toast.warning('PARTIAL PUBLISH', {
          description: `Published to ${successCount} platform(s), failed on ${failCount}.`,
        });
      }
    },
    onError: (error: any) => {
      toast.error('PUBLISHING FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to publish content. Please try again.',
      });
    },
  });
};

/**
 * Schedule content for future publishing
 */
export const useScheduleContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleContentFormData) => scheduleContent(data),
    onSuccess: (scheduledContent) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.detail(scheduledContent.id),
      });
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });

      toast.success('CONTENT SCHEDULED', {
        description: `${scheduledContent.title} scheduled for ${new Date(
          scheduledContent.scheduledFor!
        ).toLocaleString()}.`,
      });
    },
    onError: (error: any) => {
      toast.error('SCHEDULING FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to schedule content. Please try again.',
      });
    },
  });
};

/**
 * Generate content with AI
 */
export const useGenerateContent = () => {
  return useMutation({
    mutationFn: (data: GenerateContentFormData) => generateContent(data),
    onSuccess: () => {
      toast.success('CONTENT GENERATED', {
        description: 'AI has generated your content successfully.',
      });
    },
    onError: (error: any) => {
      toast.error('GENERATION FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to generate content. Please try again.',
      });
    },
  });
};

/**
 * Unpublish content from platforms
 */
export const useUnpublishContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentId, platforms }: { contentId: string; platforms: string[] }) =>
      unpublishContent(contentId, platforms),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.detail(variables.contentId),
      });
      queryClient.invalidateQueries({
        queryKey: CONTENT_QUERY_KEYS.publishingHistory(variables.contentId),
      });

      toast.success('CONTENT UNPUBLISHED', {
        description: `Removed from ${variables.platforms.length} platform(s).`,
      });
    },
    onError: (error: any) => {
      toast.error('UNPUBLISH FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to unpublish content. Please try again.',
      });
    },
  });
};

/**
 * Duplicate content
 */
export const useDuplicateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateContent(id),
    onSuccess: (duplicated) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.lists() });

      toast.success('CONTENT DUPLICATED', {
        description: `Created copy: ${duplicated.title}`,
      });
    },
    onError: (error: any) => {
      toast.error('DUPLICATION FAILED', {
        description:
          error?.response?.data?.message ||
          'Failed to duplicate content. Please try again.',
      });
    },
  });
};
