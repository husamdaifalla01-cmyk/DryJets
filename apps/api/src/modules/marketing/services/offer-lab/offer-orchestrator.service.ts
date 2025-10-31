import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { MaxBountyAdapterService } from './networks/maxbounty-adapter.service';
import { ClickBankAdapterService } from './networks/clickbank-adapter.service';
import { OfferScoringService } from './offer-scoring.service';
import { NetworkAdapter, NetworkAdapterConfig } from './network-adapter.interface';

/**
 * Offer orchestrator service
 * Coordinates offer import, sync, scoring, and database management
 */
@Injectable()
export class OfferOrchestratorService {
  private readonly logger = new Logger(OfferOrchestratorService.name);

  // Network adapter registry
  private readonly adapters: Map<string, NetworkAdapter> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly maxBountyAdapter: MaxBountyAdapterService,
    private readonly clickBankAdapter: ClickBankAdapterService,
    private readonly scoringService: OfferScoringService,
  ) {
    // Register adapters
    this.adapters.set('maxbounty', this.maxBountyAdapter);
    this.adapters.set('clickbank', this.clickBankAdapter);
  }

  /**
   * Sync offers from a specific network
   */
  async syncOffers(network: string, forceRefresh: boolean = false) {
    const startTime = Date.now();
    const adapter = this.adapters.get(network.toLowerCase());

    if (!adapter) {
      throw new Error(`Unsupported network: ${network}`);
    }

    this.logger.log(`Starting sync for network: ${network}`);

    try {
      // Get network configuration
      const config = await this.getNetworkConfig(network);

      // Fetch offers from network
      const syncResult = await adapter.fetchOffers(config);

      // Log scraper execution
      const scraperLog = await this.prisma.scraperLog.create({
        data: {
          network,
          status: syncResult.success ? 'success' : 'error',
          offersFound: syncResult.offersFound,
          errorMessage: syncResult.errorMessage,
          duration: syncResult.duration,
        },
      });

      if (!syncResult.success) {
        throw new Error(syncResult.errorMessage || 'Sync failed');
      }

      // Process and save offers
      const { newCount, updatedCount } = await this.processOffers(
        network,
        syncResult.offers,
        forceRefresh,
      );

      this.logger.log(
        `✓ Sync complete: ${newCount} new, ${updatedCount} updated (${Date.now() - startTime}ms)`,
      );

      return {
        success: true,
        network,
        offersFound: syncResult.offersFound,
        offersNew: newCount,
        offersUpdated: updatedCount,
        duration: Date.now() - startTime,
        logId: scraperLog.id,
      };
    } catch (error) {
      this.logger.error(`Sync error for ${network}: ${error.message}`, error.stack);

      // Log error
      await this.prisma.scraperLog.create({
        data: {
          network,
          status: 'error',
          offersFound: 0,
          errorMessage: error.message,
          duration: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  /**
   * Process and save offers to database
   */
  private async processOffers(
    network: string,
    rawOffers: any[],
    forceRefresh: boolean,
  ): Promise<{ newCount: number; updatedCount: number }> {
    let newCount = 0;
    let updatedCount = 0;

    for (const rawOffer of rawOffers) {
      try {
        // Calculate score
        const score = this.scoringService.calculateScore(rawOffer, network);

        // Check if offer already exists
        const existing = await this.prisma.offer.findUnique({
          where: {
            network_externalId: {
              network,
              externalId: rawOffer.externalId,
            },
          },
        });

        if (existing) {
          // Update existing offer if force refresh or data changed
          if (forceRefresh || this.hasOfferChanged(existing, rawOffer, score)) {
            await this.prisma.offer.update({
              where: { id: existing.id },
              data: {
                title: rawOffer.title,
                category: rawOffer.category,
                description: rawOffer.description,
                epc: rawOffer.epc,
                payout: rawOffer.payout,
                currency: rawOffer.currency,
                conversionRate: rawOffer.conversionRate,
                geoTargets: rawOffer.geoTargets,
                allowedTraffic: rawOffer.allowedTraffic,
                creativeUrls: rawOffer.creativeUrls,
                previewUrl: rawOffer.previewUrl,
                terms: rawOffer.terms,
                score,
                lastSyncedAt: new Date(),
              },
            });
            updatedCount++;
          }
        } else {
          // Create new offer
          await this.prisma.offer.create({
            data: {
              network,
              externalId: rawOffer.externalId,
              title: rawOffer.title,
              category: rawOffer.category,
              description: rawOffer.description,
              epc: rawOffer.epc,
              payout: rawOffer.payout,
              currency: rawOffer.currency,
              conversionRate: rawOffer.conversionRate,
              geoTargets: rawOffer.geoTargets,
              allowedTraffic: rawOffer.allowedTraffic,
              creativeUrls: rawOffer.creativeUrls,
              previewUrl: rawOffer.previewUrl,
              terms: rawOffer.terms,
              score,
              status: 'pending',
            },
          });
          newCount++;
        }
      } catch (error) {
        this.logger.error(
          `Error processing offer ${rawOffer.externalId}: ${error.message}`,
        );
        // Continue processing other offers
      }
    }

    return { newCount, updatedCount };
  }

  /**
   * Check if offer data has changed
   */
  private hasOfferChanged(existing: any, rawOffer: any, newScore: number): boolean {
    return (
      existing.title !== rawOffer.title ||
      existing.epc.toNumber() !== rawOffer.epc ||
      existing.payout.toNumber() !== rawOffer.payout ||
      existing.score.toNumber() !== newScore ||
      JSON.stringify(existing.category) !== JSON.stringify(rawOffer.category)
    );
  }

  /**
   * Get network configuration from environment variables
   */
  private async getNetworkConfig(network: string): Promise<NetworkAdapterConfig> {
    const isSandbox = process.env.OFFERLAB_SANDBOX_MODE === 'true';

    const configs = {
      maxbounty: {
        isSandbox,
        username: process.env.MAXBOUNTY_USERNAME,
        password: process.env.MAXBOUNTY_PASSWORD,
        rateLimit: {
          requestsPerMinute: 10,
          requestsPerHour: 100,
        },
      },
      clickbank: {
        isSandbox,
        apiKey: process.env.CLICKBANK_API_KEY,
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
        },
      },
    };

    return configs[network.toLowerCase()] || { isSandbox: true };
  }

  /**
   * Get top-scored offers
   */
  async getTopOffers(limit: number = 20) {
    return await this.prisma.offer.findMany({
      where: {
        status: { in: ['pending', 'testing'] },
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Recalculate scores for all offers
   */
  async recalculateScores() {
    this.logger.log('Recalculating scores for all offers...');

    const offers = await this.prisma.offer.findMany();
    let updatedCount = 0;

    for (const offer of offers) {
      try {
        // Reconstruct raw offer data
        const rawOffer = {
          externalId: offer.externalId,
          title: offer.title,
          category: offer.category,
          description: offer.description,
          epc: offer.epc.toNumber(),
          payout: offer.payout.toNumber(),
          currency: offer.currency,
          conversionRate: offer.conversionRate?.toNumber(),
          geoTargets: offer.geoTargets,
          allowedTraffic: offer.allowedTraffic,
          creativeUrls: offer.creativeUrls,
          previewUrl: offer.previewUrl,
          terms: offer.terms,
        };

        // Recalculate score
        const newScore = this.scoringService.calculateScore(rawOffer, offer.network);

        // Update if score changed
        if (Math.abs(offer.score.toNumber() - newScore) > 0.01) {
          await this.prisma.offer.update({
            where: { id: offer.id },
            data: { score: newScore },
          });
          updatedCount++;
        }
      } catch (error) {
        this.logger.error(`Error recalculating score for offer ${offer.id}: ${error.message}`);
      }
    }

    this.logger.log(`✓ Recalculated ${updatedCount} offer scores`);
    return { updatedCount };
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics() {
    const [totalOffers, recentLogs, offersByNetwork] = await Promise.all([
      this.prisma.offer.count(),
      this.prisma.scraperLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.offer.groupBy({
        by: ['network'],
        _count: true,
      }),
    ]);

    return {
      totalOffers,
      offersByNetwork: offersByNetwork.map((item) => ({
        network: item.network,
        count: item._count,
      })),
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        network: log.network,
        status: log.status,
        offersFound: log.offersFound,
        duration: log.duration,
        createdAt: log.createdAt,
      })),
    };
  }
}
