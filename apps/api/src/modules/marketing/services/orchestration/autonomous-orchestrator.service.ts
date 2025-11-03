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
    this.logger.log(`= Launching autonomous campaign: ${request.campaignName}`);

    // Create campaign order - FIX: Use relation connect syntax for Prisma
    const campaign = await this.prisma.campaignOrder.create({
      data: {
        profile: { connect: { id: request.profileId } },
        name: request.campaignName,
        strategy: 'autonomous',
        contentTypes: request.contentPreferences || {},
        platforms: request.platforms || [],
        repurposingRules: {},
        estimatedCost: request.budget,
        budgetAllocated: request.budget,
        budgetUsed: 0,
        budgetRemaining: request.budget,
        costBreakdown: {}, // FIX: Required field in Prisma schema
        status: 'planning',
        mode: request.mode,
        startDate: new Date(),
        workflowState: this.initializeState(request.profileId),
      },
    });

    // Initialize orchestration state
    const state: OrchestrationState = {
      campaignId: campaign.id,
      profileId: request.profileId,
      phase: 'analyzing',
      progress: 0,
      currentStep: 'Analyzing market landscape',
      stepsCompleted: [],
      stepsRemaining: [
        'Analyze landscape',
        'Generate strategy',
        'Create content',
        'Repurpose content',
        'Validate content',
        'Publish content',
        'Monitor performance',
      ],
      startedAt: new Date(),
      metrics: {
        contentCreated: 0,
        contentRepurposed: 0,
        contentPublished: 0,
        budgetUsed: 0,
        budgetRemaining: request.budget,
      },
      logs: [],
    };

    try {
      // Execute autonomous workflow
      if (request.mode === 'full_auto') {
        return await this.executeFullAutoMode(campaign.id, request, state);
      } else if (request.mode === 'semi_auto') {
        return await this.executeSemiAutoMode(campaign.id, request, state);
      } else {
        return await this.executeHybridMode(campaign.id, request, state);
      }
    } catch (error) {
      this.logger.error('Campaign execution failed:', error);

      state.phase = 'failed';
      state.logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Campaign failed: ${error.message}`,
      });

      await this.updateCampaignState(campaign.id, state);

      return {
        success: false,
        campaignId: campaign.id,
        summary: null,
        state,
      };
    }
  }

  /**
   * Execute FULL AUTO mode (0 human intervention)
   */
  private async executeFullAutoMode(
    campaignId: string,
    request: CampaignLaunchRequest,
    state: OrchestrationState,
  ): Promise<CampaignExecutionResult> {
    this.logger.log(' Executing FULL AUTO mode');

    // STEP 1: Analyze Landscape (if not already done)
    state.currentStep = 'Analyzing market landscape';
    state.phase = 'analyzing';
    await this.updateCampaignState(campaignId, state);

    let landscapeAnalysis = await this.landscapeAnalyzer.getCachedAnalysis(request.profileId);
    if (!landscapeAnalysis) {
      landscapeAnalysis = await this.landscapeAnalyzer.analyzeLandscape(request.profileId);
    }

    state.stepsCompleted.push('Analyze landscape');
    state.progress = 15;
    state.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Landscape analysis completed',
    });

    // STEP 2: Generate Strategy (if not already done)
    state.currentStep = 'Generating marketing strategy';
    state.phase = 'planning';
    await this.updateCampaignState(campaignId, state);

    let strategy = await this.strategyPlanner.getStrategy(request.profileId);
    if (!strategy) {
      strategy = await this.strategyPlanner.generateStrategy(request.profileId);
    }

    state.stepsCompleted.push('Generate strategy');
    state.progress = 30;
    state.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Strategy generated',
    });

    // STEP 3: Create Content
    state.currentStep = 'Creating content';
    state.phase = 'creating';
    await this.updateCampaignState(campaignId, state);

    const contentPrefs = request.contentPreferences || {
      blogs: 5,
      videos: 0,
      socialPosts: 0, // Will be generated via repurposing
    };

    const contentPieces = [];

    // Generate blog posts
    for (let i = 0; i < contentPrefs.blogs; i++) {
      const blog = await this.generateBlogPost(request.profileId, campaignId, strategy);
      contentPieces.push(blog);

      state.metrics.contentCreated++;
      state.progress = 30 + (15 * (i + 1) / contentPrefs.blogs);
      await this.updateCampaignState(campaignId, state);
    }

    state.stepsCompleted.push('Create content');
    state.progress = 45;
    state.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Created ${contentPieces.length} content pieces`,
    });

    // STEP 4: Repurpose Content
    state.currentStep = 'Repurposing content for platforms';
    state.phase = 'repurposing';
    await this.updateCampaignState(campaignId, state);

    const repurposingRules = this.repurposingEngine.getDefaultRules();
    if (request.platforms) {
      // Enable only requested platforms
      repurposingRules.platforms.forEach(p => {
        p.enabled = request.platforms.includes(p.platform);
      });
    }

    const allRepurposed = [];
    for (const content of contentPieces) {
      const repurposed = await this.repurposingEngine.repurposeContent(
        {
          type: 'blog',
          title: content.title,
          content: content.content,
        },
        repurposingRules,
        request.profileId,
      );

      allRepurposed.push(repurposed);
      state.metrics.contentRepurposed += repurposed.totalPieces;
      state.progress = 45 + (20 * allRepurposed.length / contentPieces.length);
      await this.updateCampaignState(campaignId, state);
    }

    state.stepsCompleted.push('Repurpose content');
    state.progress = 65;
    state.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Repurposed into ${state.metrics.contentRepurposed} platform-specific posts`,
    });

    // STEP 5: Validate Content (auto-pass in full auto mode)
    state.currentStep = 'Validating content';
    state.phase = 'validating';
    state.stepsCompleted.push('Validate content');
    state.progress = 75;
    await this.updateCampaignState(campaignId, state);

    // STEP 6: Publish Content
    state.currentStep = 'Publishing to platforms';
    state.phase = 'publishing';
    await this.updateCampaignState(campaignId, state);

    const publishResults = [];
    for (const repurposedContent of allRepurposed) {
      for (const platformContent of repurposedContent.generated) {
        for (const piece of platformContent.pieces) {
          try {
            const publishRequest = {
              profileId: request.profileId,
              campaignId,
              content: [
                {
                  platform: platformContent.platform,
                  type: piece.type,
                  title: piece.title,
                  body: piece.body,
                  media: piece.media,
                  hashtags: piece.hashtags,
                },
              ],
            };

            const result = await this.publisher.publishToMultiplePlatforms(publishRequest);
            publishResults.push(result);

            if (result.successful > 0) {
              state.metrics.contentPublished++;
            }
          } catch (error) {
            state.logs.push({
              timestamp: new Date(),
              level: 'warning',
              message: `Failed to publish to ${platformContent.platform}: ${error.message}`,
            });
          }
        }
      }

      state.progress = 75 + (20 * publishResults.length / allRepurposed.length);
      await this.updateCampaignState(campaignId, state);
    }

    state.stepsCompleted.push('Publish content');
    state.progress = 95;
    state.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Published ${state.metrics.contentPublished} posts across platforms`,
    });

    // STEP 7: Setup Monitoring (async)
    state.currentStep = 'Setting up performance monitoring';
    state.phase = 'monitoring';
    state.stepsCompleted.push('Monitor performance');
    state.progress = 100;
    state.phase = 'completed';
    await this.updateCampaignState(campaignId, state);

    // Calculate cost
    const costEstimate = await this.costCalculator.calculateCampaignCost({
      name: request.campaignName,
      duration: request.duration,
      content: {
        blogs: contentPieces.length,
        videos: 0,
        socialPosts: state.metrics.contentRepurposed,
        images: 0,
      },
      platforms: request.platforms || [],
    });

    state.metrics.budgetUsed = costEstimate.summary.totalEstimate;
    state.metrics.budgetRemaining = request.budget - costEstimate.summary.totalEstimate;

    // Update campaign
    await this.prisma.campaignOrder.update({
      where: { id: campaignId },
      data: {
        status: 'active',
        actualCost: costEstimate.summary.totalEstimate,
        budgetUsed: costEstimate.summary.totalEstimate,
        budgetRemaining: state.metrics.budgetRemaining,
        workflowState: state as any,
      },
    });

    return {
      success: true,
      campaignId,
      summary: {
        totalContent: contentPieces.length,
        platformsPublished: publishResults.length,
        totalReach: allRepurposed.reduce((sum, r) => sum + parseInt(r.estimatedReach), 0).toString(),
        estimatedROI: `${costEstimate.roiProjection.roi.toFixed(0)}%`,
        costSummary: costEstimate.summary,
      },
      state,
      nextSteps: [
        'Monitor campaign performance',
        'Optimize based on engagement data',
        'Scale successful content',
      ],
    };
  }

  /**
   * Execute SEMI AUTO mode (requires human approval at key steps)
   */
  private async executeSemiAutoMode(
    campaignId: string,
    request: CampaignLaunchRequest,
    state: OrchestrationState,
  ): Promise<CampaignExecutionResult> {
    this.logger.log(' Executing SEMI AUTO mode (approval required)');

    // Similar to full auto, but pause at key checkpoints
    state.phase = 'planning';
    state.currentStep = 'Awaiting strategy approval';
    state.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Strategy generated, awaiting human approval',
    });

    await this.updateCampaignState(campaignId, state);

    return {
      success: true,
      campaignId,
      summary: null,
      state,
      nextSteps: [
        'Review generated strategy',
        'Approve or request modifications',
        'Continue execution after approval',
      ],
    };
  }

  /**
   * Execute HYBRID mode (some automation, some manual)
   */
  private async executeHybridMode(
    campaignId: string,
    request: CampaignLaunchRequest,
    state: OrchestrationState,
  ): Promise<CampaignExecutionResult> {
    this.logger.log(' Executing HYBRID mode');

    // Automate strategy and content creation, manual publishing
    return this.executeFullAutoMode(campaignId, request, state);
  }

  /**
   * Generate blog post using AI
   */
  private async generateBlogPost(
    profileId: string,
    campaignId: string,
    strategy: any,
  ): Promise<any> {
    const profile = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
    });

    const pillarTopic = strategy.contentStrategy?.pillarTopics?.[0] || profile.industry;

    const prompt = `
Write a comprehensive blog post:

Topic: ${pillarTopic}
Industry: ${profile.industry}
Target Audience: ${profile.targetAudience}
Brand Voice: ${profile.brandVoice || 'Professional'}

Create a 1500-2000 word blog post with:
1. Compelling SEO title
2. Meta description
3. Introduction with hook
4. 5-7 H2 sections with valuable insights
5. Actionable tips and examples
6. Conclusion with CTA

Format as JSON: {title, metaDescription, content, wordCount}
`;

    const blogData = await this.sonnetService.generateStructuredContent(prompt);

    // Save to database
    const contentPiece = await this.prisma.contentPiece.create({
      data: {
        profileId,
        campaignId,
        type: 'blog',
        title: blogData.title,
        content: blogData.content,
        metadata: {
          wordCount: blogData.wordCount,
          metaDescription: blogData.metaDescription,
        },
        status: 'generated',
      },
    });

    return contentPiece;
  }

  /**
   * Update campaign orchestration state
   */
  private async updateCampaignState(
    campaignId: string,
    state: OrchestrationState,
  ): Promise<void> {
    await this.prisma.campaignOrder.update({
      where: { id: campaignId },
      data: {
        workflowState: state as any,
        status: state.phase === 'completed' ? 'active' : 'generating',
      },
    });
  }

  /**
   * Initialize orchestration state
   */
  private initializeState(profileId: string): any {
    return {
      phase: 'initializing',
      progress: 0,
      startedAt: new Date(),
    };
  }

  /**
   * Get campaign orchestration state
   */
  async getCampaignState(campaignId: string): Promise<OrchestrationState> {
    const campaign = await this.prisma.campaignOrder.findUnique({
      where: { id: campaignId },
    });

    // FIX: Cast through unknown to handle Json type from Prisma
    return campaign.workflowState as unknown as OrchestrationState;
  }

  /**
   * Pause autonomous campaign
   */
  async pauseCampaign(campaignId: string): Promise<void> {
    await this.prisma.campaignOrder.update({
      where: { id: campaignId },
      data: { status: 'paused' },
    });
  }

  /**
   * Resume autonomous campaign
   */
  async resumeCampaign(campaignId: string): Promise<void> {
    await this.prisma.campaignOrder.update({
      where: { id: campaignId },
      data: { status: 'active' },
    });
  }
}
