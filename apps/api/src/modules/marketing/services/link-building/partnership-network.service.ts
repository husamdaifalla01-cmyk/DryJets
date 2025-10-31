import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

interface PartnerProspect {
  domain: string;
  name: string;
  email?: string;
  domainAuthority?: number;
  fitScore: number;
  partnershipType: string;
}

@Injectable()
export class PartnershipNetworkService {
  private readonly logger = new Logger('PartnershipNetwork');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Identify potential partners in related industries
   */
  async identifyPartners(industry: string = 'service-business'): Promise<PartnerProspect[]> {
    this.logger.log(`Identifying partnership opportunities in: ${industry}`);

    // Simulated partner discovery
    // In production: use LinkedIn Sales Navigator, industry databases, competitor analysis
    const prospects: PartnerProspect[] = [
      {
        domain: 'sustainablebusiness.com',
        name: 'Sustainable Business Magazine',
        email: 'partnerships@sustainablebusiness.com',
        domainAuthority: 72,
        fitScore: 0,
        partnershipType: 'content_exchange',
      },
      {
        domain: 'localservicehub.com',
        name: 'Local Service Hub',
        email: 'hello@localservicehub.com',
        domainAuthority: 65,
        fitScore: 0,
        partnershipType: 'resource_share',
      },
      {
        domain: 'greentechreview.com',
        name: 'Green Tech Review',
        email: 'editor@greentechreview.com',
        domainAuthority: 68,
        fitScore: 0,
        partnershipType: 'guest_post',
      },
    ];

    // Calculate fit score for each prospect
    for (const prospect of prospects) {
      prospect.fitScore = await this.calculatePartnerFit(prospect);
    }

    return prospects.filter(p => p.fitScore >= 60);
  }

  /**
   * Calculate partnership fit score
   */
  private async calculatePartnerFit(prospect: PartnerProspect): Promise<number> {
    const prompt = `Evaluate this potential partnership for DryJets (dry cleaning/laundry marketplace).

Prospect:
- Domain: ${prospect.domain}
- Name: ${prospect.name}
- Domain Authority: ${prospect.domainAuthority}
- Partnership Type: ${prospect.partnershipType}

DryJets Profile:
- B2C/B2B marketplace for dry cleaning/laundry
- Focus: sustainability, technology, local services
- Target audience: consumers + small businesses
- Content pillars: sustainability, automation, service excellence, local business

Partnership Fit Criteria:
1. Audience overlap (0-40 points)
2. Content relevance (0-30 points)
3. Brand alignment (0-20 points)
4. Mutual value potential (0-10 points)

Return ONLY JSON:
{
  "fitScore": <0-100>,
  "audienceOverlap": "<description>",
  "valueProposition": "<what we offer them>",
  "whatWeGet": "<what they offer us>",
  "recommendedApproach": "<content_exchange|guest_post|co_marketing>"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.fitScore || 0;
      }
    } catch (error) {
      this.logger.error(`Error calculating fit: ${error.message}`);
    }

    return 50; // Default moderate fit
  }

  /**
   * Generate partnership proposal
   */
  async generateProposal(prospectId: string): Promise<{
    subject: string;
    proposal: string;
    valueExchange: string;
  }> {
    const prospect = await this.prisma.partnershipProposal.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const prompt = `Create a compelling partnership proposal email.

Recipient: ${prospect.partnerName}
Domain: ${prospect.partnerDomain}
Partnership Type: ${prospect.partnershipType}

Our Company: DryJets
- Dry cleaning/laundry marketplace
- 500K+ monthly visitors (projected)
- Audience: eco-conscious consumers + local businesses
- Strong content on: sustainability, service tech, local business

Partnership Types:
- content_exchange: We publish their content, they publish ours (mutual guest posts)
- guest_post: One-time or recurring guest post exchange
- resource_share: Link to each other's resources
- co_marketing: Joint webinar, report, or campaign

Email Requirements:
1. Subject: Intriguing, partnership-focused (50 chars max)
2. Personalized opening (mention their content/brand)
3. Clearly articulate mutual value
4. Specific partnership proposal
5. Make it collaborative, not transactional
6. Include specific numbers/audience data
7. Call to action (schedule call)
8. Keep under 200 words

Return as JSON:
{
  "subject": "<email subject>",
  "proposal": "<email body>",
  "valueExchange": "<summary of what each party gets>"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error generating proposal: ${error.message}`);
    }

    return {
      subject: `Partnership opportunity: ${prospect.partnerName} x DryJets`,
      proposal: `Hi,\n\nI've been following ${prospect.partnerName} and love your content.\n\nI think there's a great opportunity for us to collaborate.\n\nWould you be open to exploring a ${prospect.partnershipType.replace('_', ' ')} partnership?\n\nBest,\nHusam`,
      valueExchange: 'Mutual content exchange and audience growth',
    };
  }

  /**
   * Create partnership proposals from prospects
   */
  async createProposals(prospects: PartnerProspect[]): Promise<number> {
    let created = 0;

    for (const prospect of prospects) {
      try {
        await this.prisma.partnershipProposal.create({
          data: {
            partnerDomain: prospect.domain,
            partnerName: prospect.name,
            partnerEmail: prospect.email,
            domainAuthority: prospect.domainAuthority,
            partnershipType: prospect.partnershipType,
            ourProposal: '', // Will be generated later
          },
        });
        created++;
      } catch (error) {
        // Duplicate, skip
        continue;
      }
    }

    return created;
  }

  /**
   * Send partnership proposals
   */
  async sendProposals(limit: number = 10): Promise<{
    sent: number;
    failed: number;
  }> {
    const proposals = await this.prisma.partnershipProposal.findMany({
      where: {
        status: 'PROSPECTING',
        partnerEmail: { not: null },
        contactedAt: null,
      },
      orderBy: { domainAuthority: 'desc' },
      take: limit,
    });

    let sent = 0;
    let failed = 0;

    for (const proposal of proposals) {
      try {
        const email = await this.generateProposal(proposal.id);

        // In production: send actual email
        // await this.emailService.send({
        //   to: proposal.partnerEmail,
        //   subject: email.subject,
        //   body: email.proposal,
        // });

        await this.prisma.partnershipProposal.update({
          where: { id: proposal.id },
          data: {
            status: 'CONTACTED',
            ourProposal: email.proposal,
            valueExchange: email.valueExchange,
            contactedAt: new Date(),
          },
        });

        sent++;
        this.logger.log(`Sent proposal to ${proposal.partnerName}`);
      } catch (error) {
        this.logger.error(`Failed to send to ${proposal.partnerName}: ${error.message}`);
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Activate partnership (terms agreed)
   */
  async activatePartnership(
    proposalId: string,
    terms: {
      agreedTerms: string;
      startDate: Date;
      endDate?: Date;
    },
  ): Promise<any> {
    return this.prisma.partnershipProposal.update({
      where: { id: proposalId },
      data: {
        status: 'ACTIVE',
        agreedTerms: terms.agreedTerms,
        startDate: terms.startDate,
        endDate: terms.endDate,
        responseReceived: true,
        responseAt: new Date(),
      },
    });
  }

  /**
   * Track partnership performance
   */
  async trackPerformance(
    proposalId: string,
    metrics: {
      contentShared?: number;
      backlinksReceived?: number;
      backlinksGiven?: number;
      trafficReceived?: number;
    },
  ): Promise<any> {
    const current = await this.prisma.partnershipProposal.findUnique({
      where: { id: proposalId },
    });

    if (!current) {
      throw new Error('Partnership not found');
    }

    return this.prisma.partnershipProposal.update({
      where: { id: proposalId },
      data: {
        contentShared: (current.contentShared || 0) + (metrics.contentShared || 0),
        backlinksReceived: (current.backlinksReceived || 0) + (metrics.backlinksReceived || 0),
        backlinksGiven: (current.backlinksGiven || 0) + (metrics.backlinksGiven || 0),
        trafficReceived: (current.trafficReceived || 0) + (metrics.trafficReceived || 0),
      },
    });
  }

  /**
   * Get active partnerships
   */
  async getActivePartnerships(): Promise<any[]> {
    return this.prisma.partnershipProposal.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { backlinksReceived: 'desc' },
    });
  }

  /**
   * Get partnership stats
   */
  async getStats(): Promise<{
    totalProspects: number;
    contacted: number;
    active: number;
    totalBacklinksReceived: number;
    totalBacklinksGiven: number;
    totalTrafficReceived: number;
    avgDomainAuthority: number;
    conversionRate: number;
  }> {
    const total = await this.prisma.partnershipProposal.count();
    const contacted = await this.prisma.partnershipProposal.count({
      where: { status: { in: ['CONTACTED', 'NEGOTIATING', 'ACTIVE'] } },
    });
    const active = await this.prisma.partnershipProposal.count({
      where: { status: 'ACTIVE' },
    });

    const aggregates = await this.prisma.partnershipProposal.aggregate({
      _sum: {
        backlinksReceived: true,
        backlinksGiven: true,
        trafficReceived: true,
      },
      _avg: {
        domainAuthority: true,
      },
    });

    return {
      totalProspects: total,
      contacted,
      active,
      totalBacklinksReceived: aggregates._sum.backlinksReceived || 0,
      totalBacklinksGiven: aggregates._sum.backlinksGiven || 0,
      totalTrafficReceived: aggregates._sum.trafficReceived || 0,
      avgDomainAuthority: Number(aggregates._avg.domainAuthority) || 0,
      conversionRate: contacted > 0 ? (active / contacted) * 100 : 0,
    };
  }

  /**
   * Suggest content exchange topics
   */
  async suggestExchangeTopics(partnerDomain: string): Promise<{
    ourTopics: string[];
    theirTopics: string[];
    mutualBenefit: string;
  }> {
    const prompt = `Suggest content exchange topics for a partnership.

Partner Domain: ${partnerDomain}
Our Company: DryJets (dry cleaning/laundry marketplace)

Our Content Pillars:
- Sustainability in service industries
- Technology & automation for local businesses
- Customer experience optimization
- Eco-friendly business practices

Task: Suggest 3 article topics we could write for their audience, and 3 topics they could write for ours.

Return as JSON:
{
  "ourTopics": ["Topic 1 for their site", "Topic 2", "Topic 3"],
  "theirTopics": ["Topic 1 for our site", "Topic 2", "Topic 3"],
  "mutualBenefit": "<how both audiences benefit>"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error suggesting topics: ${error.message}`);
    }

    return {
      ourTopics: [
        'How Technology is Transforming Local Services',
        'Sustainable Practices for Service-Based Businesses',
        'Building Trust in the On-Demand Economy',
      ],
      theirTopics: [
        'The Future of Local Commerce',
        'Consumer Trends in Service Industries',
        'Eco-Conscious Business Models',
      ],
      mutualBenefit: 'Both audiences learn about innovation in local services and sustainability',
    };
  }

  /**
   * Bulk import partner prospects
   */
  async importProspects(
    prospects: Array<{
      domain: string;
      name: string;
      email?: string;
      partnershipType: string;
    }>,
  ): Promise<number> {
    let imported = 0;

    for (const prospect of prospects) {
      try {
        await this.prisma.partnershipProposal.create({
          data: {
            partnerDomain: prospect.domain,
            partnerName: prospect.name,
            partnerEmail: prospect.email,
            partnershipType: prospect.partnershipType,
            ourProposal: '', // To be generated
          },
        });
        imported++;
      } catch (error) {
        continue;
      }
    }

    this.logger.log(`Imported ${imported} partnership prospects`);
    return imported;
  }

  /**
   * Get high-priority partnership opportunities
   */
  async getTopOpportunities(limit: number = 20): Promise<any[]> {
    return this.prisma.partnershipProposal.findMany({
      where: {
        status: { in: ['PROSPECTING', 'CONTACTED'] },
        domainAuthority: { gte: 60 },
      },
      orderBy: { domainAuthority: 'desc' },
      take: limit,
    });
  }
}
