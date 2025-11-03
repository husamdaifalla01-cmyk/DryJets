import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BudgetOptimizerService, OptimizationStrategy } from './budget-optimizer.service';
import { BudgetSafetyGuardService } from './budget-safety-guard.service';

/**
 * Budget Rebalancer Service
 *
 * Automatically rebalances campaign budgets based on performance.
 * Runs periodically (e.g., every 6 hours) to optimize budget allocation.
 */

export interface RebalanceResult {
  executed: boolean;
  timestamp: Date;
  strategy: OptimizationStrategy;
  campaignsAdjusted: number;
  totalBudgetBefore: number;
  totalBudgetAfter: number;
  expectedROIIncrease: number;
  changes: {
    campaignId: string;
    campaignName: string;
    oldBudget: number;
    newBudget: number;
    change: number;
  }[];
  skippedReasons: string[];
}

export interface RebalanceConfig {
  enabled: boolean;
  strategy: OptimizationStrategy;
  minChangePercentage: number; // Only apply changes > this %
  respectGlobalCap: boolean;
  pauseLosers: boolean; // Auto-pause negative ROI campaigns
  minDaysRunning: number; // Min days before eligible for rebalancing
}

@Injectable()
export class BudgetRebalancerService {
  private readonly logger = new Logger(BudgetRebalancerService.name);

  private readonly defaultConfig: RebalanceConfig = {
    enabled: true,
    strategy: 'balanced',
    minChangePercentage: 10, // Only apply changes >10%
    respectGlobalCap: true,
    pauseLosers: false, // Don't auto-pause by default
    minDaysRunning: 3, // Min 3 days of data
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetOptimizer: BudgetOptimizerService,
    private readonly budgetSafety: BudgetSafetyGuardService,
  ) {}

  /**
   * Execute budget rebalancing
   */
  async rebalance(config: Partial<RebalanceConfig> = {}): Promise<RebalanceResult> {
    const finalConfig = { ...this.defaultConfig, ...config };

    this.logger.log(`Starting budget rebalancing with strategy: ${finalConfig.strategy}`);

    if (!finalConfig.enabled) {
      this.logger.log('Rebalancing is disabled');
      return this.createEmptyResult(finalConfig.strategy);
    }

    const changes: RebalanceResult['changes'] = [];
    const skippedReasons: string[] = [];

    try {
      // Get optimization recommendations
      const optimization = await this.budgetOptimizer.optimizeBudgets(finalConfig.strategy);

      this.logger.log(
        `Generated ${optimization.recommendations.length} recommendations. Expected ROI increase: ${optimization.expectedROIIncrease.toFixed(1)}%`,
      );

      // Get current budget state
      const totalBudgetBefore = optimization.recommendations.reduce(
        (sum, r) => sum + r.currentBudget,
        0,
      );

      // Filter and apply recommendations
      for (const rec of optimization.recommendations) {
        // Skip if change is too small
        if (Math.abs(rec.changePercentage) < finalConfig.minChangePercentage) {
          skippedReasons.push(`${rec.campaignName}: Change too small (${rec.changePercentage.toFixed(1)}%)`);
          continue;
        }

        // Check if campaign has run long enough
        const campaign = await this.prisma.adCampaign.findUnique({
          where: { id: rec.campaignId },
          select: { createdAt: true, startDate: true },
        });

        if (campaign) {
          const startDate = campaign.startDate || campaign.createdAt;
          const daysRunning = Math.floor(
            (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysRunning < finalConfig.minDaysRunning) {
            skippedReasons.push(
              `${rec.campaignName}: Too new (${daysRunning} days, need ${finalConfig.minDaysRunning})`,
            );
            continue;
          }
        }

        // Safety check if respecting global cap
        if (finalConfig.respectGlobalCap) {
          const safetyCheck = await this.budgetSafety.checkBudgetChange(
            rec.campaignId,
            rec.recommendedBudget,
          );

          if (!safetyCheck.safe) {
            skippedReasons.push(`${rec.campaignName}: Safety check failed - ${safetyCheck.errors.join(', ')}`);
            continue;
          }
        }

        // Apply the budget change
        try {
          await this.prisma.adCampaign.update({
            where: { id: rec.campaignId },
            data: {
              dailyBudget: rec.recommendedBudget,
            },
          });

          changes.push({
            campaignId: rec.campaignId,
            campaignName: rec.campaignName,
            oldBudget: rec.currentBudget,
            newBudget: rec.recommendedBudget,
            change: rec.change,
          });

          this.logger.log(
            `Rebalanced ${rec.campaignName}: $${rec.currentBudget} → $${rec.recommendedBudget} (${rec.changePercentage > 0 ? '+' : ''}${rec.changePercentage.toFixed(1)}%)`,
          );
        } catch (error) {
          skippedReasons.push(`${rec.campaignName}: Database error - ${error.message}`);
          this.logger.error(`Error updating ${rec.campaignName}: ${error.message}`);
        }
      }

      // Optionally pause losers
      if (finalConfig.pauseLosers) {
        const pausedCount = await this.pauseLosingCampaigns();
        this.logger.log(`Paused ${pausedCount} losing campaigns`);
      }

      const totalBudgetAfter = changes.reduce((sum, c) => sum + c.newBudget, 0);

      return {
        executed: true,
        timestamp: new Date(),
        strategy: finalConfig.strategy,
        campaignsAdjusted: changes.length,
        totalBudgetBefore,
        totalBudgetAfter,
        expectedROIIncrease: optimization.expectedROIIncrease,
        changes,
        skippedReasons,
      };
    } catch (error) {
      this.logger.error(`Rebalancing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pause campaigns with negative ROI
   */
  private async pauseLosingCampaigns(): Promise<number> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    let pausedCount = 0;

    for (const campaign of campaigns) {
      // Calculate ROI
      const totals = campaign.metrics.reduce(
        (acc, m) => ({
          spend: acc.spend + parseFloat(m.spend.toString()),
          revenue: acc.revenue + parseFloat(m.revenue?.toString() || '0'),
        }),
        { spend: 0, revenue: 0 },
      );

      const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;

      // Pause if ROI < -20% (losing 20%+)
      if (roi < -20 && totals.spend > 50) {
        // Only pause if spent >$50
        await this.prisma.adCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'paused',
            pauseReason: `Auto-paused: Negative ROI (${roi.toFixed(0)}%)`,
            pausedAt: new Date(),
          },
        });

        this.logger.warn(`Auto-paused ${campaign.name} due to negative ROI: ${roi.toFixed(0)}%`);
        pausedCount++;
      }
    }

    return pausedCount;
  }

  /**
   * Get rebalancing recommendations without applying
   */
  async getRecommendations(
    strategy: OptimizationStrategy = 'balanced',
  ): Promise<RebalanceResult> {
    const optimization = await this.budgetOptimizer.optimizeBudgets(strategy);

    const changes = optimization.recommendations
      .filter((r) => Math.abs(r.changePercentage) >= this.defaultConfig.minChangePercentage)
      .map((r) => ({
        campaignId: r.campaignId,
        campaignName: r.campaignName,
        oldBudget: r.currentBudget,
        newBudget: r.recommendedBudget,
        change: r.change,
      }));

    return {
      executed: false,
      timestamp: new Date(),
      strategy,
      campaignsAdjusted: changes.length,
      totalBudgetBefore: optimization.recommendations.reduce((sum, r) => sum + r.currentBudget, 0),
      totalBudgetAfter: changes.reduce((sum, c) => sum + c.newBudget, 0),
      expectedROIIncrease: optimization.expectedROIIncrease,
      changes,
      skippedReasons: [],
    };
  }

  /**
   * Create empty result (when rebalancing disabled)
   */
  private createEmptyResult(strategy: OptimizationStrategy): RebalanceResult {
    return {
      executed: false,
      timestamp: new Date(),
      strategy,
      campaignsAdjusted: 0,
      totalBudgetBefore: 0,
      totalBudgetAfter: 0,
      expectedROIIncrease: 0,
      changes: [],
      skippedReasons: ['Rebalancing is disabled'],
    };
  }

  /**
   * Get rebalancing history
   */
  async getRebalanceHistory(days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // In production, store rebalance history in database
    // For now, return placeholder
    return [];
  }

  /**
   * Schedule automatic rebalancing (called by job processor)
   */
  async runScheduledRebalance(): Promise<RebalanceResult> {
    this.logger.log('Running scheduled budget rebalancing...');

    const config: Partial<RebalanceConfig> = {
      enabled: true,
      strategy: 'balanced',
      minChangePercentage: 15, // Higher threshold for auto-rebalancing
      respectGlobalCap: true,
      pauseLosers: true, // Auto-pause losers in scheduled runs
      minDaysRunning: 3,
    };

    return this.rebalance(config);
  }
}
