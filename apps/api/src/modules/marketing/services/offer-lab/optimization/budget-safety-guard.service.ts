import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * Budget Safety Guard Service
 *
 * Prevents overspending and enforces budget constraints.
 * Provides safety checks before budget changes.
 */

export interface BudgetSafetyCheck {
  safe: boolean;
  currentDailyTotal: number;
  proposedDailyTotal: number;
  globalCap: number;
  remainingBudget: number;
  utilizationPercentage: number;
  warnings: string[];
  errors: string[];
  recommendation: string;
}

export interface SpendingAnalysis {
  campaignId: string;
  dailyBudget: number;
  totalSpent: number;
  remainingDailyBudget: number;
  utilizationPercentage: number;
  projectedDailySpend: number;
  isOverspending: boolean;
  daysUntilBudgetExhausted: number;
}

@Injectable()
export class BudgetSafetyGuardService {
  private readonly logger = new Logger(BudgetSafetyGuardService.name);
  private readonly globalBudgetCap: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.globalBudgetCap = parseFloat(
      this.configService.get<string>('OFFERLAB_GLOBAL_BUDGET_CAP') || '300',
    );
  }

  /**
   * Check if budget change is safe
   */
  async checkBudgetChange(
    campaignId: string,
    newBudget: number,
  ): Promise<BudgetSafetyCheck> {
    this.logger.log(`Checking budget safety for campaign ${campaignId}: $${newBudget}`);

    const warnings: string[] = [];
    const errors: string[] = [];

    // Get campaign
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      errors.push('Campaign not found');
      return {
        safe: false,
        currentDailyTotal: 0,
        proposedDailyTotal: 0,
        globalCap: this.globalBudgetCap,
        remainingBudget: 0,
        utilizationPercentage: 0,
        warnings,
        errors,
        recommendation: 'Cannot proceed - campaign not found',
      };
    }

    // Calculate current total daily budget
    const currentDailyTotal = await this.calculateTotalDailyBudget();
    const currentCampaignBudget = parseFloat(campaign.dailyBudget.toString());

    // Calculate proposed total
    const proposedDailyTotal = currentDailyTotal - currentCampaignBudget + newBudget;

    // Calculate remaining budget
    const remainingBudget = this.globalBudgetCap - proposedDailyTotal;
    const utilizationPercentage = (proposedDailyTotal / this.globalBudgetCap) * 100;

    // Check global cap
    if (proposedDailyTotal > this.globalBudgetCap) {
      errors.push(
        `Exceeds global budget cap: $${proposedDailyTotal.toFixed(2)} > $${this.globalBudgetCap}`,
      );
    }

    // Warning if close to cap (>90%)
    if (utilizationPercentage > 90 && utilizationPercentage <= 100) {
      warnings.push(
        `High budget utilization: ${utilizationPercentage.toFixed(1)}% of global cap`,
      );
    }

    // Warning if budget increase is very large
    const increasePercentage = ((newBudget - currentCampaignBudget) / currentCampaignBudget) * 100;
    if (increasePercentage > 500) {
      warnings.push(
        `Very large budget increase: ${increasePercentage.toFixed(0)}% (${currentCampaignBudget} → ${newBudget})`,
      );
    }

    // Warning if budget is too low
    if (newBudget < 5) {
      warnings.push('Budget below minimum recommended daily budget of $5');
    }

    // Generate recommendation
    let recommendation: string;
    if (errors.length > 0) {
      recommendation = 'Budget change is UNSAFE. ' + errors.join('. ');
    } else if (warnings.length > 0) {
      recommendation = 'Budget change is safe but has warnings. ' + warnings.join('. ');
    } else {
      recommendation = 'Budget change is SAFE. Proceed with confidence.';
    }

    const safe = errors.length === 0;

    return {
      safe,
      currentDailyTotal,
      proposedDailyTotal,
      globalCap: this.globalBudgetCap,
      remainingBudget,
      utilizationPercentage,
      warnings,
      errors,
      recommendation,
    };
  }

  /**
   * Calculate total daily budget across all active campaigns
   */
  async calculateTotalDailyBudget(): Promise<number> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      select: { dailyBudget: true },
    });

    return campaigns.reduce((sum, c) => sum + parseFloat(c.dailyBudget.toString()), 0);
  }

  /**
   * Get budget utilization summary
   */
  async getBudgetUtilization(): Promise<{
    totalDailyBudget: number;
    globalCap: number;
    remainingBudget: number;
    utilizationPercentage: number;
    activeCampaigns: number;
    status: 'healthy' | 'warning' | 'critical';
  }> {
    const totalDailyBudget = await this.calculateTotalDailyBudget();
    const remainingBudget = this.globalBudgetCap - totalDailyBudget;
    const utilizationPercentage = (totalDailyBudget / this.globalBudgetCap) * 100;

    const activeCampaigns = await this.prisma.adCampaign.count({
      where: { status: 'active' },
    });

    let status: 'healthy' | 'warning' | 'critical';
    if (utilizationPercentage >= 100) {
      status = 'critical';
    } else if (utilizationPercentage >= 90) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return {
      totalDailyBudget,
      globalCap: this.globalBudgetCap,
      remainingBudget,
      utilizationPercentage,
      activeCampaigns,
      status,
    };
  }

  /**
   * Analyze spending for a campaign
   */
  async analyzeSpending(campaignId: string): Promise<SpendingAnalysis> {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const dailyBudget = parseFloat(campaign.dailyBudget.toString());
    const totalSpent = parseFloat(campaign.totalSpent.toString());

    // Calculate today's spend
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMetrics = campaign.metrics.filter((m) => {
      const metricDate = new Date(m.timestamp); // FIX: Renamed from recordedAt to match schema
      metricDate.setHours(0, 0, 0, 0);
      return metricDate.getTime() === today.getTime();
    });

    const todaySpend = todayMetrics.reduce(
      (sum, m) => sum + parseFloat(m.spend.toString()),
      0,
    );

    const remainingDailyBudget = dailyBudget - todaySpend;
    const utilizationPercentage = (todaySpend / dailyBudget) * 100;

    // Estimate projected daily spend based on current rate
    const hoursElapsed = new Date().getHours();
    const projectedDailySpend = hoursElapsed > 0 ? (todaySpend / hoursElapsed) * 24 : todaySpend;

    const isOverspending = projectedDailySpend > dailyBudget * 1.1; // 10% over budget

    // Calculate days until budget exhausted (if campaign has total budget)
    const totalBudget = parseFloat(campaign.totalBudget?.toString() || '0');
    const daysUntilBudgetExhausted =
      totalBudget > 0 && projectedDailySpend > 0
        ? Math.ceil((totalBudget - totalSpent) / projectedDailySpend)
        : 999;

    return {
      campaignId,
      dailyBudget,
      totalSpent,
      remainingDailyBudget,
      utilizationPercentage,
      projectedDailySpend,
      isOverspending,
      daysUntilBudgetExhausted,
    };
  }

  /**
   * Get campaigns at risk of budget exhaustion
   */
  async getCampaignsAtRisk(): Promise<{
    campaignId: string;
    campaignName: string;
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
    recommendation: string;
  }[]> {
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
    });

    const atRisk: any[] = [];

    for (const campaign of campaigns) {
      const analysis = await this.analyzeSpending(campaign.id);

      let riskLevel: 'high' | 'medium' | 'low' | null = null;
      let reason = '';
      let recommendation = '';

      // High risk: Overspending significantly
      if (analysis.isOverspending && analysis.utilizationPercentage > 120) {
        riskLevel = 'high';
        reason = `Projected daily spend ($${analysis.projectedDailySpend.toFixed(2)}) exceeds budget by ${(analysis.utilizationPercentage - 100).toFixed(0)}%`;
        recommendation = 'Pause campaign immediately or increase daily budget';
      }
      // Medium risk: Close to budget exhaustion
      else if (analysis.utilizationPercentage > 90 && analysis.utilizationPercentage <= 120) {
        riskLevel = 'medium';
        reason = `${analysis.utilizationPercentage.toFixed(0)}% of daily budget spent`;
        recommendation = 'Monitor closely. May hit daily cap soon.';
      }
      // Medium risk: Total budget running out
      else if (analysis.daysUntilBudgetExhausted <= 3 && analysis.daysUntilBudgetExhausted > 0) {
        riskLevel = 'medium';
        reason = `Only ${analysis.daysUntilBudgetExhausted} days until total budget exhausted`;
        recommendation = 'Increase total budget or prepare to pause campaign';
      }

      if (riskLevel) {
        atRisk.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          riskLevel,
          reason,
          recommendation,
        });
      }
    }

    return atRisk.sort((a, b) => {
      const levels = { high: 0, medium: 1, low: 2 };
      return levels[a.riskLevel] - levels[b.riskLevel];
    });
  }

  /**
   * Emergency budget freeze (pause all campaigns)
   */
  async emergencyBudgetFreeze(reason: string): Promise<{
    pausedCount: number;
    pausedCampaigns: string[];
  }> {
    this.logger.warn(`EMERGENCY BUDGET FREEZE: ${reason}`);

    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
    });

    const pausedCampaigns: string[] = [];

    for (const campaign of activeCampaigns) {
      await this.prisma.adCampaign.update({
        where: { id: campaign.id },
        data: {
          status: 'paused',
          pauseReason: `Emergency freeze: ${reason}`,
          pausedAt: new Date(),
        },
      });
      pausedCampaigns.push(campaign.id);
    }

    this.logger.warn(`Paused ${pausedCampaigns.length} campaigns during emergency freeze`);

    return {
      pausedCount: pausedCampaigns.length,
      pausedCampaigns,
    };
  }

  /**
   * Validate budget allocation across campaigns
   */
  async validateBudgetAllocation(): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    const utilization = await this.getBudgetUtilization();

    // Check if at or over cap
    if (utilization.utilizationPercentage >= 100) {
      issues.push(`Budget cap reached: ${utilization.utilizationPercentage.toFixed(1)}%`);
      suggestions.push('Pause underperforming campaigns or increase global cap');
    }

    // Check if too many campaigns
    if (utilization.activeCampaigns > 20) {
      issues.push(`High campaign count: ${utilization.activeCampaigns} active campaigns`);
      suggestions.push('Consolidate campaigns or increase management capacity');
    }

    // Check for budget concentration
    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      orderBy: { dailyBudget: 'desc' },
      take: 3,
    });

    const top3Budget = campaigns.reduce(
      (sum, c) => sum + parseFloat(c.dailyBudget.toString()),
      0,
    );
    const concentrationPercentage = (top3Budget / utilization.totalDailyBudget) * 100;

    if (concentrationPercentage > 70) {
      issues.push(`Budget concentration risk: Top 3 campaigns use ${concentrationPercentage.toFixed(0)}% of budget`);
      suggestions.push('Diversify budget across more campaigns to reduce risk');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    };
  }
}
