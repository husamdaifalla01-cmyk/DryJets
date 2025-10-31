import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

export interface VideoScriptRequest {
  topic?: string;
  blogPostId?: string;
  duration: number; // seconds: 15, 30, 60, 180, 600
  platform: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
  style: 'TALKING_HEAD' | 'B_ROLL' | 'SLIDESHOW' | 'ANIMATION';
  tone?: 'professional' | 'casual' | 'humorous' | 'educational';
}

export interface VideoScript {
  hook: string; // First 3 seconds
  script: ScriptSegment[];
  bRollSuggestions: BRollSuggestion[];
  callToAction: string;
  totalDuration: number;
  wordCount: number;
  metadata: {
    pacing: 'slow' | 'medium' | 'fast';
    complexity: 'simple' | 'moderate' | 'advanced';
    energyLevel: 'calm' | 'moderate' | 'high';
  };
}

export interface ScriptSegment {
  timestamp: string; // "00:00 - 00:03"
  text: string;
  onScreenText?: string;
  visualSuggestion?: string;
  emphasis?: string[]; // Words to emphasize
}

export interface BRollSuggestion {
  timestamp: string;
  description: string;
  duration: number;
  searchKeywords?: string[];
}

@Injectable()
export class VideoScriptGeneratorService {
  private readonly logger = new Logger('VideoScriptGenerator');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate video script
   */
  async generateScript(request: VideoScriptRequest): Promise<VideoScript> {
    this.logger.log(`Generating ${request.duration}s video script for ${request.platform}...`);

    let content: string;

    if (request.blogPostId) {
      // Generate from blog post
      const blogPost = await this.prisma.blogPost.findUnique({
        where: { id: request.blogPostId },
      });

      if (!blogPost) {
        throw new Error(`Blog post ${request.blogPostId} not found`);
      }

      content = blogPost.content;
    } else if (request.topic) {
      content = request.topic;
    } else {
      throw new Error('Either topic or blogPostId must be provided');
    }

    // Generate script using AI
    const script = await this.generateScriptWithAI(content, request);

    this.logger.log(`Generated ${script.wordCount} word script for ${request.duration}s video`);
    return script;
  }

  /**
   * Generate script using AI
   */
  private async generateScriptWithAI(
    content: string,
    request: VideoScriptRequest,
  ): Promise<VideoScript> {
    const platformGuidelines = this.getPlatformGuidelines(request.platform, request.duration);

    const prompt = `You are a viral video script writer specializing in ${request.platform} content.

Create a ${request.duration}-second video script for a dry cleaning/laundry marketplace (DryJets).

Content/Topic:
${content}

Platform: ${request.platform}
Duration: ${request.duration} seconds
Style: ${request.style}
Tone: ${request.tone || 'professional yet engaging'}

Platform Guidelines:
${platformGuidelines}

CRITICAL REQUIREMENTS:
1. HOOK (First 3 seconds): Must grab attention immediately
2. Script must be ${this.calculateWordCount(request.duration)} words or less
3. Include timestamps for each segment
4. Suggest B-roll footage with timestamps
5. Include a strong call-to-action
6. Make it highly engaging and value-packed

Return JSON in this EXACT format:
{
  "hook": "The first thing you'll say (1 powerful sentence)",
  "script": [
    {
      "timestamp": "00:00 - 00:03",
      "text": "Your hook text",
      "onScreenText": "Bold text to show on screen",
      "visualSuggestion": "What to show visually",
      "emphasis": ["word1", "word2"]
    },
    {
      "timestamp": "00:03 - 00:08",
      "text": "Next segment",
      "onScreenText": "...",
      "visualSuggestion": "...",
      "emphasis": []
    }
  ],
  "bRollSuggestions": [
    {
      "timestamp": "00:05 - 00:08",
      "description": "Close-up of dry cleaning machine in action",
      "duration": 3,
      "searchKeywords": ["dry cleaning", "commercial laundry", "industrial cleaning"]
    }
  ],
  "callToAction": "Strong CTA that drives action",
  "pacing": "fast",
  "complexity": "simple",
  "energyLevel": "high"
}

Return ONLY valid JSON. No additional text.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);

        const script: VideoScript = {
          hook: result.hook,
          script: result.script,
          bRollSuggestions: result.bRollSuggestions || [],
          callToAction: result.callToAction,
          totalDuration: request.duration,
          wordCount: this.countWords(result.script),
          metadata: {
            pacing: result.pacing || 'medium',
            complexity: result.complexity || 'moderate',
            energyLevel: result.energyLevel || 'moderate',
          },
        };

        return script;
      }
    } catch (error) {
      this.logger.error(`Error generating script with AI: ${error.message}`);
    }

    // Fallback: rule-based script generation
    return this.generateRuleBasedScript(content, request);
  }

  /**
   * Get platform-specific guidelines
   */
  private getPlatformGuidelines(platform: string, duration: number): string {
    const guidelines = {
      tiktok: `
- Hook in first 1-3 seconds is CRITICAL
- Fast-paced, high energy
- Use trending sounds/music references
- Vertical format (9:16)
- On-screen text for every key point
- End with clear CTA
- Ideal length: 15-60 seconds
`,
      youtube: `
- Hook in first 5 seconds
- Can be more educational/detailed
- Pattern interrupts every 8-10 seconds
- Horizontal format (16:9) or Shorts (9:16)
- Chapter markers for longer videos
- Strong CTA and subscribe prompt
- Ideal length: 60s-10min depending on content
`,
      instagram: `
- Hook in first 3 seconds
- Visually stunning, aesthetic
- Square (1:1) or vertical (9:16)
- Closed captions essential
- End screen with CTA
- Ideal length: 15-60 seconds for Reels
`,
      linkedin: `
- Professional but engaging hook
- Value-driven content
- Can be more detailed
- Square (1:1) or horizontal (16:9)
- Subtitles important
- Business-focused CTA
- Ideal length: 30s-3min
`,
    };

    return guidelines[platform] || guidelines.youtube;
  }

  /**
   * Calculate target word count based on duration
   */
  private calculateWordCount(durationSeconds: number): number {
    // Average speaking rate: 150 words per minute
    // For video, slightly faster: 160-180 wpm
    const wordsPerSecond = 2.8; // ~170 wpm
    return Math.floor(durationSeconds * wordsPerSecond);
  }

  /**
   * Count words in script
   */
  private countWords(script: ScriptSegment[]): number {
    return script.reduce((count, segment) => {
      return count + segment.text.split(/\s+/).length;
    }, 0);
  }

  /**
   * Rule-based fallback script generation
   */
  private generateRuleBasedScript(
    content: string,
    request: VideoScriptRequest,
  ): VideoScript {
    const targetWords = this.calculateWordCount(request.duration);
    const excerpt = content.substring(0, targetWords * 6); // Rough estimate

    const hook = this.generateHook(excerpt, request.platform);

    const segments: ScriptSegment[] = [
      {
        timestamp: '00:00 - 00:03',
        text: hook,
        onScreenText: 'DID YOU KNOW?',
        visualSuggestion: 'Eye-catching visual hook',
        emphasis: ['you'],
      },
      {
        timestamp: '00:03 - 00:10',
        text: 'Here is how DryJets is revolutionizing dry cleaning with on-demand pickup and delivery.',
        onScreenText: 'On-Demand Laundry',
        visualSuggestion: 'App interface showing order placement',
        emphasis: ['DryJets', 'on-demand'],
      },
    ];

    if (request.duration >= 30) {
      segments.push({
        timestamp: '00:10 - 00:20',
        text: 'No more wasting time driving to the cleaners. We pick up, clean, and deliver - all from your phone.',
        onScreenText: 'Save Time & Hassle',
        visualSuggestion: 'Driver pickup, cleaning process montage',
        emphasis: ['pick up', 'clean', 'deliver'],
      });
    }

    if (request.duration >= 60) {
      segments.push({
        timestamp: '00:20 - 00:40',
        text: 'With eco-friendly practices, real-time tracking, and professional care for your garments, DryJets makes laundry effortless.',
        onScreenText: 'Eco-Friendly • Professional • Convenient',
        visualSuggestion: 'Green practices, tracking map, clean clothes',
        emphasis: ['eco-friendly', 'real-time tracking', 'professional'],
      });
    }

    // Add CTA at the end
    const ctaTimestamp = this.formatTimestamp(request.duration - 5) + ' - ' + this.formatTimestamp(request.duration);
    segments.push({
      timestamp: ctaTimestamp,
      text: 'Download DryJets today and get your first order 20% off!',
      onScreenText: 'Download Now - 20% OFF',
      visualSuggestion: 'App download screen, promo code',
      emphasis: ['Download', '20% off'],
    });

    return {
      hook,
      script: segments,
      bRollSuggestions: [
        {
          timestamp: '00:03 - 00:10',
          description: 'Montage of laundry being picked up, cleaned, delivered',
          duration: 7,
          searchKeywords: ['dry cleaning service', 'laundry pickup', 'delivery'],
        },
      ],
      callToAction: 'Download DryJets and save 20% on your first order!',
      totalDuration: request.duration,
      wordCount: this.countWords(segments),
      metadata: {
        pacing: request.platform === 'tiktok' ? 'fast' : 'medium',
        complexity: 'simple',
        energyLevel: request.platform === 'tiktok' ? 'high' : 'moderate',
      },
    };
  }

  /**
   * Generate hook
   */
  private generateHook(content: string, platform: string): string {
    const hooks = [
      'Stop! Before you drive to the dry cleaners...',
      'What if I told you dry cleaning could come to you?',
      'The dry cleaning industry just changed forever.',
      'Spending hours on laundry? There is a better way.',
      'This app just saved me 3 hours a week.',
    ];

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  /**
   * Format timestamp
   */
  private formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Generate multiple script variations
   */
  async generateScriptVariations(
    request: VideoScriptRequest,
    count: number = 3,
  ): Promise<VideoScript[]> {
    this.logger.log(`Generating ${count} script variations...`);

    const scripts: VideoScript[] = [];

    for (let i = 0; i < count; i++) {
      const script = await this.generateScript({
        ...request,
        tone: i === 0 ? 'professional' : i === 1 ? 'casual' : 'humorous',
      });
      scripts.push(script);
    }

    return scripts;
  }

  /**
   * Save script to database
   */
  async saveScript(
    script: VideoScript,
    request: VideoScriptRequest,
    campaignId?: string,
  ): Promise<string> {
    const contentAsset = await this.prisma.contentAsset.create({
      data: {
        type: 'SCRIPT',
        platform: request.platform,
        campaignId,
        content: JSON.stringify(script.script),
        videoScript: JSON.stringify(script),
        videoHook: script.hook,
        videoDuration: script.totalDuration,
        videoStyle: request.style,
        metadata: JSON.parse(JSON.stringify({
          bRollSuggestions: script.bRollSuggestions,
          callToAction: script.callToAction,
          wordCount: script.wordCount,
          ...script.metadata,
        })),
        aiGenerated: true,
      },
    });

    this.logger.log(`Saved script ${contentAsset.id}`);
    return contentAsset.id;
  }

  /**
   * Get script by ID
   */
  async getScript(id: string): Promise<VideoScript> {
    const asset = await this.prisma.contentAsset.findUnique({
      where: { id },
    });

    if (!asset || !asset.videoScript) {
      throw new Error(`Script ${id} not found`);
    }

    return JSON.parse(asset.videoScript as string);
  }
}
