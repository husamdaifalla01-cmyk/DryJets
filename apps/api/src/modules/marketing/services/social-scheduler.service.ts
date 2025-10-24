import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * SocialSchedulerService
 *
 * Manages social media posting across multiple platforms
 * Handles scheduling, queue management, and publishing
 */
@Injectable()
export class SocialSchedulerService {
  private logger = new Logger('SocialScheduler');

  constructor(private prisma: PrismaService) {}

  /**
   * Schedule a social post
   */
  async schedulePost(campaignId: string, data: any): Promise<any> {
    this.logger.log(`[Social] Scheduling post for campaign: ${campaignId}`);

    const platform = data.platform.toLowerCase();
    const scheduledTime = new Date(data.scheduledTime);

    // Validate scheduled time is in future
    if (scheduledTime < new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    // Create social queue entry
    const queueEntry = await this.prisma.socialQueue.create({
      data: {
        campaignId,
        platform,
        content: data.content,
        scheduledTime,
        status: 'QUEUED',
      },
    });

    this.logger.log(`[Social] Post scheduled: ${queueEntry.id} for ${platform} at ${scheduledTime}`);

    return {
      queueId: queueEntry.id,
      platform,
      status: 'QUEUED',
      scheduledTime: scheduledTime.toISOString(),
    };
  }

  /**
   * Schedule posts for multiple platforms with optimal timing
   */
  async scheduleMultiPlatform(campaignId: string, data: any): Promise<any> {
    this.logger.log(`[Social] Scheduling multi-platform posts for campaign: ${campaignId}`);

    const platforms = data.platforms || ['facebook', 'instagram', 'linkedin'];
    const baseTime = new Date(data.startTime || new Date());

    const scheduledPosts: any[] = [];

    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const optimalTime = this.calculateOptimalPostingTime(platform, baseTime, i);

      const queueEntry = await this.prisma.socialQueue.create({
        data: {
          campaignId,
          platform,
          content: data.content,
          scheduledTime: optimalTime,
          status: 'QUEUED',
        },
      });

      scheduledPosts.push({
        platform,
        queueId: queueEntry.id,
        scheduledTime: optimalTime,
      });
    }

    this.logger.log(`[Social] Scheduled ${scheduledPosts.length} posts across platforms`);

    return {
      campaignId,
      scheduledPosts,
      totalScheduled: scheduledPosts.length,
    };
  }

  /**
   * Calculate optimal posting time for platform
   */
  private calculateOptimalPostingTime(platform: string, baseTime: Date, offset: number): Date {
    const optimalHours: Record<string, number> = {
      facebook: 13, // 1 PM
      instagram: 11, // 11 AM
      linkedin: 8, // 8 AM
      twitter: 10, // 10 AM
      tiktok: 18, // 6 PM
    };

    const postTime = new Date(baseTime);
    const hour = optimalHours[platform.toLowerCase()] || 12;
    postTime.setHours(hour, 0, 0, 0);

    // Adjust if time has passed today
    if (postTime < new Date()) {
      postTime.setDate(postTime.getDate() + 1);
    }

    // Offset each platform by minutes to avoid bunching
    postTime.setMinutes(postTime.getMinutes() + offset * 5);

    return postTime;
  }

  /**
   * Get publishing queue for a campaign
   */
  async getQueue(campaignId: string, status?: string): Promise<any> {
    const queue = await this.prisma.socialQueue.findMany({
      where: {
        campaignId,
        ...(status && { status }),
      },
      orderBy: { scheduledTime: 'asc' },
    });

    const byStatus = {
      queued: queue.filter((q) => q.status === 'QUEUED').length,
      published: queue.filter((q) => q.status === 'PUBLISHED').length,
      failed: queue.filter((q) => q.status === 'FAILED').length,
    };

    const byPlatform: Record<string, number> = {};
    queue.forEach((q) => {
      byPlatform[q.platform] = (byPlatform[q.platform] || 0) + 1;
    });

    return {
      campaignId,
      total: queue.length,
      byStatus,
      byPlatform,
      queue,
    };
  }

  /**
   * Publish a post immediately
   */
  async publishNow(queueId: string): Promise<any> {
    this.logger.log(`[Social] Publishing post immediately: ${queueId}`);

    const queueEntry = await this.prisma.socialQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueEntry) {
      throw new Error('Queue entry not found');
    }

    // In production, this would call the platform API
    // For now, simulate publishing
    const published = await this.prisma.socialQueue.update({
      where: { id: queueId },
      data: {
        status: 'PUBLISHED',
        publishedTime: new Date(),
      },
    });

    this.logger.log(`[Social] Post published to ${published.platform}`);

    return {
      queueId: published.id,
      platform: published.platform,
      status: 'PUBLISHED',
      publishedTime: published.publishedTime,
    };
  }

  /**
   * Process scheduled posts (run periodically)
   */
  async processScheduledPosts(): Promise<any> {
    this.logger.log('[Social] Processing scheduled posts...');

    const now = new Date();

    // Find posts that are scheduled to post now or in the past
    const duePostsa = await this.prisma.socialQueue.findMany({
      where: {
        status: 'QUEUED',
        scheduledTime: { lte: now },
      },
      orderBy: { scheduledTime: 'asc' },
      take: 50,
    });

    let published = 0;
    let failed = 0;

    for (const post of duePostsa) {
      try {
        await this.publishNow(post.id);
        published++;
      } catch (error) {
        this.logger.error(`[Social] Failed to publish post: ${post.id}`, error.message);

        await this.prisma.socialQueue.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
          },
        });

        failed++;
      }
    }

    this.logger.log(`[Social] Processed ${published} published, ${failed} failed`);

    return {
      processed: duePostsa.length,
      published,
      failed,
    };
  }

  /**
   * Reschedule a post
   */
  async reschedulePost(queueId: string, newScheduledTime: Date): Promise<any> {
    if (newScheduledTime <= new Date()) {
      throw new Error('New scheduled time must be in the future');
    }

    const updated = await this.prisma.socialQueue.update({
      where: { id: queueId },
      data: {
        scheduledTime: newScheduledTime,
      },
    });

    return {
      queueId: updated.id,
      platform: updated.platform,
      rescheduledTime: updated.scheduledTime,
    };
  }

  /**
   * Cancel a scheduled post
   */
  async cancelPost(queueId: string): Promise<any> {
    const updated = await this.prisma.socialQueue.update({
      where: { id: queueId },
      data: {
        status: 'CANCELLED',
      },
    });

    this.logger.log(`[Social] Post cancelled: ${queueId}`);

    return {
      queueId: updated.id,
      status: 'CANCELLED',
    };
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(queueId: string): Promise<any> {
    const post = await this.prisma.socialQueue.findUnique({
      where: { id: queueId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // In production, this would fetch from platform APIs
    // For now, return sample data
    return {
      queueId: post.id,
      platform: post.platform,
      status: post.status,
      publishedTime: post.publishedTime,
      metrics: post.metrics || {
        impressions: 0,
        engagement: 0,
        clicks: 0,
        shares: 0,
      },
    };
  }

  /**
   * Get platform recommendations based on best posting times
   */
  getPlatformRecommendations(): any {
    const recommendations = [
      {
        platform: 'Facebook',
        bestTimes: ['1:00 PM', '7:00 PM'],
        bestDays: ['Tuesday', 'Wednesday'],
        estimatedReach: 50000,
        avgEngagement: '2-4%',
      },
      {
        platform: 'Instagram',
        bestTimes: ['11:00 AM', '8:00 PM'],
        bestDays: ['Monday', 'Wednesday', 'Friday'],
        estimatedReach: 35000,
        avgEngagement: '3-6%',
      },
      {
        platform: 'LinkedIn',
        bestTimes: ['8:00 AM', '5:00 PM'],
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        estimatedReach: 20000,
        avgEngagement: '1-2%',
      },
      {
        platform: 'Twitter',
        bestTimes: ['10:00 AM', '2:00 PM'],
        bestDays: ['Weekdays'],
        estimatedReach: 15000,
        avgEngagement: '0.5-1%',
      },
      {
        platform: 'TikTok',
        bestTimes: ['6:00 PM', '10:00 PM'],
        bestDays: ['Any day'],
        estimatedReach: 100000,
        avgEngagement: '5-10%',
      },
    ];

    return recommendations;
  }

  /**
   * Create social queue entries from campaign content
   */
  async createQueueFromCampaignContent(campaignId: string): Promise<any> {
    this.logger.log(`[Social] Creating social queue from campaign content: ${campaignId}`);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { campaignContents: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const socialContents = campaign.campaignContents.filter((c) => c.channel === 'SOCIAL');

    if (socialContents.length === 0) {
      return { message: 'No social content found for campaign' };
    }

    const platforms = ['facebook', 'instagram', 'linkedin'];
    const baseTime = new Date();
    baseTime.setDate(baseTime.getDate() + 1); // Start tomorrow

    const queued: any[] = [];

    for (const content of socialContents) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        const scheduledTime = this.calculateOptimalPostingTime(platform, baseTime, i);

        const queueEntry = await this.prisma.socialQueue.create({
          data: {
            campaignId,
            platform,
            contentId: content.id,
            content: (content.content as any)?.text || '',
            scheduledTime,
            status: 'QUEUED',
          },
        });

        queued.push(queueEntry);
      }
    }

    this.logger.log(`[Social] Created ${queued.length} queue entries`);

    return {
      campaignId,
      queuedPosts: queued.length,
      queue: queued,
    };
  }
}
