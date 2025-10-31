import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

export interface SnippetOpportunity {
  keywordId: string;
  keyword: string;
  currentSnippetHolder: string;
  snippetType: 'paragraph' | 'list' | 'table' | 'video';
  currentRank: number;
  searchVolume: number;
  difficulty: number;
  opportunityScore: number;
}

@Injectable()
export class SnippetHijackerService {
  private readonly logger = new Logger('SnippetHijacker');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Identify featured snippet opportunities
   */
  async identifyOpportunities(limit: number = 100): Promise<SnippetOpportunity[]> {
    this.logger.log(`Identifying featured snippet opportunities...`);

    // Find keywords ranking 1-10 but not holding featured snippet
    const keywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { lte: 10, gte: 1 } },
          { featuredSnippet: false },
        ],
      },
      orderBy: { searchVolume: 'desc' },
      take: limit,
      include: {
        serpResults: {
          where: { hasSnippet: true },
          take: 1,
          orderBy: { checkedAt: 'desc' },
        },
      },
    });

    const opportunities: SnippetOpportunity[] = [];

    for (const keyword of keywords) {
      if (keyword.serpResults.length > 0) {
        const snippetResult = keyword.serpResults[0];

        // Calculate opportunity score
        const opportunityScore = this.calculateOpportunityScore(
          keyword.currentRank || 10,
          keyword.searchVolume,
          keyword.difficulty,
        );

        opportunities.push({
          keywordId: keyword.id,
          keyword: keyword.keyword,
          currentSnippetHolder: snippetResult.domain,
          snippetType: this.detectSnippetType(keyword.keyword),
          currentRank: keyword.currentRank || 10,
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty,
          opportunityScore,
        });
      }
    }

    // Sort by opportunity score
    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Calculate opportunity score (0-100)
   */
  private calculateOpportunityScore(rank: number, volume: number, difficulty: number): number {
    // Higher score = better opportunity
    // Factors: ranking (closer to #1 = better), volume (higher = better), difficulty (lower = better)

    const rankScore = (10 - rank) * 10; // #1 = 90, #10 = 0
    const volumeScore = Math.min(volume / 100, 30); // Max 30 points
    const difficultyScore = (100 - difficulty) / 5; // Max 20 points

    return Math.min(100, rankScore + volumeScore + difficultyScore);
  }

  /**
   * Detect snippet type from keyword
   */
  private detectSnippetType(keyword: string): 'paragraph' | 'list' | 'table' | 'video' {
    const lowerKeyword = keyword.toLowerCase();

    // List indicators
    if (lowerKeyword.match(/how to|steps|ways|types|kinds|examples|benefits/i)) {
      return 'list';
    }

    // Table indicators
    if (lowerKeyword.match(/vs|versus|comparison|compare|difference|price/i)) {
      return 'table';
    }

    // Video indicators
    if (lowerKeyword.match(/tutorial|guide|how do|show me/i)) {
      return 'video';
    }

    // Default to paragraph
    return 'paragraph';
  }

  /**
   * Generate snippet-optimized content
   */
  async generateSnippetContent(
    keywordId: string,
  ): Promise<{
    snippetText: string;
    fullContent: string;
    snippetType: string;
  }> {
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
    });

    if (!keyword) {
      throw new Error('Keyword not found');
    }

    const snippetType = this.detectSnippetType(keyword.keyword);

    const prompt = this.buildSnippetPrompt(keyword.keyword, snippetType);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          snippetText: parsed.snippet,
          fullContent: parsed.fullContent,
          snippetType,
        };
      }
    } catch (error) {
      this.logger.error(`Error parsing snippet content: ${error.message}`);
    }

    return {
      snippetText: responseText.substring(0, 160),
      fullContent: responseText,
      snippetType,
    };
  }

  /**
   * Build snippet generation prompt
   */
  private buildSnippetPrompt(keyword: string, snippetType: string): string {
    let typeInstructions = '';

    switch (snippetType) {
      case 'paragraph':
        typeInstructions = `
Generate a PARAGRAPH-STYLE featured snippet.
- Write a concise answer in 40-60 words
- Put the most important information in the first sentence
- Use clear, direct language
- Answer the query completely but concisely`;
        break;

      case 'list':
        typeInstructions = `
Generate a LIST-STYLE featured snippet.
- Create a numbered or bulleted list (5-8 items)
- Each item should be concise (8-12 words)
- Use parallel structure
- Start with action verbs or key points`;
        break;

      case 'table':
        typeInstructions = `
Generate a TABLE-STYLE featured snippet.
- Create a comparison table with 2-4 columns
- Include 3-6 rows
- Use clear headers
- Keep cell content brief`;
        break;

      case 'video':
        typeInstructions = `
Generate content optimized for VIDEO snippets.
- Write step-by-step instructions
- Use clear section headers
- Include timing estimates
- Describe visual elements`;
        break;
    }

    return `You are an expert at creating content optimized for Google Featured Snippets.

Query: "${keyword}"
Snippet Type: ${snippetType.toUpperCase()}

${typeInstructions}

CRITICAL RULES:
1. Answer the query IMMEDIATELY and DIRECTLY
2. Use the exact query keywords in your answer
3. Structure content EXACTLY as Google expects for ${snippetType} snippets
4. Be authoritative but concise
5. Use simple, clear language (8th-grade reading level)

Return as JSON:
{
  "snippet": "The exact snippet-optimized answer (formatted for ${snippetType})",
  "fullContent": "The complete article content (500+ words) that includes the snippet naturally"
}`;
  }

  /**
   * Optimize existing content for snippets
   */
  async optimizeContentForSnippet(
    pageId: string,
  ): Promise<{
    optimizedContent: string;
    snippetSection: string;
    changes: string[];
  }> {
    const page = await this.prisma.programmaticPage.findUnique({
      where: { id: pageId },
      include: { targetKeyword: true },
    });

    if (!page) {
      throw new Error('Page not found');
    }

    const snippetType = this.detectSnippetType(page.targetKeyword.keyword);

    const prompt = `Optimize this content to win the featured snippet for: "${page.targetKeyword.keyword}"

Current Content:
${page.content.substring(0, 1000)}...

Snippet Type: ${snippetType}

Tasks:
1. Identify where to add the snippet-optimized section
2. Write the perfect ${snippetType} snippet
3. Explain what changes you made

Return as JSON:
{
  "optimizedContent": "Full updated content with snippet section added",
  "snippetSection": "Just the snippet section HTML",
  "changes": ["Change 1", "Change 2", "Change 3"]
}`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error parsing optimization response: ${error.message}`);
    }

    return {
      optimizedContent: page.content,
      snippetSection: '',
      changes: [],
    };
  }

  /**
   * Bulk optimize pages for snippets
   */
  async bulkOptimizeForSnippets(limit: number = 50): Promise<{
    optimized: number;
    failed: number;
  }> {
    this.logger.log(`Bulk optimizing ${limit} pages for featured snippets...`);

    const opportunities = await this.identifyOpportunities(limit);

    let optimized = 0;
    let failed = 0;

    for (const opp of opportunities) {
      try {
        // Find the page for this keyword
        const pages = await this.prisma.programmaticPage.findMany({
          where: { targetKeywordId: opp.keywordId },
          take: 1,
        });

        if (pages.length > 0) {
          const result = await this.optimizeContentForSnippet(pages[0].id);

          // Update the page with optimized content
          await this.prisma.programmaticPage.update({
            where: { id: pages[0].id },
            data: {
              content: result.optimizedContent,
            },
          });

          optimized++;
          this.logger.log(`Optimized page for "${opp.keyword}"`);
        }
      } catch (error) {
        this.logger.error(`Failed to optimize for "${opp.keyword}": ${error.message}`);
        failed++;
      }
    }

    this.logger.log(`Bulk optimization complete: ${optimized} optimized, ${failed} failed`);

    return { optimized, failed };
  }

  /**
   * Track snippet wins
   */
  async trackSnippetWins(): Promise<{
    totalSnippets: number;
    newWins: number;
    lost: number;
    wins: Array<{ keyword: string; date: Date }>;
  }> {
    // Find keywords where we now have the featured snippet
    const keywords = await this.prisma.keyword.findMany({
      where: {
        featuredSnippet: true,
      },
    });

    // In production, track historical data to detect new wins vs lost
    // For now, return current state
    return {
      totalSnippets: keywords.length,
      newWins: 0, // Would need historical tracking
      lost: 0, // Would need historical tracking
      wins: keywords.map(kw => ({
        keyword: kw.keyword,
        date: kw.lastChecked || new Date(),
      })),
    };
  }

  /**
   * Get snippet optimization recommendations
   */
  async getSnippetRecommendations(keywordId: string): Promise<{
    keyword: string;
    currentSnippet: string;
    recommendations: string[];
    estimatedDifficulty: 'easy' | 'medium' | 'hard';
  }> {
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      include: {
        serpResults: {
          where: { hasSnippet: true },
          take: 1,
          orderBy: { checkedAt: 'desc' },
        },
      },
    });

    if (!keyword) {
      throw new Error('Keyword not found');
    }

    const snippetType = this.detectSnippetType(keyword.keyword);
    const currentSnippet = keyword.serpResults[0]?.domain || 'Unknown';

    const recommendations = [
      `Create ${snippetType}-style content optimized for position zero`,
      `Include the exact question "${keyword.keyword}" in your H2 heading`,
      `Answer the question in the first 40-60 words`,
      `Use schema markup (FAQ or HowTo schema)`,
      `Add relevant images with descriptive alt text`,
    ];

    // Estimate difficulty based on current rank and keyword difficulty
    let estimatedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

    if (keyword.currentRank && keyword.currentRank <= 3 && keyword.difficulty < 50) {
      estimatedDifficulty = 'easy';
    } else if (keyword.currentRank && keyword.currentRank > 5 || keyword.difficulty > 70) {
      estimatedDifficulty = 'hard';
    }

    return {
      keyword: keyword.keyword,
      currentSnippet,
      recommendations,
      estimatedDifficulty,
    };
  }
}
