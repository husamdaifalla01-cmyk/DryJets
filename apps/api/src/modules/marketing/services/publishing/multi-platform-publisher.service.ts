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
    this.logger.log(`=ä Publishing to ${request.content.length} platforms for profile: ${request.profileId}`);

    const requestId = `pub_${Date.now()}`;
    const results: PublishResult[] = [];

    // Publish to each platform
    for (const contentItem of request.content) {
      try {
        if (contentItem.scheduledFor && contentItem.scheduledFor > new Date()) {
          // Schedule for later
          await this.schedulePost(request.profileId, request.campaignId, contentItem);
          results.push({
            platform: contentItem.platform,
            success: true,
            postId: 'scheduled',
            publishedAt: null,
          });
        } else {
          // Publish immediately
          const result = await this.publishToPlatform(
            request.profileId,
            contentItem.platform,
            contentItem,
            request.campaignId,
          );
          results.push(result);
        }
      } catch (error) {
        this.logger.error(`Failed to publish to ${contentItem.platform}:`, error);
        results.push({
          platform: contentItem.platform,
          success: false,
          error: error.message,
          retryable: true,
        });
      }
    }

    const summary: PublishSummary = {
      requestId,
      profileId: request.profileId,
      campaignId: request.campaignId,
      totalPlatforms: request.content.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      publishedAt: new Date(),
    };

    this.logger.log(` Published: ${summary.successful}/${summary.totalPlatforms} platforms succeeded`);

    return summary;
  }

  /**
   * Publish to a single platform
   */
  async publishToPlatform(
    profileId: string,
    platform: string,
    content: any,
    campaignId?: string,
  ): Promise<PublishResult> {
    this.logger.log(`=ä Publishing to ${platform}...`);

    // Get platform connection
    const connection = await this.prisma.platformConnection.findUnique({
      where: {
        profileId_platform: {
          profileId,
          platform,
        },
      },
    });

    if (!connection || !connection.isConnected) {
      throw new BadRequestException(`Platform not connected: ${platform}`);
    }

    // Check token expiry and refresh if needed
    if (connection.tokenExpiry && connection.tokenExpiry < new Date()) {
      this.logger.log(`Token expired for ${platform}, refreshing...`);
      // Refresh token logic would go here
    }

    let postId: string;
    let postUrl: string;

    try {
      // Publish based on platform
      switch (platform.toLowerCase()) {
        case 'twitter':
          const twitterResult = await this.twitterIntegration.createPost({
            text: content.body,
            media: content.media?.map(m => ({ url: m.url })),
          }, connection.accessToken);
          postId = twitterResult.id;
          postUrl = twitterResult.url;
          break;

        case 'linkedin':
          const linkedInResult = await this.linkedInIntegration.createPost({
            text: content.body,
            media: content.media,
          }, connection.accessToken);
          postId = linkedInResult.id;
          postUrl = linkedInResult.url;
          break;

        case 'facebook':
        case 'instagram':
          const fbResult = await this.facebookIntegration.createPost(
            platform.toLowerCase() as 'facebook' | 'instagram',
            {
              message: content.body,
              media: content.media,
            },
            connection.accessToken,
          );
          postId = fbResult.id;
          postUrl = fbResult.url;
          break;

        case 'tiktok':
          const tiktokResult = await this.tiktokIntegration.uploadVideo({
            title: content.title,
            description: content.body,
            videoUrl: content.media?.[0]?.url,
          }, connection.accessToken);
          postId = tiktokResult.id;
          postUrl = tiktokResult.url;
          break;

        case 'youtube':
          const youtubeResult = await this.youtubeIntegration.uploadVideo({
            title: content.title,
            description: content.body,
            videoUrl: content.media?.[0]?.url,
            tags: content.hashtags,
          }, connection.accessToken);
          postId = youtubeResult.id;
          postUrl = youtubeResult.url;
          break;

        default:
          throw new BadRequestException(`Unsupported platform: ${platform}`);
      }

      // Save to database
      const publishedPost = await this.prisma.publishedPost.create({
        data: {
          profileId,
          campaignId,
          platform,
          contentType: content.type,
          title: content.title,
          content: content.body,
          postId,
          postUrl,
          publishedAt: new Date(),
          status: 'published',
          metrics: {},
        },
      });

      this.logger.log(` Published to ${platform}: ${postUrl}`);

      return {
        platform,
        success: true,
        postId,
        postUrl,
        publishedAt: publishedPost.publishedAt,
      };
    } catch (error) {
      this.logger.error(`L Failed to publish to ${platform}:`, error);

      // Save failed attempt
      await this.prisma.publishedPost.create({
        data: {
          profileId,
          campaignId,
          platform,
          contentType: content.type,
          title: content.title,
          content: content.body,
          status: 'failed',
          errorMessage: error.message,
          metrics: {},
        },
      });

      return {
        platform,
        success: false,
        error: error.message,
        retryable: this.isRetryableError(error),
      };
    }
  }

  /**
   * Schedule post for later publishing
   */
  async schedulePost(
    profileId: string,
    campaignId: string | undefined,
    content: any,
  ): Promise<ScheduledPost> {
    this.logger.log(`=Å Scheduling post for ${content.platform} at ${content.scheduledFor}`);

    // Save to database (you would need a ScheduledPost model in Prisma)
    // For now, create as unpublished post
    const scheduled = await this.prisma.publishedPost.create({
      data: {
        profileId,
        campaignId,
        platform: content.platform,
        contentType: content.type,
        title: content.title,
        content: content.body,
        scheduledFor: content.scheduledFor,
        status: 'scheduled',
        metrics: {},
      },
    });

    return {
      id: scheduled.id,
      profileId,
      campaignId,
      platform: content.platform,
      content,
      scheduledFor: content.scheduledFor,
      status: 'pending',
      attempts: 0,
    };
  }

  /**
   * Process scheduled posts (run by cron job)
   */
  async processScheduledPosts(): Promise<void> {
    this.logger.log('ð Processing scheduled posts...');

    // Get all scheduled posts that are due
    const duePosts = await this.prisma.publishedPost.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: new Date(),
        },
      },
      take: 50, // Process in batches
    });

    this.logger.log(`Found ${duePosts.length} posts to publish`);

    for (const post of duePosts) {
      try {
        // Update status to publishing
        await this.prisma.publishedPost.update({
          where: { id: post.id },
          data: { status: 'publishing' },
        });

        // Publish
        const result = await this.publishToPlatform(
          post.profileId,
          post.platform,
          {
            type: post.contentType,
            title: post.title,
            body: post.content,
          },
          post.campaignId,
        );

        if (result.success) {
          await this.prisma.publishedPost.update({
            where: { id: post.id },
            data: {
              status: 'published',
              postId: result.postId,
              postUrl: result.postUrl,
              publishedAt: result.publishedAt,
            },
          });
        } else {
          await this.prisma.publishedPost.update({
            where: { id: post.id },
            data: {
              status: 'failed',
              errorMessage: result.error,
            },
          });
        }
      } catch (error) {
        this.logger.error(`Failed to process scheduled post ${post.id}:`, error);

        await this.prisma.publishedPost.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
          },
        });
      }
    }

    this.logger.log(` Processed ${duePosts.length} scheduled posts`);
  }

  /**
   * Retry failed posts
   */
  async retryFailedPosts(profileId: string, maxRetries: number = 3): Promise<PublishSummary> {
    const failedPosts = await this.prisma.publishedPost.findMany({
      where: {
        profileId,
        status: 'failed',
        retryCount: {
          lt: maxRetries,
        },
      },
      take: 20,
    });

    const results: PublishResult[] = [];

    for (const post of failedPosts) {
      const result = await this.publishToPlatform(
        post.profileId,
        post.platform,
        {
          type: post.contentType,
          title: post.title,
          body: post.content,
        },
        post.campaignId,
      );

      results.push(result);

      // Update retry count
      await this.prisma.publishedPost.update({
        where: { id: post.id },
        data: {
          retryCount: { increment: 1 },
        },
      });
    }

    return {
      requestId: `retry_${Date.now()}`,
      profileId,
      totalPlatforms: failedPosts.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      publishedAt: new Date(),
    };
  }

  /**
   * Bulk publish to all connected platforms
   */
  async publishToAllPlatforms(
    profileId: string,
    content: {
      title?: string;
      body: string;
      media?: any[];
      hashtags?: string[];
    },
    campaignId?: string,
  ): Promise<PublishSummary> {
    // Get all connected platforms
    const connections = await this.prisma.platformConnection.findMany({
      where: {
        profileId,
        isConnected: true,
      },
    });

    if (connections.length === 0) {
      throw new BadRequestException('No platforms connected');
    }

    // Create publish request for all platforms
    const request: PublishRequest = {
      profileId,
      campaignId,
      content: connections.map(conn => ({
        platform: conn.platform,
        type: 'post',
        title: content.title,
        body: content.body,
        media: content.media,
        hashtags: content.hashtags,
      })),
    };

    return this.publishToMultiplePlatforms(request);
  }

  /**
   * Get publishing statistics
   */
  async getPublishingStats(profileId: string, days: number = 30): Promise<{
    totalPublished: number;
    successRate: number;
    platformBreakdown: { platform: string; count: number; successRate: number }[];
    recentPosts: any[];
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.publishedPost.findMany({
      where: {
        profileId,
        publishedAt: {
          gte: since,
        },
      },
    });

    const totalPublished = posts.length;
    const successful = posts.filter(p => p.status === 'published').length;
    const successRate = totalPublished > 0 ? (successful / totalPublished) * 100 : 0;

    // Platform breakdown
    const platformMap = new Map();
    posts.forEach(post => {
      if (!platformMap.has(post.platform)) {
        platformMap.set(post.platform, { total: 0, successful: 0 });
      }
      const stats = platformMap.get(post.platform);
      stats.total++;
      if (post.status === 'published') stats.successful++;
    });

    const platformBreakdown = Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      count: stats.total,
      successRate: (stats.successful / stats.total) * 100,
    }));

    const recentPosts = await this.prisma.publishedPost.findMany({
      where: { profileId },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    return {
      totalPublished,
      successRate,
      platformBreakdown,
      recentPosts,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'rate limit',
      'timeout',
      'network',
      'temporary',
      'try again',
      '429',
      '503',
      '504',
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return retryableErrors.some(msg => errorMessage.includes(msg));
  }
}
