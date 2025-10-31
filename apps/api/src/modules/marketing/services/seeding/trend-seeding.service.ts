import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { TrendLifecycle } from '@dryjets/database';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Trend History Seeding Service
 * Generates realistic trend data across full lifecycle stages
 *
 * Lifecycle Distribution:
 * - EMERGING: 25% (early signals, low volume, high growth potential)
 * - GROWING: 30% (gaining momentum, medium volume, strong growth)
 * - PEAK: 20% (maximum volume, slowing growth)
 * - DECLINING: 15% (past peak, negative growth)
 * - DEAD: 10% (no volume, historical data)
 *
 * Features:
 * - Multi-source trend detection (Google, Twitter, Reddit, TikTok, News, YouTube)
 * - Geographic specificity (global, national, regional, local)
 * - Viral coefficient calculation
 * - Sentiment analysis (-1 to 1)
 * - Opportunity window prediction
 * - Related keywords and top content
 * - Pillar categorization
 */

interface TrendSeed {
  source: string;
  keyword: string;
  volume: number;
  growth: number;
  competition: number;
  geography: {
    level: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
  lifecycle: TrendLifecycle;
  peakPrediction: Date | null;
  opportunityWindow: {
    start: Date;
    end: Date;
    confidence: number;
  } | null;
  viralCoefficient: number | null;
  sentiment: number;
  relevanceScore: number;
  pillar: string[];
  relatedKeywords: string[];
  topContent: Array<{ title: string; url: string; engagement: number }>;
  expiresAt: Date;
  capturedAt: Date;
}

@Injectable()
export class TrendSeedingService {
  private readonly logger = new Logger('TrendSeeding');
  private readonly anthropic: Anthropic;

  // Trend sources
  private readonly SOURCES = ['google', 'twitter', 'reddit', 'tiktok', 'news', 'youtube'];

  // Trend keywords by category
  private readonly DRY_CLEANING_TRENDS = [
    'eco dry cleaning',
    'same day dry cleaning',
    'mobile dry cleaning',
    'subscription dry cleaning',
    'contactless dry cleaning',
    'sustainable garment care',
    'green cleaning solutions',
    'dry cleaning alternatives',
    'at-home dry cleaning',
    'professional garment care',
  ];

  private readonly LAUNDRY_TRENDS = [
    'laundry subscription service',
    'wash and fold app',
    'smart laundry',
    'laundry pickup delivery',
    'commercial laundry automation',
    'eco-friendly detergent',
    'laundry service for hotels',
    'bulk laundry service',
    'laundry locker system',
    'on-demand laundry',
  ];

  private readonly FABRIC_CARE_TRENDS = [
    'sustainable fabric care',
    'luxury garment preservation',
    'stain removal technology',
    'fabric protection spray',
    'delicate fabric cleaning',
    'wedding dress preservation',
    'leather care products',
    'suede cleaning methods',
    'cashmere maintenance',
    'fabric restoration services',
  ];

  private readonly MARKETING_TRENDS = [
    'AI content generation',
    'short-form video marketing',
    'UGC campaigns',
    'influencer partnerships',
    'programmatic SEO',
    'voice search optimization',
    'local SEO strategies',
    'email automation',
    'social commerce',
    'interactive content',
    'sustainability marketing',
    'personalization at scale',
    'video SEO',
    'community-driven marketing',
    'micro-influencers',
  ];

  private readonly CONTENT_PILLARS = [
    'education',
    'inspiration',
    'product_showcase',
    'customer_stories',
    'industry_insights',
    'promotional',
    'community_engagement',
    'thought_leadership',
    'sustainability',
    'innovation',
  ];

  private readonly GEOGRAPHY_LEVELS = ['global', 'national', 'regional', 'local'];

  private readonly CITIES = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Boston', lat: 42.3601, lng: -71.0589 },
    { name: 'Austin', lat: 30.2672, lng: -97.7431 },
  ];

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main seeding method
   */
  async seedTrends(count: number = 2000): Promise<{
    seeded: number;
    emerging: number;
    growing: number;
    peak: number;
    declining: number;
    dead: number;
    bySource: Record<string, number>;
  }> {
    this.logger.log(`Starting trend seeding: ${count} trends...`);

    const distribution = {
      emerging: Math.floor(count * 0.25), // 500
      growing: Math.floor(count * 0.30), // 600
      peak: Math.floor(count * 0.20), // 400
      declining: Math.floor(count * 0.15), // 300
      dead: Math.floor(count * 0.10), // 200
    };

    const stats = {
      seeded: 0,
      emerging: 0,
      growing: 0,
      peak: 0,
      declining: 0,
      dead: 0,
      bySource: {} as Record<string, number>,
    };

    // Generate all trends
    const allTrends: TrendSeed[] = [];

    // EMERGING trends
    this.logger.log('Generating EMERGING trends...');
    const emergingTrends = await this.generateTrendsByLifecycle(TrendLifecycle.EMERGING, distribution.emerging);
    allTrends.push(...emergingTrends);
    stats.emerging = emergingTrends.length;

    // GROWING trends
    this.logger.log('Generating GROWING trends...');
    const growingTrends = await this.generateTrendsByLifecycle(TrendLifecycle.GROWING, distribution.growing);
    allTrends.push(...growingTrends);
    stats.growing = growingTrends.length;

    // PEAK trends
    this.logger.log('Generating PEAK trends...');
    const peakTrends = await this.generateTrendsByLifecycle(TrendLifecycle.PEAK, distribution.peak);
    allTrends.push(...peakTrends);
    stats.peak = peakTrends.length;

    // DECLINING trends
    this.logger.log('Generating DECLINING trends...');
    const decliningTrends = await this.generateTrendsByLifecycle(TrendLifecycle.DECLINING, distribution.declining);
    allTrends.push(...decliningTrends);
    stats.declining = decliningTrends.length;

    // DEAD trends
    this.logger.log('Generating DEAD trends...');
    const deadTrends = await this.generateTrendsByLifecycle(TrendLifecycle.DEAD, distribution.dead);
    allTrends.push(...deadTrends);
    stats.dead = deadTrends.length;

    // Insert all trends
    await this.insertTrendBatch(allTrends);
    stats.seeded = allTrends.length;

    // Count by source
    for (const source of this.SOURCES) {
      stats.bySource[source] = allTrends.filter((t) => t.source === source).length;
    }

    this.logger.log(`✅ Trend seeding complete: ${stats.seeded} total trends`);
    this.logger.log(`   - EMERGING: ${stats.emerging}`);
    this.logger.log(`   - GROWING: ${stats.growing}`);
    this.logger.log(`   - PEAK: ${stats.peak}`);
    this.logger.log(`   - DECLINING: ${stats.declining}`);
    this.logger.log(`   - DEAD: ${stats.dead}`);

    return stats;
  }

  /**
   * Generate trends for a specific lifecycle stage
   */
  private async generateTrendsByLifecycle(lifecycle: TrendLifecycle, count: number): Promise<TrendSeed[]> {
    const trends: TrendSeed[] = [];

    for (let i = 0; i < count; i++) {
      const keyword = this.selectKeyword();
      const source = this.randomElement(this.SOURCES);

      // Volume, growth, and other metrics depend on lifecycle
      const { volume, growth, viralCoefficient } = this.generateMetricsForLifecycle(lifecycle, source);

      // Competition correlates with volume
      const competition = this.calculateCompetition(volume, lifecycle);

      // Geography (higher locality for emerging trends)
      const geography = this.generateGeography(lifecycle);

      // Sentiment (generally positive for growing/peak trends)
      const sentiment = this.generateSentiment(lifecycle);

      // Relevance score (higher for earlier stages)
      const relevanceScore = this.generateRelevanceScore(lifecycle);

      // Pillars
      const pillar = this.selectPillars();

      // Related keywords
      const relatedKeywords = this.generateRelatedKeywords(keyword);

      // Top content
      const topContent = this.generateTopContent(keyword, volume);

      // Timing
      const { capturedAt, expiresAt, peakPrediction, opportunityWindow } = this.generateTiming(lifecycle);

      trends.push({
        source,
        keyword,
        volume,
        growth,
        competition,
        geography,
        lifecycle,
        peakPrediction,
        opportunityWindow,
        viralCoefficient,
        sentiment,
        relevanceScore,
        pillar,
        relatedKeywords,
        topContent,
        expiresAt,
        capturedAt,
      });

      if ((i + 1) % 100 === 0) {
        this.logger.debug(`   Generated ${i + 1} / ${count} ${lifecycle} trends...`);
      }
    }

    return trends;
  }

  /**
   * Generate metrics based on lifecycle stage
   */
  private generateMetricsForLifecycle(
    lifecycle: TrendLifecycle,
    source: string,
  ): {
    volume: number;
    growth: number;
    viralCoefficient: number | null;
  } {
    let volume: number;
    let growth: number;
    let viralCoefficient: number | null;

    // Source multipliers (TikTok trends have higher volume than Reddit)
    const sourceMultipliers = {
      google: 1.5,
      twitter: 1.2,
      reddit: 0.6,
      tiktok: 2.0,
      news: 1.0,
      youtube: 1.3,
    };

    const sourceMultiplier = sourceMultipliers[source] || 1.0;

    switch (lifecycle) {
      case TrendLifecycle.EMERGING:
        volume = Math.floor((100 + Math.random() * 900) * sourceMultiplier); // 100-1K
        growth = 50 + Math.random() * 150; // 50-200% growth
        viralCoefficient = 1.2 + Math.random() * 0.8; // 1.2-2.0 (high viral potential)
        break;

      case TrendLifecycle.GROWING:
        volume = Math.floor((1000 + Math.random() * 9000) * sourceMultiplier); // 1K-10K
        growth = 20 + Math.random() * 80; // 20-100% growth
        viralCoefficient = 1.1 + Math.random() * 0.5; // 1.1-1.6
        break;

      case TrendLifecycle.PEAK:
        volume = Math.floor((10000 + Math.random() * 90000) * sourceMultiplier); // 10K-100K
        growth = -5 + Math.random() * 20; // -5% to 15% growth (slowing)
        viralCoefficient = 0.9 + Math.random() * 0.3; // 0.9-1.2 (plateauing)
        break;

      case TrendLifecycle.DECLINING:
        volume = Math.floor((5000 + Math.random() * 45000) * sourceMultiplier); // 5K-50K
        growth = -50 + Math.random() * 30; // -50% to -20% growth
        viralCoefficient = 0.5 + Math.random() * 0.4; // 0.5-0.9 (declining)
        break;

      case TrendLifecycle.DEAD:
        volume = Math.floor((10 + Math.random() * 490) * sourceMultiplier); // 10-500
        growth = -80 + Math.random() * 30; // -80% to -50% growth
        viralCoefficient = null; // No viral potential
        break;
    }

    return {
      volume,
      growth: Math.round(growth * 100) / 100,
      viralCoefficient: viralCoefficient ? Math.round(viralCoefficient * 100) / 100 : null,
    };
  }

  /**
   * Calculate competition based on volume and lifecycle
   */
  private calculateCompetition(volume: number, lifecycle: TrendLifecycle): number {
    // Higher volume = higher competition
    let baseCompetition: number;

    if (volume > 50000) {
      baseCompetition = 70 + Math.random() * 30; // 70-100
    } else if (volume > 10000) {
      baseCompetition = 50 + Math.random() * 30; // 50-80
    } else if (volume > 1000) {
      baseCompetition = 30 + Math.random() * 30; // 30-60
    } else {
      baseCompetition = 10 + Math.random() * 30; // 10-40
    }

    // Lifecycle adjustment (peak trends have highest competition)
    const lifecycleMultipliers = {
      [TrendLifecycle.EMERGING]: 0.7,
      [TrendLifecycle.GROWING]: 0.9,
      [TrendLifecycle.PEAK]: 1.2,
      [TrendLifecycle.DECLINING]: 0.8,
      [TrendLifecycle.DEAD]: 0.5,
    };

    const competition = baseCompetition * lifecycleMultipliers[lifecycle];

    return Math.max(1, Math.min(100, Math.round(competition)));
  }

  /**
   * Generate geography based on lifecycle
   */
  private generateGeography(lifecycle: TrendLifecycle): {
    level: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  } {
    // Emerging trends tend to be more local, peak trends are more global
    let level: string;

    if (lifecycle === TrendLifecycle.EMERGING || lifecycle === TrendLifecycle.DEAD) {
      // 60% local, 30% regional, 10% national
      const rand = Math.random();
      level = rand < 0.6 ? 'local' : rand < 0.9 ? 'regional' : 'national';
    } else if (lifecycle === TrendLifecycle.GROWING) {
      // 30% local, 40% regional, 30% national
      const rand = Math.random();
      level = rand < 0.3 ? 'local' : rand < 0.7 ? 'regional' : 'national';
    } else {
      // PEAK: 10% local, 30% regional, 40% national, 20% global
      const rand = Math.random();
      level = rand < 0.1 ? 'local' : rand < 0.4 ? 'regional' : rand < 0.8 ? 'national' : 'global';
    }

    let location: string;
    let coordinates: { lat: number; lng: number } | undefined;

    if (level === 'local') {
      const city = this.randomElement(this.CITIES);
      location = city.name;
      coordinates = { lat: city.lat, lng: city.lng };
    } else if (level === 'regional') {
      location = this.randomElement(['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast']);
    } else if (level === 'national') {
      location = 'USA';
    } else {
      location = 'Global';
    }

    return { level, location, coordinates };
  }

  /**
   * Generate sentiment (-1 to 1)
   */
  private generateSentiment(lifecycle: TrendLifecycle): number {
    let baseSentiment: number;

    switch (lifecycle) {
      case TrendLifecycle.EMERGING:
        baseSentiment = 0.3 + Math.random() * 0.5; // 0.3 to 0.8 (positive)
        break;
      case TrendLifecycle.GROWING:
        baseSentiment = 0.5 + Math.random() * 0.4; // 0.5 to 0.9 (very positive)
        break;
      case TrendLifecycle.PEAK:
        baseSentiment = 0.4 + Math.random() * 0.4; // 0.4 to 0.8 (positive)
        break;
      case TrendLifecycle.DECLINING:
        baseSentiment = -0.2 + Math.random() * 0.6; // -0.2 to 0.4 (mixed)
        break;
      case TrendLifecycle.DEAD:
        baseSentiment = -0.5 + Math.random() * 0.5; // -0.5 to 0 (negative)
        break;
    }

    return Math.round(baseSentiment * 100) / 100;
  }

  /**
   * Generate relevance score (0-100)
   */
  private generateRelevanceScore(lifecycle: TrendLifecycle): number {
    let baseScore: number;

    switch (lifecycle) {
      case TrendLifecycle.EMERGING:
        baseScore = 70 + Math.random() * 30; // 70-100 (high opportunity)
        break;
      case TrendLifecycle.GROWING:
        baseScore = 80 + Math.random() * 20; // 80-100 (highest relevance)
        break;
      case TrendLifecycle.PEAK:
        baseScore = 60 + Math.random() * 30; // 60-90
        break;
      case TrendLifecycle.DECLINING:
        baseScore = 30 + Math.random() * 40; // 30-70
        break;
      case TrendLifecycle.DEAD:
        baseScore = 10 + Math.random() * 30; // 10-40
        break;
    }

    return Math.round(baseScore);
  }

  /**
   * Generate timing data
   */
  private generateTiming(lifecycle: TrendLifecycle): {
    capturedAt: Date;
    expiresAt: Date;
    peakPrediction: Date | null;
    opportunityWindow: { start: Date; end: Date; confidence: number } | null;
  } {
    const now = new Date();
    let capturedAt: Date;
    let expiresAt: Date;
    let peakPrediction: Date | null = null;
    let opportunityWindow: { start: Date; end: Date; confidence: number } | null = null;

    switch (lifecycle) {
      case TrendLifecycle.EMERGING:
        // Captured 1-7 days ago
        capturedAt = new Date(now.getTime() - (1 + Math.random() * 6) * 24 * 60 * 60 * 1000);
        // Expires in 30-90 days
        expiresAt = new Date(now.getTime() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000);
        // Peak predicted in 14-60 days
        peakPrediction = new Date(now.getTime() + (14 + Math.random() * 46) * 24 * 60 * 60 * 1000);
        // Opportunity window: now to peak
        opportunityWindow = {
          start: now,
          end: peakPrediction,
          confidence: 70 + Math.random() * 20, // 70-90% confidence
        };
        break;

      case TrendLifecycle.GROWING:
        // Captured 7-30 days ago
        capturedAt = new Date(now.getTime() - (7 + Math.random() * 23) * 24 * 60 * 60 * 1000);
        // Expires in 60-120 days
        expiresAt = new Date(now.getTime() + (60 + Math.random() * 60) * 24 * 60 * 60 * 1000);
        // Peak predicted in 7-30 days
        peakPrediction = new Date(now.getTime() + (7 + Math.random() * 23) * 24 * 60 * 60 * 1000);
        // Opportunity window: now to peak
        opportunityWindow = {
          start: now,
          end: peakPrediction,
          confidence: 80 + Math.random() * 15, // 80-95% confidence
        };
        break;

      case TrendLifecycle.PEAK:
        // Captured 30-60 days ago
        capturedAt = new Date(now.getTime() - (30 + Math.random() * 30) * 24 * 60 * 60 * 1000);
        // Expires in 14-45 days
        expiresAt = new Date(now.getTime() + (14 + Math.random() * 31) * 24 * 60 * 60 * 1000);
        // Already at peak
        peakPrediction = now;
        // Opportunity window: very short (3-14 days left)
        opportunityWindow = {
          start: now,
          end: new Date(now.getTime() + (3 + Math.random() * 11) * 24 * 60 * 60 * 1000),
          confidence: 60 + Math.random() * 30, // 60-90% confidence
        };
        break;

      case TrendLifecycle.DECLINING:
        // Captured 60-180 days ago
        capturedAt = new Date(now.getTime() - (60 + Math.random() * 120) * 24 * 60 * 60 * 1000);
        // Expires in 7-30 days
        expiresAt = new Date(now.getTime() + (7 + Math.random() * 23) * 24 * 60 * 60 * 1000);
        // Peak was in the past
        peakPrediction = new Date(now.getTime() - (14 + Math.random() * 46) * 24 * 60 * 60 * 1000);
        // No opportunity window (past peak)
        opportunityWindow = null;
        break;

      case TrendLifecycle.DEAD:
        // Captured 180-365 days ago
        capturedAt = new Date(now.getTime() - (180 + Math.random() * 185) * 24 * 60 * 60 * 1000);
        // Expired already or expires soon
        expiresAt = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        // Peak was long ago
        peakPrediction = new Date(now.getTime() - (90 + Math.random() * 180) * 24 * 60 * 60 * 1000);
        // No opportunity
        opportunityWindow = null;
        break;
    }

    return { capturedAt, expiresAt, peakPrediction, opportunityWindow };
  }

  /**
   * Select a keyword
   */
  private selectKeyword(): string {
    const allKeywords = [
      ...this.DRY_CLEANING_TRENDS,
      ...this.LAUNDRY_TRENDS,
      ...this.FABRIC_CARE_TRENDS,
      ...this.MARKETING_TRENDS,
    ];

    return this.randomElement(allKeywords);
  }

  /**
   * Select content pillars
   */
  private selectPillars(): string[] {
    const count = 1 + Math.floor(Math.random() * 2); // 1-2 pillars
    const shuffled = [...this.CONTENT_PILLARS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Generate related keywords
   */
  private generateRelatedKeywords(keyword: string): string[] {
    const words = keyword.split(' ');
    const related: string[] = [];

    // Add variations
    related.push(`${keyword} service`);
    related.push(`${keyword} near me`);
    related.push(`best ${keyword}`);
    related.push(`${keyword} cost`);

    // Add word combinations
    if (words.length > 1) {
      related.push(words[0]);
      related.push(words[words.length - 1]);
    }

    return related.slice(0, 5);
  }

  /**
   * Generate top content examples
   */
  private generateTopContent(
    keyword: string,
    volume: number,
  ): Array<{ title: string; url: string; engagement: number }> {
    const count = Math.min(5, Math.max(1, Math.floor(volume / 5000))); // More content for higher volume
    const content: Array<{ title: string; url: string; engagement: number }> = [];

    for (let i = 0; i < count; i++) {
      content.push({
        title: `Ultimate Guide to ${keyword}`,
        url: `https://example.com/${keyword.replace(/\s+/g, '-').toLowerCase()}-${i + 1}`,
        engagement: Math.floor(100 + Math.random() * (volume / 10)),
      });
    }

    return content;
  }

  /**
   * Insert trends into database
   */
  private async insertTrendBatch(trends: TrendSeed[]): Promise<void> {
    const batchSize = 100;
    const batches = Math.ceil(trends.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = trends.slice(i * batchSize, (i + 1) * batchSize);

      for (const trend of batch) {
        await this.prisma.trendData.create({
          data: {
            source: trend.source,
            keyword: trend.keyword,
            volume: trend.volume,
            growth: trend.growth,
            competition: trend.competition,
            geography: trend.geography,
            lifecycle: trend.lifecycle,
            peakPrediction: trend.peakPrediction,
            opportunityWindow: trend.opportunityWindow,
            viralCoefficient: trend.viralCoefficient,
            sentiment: trend.sentiment,
            relevanceScore: trend.relevanceScore,
            pillar: trend.pillar,
            relatedKeywords: trend.relatedKeywords,
            topContent: trend.topContent,
            expiresAt: trend.expiresAt,
            capturedAt: trend.capturedAt,
          },
        });
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${trends.length} trends...`);
      }
    }
  }

  /**
   * Get seeding summary
   */
  async getSeedingSummary(): Promise<{
    totalTrends: number;
    byLifecycle: Record<string, number>;
    bySource: Record<string, number>;
    avgVolume: number;
    avgGrowth: number;
    avgRelevanceScore: number;
  }> {
    const total = await this.prisma.trendData.count();

    const byLifecycle = await this.prisma.trendData.groupBy({
      by: ['lifecycle'],
      _count: true,
    });

    const bySource = await this.prisma.trendData.groupBy({
      by: ['source'],
      _count: true,
    });

    const aggregates = await this.prisma.trendData.aggregate({
      _avg: {
        volume: true,
        growth: true,
        relevanceScore: true,
      },
    });

    return {
      totalTrends: total,
      byLifecycle: Object.fromEntries(byLifecycle.map((l) => [l.lifecycle, l._count])),
      bySource: Object.fromEntries(bySource.map((s) => [s.source, s._count])),
      avgVolume: Math.round(aggregates._avg.volume || 0),
      avgGrowth: Math.round((aggregates._avg.growth?.toNumber() || 0) * 100) / 100,
      avgRelevanceScore: Math.round(aggregates._avg.relevanceScore || 0),
    };
  }

  /**
   * Clear all trends
   */
  async clearTrends(): Promise<number> {
    const count = await this.prisma.trendData.count();
    await this.prisma.trendData.deleteMany({});
    this.logger.log(`Cleared ${count} trends`);
    return count;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
