import { Controller, Get, Post, Query, Param, Body, Logger } from '@nestjs/common';
import { SEOAnalyzerService } from '../services/workflows/seo-analyzer.service';
import { SEOPlannerService } from '../services/workflows/seo-planner.service';
import { SEOExecutorService } from '../services/workflows/seo-executor.service';
import { SEOWorkflowService, WorkflowStrategy } from '../services/workflows/seo-workflow.service';
import { TrendDetectorService } from '../services/workflows/trend-detector.service';
import { ContentStrategistService } from '../services/workflows/content-strategist.service';
import { ContentProducerService } from '../services/workflows/content-producer.service';
import { TrendContentWorkflowService, TrendContentStrategy } from '../services/workflows/trend-content-workflow.service';

/**
 * Workflows Controller
 *
 * Exposes Phase 2 automation workflow endpoints:
 * - SEO Empire workflow
 * - Trend Content workflow
 * - Link Building workflow (TODO)
 * - Campaign Orchestration workflow (TODO)
 */

@Controller('marketing/workflows')
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(
    private readonly seoAnalyzer: SEOAnalyzerService,
    private readonly seoPlanner: SEOPlannerService,
    private readonly seoExecutor: SEOExecutorService,
    private readonly seoWorkflow: SEOWorkflowService,
    private readonly trendDetector: TrendDetectorService,
    private readonly contentStrategist: ContentStrategistService,
    private readonly contentProducer: ContentProducerService,
    private readonly trendContentWorkflow: TrendContentWorkflowService,
  ) {}

  // ============================================
  // SEO WORKFLOW ENDPOINTS
  // ============================================

  /**
   * Get SEO workflow status
   * GET /api/v1/marketing/workflows/seo/status
   */
  @Get('seo/status')
  async getSEOWorkflowStatus() {
    try {
      const status = await this.seoWorkflow.getWorkflowStatus();
      return {
        success: true,
        message: 'SEO workflow status retrieved',
        data: status,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get SEO workflow status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Run SEO workflow
   * POST /api/v1/marketing/workflows/seo/run
   *
   * Body: { strategy?: 'quick-wins' | 'comprehensive' | 'competitive' }
   */
  @Post('seo/run')
  async runSEOWorkflow(@Body() body: { strategy?: WorkflowStrategy }) {
    try {
      this.logger.log(`Running SEO workflow with strategy: ${body.strategy || 'quick-wins'}`);

      const report = await this.seoWorkflow.runSEOWorkflow(body.strategy || 'quick-wins');

      return {
        success: true,
        message: 'SEO workflow completed successfully',
        data: report,
      };
    } catch (error: any) {
      this.logger.error(`SEO workflow failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get keyword opportunities
   * GET /api/v1/marketing/workflows/seo/opportunities
   *
   * Query params: limit (default: 100)
   */
  @Get('seo/opportunities')
  async getKeywordOpportunities(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const opportunities = await this.seoAnalyzer.analyzeKeywordOpportunities(limitNum);

      return {
        success: true,
        message: `Found ${opportunities.length} keyword opportunities`,
        data: {
          opportunities,
          count: opportunities.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get opportunities: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get quick win keywords
   * GET /api/v1/marketing/workflows/seo/quick-wins
   *
   * Query params:
   *  - difficulty (default: 40)
   *  - volume (default: 200)
   */
  @Get('seo/quick-wins')
  async getQuickWins(
    @Query('difficulty') difficulty?: string,
    @Query('volume') volume?: string,
  ) {
    try {
      const difficultyNum = difficulty ? parseInt(difficulty, 10) : 40;
      const volumeNum = volume ? parseInt(volume, 10) : 200;

      const quickWins = await this.seoAnalyzer.findQuickWins(difficultyNum, volumeNum);

      return {
        success: true,
        message: `Found ${quickWins.length} quick win opportunities`,
        data: {
          quickWins,
          count: quickWins.length,
          criteria: {
            difficulty: `< ${difficultyNum}`,
            volume: `>= ${volumeNum}`,
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get quick wins: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get SEO health report
   * GET /api/v1/marketing/workflows/seo/health
   */
  @Get('seo/health')
  async getSEOHealth() {
    try {
      const health = await this.seoAnalyzer.calculateSEOHealth();

      return {
        success: true,
        message: `SEO Health: ${health.overallScore}/100 (Grade ${health.grade})`,
        data: health,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get SEO health: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create optimization plan for a keyword
   * POST /api/v1/marketing/workflows/seo/plan
   *
   * Body: { keywordId: string }
   */
  @Post('seo/plan')
  async createOptimizationPlan(@Body() body: { keywordId: string }) {
    try {
      const plan = await this.seoPlanner.createOptimizationPlan(body.keywordId);

      return {
        success: true,
        message: `Optimization plan created for keyword`,
        data: plan,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create plan: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get prioritized keywords by strategy
   * GET /api/v1/marketing/workflows/seo/prioritize
   *
   * Query params:
   *  - strategy: 'quick-wins' | 'long-term' | 'competitive'
   *  - limit (default: 50)
   */
  @Get('seo/prioritize')
  async prioritizeKeywords(
    @Query('strategy') strategy: 'quick-wins' | 'long-term' | 'competitive',
    @Query('limit') limit?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const prioritized = await this.seoPlanner.prioritizeKeywords(strategy, limitNum);

      return {
        success: true,
        message: `Prioritized ${prioritized.length} keywords for ${strategy} strategy`,
        data: {
          keywords: prioritized,
          count: prioritized.length,
          strategy,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to prioritize keywords: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate content requirements for a keyword
   * POST /api/v1/marketing/workflows/seo/content-requirements
   *
   * Body: { keywordId: string }
   */
  @Post('seo/content-requirements')
  async generateContentRequirements(@Body() body: { keywordId: string }) {
    try {
      const requirements = await this.seoPlanner.generateContentRequirements(body.keywordId);

      return {
        success: true,
        message: 'Content requirements generated',
        data: requirements,
      };
    } catch (error: any) {
      this.logger.error(`Failed to generate content requirements: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute optimization plan
   * POST /api/v1/marketing/workflows/seo/execute
   *
   * Body: { planId: string }
   */
  @Post('seo/execute')
  async executeOptimizationPlan(@Body() body: { planId: string }) {
    try {
      const result = await this.seoExecutor.executeOptimizationPlan(body.planId);

      return {
        success: true,
        message: result.success
          ? `Plan executed successfully - Rank improved from ${result.rankBefore} to ${result.rankAfter}`
          : 'Plan execution in progress',
        data: result,
      };
    } catch (error: any) {
      this.logger.error(`Failed to execute plan: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get optimization history for a keyword
   * GET /api/v1/marketing/workflows/seo/history/:keywordId
   */
  @Get('seo/history/:keywordId')
  async getOptimizationHistory(@Param('keywordId') keywordId: string) {
    try {
      const history = await this.seoExecutor.getOptimizationHistory(keywordId);

      return {
        success: true,
        message: `Found ${history.length} optimization attempts`,
        data: {
          history,
          count: history.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get history: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get learnings for a keyword
   * GET /api/v1/marketing/workflows/seo/learnings/:keywordId
   */
  @Get('seo/learnings/:keywordId')
  async getLearnings(@Param('keywordId') keywordId: string) {
    try {
      const learnings = await this.seoExecutor.getLearnings(keywordId);

      return {
        success: true,
        message: `Found ${learnings.length} learnings`,
        data: {
          learnings,
          count: learnings.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get learnings: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // TREND CONTENT WORKFLOW ENDPOINTS
  // ============================================

  /**
   * Get Trend Content workflow status
   * GET /api/v1/marketing/workflows/trends/status
   */
  @Get('trends/status')
  async getTrendContentWorkflowStatus() {
    try {
      const status = await this.trendContentWorkflow.getWorkflowStatus();
      return {
        success: true,
        message: 'Trend Content workflow status retrieved',
        data: status,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get Trend Content workflow status: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Run Trend Content workflow
   * POST /api/v1/marketing/workflows/trends/run
   *
   * Body: { strategy?: 'viral-first' | 'evergreen-first' | 'conversion-first' | 'balanced', limit?: number }
   */
  @Post('trends/run')
  async runTrendContentWorkflow(
    @Body() body: { strategy?: TrendContentStrategy; limit?: number },
  ) {
    try {
      this.logger.log(
        `Running Trend Content workflow with strategy: ${body.strategy || 'viral-first'}`,
      );

      const report = await this.trendContentWorkflow.runTrendContentWorkflow(
        body.strategy || 'viral-first',
        body.limit || 10,
      );

      return {
        success: true,
        message: 'Trend Content workflow completed successfully',
        data: report,
      };
    } catch (error: any) {
      this.logger.error(`Trend Content workflow failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detect emerging trends
   * GET /api/v1/marketing/workflows/trends/detect
   *
   * Query params:
   *  - relevance (default: 70)
   *  - limit (default: 20)
   */
  @Get('trends/detect')
  async detectEmergingTrends(
    @Query('relevance') relevance?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const relevanceNum = relevance ? parseInt(relevance, 10) : 70;
      const limitNum = limit ? parseInt(limit, 10) : 20;

      const trends = await this.trendDetector.detectEmergingTrends(relevanceNum, limitNum);

      return {
        success: true,
        message: `Found ${trends.length} emerging trends`,
        data: {
          trends,
          count: trends.length,
          criteria: {
            relevance: `>= ${relevanceNum}`,
            lifecycle: 'EMERGING or GROWING',
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to detect trends: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Find viral opportunities
   * GET /api/v1/marketing/workflows/trends/viral
   *
   * Query params: viralThreshold (default: 80)
   */
  @Get('trends/viral')
  async findViralOpportunities(@Query('viralThreshold') viralThreshold?: string) {
    try {
      const threshold = viralThreshold ? parseInt(viralThreshold, 10) : 80;

      const opportunities = await this.trendDetector.findViralOpportunities(threshold);

      return {
        success: true,
        message: `Found ${opportunities.length} viral opportunities`,
        data: {
          opportunities,
          count: opportunities.length,
          criteria: {
            viralCoefficient: `>= ${threshold}`,
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to find viral opportunities: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get time-sensitive trend alerts
   * GET /api/v1/marketing/workflows/trends/alerts
   */
  @Get('trends/alerts')
  async getTimeSensitiveAlerts() {
    try {
      const alerts = await this.trendDetector.alertTimeSensitiveTrends();

      return {
        success: true,
        message: `Found ${alerts.length} time-sensitive trends`,
        data: {
          alerts,
          count: alerts.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get alerts: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate content ideas from a trend
   * POST /api/v1/marketing/workflows/trends/ideas
   *
   * Body: { trendId: string, limit?: number }
   */
  @Post('trends/ideas')
  async generateContentIdeas(@Body() body: { trendId: string; limit?: number }) {
    try {
      const ideas = await this.contentStrategist.generateContentIdeas(
        body.trendId,
        body.limit || 5,
      );

      return {
        success: true,
        message: `Generated ${ideas.length} content ideas`,
        data: {
          ideas,
          count: ideas.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to generate ideas: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Match trend to keywords
   * POST /api/v1/marketing/workflows/trends/match-keywords
   *
   * Body: { trendId: string, limit?: number }
   */
  @Post('trends/match-keywords')
  async matchTrendToKeywords(@Body() body: { trendId: string; limit?: number }) {
    try {
      const matches = await this.contentStrategist.matchTrendToKeywords(
        body.trendId,
        body.limit || 10,
      );

      return {
        success: true,
        message: `Found ${matches.length} keyword matches`,
        data: {
          matches,
          count: matches.length,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to match keywords: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create content brief
   * POST /api/v1/marketing/workflows/trends/brief
   *
   * Body: { trendId: string, angle: string, keywordId?: string }
   */
  @Post('trends/brief')
  async createContentBrief(
    @Body() body: { trendId: string; angle: string; keywordId?: string },
  ) {
    try {
      const brief = await this.contentStrategist.createContentBrief(
        body.trendId,
        body.angle,
        body.keywordId,
      );

      return {
        success: true,
        message: 'Content brief created',
        data: brief,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create brief: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Prioritize content
   * GET /api/v1/marketing/workflows/trends/prioritize
   *
   * Query params:
   *  - criteria: 'viral' | 'evergreen' | 'conversion'
   *  - limit (default: 20)
   */
  @Get('trends/prioritize')
  async prioritizeContent(
    @Query('criteria') criteria: 'viral' | 'evergreen' | 'conversion',
    @Query('limit') limit?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const prioritized = await this.contentStrategist.prioritizeContent(criteria, limitNum);

      return {
        success: true,
        message: `Prioritized ${prioritized.length} content pieces`,
        data: {
          content: prioritized,
          count: prioritized.length,
          criteria,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to prioritize content: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // MASTER DASHBOARD (All Workflows)
  // ============================================

  /**
   * Get unified workflow dashboard
   * GET /api/v1/marketing/workflows/dashboard
   */
  @Get('dashboard')
  async getWorkflowDashboard() {
    try {
      const seoStatus = await this.seoWorkflow.getWorkflowStatus();
      const trendContentStatus = await this.trendContentWorkflow.getWorkflowStatus();

      return {
        success: true,
        message: 'Workflow dashboard retrieved',
        data: {
          seo: seoStatus,
          trendContent: trendContentStatus,
          // TODO: Add other workflows (links, campaigns)
          links: null,
          campaigns: null,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get dashboard: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
