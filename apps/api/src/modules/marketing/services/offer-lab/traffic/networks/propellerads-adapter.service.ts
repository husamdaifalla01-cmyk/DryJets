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
 * PropellerAds Traffic Network Adapter
 *
 * Integration with PropellerAds advertising network.
 * Supports: Push notifications, in-page push, pop-unders, interstitials.
 *
 * API Docs: https://docs.propellerads.com/
 * Minimum daily budget: $5
 */
@Injectable()
export class PropellerAdsAdapterService implements TrafficAdapter {
  private readonly logger = new Logger(PropellerAdsAdapterService.name);
  private readonly API_BASE_URL = 'https://ssp-api.propellerads.com/v5';
  private readonly MIN_DAILY_BUDGET = 5;

  getNetworkName(): string {
    return 'propellerads';
  }

  getMinimumDailyBudget(): number {
    return this.MIN_DAILY_BUDGET;
  }

  getSupportedGeos(): string[] {
    return [
      'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE',
      'NO', 'DK', 'FI', 'IE', 'NZ', 'SG', 'MY', 'TH', 'PH', 'ID',
      'IN', 'PK', 'BD', 'BR', 'MX', 'AR', 'CO', 'PE', 'CL', 'ZA',
      'RU', 'UA', 'PL', 'CZ', 'RO', 'GR', 'PT', 'HU', 'AT', 'CH',
    ];
  }

  async validateConfig(config: TrafficAdapterConfig): Promise<boolean> {
    if (config.isSandbox) {
      this.logger.log('[SANDBOX] Skipping PropellerAds API validation');
      return true;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(`PropellerAds API validation failed: ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      this.logger.log(`PropellerAds API validated. Account balance: $${data.balance}`);
      return true;
    } catch (error) {
      this.logger.error(`PropellerAds API validation error: ${error.message}`);
      return false;
    }
  }

  async createCampaign(
    config: TrafficAdapterConfig,
    options: CampaignCreateOptions,
  ): Promise<CreateCampaignResult> {
    if (config.isSandbox) {
      const mockId = `propellerads_sandbox_${Date.now()}`;
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
        target_url: options.targetUrl,
        daily_budget: options.dailyBudget,
        targeting: {
          countries: options.targetGeos,
          devices: options.targetDevices || ['desktop', 'mobile', 'tablet'],
        },
        cpc_bid: options.bidAmount || 0.001,
        status: 'active',
        ad_format: 'onclick', // Pop-under format
      };

      const response = await fetch(`${this.API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('PropellerAds campaign creation failed', error);
        return {
          success: false,
          message: error.message || 'Campaign creation failed',
          errors: error.errors || [],
        };
      }

      const data = await response.json();
      this.logger.log(`PropellerAds campaign created: ${data.id}`);

      return {
        success: true,
        externalCampaignId: data.id.toString(),
        message: 'Campaign created successfully',
      };
    } catch (error) {
      this.logger.error(`PropellerAds campaign creation error: ${error.message}`);
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
      if (options.bidAmount) payload.cpc_bid = options.bidAmount;

      const response = await fetch(
        `${this.API_BASE_URL}/campaigns/${options.externalCampaignId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
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
      this.logger.error(`PropellerAds campaign update error: ${error.message}`);
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
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'paused' }),
        },
      );

      if (!response.ok) {
        return { success: false, message: 'Failed to pause campaign' };
      }

      this.logger.log(`PropellerAds campaign paused: ${externalCampaignId}. Reason: ${reason}`);
      return { success: true, message: 'Campaign paused successfully' };
    } catch (error) {
      this.logger.error(`PropellerAds pause error: ${error.message}`);
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
        impressions: Math.floor(Math.random() * 15000) + 2000,
        clicks: Math.floor(Math.random() * 300) + 30,
        spent: Math.random() * 60 + 8,
        ctr: Math.random() * 2.5 + 0.8,
        cpc: Math.random() * 0.4 + 0.08,
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
      const today = new Date().toISOString().split('T')[0];

      for (const campaignId of externalCampaignIds) {
        const response = await fetch(
          `${this.API_BASE_URL}/statistics/campaigns/${campaignId}?date_from=${today}&date_to=${today}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const stats = data.data?.[0] || {};
          const ctr = stats.clicks > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
          const cpc = stats.clicks > 0 ? stats.spent / stats.clicks : 0;

          metrics.push({
            externalCampaignId: campaignId,
            impressions: stats.impressions || 0,
            clicks: stats.clicks || 0,
            spent: stats.spent || 0,
            ctr: parseFloat(ctr.toFixed(2)),
            cpc: parseFloat(cpc.toFixed(4)),
            timestamp: new Date(),
          });
        }
      }

      this.logger.log(`Synced metrics for ${metrics.length} PropellerAds campaigns`);

      return {
        success: true,
        metrics,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`PropellerAds metrics sync error: ${error.message}`);
      return {
        success: false,
        errors: [error.message],
        duration: Date.now() - startTime,
      };
    }
  }
}
