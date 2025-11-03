import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import {
  NetworkAdapter,
  NetworkAdapterConfig,
  RawOffer,
  SyncResult,
} from '../network-adapter.interface';

/**
 * MaxBounty adapter using Playwright for web scraping
 * Logs into MaxBounty publisher dashboard and extracts approved offers
 */
@Injectable()
export class MaxBountyAdapterService implements NetworkAdapter {
  private readonly logger = new Logger(MaxBountyAdapterService.name);
  readonly networkName = 'maxbounty';

  private readonly LOGIN_URL = 'https://www.maxbounty.com/login.cfm';
  private readonly OFFERS_URL = 'https://www.maxbounty.com/offers.cfm';

  /**
   * Fetch approved offers from MaxBounty
   */
  async fetchOffers(config: NetworkAdapterConfig): Promise<SyncResult> {
    const startTime = Date.now();
    let browser: Browser | null = null;

    try {
      this.logger.log('Starting MaxBounty scraper...');

      // Launch browser
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      // Sandbox mode: return mock data
      if (config.isSandbox) {
        this.logger.log('Sandbox mode enabled - returning mock offers');
        await browser.close();
        return this.getMockOffers(startTime);
      }

      // Step 1: Login
      await this.login(page, config);
      this.logger.log('✓ Login successful');

      // Step 2: Navigate to offers page
      await page.goto(this.OFFERS_URL, { waitUntil: 'networkidle' });
      this.logger.log('✓ Navigated to offers page');

      // Step 3: Filter for approved offers
      const offers = await this.scrapeOffers(page);
      this.logger.log(`✓ Scraped ${offers.length} offers`);

      await browser.close();

      const duration = Date.now() - startTime;
      return {
        success: true,
        offersFound: offers.length,
        offers,
        duration,
      };
    } catch (error) {
      this.logger.error(`MaxBounty scraper error: ${error.message}`, error.stack);

      if (browser) {
        await browser.close();
      }

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
   * Login to MaxBounty
   */
  private async login(page: Page, config: NetworkAdapterConfig): Promise<void> {
    if (!config.username || !config.password) {
      throw new Error('MaxBounty username and password are required');
    }

    await page.goto(this.LOGIN_URL, { waitUntil: 'networkidle' });

    // Fill login form
    await page.fill('input[name="username"]', config.username);
    await page.fill('input[name="password"]', config.password);

    // Submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"], input[type="submit"]'),
    ]);

    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      // @ts-ignore - Running in browser context via Puppeteer
      return !(window as any).location.href.includes('login');
    });

    if (!isLoggedIn) {
      throw new Error('MaxBounty login failed - invalid credentials or page structure changed');
    }
  }

  /**
   * Scrape approved offers from the offers page
   */
  private async scrapeOffers(page: Page): Promise<RawOffer[]> {
    const offers: RawOffer[] = [];

    try {
      // Wait for offers table to load
      await page.waitForSelector('table.offers-table, .offer-row, #offers-container', {
        timeout: 10000,
      });

      // Extract offer data
      // @ts-ignore - Running in browser context via Puppeteer
      const rawOffers = await page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        // FIX: Cast document to any to avoid TS2584 error in Node.js environment
        const doc = document as any;
        const offerRows = Array.from(
          doc.querySelectorAll('tr.offer-row, .offer-item, table.offers-table tbody tr'),
        );

        return offerRows.map((row: any) => {
          try {
            // Extract data from table cells or divs
            const cells = row.querySelectorAll('td, .offer-cell');

            const getId = () => {
              const idCell = row.querySelector('[data-offer-id], .offer-id');
              return idCell ? idCell.textContent.trim() : '';
            };

            const getTitle = () => {
              const titleCell = row.querySelector('.offer-title, .offer-name, td:nth-child(2) a');
              return titleCell ? titleCell.textContent.trim() : 'Untitled Offer';
            };

            const getPayout = () => {
              const payoutCell = row.querySelector('.payout, .offer-payout, td:nth-child(4)');
              const payoutText = payoutCell ? payoutCell.textContent.trim() : '0';
              return parseFloat(payoutText.replace(/[$,]/g, '')) || 0;
            };

            const getEPC = () => {
              const epcCell = row.querySelector('.epc, .offer-epc, td:nth-child(5)');
              const epcText = epcCell ? epcCell.textContent.trim() : '0';
              return parseFloat(epcText.replace(/[$,]/g, '')) || 0;
            };

            const getCategory = () => {
              const categoryCell = row.querySelector('.category, .offer-category, td:nth-child(3)');
              return categoryCell ? categoryCell.textContent.trim() : 'General';
            };

            const getGeos = () => {
              const geoCell = row.querySelector('.geo, .countries, td:nth-child(6)');
              const geoText = geoCell ? geoCell.textContent.trim() : 'US';
              return geoText.split(/[,;]/).map((g: string) => g.trim());
            };

            return {
              externalId: getId(),
              title: getTitle(),
              payout: getPayout(),
              epc: getEPC(),
              category: getCategory(),
              geos: getGeos(),
            };
          } catch (err) {
            console.error('Error parsing offer row:', err);
            return null;
          }
        }).filter((offer) => offer !== null);
      });

      // Transform to RawOffer format
      for (const raw of rawOffers) {
        if (!raw.externalId || !raw.title) continue;

        offers.push({
          externalId: raw.externalId,
          title: raw.title,
          category: [raw.category],
          description: `MaxBounty offer: ${raw.title}`,
          epc: raw.epc,
          payout: raw.payout,
          currency: 'USD',
          conversionRate: null,
          geoTargets: raw.geos,
          allowedTraffic: ['email', 'social', 'search', 'display'],
          creativeUrls: [],
          previewUrl: `https://www.maxbounty.com/offer/${raw.externalId}`,
          terms: 'See MaxBounty dashboard for full terms',
        });
      }

      return offers;
    } catch (error) {
      this.logger.error(`Error scraping offers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  async validateConfig(config: NetworkAdapterConfig): Promise<boolean> {
    if (config.isSandbox) return true;

    if (!config.username || !config.password) {
      return false;
    }

    // Try to login with a quick test
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      await this.login(page, config);

      await browser.close();
      return true;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      return false;
    }
  }

  /**
   * Get mock offers for sandbox mode
   */
  private getMockOffers(startTime: number): SyncResult {
    const mockOffers: RawOffer[] = [
      {
        externalId: 'MB12345',
        title: 'Health Insurance Quotes - Exclusive',
        category: ['Insurance', 'Health'],
        description: 'Generate leads for health insurance quotes. High converting offer.',
        epc: 3.45,
        payout: 25.0,
        currency: 'USD',
        conversionRate: 2.5,
        geoTargets: ['US', 'CA'],
        allowedTraffic: ['email', 'social', 'search'],
        creativeUrls: [],
        previewUrl: 'https://maxbounty.com/offer/MB12345',
        terms: 'No incent traffic allowed',
      },
      {
        externalId: 'MB12346',
        title: 'Weight Loss Trial - CPA',
        category: ['Health & Wellness', 'Weight Loss'],
        description: 'Free trial offer for weight loss supplement',
        epc: 2.89,
        payout: 35.0,
        currency: 'USD',
        conversionRate: 3.2,
        geoTargets: ['US', 'UK', 'AU'],
        allowedTraffic: ['email', 'social', 'native'],
        creativeUrls: [],
        previewUrl: 'https://maxbounty.com/offer/MB12346',
        terms: 'Must be 18+',
      },
      {
        externalId: 'MB12347',
        title: 'Credit Score Monitoring - SOI',
        category: ['Finance', 'Credit'],
        description: 'Single opt-in lead gen for credit monitoring',
        epc: 4.12,
        payout: 18.0,
        currency: 'USD',
        conversionRate: 4.5,
        geoTargets: ['US'],
        allowedTraffic: ['email', 'display', 'search'],
        creativeUrls: [],
        previewUrl: 'https://maxbounty.com/offer/MB12347',
        terms: 'No incentivized traffic',
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
