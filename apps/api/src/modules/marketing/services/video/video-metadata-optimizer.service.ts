import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

export interface VideoMetadataRequest {
  scriptId?: string;
  topic?: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
  keywords?: string[];
  targetAudience?: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  hashtags: string[];
  captions: string[];
  thumbnailSuggestions: ThumbnailSuggestion[];
  seoKeywords: string[];
  tags: string[];
  category?: string;
  viralScore: number; // 0-100
  engagementPrediction: number; // 0-100
}

export interface ThumbnailSuggestion {
  description: string;
  elements: string[];
  textOverlay?: string;
  colorScheme: string;
  mood: string;
}

@Injectable()
export class VideoMetadataOptimizerService {
  private readonly logger = new Logger('VideoMetadataOptimizer');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate optimized video metadata
   */
  async generateMetadata(request: VideoMetadataRequest): Promise<VideoMetadata> {
    this.logger.log(`Generating video metadata for ${request.platform}...`);

    let content: string;

    if (request.scriptId) {
      const asset = await this.prisma.contentAsset.findUnique({
        where: { id: request.scriptId },
      });

      if (!asset || !asset.videoScript) {
        throw new Error(`Script ${request.scriptId} not found`);
      }

      const script = JSON.parse(asset.videoScript as string);
      content = script.script.map((s: any) => s.text).join(' ');
    } else if (request.topic) {
      content = request.topic;
    } else {
      throw new Error('Either scriptId or topic must be provided');
    }

    // Generate metadata using AI
    const metadata = await this.generateMetadataWithAI(content, request);

    this.logger.log(`Generated metadata with ${metadata.hashtags.length} hashtags for ${request.platform}`);
    return metadata;
  }

  /**
   * Generate metadata using AI
   */
  private async generateMetadataWithAI(
    content: string,
    request: VideoMetadataRequest,
  ): Promise<VideoMetadata> {
    const platformGuidelines = this.getPlatformMetadataGuidelines(request.platform);

    const prompt = `You are a viral video metadata optimizer specializing in ${request.platform}.

Generate optimized metadata for a dry cleaning/laundry marketplace (DryJets) video.

Video Content:
${content}

Platform: ${request.platform}
Target Audience: ${request.targetAudience || 'busy professionals, parents, students'}
Keywords: ${request.keywords?.join(', ') || 'dry cleaning, laundry service, on-demand'}

Platform Guidelines:
${platformGuidelines}

Create metadata that will maximize visibility and engagement.

Return JSON in this EXACT format:
{
  "title": "Catchy, SEO-optimized title (within character limit)",
  "description": "Compelling description with keywords and CTA",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "captions": ["Caption line 1", "Caption line 2"],
  "thumbnailSuggestions": [
    {
      "description": "Main thumbnail concept",
      "elements": ["element1", "element2"],
      "textOverlay": "Bold text on thumbnail",
      "colorScheme": "vibrant blue and white",
      "mood": "energetic and professional"
    }
  ],
  "seoKeywords": ["keyword1", "keyword2"],
  "tags": ["tag1", "tag2"],
  "category": "How-to & Style",
  "viralScore": 75,
  "engagementPrediction": 80
}

Return ONLY valid JSON.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalizeMetadata(result, request.platform);
      }
    } catch (error) {
      this.logger.error(`Error generating metadata with AI: ${error.message}`);
    }

    // Fallback: rule-based metadata generation
    return this.generateRuleBasedMetadata(content, request);
  }

  /**
   * Get platform-specific metadata guidelines
   */
  private getPlatformMetadataGuidelines(platform: string): string {
    const guidelines = {
      tiktok: `
TikTok Metadata Guidelines:
- Title: Max 150 characters, catchy and curiosity-driven
- Description: Max 2200 characters, first 3 lines critical
- Hashtags: 3-5 relevant hashtags (mix trending + niche)
- Use trending hashtags when relevant
- Include location tags
- Add sound/music credits
- Viral score factors: hook quality, trend alignment, relatability
`,
      youtube: `
YouTube Metadata Guidelines:
- Title: Max 100 characters, front-load keywords
- Description: Max 5000 characters, first 2-3 lines show in search
- Include timestamps, links, social media
- Hashtags: 3 main hashtags in description
- Tags: 10-15 relevant tags
- Category: Select most relevant
- Thumbnail: High contrast, clear text, faces work well
- Viral score factors: CTR, watch time potential, searchability
`,
      instagram: `
Instagram Reels Metadata Guidelines:
- Title: Max 125 characters (or caption hook)
- Description: Max 2200 characters, line breaks important
- Hashtags: 10-15 hashtags (mix popular + niche)
- Use location tags
- Tag relevant accounts
- Add music credits
- Viral score factors: visual appeal, relatability, shareability
`,
      linkedin: `
LinkedIn Video Metadata Guidelines:
- Title: Max 200 characters, professional but engaging
- Description: Max 3000 characters, value-driven
- Hashtags: 3-5 professional hashtags
- Tag industry leaders when relevant
- Include key takeaways
- Add company/product mentions
- Viral score factors: professional value, industry relevance, engagement
`,
    };

    return guidelines[platform] || guidelines.youtube;
  }

  /**
   * Validate and normalize metadata
   */
  private validateAndNormalizeMetadata(data: any, platform: string): VideoMetadata {
    // Ensure hashtags have # prefix
    const hashtags = (data.hashtags || []).map((tag: string) =>
      tag.startsWith('#') ? tag : `#${tag}`
    );

    // Limit hashtags based on platform
    const hashtagLimits = {
      tiktok: 5,
      youtube: 3,
      instagram: 15,
      linkedin: 5,
    };
    const limitedHashtags = hashtags.slice(0, hashtagLimits[platform] || 5);

    return {
      title: data.title || 'Untitled Video',
      description: data.description || '',
      hashtags: limitedHashtags,
      captions: data.captions || [],
      thumbnailSuggestions: data.thumbnailSuggestions || [],
      seoKeywords: data.seoKeywords || [],
      tags: data.tags || [],
      category: data.category,
      viralScore: Math.min(100, Math.max(0, data.viralScore || 50)),
      engagementPrediction: Math.min(100, Math.max(0, data.engagementPrediction || 50)),
    };
  }

  /**
   * Rule-based fallback metadata generation
   */
  private generateRuleBasedMetadata(
    content: string,
    request: VideoMetadataRequest,
  ): VideoMetadata {
    const baseHashtags = {
      tiktok: ['#DryJets', '#LaundryHack', '#TimeSaver', '#LifeHack', '#Convenience'],
      youtube: ['#DryJets', '#LaundryService', '#OnDemand'],
      instagram: ['#DryJets', '#LaundryService', '#Convenience', '#LifeHack', '#OnDemandService', '#DryC leaning', '#LaundryDay', '#TimeSaver', '#BusyLife', '#MobileApp'],
      linkedin: ['#DryJets', '#OnDemandService', '#StartupLife', '#ConvenienceEconomy', '#BusinessSolutions'],
    };

    const titles = {
      tiktok: 'Stop Wasting Time on Laundry! 🚀 DryJets Makes It Effortless',
      youtube: 'DryJets: The On-Demand Dry Cleaning App Saving Busy People Hours',
      instagram: 'Never Drive to the Dry Cleaners Again ✨ DryJets Has You Covered',
      linkedin: 'How DryJets is Revolutionizing the $10B Dry Cleaning Industry',
    };

    const descriptions = {
      tiktok: `Save hours every week with DryJets - the app that picks up, cleans, and delivers your laundry.

Download now and get 20% off your first order!

#DryJets #LaundryHack #TimeSaver`,
      youtube: `DryJets is transforming how busy professionals handle dry cleaning and laundry.

In this video:
• How DryJets works
• Real-time tracking
• Eco-friendly practices
• Pricing breakdown

Get 20% off your first order: [link]

Follow us:
Instagram: @dryjets
Twitter: @dryjets
LinkedIn: /company/dryjets`,
      instagram: `Never waste time at the dry cleaners again! 🚀

DryJets picks up, cleans, and delivers - all from your phone.

✨ On-demand pickup & delivery
♻️ Eco-friendly practices
📱 Real-time tracking
👔 Professional garment care

Download the app and save 20% on your first order!

#DryJets #LaundryService #Convenience`,
      linkedin: `The dry cleaning industry is ripe for disruption, and DryJets is leading the charge.

Our on-demand platform connects busy professionals with vetted dry cleaners, offering:
• Same-day pickup and delivery
• Real-time order tracking
• Eco-friendly cleaning options
• Professional garment care

Join thousands of professionals who've reclaimed their time with DryJets.

Learn more: [link]`,
    };

    const thumbnails: ThumbnailSuggestion[] = [
      {
        description: 'Before/After split screen',
        elements: ['Person stressed with laundry pile', 'Same person relaxed using phone'],
        textOverlay: 'BEFORE vs AFTER',
        colorScheme: 'Blue and white with green accent',
        mood: 'Transformation, relief',
      },
      {
        description: 'App interface showcase',
        elements: ['Clean smartphone mockup', 'Order tracking screen', 'Delivery driver'],
        textOverlay: 'DryJets App - 20% OFF',
        colorScheme: 'Professional blue gradient',
        mood: 'Modern, tech-savvy',
      },
    ];

    return {
      title: titles[request.platform],
      description: descriptions[request.platform],
      hashtags: baseHashtags[request.platform],
      captions: this.generateCaptions(content),
      thumbnailSuggestions: thumbnails,
      seoKeywords: ['dry cleaning', 'laundry service', 'on-demand delivery', 'mobile app', 'DryJets'],
      tags: ['dry cleaning', 'laundry', 'on-demand', 'delivery', 'app', 'convenience', 'time-saving'],
      category: request.platform === 'youtube' ? 'How-to & Style' : undefined,
      viralScore: 65,
      engagementPrediction: 70,
    };
  }

  /**
   * Generate captions from content
   */
  private generateCaptions(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  /**
   * Optimize hashtags based on trends
   */
  async optimizeHashtags(
    baseHashtags: string[],
    platform: string,
  ): Promise<string[]> {
    // Get trending hashtags from TrendData
    const trends = await this.prisma.trendData.findMany({
      where: {
        source: platform === 'youtube' ? 'google' : platform,
        relevanceScore: { gte: 70 },
        lifecycle: { in: ['GROWING', 'PEAK'] },
      },
      orderBy: { viralCoefficient: 'desc' },
      take: 10,
    });

    const trendingHashtags = trends
      .map(t => `#${t.keyword.replace(/\s+/g, '')}`)
      .slice(0, 3);

    // Combine base hashtags with trending ones
    const combined = [...baseHashtags, ...trendingHashtags];

    // Remove duplicates and return
    return Array.from(new Set(combined)).slice(0, platform === 'instagram' ? 15 : 5);
  }

  /**
   * Generate A/B test variations
   */
  async generateMetadataVariations(
    request: VideoMetadataRequest,
    count: number = 3,
  ): Promise<VideoMetadata[]> {
    this.logger.log(`Generating ${count} metadata variations...`);

    const variations: VideoMetadata[] = [];

    for (let i = 0; i < count; i++) {
      const metadata = await this.generateMetadata(request);

      // Slightly modify each variation
      if (i > 0) {
        metadata.title = this.createTitleVariation(metadata.title, i);
        metadata.hashtags = await this.optimizeHashtags(metadata.hashtags, request.platform);
      }

      variations.push(metadata);
    }

    return variations;
  }

  /**
   * Create title variation
   */
  private createTitleVariation(baseTitle: string, variationIndex: number): string {
    // Add different hooks/angles
    const hooks = [
      '🚀 ',
      '⚡ ',
      '✨ ',
      'REVEALED: ',
      'WATCH: ',
      'NEW: ',
    ];

    return hooks[variationIndex % hooks.length] + baseTitle;
  }

  /**
   * Save metadata to database
   */
  async saveMetadata(
    metadata: VideoMetadata,
    contentAssetId: string,
  ): Promise<void> {
    await this.prisma.contentAsset.update({
      where: { id: contentAssetId },
      data: {
        videoHashtags: metadata.hashtags,
        videoCaptions: metadata.captions,
        viralPrediction: metadata.viralScore / 100,
        engagementScore: metadata.engagementPrediction / 100,
        metadata: JSON.parse(JSON.stringify({
          title: metadata.title,
          description: metadata.description,
          seoKeywords: metadata.seoKeywords,
          tags: metadata.tags,
          thumbnailSuggestions: metadata.thumbnailSuggestions,
          category: metadata.category,
        })),
      },
    });

    this.logger.log(`Saved metadata to content asset ${contentAssetId}`);
  }

  /**
   * Get saved metadata
   */
  async getMetadata(contentAssetId: string): Promise<VideoMetadata> {
    const asset = await this.prisma.contentAsset.findUnique({
      where: { id: contentAssetId },
    });

    if (!asset || !asset.metadata) {
      throw new Error(`Metadata for asset ${contentAssetId} not found`);
    }

    const metadata = asset.metadata as any;

    return {
      title: metadata.title || '',
      description: metadata.description || '',
      hashtags: asset.videoHashtags || [],
      captions: asset.videoCaptions || [],
      thumbnailSuggestions: metadata.thumbnailSuggestions || [],
      seoKeywords: metadata.seoKeywords || [],
      tags: metadata.tags || [],
      category: metadata.category,
      viralScore: asset.viralPrediction ? parseFloat(asset.viralPrediction.toString()) * 100 : 50,
      engagementPrediction: asset.engagementScore ? parseFloat(asset.engagementScore.toString()) * 100 : 50,
    };
  }
}
