import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueConfigService } from '../../../common/queues/queue.config';
import { OfferOrchestratorService } from '../services/offer-lab/offer-orchestrator.service';

export interface OfferSyncJobData {
  network?: string; // Specific network to sync, or all if not provided
  forceRefresh?: boolean;
}

/**
 * Offer sync job processor
 * Runs periodic syncs of affiliate offers from networks
 */
@Injectable()
export class OfferSyncProcessor implements OnModuleInit {
  private readonly logger = new Logger('OfferSyncProcessor');
  private readonly QUEUE_NAME = 'offer-sync';

  // Networks to sync
  private readonly ENABLED_NETWORKS = ['maxbounty', 'clickbank'];

  constructor(
    private readonly queueConfig: QueueConfigService,
    private readonly orchestrator: OfferOrchestratorService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Offer Sync Processor...');

    // Create queue
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    // Create worker to process jobs
    this.queueConfig.createWorker(
      this.QUEUE_NAME,
      this.processOfferSync.bind(this),
      1, // Process one sync at a time to avoid rate limits
    );

    // Schedule recurring jobs
    await this.scheduleRecurringJobs();

    this.logger.log('✅ Offer Sync Processor initialized');
  }

  /**
   * Process offer sync job
   */
  private async processOfferSync(job: Job<OfferSyncJobData>): Promise<any> {
    this.logger.log(`Processing offer sync job ${job.id}...`);

    const { network, forceRefresh = false } = job.data;

    const results = {
      syncs: [] as any[],
      totalOffersFound: 0,
      totalOffersNew: 0,
      totalOffersUpdated: 0,
      errors: [] as string[],
      timestamp: new Date(),
    };

    // Determine which networks to sync
    const networksToSync = network
      ? [network]
      : this.ENABLED_NETWORKS;

    // Sync each network
    for (const networkName of networksToSync) {
      try {
        this.logger.log(`Syncing network: ${networkName}`);

        const syncResult = await this.orchestrator.syncOffers(
          networkName,
          forceRefresh,
        );

        results.syncs.push({
          network: networkName,
          success: syncResult.success,
          offersFound: syncResult.offersFound,
          offersNew: syncResult.offersNew,
          offersUpdated: syncResult.offersUpdated,
          duration: syncResult.duration,
        });

        results.totalOffersFound += syncResult.offersFound;
        results.totalOffersNew += syncResult.offersNew;
        results.totalOffersUpdated += syncResult.offersUpdated;

        this.logger.log(
          `✓ ${networkName}: ${syncResult.offersNew} new, ${syncResult.offersUpdated} updated`,
        );
      } catch (error) {
        this.logger.error(`Error syncing ${networkName}: ${error.message}`);
        results.errors.push(`${networkName}: ${error.message}`);

        results.syncs.push({
          network: networkName,
          success: false,
          error: error.message,
        });
      }

      // Wait between network syncs to respect rate limits
      if (networksToSync.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    this.logger.log(
      `Sync complete: ${results.totalOffersNew} new, ${results.totalOffersUpdated} updated`,
    );

    return results;
  }

  /**
   * Schedule recurring sync jobs
   */
  private async scheduleRecurringJobs() {
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    // Schedule sync every 3 days at 2 AM
    // Cron: 0 2 */3 * * (minute=0, hour=2, every 3 days)
    await queue.add(
      'scheduled-sync',
      {
        forceRefresh: false,
      },
      {
        repeat: {
          pattern: '0 2 */3 * *',
        },
        removeOnComplete: {
          age: 7 * 24 * 60 * 60, // Keep for 7 days
          count: 50,
        },
        removeOnFail: {
          age: 30 * 24 * 60 * 60, // Keep failures for 30 days
        },
      },
    );

    this.logger.log(
      '✓ Scheduled recurring sync: Every 3 days at 2 AM',
    );
  }

  /**
   * Trigger manual sync (can be called from controller)
   */
  async triggerManualSync(network?: string, forceRefresh: boolean = false) {
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    const job = await queue.add(
      'manual-sync',
      {
        network,
        forceRefresh,
      },
      {
        priority: 1, // High priority for manual syncs
      },
    );

    this.logger.log(`Manual sync job created: ${job.id}`);

    return {
      jobId: job.id,
      network: network || 'all',
      status: 'queued',
    };
  }

  /**
   * Get sync job status
   */
  async getJobStatus(jobId: string) {
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);
    const job = await queue.getJob(jobId);

    if (!job) {
      return { found: false };
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      found: true,
      id: job.id,
      name: job.name,
      state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      timestamp: job.timestamp,
    };
  }

  /**
   * Get recent sync jobs
   */
  async getRecentJobs(limit: number = 10) {
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    const [completed, failed, active, waiting] = await Promise.all([
      queue.getCompleted(0, limit),
      queue.getFailed(0, limit),
      queue.getActive(0, limit),
      queue.getWaiting(0, limit),
    ]);

    return {
      completed: completed.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
        returnvalue: j.returnvalue,
        finishedOn: j.finishedOn,
      })),
      failed: failed.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
        failedReason: j.failedReason,
        finishedOn: j.finishedOn,
      })),
      active: active.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
        progress: j.progress,
      })),
      waiting: waiting.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
      })),
    };
  }
}
