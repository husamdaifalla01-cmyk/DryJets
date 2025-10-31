import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueConfigService } from '../../../common/queues/queue.config';
import { TrendCollectorService } from '../services/trends/trend-collector.service';

export interface TrendCollectionJobData {
  keywords?: string[];
  sources?: ('google' | 'twitter' | 'reddit')[];
  limit?: number;
}

@Injectable()
export class TrendCollectionProcessor implements OnModuleInit {
  private readonly logger = new Logger('TrendCollectionProcessor');
  private readonly QUEUE_NAME = 'trend-collection';

  constructor(
    private readonly queueConfig: QueueConfigService,
    private readonly trendCollector: TrendCollectorService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Trend Collection Processor...');

    // Create queue
    const queue = this.queueConfig.createQueue(this.QUEUE_NAME);

    // Create worker to process jobs
    this.queueConfig.createWorker(
      this.QUEUE_NAME,
      this.processTrendCollection.bind(this),
      2, // Process 2 jobs concurrently
    );

    // Schedule recurring jobs
    await this.scheduleRecurringJobs();

    this.logger.log('✅ Trend Collection Processor initialized');
  }

  /**
   * Process trend collection job
   */
  private async processTrendCollection(job: Job<TrendCollectionJobData>): Promise<any> {
    this.logger.log(`Processing trend collection job ${job.id}...`);

    const { keywords = [], sources = ['google', 'twitter', 'reddit'], limit = 50 } = job.data;

    const results = {
      googleTrends: [] as any[],
      twitterTrends: [] as any[],
      redditTrends: [] as any[],
      totalCollected: 0,
      timestamp: new Date(),
    };

    try {
      // Collect Google Trends
      if (sources.includes('google')) {
        this.logger.log('Collecting Google Trends...');
        const googleTrends = await this.trendCollector.collectGoogleTrends(
          keywords.length > 0 ? keywords : ['laundry', 'dry cleaning', 'eco-friendly cleaning'],
        );
        results.googleTrends = googleTrends;
        this.logger.log(`Collected ${googleTrends.length} Google trends`);
      }

      // Collect Twitter Trends
      if (sources.includes('twitter')) {
        this.logger.log('Collecting Twitter Trends...');
        const twitterTrends = await this.trendCollector.collectTwitterTrends(limit);
        results.twitterTrends = twitterTrends;
        this.logger.log(`Collected ${twitterTrends.length} Twitter trends`);
      }

      // Collect Reddit Trends
      if (sources.includes('reddit')) {
        this.logger.log('Collecting Reddit Trends...');
        const redditTrends = await this.trendCollector.collectRedditTrends([
          'CleaningTips',
          'laundry',
          'organization',
          'ZeroWaste',
          'sustainability',
        ]);
        results.redditTrends = redditTrends;
        this.logger.log(`Collected ${redditTrends.length} Reddit trends`);
      }

      results.totalCollected =
        results.googleTrends.length +
        results.twitterTrends.length +
        results.redditTrends.length;

      // Store trends in database
      await this.storeTrends([
        ...results.googleTrends,
        ...results.twitterTrends,
        ...results.redditTrends,
      ]);

      this.logger.log(`✅ Trend collection completed: ${results.totalCollected} trends collected`);
      return results;
    } catch (error) {
      this.logger.error(`Error in trend collection: ${error.message}`);
      throw error; // Let BullMQ retry the job
    }
  }

  /**
   * Store collected trends in database
   */
  private async storeTrends(trends: any[]): Promise<void> {
    // The TrendCollectorService already stores trends in the database
    // This method is here for any additional processing if needed
    this.logger.log(`Stored ${trends.length} trends in database`);
  }

  /**
   * Schedule recurring trend collection jobs
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

    // Schedule trend collection every 6 hours (12am, 6am, 12pm, 6pm UTC)
    await queue.add(
      'collect-all-trends',
      {
        sources: ['google', 'twitter', 'reddit'],
        limit: 50,
      },
      {
        repeat: {
          pattern: '0 */6 * * *', // Every 6 hours at minute 0
        },
        jobId: 'recurring-trend-collection',
      },
    );

    this.logger.log('📅 Scheduled recurring trend collection: Every 6 hours (0 */6 * * *)');

    // Schedule Google-specific collection every 3 hours
    await queue.add(
      'collect-google-trends',
      {
        sources: ['google'],
        keywords: ['laundry', 'dry cleaning', 'clothing care', 'eco-friendly cleaning'],
      },
      {
        repeat: {
          pattern: '0 */3 * * *', // Every 3 hours
        },
        jobId: 'recurring-google-trends',
      },
    );

    this.logger.log('📅 Scheduled Google Trends collection: Every 3 hours (0 */3 * * *)');

    // Schedule Twitter-specific collection every 2 hours (real-time trends)
    await queue.add(
      'collect-twitter-trends',
      {
        sources: ['twitter'],
        limit: 50,
      },
      {
        repeat: {
          pattern: '0 */2 * * *', // Every 2 hours
        },
        jobId: 'recurring-twitter-trends',
      },
    );

    this.logger.log('📅 Scheduled Twitter Trends collection: Every 2 hours (0 */2 * * *)');
  }

  /**
   * Manually trigger trend collection
   */
  async triggerTrendCollection(data: TrendCollectionJobData = {}): Promise<string> {
    const queue = this.queueConfig.getQueue(this.QUEUE_NAME);
    if (!queue) {
      throw new Error('Queue not found');
    }

    const job = await queue.add('manual-collection', data, {
      priority: 1, // High priority for manual triggers
    });

    this.logger.log(`Manual trend collection job added: ${job.id}`);
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
