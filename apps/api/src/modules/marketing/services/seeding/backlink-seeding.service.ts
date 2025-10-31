import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  BacklinkType,
  BacklinkStatus,
  OutreachType,
  CampaignStatus,
  HAROQueryStatus,
  BrokenLinkStatus,
  PartnershipStatus,
  ResourcePageStatus,
} from '@dryjets/database';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Backlink & Outreach Seeding Service
 * Generates realistic backlink portfolio and outreach campaign data
 *
 * Backlink Distribution:
 * - HARO: 20%
 * - Guest Posts: 25%
 * - Broken Link: 15%
 * - Resource Pages: 15%
 * - Partnerships: 10%
 * - Organic: 10%
 * - UGC Tools: 5%
 *
 * Status Distribution:
 * - ACTIVE: 75%
 * - LOST: 15%
 * - TOXIC: 5%
 * - DISAVOWED: 5%
 *
 * Features:
 * - Domain Authority (DA) and Page Authority (PA) scores
 * - DoFollow/NoFollow attribution
 * - Anchor text variation
 * - Outreach campaign tracking
 * - HARO query responses
 * - Broken link opportunities
 * - Partnership proposals
 * - Resource page targets
 * - Response rates and success metrics
 */

interface BacklinkSeed {
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string | null;
  domainAuthority: number;
  pageAuthority: number;
  isDoFollow: boolean;
  acquisitionType: BacklinkType;
  status: BacklinkStatus;
  firstSeen: Date;
  lastSeen: Date;
  lostAt: Date | null;
}

@Injectable()
export class BacklinkSeedingService {
  private readonly logger = new Logger('BacklinkSeeding');
  private readonly anthropic: Anthropic;

  // High-authority domains for backlinks
  private readonly HIGH_DA_DOMAINS = [
    { domain: 'forbes.com', da: 95 },
    { domain: 'entrepreneur.com', da: 93 },
    { domain: 'inc.com', da: 92 },
    { domain: 'businessinsider.com', da: 91 },
    { domain: 'huffpost.com', da: 90 },
    { domain: 'medium.com', da: 89 },
    { domain: 'washingtonpost.com', da: 94 },
    { domain: 'nytimes.com', da: 95 },
    { domain: 'techcrunch.com', da: 92 },
    { domain: 'fastcompany.com', da: 90 },
  ];

  private readonly MEDIUM_DA_DOMAINS = [
    { domain: 'industrytoday.com', da: 65 },
    { domain: 'cleaningbusiness.com', da: 62 },
    { domain: 'fabriccareguide.com', da: 58 },
    { domain: 'laundryblog.net', da: 55 },
    { domain: 'greencleaningmag.com', da: 60 },
    { domain: 'textilecare.org', da: 63 },
    { domain: 'businessnewsdaily.com', da: 67 },
    { domain: 'smallbiztrends.com', da: 70 },
    { domain: 'laundrynews.com', da: 54 },
    { domain: 'drycleaningworld.com', da: 52 },
  ];

  private readonly LOW_DA_DOMAINS = [
    { domain: 'localbusiness.guide', da: 35 },
    { domain: 'citydirectory.com', da: 32 },
    { domain: 'businesslistings.net', da: 28 },
    { domain: 'smallbusinesshub.com', da: 38 },
    { domain: 'startupblog.io', da: 42 },
  ];

  // Target pages on our site
  private readonly TARGET_PAGES = [
    '/services/dry-cleaning',
    '/services/laundry',
    '/blog/stain-removal-guide',
    '/about',
    '/eco-friendly-cleaning',
    '/subscription-plans',
  ];

  // Anchor text templates
  private readonly ANCHOR_TEXTS = [
    'dry cleaning service',
    'professional laundry',
    'eco-friendly dry cleaning',
    'same day laundry service',
    'DryJets',
    'learn more',
    'click here',
    'read the full guide',
    'best dry cleaners',
    'laundry pickup and delivery',
  ];

  // HARO sources
  private readonly HARO_SOURCES = ['haro', 'sourcebottle', 'terkel', 'qwoted'];

  private readonly HARO_CATEGORIES = [
    'Business & Finance',
    'Lifestyle & Fitness',
    'Home & Garden',
    'Technology',
    'Environment',
  ];

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main seeding method
   */
  async seedBacklinks(backlinkCount: number = 2000): Promise<{
    totalBacklinks: number;
    activeBacklinks: number;
    lostBacklinks: number;
    toxicBacklinks: number;
    totalOutreachCampaigns: number;
    haroQueries: number;
    brokenLinkOpportunities: number;
    partnerships: number;
    resourcePages: number;
    avgDomainAuthority: number;
    doFollowPercentage: number;
    byAcquisitionType: Record<string, number>;
  }> {
    this.logger.log(`Starting backlink seeding: ${backlinkCount} backlinks...`);

    const stats = {
      totalBacklinks: 0,
      activeBacklinks: 0,
      lostBacklinks: 0,
      toxicBacklinks: 0,
      totalOutreachCampaigns: 0,
      haroQueries: 0,
      brokenLinkOpportunities: 0,
      partnerships: 0,
      resourcePages: 0,
      avgDomainAuthority: 0,
      doFollowPercentage: 0,
      byAcquisitionType: {} as Record<string, number>,
    };

    // Create outreach campaigns first
    this.logger.log('Creating outreach campaigns...');
    const outreachCampaigns = await this.createOutreachCampaigns(20);
    stats.totalOutreachCampaigns = outreachCampaigns.length;

    // Generate backlinks
    this.logger.log('Generating backlinks...');
    const backlinks = this.generateBacklinks(backlinkCount, outreachCampaigns);

    // Insert backlinks
    await this.insertBacklinkBatch(backlinks);
    stats.totalBacklinks = backlinks.length;

    // Calculate stats
    stats.activeBacklinks = backlinks.filter((b) => b.status === BacklinkStatus.ACTIVE).length;
    stats.lostBacklinks = backlinks.filter((b) => b.status === BacklinkStatus.LOST).length;
    stats.toxicBacklinks = backlinks.filter((b) => b.status === BacklinkStatus.TOXIC).length;

    const totalDA = backlinks.reduce((sum, b) => sum + b.domainAuthority, 0);
    stats.avgDomainAuthority = Math.round(totalDA / backlinks.length);

    const doFollowCount = backlinks.filter((b) => b.isDoFollow).length;
    stats.doFollowPercentage = Math.round((doFollowCount / backlinks.length) * 100);

    // Count by acquisition type
    for (const type of Object.values(BacklinkType)) {
      stats.byAcquisitionType[type] = backlinks.filter((b) => b.acquisitionType === type).length;
    }

    // Create supporting data
    this.logger.log('Creating HARO queries...');
    await this.createHAROQueries(100);
    stats.haroQueries = 100;

    this.logger.log('Creating broken link opportunities...');
    await this.createBrokenLinkOpportunities(75);
    stats.brokenLinkOpportunities = 75;

    this.logger.log('Creating partnership proposals...');
    await this.createPartnershipProposals(30);
    stats.partnerships = 30;

    this.logger.log('Creating resource page targets...');
    await this.createResourcePageTargets(50);
    stats.resourcePages = 50;

    this.logger.log(`✅ Backlink seeding complete: ${stats.totalBacklinks} backlinks`);
    this.logger.log(`   - Active: ${stats.activeBacklinks} (${Math.round((stats.activeBacklinks / stats.totalBacklinks) * 100)}%)`);
    this.logger.log(`   - Lost: ${stats.lostBacklinks}`);
    this.logger.log(`   - Toxic: ${stats.toxicBacklinks}`);
    this.logger.log(`   - Avg DA: ${stats.avgDomainAuthority}`);
    this.logger.log(`   - DoFollow: ${stats.doFollowPercentage}%`);

    return stats;
  }

  /**
   * Create outreach campaigns
   */
  private async createOutreachCampaigns(count: number): Promise<string[]> {
    const campaignIds: string[] = [];

    const types = [OutreachType.HARO, OutreachType.GUEST_POST, OutreachType.BROKEN_LINK, OutreachType.RESOURCE_PAGE, OutreachType.PARTNERSHIP];

    for (let i = 0; i < count; i++) {
      const type = this.randomElement(types);
      const status = Math.random() < 0.3 ? CampaignStatus.COMPLETED : Math.random() < 0.6 ? CampaignStatus.ACTIVE : CampaignStatus.PAUSED;

      const emailsSent = 10 + Math.floor(Math.random() * 90); // 10-100
      const responseRate = 0.1 + Math.random() * 0.3; // 10-40%
      const responses = Math.floor(emailsSent * responseRate);
      const conversionRate = 0.2 + Math.random() * 0.3; // 20-50% of responses convert
      const backlinksAcquired = Math.floor(responses * conversionRate);

      const campaign = await this.prisma.outreachCampaign.create({
        data: {
          name: `${type} Campaign ${i + 1}`,
          type,
          targetDomains: this.generateTargetDomains(emailsSent),
          emailTemplate: this.generateEmailTemplate(type),
          emailsSent,
          responses,
          backlinksAcquired,
          status,
          createdAt: this.randomDateWithinYears(2),
          completedAt: status === CampaignStatus.COMPLETED ? new Date() : null,
        },
      });

      campaignIds.push(campaign.id);
    }

    return campaignIds;
  }

  /**
   * Generate backlinks
   */
  private generateBacklinks(count: number, outreachCampaignIds: string[]): BacklinkSeed[] {
    const backlinks: BacklinkSeed[] = [];

    // Distribution by acquisition type
    const distribution = {
      [BacklinkType.HARO]: Math.floor(count * 0.20),
      [BacklinkType.GUEST_POST]: Math.floor(count * 0.25),
      [BacklinkType.BROKEN_LINK]: Math.floor(count * 0.15),
      [BacklinkType.RESOURCE_PAGE]: Math.floor(count * 0.15),
      [BacklinkType.PARTNERSHIP]: Math.floor(count * 0.10),
      [BacklinkType.ORGANIC]: Math.floor(count * 0.10),
      [BacklinkType.UGC_TOOL]: Math.floor(count * 0.05),
    };

    for (const [type, typeCount] of Object.entries(distribution)) {
      for (let i = 0; i < typeCount; i++) {
        const acquisitionType = type as BacklinkType;

        // Select domain based on acquisition type
        const domain = this.selectDomain(acquisitionType);

        // Status distribution: 75% active, 15% lost, 5% toxic, 5% disavowed
        let status: BacklinkStatus;
        const rand = Math.random();
        if (rand < 0.75) {
          status = BacklinkStatus.ACTIVE;
        } else if (rand < 0.90) {
          status = BacklinkStatus.LOST;
        } else if (rand < 0.95) {
          status = BacklinkStatus.TOXIC;
        } else {
          status = BacklinkStatus.DISAVOWED;
        }

        // DoFollow: 70% for high-quality sources, 50% for others
        const isDoFollow = domain.da > 70 ? Math.random() < 0.7 : Math.random() < 0.5;

        // Page authority (typically 60-80% of domain authority)
        const pageAuthority = Math.floor(domain.da * (0.6 + Math.random() * 0.2));

        // Anchor text (branded vs generic)
        const anchorText = Math.random() < 0.4 ? 'DryJets' : Math.random() < 0.7 ? this.randomElement(this.ANCHOR_TEXTS) : null;

        // Timing
        const firstSeen = this.randomDateWithinYears(2);
        const isLost = status === BacklinkStatus.LOST;
        const lastSeen = isLost ? new Date(firstSeen.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000) : new Date();
        const lostAt = isLost ? lastSeen : null;

        backlinks.push({
          sourceUrl: `https://${domain.domain}/${this.generateSlug()}`,
          sourceDomain: domain.domain,
          targetUrl: `https://dryjets.com${this.randomElement(this.TARGET_PAGES)}`,
          anchorText,
          domainAuthority: domain.da,
          pageAuthority,
          isDoFollow,
          acquisitionType,
          status,
          firstSeen,
          lastSeen,
          lostAt,
        });
      }

      if ((backlinks.length) % 500 === 0) {
        this.logger.debug(`   Generated ${backlinks.length} / ${count} backlinks...`);
      }
    }

    return backlinks;
  }

  /**
   * Select domain based on acquisition type
   */
  private selectDomain(type: BacklinkType): { domain: string; da: number } {
    // High-authority domains for HARO, Guest Posts
    if (type === BacklinkType.HARO || type === BacklinkType.GUEST_POST) {
      return Math.random() < 0.3 ? this.randomElement(this.HIGH_DA_DOMAINS) : this.randomElement(this.MEDIUM_DA_DOMAINS);
    }

    // Medium authority for resource pages, partnerships
    if (type === BacklinkType.RESOURCE_PAGE || type === BacklinkType.PARTNERSHIP) {
      return this.randomElement(this.MEDIUM_DA_DOMAINS);
    }

    // Mix for others
    const rand = Math.random();
    if (rand < 0.2) {
      return this.randomElement(this.HIGH_DA_DOMAINS);
    } else if (rand < 0.7) {
      return this.randomElement(this.MEDIUM_DA_DOMAINS);
    } else {
      return this.randomElement(this.LOW_DA_DOMAINS);
    }
  }

  /**
   * Create HARO queries
   */
  private async createHAROQueries(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const source = this.randomElement(this.HARO_SOURCES);
      const category = this.randomElement(this.HARO_CATEGORIES);

      // Status distribution: 30% NEW, 40% RESPONDED, 15% ACCEPTED, 10% PUBLISHED, 5% REJECTED
      let status: HAROQueryStatus;
      const rand = Math.random();
      if (rand < 0.30) status = HAROQueryStatus.NEW;
      else if (rand < 0.70) status = HAROQueryStatus.RESPONDED;
      else if (rand < 0.85) status = HAROQueryStatus.ACCEPTED;
      else if (rand < 0.95) status = HAROQueryStatus.PUBLISHED;
      else status = HAROQueryStatus.REJECTED;

      const domain = this.randomElement([...this.HIGH_DA_DOMAINS, ...this.MEDIUM_DA_DOMAINS]);
      const deadline = new Date(Date.now() + (1 + Math.random() * 6) * 24 * 60 * 60 * 1000); // 1-7 days

      const ourResponse = status !== HAROQueryStatus.NEW ? this.generateHAROResponse() : null;
      const respondedAt = status !== HAROQueryStatus.NEW ? this.randomDateWithinDays(7) : null;

      const published = status === HAROQueryStatus.PUBLISHED;
      const publishedUrl = published ? `https://${domain.domain}/${this.generateSlug()}` : null;

      const relevanceScore = 40 + Math.floor(Math.random() * 60); // 40-100
      const autoResponded = Math.random() < 0.3; // 30% auto-responded

      await this.prisma.hAROQuery.create({
        data: {
          source,
          queryId: `${source}_${i + 1}_${Date.now()}`,
          journalist: this.generateName(),
          outlet: domain.domain,
          domain: domain.domain,
          domainAuthority: domain.da,
          subject: this.generateHAROSubject(category),
          query: this.generateHAROQuery(category),
          category,
          deadline,
          status,
          ourResponse,
          respondedAt,
          published,
          publishedUrl,
          backlink: published,
          relevanceScore,
          autoResponded,
        },
      });
    }
  }

  /**
   * Create broken link opportunities
   */
  private async createBrokenLinkOpportunities(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const domain = this.randomElement([...this.MEDIUM_DA_DOMAINS, ...this.LOW_DA_DOMAINS]);

      // Status distribution
      let status: BrokenLinkStatus;
      const rand = Math.random();
      if (rand < 0.30) status = BrokenLinkStatus.DISCOVERED;
      else if (rand < 0.50) status = BrokenLinkStatus.VERIFIED;
      else if (rand < 0.65) status = BrokenLinkStatus.CONTACTED;
      else if (rand < 0.80) status = BrokenLinkStatus.WAITING_RESPONSE;
      else if (rand < 0.90) status = BrokenLinkStatus.LINK_REPLACED;
      else status = BrokenLinkStatus.REJECTED;

      const relevanceScore = 50 + Math.floor(Math.random() * 50); // 50-100

      await this.prisma.brokenLinkOpportunity.create({
        data: {
          targetDomain: domain.domain,
          targetUrl: `https://${domain.domain}/${this.generateSlug()}`,
          targetPageTitle: this.generatePageTitle(),
          domainAuthority: domain.da,
          brokenUrl: `https://oldsite.com/${this.generateSlug()}`,
          brokenText: 'Dry Cleaning Guide',
          brokenContext: 'Check out this comprehensive dry cleaning guide for more tips...',
          ourContentUrl: `https://dryjets.com${this.randomElement(this.TARGET_PAGES)}`,
          ourContentTitle: 'Complete Guide to Dry Cleaning',
          relevanceScore,
          status,
          contactEmail: status !== BrokenLinkStatus.DISCOVERED ? `editor@${domain.domain}` : null,
          contactName: status !== BrokenLinkStatus.DISCOVERED ? this.generateName() : null,
          emailSentAt: status !== BrokenLinkStatus.DISCOVERED && status !== BrokenLinkStatus.VERIFIED ? this.randomDateWithinDays(30) : null,
          lastFollowUp: status === BrokenLinkStatus.WAITING_RESPONSE ? this.randomDateWithinDays(14) : null,
          followUpCount: status === BrokenLinkStatus.WAITING_RESPONSE ? Math.floor(Math.random() * 3) : 0,
          linkAcquired: status === BrokenLinkStatus.LINK_REPLACED,
          acquiredAt: status === BrokenLinkStatus.LINK_REPLACED ? new Date() : null,
        },
      });
    }
  }

  /**
   * Create partnership proposals
   */
  private async createPartnershipProposals(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const domain = this.randomElement(this.MEDIUM_DA_DOMAINS);

      // Status distribution
      let status: PartnershipStatus;
      const rand = Math.random();
      if (rand < 0.30) status = PartnershipStatus.PROSPECTING;
      else if (rand < 0.50) status = PartnershipStatus.CONTACTED;
      else if (rand < 0.65) status = PartnershipStatus.NEGOTIATING;
      else if (rand < 0.85) status = PartnershipStatus.ACTIVE;
      else if (rand < 0.95) status = PartnershipStatus.PAUSED;
      else status = PartnershipStatus.ENDED;

      const partnershipType = this.randomElement(['content_exchange', 'guest_post', 'resource_share', 'co_marketing']);

      const isActive = status === PartnershipStatus.ACTIVE;
      const contentShared = isActive ? Math.floor(Math.random() * 10) : 0;
      const backlinksReceived = isActive ? Math.floor(Math.random() * contentShared) : 0;
      const backlinksGiven = isActive ? Math.floor(Math.random() * contentShared) : 0;
      const trafficReceived = isActive ? Math.floor(Math.random() * 5000) : 0;

      await this.prisma.partnershipProposal.create({
        data: {
          partnerDomain: domain.domain,
          partnerName: this.generateCompanyName(domain.domain),
          partnerEmail: `partnerships@${domain.domain}`,
          domainAuthority: domain.da,
          partnershipType,
          ourProposal: this.generatePartnershipProposal(partnershipType),
          theirRequirements: status !== PartnershipStatus.PROSPECTING ? 'Monthly content exchange with backlinks' : null,
          valueExchange: status !== PartnershipStatus.PROSPECTING ? 'Both parties benefit from expanded reach' : null,
          status,
          contactedAt: status !== PartnershipStatus.PROSPECTING ? this.randomDateWithinDays(60) : null,
          responseReceived: status !== PartnershipStatus.PROSPECTING && status !== PartnershipStatus.CONTACTED,
          responseAt: status === PartnershipStatus.NEGOTIATING || status === PartnershipStatus.ACTIVE ? this.randomDateWithinDays(45) : null,
          agreedTerms: isActive ? 'Monthly content exchange, 2 backlinks per month each' : null,
          startDate: isActive ? this.randomDateWithinDays(90) : null,
          endDate: status === PartnershipStatus.ENDED ? new Date() : null,
          contentShared,
          backlinksReceived,
          backlinksGiven,
          trafficReceived,
        },
      });
    }
  }

  /**
   * Create resource page targets
   */
  private async createResourcePageTargets(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const domain = this.randomElement([...this.MEDIUM_DA_DOMAINS, ...this.LOW_DA_DOMAINS]);

      // Status distribution
      let status: ResourcePageStatus;
      const rand = Math.random();
      if (rand < 0.30) status = ResourcePageStatus.DISCOVERED;
      else if (rand < 0.50) status = ResourcePageStatus.ANALYZED;
      else if (rand < 0.65) status = ResourcePageStatus.CONTACTED;
      else if (rand < 0.80) status = ResourcePageStatus.WAITING;
      else if (rand < 0.90) status = ResourcePageStatus.ADDED;
      else status = ResourcePageStatus.REJECTED;

      const relevanceScore = 60 + Math.floor(Math.random() * 40); // 60-100

      await this.prisma.resourcePageTarget.create({
        data: {
          pageUrl: `https://${domain.domain}/resources/${this.generateSlug()}`,
          pageDomain: domain.domain,
          pageTitle: 'Best Dry Cleaning Resources',
          domainAuthority: domain.da,
          topic: this.randomElement(['dry cleaning', 'laundry', 'fabric care', 'stain removal']),
          resourceCount: 10 + Math.floor(Math.random() * 40), // 10-50 resources
          isActive: Math.random() < 0.8,
          lastUpdated: this.randomDateWithinYears(1),
          ourResourceUrl: `https://dryjets.com${this.randomElement(this.TARGET_PAGES)}`,
          ourResourceTitle: 'Professional Dry Cleaning Services',
          ourResourceDesc: 'Comprehensive dry cleaning and laundry services with eco-friendly options',
          relevanceScore,
          status,
          curatorEmail: status !== ResourcePageStatus.DISCOVERED && status !== ResourcePageStatus.ANALYZED ? `curator@${domain.domain}` : null,
          curatorName: status !== ResourcePageStatus.DISCOVERED && status !== ResourcePageStatus.ANALYZED ? this.generateName() : null,
          contactedAt: status !== ResourcePageStatus.DISCOVERED && status !== ResourcePageStatus.ANALYZED ? this.randomDateWithinDays(30) : null,
          followUpCount: status === ResourcePageStatus.WAITING ? Math.floor(Math.random() * 3) : 0,
          lastFollowUp: status === ResourcePageStatus.WAITING ? this.randomDateWithinDays(14) : null,
          linkAdded: status === ResourcePageStatus.ADDED,
          addedAt: status === ResourcePageStatus.ADDED ? new Date() : null,
          linkPosition: status === ResourcePageStatus.ADDED ? Math.floor(Math.random() * 20) + 1 : null,
        },
      });
    }
  }

  /**
   * Insert backlinks into database
   */
  private async insertBacklinkBatch(backlinks: BacklinkSeed[]): Promise<void> {
    const batchSize = 100;
    const batches = Math.ceil(backlinks.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = backlinks.slice(i * batchSize, (i + 1) * batchSize);

      for (const backlink of batch) {
        await this.prisma.backlink.create({
          data: {
            sourceUrl: backlink.sourceUrl,
            sourceDomain: backlink.sourceDomain,
            targetUrl: backlink.targetUrl,
            anchorText: backlink.anchorText,
            domainAuthority: backlink.domainAuthority,
            pageAuthority: backlink.pageAuthority,
            isDoFollow: backlink.isDoFollow,
            acquisitionType: backlink.acquisitionType,
            status: backlink.status,
            firstSeen: backlink.firstSeen,
            lastSeen: backlink.lastSeen,
            lostAt: backlink.lostAt,
          },
        });
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${backlinks.length} backlinks...`);
      }
    }
  }

  /**
   * Get seeding summary
   */
  async getSeedingSummary(): Promise<{
    totalBacklinks: number;
    activeBacklinks: number;
    avgDomainAuthority: number;
    doFollowPercentage: number;
    totalOutreachCampaigns: number;
    avgResponseRate: number;
  }> {
    const total = await this.prisma.backlink.count();
    const active = await this.prisma.backlink.count({ where: { status: BacklinkStatus.ACTIVE } });

    const backlinkAgg = await this.prisma.backlink.aggregate({
      _avg: { domainAuthority: true },
    });

    const doFollowCount = await this.prisma.backlink.count({ where: { isDoFollow: true } });

    const campaigns = await this.prisma.outreachCampaign.count();
    const campaignAgg = await this.prisma.outreachCampaign.aggregate({
      _sum: { emailsSent: true, responses: true },
    });

    const avgResponseRate = campaignAgg._sum.emailsSent
      ? Math.round(((campaignAgg._sum.responses || 0) / campaignAgg._sum.emailsSent) * 10000) / 100
      : 0;

    return {
      totalBacklinks: total,
      activeBacklinks: active,
      avgDomainAuthority: Math.round(backlinkAgg._avg.domainAuthority || 0),
      doFollowPercentage: Math.round((doFollowCount / total) * 100),
      totalOutreachCampaigns: campaigns,
      avgResponseRate,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private generateSlug(): string {
    const words = ['guide', 'tips', 'best', 'how-to', 'ultimate', 'complete', 'professional'];
    const topics = ['dry-cleaning', 'laundry', 'stain-removal', 'fabric-care', 'garment-care'];
    return `${this.randomElement(words)}-${this.randomElement(topics)}-${Math.floor(Math.random() * 1000)}`;
  }

  private generateTargetDomains(count: number): string[] {
    const allDomains = [...this.HIGH_DA_DOMAINS, ...this.MEDIUM_DA_DOMAINS, ...this.LOW_DA_DOMAINS];
    const shuffled = allDomains.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((d) => d.domain);
  }

  private generateEmailTemplate(type: OutreachType): string {
    return `Hi {name},\n\nI noticed your article on {topic} and thought our recent guide on ${type.toLowerCase()} would be a great addition.\n\nBest regards,\nDryJets Team`;
  }

  private generateHAROSubject(category: string): string {
    return `[${category}] Expert needed: Fabric Care Best Practices`;
  }

  private generateHAROQuery(category: string): string {
    return `Looking for experts in ${category.toLowerCase()} to comment on sustainable business practices and eco-friendly operations. Deadline in 3 days.`;
  }

  private generateHAROResponse(): string {
    return 'As an expert in sustainable dry cleaning, I can share that eco-friendly practices reduce costs by 20% while improving customer satisfaction...';
  }

  private generateName(): string {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
    return `${this.randomElement(firstNames)} ${this.randomElement(lastNames)}`;
  }

  private generatePageTitle(): string {
    return `${this.randomElement(['Best', 'Top', 'Ultimate'])} ${this.randomElement(['Dry Cleaning', 'Laundry', 'Fabric Care'])} Resources`;
  }

  private generateCompanyName(domain: string): string {
    return domain.split('.')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  private generatePartnershipProposal(type: string): string {
    return `We'd like to propose a ${type.replace('_', ' ')} partnership that benefits both our audiences. We can exchange high-quality content monthly.`;
  }

  private randomDateWithinYears(years: number): Date {
    const now = new Date();
    const past = new Date(now.getTime() - years * 365 * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  }

  private randomDateWithinDays(days: number): Date {
    const now = new Date();
    return new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
  }

  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
