import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CampaignSeedingService } from './campaign-seeding.service';
import { KeywordSeedingService } from './keyword-seeding.service';
import { ContentSeedingService } from './content-seeding.service';
import { TrendSeedingService } from './trend-seeding.service';
import { AttributionSeedingService } from './attribution-seeding.service';
import { BacklinkSeedingService } from './backlink-seeding.service';
import { ValidationService } from './validation.service';

/**
 * Seeding Orchestrator Service
 * Coordinates all seeding services and validation
 *
 * Execution Order:
 * 1. Keywords (no dependencies)
 * 2. Campaigns (no dependencies)
 * 3. Content (depends on keywords)
 * 4. Trends (no dependencies)
 * 5. Attribution (no dependencies)
 * 6. Backlinks (no dependencies)
 * 7. Validation (depends on all)
 */

interface SeedingResult {
  phase: string;
  success: boolean;
  duration: number;
  recordsCreated: number;
  details: any;
  error?: string;
}

interface OrchestratorReport {
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  totalRecordsCreated: number;
  phases: SeedingResult[];
  validation: any;
  overallSuccess: boolean;
}

@Injectable()
export class SeedingOrchestratorService {
  private readonly logger = new Logger('SeedingOrchestrator');

  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignSeeding: CampaignSeedingService,
    private readonly keywordSeeding: KeywordSeedingService,
    private readonly contentSeeding: ContentSeedingService,
    private readonly trendSeeding: TrendSeedingService,
    private readonly attributionSeeding: AttributionSeedingService,
    private readonly backlinkSeeding: BacklinkSeedingService,
    private readonly validation: ValidationService,
  ) {}

  /**
   * Run complete seeding and validation pipeline
   */
  async runCompleteSeeding(): Promise<OrchestratorReport> {
    const startTime = new Date();
    this.logger.log('\n' + '='.repeat(80));
    this.logger.log('🚀 STARTING COMPLETE SEEDING PIPELINE');
    this.logger.log('='.repeat(80) + '\n');

    const report: OrchestratorReport = {
      startTime,
      endTime: null,
      totalDuration: 0,
      totalRecordsCreated: 0,
      phases: [],
      validation: null,
      overallSuccess: false,
    };

    try {
      // Phase 1: Keywords (50,000 records)
      this.logger.log('📍 Phase 1/6: Keyword Universe Seeding');
      this.logger.log('─'.repeat(80));
      const keywordResult = await this.executePhase(
        'Keywords',
        async () => await this.keywordSeeding.seedKeywords(50000),
      );
      report.phases.push(keywordResult);
      report.totalRecordsCreated += keywordResult.recordsCreated;

      // Phase 2: Campaigns (5,000 records)
      this.logger.log('\n📍 Phase 2/6: Campaign Memory Seeding');
      this.logger.log('─'.repeat(80));
      const campaignResult = await this.executePhase(
        'Campaigns',
        async () => await this.campaignSeeding.seedCampaigns(5000),
      );
      report.phases.push(campaignResult);
      report.totalRecordsCreated += campaignResult.recordsCreated;

      // Phase 3: Content (10,000 records)
      this.logger.log('\n📍 Phase 3/6: Content Performance Seeding');
      this.logger.log('─'.repeat(80));
      const contentResult = await this.executePhase(
        'Content',
        async () => await this.contentSeeding.seedContent(10000),
      );
      report.phases.push(contentResult);
      report.totalRecordsCreated += contentResult.recordsCreated;

      // Phase 4: Trends (2,000 records)
      this.logger.log('\n📍 Phase 4/6: Trend History Seeding');
      this.logger.log('─'.repeat(80));
      const trendResult = await this.executePhase(
        'Trends',
        async () => await this.trendSeeding.seedTrends(2000),
      );
      report.phases.push(trendResult);
      report.totalRecordsCreated += trendResult.recordsCreated;

      // Phase 5: Attribution (3,000 records)
      this.logger.log('\n📍 Phase 5/6: Attribution Data Seeding');
      this.logger.log('─'.repeat(80));
      const attributionResult = await this.executePhase(
        'Attribution',
        async () => await this.attributionSeeding.seedJourneys(3000),
      );
      report.phases.push(attributionResult);
      report.totalRecordsCreated += attributionResult.recordsCreated;

      // Phase 6: Backlinks (2,000+ records)
      this.logger.log('\n📍 Phase 6/6: Backlink & Outreach Seeding');
      this.logger.log('─'.repeat(80));
      const backlinkResult = await this.executePhase(
        'Backlinks',
        async () => await this.backlinkSeeding.seedBacklinks(2000),
      );
      report.phases.push(backlinkResult);
      report.totalRecordsCreated += backlinkResult.recordsCreated;

      // All phases complete
      this.logger.log('\n' + '='.repeat(80));
      this.logger.log('✅ ALL SEEDING PHASES COMPLETE');
      this.logger.log('='.repeat(80) + '\n');

      this.printPhaseSummary(report.phases);

      // Run validation
      this.logger.log('\n' + '='.repeat(80));
      this.logger.log('🔍 RUNNING COMPREHENSIVE VALIDATION');
      this.logger.log('='.repeat(80) + '\n');

      const validationResult = await this.validation.runFullValidation();
      report.validation = validationResult;

      // Print detailed validation report
      this.validation.printDetailedReport(validationResult);

      // Final summary
      const endTime = new Date();
      report.endTime = endTime;
      report.totalDuration = endTime.getTime() - startTime.getTime();
      report.overallSuccess = report.phases.every((p) => p.success) && validationResult.passed;

      this.printFinalSummary(report);

      return report;
    } catch (error) {
      this.logger.error('Seeding pipeline failed:', error);
      report.endTime = new Date();
      report.totalDuration = report.endTime.getTime() - startTime.getTime();
      report.overallSuccess = false;
      throw error;
    }
  }

  /**
   * Execute a single seeding phase
   */
  private async executePhase(
    phaseName: string,
    seedingFunction: () => Promise<any>,
  ): Promise<SeedingResult> {
    const start = Date.now();

    try {
      const details = await seedingFunction();
      const duration = Date.now() - start;

      // Extract record count from details
      const recordsCreated = this.extractRecordCount(details);

      const result: SeedingResult = {
        phase: phaseName,
        success: true,
        duration,
        recordsCreated,
        details,
      };

      this.logger.log(`✅ ${phaseName} complete: ${recordsCreated.toLocaleString()} records in ${this.formatDuration(duration)}\n`);

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      this.logger.error(`❌ ${phaseName} failed: ${error.message}\n`);

      return {
        phase: phaseName,
        success: false,
        duration,
        recordsCreated: 0,
        details: null,
        error: error.message,
      };
    }
  }

  /**
   * Extract record count from seeding result
   */
  private extractRecordCount(details: any): number {
    if (typeof details === 'number') return details;
    if (details?.seeded) return details.seeded;
    if (details?.totalBacklinks) return details.totalBacklinks;
    if (details?.totalJourneys) return details.totalJourneys;
    return 0;
  }

  /**
   * Print phase summary
   */
  private printPhaseSummary(phases: SeedingResult[]): void {
    this.logger.log('📊 PHASE SUMMARY:');
    this.logger.log('─'.repeat(80));

    let totalRecords = 0;
    let totalDuration = 0;

    phases.forEach((phase) => {
      const icon = phase.success ? '✅' : '❌';
      const records = phase.recordsCreated.toLocaleString().padEnd(10);
      const duration = this.formatDuration(phase.duration).padEnd(10);

      this.logger.log(`${icon} ${phase.phase.padEnd(20)} ${records} records in ${duration}`);

      totalRecords += phase.recordsCreated;
      totalDuration += phase.duration;
    });

    this.logger.log('─'.repeat(80));
    this.logger.log(`📈 TOTAL: ${totalRecords.toLocaleString()} records in ${this.formatDuration(totalDuration)}`);
    this.logger.log('─'.repeat(80) + '\n');
  }

  /**
   * Print final summary
   */
  private printFinalSummary(report: OrchestratorReport): void {
    this.logger.log('\n' + '='.repeat(80));
    this.logger.log('🏁 FINAL SUMMARY');
    this.logger.log('='.repeat(80) + '\n');

    const icon = report.overallSuccess ? '✅' : '❌';
    this.logger.log(`${icon} Overall Status: ${report.overallSuccess ? 'SUCCESS' : 'FAILED'}`);
    this.logger.log(`⏱️  Total Duration: ${this.formatDuration(report.totalDuration)}`);
    this.logger.log(`📊 Total Records: ${report.totalRecordsCreated.toLocaleString()}`);
    this.logger.log(`🔍 Validation Score: ${report.validation?.overallScore || 0}/100`);

    this.logger.log('\n📋 Phase Results:');
    report.phases.forEach((phase) => {
      const icon = phase.success ? '✅' : '❌';
      this.logger.log(`   ${icon} ${phase.phase}: ${phase.recordsCreated.toLocaleString()} records`);
    });

    if (report.validation) {
      this.logger.log('\n🎯 Validation Results:');
      Object.entries(report.validation.dimensions).forEach(([name, result]: [string, any]) => {
        const icon = result.passed ? '✅' : '❌';
        this.logger.log(`   ${icon} ${name}: ${result.score.toFixed(1)}/100`);
      });
    }

    if (report.overallSuccess) {
      this.logger.log('\n🎉 SUCCESS! Data is production-ready.');
      this.logger.log('   The marketing engine now has 3-4 years of learned experience.');
      this.logger.log('   You can now proceed with Phase 2: Real Automation Workflows.');
    } else {
      this.logger.log('\n⚠️  ISSUES DETECTED:');
      if (report.validation?.recommendations) {
        report.validation.recommendations.forEach((rec) => {
          this.logger.log(`   ${rec}`);
        });
      }
    }

    this.logger.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Quick validation (no AI simulation)
   */
  async runQuickValidation(): Promise<any> {
    this.logger.log('🔍 Running quick validation...\n');

    const counts = {
      campaigns: await this.prisma.campaign.count(),
      campaignMemories: await this.prisma.campaignMemory.count(),
      keywords: await this.prisma.keyword.count(),
      blogPosts: await this.prisma.blogPost.count(),
      contentAssets: await this.prisma.contentAsset.count(),
      trends: await this.prisma.trendData.count(),
      journeys: await this.prisma.customerJourney.count(),
      touchPoints: await this.prisma.touchPoint.count(),
      backlinks: await this.prisma.backlink.count(),
      haroQueries: await this.prisma.hAROQuery.count(),
      outreachCampaigns: await this.prisma.outreachCampaign.count(),
    };

    this.logger.log('📊 Record Counts:');
    this.logger.log('─'.repeat(80));
    Object.entries(counts).forEach(([name, count]) => {
      this.logger.log(`   ${name.padEnd(25)}: ${count.toLocaleString()}`);
    });
    this.logger.log('─'.repeat(80));

    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
    this.logger.log(`   ${'TOTAL'.padEnd(25)}: ${total.toLocaleString()}\n`);

    return counts;
  }

  /**
   * Clear all seeded data
   */
  async clearAllData(): Promise<void> {
    this.logger.warn('⚠️  CLEARING ALL SEEDED DATA...');

    await this.prisma.touchPoint.deleteMany({});
    await this.prisma.customerJourney.deleteMany({});
    await this.prisma.sEOMetric.deleteMany({});
    await this.prisma.blogPost.deleteMany({});
    await this.prisma.contentAsset.deleteMany({});
    await this.prisma.publishedContent.deleteMany({});
    await this.prisma.multiPlatformWorkflow.deleteMany({});
    await this.prisma.trendData.deleteMany({});
    await this.prisma.keyword.deleteMany({});
    await this.prisma.campaignMemory.deleteMany({});
    await this.prisma.campaignMetric.deleteMany({});
    await this.prisma.campaign.deleteMany({});
    await this.prisma.backlink.deleteMany({});
    await this.prisma.hAROQuery.deleteMany({});
    await this.prisma.brokenLinkOpportunity.deleteMany({});
    await this.prisma.partnershipProposal.deleteMany({});
    await this.prisma.resourcePageTarget.deleteMany({});
    await this.prisma.outreachCampaign.deleteMany({});

    this.logger.log('✅ All seeded data cleared.\n');
  }
}
