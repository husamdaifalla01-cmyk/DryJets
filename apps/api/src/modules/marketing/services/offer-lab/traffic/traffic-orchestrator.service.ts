import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../encryption.service';
import { AdGeneratorService } from './ad-generator.service';
import { PauseRulesService } from './pause-rules.service';
import { PopAdsAdapterService } from './networks/popads-adapter.service';
import { PropellerAdsAdapterService } from './networks/propellerads-adapter.service';
import { TrafficAdapter } from './traffic-adapter.interface';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Traffic Orchestrator Service
 *
 * Master service for campaign lifecycle:
 * 1. Creates campaigns with ad variants
 * 2. Launches on traffic networks
 * 3. Monitors performance
 * 4. Auto-pauses underperforming campaigns
 * 5. Scales winning campaigns
 */

export interface LaunchCampaignOptions {
  offerId: string;
  funnelId: string;
  connectionId: string;
  targetGeos: string[];
  dailyBudget: number;
  targetDevices?: string[];
}

export interface LaunchCampaignResult {
  success: boolean;
  campaignId?: string;
  externalCampaignId?: string;
  variantsCreated?: number;
  message?: string;
  errors?: string[];
}

@Injectable()
export class TrafficOrchestratorService {
  private readonly logger = new Logger(TrafficOrchestratorService.name);
  private readonly adapters: Map<string, TrafficAdapter>;
  private readonly globalBudgetCap: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly adGenerator: AdGeneratorService,
    private readonly pauseRules: PauseRulesService,
    private readonly popAdsAdapter: PopAdsAdapterService,
    private readonly propellerAdsAdapter: PropellerAdsAdapterService,
  ) {
    // Register traffic adapters
    this.adapters = new Map([
      ['popads', popAdsAdapter],
      ['propellerads', propellerAdsAdapter],
    ]);

    this.globalBudgetCap = parseFloat(
      this.configService.get<string>('OFFERLAB_GLOBAL_BUDGET_CAP') || '300',
    );
  }

  /**
   * Launches a new test campaign
   */
  async launchCampaign(options: LaunchCampaignOptions): Promise<LaunchCampaignResult> {
    try {
      // 1. Validate inputs
      const validation = await this.validateLaunchOptions(options);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      // 2. Get connection and offer details
      const connection = await this.prisma.trafficConnection.findUnique({
        where: { id: options.connectionId },
      });

      const offer = await this.prisma.offer.findUnique({
        where: { id: options.offerId },
      });

      const funnel = await this.prisma.funnel.findUnique({
        where: { id: options.funnelId },
      });

      if (!connection || !offer || !funnel) {
        return { success: false, errors: ['Connection, offer, or funnel not found'] };
      }

      // 3. Generate ad variants
      const variants = await this.adGenerator.generateVariants({
        offerTitle: offer.title,
        offerCategory: offer.category,
        targetGeo: options.targetGeos[0],
        includeImages: false, // Skip images for now (speeds up testing)
      });

      // 4. Get traffic adapter
      const adapter = this.adapters.get(connection.network);
      if (!adapter) {
        return { success: false, errors: [`Adapter not found for network: ${connection.network}`] };
      }

      // 5. Decrypt API key
      const apiKey = this.encryptionService.decrypt(connection.apiKey);

      // 6. Create campaign in database first
      const campaign = await this.prisma.adCampaign.create({
        data: {
          connectionId: connection.id,
          offerId: offer.id,
          funnelId: funnel.id,
          name: `${offer.title.substring(0, 30)} - ${options.targetGeos.join(',')}`,
          dailyBudget: new Decimal(options.dailyBudget),
          totalSpent: new Decimal(0),
          status: 'active',
          targetGeos: options.targetGeos,
          targetDevices: options.targetDevices || ['desktop', 'mobile'],
          externalCampaignId: '', // Will be updated after network creation
          launchedAt: new Date(),
        },
      });

      // 7. Create campaign on traffic network
      const funnelUrl = `${this.configService.get('APP_URL')}/f/${funnel.id}`;
      const networkResult = await adapter.createCampaign(
        { apiKey, isSandbox: connection.isSandbox },
        {
          campaignName: campaign.name,
          targetUrl: funnelUrl,
          dailyBudget: options.dailyBudget,
          targetGeos: options.targetGeos,
          targetDevices: options.targetDevices,
        },
      );

      if (!networkResult.success) {
        // Rollback database campaign
        await this.prisma.adCampaign.delete({ where: { id: campaign.id } });
        return {
          success: false,
          errors: networkResult.errors || [networkResult.message],
        };
      }

      // 8. Update campaign with external ID
      await this.prisma.adCampaign.update({
        where: { id: campaign.id },
        data: { externalCampaignId: networkResult.externalCampaignId },
      });

      // 9. Save ad variants to database
      for (const variant of variants) {
        await this.prisma.adVariant.create({
          data: {
            campaignId: campaign.id,
            headline: variant.headline,
            description: variant.description,
            callToAction: variant.callToAction,
            imageUrl: variant.imageUrl,
            angle: variant.angle,
          },
        });
      }

      // 10. Create initial metrics record
      await this.prisma.adMetric.create({
        data: {
          campaignId: campaign.id,
          impressions: 0,
          clicks: 0,
          spent: new Decimal(0),
          conversions: 0,
          revenue: new Decimal(0),
          ctr: new Decimal(0),
          epc: new Decimal(0),
          roi: new Decimal(0),
          recordedAt: new Date(),
        },
      });

      this.logger.log(`Campaign launched successfully: ${campaign.id} (${networkResult.externalCampaignId})`);

      return {
        success: true,
        campaignId: campaign.id,
        externalCampaignId: networkResult.externalCampaignId,
        variantsCreated: variants.length,
        message: 'Campaign launched successfully',
      };
    } catch (error) {
      this.logger.error(`Campaign launch error: ${error.message}`);
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Validates launch options
   */
  private async validateLaunchOptions(options: LaunchCampaignOptions) {
    const errors: string[] = [];

    // Check global budget cap
    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { dailyBudget: true },
    });

    const totalDailySpend = activeCampaigns.reduce(
      (sum, c) => sum + parseFloat(c.dailyBudget.toString()),
      0,
    );

    if (totalDailySpend + options.dailyBudget > this.globalBudgetCap) {
      errors.push(
        `Global budget cap exceeded. Current: $${totalDailySpend}, Cap: $${this.globalBudgetCap}`,
      );
    }

    // Validate daily budget minimum
    if (options.dailyBudget < 5) {
      errors.push('Daily budget must be at least $5');
    }

    // Validate GEOs
    if (!options.targetGeos || options.targetGeos.length === 0) {
      errors.push('At least one target GEO is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Pauses a campaign
   */
  async pauseCampaign(campaignId: string, reason: string): Promise<boolean> {
    try {
      const campaign = await this.prisma.adCampaign.findUnique({
        where: { id: campaignId },
        include: { connection: true },
      });

      if (!campaign) {
        this.logger.error(`Campaign not found: ${campaignId}`);
        return false;
      }

      // Pause on traffic network
      const adapter = this.adapters.get(campaign.connection.network);
      if (adapter) {
        const apiKey = this.encryptionService.decrypt(campaign.connection.apiKey);
        await adapter.pauseCampaign(
          { apiKey, isSandbox: campaign.connection.isSandbox },
          campaign.externalCampaignId,
          reason,
        );
      }

      // Update database
      await this.prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: 'paused',
          pauseReason: reason,
          pausedAt: new Date(),
        },
      });

      this.logger.log(`Campaign paused: ${campaignId}. Reason: ${reason}`);
      return true;
    } catch (error) {
      this.logger.error(`Pause campaign error: ${error.message}`);
      return false;
    }
  }

  /**
   * Evaluates all active campaigns for auto-pause
   */
  async evaluateActiveCampaigns(): Promise<number> {
    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      include: {
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    let pausedCount = 0;

    for (const campaign of activeCampaigns) {
      const latestMetric = campaign.metrics[0];
      if (!latestMetric) continue;

      const metrics = this.pauseRules.calculateMetrics({
        impressions: latestMetric.impressions,
        clicks: latestMetric.clicks,
        spent: parseFloat(latestMetric.spent.toString()),
        conversions: latestMetric.conversions,
        revenue: parseFloat(latestMetric.revenue.toString()),
      });

      const decision = this.pauseRules.evaluateCampaign(
        metrics,
        parseFloat(campaign.dailyBudget.toString()),
      );

      this.pauseRules.logPauseDecision(campaign.id, decision, metrics);

      if (decision.shouldPause) {
        await this.pauseCampaign(campaign.id, decision.reason);
        pausedCount++;
      }
    }

    return pausedCount;
  }
}
