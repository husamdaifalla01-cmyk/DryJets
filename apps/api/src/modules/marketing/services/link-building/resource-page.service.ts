import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

interface ResourcePageDiscovery {
  pageUrl: string;
  pageDomain: string;
  pageTitle: string;
  topic: string;
  resourceCount: number;
  isActive: boolean;
  relevanceScore: number;
}

@Injectable()
export class ResourcePageService {
  private readonly logger = new Logger('ResourcePageOutreach');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Find resource pages in target topics
   * In production: use Google Search API with specific search operators
   */
  async findResourcePages(topic: string): Promise<ResourcePageDiscovery[]> {
    this.logger.log(`Finding resource pages for topic: ${topic}`);

    // Simulated resource page discovery
    // In production: use search operators like:
    // - "sustainability" + "resources"
    // - "service business" + "tools"
    // - inurl:resources OR inurl:links

    const simulatedPages: ResourcePageDiscovery[] = [
      {
        pageUrl: 'https://sustainablebiz.com/resources/eco-friendly-services',
        pageDomain: 'sustainablebiz.com',
        pageTitle: 'Best Eco-Friendly Service Businesses',
        topic,
        resourceCount: 45,
        isActive: true,
        relevanceScore: 0,
      },
      {
        pageUrl: 'https://localserviceguide.org/helpful-tools',
        pageDomain: 'localserviceguide.org',
        pageTitle: 'Essential Tools for Local Service Providers',
        topic,
        resourceCount: 32,
        isActive: true,
        relevanceScore: 0,
      },
      {
        pageUrl: 'https://greenbusinessdirectory.com/sustainable-services',
        pageDomain: 'greenbusinessdirectory.com',
        pageTitle: 'Directory of Sustainable Local Services',
        topic,
        resourceCount: 78,
        isActive: true,
        relevanceScore: 0,
      },
    ];

    // Calculate relevance for each page
    for (const page of simulatedPages) {
      page.relevanceScore = await this.calculateRelevance(page);
    }

    return simulatedPages.filter(p => p.relevanceScore >= 60);
  }

  /**
   * Calculate relevance of resource page
   */
  private async calculateRelevance(page: ResourcePageDiscovery): Promise<number> {
    const prompt = `Evaluate this resource page for DryJets (dry cleaning/laundry marketplace).

Resource Page:
- Title: "${page.pageTitle}"
- URL: ${page.pageUrl}
- Topic: ${page.topic}
- Number of Resources Listed: ${page.resourceCount}

DryJets:
- On-demand dry cleaning/laundry marketplace
- Connects customers with local merchants and drivers
- Focus: sustainability, convenience, technology
- Target audience: eco-conscious consumers + local businesses

Evaluation Criteria:
1. Topical relevance (0-40 points) - Does DryJets fit this resource list?
2. Quality of page (0-30 points) - Is this a high-quality, curated list?
3. Likelihood of acceptance (0-20 points) - Would they add us?
4. Link value (0-10 points) - Editorial, dofollow, high authority?

Return ONLY JSON:
{
  "relevanceScore": <0-100>,
  "fitReason": "<why we fit or don't fit>",
  "pitchAngle": "<how to position DryJets for this list>",
  "acceptanceLikelihood": <0-100>
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.relevanceScore || 0;
      }
    } catch (error) {
      this.logger.error(`Error calculating relevance: ${error.message}`);
    }

    return 50;
  }

  /**
   * Generate resource page outreach email
   */
  async generateOutreachEmail(targetId: string): Promise<{
    subject: string;
    body: string;
  }> {
    const target = await this.prisma.resourcePageTarget.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new Error('Resource page target not found');
    }

    const prompt = `Generate a resource page outreach email.

Target Resource Page:
- Title: "${target.pageTitle}"
- URL: ${target.pageUrl}
- Topic: ${target.topic}

Our Resource:
- Name: DryJets
- URL: ${target.ourResourceUrl || 'https://dryjets.com'}
- Description: ${target.ourResourceDesc || 'On-demand eco-friendly dry cleaning and laundry marketplace'}

Email Requirements:
1. Subject: Helpful addition suggestion (50 chars max)
2. Compliment their resource page genuinely
3. Explain how DryJets would add value to their list
4. Emphasize unique value (sustainability + technology + convenience)
5. Provide specific details they can use (metrics, features)
6. Make it easy for them (provide description they can copy)
7. Keep it SHORT (150 words max)
8. Friendly, not salesy

CRITICAL: This should feel like you're suggesting a genuinely valuable addition, not begging for a link.

Return as JSON:
{
  "subject": "<email subject>",
  "body": "<email body>",
  "suggestedDescription": "<ready-to-use description for their list>"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          subject: parsed.subject,
          body: parsed.body,
        };
      }
    } catch (error) {
      this.logger.error(`Error generating email: ${error.message}`);
    }

    return {
      subject: `Suggestion for ${target.pageTitle}`,
      body: `Hi,\n\nI came across your resource page "${target.pageTitle}" and found it really helpful.\n\nI thought DryJets might be a good addition - it's an eco-friendly dry cleaning marketplace that helps people find sustainable local services.\n\nWould you be open to adding it?\n\nThanks!\nHusam`,
    };
  }

  /**
   * Find curator contact information
   */
  private async findCuratorEmail(domain: string): Promise<string | null> {
    // In production: use Hunter.io, Clearbit, or scrape contact page
    const commonEmails = [
      `editor@${domain}`,
      `content@${domain}`,
      `webmaster@${domain}`,
      `info@${domain}`,
    ];

    return commonEmails[0];
  }

  /**
   * Process resource page opportunities
   */
  async processOpportunities(topics: string[]): Promise<{
    discovered: number;
    stored: number;
    highPriority: number;
  }> {
    this.logger.log(`Processing resource page opportunities for ${topics.length} topics...`);

    let totalDiscovered = 0;
    let totalStored = 0;
    let highPriority = 0;

    for (const topic of topics) {
      try {
        const pages = await this.findResourcePages(topic);
        totalDiscovered += pages.length;

        for (const page of pages) {
          try {
            const curatorEmail = await this.findCuratorEmail(page.pageDomain);

            const created = await this.prisma.resourcePageTarget.create({
              data: {
                pageUrl: page.pageUrl,
                pageDomain: page.pageDomain,
                pageTitle: page.pageTitle,
                topic: page.topic,
                resourceCount: page.resourceCount,
                isActive: page.isActive,
                relevanceScore: page.relevanceScore,
                curatorEmail,
                domainAuthority: await this.estimateDomainAuthority(page.pageDomain),
                ourResourceUrl: 'https://dryjets.com',
                ourResourceTitle: 'DryJets - Sustainable Dry Cleaning Marketplace',
                ourResourceDesc: 'Eco-friendly on-demand dry cleaning and laundry marketplace connecting customers with local sustainable merchants.',
              },
            });

            totalStored++;

            if (page.relevanceScore >= 80) {
              highPriority++;
            }

            this.logger.log(`Stored resource page: ${page.pageTitle}`);
          } catch (error) {
            // Duplicate URL, skip
            continue;
          }
        }
      } catch (error) {
        this.logger.error(`Error processing topic ${topic}: ${error.message}`);
      }
    }

    return { discovered: totalDiscovered, stored: totalStored, highPriority };
  }

  /**
   * Estimate domain authority
   */
  private async estimateDomainAuthority(domain: string): Promise<number> {
    // In production: use Moz API, Ahrefs, etc.
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 40 + (hash % 50); // Random-ish between 40-90
  }

  /**
   * Send outreach emails
   */
  async sendOutreachEmails(limit: number = 15): Promise<{
    sent: number;
    failed: number;
  }> {
    this.logger.log(`Sending resource page outreach emails (limit: ${limit})...`);

    const targets = await this.prisma.resourcePageTarget.findMany({
      where: {
        status: { in: ['DISCOVERED', 'ANALYZED'] },
        curatorEmail: { not: null },
        contactedAt: null,
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { domainAuthority: 'desc' },
      ],
      take: limit,
    });

    let sent = 0;
    let failed = 0;

    for (const target of targets) {
      try {
        const email = await this.generateOutreachEmail(target.id);

        // In production: send actual email
        // await this.emailService.send({
        //   to: target.curatorEmail,
        //   subject: email.subject,
        //   body: email.body,
        // });

        await this.prisma.resourcePageTarget.update({
          where: { id: target.id },
          data: {
            status: 'CONTACTED',
            contactedAt: new Date(),
          },
        });

        sent++;
        this.logger.log(`Sent outreach to ${target.pageDomain}`);
      } catch (error) {
        this.logger.error(`Failed to send to ${target.pageDomain}: ${error.message}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Mark resource as added to page
   */
  async markAsAdded(targetId: string, position?: number): Promise<any> {
    return this.prisma.resourcePageTarget.update({
      where: { id: targetId },
      data: {
        status: 'ADDED',
        linkAdded: true,
        addedAt: new Date(),
        linkPosition: position,
      },
    });
  }

  /**
   * Send follow-ups
   */
  async sendFollowUps(maxFollowUps: number = 1): Promise<number> {
    const targets = await this.prisma.resourcePageTarget.findMany({
      where: {
        status: 'CONTACTED',
        followUpCount: { lt: maxFollowUps },
        contactedAt: {
          lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        },
      },
      take: 10,
    });

    let sent = 0;

    for (const target of targets) {
      try {
        // In production: send follow-up email
        // const followUp = await this.generateFollowUpEmail(target.id);
        // await this.emailService.send(followUp);

        await this.prisma.resourcePageTarget.update({
          where: { id: target.id },
          data: {
            status: 'WAITING',
            followUpCount: target.followUpCount + 1,
            lastFollowUp: new Date(),
          },
        });

        sent++;
      } catch (error) {
        this.logger.error(`Follow-up failed for ${target.id}: ${error.message}`);
      }
    }

    return sent;
  }

  /**
   * Get resource page outreach stats
   */
  async getStats(): Promise<{
    totalPages: number;
    contacted: number;
    linksAdded: number;
    avgDomainAuthority: number;
    successRate: number;
    pendingOutreach: number;
    highPriorityPages: number;
  }> {
    const total = await this.prisma.resourcePageTarget.count();
    const contacted = await this.prisma.resourcePageTarget.count({
      where: { status: { in: ['CONTACTED', 'WAITING', 'ADDED'] } },
    });
    const added = await this.prisma.resourcePageTarget.count({
      where: { linkAdded: true },
    });

    const avgDA = await this.prisma.resourcePageTarget.aggregate({
      _avg: { domainAuthority: true },
    });

    const pending = await this.prisma.resourcePageTarget.count({
      where: {
        status: { in: ['DISCOVERED', 'ANALYZED'] },
        curatorEmail: { not: null },
      },
    });

    const highPriority = await this.prisma.resourcePageTarget.count({
      where: {
        relevanceScore: { gte: 80 },
        status: { notIn: ['ADDED', 'REJECTED'] },
      },
    });

    return {
      totalPages: total,
      contacted,
      linksAdded: added,
      avgDomainAuthority: Number(avgDA._avg.domainAuthority) || 0,
      successRate: contacted > 0 ? (added / contacted) * 100 : 0,
      pendingOutreach: pending,
      highPriorityPages: highPriority,
    };
  }

  /**
   * Get top resource page opportunities
   */
  async getTopOpportunities(limit: number = 30): Promise<any[]> {
    return this.prisma.resourcePageTarget.findMany({
      where: {
        status: { notIn: ['ADDED', 'REJECTED'] },
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { domainAuthority: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Bulk import topics for prospecting
   */
  async importTopics(topics: string[]): Promise<{
    processed: number;
    opportunities: number;
  }> {
    const result = await this.processOpportunities(topics);

    this.logger.log(`Imported ${topics.length} topics, found ${result.discovered} resource pages`);

    return {
      processed: topics.length,
      opportunities: result.stored,
    };
  }

  /**
   * Get resource pages by topic
   */
  async getPagesByTopic(topic: string, limit: number = 50): Promise<any[]> {
    return this.prisma.resourcePageTarget.findMany({
      where: { topic },
      orderBy: { relevanceScore: 'desc' },
      take: limit,
    });
  }
}
