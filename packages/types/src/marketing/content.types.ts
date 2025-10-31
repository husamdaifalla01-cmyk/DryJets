/**
 * CONTENT TYPES
 *
 * @description Type definitions for content creation and management
 * @references MARKETING_ENGINE_UML_USE_CASE_DIAGRAM.md#content-creation-system
 * @apiDoc MARKETING_ENGINE_API_DOCUMENTATION.md#content-apis
 */

export type ContentType =
  | 'blog-post'
  | 'social-post'
  | 'video-script'
  | 'email'
  | 'landing-page'
  | 'ad-copy'
  | 'infographic'
  | 'podcast-script';

export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
export type ContentTone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'humorous' | 'inspirational';

export interface Content {
  id: string;
  profileId: string;
  campaignId?: string;

  // Basic info
  title: string;
  type: ContentType;
  status: ContentStatus;
  tone: ContentTone;

  // Content body
  body: string;
  summary?: string;
  excerpt?: string;

  // Targeting
  targetPlatforms: string[];
  targetAudience: string;

  // SEO
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;

  // Media
  images: ContentImage[];
  videos: ContentVideo[];

  // Scheduling
  scheduledAt?: string;
  publishedAt?: string;

  // Performance
  views: number;
  clicks: number;
  shares: number;
  likes: number;
  comments: number;
  saves: number;

  // AI generation metadata
  aiGenerated: boolean;
  aiModel?: string;
  promptUsed?: string;
  generationTime?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ContentImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ContentVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  format: string;
  size: number;
}

export interface ContentCalendar {
  profileId: string;
  startDate: string;
  endDate: string;
  entries: ContentCalendarEntry[];
}

export interface ContentCalendarEntry {
  date: string;
  content: Content[];
  count: number;
  platforms: string[];
}

export interface ContentAnalytics {
  contentId: string;
  timeRange: {
    start: string;
    end: string;
  };
  metrics: {
    views: number;
    uniqueViews: number;
    clicks: number;
    ctr: number;
    avgTimeOnPage?: number;
    bounceRate?: number;
    engagement: number;
    shares: number;
    comments: number;
    likes: number;
  };
  platformBreakdown: Record<string, number>;
  audienceInsights: {
    demographics: Record<string, number>;
    interests: string[];
    behavior: string[];
  };
}
