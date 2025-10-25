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

@Module({
  imports: [PrismaModule, HttpModule, JwtModule.register({ secret: process.env.JWT_SECRET || 'your-secret-key' })],
  controllers: [MarketingController],
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
  ],
})
export class MarketingModule {}
