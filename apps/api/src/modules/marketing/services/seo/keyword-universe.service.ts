import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';
import { HttpService } from '@nestjs/axios';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc?: number;
  intent: 'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL';
  category: string;
}

@Injectable()
export class KeywordUniverseService {
  private readonly logger = new Logger('KeywordUniverse');
  private readonly anthropic: Anthropic;

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Discover keywords from seed keyword
   */
  async discoverKeywords(seedKeyword: string): Promise<string[]> {
    this.logger.log(`Discovering keywords from seed: ${seedKeyword}`);

    const keywords: string[] = [];

    // 1. Google autocomplete variations
    const autocompleteVariations = await this.getAutocompleteVariations(seedKeyword);
    keywords.push(...autocompleteVariations);

    // 2. Related searches
    const relatedSearches = await this.getRelatedSearches(seedKeyword);
    keywords.push(...relatedSearches);

    // 3. Question-based keywords
    const questions = await this.generateQuestions(seedKeyword);
    keywords.push(...questions);

    // 4. AI-generated variations
    const aiVariations = await this.generateAIVariations(seedKeyword);
    keywords.push(...aiVariations);

    // Remove duplicates
    return [...new Set(keywords)];
  }

  /**
   * Get Google autocomplete variations
   */
  private async getAutocompleteVariations(keyword: string): Promise<string[]> {
    const variations: string[] = [];

    // Prefixes
    const prefixes = ['how to', 'best', 'top', 'why', 'what is', 'when', 'where'];

    // Suffixes
    const suffixes = ['near me', 'online', 'service', 'cost', 'price', 'review', 'vs'];

    // Add alphabet soup (a-z)
    for (let i = 97; i <= 122; i++) {
      variations.push(`${keyword} ${String.fromCharCode(i)}`);
    }

    // Add prefix variations
    for (const prefix of prefixes) {
      variations.push(`${prefix} ${keyword}`);
    }

    // Add suffix variations
    for (const suffix of suffixes) {
      variations.push(`${keyword} ${suffix}`);
    }

    return variations;
  }

  /**
   * Get related searches (simulated - in production use SERP API)
   */
  private async getRelatedSearches(keyword: string): Promise<string[]> {
    // In production, scrape Google "Related searches" or use API
    // For now, return AI-generated related terms
    return this.generateAIVariations(keyword, 'related');
  }

  /**
   * Generate question-based keywords
   */
  private async generateQuestions(keyword: string): Promise<string[]> {
    const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which'];
    const questions: string[] = [];

    for (const qWord of questionWords) {
      questions.push(`${qWord} ${keyword}`);
      questions.push(`${qWord} to ${keyword}`);
      questions.push(`${qWord} does ${keyword}`);
      questions.push(`${qWord} is ${keyword}`);
    }

    return questions;
  }

  /**
   * Generate AI-powered keyword variations
   */
  private async generateAIVariations(
    keyword: string,
    type: string = 'variations',
  ): Promise<string[]> {
    const prompt = `Generate 20 keyword variations for: "${keyword}"

Type: ${type}

Rules:
- Include long-tail variations
- Include question format
- Include commercial intent keywords
- Include informational keywords
- Be creative but relevant

Return as JSON array: ["keyword1", "keyword2", ...]`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '[]';

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error generating AI variations: ${error.message}`);
    }

    return [];
  }

  /**
   * Classify keyword intent using AI
   */
  async classifyIntent(keyword: string): Promise<'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL'> {
    const prompt = `Classify the search intent for this keyword: "${keyword}"

Intents:
- INFORMATIONAL: User wants to learn something
- COMMERCIAL: User is researching before buying
- TRANSACTIONAL: User wants to buy/take action
- NAVIGATIONAL: User looking for specific website/brand

Return ONLY one word: INFORMATIONAL, COMMERCIAL, TRANSACTIONAL, or NAVIGATIONAL`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      });

      const intent = message.content[0].type === 'text' ? message.content[0].text.trim() : 'INFORMATIONAL';

      if (['INFORMATIONAL', 'COMMERCIAL', 'TRANSACTIONAL', 'NAVIGATIONAL'].includes(intent)) {
        return intent as any;
      }
    } catch (error) {
      this.logger.error(`Error classifying intent: ${error.message}`);
    }

    return 'INFORMATIONAL';
  }

  /**
   * Categorize keyword by importance
   */
  categorizeKeyword(searchVolume: number): string {
    if (searchVolume > 10000) return 'primary';
    if (searchVolume > 1000) return 'secondary';
    if (searchVolume > 100) return 'tertiary';
    return 'ultra-long-tail';
  }

  /**
   * Save keywords to database
   */
  async saveKeywords(keywords: KeywordData[]): Promise<number> {
    let savedCount = 0;

    for (const kwData of keywords) {
      try {
        await this.prisma.keyword.upsert({
          where: { keyword: kwData.keyword },
          update: {
            searchVolume: kwData.searchVolume,
            difficulty: kwData.difficulty,
            cpc: kwData.cpc,
            intent: kwData.intent,
            category: kwData.category,
          },
          create: {
            keyword: kwData.keyword,
            searchVolume: kwData.searchVolume,
            difficulty: kwData.difficulty,
            cpc: kwData.cpc,
            intent: kwData.intent,
            category: kwData.category,
          },
        });
        savedCount++;
      } catch (error) {
        this.logger.error(`Error saving keyword ${kwData.keyword}: ${error.message}`);
      }
    }

    this.logger.log(`Saved ${savedCount} keywords to database`);
    return savedCount;
  }

  /**
   * Build keyword universe from seeds
   */
  async buildKeywordUniverse(seedKeywords: string[]): Promise<void> {
    this.logger.log(`Building keyword universe from ${seedKeywords.length} seeds`);

    for (const seed of seedKeywords) {
      const discovered = await this.discoverKeywords(seed);

      const keywordDataList: KeywordData[] = [];

      for (const kw of discovered.slice(0, 100)) { // Process first 100 per seed
        const intent = await this.classifyIntent(kw);
        const searchVolume = Math.floor(Math.random() * 10000); // Simulated - use real API in production
        const difficulty = Math.floor(Math.random() * 100);
        const category = this.categorizeKeyword(searchVolume);

        keywordDataList.push({
          keyword: kw,
          searchVolume,
          difficulty,
          intent,
          category,
        });
      }

      await this.saveKeywords(keywordDataList);
    }

    this.logger.log('Keyword universe building complete');
  }

  /**
   * Get keywords by category
   */
  async getKeywordsByCategory(category: string): Promise<any[]> {
    return this.prisma.keyword.findMany({
      where: { category },
      orderBy: { searchVolume: 'desc' },
    });
  }

  /**
   * Get top keywords
   */
  async getTopKeywords(limit: number = 100): Promise<any[]> {
    return this.prisma.keyword.findMany({
      take: limit,
      orderBy: { searchVolume: 'desc' },
    });
  }

  /**
   * Get keyword stats
   */
  async getKeywordStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byIntent: Record<string, number>;
  }> {
    const total = await this.prisma.keyword.count();

    // Count by category
    const categories = ['primary', 'secondary', 'tertiary', 'ultra-long-tail'];
    const byCategory: Record<string, number> = {};

    for (const category of categories) {
      byCategory[category] = await this.prisma.keyword.count({
        where: { category },
      });
    }

    // Count by intent
    const intents = ['INFORMATIONAL', 'COMMERCIAL', 'TRANSACTIONAL', 'NAVIGATIONAL'];
    const byIntent: Record<string, number> = {};

    for (const intent of intents) {
      byIntent[intent] = await this.prisma.keyword.count({
        where: { intent: intent as any },
      });
    }

    return {
      total,
      byCategory,
      byIntent,
    };
  }
}
