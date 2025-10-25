import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class PublishingPlatformService {
  private readonly logger = new Logger('PublishingPlatformService');

  private readonly defaultPlatforms = [
    {
      name: 'Twitter',
      slug: 'twitter',
      type: 'social',
      apiConfig: {
        provider: 'twitter-api-v2',
        endpoint: 'https://api.twitter.com/2',
        rateLimit: 450,
        costPerRequest: 0.0001,
      },
      contentSpecs: {
        maxLength: 280,
        supportsImages: true,
        supportsVideo: true,
        supportsLinks: true,
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
        interests: true,
      },
      avgEngagementRate: 0.045,
      bestContentTypes: ['threads', 'news', 'announcements'],
    },
    {
      name: 'LinkedIn',
      slug: 'linkedin',
      type: 'social',
      apiConfig: {
        provider: 'linkedin-api',
        endpoint: 'https://api.linkedin.com/v2',
        rateLimit: 60,
        costPerRequest: 0.00015,
      },
      contentSpecs: {
        maxLength: 3000,
        supportsImages: true,
        supportsVideo: true,
        supportsArticles: true,
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
        jobTitle: true,
        industry: true,
      },
      avgEngagementRate: 0.032,
      bestContentTypes: ['articles', 'insights', 'industry-news'],
    },
    {
      name: 'Facebook',
      slug: 'facebook',
      type: 'social',
      apiConfig: {
        provider: 'facebook-graph-api',
        endpoint: 'https://graph.facebook.com/v18.0',
        rateLimit: 200,
        costPerRequest: 0.0001,
      },
      contentSpecs: {
        maxLength: 63206,
        supportsImages: true,
        supportsVideo: true,
        supportsLinks: true,
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
        interests: true,
        behaviors: true,
      },
      avgEngagementRate: 0.028,
      bestContentTypes: ['images', 'video', 'community-posts'],
    },
    {
      name: 'Instagram',
      slug: 'instagram',
      type: 'social',
      apiConfig: {
        provider: 'instagram-graph-api',
        endpoint: 'https://graph.instagram.com',
        rateLimit: 200,
        costPerRequest: 0.00012,
      },
      contentSpecs: {
        maxLength: 2200,
        supportsImages: true,
        supportsVideo: true,
        supportsCarousel: true,
        supportsReels: true,
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
        interests: true,
      },
      avgEngagementRate: 0.067,
      bestContentTypes: ['images', 'reels', 'carousel'],
    },
    {
      name: 'TikTok',
      slug: 'tiktok',
      type: 'social',
      apiConfig: {
        provider: 'tiktok-api',
        endpoint: 'https://api.tiktok.com/v1',
        rateLimit: 100,
        costPerRequest: 0.00008,
      },
      contentSpecs: {
        maxLength: 2200,
        supportsVideo: true,
        supportsHashtags: true,
        supportsMentions: true,
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
        interests: true,
      },
      avgEngagementRate: 0.089,
      bestContentTypes: ['short-video', 'trends', 'challenges'],
    },
    {
      name: 'YouTube',
      slug: 'youtube',
      type: 'video',
      apiConfig: {
        provider: 'youtube-api-v3',
        endpoint: 'https://www.googleapis.com/youtube/v3',
        rateLimit: 10000,
        costPerRequest: 0.00005,
      },
      contentSpecs: {
        maxLength: 5000,
        supportsVideo: true,
        maxDuration: 12 * 60 * 60, // 12 hours in seconds
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
        interests: true,
      },
      avgEngagementRate: 0.042,
      bestContentTypes: ['long-form-video', 'shorts'],
    },
    {
      name: 'Reddit',
      slug: 'reddit',
      type: 'community',
      apiConfig: {
        provider: 'reddit-api',
        endpoint: 'https://oauth.reddit.com',
        rateLimit: 60,
        costPerRequest: 0.00003,
      },
      contentSpecs: {
        maxLength: 40000,
        supportsImages: true,
        supportsVideo: true,
        supportsLinks: true,
      },
      targetingOptions: {
        subreddit: true,
        sortBy: true,
      },
      avgEngagementRate: 0.051,
      bestContentTypes: ['discussions', 'ama', 'news'],
    },
    {
      name: 'Threads',
      slug: 'threads',
      type: 'social',
      apiConfig: {
        provider: 'threads-api',
        endpoint: 'https://graph.threads.net',
        rateLimit: 200,
        costPerRequest: 0.0001,
      },
      contentSpecs: {
        maxLength: 500,
        supportsImages: true,
        supportsVideo: true,
      },
      targetingOptions: {
        geographic: true,
        demographic: true,
      },
      avgEngagementRate: 0.053,
      bestContentTypes: ['threads', 'discussions'],
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize default platforms in database
   */
  async initializePlatforms(): Promise<void> {
    this.logger.log('Initializing default platforms');

    for (const platform of this.defaultPlatforms) {
      const existing = await this.prisma.publishingPlatform.findUnique({
        where: { slug: platform.slug },
      });

      if (!existing) {
        await this.prisma.publishingPlatform.create({
          data: {
            name: platform.name,
            slug: platform.slug,
            type: platform.type,
            enabled: true,
            apiConfig: platform.apiConfig,
            contentSpecs: platform.contentSpecs,
            targetingOptions: platform.targetingOptions,
            avgEngagementRate: platform.avgEngagementRate,
            bestContentTypes: platform.bestContentTypes,
          },
        });

        this.logger.log(`Created platform: ${platform.name}`);
      }
    }
  }

  /**
   * Get all available platforms
   */
  async getAllPlatforms(): Promise<any[]> {
    return this.prisma.publishingPlatform.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get platform by slug
   */
  async getPlatformBySlug(slug: string): Promise<any> {
    const platform = await this.prisma.publishingPlatform.findUnique({
      where: { slug },
    });

    if (!platform) {
      throw new Error(`Platform not found: ${slug}`);
    }

    return platform;
  }

  /**
   * Get platform by ID
   */
  async getPlatformById(id: string): Promise<any> {
    const platform = await this.prisma.publishingPlatform.findUnique({
      where: { id },
    });

    if (!platform) {
      throw new Error(`Platform not found: ${id}`);
    }

    return platform;
  }

  /**
   * Create platform preset
   */
  async createPreset(input: {
    name: string;
    description?: string;
    platforms: string[];
    isSystemPreset?: boolean;
    createdBy?: string;
  }): Promise<any> {
    this.logger.log(`Creating platform preset: ${input.name}`);

    return this.prisma.publishingPreset.create({
      data: {
        name: input.name,
        description: input.description,
        configuration: { platforms: input.platforms },
        isSystemPreset: input.isSystemPreset || false,
        createdBy: input.createdBy,
      },
    });
  }

  /**
   * Get all presets
   */
  async getPresets(onlySystem: boolean = false): Promise<any[]> {
    return this.prisma.publishingPreset.findMany({
      where: onlySystem ? { isSystemPreset: true } : {},
      orderBy: [{ isSystemPreset: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * Get preset by ID
   */
  async getPresetById(id: string): Promise<any> {
    const preset = await this.prisma.publishingPreset.findUnique({
      where: { id },
    });

    if (!preset) {
      throw new Error(`Preset not found: ${id}`);
    }

    return preset;
  }

  /**
   * Update preset usage
   */
  async updatePresetUsage(id: string): Promise<void> {
    await this.prisma.publishingPreset.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Delete preset
   */
  async deletePreset(id: string): Promise<void> {
    // Prevent deletion of system presets
    const preset = await this.getPresetById(id);
    if (preset.isSystemPreset) {
      throw new Error('Cannot delete system presets');
    }

    await this.prisma.publishingPreset.delete({
      where: { id },
    });

    this.logger.log(`Deleted preset: ${id}`);
  }

  /**
   * Create default presets
   */
  async createDefaultPresets(): Promise<void> {
    this.logger.log('Creating default platform presets');

    const defaultPresets = [
      {
        name: 'Social Media Blitz',
        description: 'Post across all major social platforms',
        platforms: ['twitter', 'linkedin', 'facebook', 'instagram', 'threads'],
        isSystemPreset: true,
      },
      {
        name: 'Professional Network',
        description: 'Focus on professional and B2B platforms',
        platforms: ['linkedin', 'twitter', 'reddit'],
        isSystemPreset: true,
      },
      {
        name: 'Visual Content',
        description: 'Best for image and video content',
        platforms: ['instagram', 'tiktok', 'youtube', 'facebook'],
        isSystemPreset: true,
      },
      {
        name: 'Quick Reach',
        description: 'Fast content distribution',
        platforms: ['twitter', 'threads'],
        isSystemPreset: true,
      },
    ];

    for (const preset of defaultPresets) {
      const existing = await this.prisma.publishingPreset.findFirst({
        where: { name: preset.name, isSystemPreset: true },
      });

      if (!existing) {
        await this.createPreset(preset);
        this.logger.log(`Created preset: ${preset.name}`);
      }
    }
  }

  /**
   * Get platform recommendations for content type
   */
  async getRecommendedPlatforms(
    contentType: string,
  ): Promise<{ platform: string; score: number }[]> {
    const allPlatforms = await this.getAllPlatforms();

    return allPlatforms
      .map((platform) => ({
        platform: platform.name,
        score: this.calculatePlatformScore(platform, contentType),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 recommendations
  }

  /**
   * Calculate platform suitability score for content type
   */
  private calculatePlatformScore(platform: any, contentType: string): number {
    let score = 0;

    // Base score from engagement rate
    score += Number(platform.avgEngagementRate || 0) * 10;

    // Check if content type is in best content types
    const bestTypes = platform.bestContentTypes || [];
    if (
      bestTypes.some((type) =>
        type.toLowerCase().includes(contentType.toLowerCase()),
      )
    ) {
      score += 3;
    }

    // Content spec compatibility
    if (contentType.includes('image') && platform.contentSpecs?.supportsImages) {
      score += 2;
    }
    if (contentType.includes('video') && platform.contentSpecs?.supportsVideo) {
      score += 2;
    }
    if (contentType.includes('article') && platform.contentSpecs?.maxLength > 2000) {
      score += 2;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Enable/disable platform
   */
  async togglePlatform(id: string, enabled: boolean): Promise<void> {
    await this.prisma.publishingPlatform.update({
      where: { id },
      data: { enabled },
    });

    this.logger.log(
      `Platform ${id} ${enabled ? 'enabled' : 'disabled'}`,
    );
  }
}
