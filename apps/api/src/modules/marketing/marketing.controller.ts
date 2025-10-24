import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Roles } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MarketingService } from './marketing.service';
import { OrchestratorService } from './ai/orchestrator.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

@Controller('marketing')
@UseGuards(JwtAuthGuard)
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  // ============================================
  // CAMPAIGNS
  // ============================================

  @Post('campaigns')
  @Roles('ADMIN')
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.marketingService.createCampaign(createCampaignDto);
  }

  @Get('campaigns')
  async listCampaigns(@Query('status') status?: string) {
    return this.marketingService.listCampaigns(status);
  }

  @Get('campaigns/:id')
  async getCampaign(@Param('id') id: string) {
    return this.marketingService.getCampaignById(id);
  }

  @Patch('campaigns/:id/status')
  @Roles('ADMIN')
  async updateCampaignStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.marketingService.updateCampaignStatus(id, body.status);
  }

  // ============================================
  // BLOG POSTS
  // ============================================

  @Post('blog/generate')
  @Roles('ADMIN')
  async generateBlog(@Body() createBlogPostDto: CreateBlogPostDto) {
    // Route to Haiku orchestrator which will call Sonnet for generation
    return this.orchestratorService.routeToAgent('mira', 'GENERATE_BLOG', createBlogPostDto);
  }

  @Post('blog')
  @Roles('ADMIN')
  async createBlogPost(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.marketingService.createBlogPost(createBlogPostDto);
  }

  @Get('blog')
  async listBlogPosts(@Query('status') status?: string, @Query('take') take: number = 20) {
    return this.marketingService.listBlogPosts(status, take);
  }

  @Get('blog/:idOrSlug')
  async getBlogPost(@Param('idOrSlug') idOrSlug: string) {
    return this.marketingService.getBlogPost(idOrSlug);
  }

  @Patch('blog/:id/content')
  @Roles('ADMIN')
  async updateBlogPostContent(@Param('id') id: string, @Body() updates: CreateBlogPostDto) {
    return this.marketingService.updateBlogPostContent(id, updates);
  }

  @Patch('blog/:id/status')
  @Roles('ADMIN')
  async updateBlogPostStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.marketingService.updateBlogPostStatus(id, body.status);
  }

  // ============================================
  // CONTENT & REPURPOSING
  // ============================================

  @Post('content/repurpose')
  @Roles('ADMIN')
  async repurposeContent(@Body() body: { blogPostId: string; platforms?: string[] }) {
    // Route to Leo creative director agent
    return this.orchestratorService.routeToAgent('leo', 'REPURPOSE_CONTENT', body);
  }

  // ============================================
  // ANALYTICS & INSIGHTS
  // ============================================

  @Get('analytics/seo/:blogPostId')
  async getSEOMetrics(@Param('blogPostId') blogPostId: string) {
    return this.marketingService.getSEOMetrics(blogPostId);
  }

  @Patch('analytics/seo/:blogPostId')
  @Roles('ADMIN')
  async updateSEOMetric(
    @Param('blogPostId') blogPostId: string,
    @Body() data: { date: string; impressions?: number; clicks?: number; ctr?: number; avgPosition?: number; keywordsRanked?: number },
  ) {
    const date = new Date(data.date);
    return this.marketingService.upsertSEOMetric(blogPostId, date, {
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: data.ctr,
      avgPosition: data.avgPosition,
      keywordsRanked: data.keywordsRanked,
    });
  }

  @Get('analytics/insights')
  @Roles('ADMIN')
  async getAnalyticsInsights() {
    // Route to Rin analytics agent
    return this.orchestratorService.routeToAgent('rin', 'ANALYZE_CAMPAIGNS', {});
  }

  // ============================================
  // AI AGENT LOGS
  // ============================================

  @Get('logs')
  async getAgentLogs(
    @Query('agent') agent?: string,
    @Query('action') action?: string,
    @Query('take') take: number = 50,
  ) {
    return this.marketingService.getAgentLogs(agent, action, take);
  }

  // ============================================
  // WORKFLOW MANAGEMENT
  // ============================================

  @Get('workflows')
  async listWorkflows(@Query('name') name?: string, @Query('status') status?: string) {
    return this.marketingService.getWorkflowRuns(name, status);
  }

  @Post('workflows/:name/trigger')
  @Roles('ADMIN')
  async triggerWorkflow(
    @Param('name') name: string,
    @Body() body: { triggerType?: string; data?: any },
  ) {
    const workflowRun = await this.marketingService.createWorkflowRun({
      workflowName: name,
      triggerType: body.triggerType || 'MANUAL',
    });

    // Trigger the workflow (this would be handled by n8n webhook in production)
    // For now, just return the run record
    return workflowRun;
  }
}
