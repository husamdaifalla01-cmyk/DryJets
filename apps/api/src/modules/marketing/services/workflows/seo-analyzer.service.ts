import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * SEO Analyzer Service
 *
 * Analyzes the keyword universe (46,151 keywords) to identify opportunities:
 * - Quick wins (low difficulty, high opportunity)
 * - Rank changes and opportunities
 * - SEO health scoring
 * - Opportunity prioritization
 */

export interface KeywordOpportunity {
  keywordId: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  currentRank: number | null;
  targetRank: number;

  // Opportunity metrics
  opportunityScore: number; // 0-100
  estimatedTraffic: number; // Monthly traffic if ranked at target
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  quickWin: boolean; // Can we rank quickly?

  // Context
  category: string;
  intent: string | null;
  relatedKeywords: number;
}

export interface QuickWin extends KeywordOpportunity {
  daysToRank: number; // Estimated days to reach target rank
  effortLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedActions: string[];
}

export interface RankChange {
  keywordId: string;
  keyword: string;
  previousRank: number;
  currentRank: number;
  change: number; // Positive = improvement, Negative = decline
  changePercent: number;
  significance: 'MAJOR' | 'MODERATE' | 'MINOR';
  trend: 'RISING' | 'FALLING' | 'STABLE';
}

export interface SEOHealthReport {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';

  metrics: {
    totalKeywords: number;
    rankedKeywords: number;
    rankingRate: number; // % of keywords ranked (1-100)

    averageRank: number;
    top10Keywords: number;
    top20Keywords: number;
    top50Keywords: number;

    quickWinOpportunities: number;
    highValueOpportunities: number;
  };

  distribution: {
    byDifficulty: {
      easy: number; // 0-30
      medium: number; // 31-60
      hard: number; // 61-100
    };
    byVolume: {
      low: number; // 0-500
      medium: number; // 501-2000
      high: number; // 2001+
    };
    byCategory: Record<string, number>;
  };

  recommendations: string[];
  alerts: string[];
}

@Injectable()
export class SEOAnalyzerService {
  private readonly logger = new Logger(SEOAnalyzerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze keyword opportunities
   * Returns top opportunities ranked by potential impact
   */
  async analyzeKeywordOpportunities(limit: number = 100): Promise<KeywordOpportunity[]> {
    this.logger.log(`Analyzing top ${limit} keyword opportunities...`);

    const keywords = await this.prisma.keyword.findMany({
      select: {
        id: true,
        keyword: true,
        searchVolume: true,
        difficulty: true,
        currentRank: true,
        category: true,
        intent: true,
      },
      orderBy: { searchVolume: 'desc' },
      take: 5000, // Analyze top 5000 keywords for performance
    });

    const opportunities: KeywordOpportunity[] = keywords
      .map((kw) => {
        const targetRank = this.calculateTargetRank(kw.difficulty);
        const opportunityScore = this.calculateOpportunityScore(kw);
        const estimatedTraffic = this.estimateTraffic(kw.searchVolume, targetRank);
        const competitionLevel = this.getCompetitionLevel(kw.difficulty);
        const quickWin = this.isQuickWin(kw.difficulty, kw.currentRank, targetRank);

        return {
          keywordId: kw.id,
          keyword: kw.keyword,
          searchVolume: kw.searchVolume,
          difficulty: kw.difficulty,
          currentRank: kw.currentRank,
          targetRank,
          opportunityScore,
          estimatedTraffic,
          competitionLevel,
          quickWin,
          category: kw.category,
          intent: kw.intent,
          relatedKeywords: 0, // TODO: Calculate from keyword relationships
        };
      })
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, limit);

    this.logger.log(`Found ${opportunities.length} opportunities`);
    this.logger.log(`Quick wins: ${opportunities.filter(o => o.quickWin).length}`);

    return opportunities;
  }

  /**
   * Find quick win keywords
   * Low difficulty, high opportunity, achievable short-term
   */
  async findQuickWins(
    difficultyThreshold: number = 40,
    volumeThreshold: number = 200,
  ): Promise<QuickWin[]> {
    this.logger.log(`Finding quick wins (difficulty < ${difficultyThreshold}, volume > ${volumeThreshold})...`);

    const keywords = await this.prisma.keyword.findMany({
      where: {
        difficulty: { lt: difficultyThreshold },
        searchVolume: { gte: volumeThreshold },
        OR: [
          { currentRank: { gt: 20 } }, // Not yet ranking well
          { currentRank: null }, // Not ranking at all
        ],
      },
      select: {
        id: true,
        keyword: true,
        searchVolume: true,
        difficulty: true,
        currentRank: true,
        category: true,
        intent: true,
      },
      orderBy: [
        { difficulty: 'asc' },
        { searchVolume: 'desc' },
      ],
      take: 100,
    });

    const quickWins: QuickWin[] = keywords.map((kw) => {
      const targetRank = this.calculateTargetRank(kw.difficulty);
      const opportunityScore = this.calculateOpportunityScore(kw);
      const estimatedTraffic = this.estimateTraffic(kw.searchVolume, targetRank);
      const competitionLevel = this.getCompetitionLevel(kw.difficulty);
      const daysToRank = this.estimateDaysToRank(kw.difficulty, kw.currentRank, targetRank);
      const effortLevel = this.getEffortLevel(kw.difficulty);
      const recommendedActions = this.getRecommendedActions(kw);

      return {
        keywordId: kw.id,
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        currentRank: kw.currentRank,
        targetRank,
        opportunityScore,
        estimatedTraffic,
        competitionLevel,
        quickWin: true,
        category: kw.category,
        intent: kw.intent,
        relatedKeywords: 0,
        daysToRank,
        effortLevel,
        recommendedActions,
      };
    });

    this.logger.log(`Found ${quickWins.length} quick wins`);
    return quickWins;
  }

  /**
   * Detect rank changes over time
   * NOTE: Currently returns empty as we don't have historical rank data yet
   * This will be populated as the system tracks rank changes over time
   */
  async detectRankChanges(days: number = 30): Promise<RankChange[]> {
    this.logger.log(`Detecting rank changes over last ${days} days...`);

    // TODO: Implement rank change tracking
    // For now, return empty array as we don't have historical data
    // In production, we'd:
    // 1. Store rank snapshots daily
    // 2. Compare current rank to rank N days ago
    // 3. Calculate change and trend

    this.logger.warn('Rank change tracking not yet implemented - requires historical data collection');
    return [];
  }

  /**
   * Calculate overall SEO health score
   */
  async calculateSEOHealth(): Promise<SEOHealthReport> {
    this.logger.log('Calculating SEO health score...');

    // Get all keywords with stats
    const [
      totalKeywords,
      rankedKeywords,
      top10,
      top20,
      top50,
      keywords,
    ] = await Promise.all([
      this.prisma.keyword.count(),
      this.prisma.keyword.count({ where: { currentRank: { lte: 100 } } }),
      this.prisma.keyword.count({ where: { currentRank: { lte: 10 } } }),
      this.prisma.keyword.count({ where: { currentRank: { lte: 20 } } }),
      this.prisma.keyword.count({ where: { currentRank: { lte: 50 } } }),
      this.prisma.keyword.findMany({
        select: {
          currentRank: true,
          difficulty: true,
          searchVolume: true,
          category: true,
        },
      }),
    ]);

    // Calculate metrics
    const rankingRate = totalKeywords > 0 ? (rankedKeywords / totalKeywords) * 100 : 0;
    const rankedKeywordsData = keywords.filter(k => k.currentRank && k.currentRank <= 100);
    const averageRank = rankedKeywordsData.length > 0
      ? rankedKeywordsData.reduce((sum, k) => sum + (k.currentRank || 0), 0) / rankedKeywordsData.length
      : 0;

    // Distribution by difficulty
    const easyKeywords = keywords.filter(k => k.difficulty <= 30).length;
    const mediumKeywords = keywords.filter(k => k.difficulty > 30 && k.difficulty <= 60).length;
    const hardKeywords = keywords.filter(k => k.difficulty > 60).length;

    // Distribution by volume
    const lowVolume = keywords.filter(k => k.searchVolume <= 500).length;
    const mediumVolume = keywords.filter(k => k.searchVolume > 500 && k.searchVolume <= 2000).length;
    const highVolume = keywords.filter(k => k.searchVolume > 2000).length;

    // Distribution by category
    const byCategory: Record<string, number> = {};
    keywords.forEach(k => {
      byCategory[k.category] = (byCategory[k.category] || 0) + 1;
    });

    // Count opportunities
    const quickWinOpportunities = keywords.filter(k =>
      k.difficulty < 40 &&
      k.searchVolume >= 200 &&
      (!k.currentRank || k.currentRank > 20)
    ).length;

    const highValueOpportunities = keywords.filter(k =>
      k.searchVolume > 1000 &&
      (!k.currentRank || k.currentRank > 10)
    ).length;

    // Calculate overall score (0-100)
    const overallScore = this.calculateOverallHealthScore({
      rankingRate,
      averageRank,
      top10Keywords: top10,
      top20Keywords: top20,
      top50Keywords: top50,
      totalKeywords,
    });

    const grade = this.getHealthGrade(overallScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      rankingRate,
      quickWinOpportunities,
      highValueOpportunities,
      averageRank,
      top10,
    });

    // Generate alerts
    const alerts = this.generateAlerts({
      rankingRate,
      averageRank,
      quickWinOpportunities,
    });

    this.logger.log(`SEO Health Score: ${overallScore}/100 (Grade ${grade})`);

    return {
      overallScore,
      grade,
      metrics: {
        totalKeywords,
        rankedKeywords,
        rankingRate,
        averageRank,
        top10Keywords: top10,
        top20Keywords: top20,
        top50Keywords: top50,
        quickWinOpportunities,
        highValueOpportunities,
      },
      distribution: {
        byDifficulty: {
          easy: easyKeywords,
          medium: mediumKeywords,
          hard: hardKeywords,
        },
        byVolume: {
          low: lowVolume,
          medium: mediumVolume,
          high: highVolume,
        },
        byCategory,
      },
      recommendations,
      alerts,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private calculateTargetRank(difficulty: number): number {
    // Target rank based on difficulty:
    // Easy (0-30): Target top 5
    // Medium (31-60): Target top 10
    // Hard (61-100): Target top 20
    if (difficulty <= 30) return 5;
    if (difficulty <= 60) return 10;
    return 20;
  }

  private calculateOpportunityScore(keyword: any): number {
    // Opportunity score formula (0-100):
    // Higher volume = higher score
    // Lower difficulty = higher score
    // Not ranking or ranking poorly = higher score

    const volumeScore = Math.min((keyword.searchVolume / 5000) * 50, 50);
    const difficultyScore = ((100 - keyword.difficulty) / 100) * 30;
    const rankScore = keyword.currentRank
      ? ((100 - keyword.currentRank) / 100) * 20
      : 20; // Not ranking = full score

    return Math.round(volumeScore + difficultyScore + rankScore);
  }

  private estimateTraffic(searchVolume: number, targetRank: number): number {
    // CTR estimates by rank:
    // Rank 1: 28.5%, Rank 2: 15.7%, Rank 3: 11%, Rank 4-5: 8%, Rank 6-10: 5%, Rank 11-20: 2%
    const ctrByRank: Record<number, number> = {
      1: 0.285,
      2: 0.157,
      3: 0.11,
      4: 0.08,
      5: 0.08,
      6: 0.05,
      7: 0.05,
      8: 0.05,
      9: 0.05,
      10: 0.05,
    };

    const ctr = ctrByRank[targetRank] || (targetRank <= 20 ? 0.02 : 0.01);
    return Math.round(searchVolume * ctr);
  }

  private getCompetitionLevel(difficulty: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (difficulty <= 30) return 'LOW';
    if (difficulty <= 60) return 'MEDIUM';
    return 'HIGH';
  }

  private isQuickWin(difficulty: number, currentRank: number | null, targetRank: number): boolean {
    return difficulty < 40 && (!currentRank || currentRank > targetRank + 10);
  }

  private estimateDaysToRank(difficulty: number, currentRank: number | null, targetRank: number): number {
    // Rough estimation:
    // Easy keywords: 30-60 days
    // Medium keywords: 60-120 days
    // Hard keywords: 120-180 days
    const baseDays = difficulty <= 30 ? 45 : difficulty <= 60 ? 90 : 150;
    const rankGap = currentRank ? Math.abs(currentRank - targetRank) : 100;
    const rankMultiplier = Math.min(rankGap / 20, 2);

    return Math.round(baseDays * rankMultiplier);
  }

  private getEffortLevel(difficulty: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (difficulty <= 30) return 'LOW';
    if (difficulty <= 60) return 'MEDIUM';
    return 'HIGH';
  }

  private getRecommendedActions(keyword: any): string[] {
    const actions: string[] = [];

    if (keyword.difficulty < 30) {
      actions.push('Create optimized content targeting this keyword');
      actions.push('Build 5-10 high-quality backlinks');
      actions.push('Optimize on-page SEO (title, meta, headers)');
    } else if (keyword.difficulty < 60) {
      actions.push('Create comprehensive content (2000+ words)');
      actions.push('Build 15-25 high-quality backlinks');
      actions.push('Optimize for related keywords and semantic search');
      actions.push('Improve site authority in this topic cluster');
    } else {
      actions.push('Create ultimate guide / pillar content (3000+ words)');
      actions.push('Build 30+ high-quality backlinks');
      actions.push('Develop topic cluster strategy');
      actions.push('Build domain authority through PR and outreach');
    }

    if (keyword.intent === 'transactional') {
      actions.push('Optimize for conversion (clear CTAs, trust signals)');
    }

    return actions;
  }

  private calculateOverallHealthScore(metrics: any): number {
    // Weighted scoring:
    // Ranking rate: 30%
    // Average rank quality: 30%
    // Top 10 presence: 25%
    // Top 20 presence: 15%

    const rankingRateScore = Math.min(metrics.rankingRate, 100) * 0.3;
    const avgRankScore = metrics.averageRank > 0
      ? ((100 - metrics.averageRank) / 100) * 100 * 0.3
      : 0;
    const top10Score = (metrics.top10Keywords / Math.max(metrics.totalKeywords, 1)) * 100 * 0.25;
    const top20Score = (metrics.top20Keywords / Math.max(metrics.totalKeywords, 1)) * 100 * 0.15;

    return Math.round(rankingRateScore + avgRankScore + top10Score + top20Score);
  }

  private getHealthGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.rankingRate < 50) {
      recommendations.push('Low ranking rate - prioritize quick win keywords to improve visibility');
    }

    if (metrics.quickWinOpportunities > 50) {
      recommendations.push(`${metrics.quickWinOpportunities} quick win opportunities available - focus on low-hanging fruit`);
    }

    if (metrics.highValueOpportunities > 20) {
      recommendations.push(`${metrics.highValueOpportunities} high-value keywords not ranking - consider long-term SEO investment`);
    }

    if (metrics.averageRank > 50) {
      recommendations.push('Average rank is low - improve content quality and backlink profile');
    }

    if (metrics.top10 < 10) {
      recommendations.push('Limited top 10 rankings - focus on improving existing ranked content');
    }

    if (recommendations.length === 0) {
      recommendations.push('SEO performance is strong - continue current strategy and scale successful tactics');
    }

    return recommendations;
  }

  private generateAlerts(metrics: any): string[] {
    const alerts: string[] = [];

    if (metrics.rankingRate < 20) {
      alerts.push('CRITICAL: Very low ranking rate - immediate SEO strategy review needed');
    }

    if (metrics.averageRank > 75) {
      alerts.push('WARNING: Poor average rank position - content quality may be insufficient');
    }

    if (metrics.quickWinOpportunities === 0) {
      alerts.push('NOTICE: No quick wins available - may need to expand keyword targeting');
    }

    return alerts;
  }
}
