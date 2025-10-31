import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

export interface CampaignMemory {
  id: string;
  campaignName: string;
  objective: string;
  execution: any;
  results: CampaignResults;
  learnings: string[];
  patterns: string[];
  recommendations: string[];
  confidence: number;
}

export interface CampaignResults {
  reach: number;
  engagement: number;
  conversions: number;
  revenue: number;
  roi: number;
}

@Injectable()
export class CampaignMemoryService {
  private readonly logger = new Logger('CampaignMemory');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Store campaign memory
   */
  async storeCampaignMemory(memory: Omit<CampaignMemory, 'id'>): Promise<CampaignMemory> {
    this.logger.log(`Storing memory for campaign: ${memory.campaignName}`);

    // Separate learnings into what worked and what didn't
    const whatWorked: string[] = [];
    const whatDidnt: string[] = [];

    for (const learning of memory.learnings) {
      if (learning.toLowerCase().includes('success') ||
          learning.toLowerCase().includes('worked') ||
          learning.toLowerCase().includes('increased') ||
          learning.toLowerCase().includes('improved')) {
        whatWorked.push(learning);
      } else if (learning.toLowerCase().includes('failed') ||
                 learning.toLowerCase().includes('didn\'t') ||
                 learning.toLowerCase().includes('decreased') ||
                 learning.toLowerCase().includes('poor')) {
        whatDidnt.push(learning);
      } else {
        whatWorked.push(learning); // Default to positive learnings
      }
    }

    // Get AI insights for the campaign
    const aiInsights = await this.generateAIInsights(memory);

    // Store in database
    const stored = await this.prisma.campaignMemory.create({
      data: {
        campaignName: memory.campaignName,
        objective: memory.objective,
        campaignType: this.determineCampaignType(memory.objective),
        execution: memory.execution,
        reach: memory.results.reach,
        engagement: memory.results.engagement,
        conversions: memory.results.conversions,
        revenue: memory.results.revenue,
        spend: memory.execution.budget || 0,
        roi: memory.results.roi,
        whatWorked,
        whatDidnt,
        patterns: memory.patterns,
        recommendations: memory.recommendations,
        confidence: memory.confidence,
        aiInsights,
      },
    });

    this.logger.log(`Stored campaign memory: ${stored.id}`);

    return {
      id: stored.id,
      campaignName: stored.campaignName,
      objective: stored.objective,
      execution: stored.execution,
      results: {
        reach: stored.reach,
        engagement: stored.engagement,
        conversions: stored.conversions,
        revenue: parseFloat(stored.revenue.toString()),
        roi: stored.roi ? parseFloat(stored.roi.toString()) : 0,
      },
      learnings: [...whatWorked, ...whatDidnt],
      patterns: stored.patterns,
      recommendations: stored.recommendations,
      confidence: stored.confidence,
    };
  }

  /**
   * Determine campaign type from objective
   */
  private determineCampaignType(objective: string): string {
    const objLower = objective.toLowerCase();
    if (objLower.includes('awareness') || objLower.includes('brand')) return 'awareness';
    if (objLower.includes('conversion') || objLower.includes('sales')) return 'conversion';
    if (objLower.includes('engagement') || objLower.includes('community')) return 'engagement';
    if (objLower.includes('retention') || objLower.includes('loyalty')) return 'retention';
    return 'other';
  }

  /**
   * Generate AI insights for campaign
   */
  private async generateAIInsights(memory: Omit<CampaignMemory, 'id'>): Promise<string> {
    const prompt = `Analyze this marketing campaign and provide 2-3 key insights:

Campaign: ${memory.campaignName}
Objective: ${memory.objective}
Results:
- Reach: ${memory.results.reach.toLocaleString()}
- Engagement: ${memory.results.engagement.toLocaleString()}
- Conversions: ${memory.results.conversions}
- Revenue: $${memory.results.revenue.toLocaleString()}
- ROI: ${memory.results.roi.toFixed(1)}%

Learnings: ${memory.learnings.join(', ')}
Patterns: ${memory.patterns.join(', ')}

Provide 2-3 sentence insight focusing on what made this campaign successful or what could be improved.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      return responseText.trim();
    } catch (error) {
      this.logger.error(`Error generating AI insights: ${error.message}`);
      return `Campaign achieved ${memory.results.roi.toFixed(1)}% ROI with ${memory.results.conversions} conversions.`;
    }
  }

  /**
   * Retrieve patterns from past campaigns
   */
  async getPatterns(objective: string): Promise<string[]> {
    this.logger.log(`Retrieving patterns for objective: ${objective}`);

    const campaignType = this.determineCampaignType(objective);

    // Get historical campaigns with similar objectives
    const historicalCampaigns = await this.prisma.campaignMemory.findMany({
      where: {
        OR: [
          { objective: { contains: objective, mode: 'insensitive' } },
          { campaignType },
        ],
        confidence: { gte: 60 }, // Only high-confidence learnings
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Last 20 similar campaigns
    });

    if (historicalCampaigns.length === 0) {
      this.logger.warn(`No historical campaigns found for objective: ${objective}`);
      return [];
    }

    // Aggregate patterns from all campaigns
    const allPatterns: string[] = [];
    const patternFrequency = new Map<string, number>();

    for (const campaign of historicalCampaigns) {
      for (const pattern of campaign.patterns) {
        allPatterns.push(pattern);
        patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
      }
    }

    // Sort patterns by frequency (most common patterns first)
    const sortedPatterns = Array.from(patternFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pattern]) => pattern)
      .slice(0, 10); // Top 10 patterns

    this.logger.log(`Found ${sortedPatterns.length} patterns for ${objective}`);
    return sortedPatterns;
  }

  /**
   * Get recommendations based on similar past campaigns
   */
  async getRecommendations(campaignType: string): Promise<string[]> {
    this.logger.log(`Getting recommendations for campaign type: ${campaignType}`);

    // Get top-performing campaigns of this type
    const topCampaigns = await this.prisma.campaignMemory.findMany({
      where: {
        campaignType,
        roi: { gte: 100 }, // ROI >= 100%
      },
      orderBy: { roi: 'desc' },
      take: 10,
    });

    if (topCampaigns.length === 0) {
      this.logger.warn(`No successful campaigns found for type: ${campaignType}`);
      return [
        'No historical data available for this campaign type',
        'Run small tests to gather initial learnings',
        'Focus on measuring key metrics for future optimization',
      ];
    }

    // Aggregate recommendations from top campaigns
    const allRecommendations: string[] = [];
    const recommendationFrequency = new Map<string, number>();

    for (const campaign of topCampaigns) {
      for (const rec of campaign.recommendations) {
        allRecommendations.push(rec);
        recommendationFrequency.set(rec, (recommendationFrequency.get(rec) || 0) + 1);
      }
    }

    // Calculate average ROI of top campaigns
    const avgROI = topCampaigns.reduce((sum, c) => sum + (c.roi ? parseFloat(c.roi.toString()) : 0), 0) / topCampaigns.length;

    // Sort recommendations by frequency
    const sortedRecs = Array.from(recommendationFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([rec]) => rec)
      .slice(0, 5);

    // Add context-specific recommendation
    sortedRecs.unshift(`Top ${campaignType} campaigns averaged ${avgROI.toFixed(1)}% ROI - here's what worked:`);

    this.logger.log(`Generated ${sortedRecs.length} recommendations for ${campaignType}`);
    return sortedRecs;
  }

  /**
   * Analyze campaign performance and extract learnings
   */
  async analyzeCampaign(campaignId: string): Promise<{
    success_factors: string[];
    failure_points: string[];
    actionable_insights: string[];
  }> {
    this.logger.log(`Analyzing campaign: ${campaignId}`);

    const campaign = await this.prisma.campaignMemory.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Use AI to analyze the campaign
    const analysis = await this.generateAIAnalysis(campaign);

    return analysis;
  }

  /**
   * Generate AI-powered campaign analysis
   */
  private async generateAIAnalysis(campaign: any): Promise<{
    success_factors: string[];
    failure_points: string[];
    actionable_insights: string[];
  }> {
    const roi = campaign.roi ? parseFloat(campaign.roi.toString()) : 0;
    const isSuccessful = roi >= 100;

    const prompt = `Analyze this marketing campaign and extract key learnings:

Campaign: ${campaign.campaignName}
Type: ${campaign.campaignType}
Objective: ${campaign.objective}

Performance:
- Reach: ${campaign.reach.toLocaleString()}
- Engagement: ${campaign.engagement.toLocaleString()}
- Conversions: ${campaign.conversions}
- Revenue: $${parseFloat(campaign.revenue.toString()).toLocaleString()}
- Spend: $${parseFloat(campaign.spend.toString()).toLocaleString()}
- ROI: ${roi.toFixed(1)}%

What Worked: ${campaign.whatWorked.join(', ')}
What Didn't: ${campaign.whatDidnt.join(', ')}
Patterns: ${campaign.patterns.join(', ')}

Based on this data, provide:
1. Success factors (3-5 things that contributed to success${!isSuccessful ? ' or could have improved results' : ''})
2. Failure points (2-3 areas that underperformed${!isSuccessful ? ' or caused poor results' : ''})
3. Actionable insights (3-5 specific recommendations for future campaigns)

Return as JSON:
{
  "success_factors": ["...", "..."],
  "failure_points": ["...", "..."],
  "actionable_insights": ["...", "..."]
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }
    } catch (error) {
      this.logger.error(`Error generating AI analysis: ${error.message}`);
    }

    // Fallback analysis
    return {
      success_factors: campaign.whatWorked.slice(0, 5),
      failure_points: campaign.whatDidnt.slice(0, 3),
      actionable_insights: campaign.recommendations.slice(0, 5),
    };
  }

  /**
   * Get top performing campaigns for benchmarking
   */
  async getTopCampaigns(limit: number = 10): Promise<CampaignMemory[]> {
    this.logger.log(`Retrieving top ${limit} campaigns...`);

    const campaigns = await this.prisma.campaignMemory.findMany({
      where: {
        roi: { gte: 100 }, // Only profitable campaigns
      },
      orderBy: { roi: 'desc' },
      take: limit,
    });

    return campaigns.map(c => ({
      id: c.id,
      campaignName: c.campaignName,
      objective: c.objective,
      execution: c.execution,
      results: {
        reach: c.reach,
        engagement: c.engagement,
        conversions: c.conversions,
        revenue: parseFloat(c.revenue.toString()),
        roi: c.roi ? parseFloat(c.roi.toString()) : 0,
      },
      learnings: [...c.whatWorked, ...c.whatDidnt],
      patterns: c.patterns,
      recommendations: c.recommendations,
      confidence: c.confidence,
    }));
  }

  /**
   * Compare campaign performance against historical average
   */
  async benchmarkCampaign(campaignId: string): Promise<{
    campaign: CampaignMemory;
    benchmark: {
      avgROI: number;
      avgReach: number;
      avgEngagement: number;
      avgConversions: number;
    };
    performance: 'above_average' | 'average' | 'below_average';
    percentile: number;
  }> {
    this.logger.log(`Benchmarking campaign: ${campaignId}`);

    const campaign = await this.prisma.campaignMemory.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Get all campaigns of the same type
    const similarCampaigns = await this.prisma.campaignMemory.findMany({
      where: {
        campaignType: campaign.campaignType,
      },
    });

    if (similarCampaigns.length === 0) {
      throw new Error(`No benchmark data available for ${campaign.campaignType} campaigns`);
    }

    // Calculate benchmarks
    const avgROI = similarCampaigns.reduce((sum, c) => sum + (c.roi ? parseFloat(c.roi.toString()) : 0), 0) / similarCampaigns.length;
    const avgReach = similarCampaigns.reduce((sum, c) => sum + c.reach, 0) / similarCampaigns.length;
    const avgEngagement = similarCampaigns.reduce((sum, c) => sum + c.engagement, 0) / similarCampaigns.length;
    const avgConversions = similarCampaigns.reduce((sum, c) => sum + c.conversions, 0) / similarCampaigns.length;

    // Calculate percentile
    const campaignROI = campaign.roi ? parseFloat(campaign.roi.toString()) : 0;
    const betterThan = similarCampaigns.filter(c => (c.roi ? parseFloat(c.roi.toString()) : 0) < campaignROI).length;
    const percentile = Math.round((betterThan / similarCampaigns.length) * 100);

    // Determine performance
    let performance: 'above_average' | 'average' | 'below_average';
    if (percentile >= 70) performance = 'above_average';
    else if (percentile >= 30) performance = 'average';
    else performance = 'below_average';

    return {
      campaign: {
        id: campaign.id,
        campaignName: campaign.campaignName,
        objective: campaign.objective,
        execution: campaign.execution,
        results: {
          reach: campaign.reach,
          engagement: campaign.engagement,
          conversions: campaign.conversions,
          revenue: parseFloat(campaign.revenue.toString()),
          roi: campaignROI,
        },
        learnings: [...campaign.whatWorked, ...campaign.whatDidnt],
        patterns: campaign.patterns,
        recommendations: campaign.recommendations,
        confidence: campaign.confidence,
      },
      benchmark: {
        avgROI: parseFloat(avgROI.toFixed(2)),
        avgReach: Math.round(avgReach),
        avgEngagement: Math.round(avgEngagement),
        avgConversions: Math.round(avgConversions),
      },
      performance,
      percentile,
    };
  }
}
