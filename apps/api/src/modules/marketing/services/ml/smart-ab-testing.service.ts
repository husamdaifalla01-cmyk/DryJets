import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Smart A/B Testing with Multi-Armed Bandit Algorithms
 * Uses Thompson Sampling and UCB for intelligent traffic allocation
 */

export interface BanditArm {
  variantId: string;
  name: string;
  alpha: number; // successes + 1 (Beta distribution)
  beta: number; // failures + 1 (Beta distribution)
  impressions: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
}

export interface TestVariant {
  id: string;
  name: string;
  content: any;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

export interface BanditRecommendation {
  selectedVariant: string;
  confidence: number;
  explorationRate: number;
  currentBest: string;
  improvement: number;
  shouldStop: boolean;
  reason?: string;
}

@Injectable()
export class SmartABTestingService {
  private readonly logger = new Logger('SmartABTesting');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Thompson Sampling: Select variant to show next
   * This balances exploration vs exploitation
   */
  thompsonSampling(variants: BanditArm[]): BanditRecommendation {
    this.logger.log('Running Thompson Sampling for variant selection');

    // Sample from Beta distribution for each variant
    const samples = variants.map((variant) => ({
      variantId: variant.variantId,
      name: variant.name,
      sample: this.sampleBeta(variant.alpha, variant.beta),
      conversionRate: variant.conversionRate,
    }));

    // Select variant with highest sample
    const selected = samples.reduce((max, current) =>
      current.sample > max.sample ? current : max,
    );

    // Find current best performer
    const currentBest = variants.reduce((max, current) =>
      current.conversionRate > max.conversionRate ? current : max,
    );

    // Calculate confidence in current best
    const confidence = this.calculateConfidence(
      currentBest.alpha,
      currentBest.beta,
      variants,
    );

    // Determine if we should stop the test
    const shouldStop = this.shouldStopTest(variants, confidence);

    // Calculate potential improvement
    const improvement =
      currentBest.variantId !== variants[0].variantId
        ? ((currentBest.conversionRate - variants[0].conversionRate) /
            variants[0].conversionRate) *
          100
        : 0;

    return {
      selectedVariant: selected.variantId,
      confidence,
      explorationRate: this.calculateExplorationRate(variants),
      currentBest: currentBest.variantId,
      improvement: Math.round(improvement * 100) / 100,
      shouldStop,
      reason: shouldStop
        ? `${currentBest.name} is winner with ${confidence.toFixed(1)}% confidence`
        : undefined,
    };
  }

  /**
   * Upper Confidence Bound (UCB) algorithm
   * Alternative to Thompson Sampling
   */
  upperConfidenceBound(variants: BanditArm[], c: number = 2): BanditRecommendation {
    this.logger.log('Running UCB algorithm for variant selection');

    const totalImpressions = variants.reduce(
      (sum, v) => sum + v.impressions,
      0,
    );

    // Calculate UCB score for each variant
    const ucbScores = variants.map((variant) => {
      const exploitationValue = variant.conversionRate;
      const explorationBonus =
        variant.impressions > 0
          ? c * Math.sqrt(Math.log(totalImpressions) / variant.impressions)
          : Infinity;

      return {
        variantId: variant.variantId,
        name: variant.name,
        score: exploitationValue + explorationBonus,
        conversionRate: variant.conversionRate,
      };
    });

    // Select variant with highest UCB score
    const selected = ucbScores.reduce((max, current) =>
      current.score > max.score ? current : max,
    );

    // Find current best performer
    const currentBest = variants.reduce((max, current) =>
      current.conversionRate > max.conversionRate ? current : max,
    );

    const confidence = this.calculateConfidence(
      currentBest.alpha,
      currentBest.beta,
      variants,
    );

    const shouldStop = this.shouldStopTest(variants, confidence);

    const improvement =
      currentBest.variantId !== variants[0].variantId
        ? ((currentBest.conversionRate - variants[0].conversionRate) /
            variants[0].conversionRate) *
          100
        : 0;

    return {
      selectedVariant: selected.variantId,
      confidence,
      explorationRate: this.calculateExplorationRate(variants),
      currentBest: currentBest.variantId,
      improvement: Math.round(improvement * 100) / 100,
      shouldStop,
      reason: shouldStop
        ? `${currentBest.name} is winner with ${confidence.toFixed(1)}% confidence`
        : undefined,
    };
  }

  /**
   * Sample from Beta distribution (approximation)
   */
  private sampleBeta(alpha: number, beta: number): number {
    // Using acceptance-rejection method for Beta distribution
    // For large alpha, beta, use normal approximation
    if (alpha > 100 && beta > 100) {
      const mean = alpha / (alpha + beta);
      const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
      return this.sampleNormal(mean, Math.sqrt(variance));
    }

    // For smaller values, use Gamma ratio method
    const gammaAlpha = this.sampleGamma(alpha, 1);
    const gammaBeta = this.sampleGamma(beta, 1);
    return gammaAlpha / (gammaAlpha + gammaBeta);
  }

  /**
   * Sample from Gamma distribution (approximation)
   */
  private sampleGamma(shape: number, scale: number): number {
    // Marsaglia and Tsang method
    if (shape < 1) {
      return this.sampleGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x = this.sampleNormal(0, 1);
      const v = Math.pow(1 + c * x, 3);

      if (v > 0) {
        const u = Math.random();
        if (
          u < 1 - 0.0331 * Math.pow(x, 4) ||
          Math.log(u) < 0.5 * Math.pow(x, 2) + d * (1 - v + Math.log(v))
        ) {
          return d * v * scale;
        }
      }
    }
  }

  /**
   * Sample from Normal distribution (Box-Muller transform)
   */
  private sampleNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  }

  /**
   * Calculate confidence that variant is best
   */
  private calculateConfidence(
    winnerAlpha: number,
    winnerBeta: number,
    allVariants: BanditArm[],
  ): number {
    // Monte Carlo simulation to estimate P(variant A > all others)
    const simulations = 10000;
    let wins = 0;

    for (let i = 0; i < simulations; i++) {
      const winnerSample = this.sampleBeta(winnerAlpha, winnerBeta);

      const isWinner = allVariants.every((variant) => {
        if (variant.alpha === winnerAlpha && variant.beta === winnerBeta) {
          return true;
        }
        const sample = this.sampleBeta(variant.alpha, variant.beta);
        return winnerSample > sample;
      });

      if (isWinner) wins++;
    }

    return (wins / simulations) * 100;
  }

  /**
   * Determine if test should stop
   */
  private shouldStopTest(variants: BanditArm[], confidence: number): boolean {
    // Stop if:
    // 1. High confidence (>95%) and sufficient sample size
    // 2. All variants have at least 100 impressions
    const minImpressions = Math.min(...variants.map((v) => v.impressions));
    const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);

    if (confidence > 95 && minImpressions >= 100 && totalImpressions >= 1000) {
      return true;
    }

    // Stop if confidence > 99% regardless of sample size (clear winner)
    if (confidence > 99 && totalImpressions >= 500) {
      return true;
    }

    return false;
  }

  /**
   * Calculate current exploration rate
   */
  private calculateExplorationRate(variants: BanditArm[]): number {
    const totalImpressions = variants.reduce((sum, v) => sum + v.impressions, 0);
    if (totalImpressions === 0) return 100;

    const bestVariant = variants.reduce((max, current) =>
      current.conversionRate > max.conversionRate ? current : max,
    );

    const explorationImpressions = variants
      .filter((v) => v.variantId !== bestVariant.variantId)
      .reduce((sum, v) => sum + v.impressions, 0);

    return (explorationImpressions / totalImpressions) * 100;
  }

  /**
   * Record test result (conversion or non-conversion)
   */
  async recordResult(
    testId: string,
    variantId: string,
    converted: boolean,
  ): Promise<void> {
    this.logger.log(`Recording result for test ${testId}, variant ${variantId}: ${converted}`);

    // In production, this would update the database
    // For now, we're simulating the update

    // Update variant statistics
    // await this.prisma.testVariant.update({
    //   where: { id: variantId },
    //   data: {
    //     impressions: { increment: 1 },
    //     conversions: { increment: converted ? 1 : 0 },
    //   },
    // });
  }

  /**
   * Get test recommendations using ML
   */
  async getTestRecommendations(testId: string): Promise<{
    algorithm: string;
    recommendation: BanditRecommendation;
    insights: string[];
    nextSteps: string[];
  }> {
    // Get test variants (simulated data)
    const variants: BanditArm[] = [
      {
        variantId: 'variant-a',
        name: 'Control',
        alpha: 51, // 50 conversions + 1
        beta: 451, // 400 non-conversions + 1
        impressions: 450,
        conversions: 50,
        conversionRate: 0.111,
        confidence: 0,
      },
      {
        variantId: 'variant-b',
        name: 'Variant B',
        alpha: 71, // 70 conversions + 1
        beta: 381, // 380 non-conversions + 1
        impressions: 450,
        conversions: 70,
        conversionRate: 0.156,
        confidence: 0,
      },
      {
        variantId: 'variant-c',
        name: 'Variant C',
        alpha: 61, // 60 conversions + 1
        beta: 391, // 390 non-conversions + 1
        impressions: 450,
        conversions: 60,
        conversionRate: 0.133,
        confidence: 0,
      },
    ];

    // Use Thompson Sampling
    const recommendation = this.thompsonSampling(variants);

    // Generate insights
    const insights = this.generateTestInsights(variants, recommendation);

    // Generate next steps
    const nextSteps = this.generateNextSteps(variants, recommendation);

    return {
      algorithm: 'Thompson Sampling',
      recommendation,
      insights,
      nextSteps,
    };
  }

  /**
   * Generate insights from test data
   */
  private generateTestInsights(
    variants: BanditArm[],
    recommendation: BanditRecommendation,
  ): string[] {
    const insights: string[] = [];

    const best = variants.find((v) => v.variantId === recommendation.currentBest);
    const control = variants[0];

    if (best && best.variantId !== control.variantId) {
      const improvement =
        ((best.conversionRate - control.conversionRate) / control.conversionRate) * 100;
      insights.push(
        `🏆 ${best.name} is leading with ${improvement.toFixed(1)}% improvement over control`,
      );
    }

    if (recommendation.confidence > 90) {
      insights.push(
        `✅ High confidence (${recommendation.confidence.toFixed(1)}%) - results are statistically significant`,
      );
    } else if (recommendation.confidence < 70) {
      insights.push(
        `⚠️ Low confidence (${recommendation.confidence.toFixed(1)}%) - need more data`,
      );
    }

    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    insights.push(`📊 Total conversions: ${totalConversions}`);

    if (recommendation.explorationRate > 40) {
      insights.push(
        `🔍 High exploration rate (${recommendation.explorationRate.toFixed(1)}%) - still testing variants`,
      );
    } else {
      insights.push(
        `🎯 Low exploration rate (${recommendation.explorationRate.toFixed(1)}%) - focusing on winner`,
      );
    }

    return insights;
  }

  /**
   * Generate next steps recommendations
   */
  private generateNextSteps(
    variants: BanditArm[],
    recommendation: BanditRecommendation,
  ): string[] {
    const steps: string[] = [];

    if (recommendation.shouldStop) {
      steps.push(`🛑 Stop test and implement ${recommendation.currentBest}`);
      steps.push('📈 Monitor performance in production');
      steps.push('🔄 Plan next iteration of testing');
    } else {
      const minImpressions = Math.min(...variants.map((v) => v.impressions));
      if (minImpressions < 100) {
        steps.push(
          `⏳ Continue test until all variants reach 100+ impressions (current min: ${minImpressions})`,
        );
      }

      if (recommendation.confidence < 95) {
        const needed = Math.ceil((95 - recommendation.confidence) * 10);
        steps.push(
          `📊 Collect ~${needed} more conversions to reach 95% confidence`,
        );
      }

      steps.push(`🎲 Continue using ${recommendation.selectedVariant} for next user`);
    }

    return steps;
  }

  /**
   * Simulate entire A/B test with bandit algorithm
   */
  async simulateTest(
    variants: Array<{ name: string; trueConversionRate: number }>,
    totalImpressions: number,
  ): Promise<{
    results: BanditArm[];
    finalRecommendation: BanditRecommendation;
    regret: number;
    efficiency: number;
  }> {
    this.logger.log(`Simulating A/B test with ${variants.length} variants for ${totalImpressions} impressions`);

    // Initialize bandit arms
    const arms: BanditArm[] = variants.map((v, i) => ({
      variantId: `variant-${i}`,
      name: v.name,
      alpha: 1,
      beta: 1,
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
      confidence: 0,
    }));

    let totalRegret = 0;
    const bestTrueRate = Math.max(...variants.map((v) => v.trueConversionRate));

    // Run simulation
    for (let i = 0; i < totalImpressions; i++) {
      // Get recommendation
      const rec = this.thompsonSampling(arms);
      const selectedArm = arms.find((a) => a.variantId === rec.selectedVariant);

      if (!selectedArm) continue;

      // Simulate conversion
      const variantIndex = parseInt(selectedArm.variantId.split('-')[1]);
      const converted = Math.random() < variants[variantIndex].trueConversionRate;

      // Update arm
      selectedArm.impressions++;
      if (converted) {
        selectedArm.conversions++;
        selectedArm.alpha++;
      } else {
        selectedArm.beta++;
      }
      selectedArm.conversionRate = selectedArm.conversions / selectedArm.impressions;

      // Calculate regret (opportunity cost of not choosing best variant)
      const regret =
        bestTrueRate - variants[variantIndex].trueConversionRate;
      totalRegret += regret;
    }

    // Get final recommendation
    const finalRecommendation = this.thompsonSampling(arms);

    // Calculate efficiency (% of optimal conversions achieved)
    const actualConversions = arms.reduce((sum, a) => sum + a.conversions, 0);
    const optimalConversions = totalImpressions * bestTrueRate;
    const efficiency = (actualConversions / optimalConversions) * 100;

    return {
      results: arms,
      finalRecommendation,
      regret: totalRegret,
      efficiency,
    };
  }
}
