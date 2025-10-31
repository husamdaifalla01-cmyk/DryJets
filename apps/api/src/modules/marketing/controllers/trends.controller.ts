import { Controller, Get, Post, Query, Param, UseGuards, Body } from '@nestjs/common';
import { TrendCollectorService } from '../services/trends/trend-collector.service';
import { TrendPredictorService } from '../services/trends/trend-predictor.service';
import { TrendAnalyzerService } from '../services/trends/trend-analyzer.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/v1/marketing/trends')
@UseGuards(JwtAuthGuard)
export class TrendsController {
  constructor(
    private readonly collector: TrendCollectorService,
    private readonly predictor: TrendPredictorService,
    private readonly analyzer: TrendAnalyzerService,
  ) {}

  /**
   * POST /api/v1/marketing/trends/collect
   * Collect trends from all sources
   */
  @Post('collect')
  async collectAllTrends() {
    const result = await this.collector.collectAllTrends();
    return {
      success: true,
      data: result,
      message: `Collected ${result.collected} trends, stored ${result.stored}`,
    };
  }

  /**
   * POST /api/v1/marketing/trends/collect/google
   * Collect trends from Google Trends
   */
  @Post('collect/google')
  async collectGoogleTrends(@Body('keywords') keywords: string[]) {
    const trends = await this.collector.collectGoogleTrends(keywords);
    const stored = await this.collector.storeTrends(trends);
    return {
      success: true,
      data: { collected: trends.length, stored },
      message: `Collected ${trends.length} Google trends, stored ${stored}`,
    };
  }

  /**
   * POST /api/v1/marketing/trends/collect/twitter
   * Collect trends from Twitter/X
   */
  @Post('collect/twitter')
  async collectTwitterTrends(@Query('limit') limit?: number) {
    const trends = await this.collector.collectTwitterTrends(limit ? parseInt(limit.toString()) : 50);
    const stored = await this.collector.storeTrends(trends);
    return {
      success: true,
      data: { collected: trends.length, stored },
      message: `Collected ${trends.length} Twitter trends, stored ${stored}`,
    };
  }

  /**
   * POST /api/v1/marketing/trends/collect/reddit
   * Collect trends from Reddit
   */
  @Post('collect/reddit')
  async collectRedditTrends(@Body('subreddits') subreddits?: string[]) {
    const trends = await this.collector.collectRedditTrends(subreddits);
    const stored = await this.collector.storeTrends(trends);
    return {
      success: true,
      data: { collected: trends.length, stored },
      message: `Collected ${trends.length} Reddit trends, stored ${stored}`,
    };
  }

  /**
   * POST /api/v1/marketing/trends/collect/tiktok
   * Collect trends from TikTok
   */
  @Post('collect/tiktok')
  async collectTikTokTrends(@Query('limit') limit?: number) {
    const trends = await this.collector.collectTikTokTrends(limit ? parseInt(limit.toString()) : 30);
    const stored = await this.collector.storeTrends(trends);
    return {
      success: true,
      data: { collected: trends.length, stored },
      message: `Collected ${trends.length} TikTok trends, stored ${stored}`,
    };
  }

  /**
   * GET /api/v1/marketing/trends/active
   * Get active trends (minRelevance default 60)
   */
  @Get('active')
  async getActiveTrends(@Query('minRelevance') minRelevance?: number) {
    const relevance = minRelevance ? parseInt(minRelevance.toString()) : 60;
    const trends = await this.collector.getActiveTrends(relevance);
    return {
      success: true,
      data: trends,
      count: trends.length,
    };
  }

  /**
   * GET /api/v1/marketing/trends/pillar/:pillar
   * Get trends by content pillar
   */
  @Get('pillar/:pillar')
  async getTrendsByPillar(@Param('pillar') pillar: string) {
    const trends = await this.collector.getTrendsByPillar(pillar);
    return {
      success: true,
      data: trends,
      count: trends.length,
    };
  }

  /**
   * POST /api/v1/marketing/trends/predict/:trendId
   * Predict trend peak and opportunity window
   */
  @Post('predict/:trendId')
  async predictTrendPeak(@Param('trendId') trendId: string) {
    const prediction = await this.predictor.predictTrendPeak(trendId);
    return {
      success: true,
      data: prediction,
    };
  }

  /**
   * POST /api/v1/marketing/trends/predict-all
   * Predict all active trends
   */
  @Post('predict-all')
  async predictAllActiveTrends() {
    const predictions = await this.predictor.predictAllActiveTrends();
    return {
      success: true,
      data: predictions,
      count: predictions.length,
    };
  }

  /**
   * GET /api/v1/marketing/trends/opportunities/urgent
   * Get urgent opportunities (CRITICAL/HIGH urgency)
   */
  @Get('opportunities/urgent')
  async getUrgentOpportunities() {
    const opportunities = await this.predictor.getUrgentOpportunities();
    return {
      success: true,
      data: opportunities,
      count: opportunities.length,
    };
  }

  /**
   * GET /api/v1/marketing/trends/opportunities/early-signals
   * Detect early signals (7-14 days before peak)
   */
  @Get('opportunities/early-signals')
  async detectEarlySignals() {
    const signals = await this.predictor.detectEarlySignals();
    return {
      success: true,
      data: signals,
      count: signals.length,
      message: `Found ${signals.length} trends predicted to peak in 7-14 days`,
    };
  }

  /**
   * GET /api/v1/marketing/trends/opportunities/:urgency
   * Get trends by urgency level
   */
  @Get('opportunities/:urgency')
  async getTrendsByUrgency(@Param('urgency') urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    const trends = await this.predictor.getTrendsByUrgency(urgency);
    return {
      success: true,
      data: trends,
      count: trends.length,
    };
  }

  /**
   * GET /api/v1/marketing/trends/analysis/content-gaps
   * Analyze content gaps
   */
  @Get('analysis/content-gaps')
  async analyzeContentGaps() {
    const gaps = await this.analyzer.analyzeContentGaps();
    return {
      success: true,
      data: gaps,
      count: gaps.length,
      summary: {
        severe: gaps.filter(g => g.gap === 'SEVERE').length,
        moderate: gaps.filter(g => g.gap === 'MODERATE').length,
        minor: gaps.filter(g => g.gap === 'MINOR').length,
      },
    };
  }

  /**
   * GET /api/v1/marketing/trends/analysis/cross-platform/:keyword
   * Analyze cross-platform performance
   */
  @Get('analysis/cross-platform/:keyword')
  async analyzeCrossPlatform(@Param('keyword') keyword: string) {
    const analysis = await this.analyzer.analyzeCrossPlatform(keyword);
    return {
      success: true,
      data: analysis,
    };
  }

  /**
   * GET /api/v1/marketing/trends/analysis/sentiment/:keyword
   * Analyze sentiment
   */
  @Get('analysis/sentiment/:keyword')
  async analyzeSentiment(@Param('keyword') keyword: string) {
    const sentiment = await this.analyzer.analyzeSentiment(keyword);
    return {
      success: true,
      data: sentiment,
    };
  }

  /**
   * GET /api/v1/marketing/trends/analysis/correlations/:keyword
   * Find trend correlations
   */
  @Get('analysis/correlations/:keyword')
  async findTrendCorrelations(@Param('keyword') keyword: string) {
    const correlations = await this.analyzer.findTrendCorrelations(keyword);
    return {
      success: true,
      data: correlations,
    };
  }

  /**
   * GET /api/v1/marketing/trends/analysis/competitor-adoption/:keyword
   * Analyze competitor trend adoption
   */
  @Get('analysis/competitor-adoption/:keyword')
  async analyzeCompetitorAdoption(@Param('keyword') keyword: string) {
    const adoption = await this.analyzer.analyzeCompetitorAdoption(keyword);
    return {
      success: true,
      data: adoption,
    };
  }

  /**
   * GET /api/v1/marketing/trends/analysis/comprehensive/:keyword
   * Get comprehensive trend analysis
   */
  @Get('analysis/comprehensive/:keyword')
  async getComprehensiveAnalysis(@Param('keyword') keyword: string) {
    const analysis = await this.analyzer.getComprehensiveAnalysis(keyword);
    return {
      success: true,
      data: analysis,
    };
  }

  /**
   * GET /api/v1/marketing/trends/stats
   * Get trend intelligence statistics
   */
  @Get('stats')
  async getTrendStats() {
    // This would query the database for various statistics
    // For now, returning a placeholder
    return {
      success: true,
      data: {
        totalTrends: 0,
        activeTrends: 0,
        trendingSources: {
          google: 0,
          twitter: 0,
          reddit: 0,
          tiktok: 0,
        },
        urgentOpportunities: 0,
        contentGaps: 0,
      },
    };
  }
}
