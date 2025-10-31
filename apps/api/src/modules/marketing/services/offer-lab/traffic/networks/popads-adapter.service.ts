import { Injectable, Logger } from '@nestjs/common';
import {
  TrafficAdapter,
  TrafficAdapterConfig,
  CampaignCreateOptions,
  CampaignUpdateOptions,
  CreateCampaignResult,
  MetricsSyncResult,
  PauseCampaignResult,
  CampaignMetrics,
} from '../traffic-adapter.interface';

/**
 * PopAds Traffic Network Adapter
 *
 * Integration with PopAds advertising network.
 * Supports: Pop-unders, pop-ups, in-page push.
 *
 * API Docs: https://www.popads.net/api-documentation
 * Minimum daily budget: $5
 */
@Injectable()
export class PopAdsAdapterService implements TrafficAdapter {
  private readonly logger = new Logger(PopAdsAdapterService.name);
  private readonly API_BASE_URL = 'https://www.popads.net/api/v2';
  private readonly MIN_DAILY_BUDGET = 5;

  getNetworkName(): string {
    return 'popads';
  }

  getMinimumDailyBudget(): number {
    return this.MIN_DAILY_BUDGET;
  }

  getSupportedGeos(): string[] {
    return [
      'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE',
      'NO', 'DK', 'FI', 'IE', 'NZ', 'SG', 'MY', 'TH', 'PH', 'ID',
      'IN', 'PK', 'BD', 'BR', 'MX', 'AR', 'CO', 'PE', 'CL', 'ZA',
    ];
  }

  async validateConfig(config: TrafficAdapterConfig): Promise<boolean> {
    if (config.isSandbox) {
      this.logger.log('[SANDBOX] Skipping PopAds API validation');
      return true;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/account/info`, {
        method: 'GET',
        headers: {
          'X-API-Key': config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(`PopAds API validation failed: ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      this.logger.log(`PopAds API validated. Account balance: $${data.balance}`);
      return true;
    } catch (error) {
      this.logger.error(`PopAds API validation error: ${error.message}`);
      return false;
    }
  }

  async createCampaign(
    config: TrafficAdapterConfig,
    options: CampaignCreateOptions,
  ): Promise<CreateCampaignResult> {
    if (config.isSandbox) {
      const mockId = `popads_sandbox_${Date.now()}`;
      this.logger.log('[SANDBOX] Mock campaign created', {
        externalCampaignId: mockId,
        ...options,
      });
      return {
        success: true,
        externalCampaignId: mockId,
        message: 'Sandbox campaign created successfully',
      };
    }

    try {
      // Validate budget
      if (options.dailyBudget < this.MIN_DAILY_BUDGET) {
        return {
          success: false,
          message: `Daily budget must be at least $${this.MIN_DAILY_BUDGET}`,
          errors: ['BUDGET_TOO_LOW'],
        };
      }

      const payload = {
        name: options.campaignName,
        url: options.targetUrl,
        daily_budget: options.dailyBudget,
        countries: options.targetGeos,
        devices: options.targetDevices || ['desktop', 'mobile', 'tablet'],
        bid: options.bidAmount || 0.001, // Default CPC bid
        status: 'active',
      };

      const response = await fetch(`${this.API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'X-API-Key': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('PopAds campaign creation failed', error);
        return {
          success: false,
          message: error.message || 'Campaign creation failed',
          errors: error.errors || [],
        };
      }

      const data = await response.json();
      this.logger.log(`PopAds campaign created: ${data.campaign_id}`);

      return {
        success: true,
        externalCampaignId: data.campaign_id.toString(),
        message: 'Campaign created successfully',
      };
    } catch (error) {
      this.logger.error(`PopAds campaign creation error: ${error.message}`);
      return {
        success: false,
        message: error.message,
        errors: ['NETWORK_ERROR'],
      };
    }
  }

  async updateCampaign(
    config: TrafficAdapterConfig,
    options: CampaignUpdateOptions,
  ): Promise<CreateCampaignResult> {
    if (config.isSandbox) {
      this.logger.log('[SANDBOX] Mock campaign updated', options);
      return {
        success: true,
        externalCampaignId: options.externalCampaignId,
        message: 'Sandbox campaign updated successfully',
      };
    }

    try {
      const payload: any = {};
      if (options.dailyBudget) payload.daily_budget = options.dailyBudget;
      if (options.status) payload.status = options.status;
      if (options.bidAmount) payload.bid = options.bidAmount;

      const response = await fetch(
        `${this.API_BASE_URL}/campaigns/${options.externalCampaignId}`,
        {
          method: 'PATCH',
          headers: {
            'X-API-Key': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || 'Update failed',
        };
      }

      return {
        success: true,
        externalCampaignId: options.externalCampaignId,
        message: 'Campaign updated successfully',
      };
    } catch (error) {
      this.logger.error(`PopAds campaign update error: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async pauseCampaign(
    config: TrafficAdapterConfig,
    externalCampaignId: string,
    reason?: string,
  ): Promise<PauseCampaignResult> {
    if (config.isSandbox) {
      this.logger.log('[SANDBOX] Mock campaign paused', { externalCampaignId, reason });
      return {
        success: true,
        message: 'Sandbox campaign paused',
      };
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/campaigns/${externalCampaignId}`,
        {
          method: 'PATCH',
          headers: {
            'X-API-Key': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'paused' }),
        },
      );

      if (!response.ok) {
        return { success: false, message: 'Failed to pause campaign' };
      }

      this.logger.log(`PopAds campaign paused: ${externalCampaignId}. Reason: ${reason}`);
      return { success: true, message: 'Campaign paused successfully' };
    } catch (error) {
      this.logger.error(`PopAds pause error: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async syncMetrics(
    config: TrafficAdapterConfig,
    externalCampaignIds: string[],
  ): Promise<MetricsSyncResult> {
    const startTime = Date.now();

    if (config.isSandbox) {
      const mockMetrics: CampaignMetrics[] = externalCampaignIds.map((id) => ({
        externalCampaignId: id,
        impressions: Math.floor(Math.random() * 10000) + 1000,
        clicks: Math.floor(Math.random() * 200) + 20,
        spent: Math.random() * 50 + 5,
        ctr: Math.random() * 2 + 0.5,
        cpc: Math.random() * 0.5 + 0.1,
        timestamp: new Date(),
      }));

      this.logger.log('[SANDBOX] Mock metrics synced', {
        campaigns: externalCampaignIds.length,
      });

      return {
        success: true,
        metrics: mockMetrics,
        duration: Date.now() - startTime,
      };
    }

    try {
      const metrics: CampaignMetrics[] = [];

      for (const campaignId of externalCampaignIds) {
        const response = await fetch(
          `${this.API_BASE_URL}/campaigns/${campaignId}/stats?period=today`,
          {
            method: 'GET',
            headers: {
              'X-API-Key': config.apiKey,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const ctr = data.clicks > 0 ? (data.clicks / data.impressions) * 100 : 0;
          const cpc = data.clicks > 0 ? data.spent / data.clicks : 0;

          metrics.push({
            externalCampaignId: campaignId,
            impressions: data.impressions || 0,
            clicks: data.clicks || 0,
            spent: data.spent || 0,
            ctr: parseFloat(ctr.toFixed(2)),
            cpc: parseFloat(cpc.toFixed(4)),
            timestamp: new Date(),
          });
        }
      }

      this.logger.log(`Synced metrics for ${metrics.length} PopAds campaigns`);

      return {
        success: true,
        metrics,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`PopAds metrics sync error: ${error.message}`);
      return {
        success: false,
        errors: [error.message],
        duration: Date.now() - startTime,
      };
    }
  }
}
