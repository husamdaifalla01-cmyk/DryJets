import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueConfigService } from '@/common/queues/queue.config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EncryptionService } from '../services/offer-lab/encryption.service';
import { PopAdsAdapterService } from '../services/offer-lab/traffic/networks/popads-adapter.service';
import { PropellerAdsAdapterService } from '../services/offer-lab/traffic/networks/propellerads-adapter.service';
import { TrafficAdapter } from '../services/offer-lab/traffic/traffic-adapter.interface';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Ad Metrics Sync Job Processor
 *
 * Automatically syncs campaign performance metrics from traffic networks.
 *
 * Schedule: Every 6 hours
 * Purpose: Keep campaign metrics up-to-date for auto-pause decisions
 */

interface MetricsSyncJobData {
  forceSync?: boolean;
  campaignIds?: string[];
}

interface MetricsSyncResult {
  success: boolean;
  campaignsSynced: number;
  errors: string[];
  duration: number;
}

@Injectable()
export class AdMetricsSyncProcessor implements OnModuleInit {
  private readonly logger = new Logger(AdMetricsSyncProcessor.name);
  private readonly adapters: Map<string, TrafficAdapter>;

  constructor(
    private readonly queueConfig: QueueConfigService,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly popAdsAdapter: PopAdsAdapterService,
    private readonly propellerAdsAdapter: PropellerAdsAdapterService,
  ) {
    // FIX: Cast each adapter to TrafficAdapter to satisfy type checker
    this.adapters = new Map<string, TrafficAdapter>([
      ['popads', popAdsAdapter as TrafficAdapter],
      ['propellerads', propellerAdsAdapter as TrafficAdapter],
    ]);
  }

  async onModuleInit() {
    try {
      const queue = this.queueConfig.createQueue('ad-metrics-sync');

      // Create worker with concurrency of 1
      this.queueConfig.createWorker(
        'ad-metrics-sync',
        this.processMetricsSync.bind(this),
        1,
      );

      // Schedule recurring sync every 6 hours
      await queue.add(
        'scheduled-metrics-sync',
        { forceSync: false },
        {
          repeat: {
            pattern: '0 */6 * * *', // Every 6 hours
          },
        },
      );

      this.logger.log('Ad metrics sync job scheduled (every 6 hours)');
    } catch (error) {
      this.logger.error(`Failed to initialize ad metrics sync job: ${error.message}`);
    }
  }

  /**
   * Processes metrics sync job
   */
  private async processMetricsSync(job: any): Promise<MetricsSyncResult> {
    const startTime = Date.now();
    const data: MetricsSyncJobData = job.data;

    this.logger.log('Starting ad metrics sync job');

    const result: MetricsSyncResult = {
      success: true,
      campaignsSynced: 0,
      errors: [],
      duration: 0,
    };

    try {
      // Get active campaigns (or specific campaigns if provided)
      const campaigns = await this.getActiveCampaigns(data.campaignIds);

      if (campaigns.length === 0) {
        this.logger.log('No active campaigns to sync');
        result.duration = Date.now() - startTime;
        return result;
      }

      // Group campaigns by connection (to minimize API calls)
      const campaignsByConnection = this.groupCampaignsByConnection(campaigns);

      // Sync metrics for each connection
      for (const [connectionId, campaignGroup] of campaignsByConnection.entries()) {
        try {
          const synced = await this.syncConnectionCampaigns(connectionId, campaignGroup);
          result.campaignsSynced += synced;
        } catch (error) {
          const errorMsg = `Failed to sync connection ${connectionId}: ${error.message}`;
          this.logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      result.duration = Date.now() - startTime;
      this.logger.log(
        `Metrics sync completed: ${result.campaignsSynced} campaigns synced in ${result.duration}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Metrics sync job failed: ${error.message}`);
      result.success = false;
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Gets active campaigns to sync
   */
  private async getActiveCampaigns(campaignIds?: string[]) {
    const where: any = { status: 'active' };

    if (campaignIds && campaignIds.length > 0) {
      where.id = { in: campaignIds };
    }

    return this.prisma.adCampaign.findMany({
      where,
      include: { connection: true },
    });
  }

  /**
   * Groups campaigns by connection ID
   */
  private groupCampaignsByConnection(campaigns: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    for (const campaign of campaigns) {
      const existing = groups.get(campaign.connectionId) || [];
      existing.push(campaign);
      groups.set(campaign.connectionId, existing);
    }

    return groups;
  }

  /**
   * Syncs metrics for all campaigns in a connection
   */
  private async syncConnectionCampaigns(
    connectionId: string,
    campaigns: any[],
  ): Promise<number> {
    const connection = campaigns[0].connection;
    const adapter = this.adapters.get(connection.network);

    if (!adapter) {
      throw new Error(`Adapter not found for network: ${connection.network}`);
    }

    // Decrypt API key
    const apiKey = this.encryptionService.decrypt(connection.apiKey);

    // Get external campaign IDs
    const externalIds = campaigns.map((c) => c.externalCampaignId);

    // Sync metrics from network
    const syncResult = await adapter.syncMetrics(
      { apiKey, isSandbox: connection.isSandbox },
      externalIds,
    );

    if (!syncResult.success || !syncResult.metrics) {
      throw new Error(`Metrics sync failed: ${syncResult.errors?.join(', ')}`);
    }

    // Save metrics to database
    for (const metric of syncResult.metrics) {
      const campaign = campaigns.find((c) => c.externalCampaignId === metric.externalCampaignId);
      if (!campaign) continue;

      // Calculate EPC and ROI
      const epc = metric.clicks > 0 ? 0 / metric.clicks : 0; // Will be updated by conversion tracker
      const roi = metric.spend > 0 ? (0 - metric.spend) / metric.spend * 100 : 0; // Will be updated

      await this.prisma.adMetric.create({
        data: {
          campaignId: campaign.id,
          impressions: metric.impressions,
          clicks: metric.clicks,
          spend: new Decimal(metric.spend),
          conversions: 0, // Updated by conversion tracker
          revenue: new Decimal(0), // Updated by conversion tracker
          ctr: new Decimal(metric.ctr),
          epc: new Decimal(metric.ctr),
          roi: new Decimal(roi.toFixed(2)),
          timestamp: metric.timestamp,
        },
      });

      // Update campaign total spent
      await this.prisma.adCampaign.update({
        where: { id: campaign.id },
        data: {
          totalSpent: { increment: new Decimal(metric.spend) },
        },
      });
    }

    this.logger.log(`Synced metrics for ${syncResult.metrics.length} ${connection.network} campaigns`);

    return syncResult.metrics.length;
  }

  /**
   * Triggers manual metrics sync
   */
  async triggerManualSync(campaignIds?: string[]): Promise<void> {
    const queue = this.queueConfig.createQueue('ad-metrics-sync');
    await queue.add('manual-metrics-sync', { forceSync: true, campaignIds });
    this.logger.log('Manual metrics sync triggered');
  }
}
