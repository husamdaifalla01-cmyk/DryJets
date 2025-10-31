/**
 * CONTENT API
 *
 * API client functions for content and blog post management.
 * Maps to backend ContentController endpoints.
 *
 * @module lib/api/content
 */

import apiClient from './client';
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
 * Content response type
 */
export interface Content {
  id: string;
  profileId: string;
  campaignId?: string;
  type: 'blog' | 'social-post' | 'video-script' | 'email' | 'newsletter' | 'thread' | 'carousel' | 'infographic';
  title: string;
  body: string;
  excerpt?: string;
  status: 'draft' | 'pending-review' | 'approved' | 'scheduled' | 'published' | 'failed' | 'archived';
  targetPlatforms: string[];
  tags?: string[];
  keywords?: string[];
  mediaUrls?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
}

/**
 * Blog post response type (extends Content with blog-specific fields)
 */
export interface BlogPost extends Content {
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  author?: string;
  categories?: string[];
  readTime?: number;
  viewCount?: number;
}

/**
 * Paginated content response
 */
export interface PaginatedContent {
  data: Content[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Publishing result
 */
export interface PublishingResult {
  contentId: string;
  platform: string;
  status: 'success' | 'failed' | 'pending';
  publishedUrl?: string;
  publishedAt?: string;
  error?: string;
}

const BASE_PATH = '/marketing/content';

/**
 * Get all content with optional filtering
 * @useCase UC050 - List Content
 */
export const getContent = async (
  params?: ContentQueryParams
): Promise<PaginatedContent> => {
  const response = await apiClient.get<PaginatedContent>(BASE_PATH, { params });
  return response.data;
};

/**
 * Get single content by ID
 * @useCase UC050 - Get Content Details
 */
export const getContentById = async (id: string): Promise<Content> => {
  const response = await apiClient.get<Content>(`${BASE_PATH}/${id}`);
  return response.data;
};

/**
 * Get blog post by ID (with blog-specific fields)
 */
export const getBlogPostById = async (id: string): Promise<BlogPost> => {
  const response = await apiClient.get<BlogPost>(`${BASE_PATH}/blogs/${id}`);
  return response.data;
};

/**
 * Create new content (generic)
 * @useCase UC050 - Create Content
 */
export const createContent = async (
  data: CreateContentFormData
): Promise<Content> => {
  const response = await apiClient.post<Content>(BASE_PATH, data);
  return response.data;
};

/**
 * Create new blog post (specialized)
 * @useCase UC052 - Create Blog Post
 */
export const createBlogPost = async (
  data: CreateBlogPostFormData
): Promise<BlogPost> => {
  const response = await apiClient.post<BlogPost>(`${BASE_PATH}/blogs`, data);
  return response.data;
};

/**
 * Update existing content
 * @useCase UC051 - Update Content
 */
export const updateContent = async (
  id: string,
  data: UpdateContentFormData
): Promise<Content> => {
  const response = await apiClient.put<Content>(`${BASE_PATH}/${id}`, data);
  return response.data;
};

/**
 * Update blog post
 */
export const updateBlogPost = async (
  id: string,
  data: Partial<CreateBlogPostFormData>
): Promise<BlogPost> => {
  const response = await apiClient.put<BlogPost>(`${BASE_PATH}/blogs/${id}`, data);
  return response.data;
};

/**
 * Delete content
 */
export const deleteContent = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/${id}`);
};

/**
 * Publish content to platforms
 * @useCase UC053 - Publish Content
 */
export const publishContent = async (
  data: PublishContentFormData
): Promise<PublishingResult[]> => {
  const { contentId, ...publishData } = data;
  const response = await apiClient.post<PublishingResult[]>(
    `${BASE_PATH}/${contentId}/publish`,
    publishData
  );
  return response.data;
};

/**
 * Schedule content for future publishing
 * @useCase UC054 - Schedule Content
 */
export const scheduleContent = async (
  data: ScheduleContentFormData
): Promise<Content> => {
  const { contentId, ...scheduleData } = data;
  const response = await apiClient.post<Content>(
    `${BASE_PATH}/${contentId}/schedule`,
    scheduleData
  );
  return response.data;
};

/**
 * Generate content with AI
 * @useCase UC055 - Generate Content with AI
 */
export const generateContent = async (
  data: GenerateContentFormData
): Promise<{ content: string; suggestions: string[] }> => {
  const response = await apiClient.post<{ content: string; suggestions: string[] }>(
    `${BASE_PATH}/generate`,
    data
  );
  return response.data;
};

/**
 * Get publishing history for content
 */
export const getPublishingHistory = async (
  contentId: string
): Promise<PublishingResult[]> => {
  const response = await apiClient.get<PublishingResult[]>(
    `${BASE_PATH}/${contentId}/publishing-history`
  );
  return response.data;
};

/**
 * Unpublish content from platforms
 */
export const unpublishContent = async (
  contentId: string,
  platforms: string[]
): Promise<void> => {
  await apiClient.post(`${BASE_PATH}/${contentId}/unpublish`, { platforms });
};

/**
 * Duplicate content
 */
export const duplicateContent = async (id: string): Promise<Content> => {
  const response = await apiClient.post<Content>(`${BASE_PATH}/${id}/duplicate`);
  return response.data;
};
