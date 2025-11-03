import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Smart Scaler Service
 *
 * Automatically scales winning campaigns based on performance.
 *
 * Scaling Rules:
 * - 2x Scale: ROI > 50%, CTR > 1%, EPC > $0.05, 100+ conversions
 * - 5x Scale: ROI > 100%, CTR > 2%, EPC > $0.10, 500+ conversions
 * - 10x Scale: ROI > 200%, CTR > 3%, EPC > $0.20, 1000+ conversions
 */

export interface ScalingCriteria {
  minROI: number;
  minCTR: number;
  minEPC: number;
  minConversions: number;
}

export interface ScalingCandidate {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  recommendedScale: number; // 2, 5, or 10
  newBudget: number;
  currentROI: number;
  currentCTR: number;
  currentEPC: number;
  totalConversions: number;
  reason: string;
}

export interface ScalingResult {
  success: boolean;
  campaignId: string;
  oldBudget: number;
  newBudget: number;
  scaleFactor: number;
  message: string;
}

@Injectable()
export class SmartScalerService {
  private readonly logger = new Logger(SmartScalerService.name);
  private readonly globalBudgetCap: number;

  // Scaling tier criteria
  private readonly SCALE_2X_CRITERIA: ScalingCriteria = {
    minROI: 50,
    minCTR: 1.0,
    minEPC: 0.05,
    minConversions: 100,
  };

  private readonly SCALE_5X_CRITERIA: ScalingCriteria = {
    minROI: 100,
    minCTR: 2.0,
    minEPC: 0.10,
    minConversions: 500,
  };

  private readonly SCALE_10X_CRITERIA: ScalingCriteria = {
    minROI: 200,
    minCTR: 3.0,
    minEPC: 0.20,
    minConversions: 1000,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.globalBudgetCap = parseFloat(
      this.configService.get<string>('OFFERLAB_GLOBAL_BUDGET_CAP') || '300',
    );
  }

  /**
   * Find campaigns eligible for scaling
   */
  async findScalingCandidates(): Promise<ScalingCandidate[]> {
    this.logger.log('Finding campaigns eligible for scaling...');

    const campaigns = await this.prisma.adCampaign.findMany({
      where: { status: 'active' },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 10, // Last 10 metrics
        },
      },
    });

    const candidates: ScalingCandidate[] = [];

    for (const campaign of campaigns) {
      const candidate = await this.evaluateCampaignForScaling(campaign);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    this.logger.log(`Found ${candidates.length} scaling candidates`);
    return candidates.sort((a, b) => b.recommendedScale - a.recommendedScale);
  }

  /**
   * Evaluate a single campaign for scaling
   */
  private async evaluateCampaignForScaling(campaign: any): Promise<ScalingCandidate | null> {
    if (campaign.metrics.length === 0) {
      return null;
    }

    // Aggregate metrics
    const totals = campaign.metrics.reduce(
      (acc, m) => ({
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
        spend: acc.spend + parseFloat(m.spend.toString()),
        revenue: acc.revenue + parseFloat(m.revenue.toString()),
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
    );

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const epc = totals.clicks > 0 ? totals.revenue / totals.clicks : 0;
    const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;

    // Check if already scaled recently (cooldown period)
    const hasRecentScaling = await this.hasRecentScalingEvent(campaign.id, 24); // 24 hours
    if (hasRecentScaling) {
      return null;
    }

    // Determine scaling tier
    let scaleFactor: number | null = null;
    let criteria: ScalingCriteria | null = null;

    if (this.meetsScalingCriteria(roi, ctr, epc, totals.conversions, this.SCALE_10X_CRITERIA)) {
      scaleFactor = 10;
      criteria = this.SCALE_10X_CRITERIA;
    } else if (this.meetsScalingCriteria(roi, ctr, epc, totals.conversions, this.SCALE_5X_CRITERIA)) {
      scaleFactor = 5;
      criteria = this.SCALE_5X_CRITERIA;
    } else if (this.meetsScalingCriteria(roi, ctr, epc, totals.conversions, this.SCALE_2X_CRITERIA)) {
      scaleFactor = 2;
      criteria = this.SCALE_2X_CRITERIA;
    }

    if (!scaleFactor || !criteria) {
      return null;
    }

    const currentBudget = parseFloat(campaign.dailyBudget.toString());
    const newBudget = currentBudget * scaleFactor;

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      currentBudget,
      recommendedScale: scaleFactor,
      newBudget,
      currentROI: parseFloat(roi.toFixed(2)),
      currentCTR: parseFloat(ctr.toFixed(2)),
      currentEPC: parseFloat(epc.toFixed(4)),
      totalConversions: totals.conversions,
      reason: `Meets ${scaleFactor}x scaling criteria: ROI ${roi.toFixed(0)}%, CTR ${ctr.toFixed(2)}%, EPC $${epc.toFixed(4)}`,
    };
  }

  /**
   * Check if campaign meets scaling criteria
   */
  private meetsScalingCriteria(
    roi: number,
    ctr: number,
    epc: number,
    conversions: number,
    criteria: ScalingCriteria,
  ): boolean {
    return (
      roi >= criteria.minROI &&
      ctr >= criteria.minCTR &&
      epc >= criteria.minEPC &&
      conversions >= criteria.minConversions
    );
  }

  /**
   * Check if campaign was scaled recently
   */
  private async hasRecentScalingEvent(campaignId: string, hoursAgo: number): Promise<boolean> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursAgo);

    const recentScaling = await this.prisma.scalingEvent.findFirst({
      where: {
        campaignId,
        createdAt: { gte: cutoff },
      },
    });

    return !!recentScaling;
  }

  /**
   * Scale a campaign
   */
  async scaleCampaign(
    campaignId: string,
    scaleFactor: number,
    isManual: boolean = false,
  ): Promise<ScalingResult> {
    this.logger.log(`Scaling campaign ${campaignId} by ${scaleFactor}x`);

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return {
        success: false,
        campaignId,
        oldBudget: 0,
        newBudget: 0,
        scaleFactor: 0,
        message: 'Campaign not found',
      };
    }

    const oldBudget = parseFloat(campaign.dailyBudget.toString());
    const newBudget = oldBudget * scaleFactor;

    // Check global budget cap
    const wouldExceedCap = await this.wouldExceedGlobalCap(campaignId, newBudget);
    if (wouldExceedCap) {
      return {
        success: false,
        campaignId,
        oldBudget,
        newBudget,
        scaleFactor,
        message: `Scaling would exceed global budget cap of $${this.globalBudgetCap}`,
      };
    }

    // Update campaign budget
    await this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        dailyBudget: new Decimal(newBudget.toFixed(2)),
      },
    });

    // Record scaling event
    await this.prisma.scalingEvent.create({
      data: {
        campaignId,
        scalingType: isManual ? 'manual' : 'auto',
        scaleFactor: new Decimal(scaleFactor.toFixed(2)),
        oldBudget: new Decimal(oldBudget.toFixed(2)),
        newBudget: new Decimal(newBudget.toFixed(2)),
        reason: isManual
          ? 'Manual scaling'
          : `Auto-scaled ${scaleFactor}x based on performance`,
      },
    });

    this.logger.log(
      `Scaled campaign ${campaignId}: $${oldBudget} → $${newBudget} (${scaleFactor}x)`,
    );

    return {
      success: true,
      campaignId,
      oldBudget,
      newBudget,
      scaleFactor,
      message: `Successfully scaled campaign ${scaleFactor}x`,
    };
  }

  /**
   * Check if scaling would exceed global budget cap
   */
  private async wouldExceedGlobalCap(campaignId: string, newBudget: number): Promise<boolean> {
    const activeCampaigns = await this.prisma.adCampaign.findMany({
      where: {
        status: 'active',
        id: { not: campaignId },
      },
      select: { dailyBudget: true },
    });

    const currentTotal = activeCampaigns.reduce(
      (sum, c) => sum + parseFloat(c.dailyBudget.toString()),
      0,
    );

    const newTotal = currentTotal + newBudget;
    return newTotal > this.globalBudgetCap;
  }

  /**
   * Auto-scale all eligible campaigns
   */
  async autoScaleCampaigns(): Promise<{
    scaledCount: number;
    scaledCampaigns: ScalingResult[];
  }> {
    const candidates = await this.findScalingCandidates();
    const scaledCampaigns: ScalingResult[] = [];

    for (const candidate of candidates) {
      try {
        const result = await this.scaleCampaign(candidate.campaignId, candidate.recommendedScale);
        if (result.success) {
          scaledCampaigns.push(result);
        }
      } catch (error) {
        this.logger.error(
          `Error scaling campaign ${candidate.campaignId}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Auto-scaled ${scaledCampaigns.length} campaigns`);

    return {
      scaledCount: scaledCampaigns.length,
      scaledCampaigns,
    };
  }

  /**
   * Get scaling history for a campaign
   */
  async getScalingHistory(campaignId: string): Promise<any[]> {
    return this.prisma.scalingEvent.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all scaling events
   */
  async getAllScalingEvents(limit: number = 100): Promise<any[]> {
    return this.prisma.scalingEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }
}
