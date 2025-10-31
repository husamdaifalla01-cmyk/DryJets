import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * DOMAIN TRACKER SERVICE
 *
 * Tracks all published content across domains and platforms.
 * Provides unified view of content distribution and performance.
 *
 * Features:
 * - Track content across multiple domains
 * - Monitor post performance
 * - Content inventory management
 * - Cross-platform analytics
 * - Dead link detection
 */

export interface DomainContent {
  domain: string;
  platform: string;
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  failedPosts: number;
  lastPublished?: Date;
  avgPerformance: {
    views: number;
    engagement: number;
    conversions: number;
  };
}

export interface ContentInventory {
  profileId: string;
  totalContent: number;
  byPlatform: { platform: string; count: number }[];
  byDomain: { domain: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  recentlyPublished: any[];
}

@Injectable()
export class DomainTrackerService {
  private readonly logger = new Logger(DomainTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track published content for a domain
   */
  async trackDomain(domain: string, profileId: string): Promise<DomainContent> {
    const posts = await this.prisma.publishedPost.findMany({
      where: {
        profileId,
        postUrl: {
          contains: domain,
        },
      },
    });

    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
    const failedPosts = posts.filter(p => p.status === 'failed').length;

    const lastPublished = posts
      .filter(p => p.publishedAt)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())[0]?.publishedAt;

    const avgPerformance = {
      views: posts.reduce((sum, p) => sum + (p.views || 0), 0) / totalPosts || 0,
      engagement: posts.reduce((sum, p) => sum + (p.likes + p.comments + p.shares || 0), 0) / totalPosts || 0,
      conversions: posts.reduce((sum, p) => sum + (p.conversions || 0), 0) / totalPosts || 0,
    };

    return {
      domain,
      platform: posts[0]?.platform || 'unknown',
      totalPosts,
      publishedPosts,
      scheduledPosts,
      failedPosts,
      lastPublished,
      avgPerformance,
    };
  }

  /**
   * Get content inventory for a profile
   */
  async getContentInventory(profileId: string): Promise<ContentInventory> {
    const allContent = await this.prisma.publishedPost.findMany({
      where: { profileId },
      orderBy: { publishedAt: 'desc' },
    });

    // Group by platform
    const platformMap = new Map<string, number>();
    allContent.forEach(post => {
      platformMap.set(post.platform, (platformMap.get(post.platform) || 0) + 1);
    });
    const byPlatform = Array.from(platformMap.entries()).map(([platform, count]) => ({
      platform,
      count,
    }));

    // Group by domain
    const domainMap = new Map<string, number>();
    allContent.forEach(post => {
      if (post.postUrl) {
        const domain = new URL(post.postUrl).hostname;
        domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
      }
    });
    const byDomain = Array.from(domainMap.entries()).map(([domain, count]) => ({
      domain,
      count,
    }));

    // Group by status
    const statusMap = new Map<string, number>();
    allContent.forEach(post => {
      statusMap.set(post.status, (statusMap.get(post.status) || 0) + 1);
    });
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // Group by type
    const typeMap = new Map<string, number>();
    allContent.forEach(post => {
      typeMap.set(post.contentType, (typeMap.get(post.contentType) || 0) + 1);
    });
    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      profileId,
      totalContent: allContent.length,
      byPlatform,
      byDomain,
      byStatus,
      byType,
      recentlyPublished: allContent.slice(0, 20),
    };
  }

  /**
   * Get all tracked domains for a profile
   */
  async getTrackedDomains(profileId: string): Promise<DomainContent[]> {
    const posts = await this.prisma.publishedPost.findMany({
      where: { profileId },
      select: { postUrl: true, platform: true },
    });

    const domains = new Set<string>();
    posts.forEach(post => {
      if (post.postUrl) {
        try {
          domains.add(new URL(post.postUrl).hostname);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    const domainStats = await Promise.all(
      Array.from(domains).map(domain => this.trackDomain(domain, profileId)),
    );

    return domainStats.sort((a, b) => b.totalPosts - a.totalPosts);
  }

  /**
   * Check for dead links
   */
  async checkDeadLinks(profileId: string): Promise<{
    total: number;
    dead: number;
    working: number;
    unchecked: number;
    deadLinks: { postId: string; url: string; status: number }[];
  }> {
    const posts = await this.prisma.publishedPost.findMany({
      where: {
        profileId,
        postUrl: { not: null },
      },
      take: 100, // Limit to avoid rate limits
    });

    const results = {
      total: posts.length,
      dead: 0,
      working: 0,
      unchecked: 0,
      deadLinks: [],
    };

    for (const post of posts) {
      try {
        const response = await fetch(post.postUrl, { method: 'HEAD' });
        if (response.status >= 400) {
          results.dead++;
          results.deadLinks.push({
            postId: post.id,
            url: post.postUrl,
            status: response.status,
          });
        } else {
          results.working++;
        }
      } catch (error) {
        results.unchecked++;
      }
    }

    return results;
  }

  /**
   * Get performance across all domains
   */
  async getCrossplatformPerformance(profileId: string, days: number = 30): Promise<{
    totalReach: number;
    totalEngagement: number;
    totalConversions: number;
    platformComparison: {
      platform: string;
      reach: number;
      engagement: number;
      conversions: number;
      engagementRate: number;
      conversionRate: number;
    }[];
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.publishedPost.findMany({
      where: {
        profileId,
        publishedAt: { gte: since },
        status: 'published',
      },
    });

    const totalReach = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalEngagement = posts.reduce((sum, p) => sum + (p.likes + p.comments + p.shares || 0), 0);
    const totalConversions = posts.reduce((sum, p) => sum + (p.conversions || 0), 0);

    // Platform comparison
    const platformMap = new Map();
    posts.forEach(post => {
      if (!platformMap.has(post.platform)) {
        platformMap.set(post.platform, {
          reach: 0,
          engagement: 0,
          conversions: 0,
        });
      }
      const stats = platformMap.get(post.platform);
      stats.reach += post.views || 0;
      stats.engagement += (post.likes + post.comments + post.shares) || 0;
      stats.conversions += post.conversions || 0;
    });

    const platformComparison = Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      reach: stats.reach,
      engagement: stats.engagement,
      conversions: stats.conversions,
      engagementRate: stats.reach > 0 ? (stats.engagement / stats.reach) * 100 : 0,
      conversionRate: stats.engagement > 0 ? (stats.conversions / stats.engagement) * 100 : 0,
    }));

    return {
      totalReach,
      totalEngagement,
      totalConversions,
      platformComparison: platformComparison.sort((a, b) => b.reach - a.reach),
    };
  }

  /**
   * Export content inventory to CSV
   */
  async exportInventory(profileId: string): Promise<string> {
    const inventory = await this.getContentInventory(profileId);

    const csvLines = [
      'Platform,Post ID,Title,URL,Status,Published At,Views,Engagement,Conversions',
    ];

    for (const post of inventory.recentlyPublished) {
      csvLines.push(
        [
          post.platform,
          post.postId || 'N/A',
          post.title || 'Untitled',
          post.postUrl || 'N/A',
          post.status,
          post.publishedAt?.toISOString() || 'N/A',
          post.views || 0,
          (post.likes + post.comments + post.shares) || 0,
          post.conversions || 0,
        ].join(','),
      );
    }

    return csvLines.join('\n');
  }

  /**
   * Find duplicate content across platforms
   */
  async findDuplicates(profileId: string): Promise<{
    duplicates: {
      content: string;
      platforms: string[];
      postIds: string[];
      count: number;
    }[];
  }> {
    const posts = await this.prisma.publishedPost.findMany({
      where: { profileId },
      select: {
        id: true,
        platform: true,
        content: true,
      },
    });

    const contentMap = new Map();

    posts.forEach(post => {
      const normalizedContent = post.content.substring(0, 100).toLowerCase();
      if (!contentMap.has(normalizedContent)) {
        contentMap.set(normalizedContent, []);
      }
      contentMap.get(normalizedContent).push(post);
    });

    const duplicates = Array.from(contentMap.entries())
      .filter(([_, posts]) => posts.length > 1)
      .map(([content, posts]) => ({
        content: content.substring(0, 50) + '...',
        platforms: posts.map(p => p.platform),
        postIds: posts.map(p => p.id),
        count: posts.length,
      }));

    return { duplicates };
  }
}
