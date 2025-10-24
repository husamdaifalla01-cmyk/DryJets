import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SonnetService } from './sonnet.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * OrchestratorService
 *
 * Acts as the main controller for AI-powered marketing operations.
 * Uses Haiku for lightweight orchestration and routing,
 * delegates complex tasks to Sonnet for content generation.
 *
 * Pattern: Haiku (lightweight router) → Sonnet (heavy lifting)
 */
@Injectable()
export class OrchestratorService {
  private logger = new Logger('OrchestratorService');
  private anthropic: Anthropic;

  constructor(
    private prisma: PrismaService,
    private sonnetService: SonnetService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Route a task to the appropriate agent
   * Haiku determines complexity and routes to Sonnet if needed
   */
  async routeToAgent(agentName: string, actionType: string, data: any) {
    this.logger.log(`[${agentName}] Routing action: ${actionType}`);

    // Create agent log record
    const logRecord = await this.prisma.aIAgentLog.create({
      data: {
        agentName,
        actionType,
        inputData: data,
        modelUsed: 'pending',
        success: false,
      },
    });

    try {
      // Assess complexity to determine which model to use
      const complexity = this.assessComplexity(actionType, data);

      let result;
      if (complexity > 0.7) {
        // Use Sonnet for complex creative/generative tasks
        this.logger.log(`[${agentName}] High complexity (${complexity}) - routing to Sonnet`);
        result = await this.sonnetService.execute(agentName, actionType, data);

        // Update log with success
        await this.prisma.aIAgentLog.update({
          where: { id: logRecord.id },
          data: {
            modelUsed: 'sonnet',
            outputData: result,
            success: true,
            executionTimeMs: result.executionTime || 0,
            tokensUsed: result.tokensUsed || 0,
          },
        });

        return result;
      } else {
        // Use Haiku for lightweight tasks (scheduling, formatting, routing)
        this.logger.log(`[${agentName}] Low complexity (${complexity}) - using Haiku`);
        result = await this.executeWithHaiku(agentName, actionType, data);

        await this.prisma.aIAgentLog.update({
          where: { id: logRecord.id },
          data: {
            modelUsed: 'haiku',
            outputData: result,
            success: true,
            executionTimeMs: result.executionTime || 0,
            tokensUsed: result.tokensUsed || 0,
          },
        });

        return result;
      }
    } catch (error) {
      this.logger.error(`[${agentName}] Error in ${actionType}:`, error.message);

      // Update log with error
      await this.prisma.aIAgentLog.update({
        where: { id: logRecord.id },
        data: {
          success: false,
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Assess task complexity to determine model routing
   * Returns score 0.0 - 1.0 (higher = more complex)
   */
  private assessComplexity(actionType: string, data: any): number {
    // Content generation = high complexity
    if (actionType.includes('GENERATE') || actionType.includes('WRITE')) {
      return 1.0;
    }

    // Repurposing = high complexity (creative adaptation)
    if (actionType.includes('REPURPOSE') || actionType.includes('REWRITE')) {
      return 0.9;
    }

    // Analysis = medium-high complexity
    if (actionType.includes('ANALYZE') || actionType.includes('SUMMARIZE')) {
      return 0.6;
    }

    // Scheduling, formatting, publishing = low complexity
    if (
      actionType.includes('SCHEDULE') ||
      actionType.includes('PUBLISH') ||
      actionType.includes('FORMAT')
    ) {
      return 0.2;
    }

    // Default to medium
    return 0.5;
  }

  /**
   * Execute a task with Haiku (lightweight model)
   * Used for simple orchestration, routing, and decision-making
   */
  private async executeWithHaiku(agentName: string, actionType: string, data: any) {
    const startTime = Date.now();

    try {
      // Use Haiku for lightweight operations
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: this.buildHaikuPrompt(agentName, actionType, data),
          },
        ],
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        result: message.content[0].type === 'text' ? message.content[0].text : null,
        executionTime,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      };
    } catch (error) {
      this.logger.error('Haiku execution error:', error.message);
      throw error;
    }
  }

  /**
   * Build prompt for Haiku based on agent and action
   */
  private buildHaikuPrompt(agentName: string, actionType: string, data: any): string {
    switch (agentName) {
      case 'mira':
        return this.buildMiraPrompt(actionType, data);
      case 'leo':
        return this.buildLeoPrompt(actionType, data);
      case 'rin':
        return this.buildRinPrompt(actionType, data);
      default:
        return JSON.stringify({ agentName, actionType, data });
    }
  }

  /**
   * Build Mira (SEO Strategist) prompt
   */
  private buildMiraPrompt(actionType: string, data: any): string {
    if (actionType === 'GENERATE_BLOG') {
      return `
You are Mira, DryJets' SEO Strategist AI. Generate a brief outline for a blog post.

Theme/Keywords: ${data.theme || 'local SEO for dry cleaning services'}
City: ${data.city || 'Ottawa'}
Focus: ${data.focus || 'Keyword-rich, local SEO optimized'}

Provide:
1. Blog title (SEO-friendly)
2. Meta description
3. Target keywords (5-7)
4. H1-H4 structure outline
5. Internal linking suggestions

Format as JSON.
      `;
    }

    return `Mira SEO Task: ${actionType}\nData: ${JSON.stringify(data)}`;
  }

  /**
   * Build Leo (Creative Director) prompt
   */
  private buildLeoPrompt(actionType: string, data: any): string {
    if (actionType === 'REPURPOSE_CONTENT') {
      return `
You are Leo, DryJets' Creative Director. Plan content repurposing across platforms.

Blog Post Title: ${data.blogTitle || 'N/A'}
Platforms: ${(data.platforms || ['linkedin', 'instagram', 'tiktok']).join(', ')}

For each platform, suggest:
1. Content type (caption, video script, carousel)
2. Tone and style
3. Key message (unique to platform)
4. CTA variation
5. Hashtags/Keywords

Format as JSON platform map.
      `;
    }

    return `Leo Creative Task: ${actionType}\nData: ${JSON.stringify(data)}`;
  }

  /**
   * Build Rin (Analytics Advisor) prompt
   */
  private buildRinPrompt(actionType: string, data: any): string {
    if (actionType === 'ANALYZE_CAMPAIGNS') {
      return `
You are Rin, DryJets' Analytics Advisor. Provide a performance pulse summary.

Analyze recent campaign data and provide:
1. Top 3 performing content pieces
2. Underperforming areas to address
3. Emerging trends to capitalize on
4. Recommended next actions (3-5)
5. KPI recommendations

Format as JSON with actionable insights.
      `;
    }

    return `Rin Analytics Task: ${actionType}\nData: ${JSON.stringify(data)}`;
  }

  /**
   * Poll triggers for scheduled tasks
   * Called by a cron job to check if any automated tasks should run
   */
  async pollTriggers() {
    this.logger.log('[Scheduler] Polling for triggers...');

    try {
      // Check if a blog post is due (daily)
      const blogDue = await this.checkBlogSchedule();
      if (blogDue) {
        this.logger.log('[Scheduler] Blog generation due - routing to Mira');
        await this.routeToAgent('mira', 'GENERATE_BLOG', {
          theme: 'local_seo',
          frequency: 'daily',
        });
      }

      // Check campaign performance
      const lowPerforming = await this.checkCampaignMetrics();
      if (lowPerforming.length > 0) {
        this.logger.log(`[Scheduler] Found ${lowPerforming.length} underperforming campaigns`);
        await this.routeToAgent('rin', 'ANALYZE_PERFORMANCE', {
          campaigns: lowPerforming,
        });
      }
    } catch (error) {
      this.logger.error('[Scheduler] Poll error:', error.message);
    }
  }

  /**
   * Check if blog generation is due
   */
  private async checkBlogSchedule(): Promise<boolean> {
    // Get the last published blog post
    const lastBlog = await this.prisma.blogPost.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });

    if (!lastBlog) {
      // No blogs published yet, first one is due
      return true;
    }

    // Check if it's been more than 24 hours since last publish
    const timeSinceLastBlog = Date.now() - lastBlog.publishedAt.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return timeSinceLastBlog > oneDayMs;
  }

  /**
   * Check campaign metrics for underperforming campaigns
   */
  private async checkCampaignMetrics(): Promise<any[]> {
    // Get active campaigns
    const campaigns = await this.prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
      include: {
        contentAssets: true,
      },
    });

    // Filter for campaigns with low average performance score
    return campaigns.filter((campaign) => {
      if (campaign.contentAssets.length === 0) return false;

      const avgScore =
        campaign.contentAssets.reduce((sum, asset) => {
          return sum + (parseFloat(asset.performanceScore?.toString() || '0'));
        }, 0) / campaign.contentAssets.length;

      // Flag if average score < 0.5
      return avgScore < 0.5;
    });
  }
}
