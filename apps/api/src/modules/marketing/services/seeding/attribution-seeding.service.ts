import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Attribution Data Seeding Service
 * Generates realistic customer journeys with multi-touch attribution
 *
 * Journey Types:
 * - Short journey: 1-3 touchpoints (30%)
 * - Medium journey: 4-7 touchpoints (50%)
 * - Long journey: 8-15 touchpoints (20%)
 *
 * Conversion Rate: 25% (realistic for SaaS/service businesses)
 *
 * Attribution Models:
 * 1. First Touch: 100% credit to first interaction
 * 2. Last Touch: 100% credit to last interaction before conversion
 * 3. Linear: Equal credit to all touchpoints
 * 4. Time Decay: More credit to recent touchpoints
 * 5. Position-Based (U-shaped): 40% first, 40% last, 20% middle
 * 6. Data-Driven: ML-based attribution (simulated)
 *
 * Realistic Channel Sequences:
 * - Awareness: Organic Search, Social, Display Ads
 * - Consideration: Paid Search, Email, Content Marketing
 * - Conversion: Direct, Email, Retargeting
 */

interface TouchPointSeed {
  timestamp: Date;
  channel: string;
  source: string;
  medium: string;
  campaign: string | null;
  content: string | null;
  url: string;
  pageTitle: string;
  eventType: string;
  value: number;
}

interface CustomerJourneySeed {
  userId: string;
  sessionId: string;
  converted: boolean;
  conversionDate: Date | null;
  conversionValue: number | null;
  conversionType: string | null;
  touchPoints: TouchPointSeed[];
  attribution: {
    firstTouch: Record<string, number>;
    lastTouch: Record<string, number>;
    linear: Record<string, number>;
    timeDecay: Record<string, number>;
    positionBased: Record<string, number>;
    dataDriven: Record<string, number>;
  };
  createdAt: Date;
}

@Injectable()
export class AttributionSeedingService {
  private readonly logger = new Logger('AttributionSeeding');
  private readonly anthropic: Anthropic;

  // Marketing channels
  private readonly CHANNELS = [
    { channel: 'organic_search', source: 'google', medium: 'organic', weight: 0.25 },
    { channel: 'paid_search', source: 'google', medium: 'cpc', weight: 0.15 },
    { channel: 'social_organic', source: 'facebook', medium: 'social', weight: 0.12 },
    { channel: 'social_paid', source: 'facebook', medium: 'paid-social', weight: 0.10 },
    { channel: 'email', source: 'newsletter', medium: 'email', weight: 0.15 },
    { channel: 'direct', source: 'direct', medium: 'none', weight: 0.10 },
    { channel: 'referral', source: 'partner', medium: 'referral', weight: 0.05 },
    { channel: 'display', source: 'google', medium: 'display', weight: 0.05 },
    { channel: 'video', source: 'youtube', medium: 'video', weight: 0.03 },
  ];

  // Campaign names
  private readonly CAMPAIGNS = [
    'spring_promo',
    'dry_cleaning_service',
    'laundry_subscription',
    'brand_awareness',
    'retargeting',
    'remarketing',
    'new_customer',
    'seasonal_offer',
    'eco_friendly',
    'same_day_service',
  ];

  // Content types
  private readonly CONTENT_TYPES = [
    'blog_post',
    'video',
    'infographic',
    'case_study',
    'landing_page',
    'product_page',
    'pricing_page',
    'comparison',
    'guide',
    'webinar',
  ];

  // Page URLs
  private readonly PAGES = [
    { url: '/', title: 'Home - Professional Dry Cleaning & Laundry Service' },
    { url: '/services', title: 'Our Services - Dry Cleaning, Laundry & More' },
    { url: '/pricing', title: 'Pricing - Transparent & Affordable' },
    { url: '/about', title: 'About Us - Your Trusted Cleaning Partner' },
    { url: '/blog', title: 'Blog - Fabric Care Tips & Industry Insights' },
    { url: '/contact', title: 'Contact Us - Get Started Today' },
    { url: '/signup', title: 'Sign Up - Create Your Account' },
    { url: '/book', title: 'Book Now - Schedule Your Service' },
    { url: '/eco-cleaning', title: 'Eco-Friendly Cleaning - Sustainable Solutions' },
    { url: '/subscription', title: 'Subscription Plans - Save More' },
  ];

  // Event types
  private readonly EVENT_TYPES = ['page_view', 'click', 'scroll', 'form_submit', 'video_view', 'download'];

  // Conversion types
  private readonly CONVERSION_TYPES = ['signup', 'purchase', 'trial', 'subscription', 'booking', 'quote_request'];

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main seeding method
   */
  async seedJourneys(count: number = 3000): Promise<{
    seeded: number;
    converted: number;
    notConverted: number;
    shortJourneys: number;
    mediumJourneys: number;
    longJourneys: number;
    avgTouchPoints: number;
    avgJourneyDuration: number;
    topChannels: Record<string, number>;
  }> {
    this.logger.log(`Starting attribution seeding: ${count} customer journeys...`);

    const stats = {
      seeded: 0,
      converted: 0,
      notConverted: 0,
      shortJourneys: 0,
      mediumJourneys: 0,
      longJourneys: 0,
      avgTouchPoints: 0,
      avgJourneyDuration: 0,
      topChannels: {} as Record<string, number>,
    };

    const journeys: CustomerJourneySeed[] = [];

    for (let i = 0; i < count; i++) {
      const journey = this.generateJourney(i);
      journeys.push(journey);

      // Update stats
      if (journey.converted) {
        stats.converted++;
      } else {
        stats.notConverted++;
      }

      const touchPointCount = journey.touchPoints.length;
      if (touchPointCount <= 3) {
        stats.shortJourneys++;
      } else if (touchPointCount <= 7) {
        stats.mediumJourneys++;
      } else {
        stats.longJourneys++;
      }

      // Count channels
      for (const tp of journey.touchPoints) {
        stats.topChannels[tp.channel] = (stats.topChannels[tp.channel] || 0) + 1;
      }

      if ((i + 1) % 500 === 0) {
        this.logger.debug(`   Generated ${i + 1} / ${count} journeys...`);
      }
    }

    // Calculate averages
    const totalTouchPoints = journeys.reduce((sum, j) => sum + j.touchPoints.length, 0);
    stats.avgTouchPoints = Math.round((totalTouchPoints / count) * 10) / 10;

    const totalDuration = journeys.reduce((sum, j) => {
      const firstTouch = j.touchPoints[0].timestamp.getTime();
      const lastTouch = j.touchPoints[j.touchPoints.length - 1].timestamp.getTime();
      return sum + (lastTouch - firstTouch);
    }, 0);
    stats.avgJourneyDuration = Math.round(totalDuration / count / (24 * 60 * 60 * 1000)); // Days

    // Insert journeys
    this.logger.log('Inserting customer journeys into database...');
    await this.insertJourneyBatch(journeys);
    stats.seeded = journeys.length;

    this.logger.log(`✅ Attribution seeding complete: ${stats.seeded} journeys`);
    this.logger.log(`   - Converted: ${stats.converted} (${Math.round((stats.converted / stats.seeded) * 100)}%)`);
    this.logger.log(`   - Not Converted: ${stats.notConverted}`);
    this.logger.log(`   - Avg Touchpoints: ${stats.avgTouchPoints}`);
    this.logger.log(`   - Avg Journey Duration: ${stats.avgJourneyDuration} days`);

    return stats;
  }

  /**
   * Generate a single customer journey
   */
  private generateJourney(index: number): CustomerJourneySeed {
    const userId = `user_${index + 1}`;
    const sessionId = `session_${index + 1}`;

    // Determine if this journey converts (25% conversion rate)
    const converted = Math.random() < 0.25;

    // Determine journey length
    // Short: 1-3 touchpoints (30%), Medium: 4-7 (50%), Long: 8-15 (20%)
    const rand = Math.random();
    let touchPointCount: number;
    if (rand < 0.3) {
      touchPointCount = 1 + Math.floor(Math.random() * 3); // 1-3
    } else if (rand < 0.8) {
      touchPointCount = 4 + Math.floor(Math.random() * 4); // 4-7
    } else {
      touchPointCount = 8 + Math.floor(Math.random() * 8); // 8-15
    }

    // Generate touchpoints
    const touchPoints = this.generateTouchPoints(touchPointCount, converted);

    // Journey dates
    const createdAt = touchPoints[0].timestamp;
    const conversionDate = converted ? touchPoints[touchPoints.length - 1].timestamp : null;

    // Conversion details
    const conversionValue = converted ? this.generateConversionValue() : null;
    const conversionType = converted ? this.randomElement(this.CONVERSION_TYPES) : null;

    // Calculate attribution
    const attribution = this.calculateAttribution(touchPoints, conversionValue || 0);

    return {
      userId,
      sessionId,
      converted,
      conversionDate,
      conversionValue,
      conversionType,
      touchPoints,
      attribution,
      createdAt,
    };
  }

  /**
   * Generate touchpoints for a journey
   */
  private generateTouchPoints(count: number, converted: boolean): TouchPointSeed[] {
    const touchPoints: TouchPointSeed[] = [];
    const now = new Date();

    // Journey duration: 1-30 days for short, 7-60 days for medium, 30-180 days for long
    let journeyDurationDays: number;
    if (count <= 3) {
      journeyDurationDays = 1 + Math.random() * 29; // 1-30 days
    } else if (count <= 7) {
      journeyDurationDays = 7 + Math.random() * 53; // 7-60 days
    } else {
      journeyDurationDays = 30 + Math.random() * 150; // 30-180 days
    }

    // First touchpoint: awareness stage (organic search, social, display)
    const firstChannel = this.selectChannel('awareness');
    const firstTimestamp = new Date(now.getTime() - journeyDurationDays * 24 * 60 * 60 * 1000);

    touchPoints.push({
      timestamp: firstTimestamp,
      channel: firstChannel.channel,
      source: firstChannel.source,
      medium: firstChannel.medium,
      campaign: Math.random() < 0.7 ? this.randomElement(this.CAMPAIGNS) : null,
      content: Math.random() < 0.5 ? this.randomElement(this.CONTENT_TYPES) : null,
      url: this.randomElement(this.PAGES).url,
      pageTitle: this.randomElement(this.PAGES).title,
      eventType: 'page_view',
      value: 0,
    });

    // Middle touchpoints: mix of channels
    for (let i = 1; i < count - 1; i++) {
      const stage = i < count / 2 ? 'consideration' : 'conversion';
      const channel = this.selectChannel(stage);

      // Time between touchpoints
      const timeSinceFirst = (journeyDurationDays * i) / count;
      const timestamp = new Date(firstTimestamp.getTime() + timeSinceFirst * 24 * 60 * 60 * 1000);

      touchPoints.push({
        timestamp,
        channel: channel.channel,
        source: channel.source,
        medium: channel.medium,
        campaign: Math.random() < 0.7 ? this.randomElement(this.CAMPAIGNS) : null,
        content: Math.random() < 0.5 ? this.randomElement(this.CONTENT_TYPES) : null,
        url: this.randomElement(this.PAGES).url,
        pageTitle: this.randomElement(this.PAGES).title,
        eventType: this.randomElement(this.EVENT_TYPES),
        value: 0,
      });
    }

    // Last touchpoint
    if (count > 1) {
      const lastChannel = converted ? this.selectChannel('conversion') : this.selectChannel('consideration');
      const lastTimestamp = new Date(firstTimestamp.getTime() + journeyDurationDays * 24 * 60 * 60 * 1000);

      touchPoints.push({
        timestamp: lastTimestamp,
        channel: lastChannel.channel,
        source: lastChannel.source,
        medium: lastChannel.medium,
        campaign: Math.random() < 0.7 ? this.randomElement(this.CAMPAIGNS) : null,
        content: Math.random() < 0.5 ? this.randomElement(this.CONTENT_TYPES) : null,
        url: converted ? '/signup' : this.randomElement(this.PAGES).url,
        pageTitle: converted ? 'Sign Up - Create Your Account' : this.randomElement(this.PAGES).title,
        eventType: converted ? 'form_submit' : this.randomElement(this.EVENT_TYPES),
        value: 0,
      });
    }

    return touchPoints;
  }

  /**
   * Select channel based on funnel stage
   */
  private selectChannel(stage: 'awareness' | 'consideration' | 'conversion'): {
    channel: string;
    source: string;
    medium: string;
  } {
    let weightedChannels: Array<{ channel: string; source: string; medium: string; weight: number }>;

    if (stage === 'awareness') {
      // Awareness: organic search, social, display
      weightedChannels = [
        { channel: 'organic_search', source: 'google', medium: 'organic', weight: 0.5 },
        { channel: 'social_organic', source: 'facebook', medium: 'social', weight: 0.3 },
        { channel: 'display', source: 'google', medium: 'display', weight: 0.15 },
        { channel: 'video', source: 'youtube', medium: 'video', weight: 0.05 },
      ];
    } else if (stage === 'consideration') {
      // Consideration: paid search, email, content
      weightedChannels = [
        { channel: 'paid_search', source: 'google', medium: 'cpc', weight: 0.35 },
        { channel: 'email', source: 'newsletter', medium: 'email', weight: 0.25 },
        { channel: 'organic_search', source: 'google', medium: 'organic', weight: 0.20 },
        { channel: 'social_paid', source: 'facebook', medium: 'paid-social', weight: 0.15 },
        { channel: 'referral', source: 'partner', medium: 'referral', weight: 0.05 },
      ];
    } else {
      // Conversion: direct, email, retargeting
      weightedChannels = [
        { channel: 'direct', source: 'direct', medium: 'none', weight: 0.40 },
        { channel: 'email', source: 'newsletter', medium: 'email', weight: 0.30 },
        { channel: 'paid_search', source: 'google', medium: 'cpc', weight: 0.20 },
        { channel: 'social_paid', source: 'facebook', medium: 'paid-social', weight: 0.10 },
      ];
    }

    // Weighted random selection
    const totalWeight = weightedChannels.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;

    for (const channel of weightedChannels) {
      random -= channel.weight;
      if (random <= 0) {
        return channel;
      }
    }

    return weightedChannels[0];
  }

  /**
   * Generate conversion value
   */
  private generateConversionValue(): number {
    // Average order value: $50-500
    const aov = 50 + Math.random() * 450;
    return Math.round(aov * 100) / 100;
  }

  /**
   * Calculate attribution across all models
   */
  private calculateAttribution(
    touchPoints: TouchPointSeed[],
    totalValue: number,
  ): {
    firstTouch: Record<string, number>;
    lastTouch: Record<string, number>;
    linear: Record<string, number>;
    timeDecay: Record<string, number>;
    positionBased: Record<string, number>;
    dataDriven: Record<string, number>;
  } {
    const firstTouch: Record<string, number> = {};
    const lastTouch: Record<string, number> = {};
    const linear: Record<string, number> = {};
    const timeDecay: Record<string, number> = {};
    const positionBased: Record<string, number> = {};
    const dataDriven: Record<string, number> = {};

    // 1. First Touch: 100% to first touchpoint
    const firstChannel = touchPoints[0].channel;
    firstTouch[firstChannel] = totalValue;

    // 2. Last Touch: 100% to last touchpoint
    const lastChannel = touchPoints[touchPoints.length - 1].channel;
    lastTouch[lastChannel] = totalValue;

    // 3. Linear: Equal credit to all touchpoints
    const linearCredit = totalValue / touchPoints.length;
    for (const tp of touchPoints) {
      linear[tp.channel] = (linear[tp.channel] || 0) + linearCredit;
    }

    // 4. Time Decay: More credit to recent touchpoints (exponential decay)
    const halfLife = 7; // 7 days half-life
    const firstTimestamp = touchPoints[0].timestamp.getTime();
    const lastTimestamp = touchPoints[touchPoints.length - 1].timestamp.getTime();
    const totalDuration = lastTimestamp - firstTimestamp;

    let totalDecayWeight = 0;
    const decayWeights: number[] = [];

    for (const tp of touchPoints) {
      const timeSinceFirst = tp.timestamp.getTime() - firstTimestamp;
      const daysFromStart = timeSinceFirst / (24 * 60 * 60 * 1000);
      const daysUntilConversion = (totalDuration - timeSinceFirst) / (24 * 60 * 60 * 1000);

      // Weight increases as we get closer to conversion
      const weight = Math.pow(2, daysUntilConversion / halfLife);
      decayWeights.push(weight);
      totalDecayWeight += weight;
    }

    for (let i = 0; i < touchPoints.length; i++) {
      const credit = (decayWeights[i] / totalDecayWeight) * totalValue;
      const channel = touchPoints[i].channel;
      timeDecay[channel] = (timeDecay[channel] || 0) + credit;
    }

    // 5. Position-Based (U-shaped): 40% first, 40% last, 20% middle
    if (touchPoints.length === 1) {
      positionBased[touchPoints[0].channel] = totalValue;
    } else if (touchPoints.length === 2) {
      positionBased[touchPoints[0].channel] = totalValue * 0.5;
      positionBased[touchPoints[1].channel] = totalValue * 0.5;
    } else {
      // 40% to first
      positionBased[firstChannel] = (positionBased[firstChannel] || 0) + totalValue * 0.4;

      // 40% to last
      positionBased[lastChannel] = (positionBased[lastChannel] || 0) + totalValue * 0.4;

      // 20% divided among middle touchpoints
      const middleCredit = (totalValue * 0.2) / (touchPoints.length - 2);
      for (let i = 1; i < touchPoints.length - 1; i++) {
        const channel = touchPoints[i].channel;
        positionBased[channel] = (positionBased[channel] || 0) + middleCredit;
      }
    }

    // 6. Data-Driven: Simulated ML-based attribution
    // Weight based on channel conversion rates and position
    const channelConversionRates = {
      direct: 0.35,
      email: 0.30,
      paid_search: 0.25,
      organic_search: 0.20,
      social_paid: 0.15,
      social_organic: 0.10,
      referral: 0.12,
      display: 0.08,
      video: 0.06,
    };

    let totalDataDrivenWeight = 0;
    const dataDrivenWeights: number[] = [];

    for (let i = 0; i < touchPoints.length; i++) {
      const tp = touchPoints[i];
      const conversionRate = channelConversionRates[tp.channel] || 0.1;
      const positionWeight = i === 0 ? 1.5 : i === touchPoints.length - 1 ? 2.0 : 1.0; // Boost first and last
      const weight = conversionRate * positionWeight;
      dataDrivenWeights.push(weight);
      totalDataDrivenWeight += weight;
    }

    for (let i = 0; i < touchPoints.length; i++) {
      const credit = (dataDrivenWeights[i] / totalDataDrivenWeight) * totalValue;
      const channel = touchPoints[i].channel;
      dataDriven[channel] = (dataDriven[channel] || 0) + credit;
    }

    // Round all values to 2 decimals
    const roundValues = (obj: Record<string, number>) => {
      const rounded: Record<string, number> = {};
      for (const [key, value] of Object.entries(obj)) {
        rounded[key] = Math.round(value * 100) / 100;
      }
      return rounded;
    };

    return {
      firstTouch: roundValues(firstTouch),
      lastTouch: roundValues(lastTouch),
      linear: roundValues(linear),
      timeDecay: roundValues(timeDecay),
      positionBased: roundValues(positionBased),
      dataDriven: roundValues(dataDriven),
    };
  }

  /**
   * Insert journeys into database
   */
  private async insertJourneyBatch(journeys: CustomerJourneySeed[]): Promise<void> {
    const batchSize = 100;
    const batches = Math.ceil(journeys.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = journeys.slice(i * batchSize, (i + 1) * batchSize);

      for (const journey of batch) {
        // Create journey
        const createdJourney = await this.prisma.customerJourney.create({
          data: {
            userId: journey.userId,
            sessionId: journey.sessionId,
            converted: journey.converted,
            conversionDate: journey.conversionDate,
            conversionValue: journey.conversionValue,
            conversionType: journey.conversionType,
            attribution: journey.attribution,
            createdAt: journey.createdAt,
          },
        });

        // Create touchpoints
        for (const tp of journey.touchPoints) {
          await this.prisma.touchPoint.create({
            data: {
              journeyId: createdJourney.id,
              timestamp: tp.timestamp,
              channel: tp.channel,
              source: tp.source,
              medium: tp.medium,
              campaign: tp.campaign,
              content: tp.content,
              url: tp.url,
              pageTitle: tp.pageTitle,
              eventType: tp.eventType,
              value: tp.value,
            },
          });
        }
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${journeys.length} journeys...`);
      }
    }
  }

  /**
   * Get seeding summary
   */
  async getSeedingSummary(): Promise<{
    totalJourneys: number;
    convertedJourneys: number;
    conversionRate: number;
    avgTouchPoints: number;
    totalRevenue: number;
    avgRevenuePerConversion: number;
    topChannels: Record<string, number>;
  }> {
    const total = await this.prisma.customerJourney.count();
    const converted = await this.prisma.customerJourney.count({ where: { converted: true } });

    const touchPointsAgg = await this.prisma.customerJourney.findMany({
      include: { _count: { select: { touchPoints: true } } },
    });

    const avgTouchPoints =
      touchPointsAgg.reduce((sum, j) => sum + j._count.touchPoints, 0) / touchPointsAgg.length;

    const revenueAgg = await this.prisma.customerJourney.aggregate({
      where: { converted: true },
      _sum: { conversionValue: true },
      _avg: { conversionValue: true },
    });

    const channelCounts = await this.prisma.touchPoint.groupBy({
      by: ['channel'],
      _count: true,
    });

    return {
      totalJourneys: total,
      convertedJourneys: converted,
      conversionRate: Math.round((converted / total) * 10000) / 100,
      avgTouchPoints: Math.round(avgTouchPoints * 10) / 10,
      totalRevenue: Math.round((revenueAgg._sum.conversionValue?.toNumber() || 0) * 100) / 100,
      avgRevenuePerConversion: Math.round((revenueAgg._avg.conversionValue?.toNumber() || 0) * 100) / 100,
      topChannels: Object.fromEntries(
        channelCounts
          .map((c) => [c.channel, c._count] as [string, number])
          .sort((a, b) => b[1] - a[1])
      ),
    };
  }

  /**
   * Clear all journeys
   */
  async clearJourneys(): Promise<number> {
    const count = await this.prisma.customerJourney.count();
    await this.prisma.customerJourney.deleteMany({});
    this.logger.log(`Cleared ${count} customer journeys`);
    return count;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
