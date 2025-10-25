import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

@Injectable()
export class PlatformIntelligence {
  private readonly logger = new Logger('PlatformIntelligence');
  private readonly anthropic: Anthropic;

  private readonly platformPerfData = {
    twitter: { avgEngagement: 0.045, bestContentTypes: ['threads', 'news'] },
    linkedin: {
      avgEngagement: 0.032,
      bestContentTypes: ['articles', 'insights'],
    },
    facebook: { avgEngagement: 0.028, bestContentTypes: ['images', 'video'] },
    instagram: { avgEngagement: 0.067, bestContentTypes: ['images', 'reels'] },
    tiktok: { avgEngagement: 0.089, bestContentTypes: ['videos', 'trends'] },
    youtube: { avgEngagement: 0.042, bestContentTypes: ['video', 'shorts'] },
    reddit: { avgEngagement: 0.051, bestContentTypes: ['discussions'] },
    threads: { avgEngagement: 0.053, bestContentTypes: ['threads'] },
    bluesky: { avgEngagement: 0.038, bestContentTypes: ['posts'] },
  };

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze content and recommend best platforms
   */
  async analyzeAndRecommend(input: {
    contentTopic: string;
    contentType: string;
    targetAudience: string;
    goals: string[];
  }): Promise<
    Array<{
      platform: string;
      confidence: number;
      reason: string;
      expectedEngagement: number;
      roiScore: number;
    }>
  > {
    this.logger.log(`Analyzing content for platform recommendations`);

    const prompt = `
Analyze the following content and recommend the best platforms for maximum reach and engagement.

Content Topic: ${input.contentTopic}
Content Type: ${input.contentType}
Target Audience: ${input.targetAudience}
Goals: ${input.goals.join(', ')}

Available Platforms:
- Twitter (avg engagement: 4.5%)
- LinkedIn (avg engagement: 3.2%)
- Facebook (avg engagement: 2.8%)
- Instagram (avg engagement: 6.7%)
- TikTok (avg engagement: 8.9%)
- YouTube (avg engagement: 4.2%)
- Reddit (avg engagement: 5.1%)
- Threads (avg engagement: 5.3%)
- BlueSky (avg engagement: 3.8%)

Provide a JSON array with platform recommendations, each with:
{
  "platform": "platform_name",
  "confidence": 0.85,
  "reason": "Why this platform is recommended",
  "expectedEngagement": 0.067,
  "roiScore": 8.5
}

Return ONLY valid JSON array, no additional text.
`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '[]';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return this.getDefaultRecommendations();
      }

      const recommendations = JSON.parse(jsonMatch[0]);
      this.logger.log(
        `Generated ${recommendations.length} platform recommendations`,
      );
      return recommendations;
    } catch (error) {
      this.logger.error(`Error analyzing content: ${error.message}`);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Get default recommendations
   */
  private getDefaultRecommendations(): Array<{
    platform: string;
    confidence: number;
    reason: string;
    expectedEngagement: number;
    roiScore: number;
  }> {
    return [
      {
        platform: 'linkedin',
        confidence: 0.92,
        reason: 'Professional content reaches high-value audience',
        expectedEngagement: 0.032,
        roiScore: 8.7,
      },
      {
        platform: 'twitter',
        confidence: 0.88,
        reason: 'Real-time discussions and trending topics',
        expectedEngagement: 0.045,
        roiScore: 8.2,
      },
      {
        platform: 'instagram',
        confidence: 0.85,
        reason: 'Visual content performs well, high engagement rates',
        expectedEngagement: 0.067,
        roiScore: 8.1,
      },
    ];
  }

  /**
   * Check for platform warnings and issues
   */
  async checkPlatformWarnings(input: {
    platforms: string[];
    contentType: string;
    targetAudience: string;
  }): Promise<
    Array<{
      platform: string;
      warningType: string;
      message: string;
      severity: 'info' | 'warning' | 'critical';
    }>
  > {
    this.logger.log(`Checking platform warnings`);

    const warnings = [];

    for (const platform of input.platforms) {
      const platformWarnings = this.generatePlatformWarnings(
        platform,
        input.contentType,
        input.targetAudience,
      );
      warnings.push(...platformWarnings);
    }

    return warnings;
  }

  /**
   * Generate platform-specific warnings
   */
  private generatePlatformWarnings(
    platform: string,
    contentType: string,
    targetAudience: string,
  ): Array<{
    platform: string;
    warningType: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
  }> {
    const warnings = [];

    // Content type compatibility checks
    const compatibilityMap = {
      twitter: ['text', 'image', 'video', 'thread'],
      linkedin: ['text', 'image', 'article', 'video'],
      instagram: ['image', 'video', 'carousel', 'reel'],
      tiktok: ['video', 'short-video'],
      youtube: ['video', 'short'],
    };

    if (compatibilityMap[platform]) {
      if (!compatibilityMap[platform].includes(contentType.toLowerCase())) {
        warnings.push({
          platform,
          warningType: 'content_mismatch',
          message: `${contentType} is not ideal for ${platform}. Recommended formats: ${compatibilityMap[platform].join(', ')}`,
          severity: 'warning',
        });
      }
    }

    // Audience warnings
    if (
      platform === 'linkedin' &&
      !targetAudience.toLowerCase().includes('professional')
    ) {
      warnings.push({
        platform,
        warningType: 'audience_mismatch',
        message: 'LinkedIn audience is primarily professional. Consider target audience fit.',
        severity: 'info',
      });
    }

    if (
      platform === 'tiktok' &&
      !targetAudience.toLowerCase().includes('young')
    ) {
      warnings.push({
        platform,
        warningType: 'audience_mismatch',
        message: 'TikTok audience is predominantly younger demographics (13-34).',
        severity: 'info',
      });
    }

    // Rate limit warnings
    if (platform === 'twitter') {
      warnings.push({
        platform,
        warningType: 'rate_limit',
        message: 'Twitter API has rate limits. Large-scale campaigns may need management.',
        severity: 'info',
      });
    }

    return warnings;
  }

  /**
   * Get platform performance metrics
   */
  async getPlatformMetrics(platformSlug: string): Promise<{
    platform: string;
    avgEngagement: number;
    bestContentTypes: string[];
    costPerImpression: number;
    estimatedReach: number;
  }> {
    const platform = await this.prisma.publishingPlatform.findUnique({
      where: { slug: platformSlug },
    });

    if (!platform) {
      throw new Error(`Platform not found: ${platformSlug}`);
    }

    const perfData = this.platformPerfData[platformSlug] || {
      avgEngagement: 0.03,
      bestContentTypes: ['general'],
    };

    return {
      platform: platform.name,
      avgEngagement: perfData.avgEngagement,
      bestContentTypes: perfData.bestContentTypes,
      costPerImpression: 0.5, // Example cost
      estimatedReach: 100000, // Example reach
    };
  }

  /**
   * Get trend data and insights
   */
  async getTrendInsights(input: {
    industry: string;
    geography: string;
    timeframe: 'week' | 'month' | 'quarter';
  }): Promise<
    Array<{
      keyword: string;
      volume: number;
      growth: number;
      platforms: string[];
      relevance: number;
    }>
  > {
    this.logger.log(`Getting trend insights for ${input.industry}`);

    // Fetch trending data from database
    const trends = await this.prisma.trendData.findMany({
      where: {
        pillar: { has: input.industry },
        capturedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 10,
      orderBy: { growth: 'desc' },
    });

    return trends.map((trend) => ({
      keyword: trend.keyword,
      volume: trend.volume,
      growth: Number(trend.growth),
      platforms: this.getRecommendedPlatformsForKeyword(trend.keyword),
      relevance: trend.relevanceScore,
    }));
  }

  /**
   * Get recommended platforms for a keyword
   */
  private getRecommendedPlatformsForKeyword(keyword: string): string[] {
    // Simple heuristic: different platforms for different keywords
    const lowerKeyword = keyword.toLowerCase();

    if (lowerKeyword.match(/breaking|news|viral/i)) {
      return ['twitter', 'threads', 'reddit'];
    }

    if (lowerKeyword.match(/business|professional|industry/i)) {
      return ['linkedin', 'twitter'];
    }

    if (lowerKeyword.match(/visual|design|art|photo/i)) {
      return ['instagram', 'pinterest', 'tiktok'];
    }

    if (lowerKeyword.match(/video|entertainment|music/i)) {
      return ['tiktok', 'youtube', 'instagram'];
    }

    return ['twitter', 'instagram', 'linkedin'];
  }

  /**
   * Generate AI insights for campaign optimization
   */
  async generateOptimizationInsights(input: {
    currentMetrics: {
      impressions: number;
      engagement: number;
      conversions: number;
      spend: number;
    };
    platforms: string[];
    targetAudience: string;
  }): Promise<{
    summary: string;
    recommendations: Array<{
      action: string;
      expectedImpact: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    const prompt = `
Analyze these campaign metrics and provide optimization recommendations:

Current Metrics:
- Impressions: ${input.currentMetrics.impressions}
- Engagement Rate: ${(input.currentMetrics.engagement / input.currentMetrics.impressions * 100).toFixed(2)}%
- Conversions: ${input.currentMetrics.conversions}
- Total Spend: $${input.currentMetrics.spend}

Platforms: ${input.platforms.join(', ')}
Target Audience: ${input.targetAudience}

Provide a JSON response with:
{
  "summary": "One paragraph analysis",
  "recommendations": [
    {
      "action": "Specific action to take",
      "expectedImpact": "Expected outcome in percentage",
      "priority": "high|medium|low"
    }
  ]
}

Return ONLY valid JSON, no additional text.
`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '{}';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error generating insights: ${error.message}`);
    }

    return {
      summary: 'Campaign performance analysis pending.',
      recommendations: [
        {
          action: 'Increase budget allocation to top-performing platforms',
          expectedImpact: '15-20% improvement',
          priority: 'high',
        },
      ],
    };
  }
}
