import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MarketingProfileService } from '../services/profile/marketing-profile.service';
import { PlatformConnectionService } from '../services/profile/platform-connection.service';
import { LandscapeAnalyzerService } from '../services/strategy/landscape-analyzer.service';
import { StrategyPlannerService } from '../services/strategy/strategy-planner.service';
import { RepurposingEngineService } from '../services/strategy/repurposing-engine.service';
import { CostCalculatorService } from '../services/strategy/cost-calculator.service';
import { MultiPlatformPublisherService } from '../services/publishing/multi-platform-publisher.service';
import { DomainTrackerService } from '../services/publishing/domain-tracker.service';
import { AutonomousOrchestratorService } from '../services/orchestration/autonomous-orchestrator.service';
import {
  CreateMarketingProfileDto,
  UpdateMarketingProfileDto,
  ConnectPlatformDto,
  CompleteOAuthDto,
  ConnectApiKeyDto,
} from '../dto/marketing-profile.dto';

/**
 * PROFILE CONTROLLER
 *
 * REST API endpoints for marketing profile management, platform connections,
 * strategy generation, content repurposing, and autonomous campaigns.
 *
 * All endpoints are JWT-protected and user-scoped.
 */

@Controller('marketing/profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: MarketingProfileService,
    private readonly connectionService: PlatformConnectionService,
    private readonly landscapeAnalyzer: LandscapeAnalyzerService,
    private readonly strategyPlanner: StrategyPlannerService,
    private readonly repurposingEngine: RepurposingEngineService,
    private readonly costCalculator: CostCalculatorService,
    private readonly publisher: MultiPlatformPublisherService,
    private readonly domainTracker: DomainTrackerService,
    private readonly orchestrator: AutonomousOrchestratorService,
  ) {}

  // ========================================
  // PROFILE MANAGEMENT ENDPOINTS
  // ========================================

  /**
   * Create new marketing profile
   * POST /marketing/profiles
   */
  @Post()
  async createProfile(@Request() req, @Body() dto: CreateMarketingProfileDto) {
    return this.profileService.createProfile({
      userId: req.user.userId,
      ...dto,
    });
  }

  /**
   * List all profiles for user
   * GET /marketing/profiles
   */
  @Get()
  async listProfiles(@Request() req) {
    return this.profileService.listProfiles(req.user.userId);
  }

  /**
   * Get profile by ID
   * GET /marketing/profiles/:id
   */
  @Get(':id')
  async getProfile(@Request() req, @Param('id') id: string) {
    return this.profileService.getProfile(id, req.user.userId);
  }

  /**
   * Update profile
   * PUT /marketing/profiles/:id
   */
  @Put(':id')
  async updateProfile(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMarketingProfileDto,
  ) {
    return this.profileService.updateProfile(id, req.user.userId, dto);
  }

  /**
   * Delete profile
   * DELETE /marketing/profiles/:id
   */
  @Delete(':id')
  async deleteProfile(@Request() req, @Param('id') id: string) {
    return this.profileService.deleteProfile(id, req.user.userId);
  }

  /**
   * Get profile statistics
   * GET /marketing/profiles/:id/stats
   */
  @Get(':id/stats')
  async getProfileStats(@Request() req, @Param('id') id: string) {
    return this.profileService.getProfileStats(id, req.user.userId);
  }

  /**
   * Activate profile
   * POST /marketing/profiles/:id/activate
   */
  @Post(':id/activate')
  async activateProfile(@Request() req, @Param('id') id: string) {
    return this.profileService.activateProfile(id, req.user.userId);
  }

  /**
   * Pause profile
   * POST /marketing/profiles/:id/pause
   */
  @Post(':id/pause')
  async pauseProfile(@Request() req, @Param('id') id: string) {
    return this.profileService.pauseProfile(id, req.user.userId);
  }

  /**
   * Archive profile
   * POST /marketing/profiles/:id/archive
   */
  @Post(':id/archive')
  async archiveProfile(@Request() req, @Param('id') id: string) {
    return this.profileService.archiveProfile(id, req.user.userId);
  }

  // ========================================
  // PLATFORM CONNECTION ENDPOINTS
  // ========================================

  /**
   * Get all platform connections
   * GET /marketing/profiles/:id/connections
   */
  @Get(':id/connections')
  async getConnections(@Request() req, @Param('id') id: string) {
    return this.connectionService.getConnections(id, req.user.userId);
  }

  /**
   * Initiate OAuth flow
   * POST /marketing/profiles/:id/connections/oauth/initiate
   */
  @Post(':id/connections/oauth/initiate')
  async initiateOAuth(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ConnectPlatformDto,
  ) {
    return this.connectionService.initiateOAuthFlow(
      id,
      dto.platform,
      req.user.userId,
      dto.redirectUri,
    );
  }

  /**
   * Complete OAuth flow
   * POST /marketing/profiles/:id/connections/oauth/complete
   */
  @Post(':id/connections/oauth/complete')
  async completeOAuth(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CompleteOAuthDto,
  ) {
    return this.connectionService.completeOAuthFlow(
      id,
      dto.platform,
      dto.code,
      dto.redirectUri,
      req.user.userId,
    );
  }

  /**
   * Connect with API key
   * POST /marketing/profiles/:id/connections/api-key
   */
  @Post(':id/connections/api-key')
  async connectWithApiKey(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ConnectApiKeyDto,
  ) {
    return this.connectionService.connectWithApiKey(
      id,
      dto.platform,
      dto,
      req.user.userId,
    );
  }

  /**
   * Disconnect platform
   * DELETE /marketing/profiles/:id/connections/:platform
   */
  @Delete(':id/connections/:platform')
  async disconnectPlatform(
    @Request() req,
    @Param('id') id: string,
    @Param('platform') platform: string,
  ) {
    return this.connectionService.disconnectPlatform(id, platform, req.user.userId);
  }

  /**
   * Check connection health
   * GET /marketing/profiles/:id/connections/:platform/health
   */
  @Get(':id/connections/:platform/health')
  async checkHealth(
    @Request() req,
    @Param('id') id: string,
    @Param('platform') platform: string,
  ) {
    return this.connectionService.checkConnectionHealth(id, platform, req.user.userId);
  }

  // ========================================
  // STRATEGY & ANALYSIS ENDPOINTS
  // ========================================

  /**
   * Analyze landscape
   * POST /marketing/profiles/:id/analyze-landscape
   */
  @Post(':id/analyze-landscape')
  async analyzeLandscape(@Request() req, @Param('id') id: string) {
    return this.landscapeAnalyzer.analyzeLandscape(id);
  }

  /**
   * Get cached landscape analysis
   * GET /marketing/profiles/:id/landscape
   */
  @Get(':id/landscape')
  async getLandscape(@Request() req, @Param('id') id: string) {
    return this.landscapeAnalyzer.getCachedAnalysis(id);
  }

  /**
   * Generate strategy
   * POST /marketing/profiles/:id/generate-strategy
   */
  @Post(':id/generate-strategy')
  async generateStrategy(@Request() req, @Param('id') id: string) {
    return this.strategyPlanner.generateStrategy(id);
  }

  /**
   * Get strategy
   * GET /marketing/profiles/:id/strategy
   */
  @Get(':id/strategy')
  async getStrategy(@Request() req, @Param('id') id: string) {
    return this.strategyPlanner.getStrategy(id);
  }

  // ========================================
  // CONTENT REPURPOSING ENDPOINTS
  // ========================================

  /**
   * Repurpose content
   * POST /marketing/profiles/:id/repurpose
   */
  @Post(':id/repurpose')
  async repurposeContent(
    @Request() req,
    @Param('id') id: string,
    @Body() body: {
      source: any;
      rules?: any;
    },
  ) {
    const rules = body.rules || this.repurposingEngine.getDefaultRules();
    return this.repurposingEngine.repurposeContent(body.source, rules, id);
  }

  /**
   * Get default repurposing rules
   * GET /marketing/profiles/:id/repurposing-rules
   */
  @Get(':id/repurposing-rules')
  async getRepurposingRules() {
    return this.repurposingEngine.getDefaultRules();
  }

  // ========================================
  // COST CALCULATION ENDPOINTS
  // ========================================

  /**
   * Calculate campaign cost
   * POST /marketing/profiles/:id/calculate-cost
   */
  @Post(':id/calculate-cost')
  async calculateCost(
    @Request() req,
    @Param('id') id: string,
    @Body() body: {
      campaign: any;
      rules?: any;
    },
  ) {
    return this.costCalculator.calculateCampaignCost(body.campaign, body.rules);
  }

  /**
   * Quick cost estimate
   * GET /marketing/profiles/:id/quick-estimate
   */
  @Get(':id/quick-estimate')
  async quickEstimate(
    @Request() req,
    @Param('id') id: string,
    @Query('blogs') blogs?: string,
    @Query('videos') videos?: string,
    @Query('social') social?: string,
  ) {
    return this.costCalculator.quickEstimate({
      blogs: blogs ? parseInt(blogs) : 0,
      videos: videos ? parseInt(videos) : 0,
      social: social ? parseInt(social) : 0,
    });
  }

  /**
   * Recommend monthly budget
   * POST /marketing/profiles/:id/recommend-budget
   */
  @Post(':id/recommend-budget')
  async recommendBudget(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { goals: any; rules?: any },
  ) {
    return this.costCalculator.recommendMonthlyBudget(body.goals, body.rules);
  }

  // ========================================
  // PUBLISHING ENDPOINTS
  // ========================================

  /**
   * Publish to multiple platforms
   * POST /marketing/profiles/:id/publish
   */
  @Post(':id/publish')
  async publishContent(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.publisher.publishToMultiplePlatforms({
      profileId: id,
      ...body,
    });
  }

  /**
   * Get publishing statistics
   * GET /marketing/profiles/:id/publishing-stats
   */
  @Get(':id/publishing-stats')
  async getPublishingStats(
    @Request() req,
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.publisher.getPublishingStats(id, days ? parseInt(days) : 30);
  }

  /**
   * Get content inventory
   * GET /marketing/profiles/:id/inventory
   */
  @Get(':id/inventory')
  async getInventory(@Request() req, @Param('id') id: string) {
    return this.domainTracker.getContentInventory(id);
  }

  /**
   * Get tracked domains
   * GET /marketing/profiles/:id/domains
   */
  @Get(':id/domains')
  async getTrackedDomains(@Request() req, @Param('id') id: string) {
    return this.domainTracker.getTrackedDomains(id);
  }

  /**
   * Get cross-platform performance
   * GET /marketing/profiles/:id/performance
   */
  @Get(':id/performance')
  async getCrossplatformPerformance(
    @Request() req,
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.domainTracker.getCrossplatformPerformance(id, days ? parseInt(days) : 30);
  }

  // ========================================
  // AUTONOMOUS CAMPAIGN ENDPOINTS
  // ========================================

  /**
   * Launch autonomous campaign
   * POST /marketing/profiles/:id/launch-campaign
   */
  @Post(':id/launch-campaign')
  async launchCampaign(
    @Request() req,
    @Param('id') id: string,
    @Body() body: {
      campaignName: string;
      mode: 'full_auto' | 'semi_auto' | 'hybrid';
      budget: number;
      duration: number;
      contentPreferences?: any;
      platforms?: string[];
    },
  ) {
    return this.orchestrator.launchCampaign({
      profileId: id,
      ...body,
    });
  }

  /**
   * Get campaign state
   * GET /marketing/profiles/:id/campaigns/:campaignId/state
   */
  @Get(':id/campaigns/:campaignId/state')
  async getCampaignState(
    @Request() req,
    @Param('id') id: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.orchestrator.getCampaignState(campaignId);
  }

  /**
   * Pause campaign
   * POST /marketing/profiles/:id/campaigns/:campaignId/pause
   */
  @Post(':id/campaigns/:campaignId/pause')
  async pauseCampaign(
    @Request() req,
    @Param('id') id: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.orchestrator.pauseCampaign(campaignId);
  }

  /**
   * Resume campaign
   * POST /marketing/profiles/:id/campaigns/:campaignId/resume
   */
  @Post(':id/campaigns/:campaignId/resume')
  async resumeCampaign(
    @Request() req,
    @Param('id') id: string,
    @Param('campaignId') campaignId: string,
  ) {
    return this.orchestrator.resumeCampaign(campaignId);
  }
}
