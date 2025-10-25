import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new marketing campaign
   */
  async createCampaign(data: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        type: data.type,
        platforms: data.platforms,
        budgetTotal: data.budgetTotal,
        targetAudience: data.targetAudience,
        aiGenerated: data.aiGenerated ?? true,
        aiAgent: data.aiAgent,
      },
    });
  }

  /**
   * List all campaigns with optional filters
   */
  async listCampaigns(status?: string) {
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
    return this.prisma.campaign.findMany({
      where: status && validStatuses.includes(status) ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: { contentAssets: true },
    });
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: { contentAssets: true },
    });
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(id: string, status: string) {
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    return this.prisma.campaign.update({
      where: { id },
      data: { status: status as any },
    });
  }

  /**
   * Create a new blog post
   */
  async createBlogPost(data: CreateBlogPostDto) {
    // Generate slug from title if not provided
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-');

    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        keywords: data.keywords,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        aiGenerated: data.aiGenerated ?? true,
        aiBrief: data.aiBrief,
        createdBy: data.createdBy ?? 'mira',
      },
    });
  }

  /**
   * List all blog posts with optional filters
   */
  async listBlogPosts(status?: string, take: number = 20) {
    const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
    return this.prisma.blogPost.findMany({
      where: status && validStatuses.includes(status) ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      take,
      include: { seoMetrics: true, contentAssets: true },
    });
  }

  /**
   * Get blog post by ID or slug
   */
  async getBlogPost(idOrSlug: string) {
    // Try to find by slug first (more common)
    let post = await this.prisma.blogPost.findUnique({
      where: { slug: idOrSlug },
      include: { seoMetrics: true, contentAssets: true },
    });

    if (!post) {
      // Try by ID
      post = await this.prisma.blogPost.findUnique({
        where: { id: idOrSlug },
        include: { seoMetrics: true, contentAssets: true },
      });
    }

    return post;
  }

  /**
   * Update blog post status
   */
  async updateBlogPostStatus(id: string, status: string) {
    const data: any = { status };

    // If publishing, set publishedAt
    if (status === 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  /**
   * Update blog post content
   */
  async updateBlogPostContent(id: string, updates: Partial<CreateBlogPostDto>) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.content && { content: updates.content }),
        ...(updates.excerpt && { excerpt: updates.excerpt }),
        ...(updates.keywords && { keywords: updates.keywords }),
        ...(updates.metaTitle && { metaTitle: updates.metaTitle }),
        ...(updates.metaDescription && { metaDescription: updates.metaDescription }),
      },
    });
  }

  /**
   * Get AI agent logs
   */
  async getAgentLogs(agentName?: string, actionType?: string, take: number = 50) {
    return this.prisma.aIAgentLog.findMany({
      where: {
        ...(agentName && { agentName }),
        ...(actionType && { actionType }),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /**
   * Get SEO metrics for a blog post
   */
  async getSEOMetrics(blogPostId: string) {
    return this.prisma.sEOMetric.findMany({
      where: { blogPostId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Create or update SEO metrics
   */
  async upsertSEOMetric(
    blogPostId: string,
    date: Date,
    data: {
      impressions?: number;
      clicks?: number;
      ctr?: number;
      avgPosition?: number;
      keywordsRanked?: number;
    },
  ) {
    return this.prisma.sEOMetric.upsert({
      where: { blogPostId_date: { blogPostId, date } },
      update: data,
      create: { blogPostId, date, ...data },
    });
  }

  /**
   * Get workflow execution logs
   */
  async getWorkflowRuns(workflowName?: string, status?: string, take: number = 20) {
    return this.prisma.workflowRun.findMany({
      where: {
        ...(workflowName && { workflowName }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /**
   * Create workflow run record
   */
  async createWorkflowRun(data: {
    workflowName: string;
    triggerType: string;
    stepsTotal?: number;
  }) {
    return this.prisma.workflowRun.create({
      data: {
        workflowName: data.workflowName,
        triggerType: data.triggerType,
        stepsTotal: data.stepsTotal,
        status: 'RUNNING',
      },
    });
  }

  /**
   * Update workflow run status
   */
  async updateWorkflowRun(
    id: string,
    updates: {
      status?: string;
      stepsCompleted?: number;
      executionLog?: any;
    },
  ) {
    const data: any = { ...updates };

    // If completed, set completedAt
    if (updates.status === 'SUCCESS' || updates.status === 'FAILED') {
      data.completedAt = new Date();
    }

    return this.prisma.workflowRun.update({
      where: { id },
      data,
    });
  }
}
