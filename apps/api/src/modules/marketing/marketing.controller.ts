import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions, RequireAllPermissions, Permission } from '../../decorators/permissions.decorator';
import { MarketingService } from './marketing.service';
import { OrchestratorService } from './ai/orchestrator.service';
import { CampaignOrchestrationService } from './services/campaign-orchestration.service';
import { MultiChannelCoordinatorService } from './services/multi-channel-coordinator.service';
import { CampaignWorkflowService } from './services/campaign-workflow.service';
import { BudgetOptimizerService } from './services/budget-optimizer.service';
import { LeoCreativeDirectorService } from './services/leo-creative-director.service';
import { SocialSchedulerService } from './services/social-scheduler.service';
import { SocialPlatformIntegrationService } from './services/social-platform-integration.service';
import { EmailDesignerService } from './services/email-designer.service';
import { AnalyticsService } from './services/analytics.service';
import { AvaOrchestratorService } from './services/ava-orchestrator.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { LaunchCampaignDto, PauseCampaignDto, OptimizeCampaignDto } from './dto/launch-campaign.dto';
import { MultiPlatformWorkflowOrchestrator } from './services/multi-platform-workflow-orchestrator.service';
import { PlatformIntelligence } from './services/platform-intelligence.service';
import { CostEstimator } from './services/cost-estimator.service';
import { PublishingPlatformService } from './services/publishing-platform.service';
import { WorkflowService } from './services/workflow.service';
import { KeywordUniverseService } from './services/seo/keyword-universe.service';
import { ProgrammaticPageService } from './services/seo/programmatic-page.service';
import { SerpIntelligenceService } from './services/seo/serp-intelligence.service';
import { SnippetHijackerService } from './services/seo/snippet-hijacker.service';
import { SchemaAutomationService } from './services/seo/schema-automation.service';
import { HAROAutomationService } from './services/link-building/haro-automation.service';
import { BrokenLinkService } from './services/link-building/broken-link.service';
import { PartnershipNetworkService } from './services/link-building/partnership-network.service';
import { ResourcePageService } from './services/link-building/resource-page.service';

@Controller('marketing')
@UseGuards(JwtAuthGuard)
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly orchestratorService: OrchestratorService,
    private readonly campaignOrchestrationService: CampaignOrchestrationService,
    private readonly multiChannelCoordinator: MultiChannelCoordinatorService,
    private readonly campaignWorkflowService: CampaignWorkflowService,
    private readonly budgetOptimizer: BudgetOptimizerService,
    private readonly leoCreativeDirector: LeoCreativeDirectorService,
    private readonly socialScheduler: SocialSchedulerService,
    private readonly socialIntegration: SocialPlatformIntegrationService,
    private readonly emailDesigner: EmailDesignerService,
    private readonly analytics: AnalyticsService,
    private readonly avaOrchestrator: AvaOrchestratorService,
    private readonly workflowOrchestrator: MultiPlatformWorkflowOrchestrator,
    private readonly platformIntelligence: PlatformIntelligence,
    private readonly costEstimator: CostEstimator,
    private readonly publishingPlatformService: PublishingPlatformService,
    private readonly workflowService: WorkflowService,
    private readonly keywordUniverse: KeywordUniverseService,
    private readonly programmaticPage: ProgrammaticPageService,
    private readonly serpIntelligence: SerpIntelligenceService,
    private readonly snippetHijacker: SnippetHijackerService,
    private readonly schemaAutomation: SchemaAutomationService,
    private readonly haroAutomation: HAROAutomationService,
    private readonly brokenLink: BrokenLinkService,
    private readonly partnershipNetwork: PartnershipNetworkService,
    private readonly resourcePage: ResourcePageService,
  ) {}

  // ============================================
  // CAMPAIGNS
  // ============================================

  @Post('campaigns')
  @Permissions(Permission.MANAGE_SETTINGS)
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
  @Permissions(Permission.MANAGE_SETTINGS)
  async updateCampaignStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.marketingService.updateCampaignStatus(id, body.status);
  }

  // ============================================
  // BLOG POSTS
  // ============================================

  @Post('blog/generate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async generateBlog(@Body() createBlogPostDto: CreateBlogPostDto) {
    // Route to Haiku orchestrator which will call Sonnet for generation
    return this.orchestratorService.routeToAgent('mira', 'GENERATE_BLOG', createBlogPostDto);
  }

  @Post('blog')
  @Permissions(Permission.MANAGE_SETTINGS)
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
  @Permissions(Permission.MANAGE_SETTINGS)
  async updateBlogPostContent(@Param('id') id: string, @Body() updates: CreateBlogPostDto) {
    return this.marketingService.updateBlogPostContent(id, updates);
  }

  @Patch('blog/:id/status')
  @Permissions(Permission.MANAGE_SETTINGS)
  async updateBlogPostStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.marketingService.updateBlogPostStatus(id, body.status);
  }

  // ============================================
  // CONTENT & REPURPOSING
  // ============================================

  @Post('content/repurpose')
  @Permissions(Permission.MANAGE_SETTINGS)
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
  @Permissions(Permission.MANAGE_SETTINGS)
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
  @Permissions(Permission.MANAGE_SETTINGS)
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
  @Permissions(Permission.MANAGE_SETTINGS)
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

  // ============================================
  // CAMPAIGN ORCHESTRATION (Phase 3)
  // ============================================

  @Post('campaigns/:id/launch')
  @Permissions(Permission.MANAGE_SETTINGS)
  async launchCampaign(
    @Param('id') campaignId: string,
    @Body() launchDto: LaunchCampaignDto,
  ) {
    return this.campaignOrchestrationService.launchCampaign(campaignId, launchDto);
  }

  @Post('campaigns/:id/pause')
  @Permissions(Permission.MANAGE_SETTINGS)
  async pauseCampaign(@Param('id') campaignId: string, @Body() pauseDto: PauseCampaignDto) {
    return this.campaignOrchestrationService.pauseCampaign(campaignId, pauseDto);
  }

  @Post('campaigns/:id/resume')
  @Permissions(Permission.MANAGE_SETTINGS)
  async resumeCampaign(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.resumeCampaign(campaignId);
  }

  @Post('campaigns/:id/complete')
  @Permissions(Permission.MANAGE_SETTINGS)
  async completeCampaign(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.completeCampaign(campaignId);
  }

  @Get('campaigns/:id/status')
  async getCampaignStatus(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.getCampaignStatus(campaignId);
  }

  @Get('campaigns/:id/metrics')
  async getCampaignMetrics(@Param('id') campaignId: string) {
    return this.campaignOrchestrationService.getCampaignMetrics(campaignId);
  }

  // ============================================
  // MULTI-CHANNEL COORDINATION
  // ============================================

  @Post('campaigns/:id/coordinate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async coordinateChannels(@Param('id') campaignId: string) {
    return this.multiChannelCoordinator.coordinateChannels(campaignId);
  }

  @Get('campaigns/:id/channel-performance')
  async getChannelPerformance(@Param('id') campaignId: string) {
    return this.multiChannelCoordinator.monitorChannelPerformance(campaignId);
  }

  @Post('campaigns/:id/rebalance-budget')
  @Permissions(Permission.MANAGE_SETTINGS)
  async rebalanceBudget(@Param('id') campaignId: string) {
    return this.multiChannelCoordinator.rebalanceBudget(campaignId);
  }

  // ============================================
  // CAMPAIGN WORKFLOW
  // ============================================

  @Post('campaigns/:id/execute-workflow')
  @Permissions(Permission.MANAGE_SETTINGS)
  async executeWorkflow(@Param('id') campaignId: string) {
    return this.campaignWorkflowService.executeNextStep(campaignId);
  }

  @Get('campaigns/:id/workflow-status')
  async getWorkflowStatus(@Param('id') campaignId: string) {
    return this.campaignWorkflowService.getWorkflowStatus(campaignId);
  }

  @Post('campaigns/:id/workflow/:step/retry')
  @Permissions(Permission.MANAGE_SETTINGS)
  async retryWorkflowStep(@Param('id') campaignId: string, @Param('step') step: string) {
    return this.campaignWorkflowService.retryFailedStep(campaignId, parseInt(step));
  }

  // ============================================
  // BUDGET OPTIMIZATION
  // ============================================

  @Get('campaigns/:id/budget-efficiency')
  async getBudgetEfficiency(@Param('id') campaignId: string) {
    return this.budgetOptimizer.analyzeBudgetEfficiency(campaignId);
  }

  @Get('campaigns/:id/budget-status')
  async getBudgetStatus(@Param('id') campaignId: string) {
    return this.budgetOptimizer.getBudgetStatus(campaignId);
  }

  @Get('campaigns/:id/budget-recommendations')
  async getBudgetRecommendations(@Param('id') campaignId: string) {
    return this.budgetOptimizer.recommendBudgetReallocation(campaignId);
  }

  @Post('campaigns/:id/budget-reallocation')
  @Permissions(Permission.MANAGE_SETTINGS)
  async applyBudgetReallocation(
    @Param('id') campaignId: string,
    @Body() body: { allocations: Array<{ channel: string; amount: number }> },
  ) {
    return this.budgetOptimizer.applyBudgetReallocation(campaignId, body.allocations);
  }

  @Get('campaigns/:id/roi-forecast')
  async forecastROI(
    @Param('id') campaignId: string,
    @Query('days') days: number = 30,
  ) {
    return this.budgetOptimizer.forecastROI(campaignId, days);
  }

  @Post('campaigns/:id/optimize')
  @Permissions(Permission.MANAGE_SETTINGS)
  async optimizeCampaign(@Param('id') campaignId: string, @Body() optimizeDto: OptimizeCampaignDto) {
    return this.campaignOrchestrationService.optimizeCampaign(campaignId, optimizeDto);
  }

  // ============================================
  // CONTENT REPURPOSING (Leo Agent - Week 7)
  // ============================================

  @Post('content/repurpose/:blogPostId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async repurposeBlogPost(
    @Param('blogPostId') blogPostId: string,
    @Body() body: { platforms?: string[]; campaignId?: string },
  ) {
    return this.leoCreativeDirector.repurposeBlogPost(
      blogPostId,
      body.platforms || ['linkedin', 'instagram', 'email'],
      body.campaignId,
    );
  }

  @Get('content/repurposed/:blogPostId')
  async getRepurposedContent(@Param('blogPostId') blogPostId: string) {
    return this.leoCreativeDirector.getRepurposedContent(blogPostId);
  }

  @Post('content/variations')
  @Permissions(Permission.MANAGE_SETTINGS)
  async generateVariations(
    @Body()
    body: { content: string; count?: number; platform?: string },
  ) {
    return this.leoCreativeDirector.generateVariations(
      body.content,
      body.count || 3,
      body.platform,
    );
  }

  @Post('content/optimize-length')
  @Permissions(Permission.MANAGE_SETTINGS)
  async optimizeContentLength(
    @Body() body: { content: string; maxLength: number; platform?: string },
  ) {
    return this.leoCreativeDirector.optimizeForLength(
      body.content,
      body.maxLength,
      body.platform,
    );
  }

  @Get('content/recommendations')
  async getPlatformRecommendations(@Query('content') content: string) {
    return this.leoCreativeDirector.getPlatformRecommendations(content);
  }

  @Patch('content/repurposed/:contentId/status')
  @Permissions(Permission.MANAGE_SETTINGS)
  async updateRepurposedContentStatus(
    @Param('contentId') contentId: string,
    @Body() body: { status: string; metadata?: any },
  ) {
    return this.leoCreativeDirector.updateRepurposedContentStatus(
      contentId,
      body.status,
      body.metadata,
    );
  }

  // ============================================
  // SOCIAL MEDIA SCHEDULER (Week 8)
  // ============================================

  @Post('social/schedule')
  @Permissions(Permission.MANAGE_SETTINGS)
  async schedulePost(
    @Body()
    body: {
      campaignId: string;
      platform: string;
      content: string;
      scheduledTime: string;
    },
  ) {
    return this.socialScheduler.schedulePost(body.campaignId, {
      platform: body.platform,
      content: body.content,
      scheduledTime: body.scheduledTime,
    });
  }

  @Post('social/schedule-multi-platform')
  @Permissions(Permission.MANAGE_SETTINGS)
  async scheduleMultiPlatform(
    @Body()
    body: {
      campaignId: string;
      content: string;
      platforms?: string[];
      startTime?: string;
    },
  ) {
    return this.socialScheduler.scheduleMultiPlatform(body.campaignId, body);
  }

  @Get('social/queue/:campaignId')
  async getSocialQueue(
    @Param('campaignId') campaignId: string,
    @Query('status') status?: string,
  ) {
    return this.socialScheduler.getQueue(campaignId, status);
  }

  @Post('social/:queueId/publish')
  @Permissions(Permission.MANAGE_SETTINGS)
  async publishPost(@Param('queueId') queueId: string) {
    return this.socialScheduler.publishNow(queueId);
  }

  @Post('social/:queueId/reschedule')
  @Permissions(Permission.MANAGE_SETTINGS)
  async reschedulePost(
    @Param('queueId') queueId: string,
    @Body() body: { scheduledTime: string },
  ) {
    return this.socialScheduler.reschedulePost(queueId, new Date(body.scheduledTime));
  }

  @Post('social/:queueId/cancel')
  @Permissions(Permission.MANAGE_SETTINGS)
  async cancelPost(@Param('queueId') queueId: string) {
    return this.socialScheduler.cancelPost(queueId);
  }

  @Get('social/:queueId/analytics')
  async getPostAnalytics(@Param('queueId') queueId: string) {
    return this.socialScheduler.getPostAnalytics(queueId);
  }

  @Get('social/platforms/recommendations')
  async getSocialPlatformRecommendations() {
    return this.socialScheduler.getPlatformRecommendations();
  }

  @Post('social/campaigns/:campaignId/queue-from-content')
  @Permissions(Permission.MANAGE_SETTINGS)
  async createQueueFromContent(@Param('campaignId') campaignId: string) {
    return this.socialScheduler.createQueueFromCampaignContent(campaignId);
  }

  // ============================================
  // SOCIAL PLATFORM INTEGRATION
  // ============================================

  @Post('social/publish/:platform')
  @Permissions(Permission.MANAGE_SETTINGS)
  async publishToSocial(
    @Param('platform') platform: string,
    @Body() body: { content: string; metadata?: any },
  ) {
    return this.socialIntegration.publishToPlatform(platform, body.content, body.metadata);
  }

  @Get('social/platform/:platform/info')
  async getPlatformInfo(@Param('platform') platform: string) {
    return this.socialIntegration.getPlatformInfo(platform);
  }

  @Get('social/platform/:platform/rate-limits')
  async getRateLimits(@Param('platform') platform: string) {
    return this.socialIntegration.getRateLimits(platform);
  }

  @Post('social/platform/:platform/validate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async validatePlatformCredentials(
    @Param('platform') platform: string,
    @Body() body: { credentials: any },
  ) {
    return this.socialIntegration.validateCredentials(platform, body.credentials);
  }

  @Delete('social/:platform/:postId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async deletePlatformPost(
    @Param('platform') platform: string,
    @Param('postId') postId: string,
  ) {
    return this.socialIntegration.deletePost(platform, postId);
  }

  @Patch('social/:platform/:postId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async editPlatformPost(
    @Param('platform') platform: string,
    @Param('postId') postId: string,
    @Body() body: { content: string },
  ) {
    return this.socialIntegration.editPost(platform, postId, body.content);
  }

  @Get('social/:platform/:postId/metrics')
  async getPlatformPostMetrics(
    @Param('platform') platform: string,
    @Param('postId') postId: string,
  ) {
    return this.socialIntegration.getPostMetrics(platform, postId);
  }

  @Post('social/process-scheduled')
  @Permissions(Permission.MANAGE_SETTINGS)
  async processScheduledPosts() {
    return this.socialScheduler.processScheduledPosts();
  }

  // ============================================
  // EMAIL CAMPAIGN DESIGNER (Week 9)
  // ============================================

  @Post('email/create')
  @Permissions(Permission.MANAGE_SETTINGS)
  async createEmailCampaign(
    @Body()
    body: {
      campaignId: string;
      subject: string;
      previewText?: string;
      htmlContent: string;
      templateId?: string;
      segmentId?: string;
    },
  ) {
    return this.emailDesigner.createEmailCampaign(body.campaignId, body);
  }

  @Get('email/:emailCampaignId')
  async getEmailCampaign(@Param('emailCampaignId') emailCampaignId: string) {
    return this.emailDesigner.getEmailCampaign(emailCampaignId);
  }

  @Patch('email/:emailCampaignId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async updateEmailCampaign(
    @Param('emailCampaignId') emailCampaignId: string,
    @Body() body: any,
  ) {
    return this.emailDesigner.updateEmailCampaign(emailCampaignId, body);
  }

  @Get('email/templates/list')
  async getEmailTemplates() {
    return this.emailDesigner.getTemplates();
  }

  @Get('email/segments/list')
  async getEmailSegments() {
    return this.emailDesigner.getSegments();
  }

  @Post('email/segments/create')
  @Permissions(Permission.MANAGE_SETTINGS)
  async createEmailSegment(@Body() body: any) {
    return this.emailDesigner.createSegment(body);
  }

  @Get('email/:emailCampaignId/preview')
  async previewEmail(@Param('emailCampaignId') emailCampaignId: string) {
    return this.emailDesigner.previewEmail(emailCampaignId);
  }

  @Post('email/:emailCampaignId/ab-test')
  @Permissions(Permission.MANAGE_SETTINGS)
  async setupABTest(@Param('emailCampaignId') emailCampaignId: string, @Body() body: any) {
    return this.emailDesigner.setupABTest(emailCampaignId, body);
  }

  @Post('email/:emailCampaignId/send')
  @Permissions(Permission.MANAGE_SETTINGS)
  async sendEmailCampaign(
    @Param('emailCampaignId') emailCampaignId: string,
    @Body() body?: any,
  ) {
    return this.emailDesigner.sendEmailCampaign(emailCampaignId, body);
  }

  @Post('email/:emailCampaignId/schedule')
  @Permissions(Permission.MANAGE_SETTINGS)
  async scheduleEmailCampaign(
    @Param('emailCampaignId') emailCampaignId: string,
    @Body() body: { scheduledTime: string },
  ) {
    return this.emailDesigner.scheduleEmailCampaign(emailCampaignId, new Date(body.scheduledTime));
  }

  @Get('email/:emailCampaignId/metrics')
  async getEmailMetrics(@Param('emailCampaignId') emailCampaignId: string) {
    return this.emailDesigner.getCampaignMetrics(emailCampaignId);
  }

  @Get('email/unsubscribe/list')
  async getUnsubscribeList(@Query('campaignId') campaignId?: string) {
    return this.emailDesigner.getUnsubscribeList(campaignId);
  }

  @Get('email/bounced/list')
  async getBouncedEmails(@Query('campaignId') campaignId?: string) {
    return this.emailDesigner.getBouncedEmails(campaignId);
  }

  @Get('email/lists/all')
  async getEmailLists() {
    return this.emailDesigner.getEmailLists();
  }

  @Post('email/builder/build-from-blocks')
  @Permissions(Permission.MANAGE_SETTINGS)
  async buildEmailFromBlocks(@Body() body: { blocks: any[] }) {
    return this.emailDesigner.buildEmailFromBlocks(body);
  }

  @Post('email/:emailCampaignId/validate')
  async validateEmailCampaign(@Param('emailCampaignId') emailCampaignId: string) {
    return this.emailDesigner.validateCampaign(emailCampaignId);
  }

  // ============================================
  // ANALYTICS & REPORTING (Week 10)
  // ============================================

  @Get('analytics/campaigns/:id/dashboard')
  async getCampaignAnalyticsDashboard(@Param('id') campaignId: string) {
    return this.analytics.getCampaignAnalyticsDashboard(campaignId);
  }

  @Get('analytics/campaigns/:id/channel-metrics')
  async getChannelMetrics(@Param('id') campaignId: string) {
    return this.analytics.getChannelMetrics(campaignId);
  }

  @Get('analytics/campaigns/:id/roi-analysis')
  async analyzeROI(@Param('id') campaignId: string) {
    return this.analytics.analyzeROI(campaignId);
  }

  @Get('analytics/campaigns/:id/trends')
  async getPerformanceTrends(
    @Param('id') campaignId: string,
    @Query('days') days: number = 30,
  ) {
    return this.analytics.getPerformanceTrends(campaignId, days);
  }

  @Get('analytics/campaigns/:id/channel-comparison')
  async getChannelComparison(@Param('id') campaignId: string) {
    return this.analytics.getChannelComparison(campaignId);
  }

  @Post('analytics/campaigns/:id/report')
  async generateCustomReport(
    @Param('id') campaignId: string,
    @Body()
    body: {
      reportType: 'summary' | 'detailed' | 'executive';
      startDate?: string;
      endDate?: string;
      channels?: string[];
    },
  ) {
    return this.analytics.generateCustomReport(
      campaignId,
      body.reportType,
      {
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        channels: body.channels,
      },
    );
  }

  @Post('analytics/campaigns/:id/export')
  async exportReport(
    @Param('id') campaignId: string,
    @Body() body: { reportType?: string; format?: 'csv' | 'json' },
  ) {
    return this.analytics.exportReport(
      campaignId,
      body.reportType || 'summary',
      body.format || 'json',
    );
  }

  @Get('analytics/campaigns/all/summary')
  async getAllCampaignsAnalyticsSummary() {
    return this.analytics.getAllCampaignsAnalyticsSummary();
  }

  // ============================================
  // AVA ORCHESTRATOR AGENT (Week 11)
  // ============================================

  @Post('orchestrator/campaigns/:id/generate-strategy')
  @Permissions(Permission.MANAGE_SETTINGS)
  async generateCampaignStrategy(
    @Param('id') campaignId: string,
    @Body() body?: { targetAudience?: string; budget?: number; objectives?: string[] },
  ) {
    return this.avaOrchestrator.generateCampaignStrategy(campaignId, body);
  }

  @Get('orchestrator/campaigns/:id/predict-success')
  async predictCampaignSuccess(@Param('id') campaignId: string) {
    return this.avaOrchestrator.predictCampaignSuccess(campaignId);
  }

  @Get('orchestrator/campaigns/:id/recommendations')
  async getOrchestrationRecommendations(@Param('id') campaignId: string) {
    return this.avaOrchestrator.getOrchestrationRecommendations(campaignId);
  }

  @Get('orchestrator/campaigns/:id/failure-recovery')
  async suggestFailureRecovery(@Param('id') campaignId: string) {
    return this.avaOrchestrator.suggestFailureRecovery(campaignId);
  }

  @Get('orchestrator/campaigns/:id/dashboard')
  async getOrchestrationDashboard(@Param('id') campaignId: string) {
    return this.avaOrchestrator.getOrchestrationDashboard(campaignId);
  }

  // ============================================
  // MULTI-PLATFORM WORKFLOW (World Domination)
  // ============================================

  @Post('workflows')
  @Permissions(Permission.MANAGE_SETTINGS)
  async createWorkflow(
    @Body()
    body: {
      name: string;
      type: 'AUTONOMOUS' | 'CUSTOM_CAMPAIGN';
      customInput?: any;
      selectedPlatforms: string[];
      presetId?: string;
      createdBy: string;
    },
  ) {
    return this.workflowOrchestrator.createWorkflow(body);
  }

  @Post('workflows/:id/generate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async generateWorkflowContent(@Param('id') workflowId: string) {
    return this.workflowOrchestrator.generateContent(workflowId);
  }

  @Post('workflows/:id/review')
  @Permissions(Permission.MANAGE_SETTINGS)
  async reviewWorkflowContent(
    @Param('id') workflowId: string,
    @Body() body: { approvedIds: string[]; rejectedIds: string[] },
  ) {
    return this.workflowOrchestrator.reviewContent(
      workflowId,
      body.approvedIds,
      body.rejectedIds,
    );
  }

  @Post('workflows/:id/publish')
  @Permissions(Permission.MANAGE_SETTINGS)
  async publishWorkflowContent(@Param('id') workflowId: string) {
    return this.workflowOrchestrator.publishContent(workflowId);
  }

  @Get('workflows/:id/details')
  async getMultiPlatformWorkflowDetails(@Param('id') workflowId: string) {
    return this.workflowOrchestrator.getWorkflowStatus(workflowId);
  }

  // ============================================
  // AUTONOMOUS WORKFLOW ENDPOINTS
  // ============================================

  @Post('workflows/autonomous/analyze-trends')
  async analyzeTrends(
    @Body()
    body: {
      topic: string;
      industry: string;
      description: string;
    },
  ) {
    return this.workflowService.analyzeTrends(body);
  }

  @Post('workflows/autonomous/submit-review')
  @Permissions(Permission.MANAGE_SETTINGS)
  async submitAutonomousForReview(
    @Body()
    body: {
      name: string;
      customInput: any;
      selectedPlatforms: string[];
      generatedContent: any[];
      budget: number;
      createdBy: string;
    },
  ) {
    return this.workflowService.createWorkflow({
      name: body.name,
      type: 'AUTONOMOUS',
      customInput: body.customInput,
      selectedPlatforms: body.selectedPlatforms,
      generatedContent: body.generatedContent,
      budget: body.budget,
      createdBy: body.createdBy,
    });
  }

  // ============================================
  // CUSTOM CAMPAIGN WORKFLOW ENDPOINTS
  // ============================================

  @Post('workflows/custom/generate-plan')
  async generateStrategyPlan(
    @Body()
    body: {
      strategy: string;
      platforms: string[];
      budget: number;
    },
  ) {
    return this.workflowService.generateStrategyPlan(body);
  }

  // ============================================
  // PLATFORM INTELLIGENCE
  // ============================================

  @Post('platforms/analyze')
  async analyzePlatforms(
    @Body()
    body: {
      contentTopic: string;
      contentType: string;
      targetAudience: string;
      goals: string[];
    },
  ) {
    return this.platformIntelligence.analyzeAndRecommend(body);
  }

  @Post('platforms/check-warnings')
  async checkPlatformWarnings(
    @Body()
    body: {
      platforms: string[];
      contentType: string;
      targetAudience: string;
    },
  ) {
    return this.platformIntelligence.checkPlatformWarnings(body);
  }

  @Get('platforms/:slug/metrics')
  async getPlatformMetrics(@Param('slug') slug: string) {
    return this.platformIntelligence.getPlatformMetrics(slug);
  }

  @Get('trends')
  async getTrendInsights(
    @Query('industry') industry: string,
    @Query('geography') geography: string = 'global',
    @Query('timeframe') timeframe: 'week' | 'month' | 'quarter' = 'month',
  ) {
    return this.platformIntelligence.getTrendInsights({
      industry,
      geography,
      timeframe,
    });
  }

  @Post('campaigns/optimize-insights')
  async getOptimizationInsights(
    @Body()
    body: {
      currentMetrics: {
        impressions: number;
        engagement: number;
        conversions: number;
        spend: number;
      };
      platforms: string[];
      targetAudience: string;
    },
  ) {
    return this.platformIntelligence.generateOptimizationInsights(body);
  }

  // ============================================
  // COST ESTIMATION & TRACKING
  // ============================================

  @Post('costs/estimate')
  async estimateCosts(
    @Body()
    body: {
      platforms: string[];
      contentPieces: number;
      estimatedReach: number;
      paidBoost: boolean;
      dailyBudget?: number;
    },
  ) {
    return this.costEstimator.estimateCampaignCosts(body);
  }

  @Get('costs/efficiency-ranking')
  async getPlatformEfficiencyRanking() {
    return this.costEstimator.getPlatformEfficiencyRanking();
  }

  @Get('workflows/:id/costs')
  async getWorkflowCosts(@Param('id') workflowId: string) {
    return this.costEstimator.getWorkflowCostBreakdown(workflowId);
  }

  @Post('costs/project-roi')
  async projectROI(
    @Body()
    body: {
      totalCost: number;
      estimatedReach: number;
      conversionRate: number;
      averageOrderValue: number;
    },
  ) {
    return this.costEstimator.projectCampaignROI(body);
  }

  // ============================================
  // PUBLISHING PLATFORMS
  // ============================================

  @Get('publishing-platforms')
  async getAllPlatforms() {
    return this.publishingPlatformService.getAllPlatforms();
  }

  @Get('publishing-platforms/:slug')
  async getPlatformBySlug(@Param('slug') slug: string) {
    return this.publishingPlatformService.getPlatformBySlug(slug);
  }

  @Get('publishing-platforms/:id/recommendations')
  async getRecommendedPlatforms(@Param('id') contentType: string) {
    return this.publishingPlatformService.getRecommendedPlatforms(
      contentType,
    );
  }

  @Post('platform-presets')
  @Permissions(Permission.MANAGE_SETTINGS)
  async createPreset(
    @Body()
    body: {
      name: string;
      description?: string;
      platforms: string[];
      createdBy: string;
    },
  ) {
    return this.publishingPlatformService.createPreset(body);
  }

  @Get('platform-presets')
  async getAllPresets(@Query('systemOnly') systemOnly: boolean = false) {
    return this.publishingPlatformService.getPresets(systemOnly);
  }

  @Get('platform-presets/:id')
  async getPresetById(@Param('id') id: string) {
    return this.publishingPlatformService.getPresetById(id);
  }

  @Delete('platform-presets/:id')
  @Permissions(Permission.MANAGE_SETTINGS)
  async deletePreset(@Param('id') id: string) {
    return this.publishingPlatformService.deletePreset(id);
  }

  // ============================================
  // SEO EMPIRE - KEYWORD UNIVERSE
  // ============================================

  @Post('seo/keywords/discover')
  @Permissions(Permission.MANAGE_SETTINGS)
  async discoverKeywords(@Body() body: { seedKeyword: string }) {
    return this.keywordUniverse.discoverKeywords(body.seedKeyword);
  }

  @Post('seo/keywords/build-universe')
  @Permissions(Permission.MANAGE_SETTINGS)
  async buildKeywordUniverse(@Body() body: { seedKeywords: string[] }) {
    await this.keywordUniverse.buildKeywordUniverse(body.seedKeywords);
    return { success: true, message: 'Keyword universe building started' };
  }

  @Get('seo/keywords/top')
  async getTopKeywords(@Query('limit') limit: number = 100) {
    return this.keywordUniverse.getTopKeywords(limit);
  }

  @Get('seo/keywords/stats')
  async getKeywordStats() {
    return this.keywordUniverse.getKeywordStats();
  }

  @Get('seo/keywords/by-category/:category')
  async getKeywordsByCategory(@Param('category') category: string) {
    return this.keywordUniverse.getKeywordsByCategory(category);
  }

  // ============================================
  // SEO EMPIRE - PROGRAMMATIC PAGES
  // ============================================

  @Post('seo/pages/generate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async generatePage(
    @Body()
    body: {
      keywordId: string;
      pageType: string;
      additionalContext?: any;
    },
  ) {
    return this.programmaticPage.generatePage(body as any);
  }

  @Post('seo/pages/bulk-generate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async bulkGeneratePages(@Body() body?: { count?: number }) {
    const count = await this.programmaticPage.bulkGeneratePages(body?.count || 100);
    return { generated: count, message: `Generated ${count} pages` };
  }

  @Get('seo/pages')
  async getAllPages(@Query('limit') limit: number = 100) {
    return this.programmaticPage.getAllPages(limit);
  }

  @Get('seo/pages/by-type/:type')
  async getPagesByType(@Param('type') type: string, @Query('limit') limit: number = 50) {
    return this.programmaticPage.getPagesByType(type, limit);
  }

  @Get('seo/pages/stats')
  async getPageStats() {
    return this.programmaticPage.getPerformanceStats();
  }

  @Post('seo/pages/:id/publish')
  @Permissions(Permission.MANAGE_SETTINGS)
  async publishPage(@Param('id') id: string) {
    return this.programmaticPage.publishPage(id);
  }

  // ============================================
  // SEO EMPIRE - SERP INTELLIGENCE
  // ============================================

  @Post('seo/serp/track-keyword/:id')
  @Permissions(Permission.MANAGE_SETTINGS)
  async trackKeywordRanking(@Param('id') keywordId: string) {
    await this.serpIntelligence.trackKeywordRanking(keywordId);
    return { success: true };
  }

  @Post('seo/serp/track-all')
  @Permissions(Permission.MANAGE_SETTINGS)
  async trackAllKeywords(@Body() body?: { limit?: number }) {
    await this.serpIntelligence.trackAllKeywords(body?.limit || 1000);
    return { success: true };
  }

  @Get('seo/serp/improvements')
  async getRankingImprovements(@Query('limit') limit: number = 50) {
    return this.serpIntelligence.getRankingImprovements(limit);
  }

  @Get('seo/serp/losses')
  async getRankingLosses(@Query('limit') limit: number = 50) {
    return this.serpIntelligence.getRankingLosses(limit);
  }

  @Get('seo/serp/analyze/:id')
  async analyzeSERP(@Param('id') keywordId: string) {
    return this.serpIntelligence.analyzeSERP(keywordId);
  }

  @Get('seo/serp/volatility')
  async getSerpVolatility() {
    return this.serpIntelligence.getSerpVolatility();
  }

  @Get('seo/serp/daily-summary')
  async getDailyRankingSummary() {
    return this.serpIntelligence.getDailyRankingSummary();
  }

  @Get('seo/serp/competitor/:domain')
  async getCompetitorAnalysis(@Param('domain') domain: string) {
    return this.serpIntelligence.getCompetitorAnalysis(domain);
  }

  // ============================================
  // SEO EMPIRE - FEATURED SNIPPETS
  // ============================================

  @Get('seo/snippets/opportunities')
  async getSnippetOpportunities(@Query('limit') limit: number = 100) {
    return this.snippetHijacker.identifyOpportunities(limit);
  }

  @Post('seo/snippets/generate/:keywordId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async generateSnippetContent(@Param('keywordId') keywordId: string) {
    return this.snippetHijacker.generateSnippetContent(keywordId);
  }

  @Post('seo/snippets/optimize/:pageId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async optimizeForSnippet(@Param('pageId') pageId: string) {
    return this.snippetHijacker.optimizeContentForSnippet(pageId);
  }

  @Post('seo/snippets/bulk-optimize')
  @Permissions(Permission.MANAGE_SETTINGS)
  async bulkOptimizeSnippets(@Body() body?: { limit?: number }) {
    return this.snippetHijacker.bulkOptimizeForSnippets(body?.limit || 50);
  }

  @Get('seo/snippets/wins')
  async getSnippetWins() {
    return this.snippetHijacker.trackSnippetWins();
  }

  @Get('seo/snippets/recommendations/:keywordId')
  async getSnippetRecommendations(@Param('keywordId') keywordId: string) {
    return this.snippetHijacker.getSnippetRecommendations(keywordId);
  }

  // ============================================
  // SEO EMPIRE - SCHEMA MARKUP
  // ============================================

  @Post('seo/schema/auto-generate/:pageId')
  @Permissions(Permission.MANAGE_SETTINGS)
  async autoGenerateSchema(@Param('pageId') pageId: string) {
    return this.schemaAutomation.autoGenerateSchema(pageId);
  }

  @Post('seo/schema/bulk-generate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async bulkGenerateSchema(@Body() body?: { limit?: number }) {
    return this.schemaAutomation.bulkGenerateSchema(body?.limit || 100);
  }

  @Get('seo/schema/stats')
  async getSchemaStats() {
    return this.schemaAutomation.getSchemaStats();
  }

  @Post('seo/schema/validate')
  async validateSchema(@Body() body: { schema: any }) {
    return this.schemaAutomation.validateSchema(body.schema);
  }

  // ============================================
  // LINK BUILDING - HARO AUTOMATION
  // ============================================

  @Post('link-building/haro/process')
  @Permissions(Permission.MANAGE_SETTINGS)
  async processHAROOpportunities() {
    return this.haroAutomation.processNewOpportunities();
  }

  @Post('link-building/haro/auto-respond')
  @Permissions(Permission.MANAGE_SETTINGS)
  async autoRespondHARO(@Body() body?: { minRelevance?: number }) {
    return this.haroAutomation.autoRespondToQueries(body?.minRelevance || 70);
  }

  @Get('link-building/haro/pending')
  async getPendingHARO(@Query('limit') limit?: string) {
    return this.haroAutomation.getPendingResponses(limit ? parseInt(limit) : 50);
  }

  @Get('link-building/haro/high-value')
  async getHighValueHARO(@Query('minDA') minDA?: string, @Query('minRelevance') minRelevance?: string) {
    return this.haroAutomation.getHighValueOpportunities(
      minDA ? parseInt(minDA) : 80,
      minRelevance ? parseInt(minRelevance) : 70,
    );
  }

  @Post('link-building/haro/:id/publish')
  @Permissions(Permission.MANAGE_SETTINGS)
  async markHAROPublished(@Param('id') id: string, @Body() body: { publishedUrl: string; hasBacklink?: boolean }) {
    return this.haroAutomation.markAsPublished(id, body.publishedUrl, body.hasBacklink ?? true);
  }

  @Get('link-building/haro/stats')
  async getHAROStats() {
    return this.haroAutomation.getPerformanceStats();
  }

  // ============================================
  // LINK BUILDING - BROKEN LINKS
  // ============================================

  @Post('link-building/broken-links/import-domains')
  @Permissions(Permission.MANAGE_SETTINGS)
  async importBrokenLinkDomains(@Body() body: { domains: string[] }) {
    return this.brokenLink.importTargetDomains(body.domains);
  }

  @Post('link-building/broken-links/process')
  @Permissions(Permission.MANAGE_SETTINGS)
  async processBrokenLinks(@Body() body: { domains: string[] }) {
    return this.brokenLink.processOpportunities(body.domains);
  }

  @Post('link-building/broken-links/send-outreach')
  @Permissions(Permission.MANAGE_SETTINGS)
  async sendBrokenLinkOutreach(@Body() body?: { limit?: number }) {
    return this.brokenLink.sendOutreachEmails(body?.limit || 20);
  }

  @Post('link-building/broken-links/follow-ups')
  @Permissions(Permission.MANAGE_SETTINGS)
  async sendBrokenLinkFollowUps(@Body() body?: { maxFollowUps?: number }) {
    return this.brokenLink.sendFollowUps(body?.maxFollowUps || 2);
  }

  @Post('link-building/broken-links/:id/acquired')
  @Permissions(Permission.MANAGE_SETTINGS)
  async markBrokenLinkAcquired(@Param('id') id: string) {
    return this.brokenLink.markLinkAcquired(id);
  }

  @Get('link-building/broken-links/opportunities')
  async getBrokenLinkOpportunities(@Query('limit') limit?: string) {
    return this.brokenLink.getTopOpportunities(limit ? parseInt(limit) : 50);
  }

  @Get('link-building/broken-links/stats')
  async getBrokenLinkStats() {
    return this.brokenLink.getStats();
  }

  // ============================================
  // LINK BUILDING - PARTNERSHIPS
  // ============================================

  @Post('link-building/partnerships/identify')
  @Permissions(Permission.MANAGE_SETTINGS)
  async identifyPartners(@Body() body?: { industry?: string }) {
    const prospects = await this.partnershipNetwork.identifyPartners(body?.industry);
    const created = await this.partnershipNetwork.createProposals(prospects);
    return { prospects: prospects.length, created };
  }

  @Post('link-building/partnerships/import')
  @Permissions(Permission.MANAGE_SETTINGS)
  async importPartners(@Body() body: { prospects: Array<{ domain: string; name: string; email?: string; partnershipType: string }> }) {
    return this.partnershipNetwork.importProspects(body.prospects);
  }

  @Post('link-building/partnerships/send-proposals')
  @Permissions(Permission.MANAGE_SETTINGS)
  async sendPartnershipProposals(@Body() body?: { limit?: number }) {
    return this.partnershipNetwork.sendProposals(body?.limit || 10);
  }

  @Post('link-building/partnerships/:id/activate')
  @Permissions(Permission.MANAGE_SETTINGS)
  async activatePartnership(@Param('id') id: string, @Body() body: { agreedTerms: string; startDate: string; endDate?: string }) {
    return this.partnershipNetwork.activatePartnership(id, {
      agreedTerms: body.agreedTerms,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Post('link-building/partnerships/:id/track')
  @Permissions(Permission.MANAGE_SETTINGS)
  async trackPartnership(@Param('id') id: string, @Body() body: { contentShared?: number; backlinksReceived?: number; backlinksGiven?: number; trafficReceived?: number }) {
    return this.partnershipNetwork.trackPerformance(id, body);
  }

  @Get('link-building/partnerships/active')
  async getActivePartnerships() {
    return this.partnershipNetwork.getActivePartnerships();
  }

  @Get('link-building/partnerships/opportunities')
  async getPartnershipOpportunities(@Query('limit') limit?: string) {
    return this.partnershipNetwork.getTopOpportunities(limit ? parseInt(limit) : 20);
  }

  @Get('link-building/partnerships/stats')
  async getPartnershipStats() {
    return this.partnershipNetwork.getStats();
  }

  @Get('link-building/partnerships/:domain/topics')
  async suggestPartnershipTopics(@Param('domain') domain: string) {
    return this.partnershipNetwork.suggestExchangeTopics(domain);
  }

  // ============================================
  // LINK BUILDING - RESOURCE PAGES
  // ============================================

  @Post('link-building/resource-pages/import-topics')
  @Permissions(Permission.MANAGE_SETTINGS)
  async importResourceTopics(@Body() body: { topics: string[] }) {
    return this.resourcePage.importTopics(body.topics);
  }

  @Post('link-building/resource-pages/process')
  @Permissions(Permission.MANAGE_SETTINGS)
  async processResourcePages(@Body() body: { topics: string[] }) {
    return this.resourcePage.processOpportunities(body.topics);
  }

  @Post('link-building/resource-pages/send-outreach')
  @Permissions(Permission.MANAGE_SETTINGS)
  async sendResourcePageOutreach(@Body() body?: { limit?: number }) {
    return this.resourcePage.sendOutreachEmails(body?.limit || 15);
  }

  @Post('link-building/resource-pages/follow-ups')
  @Permissions(Permission.MANAGE_SETTINGS)
  async sendResourcePageFollowUps(@Body() body?: { maxFollowUps?: number }) {
    return this.resourcePage.sendFollowUps(body?.maxFollowUps || 1);
  }

  @Post('link-building/resource-pages/:id/added')
  @Permissions(Permission.MANAGE_SETTINGS)
  async markResourceAdded(@Param('id') id: string, @Body() body?: { position?: number }) {
    return this.resourcePage.markAsAdded(id, body?.position);
  }

  @Get('link-building/resource-pages/opportunities')
  async getResourcePageOpportunities(@Query('limit') limit?: string) {
    return this.resourcePage.getTopOpportunities(limit ? parseInt(limit) : 30);
  }

  @Get('link-building/resource-pages/by-topic/:topic')
  async getResourcePagesByTopic(@Param('topic') topic: string, @Query('limit') limit?: string) {
    return this.resourcePage.getPagesByTopic(topic, limit ? parseInt(limit) : 50);
  }

  @Get('link-building/resource-pages/stats')
  async getResourcePageStats() {
    return this.resourcePage.getStats();
  }
}
