import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Conversion Tracking Service
 *
 * Handles postback URLs from affiliate networks to track conversions.
 * Updates campaign metrics and funnel lead records with conversion data.
 *
 * Postback URL format:
 * https://yourdomain.com/api/marketing/offer-lab/postback?
 *   campaign_id={campaign_id}&
 *   click_id={click_id}&
 *   payout={payout}&
 *   status={status}
 */

export interface PostbackData {
  campaignId?: string;
  clickId?: string;
  leadId?: string;
  payout?: string | number;
  status?: 'approved' | 'pending' | 'rejected';
  transactionId?: string;
  offerId?: string;
}

export interface ConversionResult {
  success: boolean;
  message: string;
  conversionId?: string;
  payout?: number;
}

@Injectable()
export class ConversionTrackerService {
  private readonly logger = new Logger(ConversionTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes conversion postback from affiliate network
   */
  async processPostback(data: PostbackData): Promise<ConversionResult> {
    try {
      // Validate required fields
      if (!data.clickId && !data.leadId) {
        return {
          success: false,
          message: 'Missing click_id or lead_id',
        };
      }

      const payout = this.parsePayout(data.payout);
      const status = data.status || 'approved';

      // Find the funnel lead by click ID or lead ID
      const lead = await this.findLeadByIdentifier(data);

      if (!lead) {
        this.logger.warn(`Lead not found for postback`, data);
        return {
          success: false,
          message: 'Lead not found',
        };
      }

      // Update lead with conversion data
      const updatedLead = await this.prisma.funnelLead.update({
        where: { id: lead.id },
        data: {
          converted: status === 'approved',
          conversionValue: payout > 0 ? new Decimal(payout) : undefined,
          conversionDate: status === 'approved' ? new Date() : undefined,
          transactionId: data.transactionId,
        },
      });

      // Update campaign metrics if we have campaign association
      if (lead.campaignId) {
        await this.updateCampaignConversion(lead.campaignId, payout);
      }

      this.logger.log(`Conversion tracked: Lead ${lead.id}, Payout: $${payout}, Status: ${status}`);

      return {
        success: true,
        message: 'Conversion tracked successfully',
        conversionId: updatedLead.id,
        payout,
      };
    } catch (error) {
      this.logger.error(`Postback processing error: ${error.message}`, data);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Finds lead by click ID or lead ID
   */
  private async findLeadByIdentifier(data: PostbackData) {
    if (data.leadId) {
      return this.prisma.funnelLead.findUnique({
        where: { id: data.leadId },
      });
    }

    if (data.clickId) {
      // Click ID might be stored in metadata or as a custom field
      return this.prisma.funnelLead.findFirst({
        where: {
          OR: [
            { id: data.clickId },
            // Add custom field matching if needed
          ],
        },
      });
    }

    return null;
  }

  /**
   * Updates campaign conversion metrics
   */
  private async updateCampaignConversion(campaignId: string, payout: number): Promise<void> {
    try {
      // Find the campaign
      const campaign = await this.prisma.adCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        this.logger.warn(`Campaign not found: ${campaignId}`);
        return;
      }

      // Increment conversions and revenue in latest metric record
      const latestMetric = await this.prisma.adMetric.findFirst({
        where: { campaignId },
        orderBy: { recordedAt: 'desc' },
      });

      if (latestMetric) {
        await this.prisma.adMetric.update({
          where: { id: latestMetric.id },
          data: {
            conversions: { increment: 1 },
            revenue: { increment: new Decimal(payout) },
          },
        });

        // Recalculate EPC and ROI
        const updated = await this.prisma.adMetric.findUnique({
          where: { id: latestMetric.id },
        });

        const clicks = updated.clicks;
        const revenue = parseFloat(updated.revenue.toString());
        const spent = parseFloat(updated.spent.toString());

        const epc = clicks > 0 ? revenue / clicks : 0;
        const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;

        await this.prisma.adMetric.update({
          where: { id: latestMetric.id },
          data: {
            epc: new Decimal(epc.toFixed(4)),
            roi: new Decimal(roi.toFixed(2)),
          },
        });
      }

      this.logger.log(`Campaign ${campaignId} conversion updated: +$${payout}`);
    } catch (error) {
      this.logger.error(`Campaign conversion update failed: ${error.message}`);
    }
  }

  /**
   * Parses payout value from string or number
   */
  private parsePayout(payout: string | number | undefined): number {
    if (!payout) return 0;
    if (typeof payout === 'number') return payout;
    return parseFloat(payout) || 0;
  }

  /**
   * Generates postback URL for affiliate network setup
   */
  generatePostbackUrl(baseUrl: string, leadId: string, campaignId?: string): string {
    const params = new URLSearchParams({
      lead_id: leadId,
      click_id: '{CLICK_ID}', // Placeholder for network macro
      payout: '{PAYOUT}', // Placeholder for network macro
      status: '{STATUS}', // Placeholder for network macro
      transaction_id: '{TRANSACTION_ID}', // Placeholder for network macro
    });

    if (campaignId) {
      params.set('campaign_id', campaignId);
    }

    return `${baseUrl}/api/marketing/offer-lab/postback?${params.toString()}`;
  }

  /**
   * Gets conversion statistics for a campaign
   */
  async getCampaignConversionStats(campaignId: string) {
    const metrics = await this.prisma.adMetric.findMany({
      where: { campaignId },
      orderBy: { recordedAt: 'desc' },
      take: 24, // Last 24 hours
    });

    if (metrics.length === 0) {
      return {
        conversions: 0,
        revenue: 0,
        avgPayout: 0,
        conversionRate: 0,
      };
    }

    const totals = metrics.reduce(
      (acc, m) => ({
        conversions: acc.conversions + m.conversions,
        revenue: acc.revenue + parseFloat(m.revenue.toString()),
        clicks: acc.clicks + m.clicks,
      }),
      { conversions: 0, revenue: 0, clicks: 0 },
    );

    return {
      conversions: totals.conversions,
      revenue: totals.revenue,
      avgPayout: totals.conversions > 0 ? totals.revenue / totals.conversions : 0,
      conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
    };
  }
}
