import { Controller, Get, Post, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

// Services
import { ABTestService } from '../services/offer-lab/optimization/ab-test.service';
import { VariantComparerService } from '../services/offer-lab/optimization/variant-comparer.service';
import { WinnerDetectorService } from '../services/offer-lab/optimization/winner-detector.service';
import { TrafficQualityService } from '../services/offer-lab/optimization/traffic-quality.service';
import { FraudDetectorService } from '../services/offer-lab/optimization/fraud-detector.service';
import { SmartScalerService } from '../services/offer-lab/optimization/smart-scaler.service';
import { PerformanceThresholdCheckerService } from '../services/offer-lab/optimization/performance-threshold-checker.service';
import { BudgetSafetyGuardService } from '../services/offer-lab/optimization/budget-safety-guard.service';
import { BudgetOptimizerService, OptimizationStrategy } from '../services/offer-lab/optimization/budget-optimizer.service';
import { ROIPredictorService } from '../services/offer-lab/optimization/roi-predictor.service';
import { BudgetRebalancerService } from '../services/offer-lab/optimization/budget-rebalancer.service';
import { FunnelAnalyzerService } from '../services/offer-lab/optimization/funnel-analyzer.service';
import { DropoffDetectorService } from '../services/offer-lab/optimization/dropoff-detector.service';
import { CTAOptimizerService } from '../services/offer-lab/optimization/cta-optimizer.service';
import { BidOptimizerService, BidStrategy } from '../services/offer-lab/optimization/bid-optimizer.service';
import { CompetitorBidAnalyzerService } from '../services/offer-lab/optimization/competitor-bid-analyzer.service';
import { BidStrategySelectorService } from '../services/offer-lab/optimization/bid-strategy-selector.service';

/**
 * Offer-Lab Optimization Controller
 *
 * Provides API endpoints for campaign optimization features:
 * - A/B Testing
 * - Traffic Quality & Fraud Detection
 * - Smart Scaling & Budget Optimization
 * - Funnel Analysis & CTA Optimization
 * - Bid Optimization & Competitor Analysis
 */
@Controller('offer-lab/optimization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfferLabOptimizationController {
  private readonly logger = new Logger(OfferLabOptimizationController.name);

  constructor(
    private readonly abTestService: ABTestService,
    private readonly variantComparer: VariantComparerService,
    private readonly winnerDetector: WinnerDetectorService,
    private readonly trafficQuality: TrafficQualityService,
    private readonly fraudDetector: FraudDetectorService,
    private readonly smartScaler: SmartScalerService,
    private readonly thresholdChecker: PerformanceThresholdCheckerService,
    private readonly budgetSafety: BudgetSafetyGuardService,
    private readonly budgetOptimizer: BudgetOptimizerService,
    private readonly roiPredictor: ROIPredictorService,
    private readonly budgetRebalancer: BudgetRebalancerService,
    private readonly funnelAnalyzer: FunnelAnalyzerService,
    private readonly dropoffDetector: DropoffDetectorService,
    private readonly ctaOptimizer: CTAOptimizerService,
    private readonly bidOptimizer: BidOptimizerService,
    private readonly competitorAnalyzer: CompetitorBidAnalyzerService,
    private readonly bidStrategySelector: BidStrategySelectorService,
  ) {}

  // =============================================================================
  // A/B TESTING ENDPOINTS
  // =============================================================================

  @Post('ab-tests')
  @Roles('admin', 'manager')
  async createABTest(@Body() request: any) {
    this.logger.log('Creating A/B test');
    return this.abTestService.createTest(request);
  }

  @Get('ab-tests/active')
  @Roles('admin', 'manager', 'user')
  async getActiveTests() {
    return this.abTestService.getActiveTests();
  }

  @Get('ab-tests/:testId/performance')
  @Roles('admin', 'manager', 'user')
  async getTestPerformance(@Param('testId') testId: string) {
    return this.abTestService.getTestPerformance(testId);
  }

  @Post('ab-tests/:testId/start')
  @Roles('admin', 'manager')
  async startTest(@Param('testId') testId: string) {
    return this.abTestService.startTest(testId);
  }

  @Post('ab-tests/:testId/complete')
  @Roles('admin', 'manager')
  async completeTest(@Param('testId') testId: string, @Body() body: { winnerId?: string }) {
    return this.abTestService.completeTest(testId, body.winnerId);
  }

  @Get('ab-tests/winners/detect')
  @Roles('admin', 'manager')
  async detectWinners() {
    return this.winnerDetector.detectWinners();
  }

  @Post('ab-tests/winners/auto-promote')
  @Roles('admin')
  async autoPromoteWinners(@Query('execute') execute?: string) {
    const autoComplete = execute === 'true';
    return this.winnerDetector.autoPromoteWinners(autoComplete);
  }

  // =============================================================================
  // TRAFFIC QUALITY & FRAUD DETECTION
  // =============================================================================

  @Get('traffic-quality/:connectionId')
  @Roles('admin', 'manager', 'user')
  async getTrafficQuality(@Param('connectionId') connectionId: string) {
    return this.trafficQuality.calculateQualityScore(connectionId);
  }

  @Get('traffic-quality/:connectionId/history')
  @Roles('admin', 'manager', 'user')
  async getQualityHistory(
    @Param('connectionId') connectionId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days) : 30;
    return this.trafficQuality.getQualityHistory(connectionId, daysNum);
  }

  @Get('traffic-quality/blacklisted/all')
  @Roles('admin', 'manager')
  async getBlacklistedConnections() {
    return this.trafficQuality.getBlacklistedConnections();
  }

  @Post('traffic-quality/:connectionId/blacklist')
  @Roles('admin', 'manager')
  async blacklistConnection(
    @Param('connectionId') connectionId: string,
    @Body() body: { reason: string },
  ) {
    await this.trafficQuality.blacklistConnection(connectionId, body.reason);
    return { success: true, message: 'Connection blacklisted' };
  }

  @Get('fraud/analyze/:connectionId')
  @Roles('admin', 'manager', 'user')
  async analyzeFraud(@Param('connectionId') connectionId: string) {
    return this.fraudDetector.analyzeConnection(connectionId);
  }

  @Get('fraud/alerts/all')
  @Roles('admin', 'manager')
  async getAllFraudAlerts() {
    return this.fraudDetector.getAllFraudAlerts();
  }

  @Post('fraud/auto-pause')
  @Roles('admin')
  async autoPauseFraudulent() {
    return this.fraudDetector.autoPauseFraudulentCampaigns();
  }

  // =============================================================================
  // SMART SCALING & BUDGET SAFETY
  // =============================================================================

  @Get('scaling/candidates')
  @Roles('admin', 'manager', 'user')
  async getScalingCandidates() {
    return this.smartScaler.findScalingCandidates();
  }

  @Post('scaling/campaign/:campaignId')
  @Roles('admin', 'manager')
  async scaleCampaign(
    @Param('campaignId') campaignId: string,
    @Body() body: { scaleFactor: number; reason?: string },
  ) {
    return this.smartScaler.scaleCampaign(campaignId, body.scaleFactor, body.reason);
  }

  @Post('scaling/auto-scale')
  @Roles('admin')
  async autoScale() {
    return this.smartScaler.autoScaleCampaigns();
  }

  @Get('scaling/history/:campaignId')
  @Roles('admin', 'manager', 'user')
  async getScalingHistory(
    @Param('campaignId') campaignId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.smartScaler.getScalingHistory(campaignId, limitNum);
  }

  @Get('budget-safety/check/:campaignId')
  @Roles('admin', 'manager', 'user')
  async checkBudgetSafety(
    @Param('campaignId') campaignId: string,
    @Query('newBudget') newBudget: string,
  ) {
    return this.budgetSafety.checkBudgetChange(campaignId, parseFloat(newBudget));
  }

  @Get('budget-safety/utilization')
  @Roles('admin', 'manager', 'user')
  async getBudgetUtilization() {
    return this.budgetSafety.getBudgetUtilization();
  }

  @Get('budget-safety/campaigns-at-risk')
  @Roles('admin', 'manager')
  async getCampaignsAtRisk() {
    return this.budgetSafety.getCampaignsAtRisk();
  }

  @Post('budget-safety/emergency-freeze')
  @Roles('admin')
  async emergencyBudgetFreeze(@Body() body: { reason: string }) {
    return this.budgetSafety.emergencyBudgetFreeze(body.reason);
  }

  // =============================================================================
  // BUDGET OPTIMIZATION
  // =============================================================================

  @Post('budget/optimize')
  @Roles('admin', 'manager')
  async optimizeBudgets(
    @Body() body: { strategy?: OptimizationStrategy; totalBudget?: number },
  ) {
    return this.budgetOptimizer.optimizeBudgets(body.strategy, body.totalBudget);
  }

  @Post('budget/apply-recommendations')
  @Roles('admin')
  async applyBudgetRecommendations(@Body() body: { recommendations: any[] }) {
    return this.budgetOptimizer.applyRecommendations(body.recommendations);
  }

  @Post('budget/rebalance')
  @Roles('admin', 'manager')
  async rebalanceBudgets(@Body() config?: any) {
    return this.budgetRebalancer.rebalance(config);
  }

  @Get('budget/rebalance/preview')
  @Roles('admin', 'manager', 'user')
  async previewRebalance(@Query('strategy') strategy?: OptimizationStrategy) {
    return this.budgetRebalancer.getRecommendations(strategy);
  }

  // =============================================================================
  // ROI PREDICTION
  // =============================================================================

  @Get('roi/predict/:campaignId')
  @Roles('admin', 'manager', 'user')
  async predictROI(@Param('campaignId') campaignId: string) {
    return this.roiPredictor.predictCampaignROI(campaignId);
  }

  @Get('roi/predict/all')
  @Roles('admin', 'manager', 'user')
  async predictAllCampaigns() {
    return this.roiPredictor.predictAllCampaigns();
  }

  @Get('roi/declining')
  @Roles('admin', 'manager')
  async getDecliningCampaigns() {
    return this.roiPredictor.getCampaignsPredictedToDecline();
  }

  @Get('roi/improving')
  @Roles('admin', 'manager', 'user')
  async getImprovingCampaigns() {
    return this.roiPredictor.getCampaignsPredictedToImprove();
  }

  @Get('roi/portfolio')
  @Roles('admin', 'manager', 'user')
  async getPortfolioPrediction() {
    return this.roiPredictor.getPortfolioPrediction();
  }

  // =============================================================================
  // FUNNEL ANALYSIS
  // =============================================================================

  @Get('funnel/analyze/:campaignId')
  @Roles('admin', 'manager', 'user')
  async analyzeFunnel(@Param('campaignId') campaignId: string) {
    return this.funnelAnalyzer.analyzeFunnel(campaignId);
  }

  @Get('funnel/benchmarks/:campaignId')
  @Roles('admin', 'manager', 'user')
  async getFunnelBenchmarks(@Param('campaignId') campaignId: string) {
    return this.funnelAnalyzer.compareToBenchmarks(campaignId);
  }

  @Get('funnel/needs-attention')
  @Roles('admin', 'manager')
  async getFunnelsNeedingAttention() {
    return this.funnelAnalyzer.getFunnelsNeedingAttention();
  }

  @Get('funnel/top-performers')
  @Roles('admin', 'manager', 'user')
  async getTopFunnels(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.funnelAnalyzer.getTopPerformingFunnels(limitNum);
  }

  @Get('funnel/metrics/average')
  @Roles('admin', 'manager', 'user')
  async getAverageFunnelMetrics() {
    return this.funnelAnalyzer.getAverageFunnelMetrics();
  }

  // =============================================================================
  // DROPOFF DETECTION
  // =============================================================================

  @Get('dropoff/detect/:campaignId')
  @Roles('admin', 'manager', 'user')
  async detectDropoffs(@Param('campaignId') campaignId: string) {
    return this.dropoffDetector.detectDropoffs(campaignId);
  }

  @Get('dropoff/critical')
  @Roles('admin', 'manager')
  async getCriticalDropoffs() {
    return this.dropoffDetector.getCriticalDropoffs();
  }

  @Get('dropoff/revenue-opportunities')
  @Roles('admin', 'manager', 'user')
  async getRevenueOpportunities() {
    return this.dropoffDetector.getRevenueRecoveryOpportunities();
  }

  // =============================================================================
  // CTA OPTIMIZATION
  // =============================================================================

  @Get('cta/recommendations/:campaignId')
  @Roles('admin', 'manager', 'user')
  async getCTARecommendations(@Param('campaignId') campaignId: string) {
    return this.ctaOptimizer.generateCTARecommendations(campaignId);
  }

  @Get('cta/needs-optimization')
  @Roles('admin', 'manager')
  async getCampaignsNeedingCTA() {
    return this.ctaOptimizer.getCampaignsNeedingCTAOptimization();
  }

  @Post('cta/generate-custom')
  @Roles('admin', 'manager', 'user')
  async generateCustomCTA(@Body() params: any) {
    return this.ctaOptimizer.generateCustomCTA(params);
  }

  @Get('cta/best-practices')
  @Roles('admin', 'manager', 'user')
  async getCTABestPractices() {
    return this.ctaOptimizer.getBestPractices();
  }

  // =============================================================================
  // BID OPTIMIZATION
  // =============================================================================

  @Post('bid/calculate/:campaignId')
  @Roles('admin', 'manager', 'user')
  async calculateOptimalBid(
    @Param('campaignId') campaignId: string,
    @Body() strategy: BidStrategy,
  ) {
    return this.bidOptimizer.calculateOptimalBid(campaignId, strategy);
  }

  @Post('bid/recommendations')
  @Roles('admin', 'manager', 'user')
  async getAllBidRecommendations(@Body() strategy: BidStrategy) {
    return this.bidOptimizer.getAllBidRecommendations(strategy);
  }

  @Post('bid/apply/:campaignId')
  @Roles('admin', 'manager')
  async applyBidRecommendation(
    @Param('campaignId') campaignId: string,
    @Body() body: { recommendedBid: number },
  ) {
    await this.bidOptimizer.applyBidRecommendation(campaignId, body.recommendedBid);
    return { success: true, message: 'Bid updated' };
  }

  // =============================================================================
  // COMPETITOR ANALYSIS
  // =============================================================================

  @Get('competitor/analyze/:campaignId')
  @Roles('admin', 'manager', 'user')
  async analyzeCompetitorBids(@Param('campaignId') campaignId: string) {
    return this.competitorAnalyzer.analyzeCompetitorBids(campaignId);
  }

  @Get('competitor/bidding-wars')
  @Roles('admin', 'manager')
  async getBiddingWars() {
    return this.competitorAnalyzer.getCampaignsInBiddingWars();
  }

  @Get('competitor/lagging')
  @Roles('admin', 'manager')
  async getLaggingCampaigns() {
    return this.competitorAnalyzer.getLaggingCampaigns();
  }

  @Get('competitor/market-pressure')
  @Roles('admin', 'manager', 'user')
  async getMarketPressure() {
    return this.competitorAnalyzer.getMarketPressureIndex();
  }

  // =============================================================================
  // BID STRATEGY SELECTION
  // =============================================================================

  @Get('bid-strategy/recommend/:campaignId')
  @Roles('admin', 'manager', 'user')
  async recommendBidStrategy(@Param('campaignId') campaignId: string) {
    return this.bidStrategySelector.selectBidStrategy(campaignId);
  }

  @Get('bid-strategy/recommendations/all')
  @Roles('admin', 'manager', 'user')
  async getAllStrategyRecommendations() {
    return this.bidStrategySelector.getAllStrategyRecommendations();
  }

  @Get('bid-strategy/needs-change')
  @Roles('admin', 'manager')
  async getCampaignsNeedingStrategyChange() {
    return this.bidStrategySelector.getCampaignsNeedingStrategyChange();
  }

  @Get('bid-strategy/distribution')
  @Roles('admin', 'manager', 'user')
  async getStrategyDistribution() {
    return this.bidStrategySelector.getStrategyDistribution();
  }

  // =============================================================================
  // DASHBOARD OVERVIEW
  // =============================================================================

  @Get('dashboard/overview')
  @Roles('admin', 'manager', 'user')
  async getDashboardOverview() {
    this.logger.log('Fetching optimization dashboard overview');

    const [
      budgetUtilization,
      scalingCandidates,
      fraudAlerts,
      roiPredictions,
      funnelMetrics,
      marketPressure,
    ] = await Promise.all([
      this.budgetSafety.getBudgetUtilization(),
      this.smartScaler.findScalingCandidates(),
      this.fraudDetector.getAllFraudAlerts(),
      this.roiPredictor.getPortfolioPrediction(),
      this.funnelAnalyzer.getAverageFunnelMetrics(),
      this.competitorAnalyzer.getMarketPressureIndex(),
    ]);

    return {
      budgetUtilization,
      scalingOpportunities: scalingCandidates.length,
      activeAlerts: fraudAlerts.length,
      portfolioROI: roiPredictions,
      funnelHealth: funnelMetrics.avgFunnelHealth,
      marketPressure: marketPressure.overallPressure,
      timestamp: new Date(),
    };
  }
}
