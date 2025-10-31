import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { BlogPostStatus, ContentAssetType, ContentType, ContentStatus, AIAgent } from '@dryjets/database';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Content Performance Seeding Service
 * Generates 10,000 pieces of content with 3-year performance history
 *
 * Distribution:
 * - Blog Posts: 5,000 (50%)
 * - Social Posts: 3,000 (30%)
 * - Videos: 1,500 (15%)
 * - Emails: 500 (5%)
 *
 * Features:
 * - Realistic performance metrics (impressions, clicks, engagement, conversions)
 * - Success/failure patterns (30% high performers, 50% moderate, 20% underperformers)
 * - Platform-specific metrics
 * - Time-series SEO data (3 years for blog posts)
 * - Content quality scores (readability, originality)
 * - AI-generated content metadata
 * - Viral prediction scores for videos
 */

interface BlogPostSeed {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  status: BlogPostStatus;
  publishedAt: Date;
  viewCount: number;
  serpRank: number | null;
  repurposedCount: number;
  createdBy: string;
  performanceTier: 'HIGH' | 'MODERATE' | 'LOW';
  // SEO metrics over time
  seoHistory: Array<{
    date: Date;
    impressions: number;
    clicks: number;
    ctr: number;
    avgPosition: number;
  }>;
}

interface ContentAssetSeed {
  type: ContentAssetType;
  content: string;
  platform: string | null;
  performanceScore: number;
  reuseCount: number;
  metadata: any;
  // Video-specific fields
  videoScript?: string;
  videoHook?: string;
  videoCaptions?: string[];
  videoHashtags?: string[];
  videoDuration?: number;
  videoFormat?: string;
  videoStyle?: string;
  viralPrediction?: number;
  engagementScore?: number;
}

interface PublishedContentSeed {
  type: ContentType;
  platform: string;
  pillar: string;
  status: ContentStatus;
  content: any;
  seoData: any;
  geography: any;
  targeting: any;
  generationCost: number;
  publishingCost: number;
  totalCost: number;
  optimalPublishTime: Date;
  scheduledPublishTime: Date;
  publishedAt: Date;
  performance: any;
  generatedBy: AIAgent;
  performanceTier: 'HIGH' | 'MODERATE' | 'LOW';
}

@Injectable()
export class ContentSeedingService {
  private readonly logger = new Logger('ContentSeeding');
  private readonly anthropic: Anthropic;

  // Content topics (DryJets-focused + generic marketing)
  private readonly BLOG_TOPICS = [
    'How to Remove {stain} Stains from {fabric}',
    'Ultimate Guide to {service} for {audience}',
    '{fabric} Care Tips: Everything You Need to Know',
    'Best {service} Services in {city}',
    '{season} Laundry Tips for Busy Professionals',
    'Eco-Friendly {service}: Save Money and the Planet',
    'Common Laundry Mistakes That Ruin Your Clothes',
    'Professional vs DIY: When to Use {service}',
    'How to Choose the Right {service} for {garment}',
    'The Science of Stain Removal: {stain} Edition',
  ];

  private readonly STAINS = ['Wine', 'Coffee', 'Oil', 'Blood', 'Ink', 'Grass', 'Chocolate', 'Lipstick', 'Grease', 'Sweat'];
  private readonly FABRICS = ['Cotton', 'Silk', 'Wool', 'Linen', 'Cashmere', 'Polyester', 'Leather', 'Suede', 'Denim'];
  private readonly SERVICES = ['Dry Cleaning', 'Laundry', 'Wash and Fold', 'Alterations', 'Stain Removal', 'Garment Care'];
  private readonly AUDIENCES = ['Busy Professionals', 'Families', 'Students', 'Hotels', 'Restaurants', 'Corporate Offices'];
  private readonly CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Boston', 'Miami', 'Austin'];
  private readonly SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

  private readonly SOCIAL_POST_TEMPLATES = [
    '💡 Quick tip: {tip}',
    '🎯 Did you know? {fact}',
    '✨ Transform your {item} with {service}',
    '⏰ Limited time: {offer}',
    '🌟 Customer success story: {story}',
    '📊 Industry insight: {stat}',
    '🔥 Trending now: {trend}',
    '💬 Ask us anything: {question}',
  ];

  private readonly PLATFORMS = ['meta', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest'];

  private readonly CONTENT_PILLARS = [
    'education',
    'inspiration',
    'product_showcase',
    'customer_stories',
    'industry_insights',
    'promotional',
    'community_engagement',
    'thought_leadership',
  ];

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main seeding method - generates 10,000 content pieces
   */
  async seedContent(count: number = 10000): Promise<{
    seeded: number;
    blogPosts: number;
    socialPosts: number;
    videos: number;
    emails: number;
    highPerformers: number;
    moderatePerformers: number;
    lowPerformers: number;
  }> {
    this.logger.log(`Starting content seeding: ${count} pieces...`);

    const distribution = {
      blogPosts: Math.floor(count * 0.50), // 5,000
      socialPosts: Math.floor(count * 0.30), // 3,000
      videos: Math.floor(count * 0.15), // 1,500
      emails: Math.floor(count * 0.05), // 500
    };

    let totalSeeded = 0;
    const stats = {
      blogPosts: 0,
      socialPosts: 0,
      videos: 0,
      emails: 0,
      highPerformers: 0,
      moderatePerformers: 0,
      lowPerformers: 0,
    };

    // Generate blog posts
    this.logger.log('Generating blog posts...');
    const blogPosts = await this.generateBlogPosts(distribution.blogPosts);
    await this.insertBlogPostBatch(blogPosts);
    stats.blogPosts = blogPosts.length;
    totalSeeded += blogPosts.length;
    this.logger.log(`✓ Seeded ${blogPosts.length} blog posts`);

    // Count performance tiers for blog posts
    stats.highPerformers += blogPosts.filter((b) => b.performanceTier === 'HIGH').length;
    stats.moderatePerformers += blogPosts.filter((b) => b.performanceTier === 'MODERATE').length;
    stats.lowPerformers += blogPosts.filter((b) => b.performanceTier === 'LOW').length;

    // Generate social posts
    this.logger.log('Generating social posts...');
    const socialPosts = await this.generateSocialPosts(distribution.socialPosts);
    await this.insertContentAssetBatch(socialPosts);
    stats.socialPosts = socialPosts.length;
    totalSeeded += socialPosts.length;
    this.logger.log(`✓ Seeded ${socialPosts.length} social posts`);

    // Generate videos
    this.logger.log('Generating video content...');
    const videos = await this.generateVideos(distribution.videos);
    await this.insertContentAssetBatch(videos);
    stats.videos = videos.length;
    totalSeeded += videos.length;
    this.logger.log(`✓ Seeded ${videos.length} videos`);

    // Generate emails (via PublishedContent)
    this.logger.log('Generating email campaigns...');
    const emails = await this.generateEmails(distribution.emails);
    await this.insertPublishedContentBatch(emails);
    stats.emails = emails.length;
    totalSeeded += emails.length;
    this.logger.log(`✓ Seeded ${emails.length} emails`);

    // Count performance tiers for emails
    stats.highPerformers += emails.filter((e) => e.performanceTier === 'HIGH').length;
    stats.moderatePerformers += emails.filter((e) => e.performanceTier === 'MODERATE').length;
    stats.lowPerformers += emails.filter((e) => e.performanceTier === 'LOW').length;

    this.logger.log(`✅ Content seeding complete: ${totalSeeded} total pieces`);
    this.logger.log(`   - High performers: ${stats.highPerformers}`);
    this.logger.log(`   - Moderate performers: ${stats.moderatePerformers}`);
    this.logger.log(`   - Low performers: ${stats.lowPerformers}`);

    return {
      seeded: totalSeeded,
      ...stats,
    };
  }

  /**
   * Generate blog posts with SEO history
   */
  private async generateBlogPosts(count: number): Promise<BlogPostSeed[]> {
    const blogPosts: BlogPostSeed[] = [];

    for (let i = 0; i < count; i++) {
      // Performance tier distribution: 30% HIGH, 50% MODERATE, 20% LOW
      const rand = Math.random();
      const performanceTier: 'HIGH' | 'MODERATE' | 'LOW' = rand < 0.3 ? 'HIGH' : rand < 0.8 ? 'MODERATE' : 'LOW';

      const title = this.generateBlogTitle();
      const slug = this.titleToSlug(title);

      // Published date: random within last 3 years
      const publishedAt = this.randomDateWithinYears(3);

      // Generate SEO history (monthly data points from published date to now)
      const seoHistory = this.generateSEOHistory(publishedAt, performanceTier);

      // View count based on performance tier and age
      const monthsSincePublished = this.monthsBetween(publishedAt, new Date());
      const viewCount = this.generateViewCount(performanceTier, monthsSincePublished);

      // SERP rank based on performance tier
      const serpRank = this.generateSerpRank(performanceTier);

      // Repurpose count (high performers get repurposed more)
      const repurposedCount = performanceTier === 'HIGH' ? Math.floor(Math.random() * 8) + 3 : performanceTier === 'MODERATE' ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2);

      blogPosts.push({
        title,
        slug,
        content: this.generateBlogContent(title, performanceTier),
        excerpt: this.generateExcerpt(title),
        keywords: this.extractKeywords(title),
        metaTitle: title,
        metaDescription: this.generateExcerpt(title),
        status: BlogPostStatus.PUBLISHED,
        publishedAt,
        viewCount,
        serpRank,
        repurposedCount,
        createdBy: this.randomElement(['mira', 'leo', 'ava']),
        performanceTier,
        seoHistory,
      });

      if ((i + 1) % 500 === 0) {
        this.logger.debug(`   Generated ${i + 1} / ${count} blog posts...`);
      }
    }

    return blogPosts;
  }

  /**
   * Generate SEO history (monthly data points)
   */
  private generateSEOHistory(
    publishedAt: Date,
    performanceTier: 'HIGH' | 'MODERATE' | 'LOW',
  ): Array<{ date: Date; impressions: number; clicks: number; ctr: number; avgPosition: number }> {
    const history: Array<{ date: Date; impressions: number; clicks: number; ctr: number; avgPosition: number }> = [];
    const monthsSincePublished = this.monthsBetween(publishedAt, new Date());

    // Starting metrics based on tier
    let baseImpressions: number;
    let basePosition: number;
    let growthRate: number;

    switch (performanceTier) {
      case 'HIGH':
        baseImpressions = 500 + Math.random() * 500;
        basePosition = 15 + Math.random() * 10; // Starts 15-25
        growthRate = 1.15; // 15% monthly growth
        break;
      case 'MODERATE':
        baseImpressions = 200 + Math.random() * 300;
        basePosition = 25 + Math.random() * 20; // Starts 25-45
        growthRate = 1.05; // 5% monthly growth
        break;
      case 'LOW':
        baseImpressions = 50 + Math.random() * 150;
        basePosition = 40 + Math.random() * 30; // Starts 40-70
        growthRate = 1.0; // No growth
        break;
    }

    for (let month = 0; month < monthsSincePublished; month++) {
      const date = new Date(publishedAt);
      date.setMonth(date.getMonth() + month);

      // Impressions grow over time for successful content
      const impressions = Math.round(baseImpressions * Math.pow(growthRate, month) * (0.8 + Math.random() * 0.4)); // ±20% variance

      // Position improves over time for high performers
      let position = basePosition;
      if (performanceTier === 'HIGH') {
        position = Math.max(1, basePosition - month * 0.5); // Improve 0.5 positions per month
      } else if (performanceTier === 'MODERATE') {
        position = Math.max(5, basePosition - month * 0.2); // Improve 0.2 positions per month
      }
      position = position * (0.9 + Math.random() * 0.2); // ±10% variance

      // CTR based on position (higher position = higher CTR)
      const baseCTR = this.calculateCTRFromPosition(position);
      const ctr = baseCTR * (0.8 + Math.random() * 0.4); // ±20% variance

      // Clicks = impressions * CTR
      const clicks = Math.round(impressions * ctr);

      history.push({
        date,
        impressions,
        clicks,
        ctr: Math.round(ctr * 10000) / 100, // Convert to percentage with 2 decimals
        avgPosition: Math.round(position * 10) / 10,
      });
    }

    return history;
  }

  /**
   * Calculate CTR from SERP position (based on real data)
   */
  private calculateCTRFromPosition(position: number): number {
    // Real CTR data by position
    if (position <= 1) return 0.28; // Position 1: 28%
    if (position <= 2) return 0.15; // Position 2: 15%
    if (position <= 3) return 0.11; // Position 3: 11%
    if (position <= 4) return 0.08; // Position 4: 8%
    if (position <= 5) return 0.07; // Position 5: 7%
    if (position <= 10) return 0.05; // Positions 6-10: 5%
    if (position <= 20) return 0.02; // Positions 11-20: 2%
    return 0.01; // Positions 20+: 1%
  }

  /**
   * Generate social media posts
   */
  private async generateSocialPosts(count: number): Promise<ContentAssetSeed[]> {
    const socialPosts: ContentAssetSeed[] = [];

    for (let i = 0; i < count; i++) {
      // Performance tier
      const rand = Math.random();
      const performanceTier: 'HIGH' | 'MODERATE' | 'LOW' = rand < 0.3 ? 'HIGH' : rand < 0.8 ? 'MODERATE' : 'LOW';

      const platform = this.randomElement(this.PLATFORMS);
      const template = this.randomElement(this.SOCIAL_POST_TEMPLATES);
      const content = this.generateSocialContent(template);

      // Performance score (0-1)
      const performanceScore = performanceTier === 'HIGH' ? 0.7 + Math.random() * 0.3 : performanceTier === 'MODERATE' ? 0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3;

      // Reuse count
      const reuseCount = performanceTier === 'HIGH' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 2);

      socialPosts.push({
        type: ContentAssetType.COPY,
        content,
        platform,
        performanceScore: Math.round(performanceScore * 100) / 100,
        reuseCount,
        metadata: {
          length: content.length,
          hashtags: this.extractHashtags(content),
          mentions: this.extractMentions(content),
          mediaType: 'text',
        },
      });

      if ((i + 1) % 500 === 0) {
        this.logger.debug(`   Generated ${i + 1} / ${count} social posts...`);
      }
    }

    return socialPosts;
  }

  /**
   * Generate video content
   */
  private async generateVideos(count: number): Promise<ContentAssetSeed[]> {
    const videos: ContentAssetSeed[] = [];

    const videoFormats = ['VERTICAL_9_16', 'SQUARE_1_1', 'HORIZONTAL_16_9'];
    const videoStyles = ['TALKING_HEAD', 'B_ROLL', 'SLIDESHOW', 'ANIMATION'];

    for (let i = 0; i < count; i++) {
      // Performance tier
      const rand = Math.random();
      const performanceTier: 'HIGH' | 'MODERATE' | 'LOW' = rand < 0.3 ? 'HIGH' : rand < 0.8 ? 'MODERATE' : 'LOW';

      const platform = this.randomElement(['tiktok', 'instagram', 'youtube', 'meta']);
      const format = this.randomElement(videoFormats);
      const style = this.randomElement(videoStyles);

      // Duration: short-form (15-60s) or long-form (60s-10min)
      const isShortForm = platform === 'tiktok' || platform === 'instagram';
      const duration = isShortForm ? 15 + Math.floor(Math.random() * 45) : 60 + Math.floor(Math.random() * 540);

      // Viral prediction (0-1)
      const viralPrediction = performanceTier === 'HIGH' ? 0.6 + Math.random() * 0.4 : performanceTier === 'MODERATE' ? 0.3 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;

      // Engagement score (0-1)
      const engagementScore = performanceTier === 'HIGH' ? 0.7 + Math.random() * 0.3 : performanceTier === 'MODERATE' ? 0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3;

      const videoScript = this.generateVideoScript(duration);
      const videoHook = videoScript.split('\n')[0]; // First line is hook
      const videoCaptions = this.generateVideoCaptions(videoScript);
      const videoHashtags = this.generateVideoHashtags(platform);

      videos.push({
        type: ContentAssetType.VIDEO,
        content: `video_${i + 1}.mp4`,
        platform,
        performanceScore: Math.round(viralPrediction * 100) / 100,
        reuseCount: 0,
        metadata: {
          format,
          style,
          duration,
          isShortForm,
        },
        videoScript,
        videoHook,
        videoCaptions,
        videoHashtags,
        videoDuration: duration,
        videoFormat: format,
        videoStyle: style,
        viralPrediction: Math.round(viralPrediction * 100) / 100,
        engagementScore: Math.round(engagementScore * 100) / 100,
      });

      if ((i + 1) % 200 === 0) {
        this.logger.debug(`   Generated ${i + 1} / ${count} videos...`);
      }
    }

    return videos;
  }

  /**
   * Generate email campaigns
   */
  private async generateEmails(count: number): Promise<PublishedContentSeed[]> {
    const emails: PublishedContentSeed[] = [];

    for (let i = 0; i < count; i++) {
      // Performance tier
      const rand = Math.random();
      const performanceTier: 'HIGH' | 'MODERATE' | 'LOW' = rand < 0.3 ? 'HIGH' : rand < 0.8 ? 'MODERATE' : 'LOW';

      const pillar = this.randomElement(this.CONTENT_PILLARS);
      const publishedAt = this.randomDateWithinYears(3);

      // Email performance metrics
      const sentTo = 1000 + Math.floor(Math.random() * 9000); // 1K-10K recipients
      const openRate = performanceTier === 'HIGH' ? 0.25 + Math.random() * 0.15 : performanceTier === 'MODERATE' ? 0.15 + Math.random() * 0.10 : 0.05 + Math.random() * 0.10;
      const clickRate = performanceTier === 'HIGH' ? 0.05 + Math.random() * 0.05 : performanceTier === 'MODERATE' ? 0.02 + Math.random() * 0.03 : 0.005 + Math.random() * 0.015;
      const conversionRate = performanceTier === 'HIGH' ? 0.03 + Math.random() * 0.02 : performanceTier === 'MODERATE' ? 0.01 + Math.random() * 0.02 : 0.002 + Math.random() * 0.008;

      const opens = Math.round(sentTo * openRate);
      const clicks = Math.round(opens * clickRate);
      const conversions = Math.round(clicks * conversionRate);

      // Cost calculation
      const generationCost = 0.5 + Math.random() * 1.5; // $0.50-2.00
      const publishingCost = sentTo * 0.001; // $0.001 per email sent
      const totalCost = generationCost + publishingCost;

      emails.push({
        type: ContentType.BLOG, // Using BLOG as placeholder for email
        platform: 'email',
        pillar,
        status: ContentStatus.PUBLISHED,
        content: {
          subject: this.generateEmailSubject(),
          previewText: 'Preview text...',
          body: 'Email body content...',
        },
        seoData: null,
        geography: {
          level: 'national',
          location: 'USA',
        },
        targeting: {
          segment: this.randomElement(['all_users', 'engaged_users', 'inactive_users', 'new_users']),
          demographics: {},
        },
        generationCost,
        publishingCost,
        totalCost,
        optimalPublishTime: publishedAt,
        scheduledPublishTime: publishedAt,
        publishedAt,
        performance: {
          sentTo,
          opens,
          clicks,
          conversions,
          openRate: Math.round(openRate * 10000) / 100,
          clickRate: Math.round(clickRate * 10000) / 100,
          conversionRate: Math.round(conversionRate * 10000) / 100,
        },
        generatedBy: this.randomElement([AIAgent.MIRA, AIAgent.LEO, AIAgent.AVA]),
        performanceTier,
      });
    }

    return emails;
  }

  /**
   * Insert blog posts into database
   */
  private async insertBlogPostBatch(blogPosts: BlogPostSeed[]): Promise<void> {
    const batchSize = 100;
    const batches = Math.ceil(blogPosts.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = blogPosts.slice(i * batchSize, (i + 1) * batchSize);

      for (const post of batch) {
        try {
          // Create blog post
          const createdPost = await this.prisma.blogPost.create({
            data: {
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt,
              keywords: post.keywords,
              metaTitle: post.metaTitle,
              metaDescription: post.metaDescription,
              status: post.status,
              publishedAt: post.publishedAt,
              viewCount: post.viewCount,
              serpRank: post.serpRank,
              repurposedCount: post.repurposedCount,
              aiGenerated: true,
              aiBrief: {
                performanceTier: post.performanceTier,
                topic: post.title,
              },
              createdBy: post.createdBy,
            },
          });

          // Create SEO metrics history
          for (const metric of post.seoHistory) {
            await this.prisma.sEOMetric.create({
              data: {
                blogPostId: createdPost.id,
                date: metric.date,
                impressions: metric.impressions,
                clicks: metric.clicks,
                ctr: metric.ctr,
                avgPosition: metric.avgPosition,
                keywordsRanked: post.keywords.length,
              },
            });
          }
        } catch (error) {
          // Skip duplicates
          if (error.code === 'P2002') {
            this.logger.debug(`Skipping duplicate blog post: ${post.slug}`);
          } else {
            throw error;
          }
        }
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${blogPosts.length} blog posts...`);
      }
    }
  }

  /**
   * Insert content assets into database
   */
  private async insertContentAssetBatch(assets: ContentAssetSeed[]): Promise<void> {
    const batchSize = 100;
    const batches = Math.ceil(assets.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = assets.slice(i * batchSize, (i + 1) * batchSize);

      for (const asset of batch) {
        await this.prisma.contentAsset.create({
          data: {
            type: asset.type,
            content: asset.content,
            platform: asset.platform,
            performanceScore: asset.performanceScore,
            reuseCount: asset.reuseCount,
            aiGenerated: true,
            metadata: asset.metadata,
            videoScript: asset.videoScript,
            videoHook: asset.videoHook,
            videoCaptions: asset.videoCaptions || [],
            videoHashtags: asset.videoHashtags || [],
            videoDuration: asset.videoDuration,
            videoFormat: asset.videoFormat,
            videoStyle: asset.videoStyle,
            viralPrediction: asset.viralPrediction,
            engagementScore: asset.engagementScore,
          },
        });
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${assets.length} content assets...`);
      }
    }
  }

  /**
   * Insert published content into database
   */
  private async insertPublishedContentBatch(content: PublishedContentSeed[]): Promise<void> {
    // First, create a dummy workflow for these emails
    const workflow = await this.prisma.multiPlatformWorkflow.create({
      data: {
        name: 'Seeded Email Campaigns',
        type: 'AUTONOMOUS',
        status: 'COMPLETED',
        platformConfig: {
          platforms: ['email'],
        },
        createdBy: 'system',
        launchedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Find or create dummy platform
    let emailPlatform = await this.prisma.publishingPlatform.findUnique({
      where: { slug: 'email' },
    });

    if (!emailPlatform) {
      emailPlatform = await this.prisma.publishingPlatform.create({
        data: {
          name: 'Email',
          slug: 'email',
          type: 'email',
          enabled: true,
          apiConfig: {},
          contentSpecs: {},
        },
      });
    }

    const batchSize = 100;
    const batches = Math.ceil(content.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = content.slice(i * batchSize, (i + 1) * batchSize);

      for (const item of batch) {
        await this.prisma.publishedContent.create({
          data: {
            workflowId: workflow.id,
            type: item.type,
            platformId: emailPlatform.id,
            pillar: item.pillar,
            status: item.status,
            content: item.content,
            seoData: item.seoData,
            geography: item.geography,
            targeting: item.targeting,
            generationCost: item.generationCost,
            publishingCost: item.publishingCost,
            totalCost: item.totalCost,
            optimalPublishTime: item.optimalPublishTime,
            scheduledPublishTime: item.scheduledPublishTime,
            publishedAt: item.publishedAt,
            performance: item.performance,
            aiGenerated: true,
            humanEdited: false,
            generatedBy: item.generatedBy,
          },
        });
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${content.length} emails...`);
      }
    }
  }

  /**
   * Get seeding summary
   */
  async getSeedingSummary(): Promise<{
    totalBlogPosts: number;
    totalContentAssets: number;
    totalPublishedContent: number;
    avgBlogViews: number;
    avgPerformanceScore: number;
  }> {
    const blogPosts = await this.prisma.blogPost.count({ where: { aiGenerated: true } });
    const contentAssets = await this.prisma.contentAsset.count({ where: { aiGenerated: true } });
    const publishedContent = await this.prisma.publishedContent.count({ where: { aiGenerated: true } });

    const blogAgg = await this.prisma.blogPost.aggregate({
      where: { aiGenerated: true },
      _avg: { viewCount: true },
    });

    const assetAgg = await this.prisma.contentAsset.aggregate({
      where: { aiGenerated: true },
      _avg: { performanceScore: true },
    });

    return {
      totalBlogPosts: blogPosts,
      totalContentAssets: contentAssets,
      totalPublishedContent: publishedContent,
      avgBlogViews: Math.round(blogAgg._avg.viewCount || 0),
      avgPerformanceScore: Math.round((assetAgg._avg.performanceScore?.toNumber() || 0) * 100) / 100,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private generateBlogTitle(): string {
    const template = this.randomElement(this.BLOG_TOPICS);
    return template
      .replace('{stain}', this.randomElement(this.STAINS))
      .replace('{fabric}', this.randomElement(this.FABRICS))
      .replace('{service}', this.randomElement(this.SERVICES))
      .replace('{audience}', this.randomElement(this.AUDIENCES))
      .replace('{city}', this.randomElement(this.CITIES))
      .replace('{season}', this.randomElement(this.SEASONS))
      .replace('{garment}', this.randomElement(['Suits', 'Dresses', 'Shirts', 'Curtains', 'Bedding']));
  }

  private titleToSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateBlogContent(title: string, tier: 'HIGH' | 'MODERATE' | 'LOW'): string {
    const wordCount = tier === 'HIGH' ? 2000 + Math.floor(Math.random() * 1000) : tier === 'MODERATE' ? 1000 + Math.floor(Math.random() * 500) : 500 + Math.floor(Math.random() * 500);

    return `# ${title}\n\n[${wordCount} words of comprehensive content covering this topic in detail...]\n\nThis is AI-generated seeded content with performance tier: ${tier}`;
  }

  private generateExcerpt(title: string): string {
    return `Learn everything about ${title.toLowerCase()} in this comprehensive guide. Expert tips and proven strategies.`;
  }

  private extractKeywords(title: string): string[] {
    return title
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 3)
      .slice(0, 5);
  }

  private generateSerpRank(tier: 'HIGH' | 'MODERATE' | 'LOW'): number | null {
    // Only 60% of content ranks
    if (Math.random() > 0.6) return null;

    if (tier === 'HIGH') {
      return 1 + Math.floor(Math.random() * 10); // Position 1-10
    } else if (tier === 'MODERATE') {
      return 5 + Math.floor(Math.random() * 20); // Position 5-25
    } else {
      return 15 + Math.floor(Math.random() * 35); // Position 15-50
    }
  }

  private generateViewCount(tier: 'HIGH' | 'MODERATE' | 'LOW', monthsSincePublished: number): number {
    let monthlyViews: number;

    if (tier === 'HIGH') {
      monthlyViews = 2000 + Math.random() * 3000; // 2K-5K per month
    } else if (tier === 'MODERATE') {
      monthlyViews = 500 + Math.random() * 1500; // 500-2K per month
    } else {
      monthlyViews = 50 + Math.random() * 450; // 50-500 per month
    }

    return Math.round(monthlyViews * monthsSincePublished);
  }

  private generateSocialContent(template: string): string {
    return template
      .replace('{tip}', 'Remove wine stains with club soda before they set!')
      .replace('{fact}', '70% of professionals outsource their laundry')
      .replace('{item}', 'wardrobe')
      .replace('{service}', 'professional cleaning')
      .replace('{offer}', '20% off first order')
      .replace('{story}', 'Client saved $500/year')
      .replace('{stat}', 'Industry growing 15% YoY')
      .replace('{trend}', 'Eco-friendly cleaning solutions')
      .replace('{question}', 'What stains are hardest to remove?');
  }

  private extractHashtags(content: string): string[] {
    const hashtags: string[] = [];
    const regex = /#\w+/g;
    const matches = content.match(regex);
    return matches || [];
  }

  private extractMentions(content: string): string[] {
    const mentions: string[] = [];
    const regex = /@\w+/g;
    const matches = content.match(regex);
    return matches || [];
  }

  private generateVideoScript(duration: number): string {
    const hooks = [
      "You're ruining your clothes and don't even know it!",
      'This laundry hack will save you hundreds',
      'Professional cleaners hate this trick',
      'Stop doing this to your delicates immediately',
    ];

    const hook = this.randomElement(hooks);
    const scriptLength = Math.floor(duration / 3); // ~3 seconds per sentence

    return `${hook}\n\n[${scriptLength} sentences of engaging video script content...]`;
  }

  private generateVideoCaptions(script: string): string[] {
    return script.split('\n').filter((line) => line.trim().length > 0);
  }

  private generateVideoHashtags(platform: string): string[] {
    const base = ['#laundry', '#drycleaning', '#fashion', '#lifestyle'];
    const platformSpecific = {
      tiktok: ['#tiktokfashion', '#lifehacks', '#fyp'],
      instagram: ['#instafashion', '#reels', '#style'],
      youtube: ['#shorts', '#tutorial', '#howto'],
      meta: ['#viral', '#trending', '#tips'],
    };

    return [...base, ...platformSpecific[platform] || []];
  }

  private generateEmailSubject(): string {
    const subjects = [
      '🎯 Your Weekly Laundry Tips',
      '💰 Exclusive Offer: 20% Off',
      '✨ New Service: Same-Day Delivery',
      '📊 Your Impact Report',
      '🔥 Trending: Eco-Friendly Cleaning',
      '💡 Quick Tip: Wine Stain Removal',
    ];

    return this.randomElement(subjects);
  }

  private randomDateWithinYears(years: number): Date {
    const now = new Date();
    const past = new Date(now.getTime() - years * 365 * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  }

  private monthsBetween(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000));
  }

  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
