import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueConfigService } from '../../../common/queues/queue.config';
import { HyperPredictiveService } from '../services/intelligence/hyper-predictive.service';

export interface WeakSignalDetectionJobData {
  keywords?: string[];
  forceRefresh?: boolean;
}

@Injectable()
export class WeakSignalDetectionProcessor implements OnModuleInit {
  private readonly logger = new Logger('WeakSignalDetectionProcessor');
  private readonly QUEUE_NAME = 'weak-signal-detection';

  constructor(
    private readonly queueConfig: QueueConfigService,
    private readonly hyperPredictive: HyperPredictiveService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Weak Signal Detection Processor...');

    // Create queue
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    // Create worker to process jobs
    this.queueConfig.createWorker(
      this.QUEUE_NAME,
      this.processWeakSignalDetection.bind(this),
      1, // Process 1 job at a time (community monitoring is intensive)
    );

    // Schedule recurring jobs
    await this.scheduleRecurringJobs();

    this.logger.log('✅ Weak Signal Detection Processor initialized');
  }

  /**
   * Process weak signal detection job
   */
  private async processWeakSignalDetection(
    job: Job<WeakSignalDetectionJobData>,
  ): Promise<any> {
    this.logger.log(`Processing weak signal detection job ${job.id}...`);

    const { keywords = [], forceRefresh = false } = job.data;

    const results = {
      communitiesMonitored: 0,
      signalsDetected: 0,
      communities: [] as any[],
      timestamp: new Date(),
    };

    try {
      // Monitor niche communities
      this.logger.log('Monitoring 200+ niche communities...');
      const communities = await this.hyperPredictive.monitorNicheCommunities();
      results.communities = communities;
      results.communitiesMonitored = communities.length;

      // Count total signals detected
      results.signalsDetected = communities.reduce(
        (sum, c) => sum + c.signals,
        0,
      );

      this.logger.log(
        `✅ Weak signal detection completed: ${results.signalsDetected} signals from ${results.communitiesMonitored} communities`,
      );

      return results;
    } catch (error) {
      this.logger.error(`Error in weak signal detection: ${error.message}`);
      throw error; // Let BullMQ retry the job
    }
  }

  /**
   * Schedule recurring weak signal detection jobs
   */
  private async scheduleRecurringJobs(): Promise<void> {
    const queue = this.queueConfig.getQueue(this.QUEUE_NAME);
    if (!queue) {
      this.logger.error('Queue not found for scheduling');
      return;
    }

    // Remove existing repeatable jobs
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await queue.removeRepeatableByKey(job.key);
    }

    // Schedule community monitoring once daily at 2am UTC
    await queue.add(
      'monitor-communities',
      {
        forceRefresh: true,
      },
      {
        repeat: {
          pattern: '0 2 * * *', // Daily at 2am UTC
        },
        jobId: 'daily-community-monitoring',
      },
    );

    this.logger.log(
      '📅 Scheduled daily community monitoring: 2am UTC (0 2 * * *)',
    );

    // Schedule cultural intelligence tracking twice daily
    await queue.add(
      'track-cultural-intelligence',
      {},
      {
        repeat: {
          pattern: '0 6,18 * * *', // Twice daily at 6am and 6pm UTC
        },
        jobId: 'cultural-intelligence-tracking',
      },
    );

    this.logger.log(
      '📅 Scheduled cultural intelligence tracking: 6am & 6pm UTC (0 6,18 * * *)',
    );
  }

  /**
   * Manually trigger weak signal detection
   */
  async triggerWeakSignalDetection(
    data: WeakSignalDetectionJobData = {},
  ): Promise<string> {
    const queue = this.queueConfig.getQueue(this.QUEUE_NAME);
    if (!queue) {
      throw new Error('Queue not found');
    }

    const job = await queue.add('manual-detection', data, {
      priority: 1, // High priority for manual triggers
    });

    this.logger.log(`Manual weak signal detection job added: ${job.id}`);
    return job.id!;
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<any> {
    const queue = this.queueConfig.getQueue(this.QUEUE_NAME);
    if (!queue) {
      return { error: 'Queue not found' };
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    const repeatableJobs = await queue.getRepeatableJobs();

    return {
      queueName: this.QUEUE_NAME,
      counts: {
        waiting,
        active,
        completed,
        failed,
        delayed,
      },
      scheduledJobs: repeatableJobs.map((j) => ({
        id: j.id,
        name: j.name,
        pattern: j.pattern,
        next: j.next,
      })),
    };
  }
}
