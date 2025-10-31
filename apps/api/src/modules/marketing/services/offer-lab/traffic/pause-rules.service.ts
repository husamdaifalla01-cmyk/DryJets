import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Auto-Pause Rules Service
 *
 * Implements intelligent campaign pause logic:
 * 1. CTR threshold: Pause if CTR < 0.4% after 500 impressions
 * 2. EPC threshold: Pause if EPC is below break-even after 1000 clicks
 * 3. Budget exhaustion: Pause if 95% of daily budget spent
 * 4. Conversion threshold: Pause if no conversions after $50 spent
 */

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spent: number;
  conversions: number;
  revenue: number;
  ctr: number;
  epc: number;
  roi: number;
}

export interface PauseDecision {
  shouldPause: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface PauseThresholds {
  minImpressions: number;
  minCTR: number; // Percentage
  minEPC: number; // Dollars
  maxSpendWithoutConversion: number; // Dollars
  budgetExhaustionThreshold: number; // Percentage (0-100)
}

@Injectable()
export class PauseRulesService {
  private readonly logger = new Logger(PauseRulesService.name);

  private readonly DEFAULT_THRESHOLDS: PauseThresholds = {
    minImpressions: 500,
    minCTR: 0.4,
    minEPC: 0.01, // $0.01 minimum EPC
    maxSpendWithoutConversion: 50,
    budgetExhaustionThreshold: 95,
  };

  /**
   * Evaluates campaign metrics against pause rules
   */
  evaluateCampaign(
    metrics: CampaignMetrics,
    dailyBudget: number,
    customThresholds?: Partial<PauseThresholds>,
  ): PauseDecision {
    const thresholds = { ...this.DEFAULT_THRESHOLDS, ...customThresholds };

    // Rule 1: Budget Exhaustion (highest priority)
    const budgetUsedPercent = (metrics.spent / dailyBudget) * 100;
    if (budgetUsedPercent >= thresholds.budgetExhaustionThreshold) {
      return {
        shouldPause: true,
        reason: `Budget exhausted: ${budgetUsedPercent.toFixed(1)}% of daily budget spent`,
        severity: 'high',
        recommendation: 'Increase daily budget or wait for budget reset',
      };
    }

    // Rule 2: Low CTR (after minimum impressions)
    if (metrics.impressions >= thresholds.minImpressions) {
      if (metrics.ctr < thresholds.minCTR) {
        return {
          shouldPause: true,
          reason: `Low CTR: ${metrics.ctr.toFixed(2)}% (threshold: ${thresholds.minCTR}%)`,
          severity: 'high',
          recommendation: 'Test new ad creatives or adjust targeting',
        };
      }
    }

    // Rule 3: No conversions after significant spend
    if (metrics.spent >= thresholds.maxSpendWithoutConversion && metrics.conversions === 0) {
      return {
        shouldPause: true,
        reason: `No conversions after $${metrics.spent.toFixed(2)} spent`,
        severity: 'high',
        recommendation: 'Review funnel, offer alignment, and traffic quality',
      };
    }

    // Rule 4: Low EPC (only if we have conversions to calculate)
    if (metrics.clicks >= 100 && metrics.conversions > 0) {
      if (metrics.epc < thresholds.minEPC) {
        return {
          shouldPause: true,
          reason: `Low EPC: $${metrics.epc.toFixed(4)} (threshold: $${thresholds.minEPC})`,
          severity: 'medium',
          recommendation: 'Optimize funnel conversion rate or find higher-paying offers',
        };
      }
    }

    // Rule 5: Negative ROI warning (medium priority)
    if (metrics.spent >= 20 && metrics.roi < -50) {
      return {
        shouldPause: true,
        reason: `Severe negative ROI: ${metrics.roi.toFixed(1)}%`,
        severity: 'medium',
        recommendation: 'Stop campaign and analyze traffic quality',
      };
    }

    // All checks passed
    return {
      shouldPause: false,
      severity: 'low',
    };
  }

  /**
   * Calculates performance metrics from raw data
   */
  calculateMetrics(data: {
    impressions: number;
    clicks: number;
    spent: number;
    conversions: number;
    revenue: number;
  }): CampaignMetrics {
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const epc = data.clicks > 0 ? data.revenue / data.clicks : 0;
    const roi = data.spent > 0 ? ((data.revenue - data.spent) / data.spent) * 100 : 0;

    return {
      ...data,
      ctr: parseFloat(ctr.toFixed(2)),
      epc: parseFloat(epc.toFixed(4)),
      roi: parseFloat(roi.toFixed(2)),
    };
  }

  /**
   * Determines if campaign is in "learning phase" (too early to pause)
   */
  isInLearningPhase(impressions: number, clicks: number): boolean {
    return impressions < this.DEFAULT_THRESHOLDS.minImpressions || clicks < 10;
  }

  /**
   * Gets recommended action based on current performance
   */
  getOptimizationRecommendation(metrics: CampaignMetrics): string {
    if (metrics.ctr > 2) {
      return 'High CTR! Consider increasing budget to scale.';
    }

    if (metrics.ctr < 0.5 && metrics.impressions > 500) {
      return 'Low CTR. Test new ad creatives or adjust GEO targeting.';
    }

    if (metrics.roi > 50) {
      return 'Profitable campaign! Scale budget and expand to similar GEOs.';
    }

    if (metrics.roi > 0 && metrics.roi < 50) {
      return 'Break-even to slightly profitable. Optimize funnel for higher conversions.';
    }

    if (metrics.conversions === 0 && metrics.spent > 10) {
      return 'No conversions yet. Review funnel alignment and traffic quality.';
    }

    return 'Monitor performance. Wait for more data before making changes.';
  }

  /**
   * Logs pause decision for audit trail
   */
  logPauseDecision(campaignId: string, decision: PauseDecision, metrics: CampaignMetrics): void {
    if (decision.shouldPause) {
      this.logger.warn(`[AUTO-PAUSE] Campaign ${campaignId}: ${decision.reason}`, {
        severity: decision.severity,
        metrics: {
          ctr: metrics.ctr,
          epc: metrics.epc,
          roi: metrics.roi,
          spent: metrics.spent,
        },
        recommendation: decision.recommendation,
      });
    } else {
      this.logger.log(`Campaign ${campaignId}: Performance acceptable`, {
        ctr: metrics.ctr,
        epc: metrics.epc,
        roi: metrics.roi,
      });
    }
  }
}
