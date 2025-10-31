import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueConfigService } from '../../../common/queues/queue.config';
import { TrendPredictorService } from '../services/trends/trend-predictor.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface AlgorithmExperimentJobData {
  trendId?: string;
  autoRunForNewTrends?: boolean;
}

@Injectable()
export class AlgorithmExperimentProcessor implements OnModuleInit {
  private readonly logger = new Logger('AlgorithmExperimentProcessor');
  private readonly QUEUE_NAME = 'algorithm-experiments';

  constructor(
    private readonly queueConfig: QueueConfigService,
    private readonly trendPredictor: TrendPredictorService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Algorithm Experiment Processor...');

    // Create queue
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    // Create worker to process jobs
    this.queueConfig.createWorker(
      this.QUEUE_NAME,
      this.processAlgorithmExperiment.bind(this),
      1, // Process 1 experiment at a time
    );

    // Schedule recurring jobs
    await this.scheduleRecurringJobs();

    this.logger.log('✅ Algorithm Experiment Processor initialized');
  }

  /**
   * Process algorithm experiment job
   */
  private async processAlgorithmExperiment(
    job: Job<AlgorithmExperimentJobData>,
  ): Promise<any> {
    this.logger.log(`Processing algorithm experiment job ${job.id}...`);

    const { trendId, autoRunForNewTrends = false } = job.data;

    const results = {
      experimentsRun: 0,
      experiments: [] as any[],
      timestamp: new Date(),
    };

    try {
      if (trendId) {
        // Run experiment for specific trend
        this.logger.log(`Running experiment for trend: ${trendId}`);
        const experiment = await this.trendPredictor.runAlgorithmExperiment(trendId);
        results.experiments.push(experiment);
        results.experimentsRun = 1;
      } else if (autoRunForNewTrends) {
        // Run experiments for all new trends (EMERGING/GROWING without experiments)
        this.logger.log('Finding trends for automated experiments...');

        const newTrends = await this.prisma.trendData.findMany({
          where: {
            lifecycle: { in: ['EMERGING', 'GROWING'] },
            expiresAt: { gte: new Date() },
          },
          orderBy: { capturedAt: 'desc' },
          take: 10, // Process up to 10 trends per run
        });

        this.logger.log(`Found ${newTrends.length} trends for experiments`);

        for (const trend of newTrends) {
          try {
            const experiment = await this.trendPredictor.runAlgorithmExperiment(trend.id);
            results.experiments.push(experiment);
            results.experimentsRun++;
            this.logger.log(`Experiment completed for trend: ${trend.keyword}`);
          } catch (error) {
            this.logger.error(
              `Failed to run experiment for trend ${trend.id}: ${error.message}`,
            );
          }
        }
      }

      this.logger.log(`✅ Algorithm experiments completed: ${results.experimentsRun} experiments run`);
      return results;
    } catch (error) {
      this.logger.error(`Error in algorithm experiments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Schedule recurring algorithm experiment jobs
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

    // Schedule automated experiments for new trends every 12 hours
    await queue.add(
      'auto-run-experiments',
      {
        autoRunForNewTrends: true,
      },
      {
        repeat: {
          pattern: '0 */12 * * *', // Every 12 hours
        },
        jobId: 'recurring-algorithm-experiments',
      },
    );

    this.logger.log(
      '📅 Scheduled automated algorithm experiments: Every 12 hours (0 */12 * * *)',
    );

    // Schedule best algorithm analysis weekly
    await queue.add(
      'analyze-best-algorithm',
      {},
      {
        repeat: {
          pattern: '0 0 * * 0', // Weekly on Sunday at midnight UTC
        },
        jobId: 'weekly-algorithm-analysis',
      },
    );

    this.logger.log(
      '📅 Scheduled weekly algorithm analysis: Sundays at 12am UTC (0 0 * * 0)',
    );
  }

  /**
   * Manually trigger algorithm experiment
   */
  async triggerAlgorithmExperiment(
    data: AlgorithmExperimentJobData = {},
  ): Promise<string> {
    const queue = this.queueConfig.getQueue(this.QUEUE_NAME);
    if (!queue) {
      throw new Error('Queue not found');
    }

    const job = await queue.add('manual-experiment', data, {
      priority: 1,
    });

    this.logger.log(`Manual algorithm experiment job added: ${job.id}`);
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
