import { Injectable, Logger } from '@nestjs/common';

/**
 * Variant Comparer Service
 *
 * Performs statistical comparison between A/B test variants.
 * Calculates statistical significance using Chi-Square test.
 */

export interface ComparisonResult {
  variantA: VariantStats;
  variantB: VariantStats;
  winner?: 'A' | 'B' | null;
  confidence: number; // 0-99%
  isSignificant: boolean; // True if >= 95% confidence
  lift: number; // Percentage improvement
  recommendation: string;
}

export interface VariantStats {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
}

@Injectable()
export class VariantComparerService {
  private readonly logger = new Logger(VariantComparerService.name);

  /**
   * Compare two variants
   */
  compareVariants(variantA: VariantStats, variantB: VariantStats): ComparisonResult {
    this.logger.log(`Comparing variants: ${variantA.name} vs ${variantB.name}`);

    // Calculate conversion rate difference
    const liftCVR = variantA.cvr > 0
      ? ((variantB.cvr - variantA.cvr) / variantA.cvr) * 100
      : 0;

    // Calculate statistical significance (Chi-Square test for conversions)
    const significance = this.calculateChiSquare(variantA, variantB);
    const confidence = significance.confidence;
    const isSignificant = confidence >= 95;

    // Determine winner
    let winner: 'A' | 'B' | null = null;
    if (isSignificant) {
      winner = variantB.cvr > variantA.cvr ? 'B' : 'A';
    }

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      variantA,
      variantB,
      isSignificant,
      winner,
      liftCVR,
    );

    return {
      variantA,
      variantB,
      winner,
      confidence,
      isSignificant,
      lift: parseFloat(liftCVR.toFixed(2)),
      recommendation,
    };
  }

  /**
   * Calculate Chi-Square test for statistical significance
   *
   * This is a simplified implementation.
   * In production, use a proper statistics library like jStat or simple-statistics.
   */
  private calculateChiSquare(variantA: VariantStats, variantB: VariantStats): {
    chiSquare: number;
    confidence: number;
  } {
    const totalA = variantA.clicks;
    const totalB = variantB.clicks;
    const conversionsA = variantA.conversions;
    const conversionsB = variantB.conversions;

    // Insufficient data
    if (totalA < 100 || totalB < 100) {
      return { chiSquare: 0, confidence: 0 };
    }

    // Calculate expected values
    const totalConversions = conversionsA + conversionsB;
    const totalSamples = totalA + totalB;
    const expectedA = (totalA * totalConversions) / totalSamples;
    const expectedB = (totalB * totalConversions) / totalSamples;

    // Calculate Chi-Square statistic
    const chiSquareA = Math.pow(conversionsA - expectedA, 2) / expectedA;
    const chiSquareB = Math.pow(conversionsB - expectedB, 2) / expectedB;
    const chiSquare = chiSquareA + chiSquareB;

    // Convert Chi-Square to confidence level (simplified)
    // Chi-Square critical values:
    // 3.841 = 95% confidence (p=0.05)
    // 6.635 = 99% confidence (p=0.01)
    let confidence = 0;
    if (chiSquare >= 6.635) {
      confidence = 99;
    } else if (chiSquare >= 3.841) {
      confidence = 95;
    } else if (chiSquare >= 2.706) {
      confidence = 90;
    } else if (chiSquare >= 1.642) {
      confidence = 80;
    } else {
      confidence = Math.min(79, (chiSquare / 3.841) * 95);
    }

    return {
      chiSquare: parseFloat(chiSquare.toFixed(4)),
      confidence: parseFloat(confidence.toFixed(2)),
    };
  }

  /**
   * Generate recommendation based on test results
   */
  private generateRecommendation(
    variantA: VariantStats,
    variantB: VariantStats,
    isSignificant: boolean,
    winner: 'A' | 'B' | null,
    lift: number,
  ): string {
    if (!isSignificant) {
      const minSampleSize = this.calculateMinimumSampleSize(variantA.cvr, 0.1);
      const samplesNeeded = Math.max(
        0,
        minSampleSize - Math.min(variantA.clicks, variantB.clicks),
      );

      return `Not enough data yet. Need approximately ${samplesNeeded} more samples per variant to reach 95% confidence.`;
    }

    if (winner === 'A') {
      return `Variant A (${variantA.name}) is the winner with ${Math.abs(lift).toFixed(1)}% better performance. Promote Variant A.`;
    }

    if (winner === 'B') {
      return `Variant B (${variantB.name}) is the winner with ${lift.toFixed(1)}% better performance. Promote Variant B.`;
    }

    return 'No clear winner yet. Continue testing.';
  }

  /**
   * Calculate minimum sample size needed
   *
   * Uses simplified power analysis formula
   */
  calculateMinimumSampleSize(baselineConversionRate: number, minimumDetectableEffect: number): number {
    // Simplified formula: n = 16 * p * (1-p) / (MDE^2)
    // Where p = baseline conversion rate, MDE = minimum detectable effect

    const p = baselineConversionRate / 100; // Convert to decimal
    const mde = minimumDetectableEffect;

    if (p <= 0 || p >= 1) {
      return 1000; // Default if invalid rate
    }

    const n = (16 * p * (1 - p)) / Math.pow(mde, 2);
    return Math.ceil(n);
  }

  /**
   * Check if test has enough data for significance
   */
  hasEnoughData(variantA: VariantStats, variantB: VariantStats): boolean {
    // Need at least 100 samples per variant
    const minSamples = 100;

    // Need at least 10 conversions total
    const minConversions = 10;

    return (
      variantA.clicks >= minSamples &&
      variantB.clicks >= minSamples &&
      (variantA.conversions + variantB.conversions) >= minConversions
    );
  }

  /**
   * Calculate expected time to significance
   */
  estimateTimeToSignificance(
    variantA: VariantStats,
    variantB: VariantStats,
    dailyTraffic: number,
  ): {
    daysNeeded: number;
    confidence: number;
  } {
    const currentSamples = Math.min(variantA.clicks, variantB.clicks);
    const avgCVR = (variantA.cvr + variantB.cvr) / 2 / 100;
    const minSampleSize = this.calculateMinimumSampleSize(avgCVR * 100, 0.1);

    const samplesNeeded = Math.max(0, minSampleSize - currentSamples);
    const samplesPerDay = dailyTraffic / 2; // Split between variants

    const daysNeeded = samplesNeeded / samplesPerDay;

    // Calculate current confidence
    const significance = this.calculateChiSquare(variantA, variantB);

    return {
      daysNeeded: Math.ceil(daysNeeded),
      confidence: significance.confidence,
    };
  }

  /**
   * Determine if test should continue or stop
   */
  shouldContinueTest(
    variantA: VariantStats,
    variantB: VariantStats,
    maxDuration: number = 14, // days
    currentDuration: number = 0, // days
  ): {
    shouldContinue: boolean;
    reason: string;
  } {
    const comparison = this.compareVariants(variantA, variantB);

    // Stop if we have a clear winner
    if (comparison.isSignificant) {
      return {
        shouldContinue: false,
        reason: `Clear winner detected: ${comparison.winner === 'A' ? variantA.name : variantB.name}`,
      };
    }

    // Stop if max duration reached
    if (currentDuration >= maxDuration) {
      return {
        shouldContinue: false,
        reason: 'Maximum test duration reached',
      };
    }

    // Stop if not enough traffic
    if (!this.hasEnoughData(variantA, variantB) && currentDuration >= 7) {
      return {
        shouldContinue: false,
        reason: 'Insufficient traffic after 7 days',
      };
    }

    return {
      shouldContinue: true,
      reason: 'Continue testing to gather more data',
    };
  }
}
