import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { FunnelCopyService } from './funnel-copy.service';
import { FunnelCreativeService } from './funnel-creative.service';
import { LeadMagnetGeneratorService } from './lead-magnet-generator.service';

export interface FunnelGenerationRequest {
  offerId: string;
  template?: string;
  includeLeadMagnet?: boolean;
  targetGeo?: string;
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
  length?: 'short' | 'medium' | 'long';
}

/**
 * Funnel generator service
 * Orchestrates the complete funnel generation process
 */
@Injectable()
export class FunnelGeneratorService {
  private readonly logger = new Logger(FunnelGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly copyService: FunnelCopyService,
    private readonly creativeService: FunnelCreativeService,
    private readonly leadMagnetService: LeadMagnetGeneratorService,
  ) {}

  /**
   * Generate a complete funnel for an offer
   */
  async generateFunnel(request: FunnelGenerationRequest) {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating funnel for offer: ${request.offerId}`);

      // Step 1: Fetch offer details
      const offer = await this.prisma.offer.findUnique({
        where: { id: request.offerId },
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      // Step 2: Generate copy (headline, subheadline, body, CTA)
      this.logger.log('→ Generating copy...');
      const copy = await this.copyService.generateCopy({
        offerTitle: offer.title,
        offerDescription: offer.description || offer.title,
        category: offer.category,
        payout: offer.payout.toNumber(),
        targetGeo: request.targetGeo,
        tone: request.tone,
        length: request.length,
      });

      // Step 3: Generate creative assets (hero image)
      this.logger.log('→ Generating creative assets...');
      const creatives = await this.creativeService.generateCreativeSet({
        offerTitle: offer.title,
        category: offer.category,
        headline: copy.headline,
        tone: request.tone,
      });

      // Step 4: Generate lead magnet (if requested)
      let leadMagnetId: string | null = null;

      if (request.includeLeadMagnet) {
        this.logger.log('→ Generating lead magnet...');
        const leadMagnetData = await this.leadMagnetService.generateLeadMagnet({
          title: `Free Guide: ${offer.title}`,
          description: `Complete guide to getting started with ${offer.title}`,
          format: 'pdf',
          offerTitle: offer.title,
          offerCategory: offer.category,
        });

        const leadMagnet = await this.prisma.leadMagnet.create({
          data: {
            title: `Free Guide: ${offer.title}`,
            description: `Bonus guide for ${offer.title}`,
            format: 'pdf',
            fileUrl: leadMagnetData.fileUrl,
            fileSize: leadMagnetData.fileSize,
          },
        });

        leadMagnetId = leadMagnet.id;
      }

      // Step 5: Create funnel in database
      const ctaUrl = offer.trackingLink || `https://placeholder.com/offer/${offer.externalId}`;

      const funnel = await this.prisma.funnel.create({
        data: {
          offerId: offer.id,
          templateUsed: request.template || 'aida-standard',
          headline: copy.headline,
          subheadline: copy.subheadline,
          heroImageUrl: creatives.heroImage,
          bodyContent: copy.bodyContent,
          ctaText: copy.ctaText,
          ctaUrl,
          leadMagnetId,
          fleschScore: copy.fleschScore,
          ctrEstimate: this.estimateCTR(copy.fleschScore, offer.score.toNumber()),
          status: 'draft',
        },
        include: {
          offer: true,
          leadMagnet: true,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(`✓ Funnel generated successfully (${duration}ms)`);

      return {
        funnel,
        generationTime: duration,
      };
    } catch (error) {
      this.logger.error(`Funnel generation error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Estimate CTR based on quality metrics
   */
  private estimateCTR(fleschScore: number, offerScore: number): number {
    // Base CTR: 2%
    let ctr = 2.0;

    // Adjust for readability (higher Flesch = better CTR)
    if (fleschScore > 70) ctr += 0.5;
    else if (fleschScore > 60) ctr += 0.3;
    else if (fleschScore < 40) ctr -= 0.5;

    // Adjust for offer quality
    if (offerScore > 80) ctr += 1.0;
    else if (offerScore > 60) ctr += 0.5;
    else if (offerScore < 40) ctr -= 0.5;

    return Math.max(0.5, Math.min(10.0, ctr)); // Cap between 0.5% and 10%
  }

  /**
   * Regenerate specific funnel components
   */
  async regenerateComponent(
    funnelId: string,
    component: 'copy' | 'creative' | 'lead-magnet',
  ) {
    const funnel = await this.prisma.funnel.findUnique({
      where: { id: funnelId },
      include: { offer: true },
    });

    if (!funnel) {
      throw new Error('Funnel not found');
    }

    switch (component) {
      case 'copy':
        const newCopy = await this.copyService.generateCopy({
          offerTitle: funnel.offer.title,
          offerDescription: funnel.offer.description || funnel.offer.title,
          category: funnel.offer.category,
          payout: funnel.offer.payout.toNumber(),
        });

        await this.prisma.funnel.update({
          where: { id: funnelId },
          data: {
            headline: newCopy.headline,
            subheadline: newCopy.subheadline,
            bodyContent: newCopy.bodyContent,
            ctaText: newCopy.ctaText,
            fleschScore: newCopy.fleschScore,
          },
        });
        break;

      case 'creative':
        const newCreatives = await this.creativeService.generateCreativeSet({
          offerTitle: funnel.offer.title,
          category: funnel.offer.category,
          headline: funnel.headline,
        });

        await this.prisma.funnel.update({
          where: { id: funnelId },
          data: {
            heroImageUrl: newCreatives.heroImage,
          },
        });
        break;

      case 'lead-magnet':
        const leadMagnetData = await this.leadMagnetService.generateLeadMagnet({
          title: `Free Guide: ${funnel.offer.title}`,
          format: 'pdf',
          offerTitle: funnel.offer.title,
          offerCategory: funnel.offer.category,
        });

        const leadMagnet = await this.prisma.leadMagnet.create({
          data: {
            title: `Free Guide: ${funnel.offer.title}`,
            format: 'pdf',
            fileUrl: leadMagnetData.fileUrl,
            fileSize: leadMagnetData.fileSize,
          },
        });

        await this.prisma.funnel.update({
          where: { id: funnelId },
          data: {
            leadMagnetId: leadMagnet.id,
          },
        });
        break;
    }

    return await this.prisma.funnel.findUnique({
      where: { id: funnelId },
      include: { offer: true, leadMagnet: true },
    });
  }

  /**
   * Validate funnel before publishing
   */
  async validateFunnel(funnelId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const funnel = await this.prisma.funnel.findUnique({
      where: { id: funnelId },
      include: { offer: true },
    });

    if (!funnel) {
      throw new Error('Funnel not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Critical errors (block publishing)
    if (!funnel.headline || funnel.headline.length < 10) {
      errors.push('Headline is missing or too short');
    }
    if (!funnel.bodyContent || funnel.bodyContent.length < 100) {
      errors.push('Body content is missing or too short');
    }
    if (!funnel.ctaText) {
      errors.push('CTA text is missing');
    }
    if (!funnel.ctaUrl || funnel.ctaUrl.includes('placeholder')) {
      errors.push('Tracking link is missing - please activate the offer first');
    }

    // Warnings (non-blocking)
    if (!funnel.heroImageUrl || funnel.heroImageUrl.includes('placeholder')) {
      warnings.push('Hero image is missing - using placeholder');
    }
    if (funnel.fleschScore && funnel.fleschScore < 50) {
      warnings.push('Content readability is low - consider simplifying');
    }
    if (funnel.headline.length > 100) {
      warnings.push('Headline is quite long - consider shortening');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Publish funnel
   */
  async publishFunnel(funnelId: string, overrideValidation: boolean = false) {
    const validation = await this.validateFunnel(funnelId);

    if (!validation.isValid && !overrideValidation) {
      throw new Error(
        `Cannot publish funnel: ${validation.errors.join(', ')}`,
      );
    }

    const funnel = await this.prisma.funnel.update({
      where: { id: funnelId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
      include: {
        offer: true,
        leadMagnet: true,
      },
    });

    this.logger.log(`✓ Funnel published: ${funnelId}`);

    return funnel;
  }

  /**
   * Track funnel view (increment counter)
   */
  async trackView(funnelId: string) {
    await this.prisma.funnel.update({
      where: { id: funnelId },
      data: {
        views: { increment: 1 },
      },
    });
  }

  /**
   * Track funnel click (increment counter)
   */
  async trackClick(funnelId: string) {
    await this.prisma.funnel.update({
      where: { id: funnelId },
      data: {
        clicks: { increment: 1 },
      },
    });
  }

  /**
   * Get funnel performance metrics
   */
  async getFunnelMetrics(funnelId: string) {
    const funnel = await this.prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        _count: {
          select: { funnelLeads: true },
        },
      },
    });

    if (!funnel) {
      throw new Error('Funnel not found');
    }

    const ctr = funnel.views > 0 ? (funnel.clicks / funnel.views) * 100 : 0;
    const conversionRate =
      funnel.views > 0 ? (funnel._count.funnelLeads / funnel.views) * 100 : 0;

    return {
      views: funnel.views,
      clicks: funnel.clicks,
      leads: funnel._count.funnelLeads,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}
