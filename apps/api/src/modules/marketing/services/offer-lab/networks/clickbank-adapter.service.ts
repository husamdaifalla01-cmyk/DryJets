import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  NetworkAdapter,
  NetworkAdapterConfig,
  RawOffer,
  SyncResult,
} from '../network-adapter.interface';

/**
 * ClickBank adapter using their Marketplace API
 * Fetches approved offers via REST API
 */
@Injectable()
export class ClickBankAdapterService implements NetworkAdapter {
  private readonly logger = new Logger(ClickBankAdapterService.name);
  readonly networkName = 'clickbank';

  private readonly API_BASE_URL = 'https://api.clickbank.com/rest/1.3';
  private readonly MARKETPLACE_URL = `${this.API_BASE_URL}/marketplace/list`;

  constructor(private readonly http: HttpService) {}

  /**
   * Fetch approved offers from ClickBank
   */
  async fetchOffers(config: NetworkAdapterConfig): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting ClickBank API sync...');

      // Sandbox mode: return mock data
      if (config.isSandbox) {
        this.logger.log('Sandbox mode enabled - returning mock offers');
        return this.getMockOffers(startTime);
      }

      if (!config.apiKey) {
        throw new Error('ClickBank API key is required');
      }

      // Fetch from ClickBank API
      const offers = await this.fetchFromAPI(config);
      this.logger.log(`✓ Fetched ${offers.length} offers from ClickBank`);

      const duration = Date.now() - startTime;
      return {
        success: true,
        offersFound: offers.length,
        offers,
        duration,
      };
    } catch (error) {
      this.logger.error(`ClickBank API error: ${error.message}`, error.stack);

      const duration = Date.now() - startTime;
      return {
        success: false,
        offersFound: 0,
        offers: [],
        duration,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Fetch from ClickBank Marketplace API
   */
  private async fetchFromAPI(config: NetworkAdapterConfig): Promise<RawOffer[]> {
    const offers: RawOffer[] = [];

    try {
      // ClickBank API authentication (Developer API key)
      const headers = {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      };

      // Fetch marketplace data (paginated)
      let page = 1;
      const pageSize = 50;
      let hasMore = true;

      while (hasMore && page <= 10) {
        // Limit to 10 pages for safety
        const response = await firstValueFrom(
          this.http.get(this.MARKETPLACE_URL, {
            headers,
            params: {
              page,
              pageSize,
              sort: 'gravity', // Sort by gravity (popularity)
            },
          }),
        );

        const data = response.data;

        if (!data || !data.results || data.results.length === 0) {
          hasMore = false;
          break;
        }

        // Parse offers
        for (const item of data.results) {
          const offer = this.parseClickBankOffer(item);
          if (offer) {
            offers.push(offer);
          }
        }

        page++;
        hasMore = data.results.length === pageSize;

        // Rate limiting: wait 200ms between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return offers;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('ClickBank API authentication failed - invalid API key');
      } else if (error.response?.status === 429) {
        throw new Error('ClickBank API rate limit exceeded');
      }
      throw error;
    }
  }

  /**
   * Parse ClickBank offer from API response
   */
  private parseClickBankOffer(item: any): RawOffer | null {
    try {
      const {
        site,
        title,
        description,
        category,
        initialSale,
        averageEarnings,
        gravity,
        rebillAmount,
      } = item;

      if (!site || !title) {
        return null;
      }

      // Calculate EPC estimate (ClickBank doesn't provide direct EPC)
      // Use gravity as a proxy: higher gravity = higher EPC estimate
      const epcEstimate = gravity ? parseFloat(gravity) * 0.1 : 0;

      // Payout is initial sale commission
      const payout = initialSale ? parseFloat(initialSale) : 0;

      // Estimate conversion rate based on gravity
      const conversionRate = gravity > 50 ? 3.5 : gravity > 20 ? 2.5 : 1.5;

      return {
        externalId: site,
        title: title,
        category: category ? [category] : ['General'],
        description: description || `ClickBank offer: ${title}`,
        epc: epcEstimate,
        payout: payout,
        currency: 'USD',
        conversionRate,
        geoTargets: ['US', 'CA', 'UK', 'AU', 'NZ'], // ClickBank supports international
        allowedTraffic: ['email', 'social', 'search', 'display', 'native'],
        creativeUrls: [],
        previewUrl: `https://hop.clickbank.net/?vendor=${site}`,
        terms: 'See ClickBank marketplace for full terms',
      };
    } catch (error) {
      this.logger.error(`Error parsing ClickBank offer: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate configuration
   */
  async validateConfig(config: NetworkAdapterConfig): Promise<boolean> {
    if (config.isSandbox) return true;

    if (!config.apiKey) {
      return false;
    }

    // Test API key with a simple request
    try {
      const headers = {
        Authorization: `Bearer ${config.apiKey}`,
      };

      const response = await firstValueFrom(
        this.http.get(this.MARKETPLACE_URL, {
          headers,
          params: { page: 1, pageSize: 1 },
          timeout: 5000,
        }),
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate tracking link for ClickBank offer
   */
  async generateTrackingLink(
    offerId: string,
    config: NetworkAdapterConfig,
  ): Promise<string | null> {
    if (config.isSandbox) {
      return `https://hop.clickbank.net/?vendor=${offerId}&affiliate=TESTAFFILIATE&subid=test123`;
    }

    // ClickBank doesn't require API to generate links - it's a simple URL pattern
    // Format: https://hop.clickbank.net/?vendor=VENDOR_ID&affiliate=YOUR_NICKNAME
    // Note: The actual affiliate nickname should be stored in config or user settings

    const affiliateNickname = config.username || 'YOUR_NICKNAME';
    const subId = `offer_${offerId}_${Date.now()}`;

    return `https://hop.clickbank.net/?vendor=${offerId}&affiliate=${affiliateNickname}&subid=${subId}`;
  }

  /**
   * Get mock offers for sandbox mode
   */
  private getMockOffers(startTime: number): SyncResult {
    const mockOffers: RawOffer[] = [
      {
        externalId: 'testvendor1',
        title: 'The Ultimate Keto Meal Plan',
        category: ['Health & Fitness'],
        description: 'Complete keto meal planning system with recipes and shopping lists',
        epc: 2.87,
        payout: 37.0,
        currency: 'USD',
        conversionRate: 2.8,
        geoTargets: ['US', 'CA', 'UK', 'AU'],
        allowedTraffic: ['email', 'social', 'search', 'native'],
        creativeUrls: [],
        previewUrl: 'https://hop.clickbank.net/?vendor=testvendor1',
        terms: 'No incentivized traffic',
      },
      {
        externalId: 'testvendor2',
        title: 'Woodworking Plans & Projects',
        category: ['Hobbies & Crafts'],
        description: '16,000 woodworking plans with step-by-step instructions',
        epc: 1.95,
        payout: 45.0,
        currency: 'USD',
        conversionRate: 2.2,
        geoTargets: ['US', 'UK', 'CA', 'AU', 'NZ'],
        allowedTraffic: ['email', 'social', 'display', 'search'],
        creativeUrls: [],
        previewUrl: 'https://hop.clickbank.net/?vendor=testvendor2',
        terms: 'Physical products allowed',
      },
      {
        externalId: 'testvendor3',
        title: 'Numerology Reading System',
        category: ['Spirituality & New Age'],
        description: 'Personalized numerology readings and reports',
        epc: 3.42,
        payout: 28.0,
        currency: 'USD',
        conversionRate: 3.8,
        geoTargets: ['US', 'UK', 'AU', 'CA'],
        allowedTraffic: ['email', 'social', 'native', 'display'],
        creativeUrls: [],
        previewUrl: 'https://hop.clickbank.net/?vendor=testvendor3',
        terms: 'Must be compliant with advertising policies',
      },
      {
        externalId: 'testvendor4',
        title: 'Online Business From Home Course',
        category: ['Business & Marketing'],
        description: 'Complete training to start an online business',
        epc: 4.15,
        payout: 97.0,
        currency: 'USD',
        conversionRate: 1.9,
        geoTargets: ['US', 'CA', 'UK', 'AU', 'NZ', 'IE'],
        allowedTraffic: ['email', 'social', 'search', 'display'],
        creativeUrls: [],
        previewUrl: 'https://hop.clickbank.net/?vendor=testvendor4',
        terms: 'No spam or misleading claims',
      },
    ];

    return {
      success: true,
      offersFound: mockOffers.length,
      offers: mockOffers,
      duration: Date.now() - startTime,
    };
  }
}
