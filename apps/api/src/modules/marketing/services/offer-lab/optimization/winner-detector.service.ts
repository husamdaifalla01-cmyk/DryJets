import { Injectable, Logger } from '@nestjs/common';
import { ABTestService } from './ab-test.service';
import { VariantComparerService, VariantStats } from './variant-comparer.service';

/**
 * Winner Detector Service
 *
 * Automatically detects winners from running A/B tests.
 * Evaluates tests periodically and promotes winners when significant.
 */

export interface WinnerDetection {
  testId: string;
  testName: string;
  winnerVariantId: string;
  winnerVariantName: string;
  confidence: number;
  lift: number;
  recommendation: string;
}

@Injectable()
export class WinnerDetectorService {
  private readonly logger = new Logger(WinnerDetectorService.name);

  constructor(
    private readonly abTestService: ABTestService,
    private readonly variantComparer: VariantComparerService,
  ) {}

  /**
   * Check all running tests for winners
   */
  async detectWinners(): Promise<WinnerDetection[]> {
    this.logger.log('Checking all running A/B tests for winners...');

    const activeTests = await this.abTestService.getActiveTests();
    const winners: WinnerDetection[] = [];

    for (const test of activeTests) {
      try {
        const winner = await this.checkTestForWinner(test);
        if (winner) {
          winners.push(winner);
        }
      } catch (error) {
        this.logger.error(`Error checking test ${test.id}: ${error.message}`);
      }
    }

    this.logger.log(`Found ${winners.length} winners from ${activeTests.length} active tests`);
    return winners;
  }

  /**
   * Check a specific test for winner
   */
  private async checkTestForWinner(test: any): Promise<WinnerDetection | null> {
    // Must have exactly 2 variants for now (A/B test)
    if (test.variants.length !== 2) {
      this.logger.warn(`Test ${test.id} has ${test.variants.length} variants, skipping`);
      return null;
    }

    const [variantA, variantB] = test.variants;

    // Convert to VariantStats
    const statsA: VariantStats = {
      name: variantA.name,
      impressions: variantA.impressions,
      clicks: variantA.clicks,
      conversions: variantA.conversions,
      ctr: parseFloat(variantA.ctr?.toString() || '0'),
      cvr: parseFloat(variantA.cvr?.toString() || '0'),
    };

    const statsB: VariantStats = {
      name: variantB.name,
      impressions: variantB.impressions,
      clicks: variantB.clicks,
      conversions: variantB.conversions,
      ctr: parseFloat(variantB.ctr?.toString() || '0'),
      cvr: parseFloat(variantB.cvr?.toString() || '0'),
    };

    // Compare variants
    const comparison = this.variantComparer.compareVariants(statsA, statsB);

    // Check if we have a winner
    if (!comparison.isSignificant) {
      this.logger.log(`Test ${test.id} (${test.name}): Not significant yet (${comparison.confidence}% confidence)`);
      return null;
    }

    // Determine winner variant
    const winnerVariant = comparison.winner === 'A' ? variantA : variantB;

    this.logger.log(
      `Test ${test.id} (${test.name}): Winner detected - ${winnerVariant.name} with ${comparison.confidence}% confidence`,
    );

    return {
      testId: test.id,
      testName: test.name,
      winnerVariantId: winnerVariant.id,
      winnerVariantName: winnerVariant.name,
      confidence: comparison.confidence,
      lift: comparison.lift,
      recommendation: comparison.recommendation,
    };
  }

  /**
   * Auto-promote winners (mark test as complete with winner)
   */
  async autoPromoteWinners(autoComplete: boolean = false): Promise<WinnerDetection[]> {
    const winners = await this.detectWinners();

    if (autoComplete) {
      for (const winner of winners) {
        try {
          await this.abTestService.completeTest(winner.testId, winner.winnerVariantId);
          this.logger.log(`Auto-promoted winner for test ${winner.testId}: ${winner.winnerVariantName}`);
        } catch (error) {
          this.logger.error(`Error promoting winner for test ${winner.testId}: ${error.message}`);
        }
      }
    }

    return winners;
  }

  /**
   * Get test health (how close to finding a winner)
   */
  async getTestHealth(testId: string): Promise<{
    testId: string;
    status: 'healthy' | 'needs-more-data' | 'ready-for-decision' | 'inconclusive';
    confidence: number;
    samplesNeeded: number;
    daysEstimated: number;
    recommendation: string;
  }> {
    const performance = await this.abTestService.getTestPerformance(testId);

    if (performance.length !== 2) {
      return {
        testId,
        status: 'inconclusive',
        confidence: 0,
        samplesNeeded: 0,
        daysEstimated: 0,
        recommendation: 'Test must have exactly 2 variants',
      };
    }

    const [variantA, variantB] = performance;

    const statsA: VariantStats = {
      name: variantA.variantName,
      impressions: variantA.impressions,
      clicks: variantA.clicks,
      conversions: variantA.conversions,
      ctr: variantA.ctr,
      cvr: variantA.cvr,
    };

    const statsB: VariantStats = {
      name: variantB.variantName,
      impressions: variantB.impressions,
      clicks: variantB.clicks,
      conversions: variantB.conversions,
      ctr: variantB.ctr,
      cvr: variantB.cvr,
    };

    const comparison = this.variantComparer.compareVariants(statsA, statsB);
    const hasEnough = this.variantComparer.hasEnoughData(statsA, statsB);

    // Determine status
    let status: 'healthy' | 'needs-more-data' | 'ready-for-decision' | 'inconclusive';
    let recommendation: string;

    if (comparison.isSignificant) {
      status = 'ready-for-decision';
      recommendation = `Winner detected: ${comparison.winner === 'A' ? variantA.variantName : variantB.variantName}. Promote winner.`;
    } else if (hasEnough) {
      status = 'healthy';
      recommendation = `Test is running well. Current confidence: ${comparison.confidence}%. Continue testing.`;
    } else {
      status = 'needs-more-data';
      const avgCVR = (statsA.cvr + statsB.cvr) / 2;
      const minSamples = this.variantComparer.calculateMinimumSampleSize(avgCVR, 0.1);
      const currentSamples = Math.min(statsA.clicks, statsB.clicks);
      const samplesNeeded = Math.max(0, minSamples - currentSamples);

      recommendation = `Need ${samplesNeeded} more samples per variant to reach statistical significance.`;
    }

    // Calculate days estimated (assuming 100 daily visitors per variant)
    const avgCVR = (statsA.cvr + statsB.cvr) / 2;
    const minSamples = this.variantComparer.calculateMinimumSampleSize(avgCVR, 0.1);
    const currentSamples = Math.min(statsA.clicks, statsB.clicks);
    const samplesNeeded = Math.max(0, minSamples - currentSamples);
    const daysEstimated = Math.ceil(samplesNeeded / 100);

    return {
      testId,
      status,
      confidence: comparison.confidence,
      samplesNeeded,
      daysEstimated,
      recommendation,
    };
  }

  /**
   * Pause tests that are inconclusive after max duration
   */
  async pauseInconclusiveTests(maxDurationDays: number = 14): Promise<string[]> {
    const activeTests = await this.abTestService.getActiveTests();
    const pausedTests: string[] = [];

    for (const test of activeTests) {
      if (!test.startedAt) continue;

      const durationDays = Math.floor(
        (Date.now() - test.startedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (durationDays >= maxDurationDays) {
        const health = await this.getTestHealth(test.id);

        if (health.status !== 'ready-for-decision') {
          await this.abTestService.pauseTest(test.id);
          pausedTests.push(test.id);
          this.logger.log(`Paused inconclusive test ${test.id} after ${durationDays} days`);
        }
      }
    }

    return pausedTests;
  }
}
