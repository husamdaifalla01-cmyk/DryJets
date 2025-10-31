import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface BrokenLinkDiscovery {
  targetDomain: string;
  targetUrl: string;
  targetPageTitle: string;
  brokenUrl: string;
  brokenText: string;
  brokenContext: string;
  relevanceScore: number;
}

@Injectable()
export class BrokenLinkService {
  private readonly logger = new Logger('BrokenLinkBuilding');
  private readonly anthropic: Anthropic;

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Find broken links on a target domain
   * In production: integrate with tools like Ahrefs, SEMrush, or custom crawler
   */
  async findBrokenLinks(targetDomain: string): Promise<BrokenLinkDiscovery[]> {
    this.logger.log(`Scanning ${targetDomain} for broken links...`);

    // Simulated broken link discovery
    // In production: use Ahrefs API, SEMrush API, or custom crawler
    const simulatedBrokenLinks: BrokenLinkDiscovery[] = [
      {
        targetDomain,
        targetUrl: `https://${targetDomain}/resources/business-tips`,
        targetPageTitle: 'Top Business Tips for 2024',
        brokenUrl: 'https://oldsite.com/sustainability-guide',
        brokenText: 'sustainability practices guide',
        brokenContext: 'For more information on sustainable business practices, check out this comprehensive sustainability practices guide.',
        relevanceScore: 0,
      },
      {
        targetDomain,
        targetUrl: `https://${targetDomain}/blog/automation-trends`,
        targetPageTitle: 'Automation Trends in Service Industries',
        brokenUrl: 'https://defunct.com/service-automation',
        brokenText: 'service automation report',
        brokenContext: 'According to the latest service automation report, 78% of service businesses are adopting some form of automation.',
        relevanceScore: 0,
      },
    ];

    // Calculate relevance for each opportunity
    for (const link of simulatedBrokenLinks) {
      link.relevanceScore = await this.calculateRelevance(link);
    }

    return simulatedBrokenLinks.filter(l => l.relevanceScore >= 50);
  }

  /**
   * Calculate relevance of broken link opportunity
   */
  private async calculateRelevance(opportunity: BrokenLinkDiscovery): Promise<number> {
    const prompt = `Analyze this broken link replacement opportunity for DryJets (dry cleaning/laundry marketplace).

Target Page: "${opportunity.targetPageTitle}"
Target URL: ${opportunity.targetUrl}
Broken Link Text: "${opportunity.brokenText}"
Context: "${opportunity.brokenContext}"

DryJets Content Assets:
- Blog posts about sustainability in service industries
- Automation case studies in service businesses
- Marketplace platform best practices
- Customer experience optimization guides
- Technology in traditional services

Questions:
1. How relevant is this page to our business? (0-100)
2. Could we create/do we have content that would legitimately replace the broken link?
3. Is the link context high quality (editorial link, not sidebar/footer)?

Return ONLY JSON:
{
  "relevanceScore": <0-100>,
  "reason": "<brief explanation>",
  "contentWeNeed": "<what content would fit here>",
  "replacementQuality": <0-100>
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

    return 0;
  }

  /**
   * Generate outreach email for broken link replacement
   */
  async generateOutreachEmail(opportunityId: string): Promise<{
    subject: string;
    body: string;
  }> {
    const opportunity = await this.prisma.brokenLinkOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    const prompt = `Generate a personalized outreach email for broken link building.

Context:
- Target Site: ${opportunity.targetDomain}
- Target Page: "${opportunity.targetPageTitle}"
- Broken Link: ${opportunity.brokenUrl}
- Link Context: "${opportunity.brokenContext}"
- Our Replacement URL: ${opportunity.ourContentUrl || 'https://dryjets.com/blog/relevant-article'}

Email Requirements:
1. Subject line: Helpful, not salesy (50 chars max)
2. Personalized opening (mention their site specifically)
3. Point out the broken link (be helpful, not critical)
4. Offer our resource as replacement (emphasize value to their readers)
5. Keep it SHORT (150 words max)
6. Professional but friendly tone
7. Include specific page URL where broken link is located

CRITICAL: This should feel like you're genuinely helping them, not asking for a favor.

Return as JSON:
{
  "subject": "<email subject>",
  "body": "<email body>"
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
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error generating email: ${error.message}`);
    }

    // Fallback email
    return {
      subject: `Broken link on ${opportunity.targetDomain}`,
      body: `Hi,\n\nI was reading "${opportunity.targetPageTitle}" on your site and noticed a broken link to ${opportunity.brokenUrl}.\n\nI have a resource that might work as a replacement: ${opportunity.ourContentUrl}\n\nThought you might find it helpful!\n\nBest regards,\nHusam Ahmed\nDryJets`,
    };
  }

  /**
   * Find contact email for website
   */
  async findContactEmail(domain: string): Promise<string | null> {
    // In production: use Hunter.io API, Clearbit, or scrape the contact page
    // For now, return common patterns
    const commonEmails = [
      `contact@${domain}`,
      `info@${domain}`,
      `hello@${domain}`,
      `support@${domain}`,
    ];

    return commonEmails[0];
  }

  /**
   * Process discovered broken link opportunities
   */
  async processOpportunities(targetDomains: string[]): Promise<{
    discovered: number;
    stored: number;
    highPriority: number;
  }> {
    this.logger.log(`Processing broken link opportunities for ${targetDomains.length} domains...`);

    let totalDiscovered = 0;
    let totalStored = 0;
    let highPriority = 0;

    for (const domain of targetDomains) {
      try {
        const opportunities = await this.findBrokenLinks(domain);
        totalDiscovered += opportunities.length;

        for (const opp of opportunities) {
          try {
            const contactEmail = await this.findContactEmail(opp.targetDomain);

            const created = await this.prisma.brokenLinkOpportunity.create({
              data: {
                targetDomain: opp.targetDomain,
                targetUrl: opp.targetUrl,
                targetPageTitle: opp.targetPageTitle,
                brokenUrl: opp.brokenUrl,
                brokenText: opp.brokenText,
                brokenContext: opp.brokenContext,
                relevanceScore: opp.relevanceScore,
                contactEmail,
                domainAuthority: await this.estimateDomainAuthority(opp.targetDomain),
              },
            });

            totalStored++;

            if (opp.relevanceScore >= 80) {
              highPriority++;
            }

            this.logger.log(`Stored opportunity: ${opp.targetUrl}`);
          } catch (error) {
            // Duplicate or error, skip
            continue;
          }
        }
      } catch (error) {
        this.logger.error(`Error processing ${domain}: ${error.message}`);
      }
    }

    return { discovered: totalDiscovered, stored: totalStored, highPriority };
  }

  /**
   * Estimate domain authority
   */
  private async estimateDomainAuthority(domain: string): Promise<number> {
    // In production: use Moz API or Ahrefs
    // For now, return simulated value
    const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 40 + (hash % 40); // Random-ish between 40-80
  }

  /**
   * Send outreach emails (batch)
   */
  async sendOutreachEmails(limit: number = 20): Promise<{
    sent: number;
    failed: number;
  }> {
    this.logger.log(`Sending outreach emails for up to ${limit} opportunities...`);

    const opportunities = await this.prisma.brokenLinkOpportunity.findMany({
      where: {
        status: 'VERIFIED',
        contactEmail: { not: null },
        emailSentAt: null,
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { domainAuthority: 'desc' },
      ],
      take: limit,
    });

    let sent = 0;
    let failed = 0;

    for (const opp of opportunities) {
      try {
        const email = await this.generateOutreachEmail(opp.id);

        // In production: actually send email via SendGrid, AWS SES, etc.
        // await this.emailService.send({
        //   to: opp.contactEmail,
        //   subject: email.subject,
        //   body: email.body,
        // });

        await this.prisma.brokenLinkOpportunity.update({
          where: { id: opp.id },
          data: {
            status: 'CONTACTED',
            emailSentAt: new Date(),
          },
        });

        sent++;
        this.logger.log(`Sent outreach to ${opp.targetDomain}`);
      } catch (error) {
        this.logger.error(`Failed to send to ${opp.targetDomain}: ${error.message}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Track link acquisition success
   */
  async markLinkAcquired(opportunityId: string): Promise<any> {
    return this.prisma.brokenLinkOpportunity.update({
      where: { id: opportunityId },
      data: {
        status: 'LINK_REPLACED',
        linkAcquired: true,
        acquiredAt: new Date(),
      },
    });
  }

  /**
   * Send follow-up emails
   */
  async sendFollowUps(maxFollowUps: number = 2): Promise<number> {
    const opportunities = await this.prisma.brokenLinkOpportunity.findMany({
      where: {
        status: 'CONTACTED',
        followUpCount: { lt: maxFollowUps },
        emailSentAt: {
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      },
      take: 20,
    });

    let sent = 0;

    for (const opp of opportunities) {
      try {
        // In production: send follow-up email
        // const followUpEmail = await this.generateFollowUpEmail(opp.id);
        // await this.emailService.send(followUpEmail);

        await this.prisma.brokenLinkOpportunity.update({
          where: { id: opp.id },
          data: {
            followUpCount: opp.followUpCount + 1,
            lastFollowUp: new Date(),
          },
        });

        sent++;
      } catch (error) {
        this.logger.error(`Follow-up failed for ${opp.id}: ${error.message}`);
      }
    }

    return sent;
  }

  /**
   * Get broken link building stats
   */
  async getStats(): Promise<{
    totalOpportunities: number;
    contacted: number;
    linksAcquired: number;
    avgDomainAuthority: number;
    successRate: number;
    pendingOutreach: number;
    highPriorityOpps: number;
  }> {
    const total = await this.prisma.brokenLinkOpportunity.count();
    const contacted = await this.prisma.brokenLinkOpportunity.count({
      where: { status: { in: ['CONTACTED', 'WAITING_RESPONSE', 'LINK_REPLACED'] } },
    });
    const acquired = await this.prisma.brokenLinkOpportunity.count({
      where: { linkAcquired: true },
    });

    const avgDA = await this.prisma.brokenLinkOpportunity.aggregate({
      _avg: { domainAuthority: true },
    });

    const pending = await this.prisma.brokenLinkOpportunity.count({
      where: {
        status: { in: ['DISCOVERED', 'VERIFIED'] },
        contactEmail: { not: null },
      },
    });

    const highPriority = await this.prisma.brokenLinkOpportunity.count({
      where: {
        relevanceScore: { gte: 80 },
        status: { notIn: ['LINK_REPLACED', 'REJECTED'] },
      },
    });

    return {
      totalOpportunities: total,
      contacted,
      linksAcquired: acquired,
      avgDomainAuthority: Number(avgDA._avg.domainAuthority) || 0,
      successRate: contacted > 0 ? (acquired / contacted) * 100 : 0,
      pendingOutreach: pending,
      highPriorityOpps: highPriority,
    };
  }

  /**
   * Get top opportunities (highest value targets)
   */
  async getTopOpportunities(limit: number = 50): Promise<any[]> {
    return this.prisma.brokenLinkOpportunity.findMany({
      where: {
        status: { notIn: ['LINK_REPLACED', 'REJECTED'] },
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { domainAuthority: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Bulk import target domains for prospecting
   */
  async importTargetDomains(domains: string[]): Promise<{
    processed: number;
    opportunities: number;
  }> {
    const result = await this.processOpportunities(domains);

    this.logger.log(`Imported ${domains.length} domains, found ${result.discovered} opportunities`);

    return {
      processed: domains.length,
      opportunities: result.stored,
    };
  }
}
