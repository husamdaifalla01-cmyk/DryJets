import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueConfigService } from '@/common/queues/queue.config';
import { TrafficOrchestratorService } from '../services/offer-lab/traffic/traffic-orchestrator.service';

/**
 * Auto-Pause Checker Job Processor
 *
 * Automatically checks active campaigns against pause rules and pauses underperformers.
 *
 * Schedule: Every 30 minutes
 * Purpose: Protect budget by stopping low-performing campaigns quickly
 */

interface AutoPauseJobData {
  checkAll?: boolean;
}

interface AutoPauseResult {
  success: boolean;
  campaignsChecked: number;
  campaignsPaused: number;
  duration: number;
  errors: string[];
}

@Injectable()
export class AutoPauseCheckerProcessor implements OnModuleInit {
  private readonly logger = new Logger(AutoPauseCheckerProcessor.name);

  constructor(
    private readonly queueConfig: QueueConfigService,
    private readonly orchestrator: TrafficOrchestratorService,
  ) {}

  async onModuleInit() {
    try {
      const queue = this.queueConfig.createQueue('auto-pause-checker');

      // Create worker with concurrency of 1
      this.queueConfig.createWorker(
        'auto-pause-checker',
        this.processAutoPauseCheck.bind(this),
        1,
      );

      // Schedule recurring check every 30 minutes
      await queue.add(
        'scheduled-auto-pause-check',
        { checkAll: true },
        {
          repeat: {
            pattern: '*/30 * * * *', // Every 30 minutes
          },
        },
      );

      this.logger.log('Auto-pause checker job scheduled (every 30 minutes)');
    } catch (error) {
      this.logger.error(`Failed to initialize auto-pause checker job: ${error.message}`);
    }
  }

  /**
   * Processes auto-pause check job
   */
  private async processAutoPauseCheck(job: any): Promise<AutoPauseResult> {
    const startTime = Date.now();
    const data: AutoPauseJobData = job.data;

    this.logger.log('Starting auto-pause check');

    const result: AutoPauseResult = {
      success: true,
      campaignsChecked: 0,
      campaignsPaused: 0,
      duration: 0,
      errors: [],
    };

    try {
      // Evaluate all active campaigns
      const pausedCount = await this.orchestrator.evaluateActiveCampaigns();

      result.campaignsPaused = pausedCount;
      result.duration = Date.now() - startTime;

      this.logger.log(
        `Auto-pause check completed: ${pausedCount} campaigns paused in ${result.duration}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Auto-pause check failed: ${error.message}`);
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Triggers manual auto-pause check
   */
  async triggerManualCheck(): Promise<void> {
    const queue = this.queueConfig.createQueue('auto-pause-checker');
    await queue.add('manual-auto-pause-check', { checkAll: true });
    this.logger.log('Manual auto-pause check triggered');
  }
}
