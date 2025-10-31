import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MarketingService } from './marketing.service'
import { MarketingController } from './marketing.controller'
import { OrchestratorService } from './ai/orchestrator.service'
import { SonnetService } from './ai/sonnet.service'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { HttpModule } from '@nestjs/axios'
import { CampaignOrchestrationService } from './services/campaign-orchestration.service'
import { MultiChannelCoordinatorService } from './services/multi-channel-coordinator.service'
import { CampaignWorkflowService } from './services/campaign-workflow.service'
import { BudgetOptimizerService } from './services/budget-optimizer.service'
import { LeoCreativeDirectorService } from './services/leo-creative-director.service'
import { SocialSchedulerService } from './services/social-scheduler.service'
import { SocialPlatformIntegrationService } from './services/social-platform-integration.service'
import { EmailDesignerService } from './services/email-designer.service'
import { AnalyticsService } from './services/analytics.service'
import { AvaOrchestratorService } from './services/ava-orchestrator.service'
import { MultiPlatformWorkflowOrchestrator } from './services/multi-platform-workflow-orchestrator.service'
import { PlatformIntelligence } from './services/platform-intelligence.service'
import { CostEstimator } from './services/cost-estimator.service'
import { PublishingPlatformService } from './services/publishing-platform.service'
import { WebhookService } from './services/webhook.service'
import { CompetitorAnalysisService } from './services/competitor-analysis.service'
import { ContentLibraryService } from './services/content-library.service'
import { MultiLanguageService } from './services/multi-language.service'
import { InfluencerCollaborationService } from './services/influencer-collaboration.service'
import { TwitterIntegration } from './services/platform-integrations/twitter.integration'
import { LinkedInIntegration } from './services/platform-integrations/linkedin.integration'
import { FacebookInstagramIntegration } from './services/platform-integrations/facebook.integration'
import { TikTokIntegration } from './services/platform-integrations/tiktok.integration'
import { YouTubeIntegration } from './services/platform-integrations/youtube.integration'
import { WorkflowNotificationsService } from './services/workflow-notifications.service'
import { ErrorHandlerService } from './services/error-handler.service'
import { WorkflowGateway } from './gateways/workflow.gateway'
import { WorkflowService } from './services/workflow.service'
import { KeywordUniverseService } from './services/seo/keyword-universe.service'
import { ProgrammaticPageService } from './services/seo/programmatic-page.service'
import { SerpIntelligenceService } from './services/seo/serp-intelligence.service'
import { SnippetHijackerService } from './services/seo/snippet-hijacker.service'
import { SchemaAutomationService } from './services/seo/schema-automation.service'
import { HAROAutomationService } from './services/link-building/haro-automation.service'
import { BrokenLinkService } from './services/link-building/broken-link.service'
import { PartnershipNetworkService } from './services/link-building/partnership-network.service'
import { ResourcePageService } from './services/link-building/resource-page.service'
import { TrendCollectorService } from './services/trends/trend-collector.service'
import { TrendPredictorService } from './services/trends/trend-predictor.service'
import { TrendAnalyzerService } from './services/trends/trend-analyzer.service'
import { TrendsController } from './controllers/trends.controller'
import { APIClientService } from './services/external-apis/api-client.service'
import { GoogleTrendsAPIService } from './services/external-apis/google-trends-api.service'
import { TwitterAPIService } from './services/external-apis/twitter-api.service'
import { RedditAPIService } from './services/external-apis/reddit-api.service'
import { VideoScriptGeneratorService } from './services/video/video-script-generator.service'
import { VideoMetadataOptimizerService } from './services/video/video-metadata-optimizer.service'
import { PlatformFormatterService } from './services/video/platform-formatter.service'
import { VideoController } from './controllers/video.controller'
import { NeuralNarrativeService } from './services/narrative/neural-narrative.service'
import { OrganicGrowthService } from './services/social/organic-growth.service'
import { HyperPredictiveService } from './services/intelligence/hyper-predictive.service'
import { PlatformDecoderService } from './services/algorithm/platform-decoder.service'
import { EEATBuilderService } from './services/authority/eeat-builder.service'
import { MultiTouchAttributionService } from './services/attribution/multi-touch-attribution.service'
import { ABTestingService } from './services/experimentation/ab-testing.service'
import { CreativeDirectorService } from './services/creative/creative-director.service'
import { CampaignMemoryService } from './services/learning/campaign-memory.service'
import { IntelligenceController } from './controllers/intelligence.controller'
import { ProfileIntelligenceController } from './controllers/profile-intelligence.controller'
import { ProfileMLController } from './controllers/profile-ml.controller'
import { QueueModule } from '../../common/queues/queue.module'
import { TrendCollectionProcessor } from './jobs/trend-collection.processor'
import { WeakSignalDetectionProcessor } from './jobs/weak-signal-detection.processor'
import { AlgorithmExperimentProcessor } from './jobs/algorithm-experiment.processor'
// Phase B: ML-based Services
import { MLTrendForecasterService } from './services/ml/ml-trend-forecaster.service'
import { ContentPerformancePredictorService } from './services/ml/content-performance-predictor.service'
import { SmartABTestingService } from './services/ml/smart-ab-testing.service'
import { SemanticKeywordClusteringService } from './services/ml/semantic-keyword-clustering.service'
import { CampaignSuccessPredictorService } from './services/ml/campaign-success-predictor.service'
import { MLController } from './controllers/ml.controller'
// Phase C: Testing & Monitoring Services
import { HealthCheckService } from './services/monitoring/health-check.service'
import { MetricsCollectorService } from './services/monitoring/metrics-collector.service'
import { AlertingService } from './services/monitoring/alerting.service'
import { MonitoringController } from './controllers/monitoring.controller'
// Phase D: Performance Optimization Services
import { RedisCacheService } from './services/optimization/redis-cache.service'
import { QueryOptimizerService } from './services/optimization/query-optimizer.service'
import { PerformanceMonitorService } from './services/optimization/performance-monitor.service'
import { MLCacheService } from './services/optimization/ml-cache.service'
import { OptimizationController } from './controllers/optimization.controller'
// Phase 1: Data Seeding Services
import { CampaignSeedingService } from './services/seeding/campaign-seeding.service'
import { KeywordSeedingService } from './services/seeding/keyword-seeding.service'
import { ContentSeedingService } from './services/seeding/content-seeding.service'
import { TrendSeedingService } from './services/seeding/trend-seeding.service'
import { AttributionSeedingService } from './services/seeding/attribution-seeding.service'
import { BacklinkSeedingService } from './services/seeding/backlink-seeding.service'
import { ValidationService } from './services/seeding/validation.service'
import { SeedingOrchestratorService } from './services/seeding/orchestrator.service'
import { SeedingController } from './controllers/seeding.controller'
// Phase 2: Workflow Automation Services
import { SEOAnalyzerService } from './services/workflows/seo-analyzer.service'
import { SEOPlannerService } from './services/workflows/seo-planner.service'
import { SEOExecutorService } from './services/workflows/seo-executor.service'
import { SEOWorkflowService } from './services/workflows/seo-workflow.service'
import { WorkflowsController } from './controllers/workflows.controller'
// Phase 2 Enhancements: Real Integrations
import { GoogleSearchConsoleService } from './services/integrations/google-search-console.service'
import { RankTrackingProcessor } from './jobs/rank-tracking.processor'
// Phase 2 Sprint 2: Trend Content Pipeline
import { TrendDetectorService } from './services/workflows/trend-detector.service'
import { ContentStrategistService } from './services/workflows/content-strategist.service'
import { ContentProducerService } from './services/workflows/content-producer.service'
import { TrendContentWorkflowService } from './services/workflows/trend-content-workflow.service'
// Phase E: Profile & Strategy Services (New)
import { MarketingProfileService } from './services/profile/marketing-profile.service'
import { PlatformConnectionService } from './services/profile/platform-connection.service'
import { LandscapeAnalyzerService } from './services/strategy/landscape-analyzer.service'
import { StrategyPlannerService } from './services/strategy/strategy-planner.service'
import { ContentPlatformValidatorService } from './services/strategy/content-platform-validator.service'
import { RepurposingEngineService } from './services/strategy/repurposing-engine.service'
import { CostCalculatorService } from './services/strategy/cost-calculator.service'
import { MultiPlatformPublisherService } from './services/publishing/multi-platform-publisher.service'
import { DomainTrackerService } from './services/publishing/domain-tracker.service'
import { AutonomousOrchestratorService } from './services/orchestration/autonomous-orchestrator.service'
import { ProfileController } from './controllers/profile.controller'
// Phase 1: Offer-Lab Services
import { OfferLabController } from './controllers/offer-lab.controller'
import { EncryptionService } from './services/offer-lab/encryption.service'
import { MaxBountyAdapterService } from './services/offer-lab/networks/maxbounty-adapter.service'
import { ClickBankAdapterService } from './services/offer-lab/networks/clickbank-adapter.service'
import { OfferScoringService } from './services/offer-lab/offer-scoring.service'
import { OfferOrchestratorService } from './services/offer-lab/offer-orchestrator.service'
import { FunnelCopyService } from './services/offer-lab/funnel-copy.service'
import { FunnelCreativeService } from './services/offer-lab/funnel-creative.service'
import { LeadMagnetGeneratorService } from './services/offer-lab/lead-magnet-generator.service'
import { FunnelGeneratorService } from './services/offer-lab/funnel-generator.service'
import { OfferSyncProcessor } from './jobs/offer-sync.processor'
// Phase 2: Offer-Lab Traffic Services
import { PopAdsAdapterService } from './services/offer-lab/traffic/networks/popads-adapter.service'
import { PropellerAdsAdapterService } from './services/offer-lab/traffic/networks/propellerads-adapter.service'
import { AdGeneratorService } from './services/offer-lab/traffic/ad-generator.service'
import { PauseRulesService } from './services/offer-lab/traffic/pause-rules.service'
import { ConversionTrackerService } from './services/offer-lab/traffic/conversion-tracker.service'
import { TrafficOrchestratorService } from './services/offer-lab/traffic/traffic-orchestrator.service'
import { AdMetricsSyncProcessor } from './jobs/ad-metrics-sync.processor'
import { AutoPauseCheckerProcessor } from './jobs/auto-pause-checker.processor'

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    JwtModule.register({ secret: process.env.JWT_SECRET || 'your-secret-key' }),
    QueueModule,
  ],
  controllers: [
    MarketingController,
    TrendsController,
    VideoController,
    IntelligenceController,
    ProfileIntelligenceController,
    MLController,
    ProfileMLController,
    MonitoringController,
    OptimizationController,
    SeedingController,
    WorkflowsController,
    ProfileController,
    OfferLabController,
  ],
  providers: [
    MarketingService,
    OrchestratorService,
    SonnetService,
    CampaignOrchestrationService,
    MultiChannelCoordinatorService,
    CampaignWorkflowService,
    BudgetOptimizerService,
    LeoCreativeDirectorService,
    SocialSchedulerService,
    SocialPlatformIntegrationService,
    EmailDesignerService,
    AnalyticsService,
    AvaOrchestratorService,
    MultiPlatformWorkflowOrchestrator,
    PlatformIntelligence,
    CostEstimator,
    PublishingPlatformService,
    WebhookService,
    CompetitorAnalysisService,
    ContentLibraryService,
    MultiLanguageService,
    InfluencerCollaborationService,
    TwitterIntegration,
    LinkedInIntegration,
    FacebookInstagramIntegration,
    TikTokIntegration,
    YouTubeIntegration,
    WorkflowNotificationsService,
    ErrorHandlerService,
    WorkflowService,
    WorkflowGateway,
    // SEO Empire Services
    KeywordUniverseService,
    ProgrammaticPageService,
    SerpIntelligenceService,
    SnippetHijackerService,
    SchemaAutomationService,
    // Link Building Services
    HAROAutomationService,
    BrokenLinkService,
    PartnershipNetworkService,
    ResourcePageService,
    // External API Services
    APIClientService,
    GoogleTrendsAPIService,
    TwitterAPIService,
    RedditAPIService,
    // Trend Intelligence Services
    TrendCollectorService,
    TrendPredictorService,
    TrendAnalyzerService,
    // Video DNA Services
    VideoScriptGeneratorService,
    VideoMetadataOptimizerService,
    PlatformFormatterService,
    // Phases 5-15: Advanced Intelligence
    NeuralNarrativeService,
    OrganicGrowthService,
    HyperPredictiveService,
    PlatformDecoderService,
    EEATBuilderService,
    MultiTouchAttributionService,
    ABTestingService,
    CreativeDirectorService,
    CampaignMemoryService,
    // Job Processors (Automation)
    TrendCollectionProcessor,
    WeakSignalDetectionProcessor,
    AlgorithmExperimentProcessor,
    // Phase B: ML Services
    MLTrendForecasterService,
    ContentPerformancePredictorService,
    SmartABTestingService,
    SemanticKeywordClusteringService,
    CampaignSuccessPredictorService,
    // Phase C: Testing & Monitoring Services
    HealthCheckService,
    MetricsCollectorService,
    AlertingService,
    // Phase D: Performance Optimization Services
    RedisCacheService,
    QueryOptimizerService,
    PerformanceMonitorService,
    MLCacheService,
    // Phase 1: Data Seeding Services
    CampaignSeedingService,
    KeywordSeedingService,
    ContentSeedingService,
    TrendSeedingService,
    AttributionSeedingService,
    BacklinkSeedingService,
    ValidationService,
    SeedingOrchestratorService,
    // Phase 2: Workflow Automation Services
    SEOAnalyzerService,
    SEOPlannerService,
    SEOExecutorService,
    SEOWorkflowService,
    // Phase 2 Enhancements: Real Integrations
    GoogleSearchConsoleService,
    RankTrackingProcessor,
    // Phase 2 Sprint 2: Trend Content Pipeline
    TrendDetectorService,
    ContentStrategistService,
    ContentProducerService,
    TrendContentWorkflowService,
    // Phase E: Profile & Strategy Services (New)
    MarketingProfileService,
    PlatformConnectionService,
    LandscapeAnalyzerService,
    StrategyPlannerService,
    ContentPlatformValidatorService,
    RepurposingEngineService,
    CostCalculatorService,
    MultiPlatformPublisherService,
    DomainTrackerService,
    AutonomousOrchestratorService,
    // Phase 1: Offer-Lab Services
    EncryptionService,
    MaxBountyAdapterService,
    ClickBankAdapterService,
    OfferScoringService,
    OfferOrchestratorService,
    FunnelCopyService,
    FunnelCreativeService,
    LeadMagnetGeneratorService,
    FunnelGeneratorService,
    OfferSyncProcessor,
    // Phase 2: Offer-Lab Traffic Services
    PopAdsAdapterService,
    PropellerAdsAdapterService,
    AdGeneratorService,
    PauseRulesService,
    ConversionTrackerService,
    TrafficOrchestratorService,
    AdMetricsSyncProcessor,
    AutoPauseCheckerProcessor,
  ],
  exports: [
    MarketingService,
    OrchestratorService,
    CampaignOrchestrationService,
    MultiChannelCoordinatorService,
    CampaignWorkflowService,
    BudgetOptimizerService,
    LeoCreativeDirectorService,
    SocialSchedulerService,
    SocialPlatformIntegrationService,
    EmailDesignerService,
    AnalyticsService,
    AvaOrchestratorService,
    MultiPlatformWorkflowOrchestrator,
    PlatformIntelligence,
    CostEstimator,
    PublishingPlatformService,
    WebhookService,
    CompetitorAnalysisService,
    ContentLibraryService,
    MultiLanguageService,
    InfluencerCollaborationService,
    TwitterIntegration,
    LinkedInIntegration,
    FacebookInstagramIntegration,
    TikTokIntegration,
    YouTubeIntegration,
    WorkflowNotificationsService,
    ErrorHandlerService,
    WorkflowGateway,
    // SEO Empire Services
    KeywordUniverseService,
    ProgrammaticPageService,
    SerpIntelligenceService,
    SnippetHijackerService,
    SchemaAutomationService,
    // Link Building Services
    HAROAutomationService,
    BrokenLinkService,
    PartnershipNetworkService,
    ResourcePageService,
    // External API Services
    APIClientService,
    GoogleTrendsAPIService,
    TwitterAPIService,
    RedditAPIService,
    // Trend Intelligence Services
    TrendCollectorService,
    TrendPredictorService,
    TrendAnalyzerService,
    // Video DNA Services
    VideoScriptGeneratorService,
    VideoMetadataOptimizerService,
    PlatformFormatterService,
    // Phases 5-15: Advanced Intelligence
    NeuralNarrativeService,
    OrganicGrowthService,
    HyperPredictiveService,
    PlatformDecoderService,
    EEATBuilderService,
    MultiTouchAttributionService,
    ABTestingService,
    CreativeDirectorService,
    CampaignMemoryService,
    // Phase B: ML Services
    MLTrendForecasterService,
    ContentPerformancePredictorService,
    SmartABTestingService,
    SemanticKeywordClusteringService,
    CampaignSuccessPredictorService,
    // Phase C: Testing & Monitoring Services
    HealthCheckService,
    MetricsCollectorService,
    AlertingService,
    // Phase D: Performance Optimization Services
    RedisCacheService,
    QueryOptimizerService,
    PerformanceMonitorService,
    MLCacheService,
  ],
})
export class MarketingModule {}
