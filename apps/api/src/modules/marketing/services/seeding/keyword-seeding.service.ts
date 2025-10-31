import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { KeywordIntent } from '@dryjets/database';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Keyword Universe Seeding Service
 * Generates 50,000 realistic keywords with 3-year ranking history
 *
 * Distribution:
 * - Dry Cleaning: 15,000 keywords (30%)
 * - Laundry: 12,000 keywords (24%)
 * - Stain Removal: 8,000 keywords (16%)
 * - Fabric Care: 7,000 keywords (14%)
 * - Generic Marketing: 8,000 keywords (16%)
 *
 * Features:
 * - Power law distribution for search volumes
 * - Realistic difficulty scores (0-100)
 * - CPC data based on commercial intent
 * - Intent classification (INFORMATIONAL, COMMERCIAL, TRANSACTIONAL, NAVIGATIONAL)
 * - Category hierarchy (primary, secondary, tertiary, ultra-long-tail)
 * - Parent/child keyword relationships
 * - 3-year ranking simulation (currentRank, previousRank, bestRank)
 */

interface KeywordSeed {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number | null;
  intent: KeywordIntent;
  category: 'primary' | 'secondary' | 'tertiary' | 'ultra-long-tail';
  parentKeyword?: string;
  currentRank: number | null;
  previousRank: number | null;
  bestRank: number | null;
  featuredSnippet: boolean;
}

@Injectable()
export class KeywordSeedingService {
  private readonly logger = new Logger('KeywordSeeding');
  private readonly anthropic: Anthropic;

  // Keyword templates by category
  private readonly DRY_CLEANING_BASE = [
    'dry cleaning',
    'dry cleaner',
    'dry cleaning service',
    'dry cleaning near me',
    'professional dry cleaning',
    'eco dry cleaning',
    'same day dry cleaning',
    'express dry cleaning',
    'luxury dry cleaning',
    'dry cleaning pickup',
    'dry cleaning delivery',
    'green dry cleaning',
    'organic dry cleaning',
    'dry clean only',
    'dry cleaning cost',
    'dry cleaning price',
    'best dry cleaner',
    'dry cleaning alterations',
    'wedding dress dry cleaning',
    'suit dry cleaning',
  ];

  private readonly LAUNDRY_BASE = [
    'laundry service',
    'laundromat',
    'wash and fold',
    'laundry pickup',
    'laundry delivery',
    'commercial laundry',
    'laundry near me',
    'same day laundry',
    'laundry app',
    'mobile laundry',
    'hotel laundry',
    'restaurant laundry',
    'hospital laundry',
    'laundry pricing',
    'bulk laundry',
    'laundry subscription',
    'eco laundry',
    'laundry detergent',
    'laundry tips',
    'laundry business',
  ];

  private readonly STAIN_REMOVAL_BASE = [
    'stain removal',
    'remove stains',
    'stain remover',
    'oil stain removal',
    'wine stain removal',
    'blood stain removal',
    'ink stain removal',
    'coffee stain removal',
    'grease stain removal',
    'grass stain removal',
    'lipstick stain removal',
    'chocolate stain removal',
    'mud stain removal',
    'sweat stain removal',
    'rust stain removal',
    'paint stain removal',
    'mold stain removal',
    'makeup stain removal',
    'pet stain removal',
    'food stain removal',
  ];

  private readonly FABRIC_CARE_BASE = [
    'fabric care',
    'garment care',
    'clothing care',
    'textile care',
    'delicate fabric care',
    'silk care',
    'wool care',
    'cashmere care',
    'linen care',
    'cotton care',
    'polyester care',
    'suede care',
    'leather care',
    'fabric maintenance',
    'garment preservation',
    'clothing storage',
    'moth prevention',
    'fabric protection',
    'wrinkle removal',
    'fabric softener',
  ];

  private readonly GENERIC_MARKETING_BASE = [
    'marketing strategy',
    'digital marketing',
    'social media marketing',
    'content marketing',
    'seo marketing',
    'email marketing',
    'video marketing',
    'influencer marketing',
    'brand awareness',
    'customer acquisition',
    'lead generation',
    'conversion optimization',
    'marketing automation',
    'growth hacking',
    'viral marketing',
    'local marketing',
    'mobile marketing',
    'marketing analytics',
    'roi marketing',
    'marketing trends',
  ];

  // Modifiers to create long-tail variations
  private readonly LOCATION_MODIFIERS = [
    'near me',
    'in [city]',
    'downtown',
    'uptown',
    'local',
    'nearby',
    'around me',
    '24 hour',
    'open now',
    'open sunday',
  ];

  private readonly INTENT_MODIFIERS = {
    INFORMATIONAL: [
      'how to',
      'what is',
      'why',
      'guide',
      'tips',
      'tutorial',
      'learn',
      'explained',
      'definition',
      'meaning',
    ],
    COMMERCIAL: [
      'best',
      'top',
      'review',
      'vs',
      'comparison',
      'alternative',
      'recommended',
      'cheap',
      'affordable',
      'quality',
    ],
    TRANSACTIONAL: [
      'buy',
      'price',
      'cost',
      'hire',
      'order',
      'book',
      'schedule',
      'coupon',
      'discount',
      'deal',
    ],
    NAVIGATIONAL: [
      'login',
      'app',
      'website',
      'contact',
      'location',
      'hours',
      'phone number',
      'address',
    ],
  };

  private readonly CITIES = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
    'Austin',
    'Jacksonville',
    'Fort Worth',
    'Columbus',
    'Charlotte',
    'San Francisco',
    'Indianapolis',
    'Seattle',
    'Denver',
    'Boston',
    'Portland',
    'Miami',
    'Atlanta',
    'Las Vegas',
    'Detroit',
  ];

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main seeding method - generates 50,000 keywords
   */
  async seedKeywords(count: number = 50000): Promise<{
    seeded: number;
    dryCleaning: number;
    laundry: number;
    stainRemoval: number;
    fabricCare: number;
    genericMarketing: number;
    primaryKeywords: number;
    secondaryKeywords: number;
    tertiaryKeywords: number;
    ultraLongTail: number;
  }> {
    this.logger.log(`Starting keyword seeding: ${count} keywords...`);

    const distribution = {
      dryCleaning: Math.floor(count * 0.30), // 15,000
      laundry: Math.floor(count * 0.24), // 12,000
      stainRemoval: Math.floor(count * 0.16), // 8,000
      fabricCare: Math.floor(count * 0.14), // 7,000
      genericMarketing: Math.floor(count * 0.16), // 8,000
    };

    let totalSeeded = 0;
    const categoryStats = {
      dryCleaning: 0,
      laundry: 0,
      stainRemoval: 0,
      fabricCare: 0,
      genericMarketing: 0,
      primaryKeywords: 0,
      secondaryKeywords: 0,
      tertiaryKeywords: 0,
      ultraLongTail: 0,
    };

    // Generate keywords by category
    this.logger.log('Generating dry cleaning keywords...');
    const dryCleaningKeywords = await this.generateCategoryKeywords(
      this.DRY_CLEANING_BASE,
      distribution.dryCleaning,
      'dry_cleaning',
    );
    await this.insertKeywordBatch(dryCleaningKeywords);
    categoryStats.dryCleaning = dryCleaningKeywords.length;
    totalSeeded += dryCleaningKeywords.length;
    this.logger.log(`✓ Seeded ${dryCleaningKeywords.length} dry cleaning keywords`);

    this.logger.log('Generating laundry keywords...');
    const laundryKeywords = await this.generateCategoryKeywords(
      this.LAUNDRY_BASE,
      distribution.laundry,
      'laundry',
    );
    await this.insertKeywordBatch(laundryKeywords);
    categoryStats.laundry = laundryKeywords.length;
    totalSeeded += laundryKeywords.length;
    this.logger.log(`✓ Seeded ${laundryKeywords.length} laundry keywords`);

    this.logger.log('Generating stain removal keywords...');
    const stainRemovalKeywords = await this.generateCategoryKeywords(
      this.STAIN_REMOVAL_BASE,
      distribution.stainRemoval,
      'stain_removal',
    );
    await this.insertKeywordBatch(stainRemovalKeywords);
    categoryStats.stainRemoval = stainRemovalKeywords.length;
    totalSeeded += stainRemovalKeywords.length;
    this.logger.log(`✓ Seeded ${stainRemovalKeywords.length} stain removal keywords`);

    this.logger.log('Generating fabric care keywords...');
    const fabricCareKeywords = await this.generateCategoryKeywords(
      this.FABRIC_CARE_BASE,
      distribution.fabricCare,
      'fabric_care',
    );
    await this.insertKeywordBatch(fabricCareKeywords);
    categoryStats.fabricCare = fabricCareKeywords.length;
    totalSeeded += fabricCareKeywords.length;
    this.logger.log(`✓ Seeded ${fabricCareKeywords.length} fabric care keywords`);

    this.logger.log('Generating generic marketing keywords...');
    const genericMarketingKeywords = await this.generateCategoryKeywords(
      this.GENERIC_MARKETING_BASE,
      distribution.genericMarketing,
      'marketing',
    );
    await this.insertKeywordBatch(genericMarketingKeywords);
    categoryStats.genericMarketing = genericMarketingKeywords.length;
    totalSeeded += genericMarketingKeywords.length;
    this.logger.log(`✓ Seeded ${genericMarketingKeywords.length} marketing keywords`);

    // Calculate category distribution stats
    const allKeywords = [
      ...dryCleaningKeywords,
      ...laundryKeywords,
      ...stainRemovalKeywords,
      ...fabricCareKeywords,
      ...genericMarketingKeywords,
    ];

    categoryStats.primaryKeywords = allKeywords.filter((k) => k.category === 'primary').length;
    categoryStats.secondaryKeywords = allKeywords.filter((k) => k.category === 'secondary').length;
    categoryStats.tertiaryKeywords = allKeywords.filter((k) => k.category === 'tertiary').length;
    categoryStats.ultraLongTail = allKeywords.filter((k) => k.category === 'ultra-long-tail').length;

    this.logger.log(`✅ Keyword seeding complete: ${totalSeeded} total keywords`);
    this.logger.log(`   - Primary: ${categoryStats.primaryKeywords}`);
    this.logger.log(`   - Secondary: ${categoryStats.secondaryKeywords}`);
    this.logger.log(`   - Tertiary: ${categoryStats.tertiaryKeywords}`);
    this.logger.log(`   - Ultra-long-tail: ${categoryStats.ultraLongTail}`);

    return {
      seeded: totalSeeded,
      ...categoryStats,
    };
  }

  /**
   * Generate keywords for a specific category
   */
  private async generateCategoryKeywords(
    baseKeywords: string[],
    targetCount: number,
    categoryName: string,
  ): Promise<KeywordSeed[]> {
    const keywords: KeywordSeed[] = [];
    const keywordSet = new Set<string>(); // Prevent duplicates

    // Distribution by keyword type:
    // - 5% Primary (base keywords only)
    // - 15% Secondary (base + 1 modifier)
    // - 30% Tertiary (base + 2 modifiers)
    // - 50% Ultra-long-tail (base + 3+ modifiers)

    const primaryCount = Math.floor(targetCount * 0.05);
    const secondaryCount = Math.floor(targetCount * 0.15);
    const tertiaryCount = Math.floor(targetCount * 0.30);
    const ultraLongTailCount = targetCount - primaryCount - secondaryCount - tertiaryCount;

    // Generate primary keywords (base only)
    for (let i = 0; i < primaryCount && i < baseKeywords.length; i++) {
      const keyword = baseKeywords[i];
      if (!keywordSet.has(keyword)) {
        keywordSet.add(keyword);
        keywords.push(this.createKeyword(keyword, 'primary', null));
      }
    }

    // Generate secondary keywords (base + 1 modifier)
    let attempts = 0;
    while (keywords.filter((k) => k.category === 'secondary').length < secondaryCount && attempts < secondaryCount * 10) {
      const base = this.randomElement(baseKeywords);
      const modifier = this.getRandomModifier();
      const keyword = this.combineKeyword(base, [modifier]);

      if (!keywordSet.has(keyword)) {
        keywordSet.add(keyword);
        keywords.push(this.createKeyword(keyword, 'secondary', base));
      }
      attempts++;
    }

    // Generate tertiary keywords (base + 2 modifiers)
    attempts = 0;
    while (keywords.filter((k) => k.category === 'tertiary').length < tertiaryCount && attempts < tertiaryCount * 10) {
      const base = this.randomElement(baseKeywords);
      const modifiers = [this.getRandomModifier(), this.getRandomModifier()];
      const keyword = this.combineKeyword(base, modifiers);

      if (!keywordSet.has(keyword)) {
        keywordSet.add(keyword);
        keywords.push(this.createKeyword(keyword, 'tertiary', base));
      }
      attempts++;
    }

    // Generate ultra-long-tail keywords (base + 3+ modifiers)
    attempts = 0;
    while (keywords.filter((k) => k.category === 'ultra-long-tail').length < ultraLongTailCount && attempts < ultraLongTailCount * 10) {
      const base = this.randomElement(baseKeywords);
      const numModifiers = 3 + Math.floor(Math.random() * 2); // 3-4 modifiers
      const modifiers = Array.from({ length: numModifiers }, () => this.getRandomModifier());
      const keyword = this.combineKeyword(base, modifiers);

      if (!keywordSet.has(keyword)) {
        keywordSet.add(keyword);
        keywords.push(this.createKeyword(keyword, 'ultra-long-tail', base));
      }
      attempts++;
    }

    return keywords;
  }

  /**
   * Create a keyword seed object with realistic metrics
   */
  private createKeyword(
    keyword: string,
    category: 'primary' | 'secondary' | 'tertiary' | 'ultra-long-tail',
    parentKeyword: string | null,
  ): KeywordSeed {
    // Search volume follows power law distribution
    const searchVolume = this.generateSearchVolume(category);

    // Difficulty correlates with search volume
    const difficulty = this.generateDifficulty(searchVolume, category);

    // Intent based on keyword structure
    const intent = this.detectIntent(keyword);

    // CPC based on intent and competition
    const cpc = this.generateCPC(intent, difficulty);

    // Ranking history (simulated 3-year progression)
    const { currentRank, previousRank, bestRank, featuredSnippet } = this.generateRankingHistory(
      difficulty,
      searchVolume,
      category,
    );

    return {
      keyword,
      searchVolume,
      difficulty,
      cpc,
      intent,
      category,
      parentKeyword,
      currentRank,
      previousRank,
      bestRank,
      featuredSnippet,
    };
  }

  /**
   * Generate realistic search volume using power law distribution
   */
  private generateSearchVolume(category: 'primary' | 'secondary' | 'tertiary' | 'ultra-long-tail'): number {
    // Power law: most keywords have low volume, few have high volume
    const alpha = 2.5;
    const powerLaw = Math.pow(Math.random(), -1 / alpha);

    let baseVolume: number;

    switch (category) {
      case 'primary':
        // Primary keywords: 10K - 500K searches/month
        baseVolume = 10000 + powerLaw * 490000;
        break;
      case 'secondary':
        // Secondary keywords: 1K - 50K searches/month
        baseVolume = 1000 + powerLaw * 49000;
        break;
      case 'tertiary':
        // Tertiary keywords: 100 - 5K searches/month
        baseVolume = 100 + powerLaw * 4900;
        break;
      case 'ultra-long-tail':
        // Ultra-long-tail: 10 - 500 searches/month
        baseVolume = 10 + powerLaw * 490;
        break;
    }

    return Math.round(baseVolume);
  }

  /**
   * Generate difficulty score (0-100) based on search volume and category
   */
  private generateDifficulty(
    searchVolume: number,
    category: 'primary' | 'secondary' | 'tertiary' | 'ultra-long-tail',
  ): number {
    let baseDifficulty: number;

    // Higher search volume = higher difficulty (generally)
    if (searchVolume > 100000) {
      baseDifficulty = 70 + Math.random() * 30; // 70-100
    } else if (searchVolume > 10000) {
      baseDifficulty = 50 + Math.random() * 30; // 50-80
    } else if (searchVolume > 1000) {
      baseDifficulty = 30 + Math.random() * 30; // 30-60
    } else if (searchVolume > 100) {
      baseDifficulty = 15 + Math.random() * 25; // 15-40
    } else {
      baseDifficulty = 5 + Math.random() * 20; // 5-25
    }

    // Category adjustment (long-tail keywords are easier)
    const categoryMultipliers = {
      primary: 1.2,
      secondary: 1.0,
      tertiary: 0.8,
      'ultra-long-tail': 0.6,
    };

    const adjustedDifficulty = baseDifficulty * categoryMultipliers[category];

    // Add variance ±10%
    const variance = (Math.random() - 0.5) * 0.2;
    const finalDifficulty = adjustedDifficulty * (1 + variance);

    return Math.max(1, Math.min(100, Math.round(finalDifficulty)));
  }

  /**
   * Detect intent from keyword structure
   */
  private detectIntent(keyword: string): KeywordIntent {
    const lowerKeyword = keyword.toLowerCase();

    // Check for transactional intent
    const transactionalWords = ['buy', 'price', 'cost', 'hire', 'order', 'book', 'schedule', 'coupon', 'discount', 'deal', 'near me', 'delivery', 'pickup'];
    if (transactionalWords.some((word) => lowerKeyword.includes(word))) {
      return KeywordIntent.TRANSACTIONAL;
    }

    // Check for informational intent
    const informationalWords = ['how to', 'what is', 'why', 'guide', 'tips', 'tutorial', 'learn', 'explained', 'definition', 'remove', 'care'];
    if (informationalWords.some((word) => lowerKeyword.includes(word))) {
      return KeywordIntent.INFORMATIONAL;
    }

    // Check for commercial intent
    const commercialWords = ['best', 'top', 'review', 'vs', 'comparison', 'alternative', 'recommended', 'cheap', 'affordable', 'quality'];
    if (commercialWords.some((word) => lowerKeyword.includes(word))) {
      return KeywordIntent.COMMERCIAL;
    }

    // Check for navigational intent
    const navigationalWords = ['login', 'app', 'website', 'contact', 'location', 'hours', 'phone', 'address'];
    if (navigationalWords.some((word) => lowerKeyword.includes(word))) {
      return KeywordIntent.NAVIGATIONAL;
    }

    // Default: commercial intent for service keywords
    if (lowerKeyword.includes('service') || lowerKeyword.includes('cleaning') || lowerKeyword.includes('laundry')) {
      return KeywordIntent.COMMERCIAL;
    }

    return KeywordIntent.INFORMATIONAL;
  }

  /**
   * Generate CPC based on intent and difficulty
   */
  private generateCPC(intent: KeywordIntent, difficulty: number): number | null {
    // Transactional and commercial keywords have CPC, informational/navigational often don't
    if (intent === KeywordIntent.INFORMATIONAL || intent === KeywordIntent.NAVIGATIONAL) {
      // 70% chance of no CPC for informational/navigational
      if (Math.random() < 0.7) {
        return null;
      }
    }

    // Base CPC by intent
    let baseCPC: number;
    switch (intent) {
      case KeywordIntent.TRANSACTIONAL:
        baseCPC = 2.0 + Math.random() * 8.0; // $2-10
        break;
      case KeywordIntent.COMMERCIAL:
        baseCPC = 1.0 + Math.random() * 5.0; // $1-6
        break;
      case KeywordIntent.INFORMATIONAL:
        baseCPC = 0.2 + Math.random() * 1.8; // $0.20-2
        break;
      case KeywordIntent.NAVIGATIONAL:
        baseCPC = 0.5 + Math.random() * 2.5; // $0.50-3
        break;
    }

    // Difficulty multiplier (higher difficulty = higher CPC)
    const difficultyMultiplier = 0.5 + (difficulty / 100) * 1.5; // 0.5x to 2x

    const cpc = baseCPC * difficultyMultiplier;

    // Add variance ±20%
    const variance = (Math.random() - 0.5) * 0.4;
    const finalCPC = cpc * (1 + variance);

    return Math.round(finalCPC * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate ranking history (3-year simulation)
   */
  private generateRankingHistory(
    difficulty: number,
    searchVolume: number,
    category: 'primary' | 'secondary' | 'tertiary' | 'ultra-long-tail',
  ): {
    currentRank: number | null;
    previousRank: number | null;
    bestRank: number | null;
    featuredSnippet: boolean;
  } {
    // Only 40% of keywords have ranking data (we don't rank for everything)
    if (Math.random() > 0.4) {
      return {
        currentRank: null,
        previousRank: null,
        bestRank: null,
        featuredSnippet: false,
      };
    }

    // Easier keywords (low difficulty, long-tail) rank better
    const rankPotential = 100 - difficulty + (category === 'ultra-long-tail' ? 30 : category === 'tertiary' ? 20 : category === 'secondary' ? 10 : 0);

    // Generate current rank
    let currentRank: number;
    if (rankPotential > 80) {
      currentRank = 1 + Math.floor(Math.random() * 10); // Top 10
    } else if (rankPotential > 60) {
      currentRank = 5 + Math.floor(Math.random() * 20); // Position 5-25
    } else if (rankPotential > 40) {
      currentRank = 10 + Math.floor(Math.random() * 40); // Position 10-50
    } else {
      currentRank = 20 + Math.floor(Math.random() * 80); // Position 20-100
    }

    // Generate historical progression
    // bestRank is typically 20-30% better than current
    const improvement = Math.floor(currentRank * (0.2 + Math.random() * 0.3));
    const bestRank = Math.max(1, currentRank - improvement);

    // previousRank shows some volatility (±5 positions typically)
    const previousChange = Math.floor((Math.random() - 0.5) * 10);
    const previousRank = Math.max(1, Math.min(100, currentRank + previousChange));

    // Featured snippet only for top 10 informational keywords
    const featuredSnippet = currentRank <= 10 && Math.random() < 0.15; // 15% chance for top 10

    return {
      currentRank,
      previousRank,
      bestRank,
      featuredSnippet,
    };
  }

  /**
   * Combine base keyword with modifiers
   */
  private combineKeyword(base: string, modifiers: string[]): string {
    const uniqueModifiers = [...new Set(modifiers)]; // Remove duplicate modifiers

    // Randomly decide modifier placement (before or after base)
    const parts: string[] = [];

    for (const modifier of uniqueModifiers) {
      // Some modifiers go before (how to, best, etc.)
      const goesFirst = ['how to', 'what is', 'why', 'best', 'top', 'cheap'].some((prefix) => modifier.startsWith(prefix));

      if (goesFirst) {
        parts.unshift(modifier);
      } else {
        parts.push(modifier);
      }
    }

    // Insert base in the middle
    const firstPart = parts.filter((p) => ['how to', 'what is', 'why', 'best', 'top'].some((prefix) => p.startsWith(prefix)));
    const lastPart = parts.filter((p) => !firstPart.includes(p));

    return [...firstPart, base, ...lastPart].join(' ').trim();
  }

  /**
   * Get a random modifier (intent-based or location)
   */
  private getRandomModifier(): string {
    // 30% chance of location modifier
    if (Math.random() < 0.3) {
      const locationMod = this.randomElement(this.LOCATION_MODIFIERS);
      // Replace [city] with actual city
      if (locationMod.includes('[city]')) {
        return locationMod.replace('[city]', this.randomElement(this.CITIES).toLowerCase());
      }
      return locationMod;
    }

    // 70% chance of intent modifier
    const intentType = this.randomElement(Object.keys(this.INTENT_MODIFIERS)) as keyof typeof this.INTENT_MODIFIERS;
    return this.randomElement(this.INTENT_MODIFIERS[intentType]);
  }

  /**
   * Insert keywords into database in batches
   */
  private async insertKeywordBatch(keywords: KeywordSeed[]): Promise<void> {
    const batchSize = 100;
    const batches = Math.ceil(keywords.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = keywords.slice(i * batchSize, (i + 1) * batchSize);

      // First pass: insert all keywords without parent relationships
      const createdKeywords = new Map<string, string>(); // keyword -> id

      for (const kw of batch) {
        try {
          const created = await this.prisma.keyword.create({
            data: {
              keyword: kw.keyword,
              searchVolume: kw.searchVolume,
              difficulty: kw.difficulty,
              cpc: kw.cpc,
              intent: kw.intent,
              category: kw.category,
              currentRank: kw.currentRank,
              previousRank: kw.previousRank,
              bestRank: kw.bestRank,
              featuredSnippet: kw.featuredSnippet,
              lastChecked: kw.currentRank ? new Date() : null,
            },
          });
          createdKeywords.set(kw.keyword, created.id);
        } catch (error) {
          // Skip duplicates (keyword is unique)
          if (error.code === 'P2002') {
            this.logger.debug(`Skipping duplicate keyword: ${kw.keyword}`);
          } else {
            throw error;
          }
        }
      }

      // Second pass: update parent relationships
      for (const kw of batch) {
        if (kw.parentKeyword && createdKeywords.has(kw.keyword)) {
          const keywordId = createdKeywords.get(kw.keyword);

          // Find parent keyword ID
          const parentKeyword = await this.prisma.keyword.findUnique({
            where: { keyword: kw.parentKeyword },
            select: { id: true },
          });

          if (parentKeyword) {
            await this.prisma.keyword.update({
              where: { id: keywordId },
              data: { parentKeywordId: parentKeyword.id },
            });
          }
        }
      }

      if ((i + 1) % 10 === 0) {
        this.logger.debug(`   Inserted ${(i + 1) * batchSize} / ${keywords.length} keywords...`);
      }
    }
  }

  /**
   * Get seeding summary statistics
   */
  async getSeedingSummary(): Promise<{
    totalKeywords: number;
    byCategory: Record<string, number>;
    byIntent: Record<string, number>;
    avgSearchVolume: number;
    avgDifficulty: number;
    avgCPC: number;
    rankedKeywords: number;
    featuredSnippets: number;
  }> {
    const total = await this.prisma.keyword.count();

    const byCategory = await this.prisma.keyword.groupBy({
      by: ['category'],
      _count: true,
    });

    const byIntent = await this.prisma.keyword.groupBy({
      by: ['intent'],
      _count: true,
    });

    const aggregates = await this.prisma.keyword.aggregate({
      _avg: {
        searchVolume: true,
        difficulty: true,
        cpc: true,
      },
      _count: {
        currentRank: true,
      },
    });

    const featuredSnippets = await this.prisma.keyword.count({
      where: { featuredSnippet: true },
    });

    return {
      totalKeywords: total,
      byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c._count])),
      byIntent: Object.fromEntries(byIntent.map((i) => [i.intent, i._count])),
      avgSearchVolume: Math.round(aggregates._avg.searchVolume || 0),
      avgDifficulty: Math.round(aggregates._avg.difficulty || 0),
      avgCPC: Math.round((aggregates._avg.cpc?.toNumber() || 0) * 100) / 100,
      rankedKeywords: aggregates._count.currentRank,
      featuredSnippets,
    };
  }

  /**
   * Clear all seeded keywords
   */
  async clearKeywords(): Promise<number> {
    const count = await this.prisma.keyword.count();
    await this.prisma.keyword.deleteMany({});
    this.logger.log(`Cleared ${count} keywords`);
    return count;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
