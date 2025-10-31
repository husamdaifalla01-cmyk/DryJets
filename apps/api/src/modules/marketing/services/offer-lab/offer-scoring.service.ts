import { Injectable, Logger } from '@nestjs/common';
import { RawOffer } from './network-adapter.interface';

/**
 * Offer scoring service
 * Calculates composite scores for offers based on multiple factors
 *
 * Scoring formula:
 * score = (EPC * 0.4) + (payout * 0.25) + (conversion_rate * 0.2) + (geo_opportunity * 0.1) + (network_reliability * 0.05)
 */
@Injectable()
export class OfferScoringService {
  private readonly logger = new Logger(OfferScoringService.name);

  // Network reliability scores (0-100)
  private readonly networkReliability = {
    maxbounty: 95,
    clickbank: 90,
    digistore24: 88,
    cj: 92,
    awin: 89,
    rakuten: 91,
    shareasale: 87,
    partnerstack: 85,
    impact: 88,
    flexoffers: 84,
  };

  // High-value GEO targets (tier-1 countries)
  private readonly tier1Geos = [
    'US',
    'CA',
    'UK',
    'GB',
    'AU',
    'NZ',
    'DE',
    'FR',
    'SE',
    'NO',
    'DK',
    'CH',
    'NL',
    'BE',
  ];

  /**
   * Calculate score for an offer
   */
  calculateScore(offer: RawOffer, network: string): number {
    try {
      // Normalize components to 0-100 scale
      const epcScore = this.normalizeEPC(offer.epc);
      const payoutScore = this.normalizePayout(offer.payout);
      const conversionScore = this.normalizeConversionRate(offer.conversionRate);
      const geoScore = this.calculateGeoScore(offer.geoTargets);
      const reliabilityScore = this.networkReliability[network.toLowerCase()] || 80;

      // Apply weights
      const weightedScore =
        epcScore * 0.4 +
        payoutScore * 0.25 +
        conversionScore * 0.2 +
        geoScore * 0.1 +
        reliabilityScore * 0.05;

      // Round to 2 decimal places
      return Math.round(weightedScore * 100) / 100;
    } catch (error) {
      this.logger.error(`Error calculating score: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate detailed score breakdown
   */
  calculateDetailedScore(offer: RawOffer, network: string) {
    const epcScore = this.normalizeEPC(offer.epc);
    const payoutScore = this.normalizePayout(offer.payout);
    const conversionScore = this.normalizeConversionRate(offer.conversionRate);
    const geoScore = this.calculateGeoScore(offer.geoTargets);
    const reliabilityScore = this.networkReliability[network.toLowerCase()] || 80;

    const total =
      epcScore * 0.4 +
      payoutScore * 0.25 +
      conversionScore * 0.2 +
      geoScore * 0.1 +
      reliabilityScore * 0.05;

    return {
      total: Math.round(total * 100) / 100,
      breakdown: {
        epcScore: Math.round(epcScore * 100) / 100,
        payoutScore: Math.round(payoutScore * 100) / 100,
        conversionScore: Math.round(conversionScore * 100) / 100,
        geoScore: Math.round(geoScore * 100) / 100,
        reliabilityScore: Math.round(reliabilityScore * 100) / 100,
      },
      weights: {
        epc: 0.4,
        payout: 0.25,
        conversion: 0.2,
        geo: 0.1,
        reliability: 0.05,
      },
    };
  }

  /**
   * Normalize EPC (Earnings Per Click) to 0-100 scale
   * Assumption: EPC ranges from $0 to $10+ (exceptional)
   */
  private normalizeEPC(epc: number): number {
    if (!epc || epc <= 0) return 0;

    // Scale: $5 EPC = 100, logarithmic curve
    const maxEPC = 5;
    const normalized = (epc / maxEPC) * 100;

    return Math.min(normalized, 100);
  }

  /**
   * Normalize payout to 0-100 scale
   * Assumption: Payouts range from $0 to $100+ (exceptional)
   */
  private normalizePayout(payout: number): number {
    if (!payout || payout <= 0) return 0;

    // Scale: $50 payout = 100
    const maxPayout = 50;
    const normalized = (payout / maxPayout) * 100;

    return Math.min(normalized, 100);
  }

  /**
   * Normalize conversion rate to 0-100 scale
   * Assumption: Conversion rates range from 0% to 10%+ (exceptional)
   */
  private normalizeConversionRate(conversionRate?: number): number {
    if (!conversionRate || conversionRate <= 0) return 50; // Default mid-range if not provided

    // Scale: 5% conversion = 100
    const maxConversion = 5;
    const normalized = (conversionRate / maxConversion) * 100;

    return Math.min(normalized, 100);
  }

  /**
   * Calculate GEO opportunity score
   * Based on presence of tier-1 countries
   */
  private calculateGeoScore(geoTargets: string[]): number {
    if (!geoTargets || geoTargets.length === 0) return 50; // Default mid-range

    // Count tier-1 GEOs
    const tier1Count = geoTargets.filter((geo) =>
      this.tier1Geos.includes(geo.toUpperCase()),
    ).length;

    // More tier-1 GEOs = better score
    // 3+ tier-1 GEOs = 100 score
    const score = Math.min((tier1Count / 3) * 100, 100);

    return score;
  }

  /**
   * Rank offers by score
   */
  rankOffers(offers: Array<{ id: string; score: number }>): Array<{ id: string; score: number; rank: number }> {
    // Sort by score descending
    const sorted = [...offers].sort((a, b) => b.score - a.score);

    // Add rank
    return sorted.map((offer, index) => ({
      ...offer,
      rank: index + 1,
    }));
  }

  /**
   * Filter top N offers
   */
  getTopOffers<T extends { score: number }>(offers: T[], count: number = 20): T[] {
    return offers
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Classify offer by score
   */
  classifyOffer(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }
}
