import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Trend Detector Service
 *
 * Analyzes the trend universe (2,000 trends) to identify content opportunities:
 * - Detect emerging trends (EMERGING/GROWING lifecycle)
 * - Find viral opportunities (high viral coefficient)
 * - Check trend relevance to business
 * - Alert on time-sensitive trends
 */

export interface TrendOpportunity {
  trendId: string;
  topic: string;
  lifecycle: 'EMERGING' | 'GROWING' | 'PEAK' | 'DECLINING' | 'DEAD';

  // Opportunity metrics
  opportunityScore: number; // 0-100
  relevanceScore: number; // 0-100
  viralCoefficient: number; // 0-100
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Timing
  peakEstimate: string; // "in 2 weeks", "in 1 month", etc.
  timeWindow: number; // Days remaining to capitalize

  // Content strategy
  recommendedFormat: 'blog-post' | 'video' | 'social-thread' | 'guide' | 'news-article';
  estimatedReach: number; // Potential impressions

  // Context
  source: string;
  category: string;
  relatedKeywords: string[];
}

export interface ViralOpportunity extends TrendOpportunity {
  viralPotential: 'EXPLOSIVE' | 'HIGH' | 'MODERATE';
  shareabilityScore: number; // 0-100
  emotionalTrigger: string[]; // ['curiosity', 'excitement', 'fear', etc.]
  platform: string[]; // Best platforms for this trend
}

export interface TimeSensitiveTrend {
  trendId: string;
  topic: string;
  deadline: Date; // When trend will peak/die
  hoursRemaining: number;
  currentLifecycle: string;
  reason: string; // Why it's time-sensitive
  recommendedAction: string;
}

export interface TrendRelevanceCheck {
  trendId: string;
  topic: string;
  relevanceScore: number;
  isRelevant: boolean;
  reasons: string[];
  targetAudience: string[];
  businessAlignment: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class TrendDetectorService {
  private readonly logger = new Logger(TrendDetectorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Detect emerging trends with high potential
   */
  async detectEmergingTrends(
    relevanceThreshold: number = 70,
    limit: number = 20,
  ): Promise<TrendOpportunity[]> {
    this.logger.log(`Detecting emerging trends (relevance >= ${relevanceThreshold})...`);

    const trends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: { in: ['EMERGING', 'GROWING'] },
        relevanceScore: { gte: relevanceThreshold },
      },
      orderBy: [
        { viralCoefficient: 'desc' },
        { relevanceScore: 'desc' },
      ],
      take: limit * 2, // Get more to filter later
    });

    this.logger.log(`Found ${trends.length} emerging trends`);

    const opportunities: TrendOpportunity[] = trends
      .map(trend => {
        const opportunityScore = this.calculateOpportunityScore(trend);
        const urgency = this.calculateUrgency(trend);
        const peakEstimate = this.estimatePeakTiming(trend);
        const timeWindow = this.calculateTimeWindow(trend);
        const recommendedFormat = this.recommendContentFormat(trend);
        const estimatedReach = this.estimateReach(trend);

        return {
          trendId: trend.id,
          topic: trend.keyword,
          lifecycle: trend.lifecycle as any,
          opportunityScore,
          relevanceScore: trend.relevanceScore,
          viralCoefficient: Number(Number(trend.viralCoefficient) || 0) || 0,
          urgency,
          peakEstimate,
          timeWindow,
          recommendedFormat,
          estimatedReach,
          source: trend.source,
          category: trend.pillar[0] || 'general',
          relatedKeywords: this.extractRelatedKeywords(trend.keyword),
        };
      })
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, limit);

    this.logger.log(`Identified ${opportunities.length} high-potential opportunities`);

    return opportunities;
  }

  /**
   * Find viral opportunities with explosive potential
   */
  async findViralOpportunities(viralThreshold: number = 80): Promise<ViralOpportunity[]> {
    this.logger.log(`Finding viral opportunities (viral coefficient >= ${viralThreshold})...`);

    const trends = await this.prisma.trendData.findMany({
      where: {
        viralCoefficient: { gte: viralThreshold },
        lifecycle: { in: ['EMERGING', 'GROWING', 'PEAK'] },
      },
      orderBy: { viralCoefficient: 'desc' },
      take: 10,
    });

    this.logger.log(`Found ${trends.length} viral opportunities`);

    return trends.map(trend => {
      const baseOpportunity = {
        trendId: trend.id,
        topic: trend.keyword,
        lifecycle: trend.lifecycle as any,
        opportunityScore: this.calculateOpportunityScore(trend),
        relevanceScore: trend.relevanceScore,
        viralCoefficient: Number(trend.viralCoefficient) || 0,
        urgency: this.calculateUrgency(trend),
        peakEstimate: this.estimatePeakTiming(trend),
        timeWindow: this.calculateTimeWindow(trend),
        recommendedFormat: this.recommendContentFormat(trend),
        estimatedReach: this.estimateReach(trend),
        source: trend.source,
        category: trend.pillar[0] || 'general',
        relatedKeywords: this.extractRelatedKeywords(trend.keyword),
      };

      return {
        ...baseOpportunity,
        viralPotential: this.assessViralPotential(Number(trend.viralCoefficient) || 0),
        shareabilityScore: this.calculateShareability(trend),
        emotionalTrigger: this.identifyEmotionalTriggers(trend),
        platform: this.recommendPlatforms(trend),
      };
    });
  }

  /**
   * Check lifecycle status of a specific trend
   */
  async checkTrendLifecycle(trendId: string): Promise<{
    trendId: string;
    topic: string;
    currentLifecycle: string;
    previousLifecycle: string | null;
    daysInCurrentStage: number;
    predictedNextStage: string;
    daysUntilNextStage: number;
  }> {
    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend not found: ${trendId}`);
    }

    // Calculate days in current stage
    const now = new Date();
    const capturedAt = new Date(trend.capturedAt);
    const daysSinceCreation = Math.floor((now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24));

    // Estimate stage duration based on lifecycle
    const stageDurations: Record<string, number> = {
      EMERGING: 14, // 2 weeks
      GROWING: 30,  // 1 month
      PEAK: 21,     // 3 weeks
      DECLINING: 45, // 1.5 months
      DEAD: 999,    // N/A
    };

    const currentStageDuration = stageDurations[trend.lifecycle] || 30;
    const daysInCurrentStage = Math.min(daysSinceCreation, currentStageDuration);

    // Predict next stage
    const lifecycleProgression: Record<string, string> = {
      EMERGING: 'GROWING',
      GROWING: 'PEAK',
      PEAK: 'DECLINING',
      DECLINING: 'DEAD',
      DEAD: 'DEAD',
    };

    const predictedNextStage = lifecycleProgression[trend.lifecycle];
    const daysUntilNextStage = Math.max(0, currentStageDuration - daysInCurrentStage);

    return {
      trendId: trend.id,
      topic: trend.keyword,
      currentLifecycle: trend.lifecycle,
      previousLifecycle: null, // TODO: Track lifecycle changes in history table
      daysInCurrentStage,
      predictedNextStage,
      daysUntilNextStage,
    };
  }

  /**
   * Alert on time-sensitive trends that need immediate action
   */
  async alertTimeSensitiveTrends(): Promise<TimeSensitiveTrend[]> {
    this.logger.log('Checking for time-sensitive trends...');

    const trends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: { in: ['EMERGING', 'GROWING', 'PEAK'] },
      },
    });

    const timeSensitive: TimeSensitiveTrend[] = [];

    for (const trend of trends) {
      const lifecycle = await this.checkTrendLifecycle(trend.id);

      // Alert if trend will peak/decline in next 7 days
      if (lifecycle.daysUntilNextStage <= 7) {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + lifecycle.daysUntilNextStage);

        const hoursRemaining = lifecycle.daysUntilNextStage * 24;

        let reason = '';
        let action = '';

        if (trend.lifecycle === 'EMERGING') {
          reason = 'Trend entering GROWING phase - create content now to ride the wave';
          action = 'Publish trend-jacking content within 48 hours';
        } else if (trend.lifecycle === 'GROWING') {
          reason = 'Trend approaching PEAK - last chance for maximum reach';
          action = 'Publish comprehensive guide or video immediately';
        } else if (trend.lifecycle === 'PEAK') {
          reason = 'Trend about to DECLINE - window closing';
          action = 'Publish quick social content to capture remaining audience';
        }

        timeSensitive.push({
          trendId: trend.id,
          topic: trend.keyword,
          deadline,
          hoursRemaining,
          currentLifecycle: trend.lifecycle,
          reason,
          recommendedAction: action,
        });
      }
    }

    this.logger.log(`Found ${timeSensitive.length} time-sensitive trends`);

    return timeSensitive.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  }

  /**
   * Check if a trend is relevant to the business
   */
  async checkTrendRelevance(trendId: string): Promise<TrendRelevanceCheck> {
    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend not found: ${trendId}`);
    }

    const reasons: string[] = [];
    let businessAlignment: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

    // Check relevance score
    if (trend.relevanceScore >= 80) {
      reasons.push('High relevance score indicates strong alignment');
      businessAlignment = 'HIGH';
    } else if (trend.relevanceScore >= 60) {
      reasons.push('Moderate relevance - some audience overlap');
      businessAlignment = 'MEDIUM';
    } else {
      reasons.push('Low relevance - limited audience overlap');
    }

    // Check category alignment
    const category = trend.pillar[0] || 'general';
    const relevantCategories = ['technology', 'business', 'marketing', 'entrepreneurship'];
    if (relevantCategories.includes(category.toLowerCase())) {
      reasons.push(`Category "${category}" aligns with target audience`);
      if (businessAlignment === 'MEDIUM') businessAlignment = 'HIGH';
    }

    // Check viral potential
    if (Number(trend.viralCoefficient) || 0 >= 75) {
      reasons.push('High viral potential can drive brand awareness');
    }

    const isRelevant = trend.relevanceScore >= 60 || businessAlignment !== 'LOW';

    return {
      trendId: trend.id,
      topic: trend.keyword,
      relevanceScore: trend.relevanceScore,
      isRelevant,
      reasons,
      targetAudience: this.identifyTargetAudience(trend),
      businessAlignment,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private calculateOpportunityScore(trend: any): number {
    // Weighted scoring:
    // - Relevance: 40%
    // - Viral coefficient: 30%
    // - Lifecycle stage: 20%
    // - Source quality: 10%

    const relevanceScore = trend.relevanceScore * 0.4;
    const viralScore = Number(trend.viralCoefficient) || 0 * 0.3;

    const lifecycleScores: Record<string, number> = {
      EMERGING: 90,
      GROWING: 100,
      PEAK: 70,
      DECLINING: 30,
      DEAD: 0,
    };
    const lifecycleScore = (lifecycleScores[trend.lifecycle] || 50) * 0.2;

    const sourceScores: Record<string, number> = {
      'google-trends': 80,
      'twitter': 90,
      'reddit': 85,
      'news': 75,
    };
    const sourceScore = (sourceScores[trend.source] || 50) * 0.1;

    return Math.round(relevanceScore + viralScore + lifecycleScore + sourceScore);
  }

  private calculateUrgency(trend: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (trend.lifecycle === 'PEAK') return 'CRITICAL';
    if (trend.lifecycle === 'GROWING' && Number(trend.viralCoefficient) || 0 >= 80) return 'HIGH';
    if (trend.lifecycle === 'EMERGING') return 'MEDIUM';
    return 'LOW';
  }

  private estimatePeakTiming(trend: any): string {
    const lifecycleToTiming: Record<string, string> = {
      EMERGING: 'in 2-4 weeks',
      GROWING: 'in 1-2 weeks',
      PEAK: 'now',
      DECLINING: 'already passed',
      DEAD: 'n/a',
    };

    return lifecycleToTiming[trend.lifecycle] || 'unknown';
  }

  private calculateTimeWindow(trend: any): number {
    // Days remaining to capitalize on trend
    const timeWindows: Record<string, number> = {
      EMERGING: 30,
      GROWING: 14,
      PEAK: 7,
      DECLINING: 3,
      DEAD: 0,
    };

    return timeWindows[trend.lifecycle] || 0;
  }

  private recommendContentFormat(trend: any): 'blog-post' | 'video' | 'social-thread' | 'guide' | 'news-article' {
    if (Number(trend.viralCoefficient) || 0 >= 85) return 'video';
    if (trend.lifecycle === 'EMERGING') return 'guide';
    if (trend.lifecycle === 'PEAK') return 'news-article';
    if (trend.source === 'twitter') return 'social-thread';
    return 'blog-post';
  }

  private estimateReach(trend: any): number {
    // Estimate based on viral coefficient and lifecycle
    const baseReach = Number(trend.viralCoefficient) || 0 * 1000;

    const lifecycleMultipliers: Record<string, number> = {
      EMERGING: 0.5,
      GROWING: 1.5,
      PEAK: 2.0,
      DECLINING: 0.3,
      DEAD: 0.1,
    };

    return Math.round(baseReach * (lifecycleMultipliers[trend.lifecycle] || 1));
  }

  private extractRelatedKeywords(topic: string): string[] {
    // Simple keyword extraction (in production, use NLP)
    const words = topic.toLowerCase().split(/\s+/);
    return words
      .filter(w => w.length > 3)
      .slice(0, 5);
  }

  private assessViralPotential(viralCoefficient: number): 'EXPLOSIVE' | 'HIGH' | 'MODERATE' {
    if (viralCoefficient >= 90) return 'EXPLOSIVE';
    if (viralCoefficient >= 80) return 'HIGH';
    return 'MODERATE';
  }

  private calculateShareability(trend: any): number {
    // Based on viral coefficient and source
    let score = Number(trend.viralCoefficient) || 0;

    if (trend.source === 'twitter') score += 10;
    if (trend.lifecycle === 'GROWING') score += 5;

    return Math.min(100, score);
  }

  private identifyEmotionalTriggers(trend: any): string[] {
    // Analyze topic for emotional triggers (simplified)
    const topic = trend.topic.toLowerCase();
    const triggers: string[] = [];

    if (topic.includes('new') || topic.includes('breakthrough')) triggers.push('curiosity');
    if (topic.includes('crisis') || topic.includes('warning')) triggers.push('fear');
    if (topic.includes('amazing') || topic.includes('incredible')) triggers.push('excitement');
    if (topic.includes('vs') || topic.includes('controversy')) triggers.push('debate');

    if (triggers.length === 0) triggers.push('interest');

    return triggers;
  }

  private recommendPlatforms(trend: any): string[] {
    const platforms: string[] = [];
    const category = trend.pillar[0] || 'general';

    // Twitter is good for most trends
    if (Number(trend.viralCoefficient) || 0 >= 70) platforms.push('twitter');

    // LinkedIn for business/tech trends
    if (['technology', 'business'].includes(category)) platforms.push('linkedin');

    // Reddit for emerging trends
    if (trend.lifecycle === 'EMERGING') platforms.push('reddit');

    // TikTok/Instagram for high viral potential
    if (Number(trend.viralCoefficient) || 0 >= 85) platforms.push('tiktok', 'instagram');

    return platforms.length > 0 ? platforms : ['twitter'];
  }

  private identifyTargetAudience(trend: any): string[] {
    const audiences: string[] = [];

    const categoryToAudience: Record<string, string[]> = {
      technology: ['tech enthusiasts', 'developers', 'early adopters'],
      business: ['entrepreneurs', 'business owners', 'executives'],
      entertainment: ['general public', 'content consumers'],
      health: ['health-conscious individuals', 'wellness seekers'],
      finance: ['investors', 'financial planners', 'crypto enthusiasts'],
    };

    const category = (trend.pillar[0] || 'general').toLowerCase();
    audiences.push(...(categoryToAudience[category] || ['general audience']));

    return audiences;
  }
}
