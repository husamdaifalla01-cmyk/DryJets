import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

export interface ContentGap {
  keyword: string;
  pillar: string[];
  relevanceScore: number;
  volume: number;
  competition: number;
  gap: 'SEVERE' | 'MODERATE' | 'MINOR';
  reason: string;
  suggestedContent: string[];
}

export interface CrossPlatformAnalysis {
  keyword: string;
  platforms: {
    platform: string;
    volume: number;
    growth: number;
    engagement: string;
  }[];
  dominantPlatform: string;
  platformStrategy: string;
  crossPlatformPotential: number; // 0-100
}

export interface SentimentAnalysis {
  keyword: string;
  overallSentiment: number; // -1 to 1
  sentimentLabel: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE';
  positiveSignals: string[];
  negativeSignals: string[];
  opportunities: string[];
  risks: string[];
}

export interface TrendCorrelation {
  primaryTrend: string;
  correlatedTrends: Array<{
    keyword: string;
    correlation: number; // 0-1
    relationship: string;
  }>;
  bundleOpportunity: boolean;
  suggestedBundles: string[];
}

export interface CompetitorAnalysis {
  keyword: string;
  adoptionRate: number; // % of competitors using this trend
  earlyAdopters: string[];
  laggards: string[];
  ourPosition: 'LEADER' | 'EARLY' | 'MAJORITY' | 'LAGGARD' | 'NONE';
  competitiveAdvantage: string;
}

@Injectable()
export class TrendAnalyzerService {
  private readonly logger = new Logger('TrendAnalyzer');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze content gaps
   */
  async analyzeContentGaps(): Promise<ContentGap[]> {
    this.logger.log('Analyzing content gaps...');

    // Get all high-relevance trends
    const trends = await this.prisma.trendData.findMany({
      where: {
        relevanceScore: { gte: 60 },
        expiresAt: { gte: new Date() },
      },
      orderBy: { relevanceScore: 'desc' },
    });

    // Get existing content (from ContentBank or other sources)
    // For now, we'll simulate this check
    const existingContent = await this.getExistingContent();

    const gaps: ContentGap[] = [];

    for (const trend of trends) {
      const hasContent = existingContent.some(c =>
        c.toLowerCase().includes(trend.keyword.toLowerCase()),
      );

      if (!hasContent) {
        const gap = await this.assessContentGap(trend);
        gaps.push(gap);
      }
    }

    this.logger.log(`Found ${gaps.length} content gaps`);
    return gaps.sort((a, b) => {
      const gapOrder = { SEVERE: 0, MODERATE: 1, MINOR: 2 };
      return gapOrder[a.gap] - gapOrder[b.gap];
    });
  }

  /**
   * Assess content gap severity
   */
  private async assessContentGap(trend: any): Promise<ContentGap> {
    const relevance = trend.relevanceScore;
    const volume = trend.volume;
    const competition = trend.competition;

    let gap: 'SEVERE' | 'MODERATE' | 'MINOR' = 'MINOR';
    let reason = '';

    if (relevance >= 80 && volume > 50000) {
      gap = 'SEVERE';
      reason = 'High relevance, high volume - critical gap';
    } else if (relevance >= 70 && volume > 20000) {
      gap = 'MODERATE';
      reason = 'Good relevance and volume - important gap';
    } else {
      gap = 'MINOR';
      reason = 'Lower priority opportunity';
    }

    // Get AI suggestions for content
    const suggestedContent = await this.getSuggestedContent(trend);

    return {
      keyword: trend.keyword,
      pillar: trend.pillar,
      relevanceScore: relevance,
      volume,
      competition,
      gap,
      reason,
      suggestedContent,
    };
  }

  /**
   * Get AI-suggested content ideas
   */
  private async getSuggestedContent(trend: any): Promise<string[]> {
    const prompt = `For a dry cleaning/laundry marketplace (DryJets), suggest 3 specific content pieces related to this trend:

Trend: "${trend.keyword}"
Content Pillars: ${trend.pillar.join(', ')}
Relevance Score: ${trend.relevanceScore}/100

Consider:
- How this trend relates to laundry/dry cleaning services
- Educational or entertaining angles
- SEO and social media potential

Return ONLY a JSON array of 3 content titles:
["Title 1", "Title 2", "Title 3"]`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error getting content suggestions: ${error.message}`);
    }

    return [
      `How ${trend.keyword} Impacts Your Laundry Routine`,
      `The Ultimate Guide to ${trend.keyword} and Dry Cleaning`,
      `DryJets' Take on ${trend.keyword}`,
    ];
  }

  /**
   * Analyze cross-platform performance
   */
  async analyzeCrossPlatform(keyword: string): Promise<CrossPlatformAnalysis> {
    this.logger.log(`Analyzing cross-platform performance for "${keyword}"...`);

    const trends = await this.prisma.trendData.findMany({
      where: {
        keyword: { contains: keyword, mode: 'insensitive' },
        expiresAt: { gte: new Date() },
      },
    });

    if (trends.length === 0) {
      throw new Error(`No trend data found for keyword: ${keyword}`);
    }

    const platforms = trends.map(t => ({
      platform: t.source,
      volume: t.volume,
      growth: parseFloat(t.growth.toString()),
      engagement: this.getEngagementLevel(t.volume, parseFloat(t.growth.toString())),
    }));

    // Find dominant platform
    const dominantPlatform = platforms.reduce((max, p) => (p.volume > max.volume ? p : max)).platform;

    // Calculate cross-platform potential
    const crossPlatformPotential = this.calculateCrossPlatformPotential(platforms);

    // Get platform strategy
    const platformStrategy = await this.getPlatformStrategy(keyword, platforms);

    return {
      keyword,
      platforms,
      dominantPlatform,
      platformStrategy,
      crossPlatformPotential,
    };
  }

  /**
   * Get engagement level
   */
  private getEngagementLevel(volume: number, growth: number): string {
    if (volume > 100000 && growth > 50) return 'VIRAL';
    if (volume > 50000 && growth > 20) return 'HIGH';
    if (volume > 10000 && growth > 0) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Calculate cross-platform potential
   */
  private calculateCrossPlatformPotential(platforms: any[]): number {
    if (platforms.length <= 1) return 20;

    const avgVolume = platforms.reduce((sum, p) => sum + p.volume, 0) / platforms.length;
    const volumeVariance = platforms.reduce((sum, p) => sum + Math.pow(p.volume - avgVolume, 2), 0) / platforms.length;
    const volumeStdDev = Math.sqrt(volumeVariance);

    // Lower variance = more consistent across platforms = higher potential
    const consistency = Math.max(0, 100 - (volumeStdDev / avgVolume) * 100);

    // More platforms = higher potential
    const platformDiversity = Math.min(100, (platforms.length / 4) * 100);

    return Math.round((consistency * 0.6 + platformDiversity * 0.4));
  }

  /**
   * Get AI platform strategy
   */
  private async getPlatformStrategy(keyword: string, platforms: any[]): Promise<string> {
    const prompt = `Recommend a cross-platform strategy for this trend:

Keyword: "${keyword}"
Platform Performance:
${platforms.map(p => `- ${p.platform}: ${p.volume} volume, ${p.growth}% growth, ${p.engagement} engagement`).join('\n')}

Provide a 1-2 sentence strategy focusing on which platforms to prioritize and why.

Return ONLY the strategy text (no JSON, no formatting).`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    } catch (error) {
      this.logger.error(`Error getting platform strategy: ${error.message}`);
      return `Focus on ${platforms[0].platform} with ${platforms[0].engagement} engagement, then expand to other platforms.`;
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(keyword: string): Promise<SentimentAnalysis> {
    this.logger.log(`Analyzing sentiment for "${keyword}"...`);

    const trends = await this.prisma.trendData.findMany({
      where: {
        keyword: { contains: keyword, mode: 'insensitive' },
        expiresAt: { gte: new Date() },
      },
    });

    if (trends.length === 0) {
      throw new Error(`No trend data found for keyword: ${keyword}`);
    }

    // Get AI sentiment analysis
    const analysis = await this.getAISentimentAnalysis(keyword, trends);

    return analysis;
  }

  /**
   * Get AI sentiment analysis
   */
  private async getAISentimentAnalysis(keyword: string, trends: any[]): Promise<SentimentAnalysis> {
    const prompt = `Analyze the sentiment around this trending topic for a dry cleaning/laundry business:

Keyword: "${keyword}"
Sources: ${trends.map(t => t.source).join(', ')}
Growth: ${trends.map(t => parseFloat(t.growth.toString())).join('%, ')}%
Volume: ${trends.map(t => t.volume).join(', ')}

Provide sentiment analysis in JSON format:
{
  "overallSentiment": <number from -1 to 1, where -1 is very negative and 1 is very positive>,
  "positiveSignals": ["signal 1", "signal 2"],
  "negativeSignals": ["signal 1", "signal 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "risks": ["risk 1", "risk 2"]
}

Return ONLY the JSON object.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const sentiment = Math.max(-1, Math.min(1, result.overallSentiment));

        let sentimentLabel: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE';
        if (sentiment <= -0.6) sentimentLabel = 'VERY_NEGATIVE';
        else if (sentiment <= -0.2) sentimentLabel = 'NEGATIVE';
        else if (sentiment <= 0.2) sentimentLabel = 'NEUTRAL';
        else if (sentiment <= 0.6) sentimentLabel = 'POSITIVE';
        else sentimentLabel = 'VERY_POSITIVE';

        return {
          keyword,
          overallSentiment: sentiment,
          sentimentLabel,
          positiveSignals: result.positiveSignals || [],
          negativeSignals: result.negativeSignals || [],
          opportunities: result.opportunities || [],
          risks: result.risks || [],
        };
      }
    } catch (error) {
      this.logger.error(`Error analyzing sentiment: ${error.message}`);
    }

    // Fallback
    return {
      keyword,
      overallSentiment: 0.5,
      sentimentLabel: 'POSITIVE',
      positiveSignals: ['Growing interest', 'Multiple platforms'],
      negativeSignals: [],
      opportunities: ['Create educational content', 'Engage with audience'],
      risks: ['High competition'],
    };
  }

  /**
   * Find trend correlations
   */
  async findTrendCorrelations(keyword: string): Promise<TrendCorrelation> {
    this.logger.log(`Finding correlations for "${keyword}"...`);

    const primaryTrend = await this.prisma.trendData.findFirst({
      where: {
        keyword: { contains: keyword, mode: 'insensitive' },
        expiresAt: { gte: new Date() },
      },
      orderBy: { relevanceScore: 'desc' },
    });

    if (!primaryTrend) {
      throw new Error(`No trend found for keyword: ${keyword}`);
    }

    // Find related trends based on pillars and keywords
    const relatedTrends = await this.prisma.trendData.findMany({
      where: {
        id: { not: primaryTrend.id },
        pillar: { hasSome: primaryTrend.pillar as string[] },
        expiresAt: { gte: new Date() },
        relevanceScore: { gte: 50 },
      },
      take: 10,
    });

    // Calculate correlations
    const correlatedTrends = relatedTrends.map(t => ({
      keyword: t.keyword,
      correlation: this.calculateCorrelation(primaryTrend, t),
      relationship: this.describeRelationship(primaryTrend, t),
    })).sort((a, b) => b.correlation - a.correlation).slice(0, 5);

    // Determine if bundle opportunity exists
    const bundleOpportunity = correlatedTrends.some(t => t.correlation > 0.7);

    // Get AI suggestions for content bundles
    const suggestedBundles = bundleOpportunity ? await this.getSuggestedBundles(
      keyword,
      correlatedTrends.map(t => t.keyword),
    ) : [];

    return {
      primaryTrend: keyword,
      correlatedTrends,
      bundleOpportunity,
      suggestedBundles,
    };
  }

  /**
   * Calculate correlation between trends
   */
  private calculateCorrelation(trend1: any, trend2: any): number {
    let correlation = 0;

    // Pillar overlap
    const pillars1 = new Set(trend1.pillar);
    const pillars2 = new Set(trend2.pillar);
    const pillarOverlap = [...pillars1].filter(p => pillars2.has(p)).length;
    correlation += (pillarOverlap / Math.max(pillars1.size, pillars2.size)) * 0.4;

    // Similar growth patterns
    const growth1 = parseFloat(trend1.growth.toString());
    const growth2 = parseFloat(trend2.growth.toString());
    const growthSimilarity = 1 - Math.abs(growth1 - growth2) / 200;
    correlation += Math.max(0, growthSimilarity) * 0.3;

    // Related keywords
    const keywords1 = new Set(trend1.relatedKeywords || []);
    const keywords2 = new Set(trend2.relatedKeywords || []);
    const keywordOverlap = [...keywords1].filter(k => keywords2.has(k)).length;
    if (keywords1.size > 0 && keywords2.size > 0) {
      correlation += (keywordOverlap / Math.max(keywords1.size, keywords2.size)) * 0.3;
    }

    return parseFloat(Math.min(1, correlation).toFixed(2));
  }

  /**
   * Describe relationship between trends
   */
  private describeRelationship(trend1: any, trend2: any): string {
    const pillars1 = new Set(trend1.pillar);
    const pillars2 = new Set(trend2.pillar);
    const commonPillars = [...pillars1].filter(p => pillars2.has(p));

    if (commonPillars.length > 0) {
      return `Both trends in ${commonPillars[0]} category`;
    }

    return 'Related through audience overlap';
  }

  /**
   * Get AI-suggested content bundles
   */
  private async getSuggestedBundles(primaryKeyword: string, relatedKeywords: string[]): Promise<string[]> {
    const prompt = `Suggest 3 content bundle ideas that combine these correlated trends for a dry cleaning/laundry business:

Primary Trend: "${primaryKeyword}"
Related Trends: ${relatedKeywords.join(', ')}

Return ONLY a JSON array of 3 content bundle titles:
["Bundle Title 1", "Bundle Title 2", "Bundle Title 3"]`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error getting bundle suggestions: ${error.message}`);
    }

    return [
      `${primaryKeyword} + ${relatedKeywords[0]}: A Complete Guide`,
      `How ${primaryKeyword} and ${relatedKeywords[0]} Work Together`,
      `The ${primaryKeyword} Strategy Bundle`,
    ];
  }

  /**
   * Analyze competitor trend adoption
   */
  async analyzeCompetitorAdoption(keyword: string): Promise<CompetitorAnalysis> {
    this.logger.log(`Analyzing competitor adoption for "${keyword}"...`);

    // In production, this would analyze competitor content, social media, etc.
    // For now, we'll simulate this analysis

    const trend = await this.prisma.trendData.findFirst({
      where: {
        keyword: { contains: keyword, mode: 'insensitive' },
        expiresAt: { gte: new Date() },
      },
    });

    if (!trend) {
      throw new Error(`No trend found for keyword: ${keyword}`);
    }

    // Simulate competitor adoption rate based on competition score
    const adoptionRate = Math.min(100, trend.competition + Math.random() * 20);

    const ourPosition = adoptionRate < 20 ? 'LEADER' :
                        adoptionRate < 40 ? 'EARLY' :
                        adoptionRate < 70 ? 'MAJORITY' :
                        adoptionRate < 90 ? 'LAGGARD' : 'NONE';

    const competitiveAdvantage = this.getCompetitiveAdvantage(ourPosition, adoptionRate);

    return {
      keyword,
      adoptionRate: Math.round(adoptionRate),
      earlyAdopters: this.getSimulatedCompetitors('early', 3),
      laggards: this.getSimulatedCompetitors('laggard', 3),
      ourPosition,
      competitiveAdvantage,
    };
  }

  /**
   * Get competitive advantage description
   */
  private getCompetitiveAdvantage(position: string, adoptionRate: number): string {
    if (position === 'LEADER') {
      return 'First-mover advantage: establish authority before competition intensifies';
    } else if (position === 'EARLY') {
      return 'Early advantage: join leaders before market saturation';
    } else if (position === 'MAJORITY') {
      return 'Proven trend: safe bet but requires unique angle to stand out';
    } else if (position === 'LAGGARD') {
      return 'Late entry: high competition, need strong differentiation';
    } else {
      return 'Market saturated: reconsider entry or find completely unique angle';
    }
  }

  /**
   * Get simulated competitor names
   */
  private getSimulatedCompetitors(type: string, count: number): string[] {
    const competitors = [
      'CleanCloud',
      'LaundryLux',
      'FreshPress',
      'SparkleSpot',
      'PureGarment',
      'EcoWash',
      'QuickDry',
      'PressPerfect',
    ];

    return competitors.slice(0, count);
  }

  /**
   * Get existing content (placeholder)
   */
  private async getExistingContent(): Promise<string[]> {
    // In production, query ContentBank or CMS
    // For now, return empty array to show all trends as gaps
    return [];
  }

  /**
   * Get comprehensive trend analysis
   */
  async getComprehensiveAnalysis(keyword: string): Promise<{
    crossPlatform: CrossPlatformAnalysis;
    sentiment: SentimentAnalysis;
    correlations: TrendCorrelation;
    competitorAdoption: CompetitorAnalysis;
  }> {
    this.logger.log(`Generating comprehensive analysis for "${keyword}"...`);

    const [crossPlatform, sentiment, correlations, competitorAdoption] = await Promise.all([
      this.analyzeCrossPlatform(keyword),
      this.analyzeSentiment(keyword),
      this.findTrendCorrelations(keyword),
      this.analyzeCompetitorAdoption(keyword),
    ]);

    return {
      crossPlatform,
      sentiment,
      correlations,
      competitorAdoption,
    };
  }
}
