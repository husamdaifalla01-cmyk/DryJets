import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { TrendDetectorService, TrendOpportunity, ViralOpportunity, TimeSensitiveTrend } from './trend-detector.service';
import { ContentStrategistService, ContentBrief, PrioritizedContent } from './content-strategist.service';
import { ContentProducerService, ContentDraft, QualityReport, PublishingPlan, PerformanceReport } from './content-producer.service';

/**
 * Trend Content Workflow Orchestrator
 *
 * Coordinates the complete trend-to-content workflow:
 * 1. DETECTING: Identify trending topics using Trend Detector
 * 2. STRATEGIZING: Generate content briefs using Content Strategist
 * 3. PRODUCING: Create and optimize content using Content Producer
 * 4. PUBLISHING: Execute publishing plan
 * 5. TRACKING: Monitor performance and learn
 *
 * This workflow capitalizes on trending topics to create viral content
 */

export interface TrendContentWorkflowStatus {
  workflowId: string | null;
  status: 'idle' | 'detecting' | 'strategizing' | 'producing' | 'publishing' | 'tracking' | 'completed';
  currentStep: string;
  progress: number; // 0-100

  // Stats
  trendsDetected: number;
  briefsCreated: number;
  draftsProduced: number;
  contentPublished: number;

  // Performance
  avgViralScore: number;
  avgQualityScore: number;
  totalReach: number;

  // Latest activity
  lastRun: Date | null;
  nextRun: Date | null;
}

export interface TrendContentWorkflowReport {
  workflowId: string;
  status: 'completed' | 'failed';
  duration: number; // milliseconds

  // Phase results
  detection: {
    trendsAnalyzed: number;
    opportunitiesFound: number;
    viralOpportunities: number;
    timeSensitiveAlerts: number;
  };

  strategy: {
    briefsCreated: number;
    totalEstimatedReach: number;
    avgPriorityScore: number;
    topContentPieces: string[];
  };

  production: {
    draftsCreated: number;
    avgQualityScore: number;
    readyToPublish: number;
    needsRevision: number;
  };

  publishing: {
    contentPublished: number;
    channels: string[];
    totalDistributionSteps: number;
  };

  tracking: {
    contentTracked: number;
    avgPerformance: number;
    topPerformers: string[];
  };

  // Overall impact
  impact: {
    estimatedTotalReach: number;
    estimatedTotalEngagement: number;
    estimatedConversions: number;
    estimatedRevenue: number;
  };

  // Learnings
  learnings: {
    whatWorked: string[];
    whatDidnt: string[];
    keyInsights: string[];
  };

  startedAt: Date;
  completedAt: Date;
}

export type TrendContentStrategy = 'viral-first' | 'evergreen-first' | 'conversion-first' | 'balanced';

@Injectable()
export class TrendContentWorkflowService {
  private readonly logger = new Logger(TrendContentWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trendDetector: TrendDetectorService,
    private readonly contentStrategist: ContentStrategistService,
    private readonly contentProducer: ContentProducerService,
  ) {}

  /**
   * Run the complete Trend Content workflow
   * This is the main automation entry point
   */
  async runTrendContentWorkflow(
    strategy: TrendContentStrategy = 'viral-first',
    limit: number = 10,
  ): Promise<TrendContentWorkflowReport> {
    this.logger.log('════════════════════════════════════════════════════════════');
    this.logger.log(`🚀 Starting Trend Content Workflow - Strategy: ${strategy.toUpperCase()}`);
    this.logger.log('════════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const startedAt = new Date();

    // Create workflow execution record
    const workflowExecution = await this.prisma.workflowExecution.create({
      data: {
        workflowType: 'TREND_CONTENT',
        status: 'ANALYZING',
        startedAt,
        state: { strategy, phase: 'detecting' },
      },
    });

    const workflowId = workflowExecution.id;

    try {
      // ==========================================
      // PHASE 1: DETECTING
      // ==========================================
      this.logger.log('🔍 PHASE 1: DETECTING TRENDS');
      this.logger.log('Scanning trend universe for content opportunities...\n');

      await this.updateWorkflowState(workflowId, 'ANALYZING', { phase: 'detecting' });

      // Detect emerging trends
      const emergingTrends = await this.trendDetector.detectEmergingTrends(70, 20);
      this.logger.log(`  ✓ Found ${emergingTrends.length} emerging trends`);

      // Find viral opportunities
      const viralOpportunities = await this.trendDetector.findViralOpportunities(80);
      this.logger.log(`  ✓ Found ${viralOpportunities.length} viral opportunities`);

      // Check for time-sensitive trends
      const timeSensitive = await this.trendDetector.alertTimeSensitiveTrends();
      this.logger.log(`  ✓ Identified ${timeSensitive.length} time-sensitive trends\n`);

      // Combine opportunities based on strategy
      let opportunities: TrendOpportunity[] = [];
      if (strategy === 'viral-first') {
        opportunities = [...viralOpportunities, ...emergingTrends];
      } else {
        opportunities = [...emergingTrends, ...viralOpportunities];
      }

      // Deduplicate and limit
      const uniqueOpportunities = this.deduplicateOpportunities(opportunities).slice(0, limit);

      this.logger.log(`📊 Detection Summary:`);
      this.logger.log(`  Total trends analyzed: ${emergingTrends.length + viralOpportunities.length}`);
      this.logger.log(`  Opportunities selected: ${uniqueOpportunities.length}`);
      this.logger.log(`  Time-sensitive alerts: ${timeSensitive.length}\n`);

      // ==========================================
      // PHASE 2: STRATEGIZING
      // ==========================================
      this.logger.log('📝 PHASE 2: CONTENT STRATEGY');
      this.logger.log('Creating content briefs from trend opportunities...\n');

      await this.updateWorkflowState(workflowId, 'PLANNING', {
        phase: 'strategizing',
        trendsDetected: uniqueOpportunities.length,
      });

      const briefs: ContentBrief[] = [];
      let totalEstimatedReach = 0;

      for (const opportunity of uniqueOpportunities) {
        // Generate content ideas
        const ideas = await this.contentStrategist.generateContentIdeas(opportunity.trendId, 1);

        if (ideas.length === 0) {
          this.logger.warn(`  ⚠ No content ideas for trend: ${opportunity.topic}`);
          continue;
        }

        // Match to keywords for SEO boost
        const keywordMatches = await this.contentStrategist.matchTrendToKeywords(opportunity.trendId, 1);
        const keywordId = keywordMatches.length > 0 ? keywordMatches[0].keywordId : undefined;

        // Create content brief
        const brief = await this.contentStrategist.createContentBrief(
          opportunity.trendId,
          ideas[0].angle,
          keywordId,
        );

        briefs.push(brief);
        totalEstimatedReach += brief.estimatedImpact;

        this.logger.log(`  ✓ Brief: "${brief.title}"`);
        this.logger.log(`    Format: ${brief.format}, Priority: ${brief.priority}, Impact: ${brief.estimatedImpact}`);
      }

      const avgPriorityScore = briefs.length > 0
        ? Math.round(briefs.reduce((sum, b) => sum + b.priority, 0) / briefs.length)
        : 0;

      this.logger.log(`\n📊 Strategy Summary:`);
      this.logger.log(`  Briefs created: ${briefs.length}`);
      this.logger.log(`  Avg priority score: ${avgPriorityScore}/100`);
      this.logger.log(`  Estimated total reach: ${totalEstimatedReach.toLocaleString()}\n`);

      // ==========================================
      // PHASE 3: PRODUCING
      // ==========================================
      this.logger.log('⚙️  PHASE 3: CONTENT PRODUCTION');
      this.logger.log('Generating and optimizing content drafts...\n');

      await this.updateWorkflowState(workflowId, 'EXECUTING', {
        phase: 'producing',
        briefsCreated: briefs.length,
      });

      const drafts: ContentDraft[] = [];
      const qualityReports: QualityReport[] = [];
      let readyToPublish = 0;
      let needsRevision = 0;

      for (const brief of briefs) {
        // Generate draft
        let draft = await this.contentProducer.generateDraft(brief);
        this.logger.log(`  ✓ Generated draft: "${draft.title}"`);
        this.logger.log(`    ${draft.wordCount} words, Quality: ${draft.qualityScore}/100`);

        // Check quality
        const qualityReport = await this.contentProducer.checkQuality(draft);
        qualityReports.push(qualityReport);

        // Optimize if needed
        if (qualityReport.seoQuality.score < 80) {
          this.logger.log(`    🔧 Optimizing SEO...`);
          draft = await this.contentProducer.optimizeForSEO(draft);
          this.logger.log(`    ✓ SEO optimized: ${draft.seoScore}/100`);
        }

        if (qualityReport.readyToPublish) {
          readyToPublish++;
          this.logger.log(`    ✅ Ready to publish`);
        } else {
          needsRevision++;
          this.logger.log(`    ⚠ Needs revision: ${qualityReport.recommendations.join(', ')}`);
        }

        drafts.push(draft);
      }

      const avgQualityScore = drafts.length > 0
        ? Math.round(drafts.reduce((sum, d) => sum + d.qualityScore, 0) / drafts.length)
        : 0;

      this.logger.log(`\n📊 Production Summary:`);
      this.logger.log(`  Drafts created: ${drafts.length}`);
      this.logger.log(`  Avg quality score: ${avgQualityScore}/100`);
      this.logger.log(`  Ready to publish: ${readyToPublish}`);
      this.logger.log(`  Needs revision: ${needsRevision}\n`);

      // ==========================================
      // PHASE 4: PUBLISHING
      // ==========================================
      this.logger.log('📤 PHASE 4: PUBLISHING');
      this.logger.log('Publishing content to channels...\n');

      await this.updateWorkflowState(workflowId, 'EXECUTING', {
        phase: 'publishing',
        draftsCreated: drafts.length,
      });

      const publishingPlans: PublishingPlan[] = [];
      let contentPublished = 0;
      const channelsUsed = new Set<string>();
      let totalDistributionSteps = 0;

      // Only publish drafts that are ready
      const readyDrafts = drafts.filter((_, i) => qualityReports[i].readyToPublish);

      for (const draft of readyDrafts) {
        // Get channel info from brief
        const brief = briefs.find(b => b.id === draft.briefId);
        if (!brief) continue;

        // Create publishing plan
        const scheduledDate = new Date();
        const plan = await this.contentProducer.createPublishingPlan(
          draft,
          scheduledDate,
          {
            primary: brief.primaryChannel,
            secondary: brief.secondaryChannels,
          },
        );

        publishingPlans.push(plan);
        channelsUsed.add(plan.primaryChannel);
        plan.secondaryChannels.forEach(c => channelsUsed.add(c));
        totalDistributionSteps += plan.distributionSteps.length;

        // Execute publishing
        this.logger.log(`  📤 Publishing: "${draft.title}"`);
        this.logger.log(`    Primary: ${plan.primaryChannel}`);
        this.logger.log(`    Secondary: ${plan.secondaryChannels.join(', ')}`);

        await this.contentProducer.executePublishing(plan);

        contentPublished++;
        this.logger.log(`    ✅ Published successfully\n`);
      }

      this.logger.log(`📊 Publishing Summary:`);
      this.logger.log(`  Content published: ${contentPublished}`);
      this.logger.log(`  Channels used: ${Array.from(channelsUsed).join(', ')}`);
      this.logger.log(`  Total distribution steps: ${totalDistributionSteps}\n`);

      // ==========================================
      // PHASE 5: TRACKING
      // ==========================================
      this.logger.log('📈 PHASE 5: PERFORMANCE TRACKING');
      this.logger.log('Setting up performance monitoring...\n');

      await this.updateWorkflowState(workflowId, 'LEARNING', {
        phase: 'tracking',
        contentPublished,
      });

      // In production, this would track actual performance over time
      // For now, simulate initial performance check
      const performanceReports: PerformanceReport[] = [];

      for (const draft of readyDrafts.slice(0, 3)) {
        const report = await this.contentProducer.trackPerformance(draft.id, 1);
        performanceReports.push(report);

        this.logger.log(`  📊 Performance snapshot: "${draft.title}"`);
        this.logger.log(`    Views: ${report.traffic.views}`);
        this.logger.log(`    Engagement: ${report.engagement.likes + report.engagement.comments + report.engagement.shares}`);
        this.logger.log(`    Status: ${report.performance.overallPerformance}`);
      }

      const avgPerformance = performanceReports.length > 0
        ? performanceReports.reduce((sum, r) => {
            const perf = r.performance.overallPerformance;
            return sum + (perf === 'EXCEEDING' ? 100 : perf === 'MEETING' ? 75 : 50);
          }, 0) / performanceReports.length
        : 0;

      this.logger.log(`\n📊 Tracking Summary:`);
      this.logger.log(`  Content tracked: ${performanceReports.length}`);
      this.logger.log(`  Avg performance: ${Math.round(avgPerformance)}%\n`);

      // ==========================================
      // LEARNINGS & IMPACT
      // ==========================================
      this.logger.log('🧠 ANALYSIS & LEARNINGS');
      this.logger.log('Extracting insights from workflow execution...\n');

      const learnings = this.extractLearnings(
        uniqueOpportunities,
        briefs,
        drafts,
        qualityReports,
        performanceReports,
      );

      const impact = this.calculateImpact(briefs, performanceReports);

      this.logger.log('What Worked:');
      learnings.whatWorked.forEach(l => this.logger.log(`  ✓ ${l}`));

      if (learnings.whatDidnt.length > 0) {
        this.logger.log('\nWhat Didn\'t Work:');
        learnings.whatDidnt.forEach(l => this.logger.log(`  ✗ ${l}`));
      }

      this.logger.log('\nKey Insights:');
      learnings.keyInsights.forEach(i => this.logger.log(`  💡 ${i}`));

      this.logger.log('\n💰 Estimated Impact:');
      this.logger.log(`  Total Reach: ${impact.estimatedTotalReach.toLocaleString()}`);
      this.logger.log(`  Total Engagement: ${impact.estimatedTotalEngagement.toLocaleString()}`);
      this.logger.log(`  Conversions: ${impact.estimatedConversions.toLocaleString()}`);
      this.logger.log(`  Revenue: $${impact.estimatedRevenue.toLocaleString()}`);

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
            detection: {
              trendsAnalyzed: emergingTrends.length + viralOpportunities.length,
              opportunitiesFound: uniqueOpportunities.length,
              viralOpportunities: viralOpportunities.length,
              timeSensitiveAlerts: timeSensitive.length,
            },
            strategy: {
              briefsCreated: briefs.length,
              totalEstimatedReach,
              avgPriorityScore,
              topContentPieces: briefs.slice(0, 3).map(b => b.title),
            },
            production: {
              draftsCreated: drafts.length,
              avgQualityScore,
              readyToPublish,
              needsRevision,
            },
            publishing: {
              contentPublished,
              channels: Array.from(channelsUsed),
              totalDistributionSteps,
            },
            tracking: {
              contentTracked: performanceReports.length,
              avgPerformance: Math.round(avgPerformance),
              topPerformers: performanceReports
                .filter(r => r.performance.overallPerformance === 'EXCEEDING')
                .map(r => r.title)
                .slice(0, 3),
            },
            impact,
            learnings,
          },
        },
      });

      this.logger.log('\n════════════════════════════════════════════════════════════');
      this.logger.log(`✅ Trend Content Workflow Completed Successfully`);
      this.logger.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
      this.logger.log(`📊 Content Published: ${contentPublished} pieces`);
      this.logger.log(`📈 Estimated Reach: ${impact.estimatedTotalReach.toLocaleString()}`);
      this.logger.log(`💰 Estimated Revenue: $${impact.estimatedRevenue.toLocaleString()}`);
      this.logger.log('════════════════════════════════════════════════════════════\n');

      return {
        workflowId,
        status: 'completed',
        duration,
        detection: {
          trendsAnalyzed: emergingTrends.length + viralOpportunities.length,
          opportunitiesFound: uniqueOpportunities.length,
          viralOpportunities: viralOpportunities.length,
          timeSensitiveAlerts: timeSensitive.length,
        },
        strategy: {
          briefsCreated: briefs.length,
          totalEstimatedReach,
          avgPriorityScore,
          topContentPieces: briefs.slice(0, 3).map(b => b.title),
        },
        production: {
          draftsCreated: drafts.length,
          avgQualityScore,
          readyToPublish,
          needsRevision,
        },
        publishing: {
          contentPublished,
          channels: Array.from(channelsUsed),
          totalDistributionSteps,
        },
        tracking: {
          contentTracked: performanceReports.length,
          avgPerformance: Math.round(avgPerformance),
          topPerformers: performanceReports
            .filter(r => r.performance.overallPerformance === 'EXCEEDING')
            .map(r => r.title)
            .slice(0, 3),
        },
        impact,
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
  async getWorkflowStatus(): Promise<TrendContentWorkflowStatus> {
    // Get latest workflow execution
    const latestExecution = await this.prisma.workflowExecution.findFirst({
      where: { workflowType: 'TREND_CONTENT' },
      orderBy: { startedAt: 'desc' },
    });

    // Get stats from completed executions
    const completedExecutions = await this.prisma.workflowExecution.findMany({
      where: { workflowType: 'TREND_CONTENT', status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });

    // Calculate aggregate stats
    let totalTrends = 0;
    let totalBriefs = 0;
    let totalDrafts = 0;
    let totalPublished = 0;
    let totalReach = 0;
    let totalQualityScores = 0;
    let qualityCount = 0;

    completedExecutions.forEach(exec => {
      const results = exec.results as any;
      if (results) {
        totalTrends += results.detection?.opportunitiesFound || 0;
        totalBriefs += results.strategy?.briefsCreated || 0;
        totalDrafts += results.production?.draftsCreated || 0;
        totalPublished += results.publishing?.contentPublished || 0;
        totalReach += results.impact?.estimatedTotalReach || 0;

        if (results.production?.avgQualityScore) {
          totalQualityScores += results.production.avgQualityScore;
          qualityCount++;
        }
      }
    });

    const avgViralScore = 0; // Would calculate from actual data
    const avgQualityScore = qualityCount > 0 ? Math.round(totalQualityScores / qualityCount) : 0;

    return {
      workflowId: latestExecution?.id || null,
      status: latestExecution?.status?.toLowerCase() as any || 'idle',
      currentStep: (latestExecution?.state as any)?.phase || 'idle',
      progress: latestExecution?.status === 'COMPLETED' ? 100 : 50,
      trendsDetected: totalTrends,
      briefsCreated: totalBriefs,
      draftsProduced: totalDrafts,
      contentPublished: totalPublished,
      avgViralScore,
      avgQualityScore,
      totalReach,
      lastRun: latestExecution?.startedAt || null,
      nextRun: null, // TODO: Implement scheduling
    };
  }

  /**
   * Schedule recurring trend content workflow
   * TODO: Implement with cron scheduler
   */
  async scheduleRecurringWorkflow(cronExpression: string): Promise<void> {
    this.logger.log(`Scheduling recurring trend content workflow: ${cronExpression}`);
    // TODO: Implement with BullMQ or node-cron
    this.logger.warn('Recurring workflow scheduling not yet implemented');
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

  private deduplicateOpportunities(opportunities: TrendOpportunity[]): TrendOpportunity[] {
    const seen = new Set<string>();
    const unique: TrendOpportunity[] = [];

    for (const opp of opportunities) {
      if (!seen.has(opp.trendId)) {
        seen.add(opp.trendId);
        unique.push(opp);
      }
    }

    // Sort by opportunity score
    return unique.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  private extractLearnings(
    opportunities: TrendOpportunity[],
    briefs: ContentBrief[],
    drafts: ContentDraft[],
    qualityReports: QualityReport[],
    performanceReports: PerformanceReport[],
  ): {
    whatWorked: string[];
    whatDidnt: string[];
    keyInsights: string[];
  } {
    const whatWorked: string[] = [];
    const whatDidnt: string[] = [];
    const keyInsights: string[] = [];

    // Analyze trend detection
    if (opportunities.length > 0) {
      const avgViralScore = opportunities.reduce((sum, o) => sum + o.viralCoefficient, 0) / opportunities.length;
      whatWorked.push(`Identified ${opportunities.length} high-quality trend opportunities`);

      if (avgViralScore >= 75) {
        whatWorked.push(`High average viral potential (${Math.round(avgViralScore)}/100)`);
      }
    } else {
      whatDidnt.push('No suitable trend opportunities found');
    }

    // Analyze content strategy
    if (briefs.length > 0) {
      const avgPriority = briefs.reduce((sum, b) => sum + b.priority, 0) / briefs.length;
      whatWorked.push(`Created ${briefs.length} content briefs with avg priority ${Math.round(avgPriority)}/100`);

      const highPriority = briefs.filter(b => b.priority >= 80).length;
      if (highPriority > 0) {
        whatWorked.push(`${highPriority} high-priority content pieces identified`);
      }
    }

    // Analyze content production
    if (drafts.length > 0) {
      const avgQuality = drafts.reduce((sum, d) => sum + d.qualityScore, 0) / drafts.length;
      const readyCount = qualityReports.filter(q => q.readyToPublish).length;

      if (avgQuality >= 75) {
        whatWorked.push(`High average content quality (${Math.round(avgQuality)}/100)`);
      } else {
        whatDidnt.push(`Content quality below target (${Math.round(avgQuality)}/100)`);
      }

      whatWorked.push(`${readyCount}/${drafts.length} drafts ready to publish without revision`);
    }

    // Analyze performance
    if (performanceReports.length > 0) {
      const exceeding = performanceReports.filter(r => r.performance.overallPerformance === 'EXCEEDING').length;
      const meeting = performanceReports.filter(r => r.performance.overallPerformance === 'MEETING').length;

      if (exceeding > 0) {
        whatWorked.push(`${exceeding} content pieces exceeding performance expectations`);
      }

      if (meeting + exceeding === performanceReports.length) {
        whatWorked.push('All tracked content meeting or exceeding expectations');
      } else {
        whatDidnt.push('Some content underperforming expectations');
      }
    }

    // Generate insights
    const totalPublished = qualityReports.filter(q => q.readyToPublish).length;
    if (totalPublished > 0) {
      keyInsights.push(`Successfully published ${totalPublished} trend-based content pieces`);
    }

    if (opportunities.some(o => o.urgency === 'CRITICAL')) {
      keyInsights.push('Time-sensitive trends detected - rapid content production is critical');
    }

    const viralOpportunities = opportunities.filter(o => o.viralCoefficient >= 85).length;
    if (viralOpportunities > 0) {
      keyInsights.push(`${viralOpportunities} viral opportunities - prioritize social distribution`);
    }

    if (briefs.some(b => b.format === 'video')) {
      keyInsights.push('Video content recommended for high-viral trends');
    }

    return { whatWorked, whatDidnt, keyInsights };
  }

  private calculateImpact(
    briefs: ContentBrief[],
    performanceReports: PerformanceReport[],
  ): {
    estimatedTotalReach: number;
    estimatedTotalEngagement: number;
    estimatedConversions: number;
    estimatedRevenue: number;
  } {
    let estimatedTotalReach = 0;
    let estimatedTotalEngagement = 0;
    let estimatedConversions = 0;
    let estimatedRevenue = 0;

    // Use briefs for estimated impact
    briefs.forEach(brief => {
      estimatedTotalReach += brief.targetMetrics.views;
      estimatedTotalEngagement += brief.targetMetrics.engagement;
      estimatedConversions += brief.targetMetrics.conversions;
    });

    // Use actual performance if available
    performanceReports.forEach(report => {
      estimatedRevenue += report.conversions.revenue;
    });

    // If no actual revenue, estimate from conversions
    if (estimatedRevenue === 0 && estimatedConversions > 0) {
      estimatedRevenue = estimatedConversions * 100; // $100 per conversion
    }

    return {
      estimatedTotalReach,
      estimatedTotalEngagement,
      estimatedConversions,
      estimatedRevenue: Math.round(estimatedRevenue),
    };
  }
}
