import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GoogleSearchConsoleService } from '../services/integrations/google-search-console.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Rank Tracking Processor
 *
 * Background job that runs daily to:
 * - Fetch latest keyword rankings from Google Search Console
 * - Update keyword current_rank in database
 * - Detect significant rank changes (±5 positions)
 * - Alert on major improvements or drops
 * - Track historical rank data for trend analysis
 *
 * Schedule: Daily at 2 AM UTC
 */

export interface RankTrackingJobData {
  keywordIds?: string[]; // Optional: specific keywords to track
  batchSize?: number; // How many keywords to process at once
}

export interface RankTrackingResult {
  processedKeywords: number;
  updatedKeywords: number;
  significantChanges: Array<{
    keyword: string;
    oldRank: number;
    newRank: number;
    change: number;
  }>;
  errors: number;
  duration: number;
}

@Processor('rank-tracking', {
  concurrency: 1, // Process one batch at a time to avoid API rate limits
})
export class RankTrackingProcessor extends WorkerHost {
  private readonly logger = new Logger(RankTrackingProcessor.name);

  constructor(
    private readonly gscService: GoogleSearchConsoleService,
    private readonly prisma: PrismaService,
  ) {
    super();
    this.logger.log('✅ Rank Tracking Processor initialized');
  }

  /**
   * Process rank tracking job
   */
  async process(job: Job<RankTrackingJobData>): Promise<RankTrackingResult> {
    const startTime = Date.now();
    const { keywordIds, batchSize = 100 } = job.data;

    this.logger.log('════════════════════════════════════════════════════════════');
    this.logger.log('🔍 Starting Rank Tracking Job');
    this.logger.log('════════════════════════════════════════════════════════════\n');

    // Initialize GSC service if not already done
    if (!this.gscService.isReady()) {
      this.logger.log('Initializing Google Search Console service...');
      await this.gscService.initialize();
    }

    const status = this.gscService.getStatus();
    this.logger.log(`GSC Status: ${status.mode.toUpperCase()} mode`);
    this.logger.log(`Domain: ${status.domain}\n`);

    // Get keywords to track
    const where = keywordIds ? { id: { in: keywordIds } } : {};
    const keywords = await this.prisma.keyword.findMany({
      where,
      select: {
        id: true,
        keyword: true,
        currentRank: true,
      },
      take: batchSize,
      orderBy: { updatedAt: 'asc' }, // Track least recently updated first
    });

    this.logger.log(`📊 Found ${keywords.length} keywords to track\n`);

    if (keywords.length === 0) {
      this.logger.warn('No keywords to track');
      return {
        processedKeywords: 0,
        updatedKeywords: 0,
        significantChanges: [],
        errors: 0,
        duration: Date.now() - startTime,
      };
    }

    // Update progress
    await job.updateProgress(10);

    // Fetch rankings from GSC
    this.logger.log('Fetching latest rankings from Google Search Console...');
    const rankings = await this.gscService.getKeywordRankings(
      keywords.map(k => k.keyword),
      7, // Last 7 days average
    );

    this.logger.log(`✅ Retrieved ${rankings.length} rankings\n`);
    await job.updateProgress(40);

    // Process and update keywords
    this.logger.log('Updating keyword ranks in database...\n');
    let updated = 0;
    let errors = 0;
    const significantChanges: Array<{
      keyword: string;
      oldRank: number;
      newRank: number;
      change: number;
    }> = [];

    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      const keyword = keywords.find(k => k.keyword.toLowerCase() === ranking.keyword.toLowerCase());

      if (!keyword) {
        errors++;
        continue;
      }

      try {
        // Update keyword rank
        await this.prisma.keyword.update({
          where: { id: keyword.id },
          data: {
            currentRank: ranking.position,
            updatedAt: new Date(),
          },
        });

        updated++;

        // Detect significant changes (±5 positions)
        if (keyword.currentRank) {
          const change = keyword.currentRank - ranking.position;

          if (Math.abs(change) >= 5) {
            significantChanges.push({
              keyword: keyword.keyword,
              oldRank: keyword.currentRank,
              newRank: ranking.position,
              change,
            });

            if (change > 0) {
              this.logger.log(`📈 IMPROVED: "${keyword.keyword}" ${keyword.currentRank} → ${ranking.position} (+${change} positions)`);
            } else {
              this.logger.log(`📉 DECLINED: "${keyword.keyword}" ${keyword.currentRank} → ${ranking.position} (${change} positions)`);
            }
          }
        }

        // Store historical data point
        await this.storeRankHistory(keyword.id, ranking);

        // Update progress
        const progress = 40 + Math.round((i / rankings.length) * 50);
        await job.updateProgress(progress);
      } catch (error: any) {
        this.logger.error(`Failed to update keyword ${keyword.id}: ${error.message}`);
        errors++;
      }
    }

    await job.updateProgress(100);

    const duration = Date.now() - startTime;

    this.logger.log('\n════════════════════════════════════════════════════════════');
    this.logger.log('✅ Rank Tracking Job Complete');
    this.logger.log('════════════════════════════════════════════════════════════');
    this.logger.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
    this.logger.log(`📊 Processed: ${keywords.length} keywords`);
    this.logger.log(`✅ Updated: ${updated} keywords`);
    this.logger.log(`⚠️  Errors: ${errors}`);
    this.logger.log(`📈 Significant changes: ${significantChanges.length}`);
    this.logger.log('════════════════════════════════════════════════════════════\n');

    // Send alerts for significant changes
    if (significantChanges.length > 0) {
      await this.sendRankChangeAlerts(significantChanges);
    }

    return {
      processedKeywords: keywords.length,
      updatedKeywords: updated,
      significantChanges,
      errors,
      duration,
    };
  }

  /**
   * Store historical rank data for trend analysis
   */
  private async storeRankHistory(
    keywordId: string,
    ranking: { position: number; clicks: number; impressions: number; ctr: number; date: Date },
  ): Promise<void> {
    // In a production system, you would store this in a time-series table
    // For now, we'll use a simple approach with a separate model

    // TODO: Create RankHistory model in Prisma schema
    // await this.prisma.rankHistory.create({
    //   data: {
    //     keywordId,
    //     position: ranking.position,
    //     clicks: ranking.clicks,
    //     impressions: ranking.impressions,
    //     ctr: ranking.ctr,
    //     date: ranking.date,
    //   },
    // });

    // For now, just log that we would store it
    // this.logger.debug(`Would store rank history for keyword ${keywordId}: position ${ranking.position}`);
  }

  /**
   * Send alerts for significant rank changes
   */
  private async sendRankChangeAlerts(
    changes: Array<{ keyword: string; oldRank: number; newRank: number; change: number }>,
  ): Promise<void> {
    // In production, send email/Slack notifications
    // For now, just log

    this.logger.log('\n📧 Rank Change Alerts:');
    this.logger.log('═══════════════════════════════════════════════════════════\n');

    const improvements = changes.filter(c => c.change > 0);
    const declines = changes.filter(c => c.change < 0);

    if (improvements.length > 0) {
      this.logger.log('✅ IMPROVEMENTS:');
      improvements.forEach(c => {
        this.logger.log(`   "${c.keyword}": ${c.oldRank} → ${c.newRank} (+${c.change})`);
      });
      this.logger.log('');
    }

    if (declines.length > 0) {
      this.logger.log('⚠️  DECLINES:');
      declines.forEach(c => {
        this.logger.log(`   "${c.keyword}": ${c.oldRank} → ${c.newRank} (${c.change})`);
      });
      this.logger.log('');
    }

    // TODO: Integrate with notification service
    // await this.notificationService.sendRankChangeAlert(changes);
  }
}

/**
 * Schedule rank tracking to run daily at 2 AM UTC
 *
 * Add this to the queue scheduler:
 *
 * @Cron('0 2 * * *')
 * async scheduleRankTracking() {
 *   await this.rankTrackingQueue.add('daily-rank-check', {
 *     batchSize: 100,
 *   });
 * }
 */
