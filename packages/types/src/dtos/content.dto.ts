/**
 * CONTENT DTOs
 *
 * @description Data Transfer Objects for content operations
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#content-creation-system
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#content-apis
 * @useCase UC050-UC059 (Content Management)
 */

import type { ContentType, ContentStatus, ContentTone } from '../marketing/content.types';

/**
 * Create Content DTO
 * @useCase UC050 - Create Content
 */
export class CreateContentDto {
  /** Content title */
  title: string;

  /** Content body */
  body: string;

  /** Content type */
  type: ContentType;

  /** Content tone */
  tone: ContentTone;

  /** Summary/excerpt */
  summary?: string;

  /** Short excerpt for previews */
  excerpt?: string;

  /** Target platforms */
  targetPlatforms: string[];

  /** Target audience */
  targetAudience?: string;

  /** SEO keywords */
  keywords?: string[];

  /** Meta title for SEO */
  metaTitle?: string;

  /** Meta description for SEO */
  metaDescription?: string;

  /** URL slug */
  slug?: string;

  /** Campaign ID */
  campaignId?: string;

  /** Whether AI generated */
  aiGenerated?: boolean;

  /** AI model used */
  aiModel?: string;

  /** Prompt used for generation */
  promptUsed?: string;

  /** Images */
  images?: Array<{
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }>;

  /** Videos */
  videos?: Array<{
    url: string;
    thumbnailUrl: string;
    duration?: number;
  }>;

  /** Schedule for publishing */
  scheduledAt?: string;
}

/**
 * Update Content DTO
 * @useCase UC051 - Update Content
 */
export class UpdateContentDto {
  title?: string;
  body?: string;
  type?: ContentType;
  tone?: ContentTone;
  status?: ContentStatus;
  summary?: string;
  excerpt?: string;
  targetPlatforms?: string[];
  targetAudience?: string;
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  campaignId?: string;
  images?: Array<{
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  videos?: Array<{
    url: string;
    thumbnailUrl: string;
    duration?: number;
  }>;
  scheduledAt?: string;
}

/**
 * Create Blog Post DTO
 * @useCase UC052 - Create Blog Post
 */
export class CreateBlogPostDto {
  /** Post title */
  title: string;

  /** Post content */
  content: string;

  /** URL slug */
  slug?: string;

  /** Excerpt */
  excerpt?: string;

  /** Keywords */
  keywords?: string[];

  /** Meta title */
  metaTitle?: string;

  /** Meta description */
  metaDescription?: string;

  /** Featured image URL */
  featuredImage?: string;

  /** Author ID */
  authorId?: string;

  /** Categories */
  categories?: string[];

  /** Tags */
  tags?: string[];

  /** Whether AI generated */
  aiGenerated?: boolean;

  /** AI brief/prompt */
  aiBrief?: {
    topic: string;
    keywords: string[];
    tone: string;
    length: number;
    targetAudience: string;
  };

  /** Created by user ID */
  createdBy?: string;
}

/**
 * Publish Content DTO
 * @useCase UC053 - Publish Content
 */
export class PublishContentDto {
  /** Content ID to publish */
  contentId: string;

  /** Platforms to publish to */
  platforms: string[];

  /** Whether to publish immediately */
  publishImmediately?: boolean;

  /** Scheduled publish time */
  scheduledAt?: string;

  /** Platform-specific customizations */
  platformCustomizations?: Record<
    string,
    {
      title?: string;
      body?: string;
      hashtags?: string[];
      mentions?: string[];
    }
  >;
}

/**
 * Schedule Content DTO
 * @useCase UC054 - Schedule Content
 */
export class ScheduleContentDto {
  /** Content ID */
  contentId: string;

  /** Scheduled time */
  scheduledAt: string;

  /** Platforms */
  platforms: string[];

  /** Timezone */
  timezone?: string;
}

/**
 * Content Query Parameters
 */
export class ContentQueryDto {
  status?: ContentStatus;
  type?: ContentType;
  platform?: string;
  campaignId?: string;
  search?: string;
  keywords?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'publishedAt' | 'views' | 'engagement';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get Content Calendar DTO
 */
export class GetContentCalendarDto {
  /** Start date */
  startDate: string;

  /** End date */
  endDate: string;

  /** Filter by platform */
  platform?: string;

  /** Filter by campaign */
  campaignId?: string;

  /** Filter by status */
  status?: ContentStatus;
}

/**
 * Generate Content with AI DTO
 * @useCase UC055 - Generate Content with AI
 */
export class GenerateContentDto {
  /** Content type to generate */
  type: ContentType;

  /** Topic */
  topic: string;

  /** Keywords to include */
  keywords: string[];

  /** Target audience */
  targetAudience: string;

  /** Desired tone */
  tone: ContentTone;

  /** Desired length (words) */
  length: number;

  /** Target platforms */
  targetPlatforms?: string[];

  /** Additional context */
  context?: string;

  /** Example content */
  exampleContent?: string;

  /** Profile ID for brand voice */
  profileId?: string;
}
