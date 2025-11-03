import { Injectable, Logger } from '@nestjs/common';

/**
 * Performance Threshold Checker Service
 *
 * Validates campaign performance against predefined thresholds
 * before allowing scaling or other optimization actions.
 */

export interface PerformanceThresholds {
  minImpressions: number;
  minClicks: number;
  minConversions: number;
  minSpend: number;
  minROI: number;
  minCTR: number;
  minEPC: number;
  minDaysRunning: number;
}

export interface CampaignPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  epc: number;
  daysRunning: number;
}

export interface ThresholdCheckResult {
  passesAll: boolean;
  failedChecks: string[];
  passedChecks: string[];
  recommendation: string;
  canScale: boolean;
  canOptimize: boolean;
}

@Injectable()
export class PerformanceThresholdCheckerService {
  private readonly logger = new Logger(PerformanceThresholdCheckerService.name);

  // Default thresholds for various actions
  private readonly DEFAULT_SCALING_THRESHOLDS: PerformanceThresholds = {
    minImpressions: 1000,
    minClicks: 100,
    minConversions: 10,
    minSpend: 20,
    minROI: 50,
    minCTR: 0.5,
    minEPC: 0.02,
    minDaysRunning: 3,
  };

  private readonly DEFAULT_OPTIMIZATION_THRESHOLDS: PerformanceThresholds = {
    minImpressions: 500,
    minClicks: 50,
    minConversions: 5,
    minSpend: 10,
    minROI: 0,
    minCTR: 0.3,
    minEPC: 0.01,
    minDaysRunning: 1,
  };

  /**
   * Check if campaign meets scaling thresholds
   */
  checkScalingThresholds(performance: CampaignPerformance): ThresholdCheckResult {
    return this.checkThresholds(
      performance,
      this.DEFAULT_SCALING_THRESHOLDS,
      'scaling',
    );
  }

  /**
   * Check if campaign meets optimization thresholds
   */
  checkOptimizationThresholds(performance: CampaignPerformance): ThresholdCheckResult {
    return this.checkThresholds(
      performance,
      this.DEFAULT_OPTIMIZATION_THRESHOLDS,
      'optimization',
    );
  }

  /**
   * Check performance against custom thresholds
   */
  checkThresholds(
    performance: CampaignPerformance,
    thresholds: PerformanceThresholds,
    action: string = 'action',
  ): ThresholdCheckResult {
    const failedChecks: string[] = [];
    const passedChecks: string[] = [];

    // Check impressions
    if (performance.impressions >= thresholds.minImpressions) {
      passedChecks.push(`✓ Impressions: ${performance.impressions} >= ${thresholds.minImpressions}`);
    } else {
      failedChecks.push(`✗ Impressions: ${performance.impressions} < ${thresholds.minImpressions}`);
    }

    // Check clicks
    if (performance.clicks >= thresholds.minClicks) {
      passedChecks.push(`✓ Clicks: ${performance.clicks} >= ${thresholds.minClicks}`);
    } else {
      failedChecks.push(`✗ Clicks: ${performance.clicks} < ${thresholds.minClicks}`);
    }

    // Check conversions
    if (performance.conversions >= thresholds.minConversions) {
      passedChecks.push(`✓ Conversions: ${performance.conversions} >= ${thresholds.minConversions}`);
    } else {
      failedChecks.push(`✗ Conversions: ${performance.conversions} < ${thresholds.minConversions}`);
    }

    // Check spend
    if (performance.spent >= thresholds.minSpend) {
      passedChecks.push(`✓ Spend: $${performance.spent.toFixed(2)} >= $${thresholds.minSpend}`);
    } else {
      failedChecks.push(`✗ Spend: $${performance.spent.toFixed(2)} < $${thresholds.minSpend}`);
    }

    // Check ROI
    if (performance.roi >= thresholds.minROI) {
      passedChecks.push(`✓ ROI: ${performance.roi.toFixed(2)}% >= ${thresholds.minROI}%`);
    } else {
      failedChecks.push(`✗ ROI: ${performance.roi.toFixed(2)}% < ${thresholds.minROI}%`);
    }

    // Check CTR
    if (performance.ctr >= thresholds.minCTR) {
      passedChecks.push(`✓ CTR: ${performance.ctr.toFixed(2)}% >= ${thresholds.minCTR}%`);
    } else {
      failedChecks.push(`✗ CTR: ${performance.ctr.toFixed(2)}% < ${thresholds.minCTR}%`);
    }

    // Check EPC
    if (performance.epc >= thresholds.minEPC) {
      passedChecks.push(`✓ EPC: $${performance.epc.toFixed(4)} >= $${thresholds.minEPC}`);
    } else {
      failedChecks.push(`✗ EPC: $${performance.epc.toFixed(4)} < $${thresholds.minEPC}`);
    }

    // Check days running
    if (performance.daysRunning >= thresholds.minDaysRunning) {
      passedChecks.push(`✓ Days Running: ${performance.daysRunning} >= ${thresholds.minDaysRunning}`);
    } else {
      failedChecks.push(`✗ Days Running: ${performance.daysRunning} < ${thresholds.minDaysRunning}`);
    }

    const passesAll = failedChecks.length === 0;

    // Generate recommendation
    let recommendation: string;
    if (passesAll) {
      recommendation = `Campaign meets all thresholds for ${action}. Proceed with confidence.`;
    } else {
      recommendation = `Campaign fails ${failedChecks.length} threshold(s) for ${action}. ${this.generateFailureRecommendation(failedChecks)}`;
    }

    return {
      passesAll,
      failedChecks,
      passedChecks,
      recommendation,
      canScale: action === 'scaling' && passesAll,
      canOptimize: action === 'optimization' && passesAll,
    };
  }

  /**
   * Generate recommendation based on failed checks
   */
  private generateFailureRecommendation(failedChecks: string[]): string {
    const failures = failedChecks.map(check => check.split(':')[0].replace('✗ ', ''));

    if (failures.some(f => f.includes('Impressions') || f.includes('Clicks'))) {
      return 'Not enough traffic data yet. Wait for more impressions/clicks before taking action.';
    }

    if (failures.some(f => f.includes('Conversions'))) {
      return 'Not enough conversions to make confident decisions. Continue running or optimize funnel.';
    }

    if (failures.some(f => f.includes('ROI') || f.includes('EPC'))) {
      return 'Performance metrics are below target. Optimize before scaling.';
    }

    if (failures.some(f => f.includes('Days Running'))) {
      return 'Campaign too new. Let it run longer to gather sufficient data.';
    }

    return 'Multiple thresholds not met. Review campaign performance before proceeding.';
  }

  /**
   * Check if campaign is in "learning phase"
   */
  isInLearningPhase(performance: CampaignPerformance): boolean {
    return (
      performance.impressions < 500 ||
      performance.clicks < 50 ||
      performance.daysRunning < 3
    );
  }

  /**
   * Calculate how far campaign is from meeting thresholds
   */
  calculateThresholdGap(
    performance: CampaignPerformance,
    thresholds: PerformanceThresholds,
  ): {
    metric: string;
    current: number;
    needed: number;
    percentageComplete: number;
  }[] {
    return [
      {
        metric: 'Impressions',
        current: performance.impressions,
        needed: thresholds.minImpressions,
        percentageComplete: Math.min(100, (performance.impressions / thresholds.minImpressions) * 100),
      },
      {
        metric: 'Clicks',
        current: performance.clicks,
        needed: thresholds.minClicks,
        percentageComplete: Math.min(100, (performance.clicks / thresholds.minClicks) * 100),
      },
      {
        metric: 'Conversions',
        current: performance.conversions,
        needed: thresholds.minConversions,
        percentageComplete: Math.min(100, (performance.conversions / thresholds.minConversions) * 100),
      },
      {
        metric: 'ROI',
        current: performance.roi,
        needed: thresholds.minROI,
        percentageComplete: thresholds.minROI > 0 ? Math.min(100, (performance.roi / thresholds.minROI) * 100) : 100,
      },
      {
        metric: 'CTR',
        current: performance.ctr,
        needed: thresholds.minCTR,
        percentageComplete: Math.min(100, (performance.ctr / thresholds.minCTR) * 100),
      },
      {
        metric: 'EPC',
        current: performance.epc,
        needed: thresholds.minEPC,
        percentageComplete: Math.min(100, (performance.epc / thresholds.minEPC) * 100),
      },
    ];
  }

  /**
   * Estimate time to meet thresholds
   */
  estimateTimeToThreshold(
    performance: CampaignPerformance,
    thresholds: PerformanceThresholds,
    dailyImpressions: number = 1000,
  ): {
    metric: string;
    daysNeeded: number;
  }[] {
    const currentCTR = performance.ctr / 100;
    const currentCVR = performance.clicks > 0 ? performance.conversions / performance.clicks : 0;

    const dailyClicks = dailyImpressions * currentCTR;
    const dailyConversions = dailyClicks * currentCVR;

    return [
      {
        metric: 'Impressions',
        daysNeeded: Math.max(0, Math.ceil((thresholds.minImpressions - performance.impressions) / dailyImpressions)),
      },
      {
        metric: 'Clicks',
        daysNeeded: Math.max(0, Math.ceil((thresholds.minClicks - performance.clicks) / dailyClicks)),
      },
      {
        metric: 'Conversions',
        daysNeeded: Math.max(0, Math.ceil((thresholds.minConversions - performance.conversions) / dailyConversions)),
      },
    ];
  }

  /**
   * Get recommended action based on performance
   */
  getRecommendedAction(performance: CampaignPerformance): {
    action: 'scale' | 'optimize' | 'pause' | 'continue' | 'wait';
    reason: string;
    priority: 'high' | 'medium' | 'low';
  } {
    // Check if in learning phase
    if (this.isInLearningPhase(performance)) {
      return {
        action: 'wait',
        reason: 'Campaign is in learning phase. Let it gather more data.',
        priority: 'low',
      };
    }

    // Check scaling thresholds
    const scalingCheck = this.checkScalingThresholds(performance);
    if (scalingCheck.passesAll) {
      return {
        action: 'scale',
        reason: 'Campaign meets all scaling criteria. Excellent performance!',
        priority: 'high',
      };
    }

    // Check if profitable
    if (performance.roi > 0 && performance.conversions >= 5) {
      return {
        action: 'continue',
        reason: 'Campaign is profitable but needs more data before scaling.',
        priority: 'medium',
      };
    }

    // Check if underperforming
    if (performance.roi < -50 && performance.spent > 50) {
      return {
        action: 'pause',
        reason: 'Severe negative ROI. Pause and investigate.',
        priority: 'high',
      };
    }

    // Check if needs optimization
    if (performance.ctr < 0.5 || performance.conversions === 0 && performance.clicks > 50) {
      return {
        action: 'optimize',
        reason: 'Low CTR or conversion rate. Optimize ad copy and funnel.',
        priority: 'medium',
      };
    }

    return {
      action: 'continue',
      reason: 'Campaign performance is neutral. Continue monitoring.',
      priority: 'low',
    };
  }
}
