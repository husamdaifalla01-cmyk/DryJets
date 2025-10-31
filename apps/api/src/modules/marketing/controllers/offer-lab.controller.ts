import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { OfferOrchestratorService } from '../services/offer-lab/offer-orchestrator.service';
import { FunnelGeneratorService } from '../services/offer-lab/funnel-generator.service';
import { LeadMagnetGeneratorService } from '../services/offer-lab/lead-magnet-generator.service';
import { OfferSyncProcessor } from '../jobs/offer-sync.processor';
import {
  SyncOffersDto,
  QueryOffersDto,
  UpdateTrackingLinkDto,
  UpdateOfferStatusDto,
  GenerateFunnelDto,
  QueryFunnelsDto,
  UpdateFunnelDto,
  PublishFunnelDto,
  CaptureLeadDto,
  QueryLeadsDto,
  GenerateLeadMagnetDto,
} from '../dto/offer-lab.dto';

/**
 * OFFER-LAB CONTROLLER
 *
 * REST API endpoints for the Offer-Lab affiliate marketing automation system.
 * Handles offer import, funnel generation, lead capture, and campaign management.
 *
 * Phase 1 endpoints (14 total):
 * - Offer sync and management (5 endpoints)
 * - Funnel generation and publishing (5 endpoints)
 * - Lead capture and management (2 endpoints)
 * - Lead magnet generation (1 endpoint)
 * - Scraper logs (1 endpoint)
 */

@Controller('marketing/offer-lab')
@UseGuards(JwtAuthGuard)
export class OfferLabController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: OfferOrchestratorService,
    private readonly funnelGenerator: FunnelGeneratorService,
    private readonly leadMagnetGenerator: LeadMagnetGeneratorService,
    private readonly offerSyncProcessor: OfferSyncProcessor,
  ) {}

  // ========================================
  // OFFER SYNC & MANAGEMENT
  // ========================================

  /**
   * Trigger manual offer sync
   * POST /marketing/offer-lab/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async syncOffers(@Body() dto: SyncOffersDto) {
    return await this.offerSyncProcessor.triggerManualSync(
      dto.network,
      dto.forceRefresh || false,
    );
  }

  /**
   * List/search offers with filters
   * GET /marketing/offer-lab/offers
   */
  @Get('offers')
  async listOffers(@Query() query: QueryOffersDto) {
    const {
      network,
      status,
      minScore,
      minPayout,
      category,
      geoTarget,
      searchQuery,
      page = 1,
      pageSize = 20,
      sortBy = 'score',
      sortOrder = 'desc',
    } = query;

    // Build where clause
    const where: any = {};

    if (network) where.network = network;
    if (status) where.status = status;
    if (minScore) where.score = { gte: minScore };
    if (minPayout) where.payout = { gte: minPayout };
    if (category) where.category = { has: category };
    if (geoTarget) where.geoTargets = { has: geoTarget };
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.offer.count({ where });

    // Get offers
    const offers = await this.prisma.offer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      offers,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    };
  }

  /**
   * Get single offer details
   * GET /marketing/offer-lab/offers/:id
   */
  @Get('offers/:id')
  async getOffer(@Param('id') id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        funnels: {
          select: {
            id: true,
            headline: true,
            status: true,
            views: true,
            clicks: true,
            leads: true,
            createdAt: true,
          },
        },
      },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    return offer;
  }

  /**
   * Update offer tracking link (after manual activation)
   * PATCH /marketing/offer-lab/offers/:id/tracking-link
   */
  @Patch('offers/:id/tracking-link')
  async updateTrackingLink(
    @Param('id') id: string,
    @Body() dto: UpdateTrackingLinkDto,
  ) {
    const offer = await this.prisma.offer.update({
      where: { id },
      data: {
        trackingLink: dto.trackingLink,
        activatedAt: new Date(),
        status: 'testing', // Move to testing once activated
      },
    });

    return {
      success: true,
      offer,
      message: 'Tracking link updated successfully',
    };
  }

  /**
   * Update offer status
   * PATCH /marketing/offer-lab/offers/:id/status
   */
  @Patch('offers/:id/status')
  async updateOfferStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOfferStatusDto,
  ) {
    const offer = await this.prisma.offer.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      success: true,
      offer,
      message: `Offer status updated to ${dto.status}`,
    };
  }

  // ========================================
  // FUNNEL GENERATION & PUBLISHING
  // ========================================

  /**
   * Generate funnel for an offer
   * POST /marketing/offer-lab/funnels/generate
   */
  @Post('funnels/generate')
  @HttpCode(HttpStatus.CREATED)
  async generateFunnel(@Body() dto: GenerateFunnelDto) {
    return await this.funnelGenerator.generateFunnel({
      offerId: dto.offerId,
      template: dto.template,
      includeLeadMagnet: dto.includeLeadMagnet,
      targetGeo: dto.targetGeo,
      tone: dto.tone,
      length: dto.length,
    });
  }

  /**
   * List funnels with filters
   * GET /marketing/offer-lab/funnels
   */
  @Get('funnels')
  async listFunnels(@Query() query: QueryFunnelsDto) {
    const {
      status,
      offerId,
      searchQuery,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (status) where.status = status;
    if (offerId) where.offerId = offerId;
    if (searchQuery) {
      where.OR = [
        { headline: { contains: searchQuery, mode: 'insensitive' } },
        { subheadline: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.funnel.count({ where });

    const funnels = await this.prisma.funnel.findMany({
      where,
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            network: true,
            payout: true,
          },
        },
        leadMagnet: {
          select: {
            id: true,
            title: true,
            format: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      funnels,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    };
  }

  /**
   * Get funnel details
   * GET /marketing/offer-lab/funnels/:id
   */
  @Get('funnels/:id')
  async getFunnel(@Param('id') id: string) {
    const funnel = await this.prisma.funnel.findUnique({
      where: { id },
      include: {
        offer: true,
        leadMagnet: true,
        _count: {
          select: { funnelLeads: true },
        },
      },
    });

    if (!funnel) {
      throw new Error('Funnel not found');
    }

    // Calculate performance metrics
    const metrics = await this.funnelGenerator.getFunnelMetrics(id);

    // Run validation
    const validation = await this.funnelGenerator.validateFunnel(id);

    return {
      ...funnel,
      metrics,
      validation,
    };
  }

  /**
   * Update funnel
   * PATCH /marketing/offer-lab/funnels/:id
   */
  @Patch('funnels/:id')
  async updateFunnel(@Param('id') id: string, @Body() dto: UpdateFunnelDto) {
    const funnel = await this.prisma.funnel.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      funnel,
      message: 'Funnel updated successfully',
    };
  }

  /**
   * Publish funnel (make it live)
   * POST /marketing/offer-lab/funnels/:id/publish
   */
  @Post('funnels/:id/publish')
  async publishFunnel(@Param('id') id: string, @Body() dto: PublishFunnelDto) {
    const funnel = await this.funnelGenerator.publishFunnel(
      id,
      dto.overrideValidation || false,
    );

    return {
      success: true,
      funnel,
      message: 'Funnel published successfully',
      publicUrl: `/f/${funnel.id}`,
    };
  }

  // ========================================
  // LEAD CAPTURE & MANAGEMENT
  // ========================================

  /**
   * Capture lead (public endpoint - no auth required)
   * POST /marketing/offer-lab/leads
   */
  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  async captureLead(@Body() dto: CaptureLeadDto, @Request() req) {
    // Extract IP and user agent from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Verify funnel exists and is published
    const funnel = await this.prisma.funnel.findUnique({
      where: { id: dto.funnelId },
    });

    if (!funnel || funnel.status !== 'published') {
      throw new Error('Funnel not found or not published');
    }

    // Create lead
    const lead = await this.prisma.funnelLead.create({
      data: {
        funnelId: dto.funnelId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        ipAddress,
        userAgent,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
      },
    });

    // Increment funnel leads counter
    await this.prisma.funnel.update({
      where: { id: dto.funnelId },
      data: {
        leads: { increment: 1 },
      },
    });

    return {
      success: true,
      leadId: lead.id,
      message: 'Lead captured successfully',
    };
  }

  /**
   * List captured leads
   * GET /marketing/offer-lab/leads
   */
  @Get('leads')
  async listLeads(@Query() query: QueryLeadsDto) {
    const {
      funnelId,
      utmSource,
      utmMedium,
      utmCampaign,
      startDate,
      endDate,
      searchQuery,
      page = 1,
      pageSize = 50,
    } = query;

    const where: any = {};

    if (funnelId) where.funnelId = funnelId;
    if (utmSource) where.utmSource = utmSource;
    if (utmMedium) where.utmMedium = utmMedium;
    if (utmCampaign) where.utmCampaign = utmCampaign;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (searchQuery) {
      where.OR = [
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { firstName: { contains: searchQuery, mode: 'insensitive' } },
        { lastName: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.funnelLead.count({ where });

    const leads = await this.prisma.funnelLead.findMany({
      where,
      include: {
        funnel: {
          select: {
            id: true,
            headline: true,
            offer: {
              select: {
                id: true,
                title: true,
                network: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      leads,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    };
  }

  // ========================================
  // LEAD MAGNET GENERATION
  // ========================================

  /**
   * Generate lead magnet
   * POST /marketing/offer-lab/lead-magnets/generate
   */
  @Post('lead-magnets/generate')
  @HttpCode(HttpStatus.CREATED)
  async generateLeadMagnet(@Body() dto: GenerateLeadMagnetDto) {
    const result = await this.leadMagnetGenerator.generateLeadMagnet({
      title: dto.title,
      description: dto.description,
      format: dto.format,
      content: dto.content,
      offerId: dto.offerId,
    });

    const leadMagnet = await this.prisma.leadMagnet.create({
      data: {
        title: dto.title,
        description: dto.description,
        format: dto.format,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
      },
    });

    return {
      success: true,
      leadMagnet,
      downloadUrl: result.fileUrl,
    };
  }

  // ========================================
  // SCRAPER LOGS & DEBUGGING
  // ========================================

  /**
   * Get scraper logs
   * GET /marketing/offer-lab/scraper-logs
   */
  @Get('scraper-logs')
  async getScraperLogs(
    @Query('network') network?: string,
    @Query('limit') limit: number = 20,
  ) {
    const where: any = {};
    if (network) where.network = network;

    const logs = await this.prisma.scraperLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { logs };
  }
}
