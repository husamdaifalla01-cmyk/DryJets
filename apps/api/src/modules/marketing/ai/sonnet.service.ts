import { Injectable, Logger } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * SonnetService
 *
 * Handles complex, creative tasks that require deep reasoning and generation.
 * Uses Claude Sonnet (3.5) for:
 * - Blog post generation
 * - Content repurposing
 * - SEO optimization
 * - Copy writing
 *
 * Called by OrchestratorService when complexity > 0.7
 */
@Injectable()
export class SonnetService {
  private logger = new Logger('SonnetService');
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Execute a complex task with Sonnet
   */
  async execute(agentName: string, actionType: string, data: any) {
    const startTime = Date.now();

    try {
      switch (agentName) {
        case 'mira':
          return await this.miraBlogGeneration(actionType, data, startTime);
        case 'leo':
          return await this.leoContentRepurposing(actionType, data, startTime);
        case 'rin':
          return await this.rinAnalysis(actionType, data, startTime);
        default:
          throw new Error(`Unknown agent: ${agentName}`);
      }
    } catch (error) {
      this.logger.error(`Sonnet execution error for ${agentName}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate structured content from a prompt
   * Used by strategy services for competitor analysis, content validation, etc.
   *
   * @param prompt - The prompt to send to Claude Sonnet
   * @returns Parsed JSON object or raw text if parsing fails
   */
  async generateStructuredContent(prompt: string): Promise<any> {
    try {
      this.logger.log('[SonnetService] Generating structured content...');

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';

      // Attempt to parse as JSON
      try {
        const parsed = JSON.parse(response);
        this.logger.log('[SonnetService] Successfully parsed structured content as JSON');
        return parsed;
      } catch (parseError) {
        this.logger.warn('[SonnetService] Could not parse as JSON, returning raw text');
        return { content: response, raw: true };
      }
    } catch (error) {
      this.logger.error('[SonnetService] Error generating structured content:', error.message);
      throw new Error(`Failed to generate structured content: ${error.message}`);
    }
  }

  /**
   * MIRA: Blog Generation with SEO Optimization
   */
  private async miraBlogGeneration(actionType: string, data: any, startTime: number) {
    this.logger.log('[Mira] Starting blog generation...');

    const prompt = `
You are Mira, DryJets' SEO-optimized content strategist. Generate a comprehensive blog post.

REQUIREMENTS:
- Title: SEO-friendly (include primary keyword)
- Length: 2000+ words
- Include: H1, H2 (4-5), H3 (2-3 per H2), H4 (1-2 per H3)
- Meta: Title (60 chars max), Description (160 chars max)
- Keywords: 5-7 relevant SEO keywords
- Internal links: 3-5 suggestions to DryJets platform pages
- CTA: Include 2-3 calls-to-action throughout

TOPIC: ${data.theme || 'Local SEO for dry cleaning services'}
CITY: ${data.city || 'Ottawa'}
FOCUS: ${data.focus || 'Help customers find local dry cleaning and laundry services'}
SEASONALITY: ${data.seasonality || 'General guide'}

OUTPUT FORMAT:
{
  "title": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["...", "..."],
  "excerpt": "...",
  "content": "# Main content in markdown with proper heading hierarchy",
  "internalLinks": [
    { "text": "...", "url": "...", "context": "..." }
  ],
  "structuredData": {
    "type": "BlogPosting",
    "schema": {...}
  }
}

Generate high-quality, engaging content that ranks for the target keywords.
    `;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const executionTime = Date.now() - startTime;
    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the response JSON
    let result;
    try {
      result = JSON.parse(response);
    } catch {
      this.logger.warn('[Mira] Could not parse JSON response, returning raw text');
      result = { content: response, raw: true };
    }

    // Save to database if content was generated
    if (result.title && result.content) {
      const slug = result.title.toLowerCase().replace(/\s+/g, '-');

      await this.prisma.blogPost.create({
        data: {
          title: result.title,
          slug: `${slug}-${Date.now()}`,
          content: result.content,
          excerpt: result.excerpt || result.metaDescription,
          keywords: result.keywords || [],
          metaTitle: result.metaTitle,
          metaDescription: result.metaDescription,
          status: 'PENDING_REVIEW', // Require human approval
          aiGenerated: true,
          aiBrief: data,
          createdBy: 'mira',
        },
      });

      this.logger.log('[Mira] Blog post saved to database');
    }

    return {
      success: true,
      agentName: 'mira',
      result,
      executionTime,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
  }

  /**
   * LEO: Content Repurposing Across Platforms
   */
  private async leoContentRepurposing(actionType: string, data: any, startTime: number) {
    this.logger.log('[Leo] Starting content repurposing...');

    const prompt = `
You are Leo, DryJets' creative director. Repurpose a blog post across multiple platforms.

BLOG POST:
Title: ${data.blogTitle || 'Article about dry cleaning'}
Content Snippet: ${data.contentSnippet || 'See the original blog post for full content'}
Primary Message: ${data.primaryMessage || 'Help customers find quality dry cleaning services'}

TARGET PLATFORMS: ${(data.platforms || ['linkedin', 'instagram', 'tiktok']).join(', ')}

For each platform, create:
1. Platform-native post (with format specifics)
2. Tone and style (professional, casual, trendy)
3. Length and formatting (characters, emojis, hashtags)
4. Call-to-action (platform-specific)
5. Engagement hooks
6. Hashtag suggestions (5-10)

REQUIREMENTS:
- Each piece should feel native to the platform
- Maintain consistent brand message
- Optimize for platform algorithms
- Include platform-specific CTAs
- Suggest best posting times

OUTPUT FORMAT:
{
  "linkedin": {
    "title": "...",
    "content": "...",
    "cta": "...",
    "hashtags": ["...", "..."],
    "tone": "...",
    "bestTimeToPost": "..."
  },
  "instagram": { ... },
  "tiktok": { ... },
  "email": { ... },
  "repurposingStrategy": "..."
}

Create platform-specific variations that drive engagement and traffic back to the blog.
    `;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const executionTime = Date.now() - startTime;
    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the response JSON
    let result;
    try {
      result = JSON.parse(response);
    } catch {
      this.logger.warn('[Leo] Could not parse JSON response, returning raw text');
      result = { content: response, raw: true };
    }

    this.logger.log('[Leo] Content repurposing complete');

    return {
      success: true,
      agentName: 'leo',
      result,
      executionTime,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
  }

  /**
   * RIN: Analytics and Performance Analysis
   */
  private async rinAnalysis(actionType: string, data: any, startTime: number) {
    this.logger.log('[Rin] Starting analytics analysis...');

    const prompt = `
You are Rin, DryJets' analytics advisor. Analyze marketing performance and provide insights.

ANALYSIS TYPE: ${actionType}
DATA: ${JSON.stringify(data)}

Provide:
1. Top 3 performing content pieces (with metrics)
2. Bottom 3 underperforming pieces (with diagnoses)
3. Emerging trends in audience behavior
4. Content gaps in the current strategy
5. 5 specific recommendations for improvement
6. Predicted impact of recommendations (ROI estimate)
7. Key metrics to monitor (KPIs)

OUTPUT FORMAT:
{
  "performanceSummary": {
    "totalReach": 0,
    "totalEngagement": 0,
    "avgCTR": 0,
    "trendDirection": "increasing/stable/declining"
  },
  "topPerformers": [...],
  "underperformers": [...],
  "trends": [...],
  "gaps": [...],
  "recommendations": [...],
  "kpis": [...]
}

Be specific, data-driven, and actionable in your recommendations.
    `;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const executionTime = Date.now() - startTime;
    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the response JSON
    let result;
    try {
      result = JSON.parse(response);
    } catch {
      this.logger.warn('[Rin] Could not parse JSON response, returning raw text');
      result = { content: response, raw: true };
    }

    this.logger.log('[Rin] Analytics analysis complete');

    return {
      success: true,
      agentName: 'rin',
      result,
      executionTime,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
  }
}
