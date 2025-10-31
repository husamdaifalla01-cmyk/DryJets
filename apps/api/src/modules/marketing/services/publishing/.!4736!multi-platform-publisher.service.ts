import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { TwitterIntegration } from '../platform-integrations/twitter.integration';
import { LinkedInIntegration } from '../platform-integrations/linkedin.integration';
import { FacebookInstagramIntegration } from '../platform-integrations/facebook.integration';
import { TikTokIntegration } from '../platform-integrations/tiktok.integration';
import { YouTubeIntegration } from '../platform-integrations/youtube.integration';

/**
 * MULTI-PLATFORM PUBLISHER SERVICE
 *
 * Publishes content to multiple platforms simultaneously with:
 * - Automatic platform-specific formatting
 * - Scheduling and queue management
 * - Error handling and retry logic
 * - Publishing confirmation and tracking
 * - Rate limit management
 */

export interface PublishRequest {
  profileId: string;
  campaignId?: string;
  content: {
    platform: string;
    type: string;
    title?: string;
    body: string;
    media?: {
      type: 'image' | 'video' | 'gif';
      url: string;
      altText?: string;
    }[];
    hashtags?: string[];
    scheduledFor?: Date;
  }[];
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  publishedAt?: Date;
  error?: string;
  retryable?: boolean;
}

export interface PublishSummary {
  requestId: string;
  profileId: string;
  campaignId?: string;
  totalPlatforms: number;
  successful: number;
  failed: number;
  results: PublishResult[];
  publishedAt: Date;
}

export interface ScheduledPost {
  id: string;
  profileId: string;
  campaignId?: string;
  platform: string;
  content: any;
  scheduledFor: Date;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  attempts: number;
  lastError?: string;
  publishedPostId?: string;
}

@Injectable()
export class MultiPlatformPublisherService {
  private readonly logger = new Logger(MultiPlatformPublisherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly twitterIntegration: TwitterIntegration,
    private readonly linkedInIntegration: LinkedInIntegration,
    private readonly facebookIntegration: FacebookInstagramIntegration,
    private readonly tiktokIntegration: TikTokIntegration,
    private readonly youtubeIntegration: YouTubeIntegration,
  ) {}

  /**
   * Publish content to multiple platforms
   */
  async publishToMultiplePlatforms(request: PublishRequest): Promise<PublishSummary> {
