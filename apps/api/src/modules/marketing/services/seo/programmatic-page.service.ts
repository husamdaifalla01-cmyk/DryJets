import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

interface PageGenerationRequest {
  keywordId: string;
  pageType: 'LOCATION_PAGE' | 'SERVICE_PAGE' | 'COMPARISON_PAGE' | 'QUESTION_PAGE' | 'ULTIMATE_GUIDE' | 'BLOG_POST';
  additionalContext?: {
    location?: string;
    service?: string;
    competitors?: string[];
  };
}

@Injectable()
export class ProgrammaticPageService {
  private readonly logger = new Logger('ProgrammaticPage');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate a programmatic page
   */
  async generatePage(request: PageGenerationRequest): Promise<any> {
    this.logger.log(`Generating ${request.pageType} for keyword ID: ${request.keywordId}`);

    // Get keyword data
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: request.keywordId },
    });

    if (!keyword) {
      throw new Error('Keyword not found');
    }

    // Generate content based on page type
    const content = await this.generateContent(keyword, request);

    // Generate schema markup
    const schemaMarkup = this.generateSchema(request.pageType, keyword, content);

    // Create slug
    const slug = this.createSlug(keyword.keyword, request.additionalContext);

    // Calculate word count
    const wordCount = content.content.split(/\s+/).length;

    // Create page in database
    const page = await this.prisma.programmaticPage.create({
      data: {
        slug,
        title: content.title,
        content: content.content,
        metaDescription: content.metaDescription,
        pageType: request.pageType,
        templateUsed: request.pageType,
        targetKeywordId: keyword.id,
        secondaryKeywords: content.secondaryKeywords || [],
        schemaMarkup,
        wordCount,
        readabilityScore: 65, // Calculate in production
        aiGenerated: true,
        generationPrompt: `Generate ${request.pageType} for "${keyword.keyword}"`,
      },
    });

    this.logger.log(`Generated page: ${page.slug}`);
    return page;
  }

  /**
   * Generate content using AI
   */
  private async generateContent(
    keyword: any,
    request: PageGenerationRequest,
  ): Promise<{
    title: string;
    content: string;
    metaDescription: string;
    secondaryKeywords: string[];
  }> {
    const prompt = this.buildContentPrompt(keyword, request);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Error parsing content response: ${error.message}`);
    }

    // Fallback
    return {
      title: keyword.keyword,
      content: responseText,
      metaDescription: responseText.substring(0, 160),
      secondaryKeywords: [],
    };
  }

  /**
   * Build content generation prompt
   */
  private buildContentPrompt(keyword: any, request: PageGenerationRequest): string {
    const basePrompt = `You are an expert SEO content writer. Generate a comprehensive, SEO-optimized page.

Target Keyword: "${keyword.keyword}"
Search Intent: ${keyword.intent}
Page Type: ${request.pageType}
${request.additionalContext?.location ? `Location: ${request.additionalContext.location}` : ''}
${request.additionalContext?.service ? `Service: ${request.additionalContext.service}` : ''}

Requirements:
- Minimum 1,500 words (for programmatic pages) or 3,000+ words (for ultimate guides)
- Natural keyword usage (1-2% density)
- Include LSI keywords
- Engaging, helpful content (not keyword stuffing)
- Clear structure with headings (H2, H3)
- Include actionable information
- Conversational but professional tone

Return as JSON:
{
  "title": "SEO-optimized title (60 chars max)",
  "metaDescription": "Compelling meta description (155 chars max)",
  "content": "Full HTML content with proper heading tags",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

    // Add page-type-specific instructions
    let specificInstructions = '';

    switch (request.pageType) {
      case 'LOCATION_PAGE':
        specificInstructions = `
This is a location-specific service page. Include:
- Local landmarks and neighborhoods
- Service availability in this area
- Local customer testimonials (simulated)
- Location-specific FAQs
- Map embed placeholder`;
        break;

      case 'SERVICE_PAGE':
        specificInstructions = `
This is a service description page. Include:
- Detailed service explanation
- Benefits and features
- Pricing information (if applicable)
- Process/how it works
- Why choose us
- FAQs about this service`;
        break;

      case 'COMPARISON_PAGE':
        specificInstructions = `
This is a comparison page. Include:
- Side-by-side comparison
- Pros and cons
- Use cases for each option
- Recommendation
- Pricing comparison`;
        break;

      case 'QUESTION_PAGE':
        specificInstructions = `
This is a question/answer page. Include:
- Direct answer in first paragraph (for featured snippet)
- Detailed explanation
- Related questions
- Examples
- Visual aids description`;
        break;

      case 'ULTIMATE_GUIDE':
        specificInstructions = `
This is a comprehensive guide (3,000+ words). Include:
- Table of contents
- Multiple chapters/sections
- Expert tips
- Case studies or examples
- Resources and tools
- Conclusion with CTA`;
        break;
    }

    return basePrompt + '\n\n' + specificInstructions;
  }

  /**
   * Generate schema markup
   */
  private generateSchema(pageType: string, keyword: any, content: any): any {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.metaDescription,
      keywords: keyword.keyword,
    };

    // Add type-specific schema
    if (pageType === 'QUESTION_PAGE') {
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: keyword.keyword,
            acceptedAnswer: {
              '@type': 'Answer',
              text: content.metaDescription,
            },
          },
        ],
      };
    }

    return baseSchema;
  }

  /**
   * Create URL slug
   */
  private createSlug(keyword: string, context?: any): string {
    let slug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (context?.location) {
      slug = `${slug}-${context.location.toLowerCase().replace(/\s+/g, '-')}`;
    }

    return slug;
  }

  /**
   * Bulk generate pages
   */
  async bulkGeneratePages(count: number = 100): Promise<number> {
    this.logger.log(`Bulk generating ${count} pages...`);

    // Get keywords without pages
    const keywords = await this.prisma.keyword.findMany({
      where: {
        generatedPages: {
          none: {},
        },
      },
      take: count,
      orderBy: { searchVolume: 'desc' },
    });

    let generated = 0;

    for (const keyword of keywords) {
      try {
        // Determine page type based on keyword intent
        let pageType: any = 'BLOG_POST';

        if (keyword.intent === 'TRANSACTIONAL') pageType = 'SERVICE_PAGE';
        if (keyword.intent === 'INFORMATIONAL' && keyword.keyword.includes('?')) pageType = 'QUESTION_PAGE';
        if (keyword.searchVolume > 5000) pageType = 'ULTIMATE_GUIDE';

        await this.generatePage({
          keywordId: keyword.id,
          pageType,
        });

        generated++;
      } catch (error) {
        this.logger.error(`Error generating page for ${keyword.keyword}: ${error.message}`);
      }
    }

    this.logger.log(`Generated ${generated} pages`);
    return generated;
  }

  /**
   * Get all programmatic pages
   */
  async getAllPages(limit: number = 100): Promise<any[]> {
    return this.prisma.programmaticPage.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        targetKeyword: true,
      },
    });
  }

  /**
   * Publish page (mark as published)
   */
  async publishPage(pageId: string): Promise<any> {
    return this.prisma.programmaticPage.update({
      where: { id: pageId },
      data: {
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Update page with internal links
   */
  async addInternalLinks(pageId: string, links: Array<{ text: string; url: string }>): Promise<any> {
    return this.prisma.programmaticPage.update({
      where: { id: pageId },
      data: {
        internalLinks: links,
      },
    });
  }

  /**
   * Get pages by type
   */
  async getPagesByType(pageType: string, limit: number = 50): Promise<any[]> {
    return this.prisma.programmaticPage.findMany({
      where: { pageType: pageType as any },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        targetKeyword: true,
      },
    });
  }

  /**
   * Get performance stats
   */
  async getPerformanceStats(): Promise<{
    totalPages: number;
    published: number;
    indexed: number;
    totalClicks: number;
    totalImpressions: number;
    avgPosition: number;
  }> {
    const totalPages = await this.prisma.programmaticPage.count();
    const published = await this.prisma.programmaticPage.count({
      where: { publishedAt: { not: null } },
    });
    const indexed = await this.prisma.programmaticPage.count({
      where: { indexed: true },
    });

    const aggregates = await this.prisma.programmaticPage.aggregate({
      _sum: {
        clicks: true,
        impressions: true,
      },
      _avg: {
        avgPosition: true,
      },
    });

    return {
      totalPages,
      published,
      indexed,
      totalClicks: aggregates._sum.clicks || 0,
      totalImpressions: aggregates._sum.impressions || 0,
      avgPosition: Number(aggregates._avg.avgPosition) || 0,
    };
  }
}
