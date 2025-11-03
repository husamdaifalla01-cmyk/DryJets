import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { LandscapeAnalyzerService } from '../strategy/landscape-analyzer.service';
import { StrategyPlannerService } from '../strategy/strategy-planner.service';
import { RepurposingEngineService } from '../strategy/repurposing-engine.service';
import { CostCalculatorService } from '../strategy/cost-calculator.service';
import { MultiPlatformPublisherService } from '../publishing/multi-platform-publisher.service';
import { SonnetService } from '../../ai/sonnet.service';

/**
 * AUTONOMOUS ORCHESTRATOR SERVICE
 *
 * The master orchestrator that ties everything together for fully autonomous
 * marketing campaign execution. Coordinates all services to run campaigns
 * from strategy to publishing with minimal human intervention.
 *
 * Workflow:
 * 1. Analyze landscape
 * 2. Generate strategy
 * 3. Create content
 * 4. Repurpose for platforms
 * 5. Validate & optimize
 * 6. Publish across platforms
 * 7. Monitor & optimize
 * 8. Learn & improve
 */

export interface CampaignLaunchRequest {
  profileId: string;
  campaignName: string;
  mode: 'full_auto' | 'semi_auto' | 'hybrid';
  budget: number;
  duration: number; // days
  contentPreferences?: {
    blogs?: number;
    videos?: number;
    socialPosts?: number;
  };
  platforms?: string[];
  approvalRequired?: boolean;
}

export interface OrchestrationState {
  campaignId: string;
  profileId: string;
  phase: 'analyzing' | 'planning' | 'creating' | 'repurposing' | 'validating' | 'publishing' | 'monitoring' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  stepsCompleted: string[];
  stepsRemaining: string[];
  startedAt: Date;
  estimatedCompletion?: Date;
  metrics: {
    contentCreated: number;
    contentRepurposed: number;
    contentPublished: number;
    budgetUsed: number;
    budgetRemaining: number;
  };
  logs: {
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
}

export interface CampaignExecutionResult {
  success: boolean;
  campaignId: string;
  summary: {
    totalContent: number;
    platformsPublished: number;
    totalReach: string;
    estimatedROI: string;
    costSummary: any;
  };
  state: OrchestrationState;
  nextSteps?: string[];
}

@Injectable()
export class AutonomousOrchestratorService {
  private readonly logger = new Logger(AutonomousOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly landscapeAnalyzer: LandscapeAnalyzerService,
    private readonly strategyPlanner: StrategyPlannerService,
    private readonly repurposingEngine: RepurposingEngineService,
    private readonly costCalculator: CostCalculatorService,
    private readonly publisher: MultiPlatformPublisherService,
    private readonly sonnetService: SonnetService,
  ) {}

  /**
   * Launch autonomous campaign
   */
  async launchCampaign(request: CampaignLaunchRequest): Promise<CampaignExecutionResult> {
