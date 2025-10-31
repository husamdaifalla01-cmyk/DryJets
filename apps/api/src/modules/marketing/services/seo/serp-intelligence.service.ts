import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

export interface SerpAnalysis {
  keyword: string;
  currentRank: number;
  previousRank: number;
  rankChange: number;
  featuredSnippet: boolean;
  topCompetitors: Array<{
    domain: string;
    position: number;
    hasSnippet: boolean;
  }>;
}

@Injectable()
export class SerpIntelligenceService {
  private readonly logger = new Logger('SerpIntelligence');

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  /**
   * Track keyword rankings
   */
  async trackKeywordRanking(keywordId: string): Promise<void> {
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
    });

    if (!keyword) return;

    // In production, use SERP API (SerpApi, DataForSEO, etc.)
    // For now, simulate ranking
    const simulatedRank = Math.floor(Math.random() * 100) + 1;

    // Save SERP result
    await this.prisma.serpResult.create({
      data: {
        keywordId: keyword.id,
        position: simulatedRank,
        url: 'https://example.com/page',
        title: `Example Page for ${keyword.keyword}`,
        domain: 'example.com',
        hasSnippet: Math.random() > 0.9,
        hasVideo: Math.random() > 0.8,
        hasImage: Math.random() > 0.7,
      },
    });

    await this.prisma.keyword.update({
      where: { id: keywordId },
      data: {
        previousRank: keyword.currentRank,
        currentRank: simulatedRank,
        bestRank: Math.min(keyword.bestRank || 100, simulatedRank),
        lastChecked: new Date(),
      },
    });

    this.logger.log(`Tracked ranking for "${keyword.keyword}": #${simulatedRank}`);
  }

  /**
   * Track all keywords (daily job)
   */
  async trackAllKeywords(limit: number = 1000): Promise<void> {
    const keywords = await this.prisma.keyword.findMany({
      take: limit,
      orderBy: { searchVolume: 'desc' },
    });

    for (const keyword of keywords) {
      await this.trackKeywordRanking(keyword.id);
    }

    this.logger.log(`Tracked ${keywords.length} keywords`);
  }

  /**
   * Get ranking improvements
   */
  async getRankingImprovements(limit: number = 50): Promise<any[]> {
    const keywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { not: null } },
          { previousRank: { not: null } },
        ],
      },
    });

    return keywords
      .filter(kw => kw.currentRank < kw.previousRank)
      .map(kw => ({
        keyword: kw.keyword,
        currentRank: kw.currentRank,
        previousRank: kw.previousRank,
        improvement: kw.previousRank - kw.currentRank,
      }))
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, limit);
  }

  /**
   * Get ranking losses
   */
  async getRankingLosses(limit: number = 50): Promise<any[]> {
    const keywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { not: null } },
          { previousRank: { not: null } },
        ],
      },
    });

    return keywords
      .filter(kw => kw.currentRank > kw.previousRank)
      .map(kw => ({
        keyword: kw.keyword,
        currentRank: kw.currentRank,
        previousRank: kw.previousRank,
        decline: kw.currentRank - kw.previousRank,
      }))
      .sort((a, b) => b.decline - a.decline)
      .slice(0, limit);
  }

  /**
   * Analyze SERP for keyword
   */
  async analyzeSERP(keywordId: string): Promise<SerpAnalysis> {
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      include: {
        serpResults: {
          take: 10,
          orderBy: { checkedAt: 'desc' },
        },
      },
    });

    if (!keyword) {
      throw new Error('Keyword not found');
    }

    const latestResults = keyword.serpResults.slice(0, 10);

    const topCompetitors = latestResults
      .filter(result => result.domain !== 'example.com')
      .slice(0, 5)
      .map(result => ({
        domain: result.domain,
        position: result.position,
        hasSnippet: result.hasSnippet,
      }));

    return {
      keyword: keyword.keyword,
      currentRank: keyword.currentRank || 0,
      previousRank: keyword.previousRank || 0,
      rankChange: (keyword.previousRank || 0) - (keyword.currentRank || 0),
      featuredSnippet: keyword.featuredSnippet,
      topCompetitors,
    };
  }

  /**
   * Identify featured snippet opportunities
   */
  async identifySnippetOpportunities(limit: number = 50): Promise<any[]> {
    // Find keywords ranking 1-10 but not holding featured snippet
    const keywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { lte: 10 } },
          { featuredSnippet: false },
        ],
      },
      orderBy: { searchVolume: 'desc' },
      take: limit,
    });

    // Check if there's a featured snippet for these keywords
    const opportunities = [];

    for (const keyword of keywords) {
      const serpResults = await this.prisma.serpResult.findMany({
        where: {
          keywordId: keyword.id,
          hasSnippet: true,
        },
        take: 1,
        orderBy: { checkedAt: 'desc' },
      });

      if (serpResults.length > 0) {
        opportunities.push({
          keyword: keyword.keyword,
          currentRank: keyword.currentRank,
          snippetHolder: serpResults[0].domain,
          snippetHolderPosition: serpResults[0].position,
          searchVolume: keyword.searchVolume,
          opportunity: 'high', // If ranking 1-3, high opportunity
        });
      }
    }

    return opportunities;
  }

  /**
   * Get SERP volatility (how much rankings are changing)
   */
  async getSerpVolatility(): Promise<{
    volatilityScore: number;
    affectedKeywords: number;
    possibleAlgorithmUpdate: boolean;
  }> {
    // Check how many keywords have changed rank in last check
    const allKeywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { not: null } },
          { previousRank: { not: null } },
        ],
      },
    });

    let changedKeywords = 0;
    let totalChange = 0;

    allKeywords.forEach(kw => {
      const change = Math.abs((kw.currentRank || 0) - (kw.previousRank || 0));
      if (change > 0) {
        changedKeywords++;
        totalChange += change;
      }
    });

    const volatilityScore = allKeywords.length > 0 ? (totalChange / allKeywords.length) : 0;
    const possibleAlgorithmUpdate = volatilityScore > 5; // If avg change > 5 positions

    return {
      volatilityScore,
      affectedKeywords: changedKeywords,
      possibleAlgorithmUpdate,
    };
  }

  /**
   * Get competitor analysis
   */
  async getCompetitorAnalysis(domain: string): Promise<{
    domain: string;
    keywordsRanking: number;
    avgPosition: number;
    featuredSnippets: number;
    topKeywords: Array<{
      keyword: string;
      position: number;
      searchVolume: number;
    }>;
  }> {
    const serpResults = await this.prisma.serpResult.findMany({
      where: {
        domain,
      },
      include: {
        keyword: true,
      },
    });

    const positions = serpResults.map(r => r.position);
    const avgPosition = positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : 0;

    const featuredSnippets = serpResults.filter(r => r.hasSnippet).length;

    const topKeywords = serpResults
      .sort((a, b) => (a.keyword.searchVolume > b.keyword.searchVolume ? -1 : 1))
      .slice(0, 10)
      .map(r => ({
        keyword: r.keyword.keyword,
        position: r.position,
        searchVolume: r.keyword.searchVolume,
      }));

    return {
      domain,
      keywordsRanking: serpResults.length,
      avgPosition,
      featuredSnippets,
      topKeywords,
    };
  }

  /**
   * Find keyword gaps (keywords competitors rank for but we don't)
   */
  async findKeywordGaps(competitorDomain: string, ourDomain: string): Promise<any[]> {
    // Get competitor's keywords
    const competitorResults = await this.prisma.serpResult.findMany({
      where: {
        domain: competitorDomain,
        position: { lte: 20 }, // Top 20 only
      },
      include: {
        keyword: true,
      },
    });

    // Check which keywords we're not ranking for
    const gaps = [];

    for (const result of competitorResults) {
      const ourRank = await this.prisma.serpResult.findFirst({
        where: {
          keywordId: result.keywordId,
          domain: ourDomain,
        },
      });

      if (!ourRank || ourRank.position > 50) {
        gaps.push({
          keyword: result.keyword.keyword,
          competitorPosition: result.position,
          ourPosition: ourRank?.position || null,
          searchVolume: result.keyword.searchVolume,
          difficulty: result.keyword.difficulty,
        });
      }
    }

    // Sort by search volume
    return gaps.sort((a, b) => b.searchVolume - a.searchVolume).slice(0, 100);
  }

  /**
   * Get daily ranking summary
   */
  async getDailyRankingSummary(): Promise<{
    date: string;
    keywordsTracked: number;
    improvements: number;
    declines: number;
    stable: number;
    avgRank: number;
    topWinners: Array<{ keyword: string; improvement: number }>;
    topLosers: Array<{ keyword: string; decline: number }>;
  }> {
    const keywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { not: null } },
          { previousRank: { not: null } },
        ],
      },
    });

    let improvements = 0;
    let declines = 0;
    let stable = 0;
    let totalRank = 0;

    const winners = [];
    const losers = [];

    keywords.forEach(kw => {
      const change = (kw.previousRank || 0) - (kw.currentRank || 0);

      if (change > 0) {
        improvements++;
        winners.push({ keyword: kw.keyword, improvement: change });
      } else if (change < 0) {
        declines++;
        losers.push({ keyword: kw.keyword, decline: Math.abs(change) });
      } else {
        stable++;
      }

      totalRank += kw.currentRank || 0;
    });

    return {
      date: new Date().toISOString().split('T')[0],
      keywordsTracked: keywords.length,
      improvements,
      declines,
      stable,
      avgRank: keywords.length > 0 ? totalRank / keywords.length : 0,
      topWinners: winners.sort((a, b) => b.improvement - a.improvement).slice(0, 10),
      topLosers: losers.sort((a, b) => b.decline - a.decline).slice(0, 10),
    };
  }
}
