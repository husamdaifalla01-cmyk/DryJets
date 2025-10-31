# 🎯 PROMPT BATCHING IMPLEMENTATION GUIDE
**Autonomous Execution Instructions for Marketing Engine Development**

*This document contains detailed step-by-step instructions for building each phase of the Marketing Domination Engine. Follow this sequentially for autonomous execution.*

---

## 📋 EXECUTION PROTOCOL

### Before Starting Each Phase:
1. Update TODO list - mark phase as "in_progress"
2. Create all necessary service files
3. Update module imports
4. Test each component
5. Mark phase as "completed" in TODO
6. Move to next phase

### File Organization:
```
apps/api/src/modules/marketing/
├── services/
│   ├── seo/
│   │   ├── keyword-universe.service.ts
│   │   ├── programmatic-page.service.ts
│   │   ├── serp-intelligence.service.ts
│   │   ├── snippet-hijacker.service.ts
│   │   └── schema-automation.service.ts
│   ├── link-building/
│   │   ├── haro-automation.service.ts
│   │   ├── broken-link.service.ts
│   │   ├── partnership-network.service.ts
│   │   └── resource-page.service.ts
│   ├── trends/
│   │   ├── trend-collector.service.ts
│   │   ├── trend-predictor.service.ts
│   │   └── trend-analyzer.service.ts
│   ├── video/
│   │   ├── video-dna.service.ts
│   │   ├── multi-model-orchestrator.service.ts
│   │   ├── character-persistence.service.ts
│   │   └── video-quality-gate.service.ts
│   └── [other phases...]
```

---

## 🏗️ PHASE 1: SEO EMPIRE FOUNDATION

### Step 1.1: Database Schema Migration

**Action:** Add new Prisma models to schema

**File:** `packages/database/prisma/schema.prisma`

**Implementation:**
```prisma
// Add after existing models, before the end of file

// ============================================
// SEO & KEYWORD INTELLIGENCE
// ============================================

enum KeywordIntent {
  INFORMATIONAL
  COMMERCIAL
  TRANSACTIONAL
  NAVIGATIONAL
}

model Keyword {
  id                String   @id @default(cuid())
  keyword           String   @unique
  searchVolume      Int
  difficulty        Int      // 0-100
  cpc               Decimal? @db.Decimal(10, 2)
  intent            KeywordIntent
  category          String   // primary, secondary, tertiary, ultra-long-tail
  parentKeywordId   String?

  // SERP data
  currentRank       Int?
  previousRank      Int?
  bestRank          Int?
  featuredSnippet   Boolean  @default(false)

  // Metadata
  lastChecked       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relationships
  parentKeyword     Keyword?  @relation("KeywordHierarchy", fields: [parentKeywordId], references: [id])
  childKeywords     Keyword[] @relation("KeywordHierarchy")
  generatedPages    ProgrammaticPage[]
  serpResults       SerpResult[]

  @@index([keyword])
  @@index([searchVolume])
  @@index([currentRank])
}

enum PageType {
  LOCATION_PAGE
  SERVICE_PAGE
  COMPARISON_PAGE
  QUESTION_PAGE
  ULTIMATE_GUIDE
  BLOG_POST
}

model ProgrammaticPage {
  id                String   @id @default(cuid())
  slug              String   @unique
  title             String
  content           String   @db.Text
  metaDescription   String?

  pageType          PageType
  templateUsed      String

  targetKeywordId   String
  secondaryKeywords String[]
  schemaMarkup      Json?
  internalLinks     Json?

  publishedAt       DateTime?
  indexed           Boolean  @default(false)
  impressions       Int      @default(0)
  clicks            Int      @default(0)
  avgPosition       Decimal? @db.Decimal(5, 2)

  wordCount         Int
  readabilityScore  Int?
  originalityScore  Int?

  aiGenerated       Boolean  @default(true)
  humanReviewed     Boolean  @default(false)
  generationPrompt  String?  @db.Text

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  targetKeyword     Keyword  @relation(fields: [targetKeywordId], references: [id])
  cluster           ContentCluster? @relation("SpokePages", fields: [clusterId], references: [id])
  clusterId         String?
  pillarCluster     ContentCluster? @relation("PillarPage")

  @@index([slug])
  @@index([publishedAt])
  @@index([indexed])
}

model SerpResult {
  id              String   @id @default(cuid())
  keywordId       String
  position        Int
  url             String
  title           String
  description     String?
  domain          String

  isCompetitor    Boolean  @default(false)
  competitorName  String?

  hasSnippet      Boolean  @default(false)
  hasVideo        Boolean  @default(false)
  hasImage        Boolean  @default(false)

  estimatedTraffic Int?

  checkedAt       DateTime @default(now())

  keyword         Keyword  @relation(fields: [keywordId], references: [id])

  @@index([keywordId, checkedAt])
  @@index([domain])
}

model ContentCluster {
  id                String   @id @default(cuid())
  name              String
  pillarPageId      String?  @unique

  mainTopic         String
  keywords          String[]

  totalImpressions  Int      @default(0)
  totalClicks       Int      @default(0)
  avgPosition       Decimal? @db.Decimal(5, 2)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  pillarPage        ProgrammaticPage? @relation("PillarPage", fields: [pillarPageId], references: [id])
  spokePages        ProgrammaticPage[] @relation("SpokePages")

  @@index([mainTopic])
}

enum BacklinkType {
  HARO
  GUEST_POST
  BROKEN_LINK
  RESOURCE_PAGE
  PARTNERSHIP
  UGC_TOOL
  ORGANIC
  OTHER
}

enum BacklinkStatus {
  ACTIVE
  LOST
  TOXIC
  DISAVOWED
}

model Backlink {
  id              String   @id @default(cuid())
  sourceUrl       String
  sourceDomain    String
  targetUrl       String
  anchorText      String?

  domainAuthority Int?
  pageAuthority   Int?
  isDoFollow      Boolean  @default(true)

  acquisitionType BacklinkType
  outreachCampaignId String?

  status          BacklinkStatus @default(ACTIVE)
  firstSeen       DateTime @default(now())
  lastSeen        DateTime @default(now())
  lostAt          DateTime?

  createdAt       DateTime @default(now())

  @@index([sourceDomain])
  @@index([targetUrl])
  @@index([status])
}
```

**Commands to run:**
```bash
cd packages/database
npx prisma format
npx prisma generate
npx prisma db push
```

---

### Step 1.2: Create Keyword Universe Mapper Service

**File:** `apps/api/src/modules/marketing/services/seo/keyword-universe.service.ts`

**Purpose:** Discover, organize, and manage 100K+ keywords

**Implementation:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
}
```

---

### Step 1.3: Create Programmatic Page Generator Service

**File:** `apps/api/src/modules/marketing/services/seo/programmatic-page.service.ts`

**Purpose:** Auto-generate 100 pages per day

**Implementation:**
```typescript
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
}
```

---

### Step 1.4: Create SERP Intelligence Service

**File:** `apps/api/src/modules/marketing/services/seo/serp-intelligence.service.ts`

**Implementation:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SerpIntelligenceService {
  private readonly logger = new Logger('SerpIntelligence');

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  /**
   * Track keyword rankings
   */
  async trackKeywordRanking(keywordId: string): Promise<void> {
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
    });

    if (!keyword) return;

    // In production, use SERP API (SerpApi, DataForSEO, etc.)
    // For now, simulate ranking
    const simulatedRank = Math.floor(Math.random() * 100) + 1;

    await this.prisma.keyword.update({
      where: { id: keywordId },
      data: {
        previousRank: keyword.currentRank,
        currentRank: simulatedRank,
        bestRank: Math.min(keyword.bestRank || 100, simulatedRank),
        lastChecked: new Date(),
      },
    });

    this.logger.log(`Tracked ranking for "${keyword.keyword}": #${simulatedRank}`);
  }

  /**
   * Track all keywords (daily job)
   */
  async trackAllKeywords(): Promise<void> {
    const keywords = await this.prisma.keyword.findMany({
      take: 1000, // Track top 1000 keywords daily
      orderBy: { searchVolume: 'desc' },
    });

    for (const keyword of keywords) {
      await this.trackKeywordRanking(keyword.id);
    }

    this.logger.log(`Tracked ${keywords.length} keywords`);
  }

  /**
   * Get ranking improvements
   */
  async getRankingImprovements(): Promise<any[]> {
    const keywords = await this.prisma.keyword.findMany({
      where: {
        AND: [
          { currentRank: { not: null } },
          { previousRank: { not: null } },
        ],
      },
    });

    return keywords
      .filter(kw => kw.currentRank < kw.previousRank)
      .map(kw => ({
        keyword: kw.keyword,
        currentRank: kw.currentRank,
        previousRank: kw.previousRank,
        improvement: kw.previousRank - kw.currentRank,
      }))
      .sort((a, b) => b.improvement - a.improvement);
  }
}
```

---

*[CONTINUED IN NEXT SECTIONS DUE TO LENGTH...]*

**The guide continues with detailed implementations for:**
- Step 1.5: Featured Snippet Hijacker
- Step 1.6: Schema Automation Service
- Step 1.7: Marketing Controller Updates
- Step 1.8: Module Integration
- Phase 2: Link Building Empire (Steps 2.1-2.6)
- Phase 3: Trend Intelligence (Steps 3.1-3.5)
- Phase 4-15: Remaining phases with same level of detail

**Each phase includes:**
1. Exact file paths
2. Complete TypeScript code
3. Database commands
4. Testing instructions
5. Integration steps
6. Success criteria

---

## 🎯 AUTONOMOUS EXECUTION RULES

### Rule 1: Sequential Execution
- Complete Phase 1 entirely before moving to Phase 2
- Within each phase, complete steps in order
- Mark TODO items as completed after each step

### Rule 2: Error Handling
- If a step fails, log the error
- Attempt to fix automatically
- If cannot fix, create a note for human review
- Continue with next step

### Rule 3: Testing
- After each service creation, test basic functionality
- Ensure compilation succeeds
- Check database integration

### Rule 4: Documentation
- Add comments to complex logic
- Update README if needed
- Keep track of API endpoints created

### Rule 5: Progress Tracking
- Update TODO list after each major milestone
- Keep user informed of progress
- Celebrate completions!

---

## 📝 IMPLEMENTATION CHECKLIST

**Phase 1: SEO Empire** (Current)
- [ ] 1.1: Database schema migration
- [ ] 1.2: Keyword Universe Service
- [ ] 1.3: Programmatic Page Service
- [ ] 1.4: SERP Intelligence Service
- [ ] 1.5: Featured Snippet Hijacker
- [ ] 1.6: Schema Automation Service
- [ ] 1.7: Controller endpoints
- [ ] 1.8: Module integration
- [ ] 1.9: Testing & validation

**Phase 2-15:** Similar detailed checklists for each phase

---

*Document Version: 1.0*
*Created: 2025-10-25*
*Ready for autonomous execution*
