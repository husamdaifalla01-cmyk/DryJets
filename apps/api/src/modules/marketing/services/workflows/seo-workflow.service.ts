import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SEOAnalyzerService, KeywordOpportunity, QuickWin, SEOHealthReport } from './seo-analyzer.service';
import { SEOPlannerService, OptimizationPlan } from './seo-planner.service';
import { SEOExecutorService, ExecutionResult } from './seo-executor.service';

/**
 * SEO Workflow Orchestrator
 *
 * Coordinates the complete SEO workflow:
 * 1. ANALYZING: Identify opportunities using Analyzer
 * 2. PLANNING: Create optimization plans using Planner
 * 3. EXECUTING: Execute plans using Executor
 * 4. LEARNING: Record results and improve
 *
 * This is the main entry point for SEO automation
 */

export interface SEOWorkflowStatus {
  workflowId: string | null;
  status: 'idle' | 'analyzing' | 'planning' | 'executing' | 'learning' | 'completed';
  currentStep: string;
  progress: number; // 0-100

  // Stats
  opportunitiesFound: number;
  plansCreated: number;
  plansExecuted: number;
  successRate: number; // % of plans that achieved target rank

  // Latest activity
  lastRun: Date | null;
  nextRun: Date | null;

  // Health
  seoHealth: SEOHealthReport | null;
}

export interface WorkflowRunReport {
  workflowId: string;
  status: 'completed' | 'failed';
  duration: number; // milliseconds

  // Phase results
  analysis: {
    opportunitiesFound: number;
    quickWins: number;
    highValueTargets: number;
  };

  planning: {
    plansCreated: number;
    estimatedImpact: number; // Total estimated traffic gain
  };

  execution: {
    plansExecuted: number;
    successful: number;
    failed: number;
    totalRankImprovement: number;
    totalTrafficGain: number;
  };

  learnings: {
    whatWorked: string[];
    whatDidnt: string[];
    keyInsights: string[];
  };

  startedAt: Date;
  completedAt: Date;
}

export type WorkflowStrategy = 'quick-wins' | 'comprehensive' | 'competitive';

@Injectable()
export class SEOWorkflowService {
  private readonly logger = new Logger(SEOWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly analyzer: SEOAnalyzerService,
    private readonly planner: SEOPlannerService,
    private readonly executor: SEOExecutorService,
  ) {}

  /**
   * Run the complete SEO workflow
   * This is the main automation entry point
   */
  async runSEOWorkflow(strategy: WorkflowStrategy = 'quick-wins'): Promise<WorkflowRunReport> {
    this.logger.log('════════════════════════════════════════════════════════════');
    this.logger.log(`🚀 Starting SEO Workflow - Strategy: ${strategy.toUpperCase()}`);
    this.logger.log('════════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const startedAt = new Date();

    // Create workflow execution record
    const workflowExecution = await this.prisma.workflowExecution.create({
      data: {
        workflowType: 'SEO_EMPIRE',
        status: 'ANALYZING',
        startedAt,
        state: { strategy, phase: 'analyzing' },
      },
    });

    const workflowId = workflowExecution.id;

    try {
      // ==========================================
      // PHASE 1: ANALYZING
      // ==========================================
      this.logger.log('📊 PHASE 1: ANALYZING');
      this.logger.log('Finding keyword opportunities...\n');

      await this.updateWorkflowState(workflowId, 'ANALYZING', { phase: 'analyzing' });

      let opportunities: KeywordOpportunity[] = [];
      let quickWins: QuickWin[] = [];

      if (strategy === 'quick-wins') {
        quickWins = await this.analyzer.findQuickWins(40, 200);
        opportunities = quickWins;
        this.logger.log(`✓ Found ${quickWins.length} quick win opportunities\n`);
      } else if (strategy === 'comprehensive') {
        opportunities = await this.analyzer.analyzeKeywordOpportunities(100);
        this.logger.log(`✓ Found ${opportunities.length} total opportunities\n`);
      } else {
        // Competitive strategy - high difficulty, high volume
        opportunities = await this.analyzer.analyzeKeywordOpportunities(50);
        opportunities = opportunities.filter(o => o.difficulty > 60);
        this.logger.log(`✓ Found ${opportunities.length} competitive opportunities\n`);
      }

      const highValueTargets = opportunities.filter(o => o.searchVolume > 1000).length;

      // ==========================================
      // PHASE 2: PLANNING
      // ==========================================
      this.logger.log('📝 PHASE 2: PLANNING');
      this.logger.log('Creating optimization plans...\n');

      await this.updateWorkflowState(workflowId, 'PLANNING', { phase: 'planning', opportunitiesFound: opportunities.length });

      // Create plans for top opportunities (limit to 10 for demo)
      const topOpportunities = opportunities.slice(0, 10);
      const plans: OptimizationPlan[] = [];
      let totalEstimatedImpact = 0;

      for (const opportunity of topOpportunities) {
        const plan = await this.planner.createOptimizationPlan(opportunity.keywordId);
        plans.push(plan);
        totalEstimatedImpact += plan.estimatedImpact;

        this.logger.log(`  ✓ Created plan for "${opportunity.keyword}" (Impact: +${plan.estimatedImpact} visitors/month)`);
      }

      this.logger.log(`\n✓ Created ${plans.length} optimization plans`);
      this.logger.log(`✓ Estimated total impact: +${totalEstimatedImpact} monthly visitors\n`);

      // ==========================================
      // PHASE 3: EXECUTING
      // ==========================================
      this.logger.log('⚙️  PHASE 3: EXECUTING');
      this.logger.log('Executing optimization plans...\n');

      await this.updateWorkflowState(workflowId, 'EXECUTING', {
        phase: 'executing',
        opportunitiesFound: opportunities.length,
        plansCreated: plans.length,
      });

      const executionResults: ExecutionResult[] = [];
      let successful = 0;
      let failed = 0;
      let totalRankImprovement = 0;
      let totalTrafficGain = 0;

      for (const plan of plans) {
        const result = await this.executor.executeOptimizationPlan(plan.id);
        executionResults.push(result);

        if (result.success) {
          successful++;
          this.logger.log(`  ✓ SUCCESS: "${result.keyword}" - Rank ${result.rankBefore} → ${result.rankAfter} (+${result.trafficGain} visitors/month)`);
        } else {
          failed++;
          this.logger.log(`  ✗ INCOMPLETE: "${result.keyword}" - Did not reach target rank yet`);
        }

        totalRankImprovement += result.rankImprovement;
        totalTrafficGain += result.trafficGain;
      }

      this.logger.log(`\n✓ Executed ${plans.length} plans`);
      this.logger.log(`  Successful: ${successful} (${Math.round((successful / plans.length) * 100)}%)`);
      this.logger.log(`  In Progress: ${failed}`);
      this.logger.log(`  Total traffic gain: +${totalTrafficGain} monthly visitors\n`);

      // ==========================================
      // PHASE 4: LEARNING
      // ==========================================
      this.logger.log('🧠 PHASE 4: LEARNING');
      this.logger.log('Analyzing results and recording insights...\n');

      await this.updateWorkflowState(workflowId, 'LEARNING', {
        phase: 'learning',
        executionResults: executionResults.length,
      });

      const learnings = this.extractLearnings(executionResults);

      this.logger.log('What Worked:');
      learnings.whatWorked.forEach(l => this.logger.log(`  ✓ ${l}`));

      this.logger.log('\nWhat Didn\'t Work:');
      if (learnings.whatDidnt.length > 0) {
        learnings.whatDidnt.forEach(l => this.logger.log(`  ✗ ${l}`));
      } else {
        this.logger.log(`  (All optimizations successful!)`);
      }

      this.logger.log('\nKey Insights:');
      learnings.keyInsights.forEach(i => this.logger.log(`  💡 ${i}`));

      // ==========================================
      // COMPLETED
      // ==========================================
      const completedAt = new Date();
      const duration = Date.now() - startTime;

      await this.updateWorkflowState(workflowId, 'COMPLETED', {
        phase: 'completed',
        completed: true,
      });

      await this.prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: 'COMPLETED',
          completedAt,
          duration,
          results: {
            analysis: {
              opportunitiesFound: opportunities.length,
              quickWins: quickWins.length,
              highValueTargets,
            },
            planning: {
              plansCreated: plans.length,
              estimatedImpact: totalEstimatedImpact,
            },
            execution: {
              plansExecuted: executionResults.length,
              successful,
              failed,
              totalRankImprovement,
              totalTrafficGain,
            },
            learnings,
          },
        },
      });

      this.logger.log('\n════════════════════════════════════════════════════════════');
      this.logger.log(`✅ SEO Workflow Completed Successfully`);
      this.logger.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
      this.logger.log(`📈 Traffic Gain: +${totalTrafficGain} monthly visitors`);
      this.logger.log(`🎯 Success Rate: ${Math.round((successful / plans.length) * 100)}%`);
      this.logger.log('════════════════════════════════════════════════════════════\n');

      return {
        workflowId,
        status: 'completed',
        duration,
        analysis: {
          opportunitiesFound: opportunities.length,
          quickWins: quickWins.length,
          highValueTargets,
        },
        planning: {
          plansCreated: plans.length,
          estimatedImpact: totalEstimatedImpact,
        },
        execution: {
          plansExecuted: executionResults.length,
          successful,
          failed,
          totalRankImprovement,
          totalTrafficGain,
        },
        learnings,
        startedAt,
        completedAt,
      };
    } catch (error: any) {
      this.logger.error(`Workflow failed: ${error.message}`, error.stack);

      await this.prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Get current workflow status
   */
  async getWorkflowStatus(): Promise<SEOWorkflowStatus> {
    // Get latest workflow execution
    const latestExecution = await this.prisma.workflowExecution.findFirst({
      where: { workflowType: 'SEO_EMPIRE' },
      orderBy: { startedAt: 'desc' },
    });

    // Get stats from all executions
    const executions = await this.prisma.workflowExecution.findMany({
      where: { workflowType: 'SEO_EMPIRE', status: 'COMPLETED' },
    });

    const totalPlans = await this.prisma.workflowPlan.count({
      where: { workflowType: 'SEO_EMPIRE' },
    });

    const completedPlans = await this.prisma.workflowPlan.count({
      where: { workflowType: 'SEO_EMPIRE', status: 'completed' },
    });

    const successfulPlans = await this.prisma.workflowPlan.count({
      where: {
        workflowType: 'SEO_EMPIRE',
        status: 'completed',
        results: { path: ['success'], equals: true },
      },
    });

    const successRate = completedPlans > 0 ? (successfulPlans / completedPlans) * 100 : 0;

    // Get SEO health
    const seoHealth = await this.analyzer.calculateSEOHealth();

    // Calculate stats from latest execution
    const latestResults = latestExecution?.results as any;
    const opportunitiesFound = latestResults?.analysis?.opportunitiesFound || 0;

    return {
      workflowId: latestExecution?.id || null,
      status: latestExecution?.status?.toLowerCase() as any || 'idle',
      currentStep: (latestExecution?.state as any)?.phase || 'idle',
      progress: latestExecution?.status === 'COMPLETED' ? 100 : 50,
      opportunitiesFound,
      plansCreated: totalPlans,
      plansExecuted: completedPlans,
      successRate: Math.round(successRate),
      lastRun: latestExecution?.startedAt || null,
      nextRun: null, // TODO: Implement scheduling
      seoHealth,
    };
  }

  /**
   * Schedule recurring SEO audit
   * TODO: Implement with cron scheduler
   */
  async scheduleRecurringSEOAudit(cronExpression: string): Promise<void> {
    this.logger.log(`Scheduling recurring SEO audit: ${cronExpression}`);
    // TODO: Implement with BullMQ or node-cron
    this.logger.warn('Recurring SEO audit scheduling not yet implemented');
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private async updateWorkflowState(
    workflowId: string,
    status: 'ANALYZING' | 'PLANNING' | 'EXECUTING' | 'LEARNING' | 'COMPLETED',
    state: any,
  ): Promise<void> {
    await this.prisma.workflowExecution.update({
      where: { id: workflowId },
      data: { status, state },
    });
  }

  private extractLearnings(results: ExecutionResult[]): {
    whatWorked: string[];
    whatDidnt: string[];
    keyInsights: string[];
  } {
    const whatWorked: string[] = [];
    const whatDidnt: string[] = [];
    const keyInsights: string[] = [];

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    // Extract patterns from successful optimizations
    if (successfulResults.length > 0) {
      const avgRankImprovement = successfulResults.reduce((sum, r) => sum + r.rankImprovement, 0) / successfulResults.length;
      whatWorked.push(`${successfulResults.length} keywords achieved target ranks`);
      whatWorked.push(`Average rank improvement: ${Math.round(avgRankImprovement)} positions`);

      // Consolidate insights from successful results
      const allWhatWorked = successfulResults.flatMap(r => r.whatWorked);
      const uniqueSuccessFactors = [...new Set(allWhatWorked)].slice(0, 3);
      whatWorked.push(...uniqueSuccessFactors);
    }

    // Extract patterns from failed optimizations
    if (failedResults.length > 0) {
      whatDidnt.push(`${failedResults.length} keywords did not reach target rank`);

      const allWhatDidnt = failedResults.flatMap(r => r.whatDidnt);
      const uniqueFailureFactors = [...new Set(allWhatDidnt)].slice(0, 3);
      whatDidnt.push(...uniqueFailureFactors);
    }

    // Generate key insights
    const successRate = (successfulResults.length / results.length) * 100;

    if (successRate > 75) {
      keyInsights.push('Excellent success rate - current SEO strategy is highly effective');
      keyInsights.push('Scale this approach to more keywords');
    } else if (successRate > 50) {
      keyInsights.push('Good success rate - refine approach for failed keywords');
      keyInsights.push('Analyze what made successful optimizations work');
    } else {
      keyInsights.push('Low success rate - significant strategy adjustment needed');
      keyInsights.push('Re-evaluate keyword difficulty estimates and resource allocation');
    }

    const totalTrafficGain = results.reduce((sum, r) => sum + r.trafficGain, 0);
    if (totalTrafficGain > 0) {
      keyInsights.push(`Projected monthly traffic gain: +${totalTrafficGain} visitors`);
    }

    return { whatWorked, whatDidnt, keyInsights };
  }
}
