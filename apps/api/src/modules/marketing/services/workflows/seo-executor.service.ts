import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * SEO Executor Service
 *
 * Executes SEO optimization plans:
 * - Runs optimization plans step-by-step
 * - Updates keyword targets and tracking
 * - Records results and learnings
 * - Manages plan execution state
 */

export interface ExecutionResult {
  planId: string;
  keywordId: string;
  keyword: string;

  // Execution status
  status: 'in-progress' | 'completed' | 'failed';
  completedSteps: number;
  totalSteps: number;
  progress: number; // 0-100

  // Results
  rankBefore: number | null;
  rankAfter: number | null;
  rankImprovement: number;
  trafficGain: number;
  success: boolean;

  // Learnings
  whatWorked: string[];
  whatDidnt: string[];
  insights: string[];

  // Timing
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null; // milliseconds
}

export interface OptimizationUpdate {
  keywordId: string;
  newRank?: number;
  newTraffic?: number;
  notes?: string;
}

export interface Learning {
  id: string;
  keywordId: string;
  keyword: string;
  whatWorked: string;
  whatDidnt: string;
  confidence: number;
  aiInsights: string | null;
  createdAt: Date;
}

@Injectable()
export class SEOExecutorService {
  private readonly logger = new Logger(SEOExecutorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute an optimization plan
   * In a real system, this would integrate with content management and link building tools
   * For now, it simulates execution and tracks progress
   */
  async executeOptimizationPlan(planId: string): Promise<ExecutionResult> {
    this.logger.log(`Executing optimization plan: ${planId}`);

    // Get the plan
    const plan = await this.prisma.workflowPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    if (plan.status === 'completed') {
      throw new Error(`Plan already completed: ${planId}`);
    }

    // Get keyword data
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: plan.targetId! },
      select: {
        id: true,
        keyword: true,
        currentRank: true,
        searchVolume: true,
      },
    });

    if (!keyword) {
      throw new Error(`Keyword not found: ${plan.targetId}`);
    }

    const startTime = Date.now();
    const rankBefore = keyword.currentRank;

    // Update plan status to in-progress
    await this.prisma.workflowPlan.update({
      where: { id: planId },
      data: {
        status: 'in-progress',
        executedAt: new Date(),
      },
    });

    // Execute the plan actions
    // In production, this would:
    // 1. Create/update content
    // 2. Optimize technical SEO
    // 3. Build backlinks
    // 4. Track progress over time

    // For now, we'll simulate execution and mark plan as completed
    const planData = plan.plan as any;
    const totalSteps = planData.actions?.length || 0;

    this.logger.log(`Simulating execution of ${totalSteps} steps...`);
    this.logger.log(`Plan strategy: ${planData.strategy}`);
    this.logger.log(`Target keyword: "${keyword.keyword}"`);

    // Simulate execution (in production, this would be a long-running background job)
    // For demo purposes, mark as completed immediately with simulated results

    // Simulate rank improvement based on difficulty
    const targetRank = planData.successMetrics?.targetRank || 10;
    const rankAfter = this.simulateRankImprovement(rankBefore, targetRank);
    const rankImprovement = rankBefore && rankAfter ? rankBefore - rankAfter : 0;
    const trafficGain = this.calculateTrafficGain(keyword.searchVolume, rankBefore, rankAfter);
    const success = rankAfter !== null && rankAfter <= targetRank;

    // Generate learnings
    const { whatWorked, whatDidnt, insights } = this.generateLearnings(
      planData,
      rankBefore,
      rankAfter,
      success,
    );

    // Update plan with results
    const completedAt = new Date();
    const duration = Date.now() - startTime;

    await this.prisma.workflowPlan.update({
      where: { id: planId },
      data: {
        status: 'completed',
        completedAt,
        results: {
          rankBefore,
          rankAfter,
          rankImprovement,
          trafficGain,
          success,
          whatWorked,
          whatDidnt,
          insights,
        },
      },
    });

    // Record learning for future optimizations
    if (whatWorked.length > 0 || whatDidnt.length > 0) {
      await this.recordLearning(
        keyword.id,
        whatWorked.join('; '),
        whatDidnt.join('; '),
        success ? 0.8 : 0.5,
      );
    }

    this.logger.log(`Plan execution completed`);
    this.logger.log(`Rank change: ${rankBefore} → ${rankAfter} (${rankImprovement > 0 ? '+' : ''}${rankImprovement})`);
    this.logger.log(`Traffic gain: +${trafficGain} monthly visitors`);

    return {
      planId,
      keywordId: keyword.id,
      keyword: keyword.keyword,
      status: 'completed',
      completedSteps: totalSteps,
      totalSteps,
      progress: 100,
      rankBefore,
      rankAfter,
      rankImprovement,
      trafficGain,
      success,
      whatWorked,
      whatDidnt,
      insights,
      startedAt: plan.executedAt!,
      completedAt,
      duration,
    };
  }

  /**
   * Update keyword target (used when adjusting strategy mid-execution)
   */
  async updateKeywordTarget(keywordId: string, targetRank: number): Promise<void> {
    this.logger.log(`Updating target rank for keyword ${keywordId}: ${targetRank}`);

    // Update any pending plans for this keyword
    const pendingPlans = await this.prisma.workflowPlan.findMany({
      where: {
        targetId: keywordId,
        status: { in: ['pending', 'in-progress'] },
        workflowType: 'SEO_EMPIRE',
      },
    });

    for (const plan of pendingPlans) {
      const planData = plan.plan as any;
      planData.successMetrics.targetRank = targetRank;

      await this.prisma.workflowPlan.update({
        where: { id: plan.id },
        data: { plan: planData },
      });
    }

    this.logger.log(`Updated ${pendingPlans.length} plans with new target rank`);
  }

  /**
   * Track optimization result (used when external rank tracking detects changes)
   */
  async trackOptimizationResult(
    keywordId: string,
    result: OptimizationUpdate,
  ): Promise<void> {
    this.logger.log(`Tracking optimization result for keyword: ${keywordId}`);

    // Update keyword with new data
    const updateData: any = {};

    if (result.newRank !== undefined) {
      updateData.currentRank = result.newRank;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.keyword.update({
        where: { id: keywordId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
    }

    // Find active plans for this keyword and update their results
    const activePlans = await this.prisma.workflowPlan.findMany({
      where: {
        targetId: keywordId,
        status: 'in-progress',
        workflowType: 'SEO_EMPIRE',
      },
    });

    for (const plan of activePlans) {
      const currentResults = (plan.results as any) || {};
      currentResults.latestRank = result.newRank;
      currentResults.lastUpdated = new Date();
      currentResults.notes = result.notes;

      await this.prisma.workflowPlan.update({
        where: { id: plan.id },
        data: { results: currentResults },
      });
    }

    this.logger.log(`Tracked result for ${activePlans.length} active plans`);
  }

  /**
   * Record learning from optimization execution
   */
  async recordLearning(
    keywordId: string,
    whatWorked: string,
    whatDidnt: string,
    confidence: number = 0.5,
  ): Promise<Learning> {
    this.logger.log(`Recording learning for keyword: ${keywordId}`);

    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      select: { keyword: true },
    });

    if (!keyword) {
      throw new Error(`Keyword not found: ${keywordId}`);
    }

    // Generate AI insights (in production, this would use ML to analyze patterns)
    const aiInsights = this.generateAIInsights(whatWorked, whatDidnt, confidence);

    const learning = await this.prisma.workflowLearning.create({
      data: {
        workflowType: 'SEO_EMPIRE',
        entityId: keywordId,
        entityType: 'keyword',
        whatWorked,
        whatDidnt,
        confidence,
        aiInsights,
      },
    });

    this.logger.log(`Learning recorded: ${learning.id}`);

    return {
      id: learning.id,
      keywordId,
      keyword: keyword.keyword,
      whatWorked,
      whatDidnt,
      confidence,
      aiInsights,
      createdAt: learning.createdAt,
    };
  }

  /**
   * Get all learnings for a keyword
   */
  async getLearnings(keywordId: string): Promise<Learning[]> {
    const learnings = await this.prisma.workflowLearning.findMany({
      where: {
        entityId: keywordId,
        entityType: 'keyword',
        workflowType: 'SEO_EMPIRE',
      },
      orderBy: { createdAt: 'desc' },
    });

    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      select: { keyword: true },
    });

    return learnings.map(l => ({
      id: l.id,
      keywordId,
      keyword: keyword?.keyword || '',
      whatWorked: l.whatWorked,
      whatDidnt: l.whatDidnt,
      confidence: l.confidence,
      aiInsights: l.aiInsights,
      createdAt: l.createdAt,
    }));
  }

  /**
   * Get optimization history for a keyword
   */
  async getOptimizationHistory(keywordId: string): Promise<ExecutionResult[]> {
    const plans = await this.prisma.workflowPlan.findMany({
      where: {
        targetId: keywordId,
        workflowType: 'SEO_EMPIRE',
        status: { in: ['in-progress', 'completed'] },
      },
      orderBy: { executedAt: 'desc' },
    });

    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      select: { keyword: true },
    });

    return plans.map(plan => {
      const planData = plan.plan as any;
      const results = plan.results as any;

      return {
        planId: plan.id,
        keywordId,
        keyword: keyword?.keyword || '',
        status: plan.status as 'in-progress' | 'completed' | 'failed',
        completedSteps: planData.actions?.filter((a: any) => a.status === 'completed').length || 0,
        totalSteps: planData.actions?.length || 0,
        progress: plan.status === 'completed' ? 100 : 50,
        rankBefore: results?.rankBefore || null,
        rankAfter: results?.rankAfter || null,
        rankImprovement: results?.rankImprovement || 0,
        trafficGain: results?.trafficGain || 0,
        success: results?.success || false,
        whatWorked: results?.whatWorked || [],
        whatDidnt: results?.whatDidnt || [],
        insights: results?.insights || [],
        startedAt: plan.executedAt || plan.createdAt,
        completedAt: plan.completedAt,
        duration: plan.completedAt
          ? plan.completedAt.getTime() - (plan.executedAt?.getTime() || plan.createdAt.getTime())
          : null,
      };
    });
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private simulateRankImprovement(
    currentRank: number | null,
    targetRank: number,
  ): number | null {
    // Simulate rank improvement for demo purposes
    // In production, this would be actual rank tracking data

    if (!currentRank) {
      // Not ranking yet - simulate achieving a position between target and 2x target
      const variance = Math.floor(Math.random() * targetRank);
      return targetRank + variance;
    }

    // Already ranking - simulate moving closer to target
    const improvement = Math.floor((currentRank - targetRank) * 0.6); // 60% improvement
    const newRank = Math.max(targetRank, currentRank - improvement);

    return newRank;
  }

  private calculateTrafficGain(
    searchVolume: number,
    rankBefore: number | null,
    rankAfter: number | null,
  ): number {
    const ctrBefore = rankBefore ? this.getCTR(rankBefore) : 0;
    const ctrAfter = rankAfter ? this.getCTR(rankAfter) : 0;

    const trafficBefore = searchVolume * ctrBefore;
    const trafficAfter = searchVolume * ctrAfter;

    return Math.round(trafficAfter - trafficBefore);
  }

  private getCTR(rank: number): number {
    const ctrMap: Record<number, number> = {
      1: 0.285,
      2: 0.157,
      3: 0.11,
      4: 0.08,
      5: 0.08,
      6: 0.05,
      7: 0.05,
      8: 0.05,
      9: 0.05,
      10: 0.05,
    };

    return ctrMap[rank] || (rank <= 20 ? 0.02 : rank <= 50 ? 0.01 : 0.005);
  }

  private generateLearnings(
    planData: any,
    rankBefore: number | null,
    rankAfter: number | null,
    success: boolean,
  ): { whatWorked: string[]; whatDidnt: string[]; insights: string[] } {
    const whatWorked: string[] = [];
    const whatDidnt: string[] = [];
    const insights: string[] = [];

    if (success) {
      // What worked
      if (planData.strategy === 'quick-win') {
        whatWorked.push('Quick-win strategy was effective for this low-difficulty keyword');
        whatWorked.push('Focus on content quality and on-page optimization paid off');
      } else if (planData.strategy === 'long-term') {
        whatWorked.push('Comprehensive content and link building strategy drove results');
        whatWorked.push('Patient, sustained effort over time was key');
      } else {
        whatWorked.push('Aggressive link building and authority-building tactics were necessary');
        whatWorked.push('High-quality, in-depth content outperformed competitors');
      }

      insights.push('Continue applying this strategy to similar keywords');
      insights.push('Consider scaling this approach to related keyword clusters');
    } else {
      // What didn't work
      whatDidnt.push('Plan execution did not achieve target rank');

      if (rankBefore && rankAfter && rankAfter > rankBefore) {
        whatDidnt.push('Rank actually declined - may need to audit for issues');
        insights.push('CRITICAL: Investigate technical SEO issues and competitors');
      } else if (rankBefore && rankAfter && rankAfter === rankBefore) {
        whatDidnt.push('No rank movement - insufficient optimization effort');
        insights.push('Consider increasing content depth and link building efforts');
      } else {
        whatDidnt.push('Did not reach target rank within expected timeline');
        insights.push('Re-evaluate difficulty estimate or extend timeline');
      }
    }

    return { whatWorked, whatDidnt, insights };
  }

  private generateAIInsights(
    whatWorked: string,
    whatDidnt: string,
    confidence: number,
  ): string {
    // In production, this would use ML to identify patterns across many optimizations
    // For now, generate basic insights based on confidence level

    if (confidence > 0.7) {
      return `High confidence (${Math.round(confidence * 100)}%): This optimization approach has proven effective. Replicate for similar keywords. Success factors: ${whatWorked.slice(0, 100)}...`;
    } else if (confidence > 0.5) {
      return `Medium confidence (${Math.round(confidence * 100)}%): Results were mixed. Refine approach before scaling. Consider: ${whatDidnt.slice(0, 100)}...`;
    } else {
      return `Low confidence (${Math.round(confidence * 100)}%): Optimization was not successful. Avoid this approach for similar keywords. Issues: ${whatDidnt.slice(0, 100)}...`;
    }
  }
}
