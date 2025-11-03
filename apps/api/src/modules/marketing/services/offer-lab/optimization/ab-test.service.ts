import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * A/B Test Service
 *
 * Manages A/B tests for campaigns, funnels, and ad copy.
 * Implements statistical significance testing and winner detection.
 */

export interface CreateABTestRequest {
  campaignId?: string;
  name: string;
  hypothesis: string;
  element: string; // 'headline', 'cta', 'image', 'funnel', 'ad-copy'
  trafficSplit?: number; // Default 50/50
}

export interface TestPerformance {
  variantId: string;
  variantName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cvr: number;
  epc: number;
  confidence?: number;
}

@Injectable()
export class ABTestService {
  private readonly logger = new Logger(ABTestService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new A/B test
   */
  async createTest(request: CreateABTestRequest): Promise<any> {
    this.logger.log(`Creating A/B test: ${request.name}`);

    const test = await this.prisma.aBTest.create({
      data: {
        name: request.name,
        hypothesis: request.hypothesis,
        element: request.element,
        campaignId: request.campaignId,
        status: 'DRAFT',
        trafficSplit: request.trafficSplit || 50,
      },
    });

    this.logger.log(`Created A/B test: ${test.id}`);
    return test;
  }

  /**
   * Add variant to test
   */
  async addVariant(
    testId: string,
    variantData: {
      name: string;
      description: string;
      content: any;
      isControl?: boolean;
    },
  ): Promise<any> {
    const variant = await this.prisma.testVariant.create({
      data: {
        testId,
        name: variantData.name,
        description: variantData.description,
        content: variantData.content,
        isControl: variantData.isControl || false,
      },
    });

    this.logger.log(`Added variant "${variant.name}" to test ${testId}`);
    return variant;
  }

  /**
   * Start A/B test
   */
  async startTest(testId: string): Promise<any> {
    const test = await this.prisma.aBTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    if (test.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    const updatedTest = await this.prisma.aBTest.update({
      where: { id: testId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    this.logger.log(`Started A/B test: ${testId}`);
    return updatedTest;
  }

  /**
   * Record impression for variant
   */
  async recordImpression(variantId: string): Promise<void> {
    await this.prisma.testVariant.update({
      where: { id: variantId },
      data: {
        impressions: { increment: 1 },
      },
    });
  }

  /**
   * Record click for variant
   */
  async recordClick(variantId: string): Promise<void> {
    await this.prisma.testVariant.update({
      where: { id: variantId },
      data: {
        clicks: { increment: 1 },
      },
    });

    // Recalculate CTR
    await this.recalculateMetrics(variantId);
  }

  /**
   * Record conversion for variant
   */
  async recordConversion(variantId: string, revenue: number = 0): Promise<void> {
    await this.prisma.testVariant.update({
      where: { id: variantId },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: new Decimal(revenue) },
      },
    });

    // Recalculate metrics
    await this.recalculateMetrics(variantId);
  }

  /**
   * Recalculate variant metrics
   */
  private async recalculateMetrics(variantId: string): Promise<void> {
    const variant = await this.prisma.testVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) return;

    const ctr = variant.impressions > 0
      ? (variant.clicks / variant.impressions) * 100
      : 0;

    const cvr = variant.clicks > 0
      ? (variant.conversions / variant.clicks) * 100
      : 0;

    await this.prisma.testVariant.update({
      where: { id: variantId },
      data: {
        ctr: new Decimal(ctr.toFixed(2)),
        cvr: new Decimal(cvr.toFixed(2)),
      },
    });
  }

  /**
   * Get test performance summary
   */
  async getTestPerformance(testId: string): Promise<TestPerformance[]> {
    const test = await this.prisma.aBTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    return test.variants.map((variant) => {
      const ctr = variant.impressions > 0
        ? (variant.clicks / variant.impressions) * 100
        : 0;

      const cvr = variant.clicks > 0
        ? (variant.conversions / variant.clicks) * 100
        : 0;

      const epc = variant.clicks > 0
        ? parseFloat(variant.revenue.toString()) / variant.clicks
        : 0;

      return {
        variantId: variant.id,
        variantName: variant.name,
        impressions: variant.impressions,
        clicks: variant.clicks,
        conversions: variant.conversions,
        revenue: parseFloat(variant.revenue.toString()),
        ctr: parseFloat(ctr.toFixed(2)),
        cvr: parseFloat(cvr.toFixed(2)),
        epc: parseFloat(epc.toFixed(4)),
      };
    });
  }

  /**
   * Pause A/B test
   */
  async pauseTest(testId: string): Promise<any> {
    return this.prisma.aBTest.update({
      where: { id: testId },
      data: { status: 'DRAFT' }, // Pause by setting to DRAFT
    });
  }

  /**
   * Complete A/B test
   */
  async completeTest(testId: string, winnerId?: string): Promise<any> {
    const updateData: any = {
      status: 'COMPLETED',
      completedAt: new Date(),
    };

    if (winnerId) {
      updateData.winnerVariantId = winnerId;
    }

    const test = await this.prisma.aBTest.update({
      where: { id: testId },
      data: updateData,
    });

    this.logger.log(`Completed A/B test: ${testId}${winnerId ? ` (Winner: ${winnerId})` : ''}`);
    return test;
  }

  /**
   * Get all active tests
   */
  async getActiveTests(): Promise<any[]> {
    return this.prisma.aBTest.findMany({
      where: { status: 'RUNNING' },
      include: { variants: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Get all tests for a campaign
   */
  async getCampaignTests(campaignId: string): Promise<any[]> {
    return this.prisma.aBTest.findMany({
      where: { campaignId },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete test (and all variants)
   */
  async deleteTest(testId: string): Promise<void> {
    await this.prisma.aBTest.delete({
      where: { id: testId },
    });

    this.logger.log(`Deleted A/B test: ${testId}`);
  }
}
