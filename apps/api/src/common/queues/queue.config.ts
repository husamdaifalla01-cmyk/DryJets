import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

export interface QueueConfig {
  queueName: string;
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  defaultJobOptions?: {
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  };
}

@Injectable()
export class QueueConfigService implements OnModuleInit {
  private readonly logger = new Logger('QueueConfig');
  private connection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor() {
    // Create Redis connection
    this.connection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    });

    this.connection.on('connect', () => {
      this.logger.log('✅ Redis connected successfully');
    });

    this.connection.on('error', (error) => {
      this.logger.error(`❌ Redis connection error: ${error.message}`);
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing Queue Configuration...');

    // Validate Redis connection
    try {
      await this.connection.ping();
      this.logger.log('✅ Redis connection validated successfully');
    } catch (error) {
      this.logger.error(`❌ Redis connection failed: ${error.message}`);

      // In production, Redis should be required for queue functionality
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Redis connection required in production. Please set REDIS_HOST and REDIS_PORT environment variables. Error: ${error.message}`
        );
      } else {
        this.logger.warn('⚠️  Redis unavailable in development mode - queue functionality will not work');
      }
    }
  }

  /**
   * Create a new queue
   */
  createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!;
    }

    const queue = new Queue(queueName, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    });

    this.queues.set(queueName, queue);
    this.logger.log(`Queue created: ${queueName}`);
    return queue;
  }

  /**
   * Create a worker to process jobs
   */
  createWorker<T = any>(
    queueName: string,
    processor: (job: Job<T>) => Promise<any>,
    concurrency: number = 1,
  ): Worker {
    if (this.workers.has(queueName)) {
      this.logger.warn(`Worker already exists for queue: ${queueName}`);
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency,
    });

    // Event listeners
    worker.on('completed', (job: Job) => {
      this.logger.log(`Job ${job.id} in queue ${queueName} completed`);
    });

    worker.on('failed', (job: Job | undefined, error: Error) => {
      this.logger.error(
        `Job ${job?.id} in queue ${queueName} failed: ${error.message}`,
      );
    });

    worker.on('error', (error: Error) => {
      this.logger.error(`Worker error in queue ${queueName}: ${error.message}`);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Worker created for queue: ${queueName} (concurrency: ${concurrency})`);
    return worker;
  }

  /**
   * Get queue by name
   */
  getQueue(queueName: string): Queue | undefined {
    return this.queues.get(queueName);
  }

  /**
   * Get all queues
   */
  getAllQueues(): Map<string, Queue> {
    return this.queues;
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    this.logger.log('Closing all queue connections...');

    // Close all workers
    for (const [name, worker] of this.workers.entries()) {
      await worker.close();
      this.logger.log(`Worker closed: ${name}`);
    }

    // Close all queues
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`Queue closed: ${name}`);
    }

    // Close Redis connection
    await this.connection.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Get Redis connection
   */
  getConnection(): Redis {
    return this.connection;
  }
}
