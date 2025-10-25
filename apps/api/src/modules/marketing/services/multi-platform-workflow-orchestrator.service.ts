import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';
import { MultiPlatformWorkflow, PublishedContent } from '@prisma/client';

@Injectable()
export class MultiPlatformWorkflowOrchestrator {
  private readonly logger = new Logger('MultiPlatformWorkflowOrchestrator');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Create and launch a multi-platform workflow
   */
  async createWorkflow(input: {
    name: string;
    type: 'AUTONOMOUS' | 'CUSTOM_CAMPAIGN';
    customInput?: any;
    selectedPlatforms: string[];
    presetId?: string;
    createdBy: string;
  }): Promise<MultiPlatformWorkflow> {
    this.logger.log(`Creating workflow: ${input.name}`);

    const workflow = await this.prisma.multiPlatformWorkflow.create({
      data: {
        name: input.name,
        type: input.type,
        status: 'CONFIGURING',
        customInput: input.customInput,
        platformConfig: {
          platforms: input.selectedPlatforms,
          presetUsed: input.presetId,
        },
        createdBy: input.createdBy,
      },
    });

    this.logger.log(`Workflow created with ID: ${workflow.id}`);
    return workflow;
  }

  /**
   * Generate content for all selected platforms
   */
  async generateContent(workflowId: string): Promise<PublishedContent[]> {
    this.logger.log(`Generating content for workflow: ${workflowId}`);

    const workflow = await this.prisma.multiPlatformWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Update status to GENERATING
    await this.prisma.multiPlatformWorkflow.update({
      where: { id: workflowId },
      data: { status: 'GENERATING' },
    });

    const platforms = (workflow.platformConfig as any).platforms || [];
    const contentPieces: PublishedContent[] = [];

    for (const platformId of platforms) {
      const platform = await this.prisma.publishingPlatform.findUnique({
        where: { id: platformId },
      });

      if (!platform) continue;

      // Generate content using Claude
      const generatedContent = await this.generatePlatformContent(
        workflow,
        platform,
      );

      // Create content piece in database
      const customInput = (workflow.customInput as any) || {};
      const contentPiece = await this.prisma.publishedContent.create({
        data: {
          workflowId,
          platformId: platform.id,
          type: this.getPlatformContentType(platform.type),
          pillar: customInput.pillar || 'general',
          status: 'GENERATED',
          content: generatedContent,
          geography: {
            level: 'global',
            location: 'worldwide',
            coordinates: null,
          },
        },
      });

      contentPieces.push(contentPiece);
      this.logger.log(
        `Generated content for platform: ${platform.name} (${contentPiece.id})`,
      );
    }

    return contentPieces;
  }

  /**
   * Generate platform-specific content
   */
  private async generatePlatformContent(
    workflow: MultiPlatformWorkflow,
    platform: any,
  ): Promise<any> {
    const prompt = this.buildContentPrompt(workflow, platform);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const contentText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response if available
    try {
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      this.logger.warn('Could not parse JSON content response');
    }

    return this.formatContentForPlatform(contentText, platform.type);
  }

  /**
   * Build content generation prompt
   */
  private buildContentPrompt(workflow: MultiPlatformWorkflow, platform: any) {
    const customInput = (workflow.customInput as any) || {};

    return `
Generate engaging content for ${platform.name} based on the following:

Topic/Theme: ${customInput.topic || 'marketing campaign'}
Pillar: ${customInput.pillar || 'general'}
Tone: ${customInput.tone || 'professional'}
Call to Action: ${customInput.cta || 'Learn more'}

Platform Requirements:
- Max Length: ${(platform.contentSpecs as any)?.maxLength || 280}
- Type: ${platform.type}
- Supports Media: ${(platform.contentSpecs as any)?.supportsImages ? 'Yes' : 'No'}

Generate a JSON response with the following structure:
{
  "title": "Post title or headline",
  "body": "Main content for the platform",
  "hashtags": ["tag1", "tag2", "tag3"],
  "mentions": ["@user1", "@user2"],
  "mediaRecommendations": ["image", "video"] or [],
  "cta": "Call to action text"
}
`;
  }

  /**
   * Format content according to platform requirements
   */
  private formatContentForPlatform(content: string, platformType: string): any {
    return {
      title: `Content for ${platformType}`,
      body: content.substring(0, 280),
      hashtags: ['#marketing', '#content'],
      mentions: [],
      mediaRecommendations: [],
      cta: 'Learn more',
    };
  }

  /**
   * Get content type for platform
   */
  private getPlatformContentType(
    platformType: string,
  ): 'BLOG' | 'SOCIAL_POST' | 'VIDEO' | 'IMAGE' | 'THREAD' | 'STORY' {
    const typeMap = {
      social: 'SOCIAL_POST',
      blog: 'BLOG',
      video: 'VIDEO',
      community: 'THREAD',
    };
    return (typeMap[platformType] || 'SOCIAL_POST') as any;
  }

  /**
   * Review and approve content
   */
  async reviewContent(
    workflowId: string,
    approvedIds: string[],
    rejectedIds: string[],
  ): Promise<MultiPlatformWorkflow> {
    this.logger.log(`Reviewing content for workflow: ${workflowId}`);

    // Update approved content
    await this.prisma.publishedContent.updateMany({
      where: { id: { in: approvedIds } },
      data: { status: 'APPROVED' },
    });

    // Update rejected content
    await this.prisma.publishedContent.updateMany({
      where: { id: { in: rejectedIds } },
      data: { status: 'REJECTED' },
    });

    // Update workflow status
    const workflow = await this.prisma.multiPlatformWorkflow.update({
      where: { id: workflowId },
      data: { status: 'REVIEW' },
    });

    this.logger.log(
      `Content review completed: ${approvedIds.length} approved, ${rejectedIds.length} rejected`,
    );

    return workflow;
  }

  /**
   * Publish approved content to all platforms
   */
  async publishContent(workflowId: string): Promise<{
    published: number;
    failed: number;
    details: any[];
  }> {
    this.logger.log(`Publishing content for workflow: ${workflowId}`);

    const content = await this.prisma.publishedContent.findMany({
      where: { workflowId, status: 'APPROVED' },
      include: { platform: true },
    });

    const results = { published: 0, failed: 0, details: [] };

    for (const piece of content) {
      try {
        // In production, this would call actual platform APIs
        const publishResult = await this.publishToSinglePlatform(piece);

        await this.prisma.publishedContent.update({
          where: { id: piece.id },
          data: { status: 'PUBLISHED', publishedAt: new Date() },
        });

        results.published++;
        results.details.push({
          contentId: piece.id,
          platform: piece.platform.name,
          status: 'published',
        });

        this.logger.log(
          `Published to ${piece.platform.name}: ${publishResult.id}`,
        );
      } catch (error) {
        results.failed++;
        results.details.push({
          contentId: piece.id,
          platform: piece.platform.name,
          status: 'failed',
          error: error.message,
        });

        await this.prisma.publishedContent.update({
          where: { id: piece.id },
          data: { status: 'FAILED' },
        });

        this.logger.error(
          `Failed to publish to ${piece.platform.name}: ${error.message}`,
        );
      }
    }

    // Update workflow status
    await this.prisma.multiPlatformWorkflow.update({
      where: { id: workflowId },
      data: {
        status: results.failed === 0 ? 'COMPLETED' : 'PUBLISHING',
        launchedAt: new Date(),
      },
    });

    return results;
  }

  /**
   * Publish content to a single platform (stub for API integration)
   */
  private async publishToSinglePlatform(
    content: PublishedContent & { platform: any },
  ): Promise<{
    id: string;
    status: string;
  }> {
    // This would be replaced with actual API calls
    const platformSlug = content.platform.slug;

    // Simulate platform-specific publishing
    switch (platformSlug) {
      case 'twitter':
        return this.publishToTwitter(content);
      case 'linkedin':
        return this.publishToLinkedin(content);
      case 'facebook':
        return this.publishToFacebook(content);
      default:
        return { id: `mock-${content.id}`, status: 'published' };
    }
  }

  /**
   * Mock Twitter publishing
   */
  private async publishToTwitter(content: PublishedContent): Promise<{
    id: string;
    status: string;
  }> {
    // TODO: Implement actual Twitter API call
    return { id: `twitter-${content.id}`, status: 'published' };
  }

  /**
   * Mock LinkedIn publishing
   */
  private async publishToLinkedin(content: PublishedContent): Promise<{
    id: string;
    status: string;
  }> {
    // TODO: Implement actual LinkedIn API call
    return { id: `linkedin-${content.id}`, status: 'published' };
  }

  /**
   * Mock Facebook publishing
   */
  private async publishToFacebook(content: PublishedContent): Promise<{
    id: string;
    status: string;
  }> {
    // TODO: Implement actual Facebook API call
    return { id: `facebook-${content.id}`, status: 'published' };
  }

  /**
   * Get workflow status and details
   */
  async getWorkflowStatus(workflowId: string): Promise<{
    workflow: MultiPlatformWorkflow;
    content: PublishedContent[];
    stats: any;
  }> {
    const workflow = await this.prisma.multiPlatformWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        contentPieces: true,
        costLogs: true,
        performance: true,
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const content = await this.prisma.publishedContent.findMany({
      where: { workflowId },
      include: { platform: true },
    });

    const stats = {
      totalContent: content.length,
      published: content.filter((c) => c.status === 'PUBLISHED').length,
      pending: content.filter((c) => c.status === 'APPROVED').length,
      rejected: content.filter((c) => c.status === 'REJECTED').length,
      platforms: content.map((c) => c.platform.name),
    };

    return { workflow, content, stats };
  }
}
