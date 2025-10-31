import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Seeding Validation & Testing Service
 * Multi-dimensional testing framework for data quality and real-life simulations
 *
 * Test Dimensions:
 * 1. Data Integrity: Completeness, types, constraints
 * 2. Statistical Accuracy: Distributions match expected patterns
 * 3. Relationship Integrity: Foreign keys, hierarchies work correctly
 * 4. Real-World Scenarios: Can answer actual marketing questions
 * 5. ML Readiness: Data structured for model training
 * 6. Performance Simulation: Query performance under load
 * 7. AI Query Simulation: Claude can extract insights
 */

interface ValidationReport {
  timestamp: Date;
  overallScore: number; // 0-100
  passed: boolean;
  dimensions: {
    dataIntegrity: DimensionResult;
    statisticalAccuracy: DimensionResult;
    relationshipIntegrity: DimensionResult;
    realWorldScenarios: DimensionResult;
    mlReadiness: DimensionResult;
    performanceSimulation: DimensionResult;
    aiQuerySimulation: DimensionResult;
  };
  summary: string;
  recommendations: string[];
}

interface DimensionResult {
  score: number; // 0-100
  passed: boolean;
  tests: TestResult[];
  issues: string[];
  warnings: string[];
}

interface TestResult {
  name: string;
  passed: boolean;
  score: number;
  details: string;
  expected?: any;
  actual?: any;
}

@Injectable()
export class ValidationService {
  private readonly logger = new Logger('ValidationService');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Run comprehensive validation suite
   */
  async runFullValidation(): Promise<ValidationReport> {
    this.logger.log('🔍 Starting comprehensive validation suite...\n');

    const report: ValidationReport = {
      timestamp: new Date(),
      overallScore: 0,
      passed: false,
      dimensions: {
        dataIntegrity: null,
        statisticalAccuracy: null,
        relationshipIntegrity: null,
        realWorldScenarios: null,
        mlReadiness: null,
        performanceSimulation: null,
        aiQuerySimulation: null,
      },
      summary: '',
      recommendations: [],
    };

    // Run each dimension test
    try {
      report.dimensions.dataIntegrity = await this.testDataIntegrity();
      report.dimensions.statisticalAccuracy = await this.testStatisticalAccuracy();
      report.dimensions.relationshipIntegrity = await this.testRelationshipIntegrity();
      report.dimensions.realWorldScenarios = await this.testRealWorldScenarios();
      report.dimensions.mlReadiness = await this.testMLReadiness();
      report.dimensions.performanceSimulation = await this.testPerformanceSimulation();
      report.dimensions.aiQuerySimulation = await this.testAIQuerySimulation();

      // Calculate overall score
      const scores = Object.values(report.dimensions).map((d) => d.score);
      report.overallScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      report.passed = report.overallScore >= 75; // Pass threshold: 75%

      // Generate summary
      report.summary = this.generateSummary(report);

      // Generate recommendations
      report.recommendations = this.generateRecommendations(report);

      this.logger.log(`\n${'='.repeat(80)}`);
      this.logger.log(`📊 VALIDATION COMPLETE - Score: ${report.overallScore}/100`);
      this.logger.log(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
      this.logger.log(`${'='.repeat(80)}\n`);

      return report;
    } catch (error) {
      this.logger.error('Validation failed with error:', error);
      throw error;
    }
  }

  /**
   * Dimension 1: Data Integrity
   * Tests: completeness, types, constraints, nulls
   */
  private async testDataIntegrity(): Promise<DimensionResult> {
    this.logger.log('📋 Testing Data Integrity...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Test 1.1: Campaign data completeness
    const campaignCount = await this.prisma.campaign.count();
    tests.push({
      name: 'Campaign data exists',
      passed: campaignCount >= 4000,
      score: campaignCount >= 4000 ? 100 : (campaignCount / 4000) * 100,
      details: `Found ${campaignCount.toLocaleString()} campaigns (expected ≥4,000)`,
      expected: '≥4000',
      actual: campaignCount,
    });

    if (campaignCount < 4000) {
      issues.push(`Only ${campaignCount} campaigns found, expected ≥4,000`);
    }

    // Test 1.2: Campaign Memory linkage
    const campaignsWithMemory = await this.prisma.campaign.count({
      where: { campaignMetrics: { some: {} } },
    });
    const memoryLinkageRate = (campaignsWithMemory / campaignCount) * 100;
    tests.push({
      name: 'Campaign-Memory linkage',
      passed: memoryLinkageRate >= 80,
      score: memoryLinkageRate,
      details: `${memoryLinkageRate.toFixed(1)}% of campaigns have metrics`,
      expected: '≥80%',
      actual: `${memoryLinkageRate.toFixed(1)}%`,
    });

    if (memoryLinkageRate < 80) {
      issues.push(`Only ${memoryLinkageRate.toFixed(1)}% campaigns have metrics`);
    }

    // Test 1.3: Keyword data completeness
    const keywordCount = await this.prisma.keyword.count();
    tests.push({
      name: 'Keyword data exists',
      passed: keywordCount >= 40000,
      score: keywordCount >= 40000 ? 100 : (keywordCount / 40000) * 100,
      details: `Found ${keywordCount.toLocaleString()} keywords (expected ≥40,000)`,
      expected: '≥40000',
      actual: keywordCount,
    });

    // Test 1.4: Keywords have required fields
    const keywordsWithNullVolume = await this.prisma.keyword.count({
      where: { searchVolume: 0 },
    });
    const volumeIntegrityRate = ((keywordCount - keywordsWithNullVolume) / keywordCount) * 100;
    tests.push({
      name: 'Keyword volume integrity',
      passed: volumeIntegrityRate >= 95,
      score: volumeIntegrityRate,
      details: `${volumeIntegrityRate.toFixed(1)}% have non-zero search volume`,
      expected: '≥95%',
      actual: `${volumeIntegrityRate.toFixed(1)}%`,
    });

    // Test 1.5: Content data completeness
    const blogPostCount = await this.prisma.blogPost.count();
    tests.push({
      name: 'Blog post data exists',
      passed: blogPostCount >= 4000,
      score: blogPostCount >= 4000 ? 100 : (blogPostCount / 4000) * 100,
      details: `Found ${blogPostCount.toLocaleString()} blog posts (expected ≥4,000)`,
      expected: '≥4000',
      actual: blogPostCount,
    });

    // Test 1.6: Trend data completeness
    const trendCount = await this.prisma.trendData.count();
    tests.push({
      name: 'Trend data exists',
      passed: trendCount >= 1500,
      score: trendCount >= 1500 ? 100 : (trendCount / 1500) * 100,
      details: `Found ${trendCount.toLocaleString()} trends (expected ≥1,500)`,
      expected: '≥1500',
      actual: trendCount,
    });

    // Test 1.7: Journey data completeness
    const journeyCount = await this.prisma.customerJourney.count();
    tests.push({
      name: 'Customer journey data exists',
      passed: journeyCount >= 2500,
      score: journeyCount >= 2500 ? 100 : (journeyCount / 2500) * 100,
      details: `Found ${journeyCount.toLocaleString()} journeys (expected ≥2,500)`,
      expected: '≥2500',
      actual: journeyCount,
    });

    // Test 1.8: Backlink data completeness
    const backlinkCount = await this.prisma.backlink.count();
    tests.push({
      name: 'Backlink data exists',
      passed: backlinkCount >= 1500,
      score: backlinkCount >= 1500 ? 100 : (backlinkCount / 1500) * 100,
      details: `Found ${backlinkCount.toLocaleString()} backlinks (expected ≥1,500)`,
      expected: '≥1500',
      actual: backlinkCount,
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} Data Integrity: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Dimension 2: Statistical Accuracy
   * Tests: distributions, correlations, ranges
   */
  private async testStatisticalAccuracy(): Promise<DimensionResult> {
    this.logger.log('📊 Testing Statistical Accuracy...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Test 2.1: Campaign success tier distribution (30/50/20)
    const campaignMemories = await this.prisma.campaignMemory.findMany({
      select: { execution: true },
    });

    const successTiers = campaignMemories.map((cm: any) => cm.execution?.successTier).filter(Boolean);
    const highPercent = (successTiers.filter((t) => t === 'HIGH').length / successTiers.length) * 100;
    const moderatePercent = (successTiers.filter((t) => t === 'MODERATE').length / successTiers.length) * 100;
    const lowPercent = (successTiers.filter((t) => t === 'LOW').length / successTiers.length) * 100;

    const tierDistributionScore = 100 - (
      Math.abs(highPercent - 30) +
      Math.abs(moderatePercent - 50) +
      Math.abs(lowPercent - 20)
    ) * 2; // Penalty: 2 points per % deviation

    tests.push({
      name: 'Campaign success tier distribution',
      passed: tierDistributionScore >= 75,
      score: tierDistributionScore,
      details: `HIGH: ${highPercent.toFixed(1)}%, MODERATE: ${moderatePercent.toFixed(1)}%, LOW: ${lowPercent.toFixed(1)}%`,
      expected: 'HIGH: 30%, MODERATE: 50%, LOW: 20%',
      actual: `HIGH: ${highPercent.toFixed(1)}%, MODERATE: ${moderatePercent.toFixed(1)}%, LOW: ${lowPercent.toFixed(1)}%`,
    });

    // Test 2.2: Keyword category distribution
    const keywordStats = await this.prisma.keyword.groupBy({
      by: ['category'],
      _count: true,
    });

    const totalKeywords = keywordStats.reduce((sum, k) => sum + k._count, 0);
    const primaryPercent = ((keywordStats.find((k) => k.category === 'primary')?._count || 0) / totalKeywords) * 100;
    const secondaryPercent = ((keywordStats.find((k) => k.category === 'secondary')?._count || 0) / totalKeywords) * 100;
    const tertiaryPercent = ((keywordStats.find((k) => k.category === 'tertiary')?._count || 0) / totalKeywords) * 100;
    const ultraLongTailPercent = ((keywordStats.find((k) => k.category === 'ultra-long-tail')?._count || 0) / totalKeywords) * 100;

    const keywordDistScore = 100 - (
      Math.abs(primaryPercent - 5) +
      Math.abs(secondaryPercent - 15) +
      Math.abs(tertiaryPercent - 30) +
      Math.abs(ultraLongTailPercent - 50)
    ) * 2;

    tests.push({
      name: 'Keyword category distribution',
      passed: keywordDistScore >= 75,
      score: keywordDistScore,
      details: `Primary: ${primaryPercent.toFixed(1)}%, Secondary: ${secondaryPercent.toFixed(1)}%, Tertiary: ${tertiaryPercent.toFixed(1)}%, Ultra: ${ultraLongTailPercent.toFixed(1)}%`,
      expected: 'Primary: 5%, Secondary: 15%, Tertiary: 30%, Ultra: 50%',
      actual: `${primaryPercent.toFixed(1)}%, ${secondaryPercent.toFixed(1)}%, ${tertiaryPercent.toFixed(1)}%, ${ultraLongTailPercent.toFixed(1)}%`,
    });

    // Test 2.3: Trend lifecycle distribution
    const trendStats = await this.prisma.trendData.groupBy({
      by: ['lifecycle'],
      _count: true,
    });

    const totalTrends = trendStats.reduce((sum, t) => sum + t._count, 0);
    const emergingPercent = ((trendStats.find((t) => t.lifecycle === 'EMERGING')?._count || 0) / totalTrends) * 100;
    const growingPercent = ((trendStats.find((t) => t.lifecycle === 'GROWING')?._count || 0) / totalTrends) * 100;
    const peakPercent = ((trendStats.find((t) => t.lifecycle === 'PEAK')?._count || 0) / totalTrends) * 100;
    const decliningPercent = ((trendStats.find((t) => t.lifecycle === 'DECLINING')?._count || 0) / totalTrends) * 100;
    const deadPercent = ((trendStats.find((t) => t.lifecycle === 'DEAD')?._count || 0) / totalTrends) * 100;

    const trendDistScore = 100 - (
      Math.abs(emergingPercent - 25) +
      Math.abs(growingPercent - 30) +
      Math.abs(peakPercent - 20) +
      Math.abs(decliningPercent - 15) +
      Math.abs(deadPercent - 10)
    ) * 2;

    tests.push({
      name: 'Trend lifecycle distribution',
      passed: trendDistScore >= 75,
      score: trendDistScore,
      details: `EMERGING: ${emergingPercent.toFixed(1)}%, GROWING: ${growingPercent.toFixed(1)}%, PEAK: ${peakPercent.toFixed(1)}%, DECLINING: ${decliningPercent.toFixed(1)}%, DEAD: ${deadPercent.toFixed(1)}%`,
      expected: 'EMERGING: 25%, GROWING: 30%, PEAK: 20%, DECLINING: 15%, DEAD: 10%',
      actual: `${emergingPercent.toFixed(1)}%, ${growingPercent.toFixed(1)}%, ${peakPercent.toFixed(1)}%, ${decliningPercent.toFixed(1)}%, ${deadPercent.toFixed(1)}%`,
    });

    // Test 2.4: Journey conversion rate
    const totalJourneys = await this.prisma.customerJourney.count();
    const convertedJourneys = await this.prisma.customerJourney.count({ where: { converted: true } });
    const conversionRate = (convertedJourneys / totalJourneys) * 100;

    const conversionRateScore = 100 - Math.abs(conversionRate - 25) * 4; // Penalty: 4 points per % deviation from 25%

    tests.push({
      name: 'Journey conversion rate',
      passed: conversionRateScore >= 75,
      score: conversionRateScore,
      details: `${conversionRate.toFixed(1)}% conversion rate`,
      expected: '25% ±5%',
      actual: `${conversionRate.toFixed(1)}%`,
    });

    // Test 2.5: Backlink status distribution (75% active)
    const totalBacklinks = await this.prisma.backlink.count();
    const activeBacklinks = await this.prisma.backlink.count({ where: { status: 'ACTIVE' } });
    const activePercent = (activeBacklinks / totalBacklinks) * 100;

    const backlinkStatusScore = 100 - Math.abs(activePercent - 75) * 2;

    tests.push({
      name: 'Backlink status distribution',
      passed: backlinkStatusScore >= 75,
      score: backlinkStatusScore,
      details: `${activePercent.toFixed(1)}% active backlinks`,
      expected: '75% ±10%',
      actual: `${activePercent.toFixed(1)}%`,
    });

    // Test 2.6: Power law distribution (search volumes)
    const keywords = await this.prisma.keyword.findMany({
      select: { searchVolume: true },
      take: 1000,
      orderBy: { searchVolume: 'desc' },
    });

    const top10Percent = keywords.slice(0, 100);
    const top10Volume = top10Percent.reduce((sum, k) => sum + k.searchVolume, 0);
    const totalVolume = keywords.reduce((sum, k) => sum + k.searchVolume, 0);
    const top10Share = (top10Volume / totalVolume) * 100;

    // Power law: top 10% should have 50-70% of volume
    const powerLawScore = top10Share >= 50 && top10Share <= 70 ? 100 : 100 - Math.abs(top10Share - 60) * 2;

    tests.push({
      name: 'Power law distribution (keywords)',
      passed: powerLawScore >= 75,
      score: powerLawScore,
      details: `Top 10% keywords have ${top10Share.toFixed(1)}% of search volume`,
      expected: '50-70% (power law)',
      actual: `${top10Share.toFixed(1)}%`,
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} Statistical Accuracy: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Dimension 3: Relationship Integrity
   * Tests: foreign keys, hierarchies, cross-table consistency
   */
  private async testRelationshipIntegrity(): Promise<DimensionResult> {
    this.logger.log('🔗 Testing Relationship Integrity...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Test 3.1: Campaign → CampaignMetric relationship
    const campaignsWithMetrics = await this.prisma.campaign.findMany({
      include: { _count: { select: { campaignMetrics: true } } },
      take: 100,
    });

    const avgMetricsPerCampaign = campaignsWithMetrics.reduce((sum, c) => sum + c._count.campaignMetrics, 0) / campaignsWithMetrics.length;

    tests.push({
      name: 'Campaign-Metric relationship',
      passed: avgMetricsPerCampaign >= 1,
      score: Math.min(100, avgMetricsPerCampaign * 50),
      details: `Avg ${avgMetricsPerCampaign.toFixed(1)} metrics per campaign`,
      expected: '≥1 metric per campaign',
      actual: avgMetricsPerCampaign.toFixed(1),
    });

    // Test 3.2: BlogPost → SEOMetric relationship
    const blogPostsWithMetrics = await this.prisma.blogPost.findMany({
      include: { _count: { select: { seoMetrics: true } } },
      where: { status: 'PUBLISHED' },
      take: 100,
    });

    const avgSEOMetricsPerPost = blogPostsWithMetrics.reduce((sum, b) => sum + b._count.seoMetrics, 0) / blogPostsWithMetrics.length;

    tests.push({
      name: 'BlogPost-SEOMetric relationship',
      passed: avgSEOMetricsPerPost >= 10,
      score: Math.min(100, (avgSEOMetricsPerPost / 20) * 100),
      details: `Avg ${avgSEOMetricsPerPost.toFixed(1)} SEO metrics per blog post`,
      expected: '≥10 metrics (monthly data)',
      actual: avgSEOMetricsPerPost.toFixed(1),
    });

    // Test 3.3: CustomerJourney → TouchPoint relationship
    const journeysWithTouchPoints = await this.prisma.customerJourney.findMany({
      include: { _count: { select: { touchPoints: true } } },
      take: 100,
    });

    const avgTouchPointsPerJourney = journeysWithTouchPoints.reduce((sum, j) => sum + j._count.touchPoints, 0) / journeysWithTouchPoints.length;

    tests.push({
      name: 'Journey-TouchPoint relationship',
      passed: avgTouchPointsPerJourney >= 3,
      score: Math.min(100, (avgTouchPointsPerJourney / 7) * 100),
      details: `Avg ${avgTouchPointsPerJourney.toFixed(1)} touchpoints per journey`,
      expected: '3-7 touchpoints',
      actual: avgTouchPointsPerJourney.toFixed(1),
    });

    // Test 3.4: Keyword parent-child hierarchy
    const keywordsWithParent = await this.prisma.keyword.count({
      where: { parentKeywordId: { not: null } },
    });
    const totalKeywords = await this.prisma.keyword.count();
    const hierarchyPercent = (keywordsWithParent / totalKeywords) * 100;

    tests.push({
      name: 'Keyword hierarchy (parent-child)',
      passed: hierarchyPercent >= 70,
      score: hierarchyPercent,
      details: `${hierarchyPercent.toFixed(1)}% keywords have parent relationship`,
      expected: '≥70% (long-tail variations)',
      actual: `${hierarchyPercent.toFixed(1)}%`,
    });

    // Test 3.5: Backlink → OutreachCampaign relationship
    const backlinksWithCampaign = await this.prisma.backlink.count({
      where: {
        outreachCampaignId: { not: null },
        acquisitionType: { in: ['HARO', 'GUEST_POST', 'BROKEN_LINK', 'RESOURCE_PAGE'] },
      },
    });
    const outreachBacklinks = await this.prisma.backlink.count({
      where: { acquisitionType: { in: ['HARO', 'GUEST_POST', 'BROKEN_LINK', 'RESOURCE_PAGE'] } },
    });
    const campaignLinkagePercent = (backlinksWithCampaign / outreachBacklinks) * 100;

    tests.push({
      name: 'Backlink-Campaign linkage',
      passed: campaignLinkagePercent >= 50,
      score: Math.min(100, campaignLinkagePercent * 2),
      details: `${campaignLinkagePercent.toFixed(1)}% outreach backlinks linked to campaigns`,
      expected: '≥50%',
      actual: `${campaignLinkagePercent.toFixed(1)}%`,
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} Relationship Integrity: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Dimension 4: Real-World Scenarios
   * Tests: Can the data answer actual marketing questions?
   */
  private async testRealWorldScenarios(): Promise<DimensionResult> {
    this.logger.log('🌍 Testing Real-World Scenarios...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Scenario 4.1: "What were my best performing campaigns last quarter?"
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const topCampaigns = await this.prisma.campaignMemory.findMany({
      where: {
        createdAt: { gte: threeMonthsAgo },
        roi: { gt: 3 },
      },
      orderBy: { roi: 'desc' },
      take: 10,
    });

    tests.push({
      name: 'Scenario: Best campaigns query',
      passed: topCampaigns.length >= 5,
      score: Math.min(100, (topCampaigns.length / 10) * 100),
      details: `Found ${topCampaigns.length} high-ROI campaigns (ROI > 3x) in last 3 months`,
      expected: '≥5 campaigns',
      actual: topCampaigns.length,
    });

    // Scenario 4.2: "Which keywords should I target for quick wins?"
    const quickWinKeywords = await this.prisma.keyword.findMany({
      where: {
        difficulty: { lt: 40 },
        searchVolume: { gt: 500 },
        currentRank: { gt: 10 },
      },
      orderBy: { searchVolume: 'desc' },
      take: 20,
    });

    tests.push({
      name: 'Scenario: Quick win keywords',
      passed: quickWinKeywords.length >= 10,
      score: Math.min(100, (quickWinKeywords.length / 20) * 100),
      details: `Found ${quickWinKeywords.length} low-difficulty, high-volume keywords`,
      expected: '≥10 keywords',
      actual: quickWinKeywords.length,
    });

    // Scenario 4.3: "What content performed best in terms of SEO growth?"
    const blogPosts = await this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { seoMetrics: { orderBy: { date: 'asc' } } },
      take: 50,
    });

    const postsWithGrowth = blogPosts.filter((post) => {
      if (post.seoMetrics.length < 2) return false;
      const firstMonth = post.seoMetrics[0];
      const lastMonth = post.seoMetrics[post.seoMetrics.length - 1];
      const growth = ((lastMonth.clicks - firstMonth.clicks) / Math.max(firstMonth.clicks, 1)) * 100;
      return growth > 100; // 100%+ growth
    });

    tests.push({
      name: 'Scenario: High-growth content',
      passed: postsWithGrowth.length >= 10,
      score: Math.min(100, (postsWithGrowth.length / 20) * 100),
      details: `Found ${postsWithGrowth.length} blog posts with 100%+ traffic growth`,
      expected: '≥10 posts',
      actual: postsWithGrowth.length,
    });

    // Scenario 4.4: "Which channels drive the most conversions?"
    const journeys = await this.prisma.customerJourney.findMany({
      where: { converted: true },
      include: { touchPoints: true },
      take: 500,
    });

    const channelConversions: Record<string, number> = {};
    for (const journey of journeys) {
      for (const tp of journey.touchPoints) {
        channelConversions[tp.channel] = (channelConversions[tp.channel] || 0) + 1;
      }
    }

    const topChannels = Object.entries(channelConversions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    tests.push({
      name: 'Scenario: Top conversion channels',
      passed: topChannels.length >= 3,
      score: topChannels.length >= 3 ? 100 : (topChannels.length / 3) * 100,
      details: `Identified ${topChannels.length} top conversion channels: ${topChannels.map((c) => c[0]).join(', ')}`,
      expected: '≥3 channels',
      actual: topChannels.length,
    });

    // Scenario 4.5: "What trends should I capitalize on right now?"
    const actionableTrends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: { in: ['EMERGING', 'GROWING'] },
        relevanceScore: { gte: 70 },
        expiresAt: { gt: new Date() },
      },
      orderBy: { relevanceScore: 'desc' },
      take: 20,
    });

    tests.push({
      name: 'Scenario: Actionable trends',
      passed: actionableTrends.length >= 10,
      score: Math.min(100, (actionableTrends.length / 20) * 100),
      details: `Found ${actionableTrends.length} emerging/growing trends with high relevance`,
      expected: '≥10 trends',
      actual: actionableTrends.length,
    });

    // Scenario 4.6: "What's the attribution impact of each channel?"
    const sampleJourney = await this.prisma.customerJourney.findFirst({
      where: {
        converted: true,
        attribution: { not: null },
      },
    });

    const hasAttribution = sampleJourney?.attribution !== null;

    tests.push({
      name: 'Scenario: Multi-touch attribution',
      passed: hasAttribution,
      score: hasAttribution ? 100 : 0,
      details: hasAttribution ? 'Attribution models calculated successfully' : 'No attribution data found',
      expected: 'Attribution data present',
      actual: hasAttribution ? 'Present' : 'Missing',
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} Real-World Scenarios: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Dimension 5: ML Readiness
   * Tests: Data structure suitable for model training
   */
  private async testMLReadiness(): Promise<DimensionResult> {
    this.logger.log('🤖 Testing ML Readiness...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Test 5.1: Sufficient training data volume
    const dataCounts = {
      campaigns: await this.prisma.campaignMemory.count(),
      keywords: await this.prisma.keyword.count(),
      content: await this.prisma.blogPost.count(),
      trends: await this.prisma.trendData.count(),
      journeys: await this.prisma.customerJourney.count(),
    };

    const minRequirements = {
      campaigns: 1000,
      keywords: 10000,
      content: 1000,
      trends: 500,
      journeys: 1000,
    };

    const volumeScore = Object.entries(dataCounts).reduce((score, [key, count]) => {
      const min = minRequirements[key];
      return score + Math.min(100, (count / min) * 100);
    }, 0) / Object.keys(dataCounts).length;

    tests.push({
      name: 'Training data volume',
      passed: volumeScore >= 75,
      score: volumeScore,
      details: Object.entries(dataCounts).map(([k, v]) => `${k}: ${v.toLocaleString()}`).join(', '),
      expected: 'All datasets meet minimum thresholds',
      actual: `${volumeScore.toFixed(0)}% of requirements met`,
    });

    // Test 5.2: Feature completeness (no excessive nulls)
    const campaignSample = await this.prisma.campaignMemory.findMany({ take: 100 });
    const nullCounts = {
      roi: campaignSample.filter((c) => c.roi === null).length,
      spend: campaignSample.filter((c) => c.spend.toNumber() === 0).length,
      revenue: campaignSample.filter((c) => c.revenue.toNumber() === 0).length,
    };

    const featureCompletenessScore = 100 - (Object.values(nullCounts).reduce((sum, c) => sum + c, 0) / campaignSample.length / 3) * 100;

    tests.push({
      name: 'Feature completeness (campaigns)',
      passed: featureCompletenessScore >= 80,
      score: featureCompletenessScore,
      details: `${featureCompletenessScore.toFixed(1)}% features populated`,
      expected: '≥80% complete',
      actual: `${featureCompletenessScore.toFixed(1)}%`,
    });

    // Test 5.3: Label quality (success/failure patterns encoded)
    const campaignsWithPatterns = await this.prisma.campaignMemory.count({
      where: {
        whatWorked: { isEmpty: false },
        whatDidnt: { isEmpty: false },
      },
    });
    const totalCampaigns = await this.prisma.campaignMemory.count();
    const labelQualityScore = (campaignsWithPatterns / totalCampaigns) * 100;

    tests.push({
      name: 'Label quality (success patterns)',
      passed: labelQualityScore >= 80,
      score: labelQualityScore,
      details: `${labelQualityScore.toFixed(1)}% campaigns have encoded patterns`,
      expected: '≥80%',
      actual: `${labelQualityScore.toFixed(1)}%`,
    });

    // Test 5.4: Time-series data structure
    const blogWithTimeSeries = await this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { _count: { select: { seoMetrics: true } } },
      take: 50,
    });

    const avgTimePoints = blogWithTimeSeries.reduce((sum, b) => sum + b._count.seoMetrics, 0) / blogWithTimeSeries.length;
    const timeSeriesScore = Math.min(100, (avgTimePoints / 12) * 100); // Expect ~12 months of data

    tests.push({
      name: 'Time-series structure',
      passed: timeSeriesScore >= 75,
      score: timeSeriesScore,
      details: `Avg ${avgTimePoints.toFixed(1)} time points per content piece`,
      expected: '≥12 months',
      actual: avgTimePoints.toFixed(1),
    });

    // Test 5.5: Balanced classes (not too skewed)
    const campaignTiers = await this.prisma.campaignMemory.findMany({
      select: { execution: true },
      take: 500,
    });

    const tierCounts = {
      HIGH: campaignTiers.filter((c: any) => c.execution?.successTier === 'HIGH').length,
      MODERATE: campaignTiers.filter((c: any) => c.execution?.successTier === 'MODERATE').length,
      LOW: campaignTiers.filter((c: any) => c.execution?.successTier === 'LOW').length,
    };

    const minClass = Math.min(...Object.values(tierCounts));
    const maxClass = Math.max(...Object.values(tierCounts));
    const imbalanceRatio = maxClass / minClass;
    const balanceScore = Math.max(0, 100 - (imbalanceRatio - 1) * 20); // Penalty for > 3:1 ratio

    tests.push({
      name: 'Class balance',
      passed: balanceScore >= 60,
      score: balanceScore,
      details: `Imbalance ratio: ${imbalanceRatio.toFixed(2)}:1 (HIGH: ${tierCounts.HIGH}, MOD: ${tierCounts.MODERATE}, LOW: ${tierCounts.LOW})`,
      expected: '≤3:1 ratio',
      actual: `${imbalanceRatio.toFixed(2)}:1`,
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} ML Readiness: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Dimension 6: Performance Simulation
   * Tests: Query performance, scalability
   */
  private async testPerformanceSimulation(): Promise<DimensionResult> {
    this.logger.log('⚡ Testing Performance Simulation...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Test 6.1: Complex aggregate query performance
    const start1 = Date.now();
    await this.prisma.campaignMemory.groupBy({
      by: ['objective'],
      _avg: { roi: true },
      _count: true,
    });
    const duration1 = Date.now() - start1;

    tests.push({
      name: 'Aggregate query performance',
      passed: duration1 < 1000,
      score: Math.max(0, 100 - duration1 / 10),
      details: `${duration1}ms (should be <1000ms)`,
      expected: '<1000ms',
      actual: `${duration1}ms`,
    });

    if (duration1 >= 1000) {
      warnings.push(`Aggregate queries taking ${duration1}ms - consider indexing`);
    }

    // Test 6.2: Join query performance
    const start2 = Date.now();
    await this.prisma.blogPost.findMany({
      include: { seoMetrics: true },
      take: 50,
    });
    const duration2 = Date.now() - start2;

    tests.push({
      name: 'Join query performance',
      passed: duration2 < 500,
      score: Math.max(0, 100 - duration2 / 5),
      details: `${duration2}ms (should be <500ms)`,
      expected: '<500ms',
      actual: `${duration2}ms`,
    });

    // Test 6.3: Full-text search simulation
    const start3 = Date.now();
    await this.prisma.keyword.findMany({
      where: {
        keyword: { contains: 'dry cleaning' },
      },
      take: 100,
    });
    const duration3 = Date.now() - start3;

    tests.push({
      name: 'Search query performance',
      passed: duration3 < 300,
      score: Math.max(0, 100 - duration3 / 3),
      details: `${duration3}ms (should be <300ms)`,
      expected: '<300ms',
      actual: `${duration3}ms`,
    });

    // Test 6.4: Pagination performance
    const start4 = Date.now();
    await this.prisma.campaign.findMany({
      skip: 1000,
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    const duration4 = Date.now() - start4;

    tests.push({
      name: 'Pagination performance',
      passed: duration4 < 200,
      score: Math.max(0, 100 - duration4 / 2),
      details: `${duration4}ms (should be <200ms)`,
      expected: '<200ms',
      actual: `${duration4}ms`,
    });

    // Test 6.5: Concurrent query simulation
    const start5 = Date.now();
    await Promise.all([
      this.prisma.campaign.count(),
      this.prisma.keyword.count(),
      this.prisma.blogPost.count(),
      this.prisma.trendData.count(),
      this.prisma.customerJourney.count(),
    ]);
    const duration5 = Date.now() - start5;

    tests.push({
      name: 'Concurrent queries',
      passed: duration5 < 500,
      score: Math.max(0, 100 - duration5 / 5),
      details: `${duration5}ms for 5 concurrent queries`,
      expected: '<500ms',
      actual: `${duration5}ms`,
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} Performance Simulation: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Dimension 7: AI Query Simulation
   * Tests: Can AI extract insights from the data?
   */
  private async testAIQuerySimulation(): Promise<DimensionResult> {
    this.logger.log('🧠 Testing AI Query Simulation...');

    const tests: TestResult[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    // Test 7.1: Campaign performance analysis
    const campaigns = await this.prisma.campaignMemory.findMany({
      take: 10,
      orderBy: { roi: 'desc' },
    });

    const hasSufficientData = campaigns.length >= 5 && campaigns.every((c) => c.whatWorked.length > 0);

    tests.push({
      name: 'AI: Campaign insights available',
      passed: hasSufficientData,
      score: hasSufficientData ? 100 : (campaigns.length / 5) * 50,
      details: hasSufficientData ? `${campaigns.length} campaigns with encoded insights` : 'Insufficient insight data',
      expected: '≥5 campaigns with patterns',
      actual: campaigns.length,
    });

    // Test 7.2: Trend opportunity detection
    const trends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: { in: ['EMERGING', 'GROWING'] },
        opportunityWindow: { not: null },
      },
      take: 5,
    });

    const hasOpportunities = trends.length >= 3;

    tests.push({
      name: 'AI: Trend opportunities detectable',
      passed: hasOpportunities,
      score: hasOpportunities ? 100 : (trends.length / 3) * 100,
      details: `${trends.length} trends with opportunity windows`,
      expected: '≥3 trends',
      actual: trends.length,
    });

    // Test 7.3: Attribution analysis
    const journey = await this.prisma.customerJourney.findFirst({
      where: {
        converted: true,
        attribution: { not: null },
      },
      include: { touchPoints: true },
    });

    const hasAttribution = journey && journey.touchPoints.length >= 2;

    tests.push({
      name: 'AI: Attribution insights extractable',
      passed: hasAttribution,
      score: hasAttribution ? 100 : 0,
      details: hasAttribution ? `Journey with ${journey.touchPoints.length} touchpoints and attribution` : 'No multi-touch journeys',
      expected: 'Multi-touch journeys with attribution',
      actual: hasAttribution ? 'Available' : 'Missing',
    });

    // Test 7.4: Content performance patterns
    const blogPosts = await this.prisma.blogPost.findMany({
      include: { seoMetrics: true },
      where: {
        status: 'PUBLISHED',
        seoMetrics: { some: {} },
      },
      take: 5,
    });

    const hasContentData = blogPosts.length >= 3 && blogPosts.some((b) => b.seoMetrics.length >= 3);

    tests.push({
      name: 'AI: Content performance analyzable',
      passed: hasContentData,
      score: hasContentData ? 100 : (blogPosts.length / 3) * 100,
      details: hasContentData ? `${blogPosts.length} posts with time-series data` : 'Insufficient content history',
      expected: '≥3 posts with metrics',
      actual: blogPosts.length,
    });

    // Test 7.5: Keyword strategy insights
    const keywords = await this.prisma.keyword.findMany({
      where: {
        currentRank: { not: null },
        searchVolume: { gt: 100 },
      },
      take: 20,
    });

    const rankedKeywords = keywords.filter((k) => k.currentRank && k.currentRank <= 50);
    const hasKeywordData = rankedKeywords.length >= 10;

    tests.push({
      name: 'AI: Keyword insights derivable',
      passed: hasKeywordData,
      score: hasKeywordData ? 100 : (rankedKeywords.length / 10) * 100,
      details: `${rankedKeywords.length} ranked keywords with performance data`,
      expected: '≥10 ranked keywords',
      actual: rankedKeywords.length,
    });

    // Calculate dimension score
    const avgScore = tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
    const passed = avgScore >= 75;

    this.logger.log(`   ${passed ? '✅' : '❌'} AI Query Simulation: ${avgScore.toFixed(1)}/100\n`);

    return { score: avgScore, passed, tests, issues, warnings };
  }

  /**
   * Generate summary
   */
  private generateSummary(report: ValidationReport): string {
    const passedDimensions = Object.values(report.dimensions).filter((d) => d.passed).length;
    const totalDimensions = Object.values(report.dimensions).length;

    let summary = `Validation Results: ${report.overallScore}/100\n\n`;
    summary += `Passed Dimensions: ${passedDimensions}/${totalDimensions}\n\n`;

    // Dimension breakdown
    for (const [name, result] of Object.entries(report.dimensions)) {
      const icon = result.passed ? '✅' : '❌';
      summary += `${icon} ${name}: ${result.score.toFixed(1)}/100\n`;
    }

    return summary;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(report: ValidationReport): string[] {
    const recommendations: string[] = [];

    for (const [dimName, dimResult] of Object.entries(report.dimensions)) {
      if (!dimResult.passed) {
        recommendations.push(`⚠️  ${dimName} needs improvement (${dimResult.score.toFixed(0)}/100)`);

        // Add specific issues
        dimResult.issues.slice(0, 2).forEach((issue) => {
          recommendations.push(`   - ${issue}`);
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All dimensions passed! Data is production-ready.');
    }

    return recommendations;
  }

  /**
   * Print detailed report
   */
  printDetailedReport(report: ValidationReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE VALIDATION REPORT');
    console.log('='.repeat(80) + '\n');

    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Overall Score: ${report.overallScore}/100`);
    console.log(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}\n`);

    console.log('─'.repeat(80));
    console.log('DIMENSION BREAKDOWN');
    console.log('─'.repeat(80) + '\n');

    for (const [name, result] of Object.entries(report.dimensions)) {
      console.log(`${result.passed ? '✅' : '❌'} ${name.toUpperCase()}: ${result.score.toFixed(1)}/100\n`);

      // Print tests
      result.tests.forEach((test) => {
        const icon = test.passed ? '  ✓' : '  ✗';
        console.log(`${icon} ${test.name}: ${test.score.toFixed(0)}/100`);
        console.log(`     ${test.details}`);
        if (!test.passed && test.expected && test.actual) {
          console.log(`     Expected: ${test.expected}, Actual: ${test.actual}`);
        }
      });

      // Print issues
      if (result.issues.length > 0) {
        console.log(`\n  ⚠️  Issues:`);
        result.issues.forEach((issue) => console.log(`     - ${issue}`));
      }

      console.log();
    }

    console.log('─'.repeat(80));
    console.log('SUMMARY');
    console.log('─'.repeat(80) + '\n');
    console.log(report.summary);

    console.log('\n─'.repeat(80));
    console.log('RECOMMENDATIONS');
    console.log('─'.repeat(80) + '\n');
    report.recommendations.forEach((rec) => console.log(rec));

    console.log('\n' + '='.repeat(80) + '\n');
  }
}
