import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NeuralNarrativeService } from '../services/narrative/neural-narrative.service';
import { OrganicGrowthService } from '../services/social/organic-growth.service';
import { HyperPredictiveService } from '../services/intelligence/hyper-predictive.service';
import { PlatformDecoderService } from '../services/algorithm/platform-decoder.service';
import { EEATBuilderService } from '../services/authority/eeat-builder.service';
import { MultiTouchAttributionService } from '../services/attribution/multi-touch-attribution.service';
import { ABTestingService } from '../services/experimentation/ab-testing.service';
import { CreativeDirectorService } from '../services/creative/creative-director.service';
import { CampaignMemoryService } from '../services/learning/campaign-memory.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/marketing/intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(
    private readonly narrative: NeuralNarrativeService,
    private readonly organicGrowth: OrganicGrowthService,
    private readonly hyperPredictive: HyperPredictiveService,
    private readonly platformDecoder: PlatformDecoderService,
    private readonly eeatBuilder: EEATBuilderService,
    private readonly attribution: MultiTouchAttributionService,
    private readonly abTesting: ABTestingService,
    private readonly creativeDirector: CreativeDirectorService,
    private readonly campaignMemory: CampaignMemoryService,
  ) {}

  // ==================== PHASE 5: NEURAL NARRATIVE ====================

  /**
   * POST /api/v1/marketing/intelligence/narrative/generate
   */
  @Post('narrative/generate')
  async generateNarrative(
    @Body() body: {
      topic: string;
      format: 'blog' | 'video' | 'social' | 'email';
      targetEmotion?: 'curiosity' | 'urgency' | 'hope' | 'fear' | 'joy' | 'surprise';
      storyStructure?: 'hero_journey' | 'problem_solution' | 'before_after' | 'cliffhanger';
      length?: 'short' | 'medium' | 'long';
    },
  ) {
    const narrative = await this.narrative.generateNarrative(body);
    return { success: true, data: narrative };
  }

  /**
   * POST /api/v1/marketing/intelligence/narrative/analyze
   */
  @Post('narrative/analyze')
  async analyzeEmotionalResonance(@Body('content') content: string) {
    const analysis = await this.narrative.analyzeEmotionalResonance(content);
    return { success: true, data: analysis };
  }

  /**
   * POST /api/v1/marketing/intelligence/narrative/cliffhanger
   */
  @Post('narrative/cliffhanger')
  async generateCliffhanger(@Body() body: { content: string; episode: number }) {
    const cliffhanger = await this.narrative.generateCliffhanger(body.content, body.episode);
    return { success: true, data: cliffhanger };
  }

  // ==================== PHASE 6: ORGANIC SOCIAL DOMINATION ====================

  /**
   * GET /api/v1/marketing/intelligence/growth/:platform
   */
  @Get('growth/:platform')
  async getGrowthStrategy(@Param('platform') platform: 'tiktok' | 'instagram' | 'youtube' | 'linkedin') {
    const strategy = await this.organicGrowth.getGrowthStrategy(platform);
    return { success: true, data: strategy };
  }

  /**
   * POST /api/v1/marketing/intelligence/growth/calendar
   */
  @Post('growth/calendar')
  async generateContentCalendar(@Body('days') days: number = 30) {
    const calendar = await this.organicGrowth.generateContentCalendar(days);
    return { success: true, data: calendar, count: calendar.length };
  }

  // ==================== PHASE 7: HYPER-PREDICTIVE INTELLIGENCE ====================

  /**
   * POST /api/v1/marketing/intelligence/forecast/quantum
   */
  @Post('forecast/quantum')
  async generateQuantumForecast(@Body('keyword') keyword: string) {
    const forecast = await this.hyperPredictive.generateQuantumForecast(keyword);
    return { success: true, data: forecast };
  }

  /**
   * GET /api/v1/marketing/intelligence/forecast/communities
   */
  @Get('forecast/communities')
  async monitorNicheCommunities() {
    const communities = await this.hyperPredictive.monitorNicheCommunities();
    return { success: true, data: communities };
  }

  /**
   * GET /api/v1/marketing/intelligence/forecast/cultural
   */
  @Get('forecast/cultural')
  async trackCulturalIntelligence() {
    const cultural = await this.hyperPredictive.trackCulturalIntelligence();
    return { success: true, data: cultural };
  }

  // ==================== PHASE 9: PLATFORM ALGORITHM DECODER ====================

  /**
   * POST /api/v1/marketing/intelligence/algorithm/experiment
   */
  @Post('algorithm/experiment')
  async runMicroExperiment(@Body() experiment: any) {
    const result = await this.platformDecoder.runMicroExperiment(experiment);
    return { success: true, data: result };
  }

  /**
   * GET /api/v1/marketing/intelligence/algorithm/:platform
   */
  @Get('algorithm/:platform')
  async getAlgorithmInsights(@Param('platform') platform: string) {
    const insights = await this.platformDecoder.getOptimizationInsights(platform);
    return { success: true, data: insights };
  }

  // ==================== PHASE 10: AUTHORITY & E-E-A-T ====================

  /**
   * GET /api/v1/marketing/intelligence/eeat/audit
   */
  @Get('eeat/audit')
  async auditEEAT() {
    const audit = await this.eeatBuilder.auditEEAT();
    return { success: true, data: audit };
  }

  /**
   * GET /api/v1/marketing/intelligence/eeat/roadmap
   */
  @Get('eeat/roadmap')
  async getEEATRoadmap() {
    const roadmap = await this.eeatBuilder.generateImprovementRoadmap();
    return { success: true, data: roadmap };
  }

  // ==================== PHASE 11: MULTI-TOUCH ATTRIBUTION ====================

  /**
   * POST /api/v1/marketing/intelligence/attribution/calculate
   */
  @Post('attribution/calculate')
  async calculateAttribution(@Body() journey: any) {
    const attribution = await this.attribution.calculateAttribution(journey);
    return { success: true, data: attribution };
  }

  /**
   * GET /api/v1/marketing/intelligence/attribution/roi
   */
  @Get('attribution/roi')
  async getChannelROI() {
    const roi = await this.attribution.getChannelROI();
    return { success: true, data: roi };
  }

  // ==================== PHASE 13: A/B TESTING ====================

  /**
   * POST /api/v1/marketing/intelligence/testing/create
   */
  @Post('testing/create')
  async createABTest(@Body() test: any) {
    const created = await this.abTesting.createTest(test);
    return { success: true, data: created };
  }

  /**
   * POST /api/v1/marketing/intelligence/testing/:testId/analyze
   */
  @Post('testing/:testId/analyze')
  async analyzeTest(@Param('testId') testId: string, @Body('variants') variants: any[]) {
    const results = await this.abTesting.analyzeTest(testId, variants);
    return { success: true, data: results };
  }

  /**
   * GET /api/v1/marketing/intelligence/testing/recommendations
   */
  @Get('testing/recommendations')
  async getTestRecommendations() {
    const recommendations = await this.abTesting.getTestRecommendations();
    return { success: true, data: recommendations };
  }

  /**
   * POST /api/v1/marketing/intelligence/testing/variations
   */
  @Post('testing/variations')
  async generateVariations(@Body() body: { element: string; count?: number }) {
    const variations = await this.abTesting.generateVariations(body.element, body.count);
    return { success: true, data: variations };
  }

  // ==================== PHASE 14: CREATIVE DIRECTOR ====================

  /**
   * POST /api/v1/marketing/intelligence/creative/evaluate
   */
  @Post('creative/evaluate')
  async evaluateCreative(@Body() body: { content: string; format: string }) {
    const evaluation = await this.creativeDirector.evaluateCreative(body.content, body.format);
    return { success: true, data: evaluation };
  }

  /**
   * POST /api/v1/marketing/intelligence/creative/brainstorm
   */
  @Post('creative/brainstorm')
  async generateBreakthroughIdeas(@Body('brief') brief: string) {
    const ideas = await this.creativeDirector.generateBreakthroughIdeas(brief);
    return { success: true, data: ideas };
  }

  // ==================== PHASE 15: CAMPAIGN MEMORY ====================

  /**
   * POST /api/v1/marketing/intelligence/memory/store
   */
  @Post('memory/store')
  async storeCampaignMemory(@Body() memory: any) {
    const stored = await this.campaignMemory.storeCampaignMemory(memory);
    return { success: true, data: stored };
  }

  /**
   * GET /api/v1/marketing/intelligence/memory/patterns/:objective
   */
  @Get('memory/patterns/:objective')
  async getPatterns(@Param('objective') objective: string) {
    const patterns = await this.campaignMemory.getPatterns(objective);
    return { success: true, data: patterns };
  }

  /**
   * GET /api/v1/marketing/intelligence/memory/recommendations/:campaignType
   */
  @Get('memory/recommendations/:campaignType')
  async getMemoryRecommendations(@Param('campaignType') campaignType: string) {
    const recommendations = await this.campaignMemory.getRecommendations(campaignType);
    return { success: true, data: recommendations };
  }

  /**
   * POST /api/v1/marketing/intelligence/memory/analyze/:campaignId
   */
  @Post('memory/analyze/:campaignId')
  async analyzeCampaign(@Param('campaignId') campaignId: string) {
    const analysis = await this.campaignMemory.analyzeCampaign(campaignId);
    return { success: true, data: analysis };
  }

  // ==================== UNIFIED INTELLIGENCE DASHBOARD ====================

  /**
   * GET /api/v1/marketing/intelligence/dashboard
   */
  @Get('dashboard')
  async getIntelligenceDashboard() {
    // Aggregate all intelligence metrics
    const [
      eeat,
      roi,
      culturalIntel,
    ] = await Promise.all([
      this.eeatBuilder.auditEEAT(),
      this.attribution.getChannelROI(),
      this.hyperPredictive.trackCulturalIntelligence(),
    ]);

    return {
      success: true,
      data: {
        eeat_score: eeat.overallScore,
        channel_roi: roi,
        cultural_intelligence: culturalIntel,
        system_status: 'operational',
        capabilities: [
          'Neural Narrative Generation',
          'Organic Growth Strategies',
          'Quantum Trend Forecasting',
          'Algorithm Decoding',
          'E-E-A-T Building',
          'Multi-Touch Attribution',
          'A/B Testing Automation',
          'Creative Evaluation',
          'Campaign Memory',
        ],
      },
    };
  }
}
