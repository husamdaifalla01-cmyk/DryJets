import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

interface HAROOpportunity {
  queryId: string;
  source: string;
  journalist: string;
  outlet: string;
  subject: string;
  query: string;
  category: string;
  deadline: Date;
  relevanceScore: number;
}

@Injectable()
export class HAROAutomationService {
  private readonly logger = new Logger('HAROAutomation');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Fetch new HARO queries
   * In production: integrate with HARO API or email scraping
   */
  async fetchNewQueries(): Promise<HAROOpportunity[]> {
    this.logger.log('Fetching new HARO queries...');

    // Simulated HARO queries for demonstration
    // In production, this would scrape HARO emails or use their API
    const simulatedQueries: HAROOpportunity[] = [
      {
        queryId: 'haro-' + Date.now() + '-1',
        source: 'haro',
        journalist: 'Sarah Johnson',
        outlet: 'Forbes',
        subject: 'Expert advice on sustainable business practices',
        query: 'I\'m looking for experts who can share insights on how businesses can reduce their environmental footprint while maintaining profitability. Specifically interested in service-based businesses.',
        category: 'Business',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        relevanceScore: 0,
      },
      {
        queryId: 'haro-' + Date.now() + '-2',
        source: 'haro',
        journalist: 'Michael Chen',
        outlet: 'Entrepreneur',
        subject: 'Automation in small businesses',
        query: 'Seeking small business owners who have successfully automated parts of their operations. How did automation impact your bottom line?',
        category: 'Technology',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        relevanceScore: 0,
      },
    ];

    // Calculate relevance for each query
    for (const query of simulatedQueries) {
      query.relevanceScore = await this.calculateRelevance(query);
    }

    return simulatedQueries.filter(q => q.relevanceScore >= 50); // Only return relevant queries
  }

  /**
   * Calculate relevance score using AI
   */
  private async calculateRelevance(opportunity: HAROOpportunity): Promise<number> {
    const prompt = `Analyze this journalist query for relevance to DryJets, a dry cleaning and laundry marketplace platform.

Query: "${opportunity.query}"
Category: ${opportunity.category}
Outlet: ${opportunity.outlet}

Company Context:
- DryJets is a three-sided marketplace for dry cleaning/laundry
- We connect customers, merchants, and drivers
- We focus on sustainability, technology, and service excellence
- Target audience: consumers and small businesses

Rate the relevance on a scale of 0-100:
- 90-100: Highly relevant, perfect fit
- 70-89: Very relevant, strong fit
- 50-69: Moderately relevant, could work
- 30-49: Somewhat relevant, stretch
- 0-29: Not relevant

Return ONLY a JSON object:
{
  "relevanceScore": <number>,
  "reason": "<brief explanation>",
  "angleToTake": "<how we could respond if relevant>"
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
   * Generate expert response to HARO query
   */
  async generateResponse(queryId: string): Promise<{
    response: string;
    qualityScore: number;
  }> {
    const query = await this.prisma.hAROQuery.findUnique({
      where: { id: queryId },
    });

    if (!query) {
      throw new Error('HARO query not found');
    }

    const prompt = `You are a PR expert crafting a response to a journalist's query.

Journalist Query: "${query.query}"
Journalist: ${query.journalist}
Outlet: ${query.outlet}
Category: ${query.category}

Your Company: DryJets
- Three-sided marketplace for dry cleaning/laundry
- Connects customers, merchants, and drivers
- Focus on sustainability, technology, and service excellence
- Founded by Husam Ahmed (use this as expert name)

CRITICAL REQUIREMENTS:
1. Answer DIRECTLY and CONCISELY (150-250 words max)
2. Provide SPECIFIC examples or data points
3. Use EXPERTISE tone (authoritative but friendly)
4. Include a QUOTABLE soundbite
5. Subtly mention DryJets only if naturally relevant
6. DO NOT be salesy - provide genuine value

Structure:
- Lead with the most valuable insight
- Support with specific example or stat
- Include memorable quote
- Optional brief company mention if relevant

Return as JSON:
{
  "response": "<complete response text>",
  "qualityScore": <0-100 self-assessment>,
  "soundbite": "<most quotable sentence>"
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
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response,
          qualityScore: parsed.qualityScore || 85,
        };
      }
    } catch (error) {
      this.logger.error(`Error generating response: ${error.message}`);
    }

    throw new Error('Failed to generate response');
  }

  /**
   * Auto-respond to high-relevance queries
   */
  async autoRespondToQueries(minRelevance: number = 70): Promise<{
    responded: number;
    skipped: number;
  }> {
    this.logger.log(`Auto-responding to queries with relevance >= ${minRelevance}...`);

    const queries = await this.prisma.hAROQuery.findMany({
      where: {
        status: 'NEW',
        relevanceScore: { gte: minRelevance },
        deadline: { gte: new Date() },
      },
      orderBy: { relevanceScore: 'desc' },
      take: 20,
    });

    let responded = 0;
    let skipped = 0;

    for (const query of queries) {
      try {
        const { response, qualityScore } = await this.generateResponse(query.id);

        // Only auto-respond if quality is high enough
        if (qualityScore >= 75) {
          await this.prisma.hAROQuery.update({
            where: { id: query.id },
            data: {
              status: 'RESPONDED',
              ourResponse: response,
              respondedAt: new Date(),
              autoResponded: true,
            },
          });

          this.logger.log(`Auto-responded to: ${query.subject} (${query.outlet})`);
          responded++;

          // In production: actually send the email here
          // await this.sendHAROEmail(query, response);
        } else {
          skipped++;
          this.logger.log(`Skipped low quality response for: ${query.subject}`);
        }
      } catch (error) {
        this.logger.error(`Error auto-responding to ${query.id}: ${error.message}`);
        skipped++;
      }
    }

    return { responded, skipped };
  }

  /**
   * Process new HARO opportunities
   */
  async processNewOpportunities(): Promise<{
    discovered: number;
    stored: number;
    autoResponded: number;
  }> {
    this.logger.log('Processing new HARO opportunities...');

    const opportunities = await this.fetchNewQueries();
    let stored = 0;

    for (const opp of opportunities) {
      try {
        await this.prisma.hAROQuery.create({
          data: {
            source: opp.source,
            queryId: opp.queryId,
            journalist: opp.journalist,
            outlet: opp.outlet,
            domain: this.extractDomain(opp.outlet),
            subject: opp.subject,
            query: opp.query,
            category: opp.category,
            deadline: opp.deadline,
            relevanceScore: opp.relevanceScore,
            domainAuthority: await this.estimateDomainAuthority(opp.outlet),
          },
        });
        stored++;
      } catch (error) {
        // Duplicate query, skip
        continue;
      }
    }

    // Auto-respond to high-relevance queries
    const { responded } = await this.autoRespondToQueries(80);

    this.logger.log(`Processed ${opportunities.length} opportunities, stored ${stored}, auto-responded to ${responded}`);

    return {
      discovered: opportunities.length,
      stored,
      autoResponded: responded,
    };
  }

  /**
   * Extract domain from outlet name
   */
  private extractDomain(outlet: string): string {
    const domainMap: Record<string, string> = {
      'Forbes': 'forbes.com',
      'Entrepreneur': 'entrepreneur.com',
      'TechCrunch': 'techcrunch.com',
      'Inc': 'inc.com',
      'Fast Company': 'fastcompany.com',
      'Business Insider': 'businessinsider.com',
      'The Wall Street Journal': 'wsj.com',
      'New York Times': 'nytimes.com',
    };

    return domainMap[outlet] || outlet.toLowerCase().replace(/\s+/g, '') + '.com';
  }

  /**
   * Estimate domain authority
   */
  private async estimateDomainAuthority(outlet: string): Promise<number> {
    // In production: use Moz API, Ahrefs API, or similar
    const authorityMap: Record<string, number> = {
      'Forbes': 95,
      'Entrepreneur': 92,
      'TechCrunch': 93,
      'Inc': 90,
      'Fast Company': 89,
      'Business Insider': 91,
      'The Wall Street Journal': 97,
      'New York Times': 98,
    };

    return authorityMap[outlet] || 70;
  }

  /**
   * Get HARO performance stats
   */
  async getPerformanceStats(): Promise<{
    totalQueries: number;
    responded: number;
    published: number;
    backlinksAcquired: number;
    avgDomainAuthority: number;
    responseRate: number;
    publishRate: number;
    topOutlets: Array<{ outlet: string; count: number }>;
  }> {
    const totalQueries = await this.prisma.hAROQuery.count();
    const responded = await this.prisma.hAROQuery.count({
      where: { status: { in: ['RESPONDED', 'ACCEPTED', 'PUBLISHED'] } },
    });
    const published = await this.prisma.hAROQuery.count({
      where: { published: true },
    });
    const backlinksAcquired = await this.prisma.hAROQuery.count({
      where: { backlink: true },
    });

    const avgDA = await this.prisma.hAROQuery.aggregate({
      _avg: { domainAuthority: true },
    });

    const outletCounts = await this.prisma.hAROQuery.groupBy({
      by: ['outlet'],
      _count: { outlet: true },
      orderBy: { _count: { outlet: 'desc' } },
      take: 10,
    });

    return {
      totalQueries,
      responded,
      published,
      backlinksAcquired,
      avgDomainAuthority: Number(avgDA._avg.domainAuthority) || 0,
      responseRate: totalQueries > 0 ? (responded / totalQueries) * 100 : 0,
      publishRate: responded > 0 ? (published / responded) * 100 : 0,
      topOutlets: outletCounts.map(o => ({ outlet: o.outlet, count: o._count.outlet })),
    };
  }

  /**
   * Get pending responses (queries we should respond to manually)
   */
  async getPendingResponses(limit: number = 50): Promise<any[]> {
    return this.prisma.hAROQuery.findMany({
      where: {
        status: 'NEW',
        deadline: { gte: new Date() },
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { domainAuthority: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Mark query as published with backlink
   */
  async markAsPublished(queryId: string, publishedUrl: string, hasBacklink: boolean = true): Promise<any> {
    return this.prisma.hAROQuery.update({
      where: { id: queryId },
      data: {
        status: 'PUBLISHED',
        published: true,
        publishedUrl,
        backlink: hasBacklink,
      },
    });
  }

  /**
   * Get high-value opportunities (high DA + high relevance)
   */
  async getHighValueOpportunities(minDA: number = 80, minRelevance: number = 70): Promise<any[]> {
    return this.prisma.hAROQuery.findMany({
      where: {
        status: 'NEW',
        domainAuthority: { gte: minDA },
        relevanceScore: { gte: minRelevance },
        deadline: { gte: new Date() },
      },
      orderBy: [
        { domainAuthority: 'desc' },
        { relevanceScore: 'desc' },
      ],
    });
  }
}
