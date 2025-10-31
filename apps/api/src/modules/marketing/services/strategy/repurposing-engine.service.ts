import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SonnetService } from '../../ai/sonnet.service';
import { ContentPlatformValidatorService } from './content-platform-validator.service';

/**
 * REPURPOSING ENGINE SERVICE
 *
 * Transforms one piece of content into multiple platform-optimized versions.
 * Implements "create once, publish everywhere" strategy with platform-specific optimization.
 *
 * Capabilities:
 * - 1 blog post ’ 10+ tweets
 * - 1 blog post ’ 5+ LinkedIn posts
 * - 1 blog post ’ Instagram carousel
 * - 1 blog post ’ TikTok script
 * - 1 blog post ’ YouTube script
 * - 1 video ’ multiple platform clips
 * - Smart content extraction and adaptation
 */

export interface SourceContent {
  type: 'blog' | 'video' | 'podcast' | 'article' | 'whitepaper';
  title: string;
  content: string;
  url?: string;
  metadata?: {
    author?: string;
    publishDate?: Date;
    tags?: string[];
    category?: string;
    wordCount?: number;
    readingTime?: number;
  };
}

export interface RepurposedContent {
  platform: string;
  type: string;
  title?: string;
  body: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url?: string;
    description?: string;
  }[];
  hashtags?: string[];
  callToAction?: string;
  metadata?: any;
  validationScore: number;
  estimatedEngagement: string;
}

export interface RepurposingResult {
  sourceContentId: string;
  sourceType: string;
  sourceTitle: string;
  generated: {
    platform: string;
    count: number;
    pieces: RepurposedContent[];
  }[];
  totalPieces: number;
  estimatedReach: string;
  estimatedEngagement: string;
  generatedAt: Date;
}

export interface RepurposingRules {
  // Per-platform rules
  platforms: {
    platform: string;
    enabled: boolean;
    quantity: number; // How many pieces to generate
    types: string[]; // ['tweet', 'thread', 'quote']
    style?: string; // 'professional', 'casual', 'humorous'
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    maxLength?: number;
  }[];

  // Global preferences
  brandVoice?: string;
  tonePreferences?: string[];
  avoidTopics?: string[];
  mustInclude?: string[];
  callToActionTemplate?: string;
}

@Injectable()
export class RepurposingEngineService {
  private readonly logger = new Logger(RepurposingEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sonnetService: SonnetService,
    private readonly validator: ContentPlatformValidatorService,
  ) {}

  /**
   * Repurpose content for multiple platforms
   */
  async repurposeContent(
    source: SourceContent,
    rules: RepurposingRules,
    profileId: string,
  ): Promise<RepurposingResult> {
    this.logger.log(`= Repurposing ${source.type}: "${source.title}"`);

    const generated: RepurposingResult['generated'] = [];
    let totalPieces = 0;

    // Get profile for brand voice
    const profile = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
    });

    // Process each enabled platform
    for (const platformRule of rules.platforms.filter(p => p.enabled)) {
      this.logger.log(`   Generating ${platformRule.quantity}x ${platformRule.platform} posts...`);

      const pieces: RepurposedContent[] = [];

      for (let i = 0; i < platformRule.quantity; i++) {
        const repurposed = await this.repurposeForPlatform(
          source,
          platformRule,
          profile?.brandVoice || rules.brandVoice,
          i,
        );

        // Validate content
        const validation = await this.validator.validateContent(
          {
            type: repurposed.type,
            title: repurposed.title,
            body: repurposed.body,
            media: repurposed.media,
            hashtags: repurposed.hashtags,
          },
          platformRule.platform,
        );

        repurposed.validationScore = validation.score;
        pieces.push(repurposed);
      }

      generated.push({
        platform: platformRule.platform,
        count: pieces.length,
        pieces,
      });

      totalPieces += pieces.length;
    }

    const result: RepurposingResult = {
      sourceContentId: source.url || 'generated',
      sourceType: source.type,
      sourceTitle: source.title,
      generated,
      totalPieces,
      estimatedReach: this.estimateReach(totalPieces, rules.platforms),
      estimatedEngagement: this.estimateEngagement(generated),
      generatedAt: new Date(),
    };

    this.logger.log(` Repurposed into ${totalPieces} pieces across ${generated.length} platforms`);

    return result;
  }

  /**
   * Repurpose for a specific platform
   */
  private async repurposeForPlatform(
    source: SourceContent,
    rule: RepurposingRules['platforms'][0],
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const platform = rule.platform.toLowerCase();

    // Platform-specific repurposing strategies
    switch (platform) {
      case 'twitter':
        return this.repurposeForTwitter(source, rule, brandVoice, index);
      case 'linkedin':
        return this.repurposeForLinkedIn(source, rule, brandVoice, index);
      case 'facebook':
        return this.repurposeForFacebook(source, rule, brandVoice, index);
      case 'instagram':
        return this.repurposeForInstagram(source, rule, brandVoice, index);
      case 'tiktok':
        return this.repurposeForTikTok(source, rule, brandVoice, index);
      case 'youtube':
        return this.repurposeForYouTube(source, rule, brandVoice, index);
      case 'medium':
        return this.repurposeForMedium(source, rule, brandVoice, index);
      default:
        return this.repurposeGeneric(source, rule, brandVoice, index);
    }
  }

  /**
   * Repurpose for Twitter
   */
  private async repurposeForTwitter(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const types = rule.types || ['tweet', 'thread', 'quote'];
    const type = types[index % types.length];

    let prompt = '';
    let body = '';

    if (type === 'thread') {
      prompt = `
Convert this content into a Twitter thread (5-7 tweets, 250 chars each):

Source: ${source.title}
Content: ${this.truncateContent(source.content, 2000)}
Brand Voice: ${brandVoice || 'Professional'}

Create a compelling thread with:
1. Hook tweet (attention-grabbing)
2. 4-5 value tweets
3. CTA tweet

Format as JSON array: [{"tweet": "text", "order": 1}, ...]
`;

      const response = await this.sonnetService.generateStructuredContent(prompt);
      const tweets = Array.isArray(response) ? response : response.tweets || [];

      body = tweets
        .sort((a, b) => a.order - b.order)
        .map((t, i) => `${i + 1}/ ${t.tweet}`)
        .join('\n\n');
    } else if (type === 'quote') {
      prompt = `
Extract the most powerful quote from this content for Twitter:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 2000)}

Create a quote tweet (under 250 chars) that's shareable and impactful.
Format: {"quote": "text"}
`;

      const response = await this.sonnetService.generateStructuredContent(prompt);
      body = response.quote || response;
    } else {
      // Single tweet
      prompt = `
Create a compelling tweet from this content:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 2000)}
Brand Voice: ${brandVoice || 'Professional'}
Style: ${rule.style || 'engaging'}

Create a tweet (under 270 chars) that:
- Has a strong hook
- Delivers value
- Includes a CTA

Format: {"tweet": "text", "hashtags": ["tag1", "tag2"]}
`;

      const response = await this.sonnetService.generateStructuredContent(prompt);
      body = response.tweet || response.text || response;
    }

    // Generate hashtags
    const hashtagsPrompt = `
Generate 3 relevant hashtags for this tweet about: ${source.title}

Format as JSON: {"hashtags": ["tag1", "tag2", "tag3"]}
`;
    const hashtagsResponse = await this.sonnetService.generateStructuredContent(hashtagsPrompt);
    const hashtags = hashtagsResponse.hashtags || [];

    return {
      platform: 'twitter',
      type,
      body: this.ensureLength(body, 270),
      hashtags: rule.includeHashtags ? hashtags.slice(0, 3) : [],
      callToAction: 'Read more =G',
      validationScore: 0,
      estimatedEngagement: 'medium',
    };
  }

  /**
   * Repurpose for LinkedIn
   */
  private async repurposeForLinkedIn(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const prompt = `
Convert this content into a professional LinkedIn post:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 3000)}
Brand Voice: ${brandVoice || 'Professional'}

Create a LinkedIn post (800-1200 chars) with:
1. Attention-grabbing hook
2. Professional insights
3. Personal experience or story
4. Key takeaways (3-5 bullets)
5. Call to action

Use professional tone, include emojis strategically, and add 3-5 relevant hashtags.

Format as JSON:
{
  "title": "Optional title",
  "body": "Full post text with line breaks",
  "hashtags": ["tag1", "tag2", "tag3"]
}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);

    return {
      platform: 'linkedin',
      type: 'post',
      title: response.title,
      body: response.body || response,
      hashtags: rule.includeHashtags ? (response.hashtags || []).slice(0, 5) : [],
      callToAction: 'What are your thoughts? Share in the comments =G',
      validationScore: 0,
      estimatedEngagement: 'high',
    };
  }

  /**
   * Repurpose for Facebook
   */
  private async repurposeForFacebook(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const prompt = `
Convert this content into an engaging Facebook post:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 2000)}
Brand Voice: ${brandVoice || 'Friendly'}

Create a Facebook post (200-400 chars) that:
1. Starts with a hook or question
2. Delivers value or insight
3. Encourages engagement
4. Includes emojis appropriately

Format as JSON: {"body": "text", "emoji": true}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);

    return {
      platform: 'facebook',
      type: 'post',
      body: response.body || response,
      callToAction: 'Learn more',
      validationScore: 0,
      estimatedEngagement: 'medium',
    };
  }

  /**
   * Repurpose for Instagram
   */
  private async repurposeForInstagram(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const prompt = `
Convert this content into an Instagram caption:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 2000)}
Brand Voice: ${brandVoice || 'Inspirational'}

Create an Instagram caption (150-300 chars) with:
1. Engaging hook
2. Value or story
3. Call to action
4. Strategic emoji use
5. 8-12 hashtags

Format as JSON:
{
  "caption": "text with emojis",
  "hashtags": ["tag1", "tag2", ...],
  "imageDescription": "Suggested image description"
}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);

    return {
      platform: 'instagram',
      type: 'post',
      body: response.caption || response.body || response,
      hashtags: (response.hashtags || []).slice(0, 12),
      media: [
        {
          type: 'image',
          description: response.imageDescription || 'Visual representation of content',
        },
      ],
      callToAction: 'Link in bio =F',
      validationScore: 0,
      estimatedEngagement: 'high',
    };
  }

  /**
   * Repurpose for TikTok
   */
  private async repurposeForTikTok(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const prompt = `
Convert this content into a TikTok video script:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 2000)}

Create a 30-60 second TikTok script with:
1. Hook (first 3 seconds)
2. Value delivery (3 tips/insights)
3. Call to action

Include:
- Scene descriptions
- Text overlay suggestions
- Trending sound recommendations
- Caption (under 150 chars)
- 3-5 hashtags

Format as JSON with script, caption, and hashtags.
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);

    return {
      platform: 'tiktok',
      type: 'video_script',
      body: response.caption || response.body || '',
      metadata: {
        script: response.script || '',
        duration: '30-60s',
        textOverlays: response.textOverlays || [],
        trendingSounds: response.trendingSounds || [],
      },
      hashtags: (response.hashtags || []).slice(0, 5),
      media: [{ type: 'video', description: 'TikTok video based on script' }],
      validationScore: 0,
      estimatedEngagement: 'very high',
    };
  }

  /**
   * Repurpose for YouTube
   */
  private async repurposeForYouTube(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const prompt = `
Convert this content into a YouTube video outline:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 3000)}

Create:
1. Video title (60-70 chars, SEO-optimized)
2. Video script outline (5-7 sections)
3. Description (500-1000 chars with timestamps)
4. 5-8 relevant tags

Format as JSON with title, outline, description, tags.
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);

    return {
      platform: 'youtube',
      type: 'video_script',
      title: response.title || source.title,
      body: response.description || '',
      metadata: {
        outline: response.outline || [],
        tags: response.tags || [],
        duration: '8-12 minutes',
      },
      media: [{ type: 'video', description: 'YouTube video based on outline' }],
      validationScore: 0,
      estimatedEngagement: 'high',
    };
  }

  /**
   * Repurpose for Medium
   */
  private async repurposeForMedium(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    const prompt = `
Adapt this content for Medium publication:

Source: ${source.title}
Content: ${this.truncateContent(source.content, 5000)}
Brand Voice: ${brandVoice || 'Thoughtful'}

Create a Medium article adaptation with:
1. Compelling title
2. Subtitle (one sentence)
3. Restructured content with Medium-style formatting
4. 5 relevant tags

Format as JSON with title, subtitle, body, tags.
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);

    return {
      platform: 'medium',
      type: 'article',
      title: response.title || source.title,
      body: response.body || source.content,
      metadata: {
        subtitle: response.subtitle,
        tags: response.tags || [],
        readingTime: Math.ceil((response.body?.length || 0) / 1000) + ' min read',
      },
      validationScore: 0,
      estimatedEngagement: 'medium',
    };
  }

  /**
   * Generic repurposing
   */
  private async repurposeGeneric(
    source: SourceContent,
    rule: any,
    brandVoice: string,
    index: number,
  ): Promise<RepurposedContent> {
    return {
      platform: rule.platform,
      type: 'post',
      title: source.title,
      body: this.truncateContent(source.content, rule.maxLength || 1000),
      validationScore: 0,
      estimatedEngagement: 'medium',
    };
  }

  /**
   * Get default repurposing rules
   */
  getDefaultRules(): RepurposingRules {
    return {
      platforms: [
        { platform: 'twitter', enabled: true, quantity: 10, types: ['tweet', 'thread', 'quote'] },
        { platform: 'linkedin', enabled: true, quantity: 5, types: ['post'] },
        { platform: 'facebook', enabled: true, quantity: 3, types: ['post'] },
        { platform: 'instagram', enabled: true, quantity: 3, types: ['post', 'carousel'] },
        { platform: 'tiktok', enabled: false, quantity: 2, types: ['video_script'] },
        { platform: 'youtube', enabled: false, quantity: 1, types: ['video_script'] },
        { platform: 'medium', enabled: false, quantity: 1, types: ['article'] },
      ],
      brandVoice: 'Professional and engaging',
      tonePreferences: ['informative', 'helpful', 'actionable'],
      callToActionTemplate: 'Learn more: {url}',
    };
  }

  /**
   * Utility: Truncate content
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Utility: Ensure content doesn't exceed length
   */
  private ensureLength(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + '...';
  }

  /**
   * Estimate reach
   */
  private estimateReach(totalPieces: number, platforms: any[]): string {
    const avgReachPerPiece = 500; // Conservative estimate
    const totalReach = totalPieces * avgReachPerPiece;
    return `${(totalReach / 1000).toFixed(1)}K - ${(totalReach * 2 / 1000).toFixed(1)}K`;
  }

  /**
   * Estimate engagement
   */
  private estimateEngagement(generated: RepurposingResult['generated']): string {
    const totalPieces = generated.reduce((sum, g) => sum + g.count, 0);
    const avgEngagementRate = 0.02; // 2%
    const estimatedEngagement = totalPieces * 500 * avgEngagementRate;
    return `${Math.floor(estimatedEngagement)} - ${Math.floor(estimatedEngagement * 2)} interactions`;
  }

  /**
   * Batch repurpose multiple content pieces
   */
  async batchRepurpose(
    sources: SourceContent[],
    rules: RepurposingRules,
    profileId: string,
  ): Promise<RepurposingResult[]> {
    this.logger.log(`= Batch repurposing ${sources.length} pieces of content`);

    const results = [];
    for (const source of sources) {
      const result = await this.repurposeContent(source, rules, profileId);
      results.push(result);
    }

    this.logger.log(` Batch repurposed ${sources.length} sources into ${results.reduce((sum, r) => sum + r.totalPieces, 0)} pieces`);

    return results;
  }
}
