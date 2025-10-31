import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * SEO Planner Service
 *
 * Generates optimization plans for target keywords:
 * - Creates detailed action plans
 * - Prioritizes keywords by strategy
 * - Generates content requirements
 * - Suggests internal linking strategies
 */

export interface OptimizationPlan {
  id: string;
  keywordId: string;
  keyword: string;

  // Strategy
  strategy: 'quick-win' | 'long-term' | 'competitive';
  priority: number; // 1-100
  estimatedImpact: number; // Expected traffic gain

  // Current state
  currentRank: number | null;
  targetRank: number;
  difficulty: number;
  searchVolume: number;

  // Action plan
  actions: OptimizationAction[];
  timeline: Timeline;
  resources: ResourceRequirements;

  // Success criteria
  successMetrics: SuccessMetrics;

  createdAt: Date;
}

export interface OptimizationAction {
  step: number;
  action: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours: number;
  dependencies: number[]; // Step numbers that must be completed first
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Timeline {
  estimatedDays: number;
  milestones: Milestone[];
}

export interface Milestone {
  day: number;
  title: string;
  deliverable: string;
}

export interface ResourceRequirements {
  contentWriting: number; // Hours
  technicalSEO: number; // Hours
  linkBuilding: number; // Number of links needed
  budget: number; // Estimated cost
}

export interface SuccessMetrics {
  targetRank: number;
  targetTraffic: number; // Monthly visits
  targetConversions: number; // Expected conversions
  estimatedROI: number; // Revenue / Cost
  trackingStartDate: Date;
}

export interface ContentRequirements {
  keywordId: string;
  keyword: string;

  // Content specs
  contentType: 'blog-post' | 'landing-page' | 'guide' | 'listicle' | 'how-to';
  targetWordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'friendly';

  // SEO requirements
  title: string;
  metaDescription: string;
  headingStructure: HeadingStructure[];
  keywords: {
    primary: string;
    secondary: string[];
    related: string[];
  };

  // Content elements
  requiredSections: string[];
  mediaRequirements: {
    images: number;
    videos: number;
    infographics: number;
  };

  // Internal linking
  internalLinks: {
    recommended: number;
    targetPages: string[];
  };

  // External links
  externalLinks: {
    recommended: number;
    authorityDomains: string[];
  };
}

export interface HeadingStructure {
  level: 'H1' | 'H2' | 'H3';
  text: string;
  includeKeyword: boolean;
}

@Injectable()
export class SEOPlannerService {
  private readonly logger = new Logger(SEOPlannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a comprehensive optimization plan for a keyword
   */
  async createOptimizationPlan(keywordId: string): Promise<OptimizationPlan> {
    this.logger.log(`Creating optimization plan for keyword: ${keywordId}`);

    // Get keyword data
    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      select: {
        id: true,
        keyword: true,
        searchVolume: true,
        difficulty: true,
        currentRank: true,
        category: true,
        intent: true,
      },
    });

    if (!keyword) {
      throw new Error(`Keyword not found: ${keywordId}`);
    }

    // Determine strategy
    const strategy = this.determineStrategy(keyword.difficulty, keyword.currentRank);
    const targetRank = this.calculateTargetRank(keyword.difficulty);
    const priority = this.calculatePriority(keyword);
    const estimatedImpact = this.estimateTrafficGain(keyword.searchVolume, keyword.currentRank, targetRank);

    // Generate action plan
    const actions = this.generateActions(keyword, strategy);
    const timeline = this.generateTimeline(keyword.difficulty, actions);
    const resources = this.calculateResources(keyword.difficulty, actions);
    const successMetrics = this.defineSuccessMetrics(keyword, targetRank);

    // Create the plan in the database
    const planData = {
      workflowType: 'SEO_EMPIRE' as const,
      planType: 'seo-optimization',
      targetId: keywordId,
      priority,
      impact: estimatedImpact,
      plan: {
        keyword: keyword.keyword,
        strategy,
        actions,
        timeline,
        resources,
        successMetrics,
      },
    };

    const savedPlan = await this.prisma.workflowPlan.create({
      data: planData as any, // Cast to any for JSON field compatibility
    });

    this.logger.log(`Optimization plan created: ${savedPlan.id}`);

    return {
      id: savedPlan.id,
      keywordId,
      keyword: keyword.keyword,
      strategy,
      priority,
      estimatedImpact,
      currentRank: keyword.currentRank,
      targetRank,
      difficulty: keyword.difficulty,
      searchVolume: keyword.searchVolume,
      actions,
      timeline,
      resources,
      successMetrics,
      createdAt: savedPlan.createdAt,
    };
  }

  /**
   * Prioritize keywords by strategy
   */
  async prioritizeKeywords(
    strategy: 'quick-wins' | 'long-term' | 'competitive',
    limit: number = 50,
  ): Promise<Array<{ keywordId: string; keyword: string; priority: number; estimatedImpact: number }>> {
    this.logger.log(`Prioritizing keywords for ${strategy} strategy...`);

    let where: any = {};

    switch (strategy) {
      case 'quick-wins':
        where = {
          difficulty: { lt: 40 },
          searchVolume: { gte: 200 },
          OR: [
            { currentRank: { gt: 20 } },
            { currentRank: null },
          ],
        };
        break;

      case 'long-term':
        where = {
          difficulty: { gte: 40, lte: 70 },
          searchVolume: { gte: 1000 },
        };
        break;

      case 'competitive':
        where = {
          difficulty: { gt: 70 },
          searchVolume: { gte: 2000 },
        };
        break;
    }

    const keywords = await this.prisma.keyword.findMany({
      where,
      select: {
        id: true,
        keyword: true,
        searchVolume: true,
        difficulty: true,
        currentRank: true,
      },
      orderBy: { searchVolume: 'desc' },
      take: limit,
    });

    const prioritized = keywords.map(kw => ({
      keywordId: kw.id,
      keyword: kw.keyword,
      priority: this.calculatePriority(kw),
      estimatedImpact: this.estimateTrafficGain(
        kw.searchVolume,
        kw.currentRank,
        this.calculateTargetRank(kw.difficulty),
      ),
    }));

    prioritized.sort((a, b) => b.priority - a.priority);

    this.logger.log(`Prioritized ${prioritized.length} keywords for ${strategy} strategy`);
    return prioritized;
  }

  /**
   * Generate content requirements for a keyword
   */
  async generateContentRequirements(keywordId: string): Promise<ContentRequirements> {
    this.logger.log(`Generating content requirements for keyword: ${keywordId}`);

    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      select: {
        id: true,
        keyword: true,
        searchVolume: true,
        difficulty: true,
        category: true,
        intent: true,
      },
    });

    if (!keyword) {
      throw new Error(`Keyword not found: ${keywordId}`);
    }

    // Determine content type based on intent
    const contentType = this.determineContentType(keyword.intent);
    const targetWordCount = this.calculateWordCount(keyword.difficulty, contentType);
    const tone = this.determineTone(keyword.intent);

    // Generate SEO elements
    const title = this.generateTitle(keyword.keyword, keyword.intent);
    const metaDescription = this.generateMetaDescription(keyword.keyword, keyword.intent);
    const headingStructure = this.generateHeadingStructure(keyword.keyword, contentType);

    // Get related keywords (for now, mock data - in production, query from keyword relationships)
    const secondaryKeywords = this.generateSecondaryKeywords(keyword.keyword);
    const relatedKeywords = this.generateRelatedKeywords(keyword.keyword);

    // Define required sections based on content type
    const requiredSections = this.getRequiredSections(contentType, keyword.intent);

    // Calculate media requirements
    const mediaRequirements = {
      images: Math.ceil(targetWordCount / 300), // 1 image per 300 words
      videos: contentType === 'how-to' || contentType === 'guide' ? 1 : 0,
      infographics: targetWordCount > 2000 ? 1 : 0,
    };

    // Internal linking strategy
    const internalLinks = {
      recommended: Math.ceil(targetWordCount / 500), // 1 link per 500 words
      targetPages: [], // TODO: Query related content from database
    };

    // External links to authority domains
    const externalLinks = {
      recommended: Math.ceil(targetWordCount / 400), // 1 link per 400 words
      authorityDomains: this.getAuthorityDomains(keyword.category),
    };

    return {
      keywordId,
      keyword: keyword.keyword,
      contentType,
      targetWordCount,
      tone,
      title,
      metaDescription,
      headingStructure,
      keywords: {
        primary: keyword.keyword,
        secondary: secondaryKeywords,
        related: relatedKeywords,
      },
      requiredSections,
      mediaRequirements,
      internalLinks,
      externalLinks,
    };
  }

  /**
   * Suggest internal linking opportunities
   * NOTE: Currently returns basic suggestions - in production, would analyze site structure
   */
  async suggestInternalLinks(keywordId: string): Promise<string[]> {
    this.logger.log(`Suggesting internal links for keyword: ${keywordId}`);

    const keyword = await this.prisma.keyword.findUnique({
      where: { id: keywordId },
      select: {
        keyword: true,
        category: true,
      },
    });

    if (!keyword) {
      throw new Error(`Keyword not found: ${keywordId}`);
    }

    // TODO: In production, query actual pages/content from the site
    // For now, return strategic linking suggestions
    const suggestions = [
      `Link to pillar content in the "${keyword.category}" category`,
      `Link to related articles containing "${keyword.keyword}" variations`,
      'Link to relevant product/service pages',
      'Link from high-authority pages to boost PageRank flow',
      'Add contextual links from recent blog posts',
    ];

    return suggestions;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private determineStrategy(difficulty: number, currentRank: number | null): 'quick-win' | 'long-term' | 'competitive' {
    if (difficulty < 40) return 'quick-win';
    if (difficulty < 70) return 'long-term';
    return 'competitive';
  }

  private calculateTargetRank(difficulty: number): number {
    if (difficulty <= 30) return 5;
    if (difficulty <= 60) return 10;
    return 20;
  }

  private calculatePriority(keyword: any): number {
    // Priority score (1-100) based on:
    // - Search volume (higher = higher priority)
    // - Difficulty (lower = higher priority for quick wins)
    // - Current rank (worse rank = higher improvement potential)

    const volumeScore = Math.min((keyword.searchVolume / 5000) * 50, 50);
    const difficultyScore = ((100 - keyword.difficulty) / 100) * 30;
    const rankScore = keyword.currentRank
      ? ((100 - keyword.currentRank) / 100) * 20
      : 20;

    return Math.round(volumeScore + difficultyScore + rankScore);
  }

  private estimateTrafficGain(searchVolume: number, currentRank: number | null, targetRank: number): number {
    const currentCTR = currentRank && currentRank <= 100 ? this.getCTR(currentRank) : 0;
    const targetCTR = this.getCTR(targetRank);

    const currentTraffic = searchVolume * currentCTR;
    const targetTraffic = searchVolume * targetCTR;

    return Math.round(targetTraffic - currentTraffic);
  }

  private getCTR(rank: number): number {
    const ctrMap: Record<number, number> = {
      1: 0.285, 2: 0.157, 3: 0.11, 4: 0.08, 5: 0.08,
      6: 0.05, 7: 0.05, 8: 0.05, 9: 0.05, 10: 0.05,
    };
    return ctrMap[rank] || (rank <= 20 ? 0.02 : 0.01);
  }

  private generateActions(keyword: any, strategy: string): OptimizationAction[] {
    const actions: OptimizationAction[] = [];
    let step = 1;

    // Step 1: Keyword research & content audit
    actions.push({
      step: step++,
      action: 'Keyword Research & Competitive Analysis',
      description: `Analyze top 10 competitors for "${keyword.keyword}". Identify content gaps and opportunities.`,
      priority: 'HIGH',
      estimatedHours: keyword.difficulty < 40 ? 2 : keyword.difficulty < 70 ? 4 : 8,
      dependencies: [],
      status: 'pending',
    });

    // Step 2: Content creation/optimization
    const contentHours = keyword.difficulty < 40 ? 4 : keyword.difficulty < 70 ? 8 : 16;
    actions.push({
      step: step++,
      action: 'Create/Optimize Content',
      description: `Create high-quality content targeting "${keyword.keyword}". Ensure proper on-page SEO.`,
      priority: 'HIGH',
      estimatedHours: contentHours,
      dependencies: [1],
      status: 'pending',
    });

    // Step 3: Technical SEO
    actions.push({
      step: step++,
      action: 'Technical SEO Optimization',
      description: 'Optimize page speed, mobile-friendliness, schema markup, and internal linking.',
      priority: 'HIGH',
      estimatedHours: 3,
      dependencies: [2],
      status: 'pending',
    });

    // Step 4: Link building (varies by difficulty)
    if (strategy !== 'quick-win') {
      const linkHours = keyword.difficulty < 70 ? 8 : 16;
      actions.push({
        step: step++,
        action: 'Link Building Campaign',
        description: `Build ${keyword.difficulty < 70 ? '15-25' : '30+'} high-quality backlinks through outreach and PR.`,
        priority: 'MEDIUM',
        estimatedHours: linkHours,
        dependencies: [2],
        status: 'pending',
      });
    }

    // Step 5: Content promotion
    actions.push({
      step: step++,
      action: 'Content Promotion',
      description: 'Promote content through social media, email, and community engagement.',
      priority: 'MEDIUM',
      estimatedHours: 4,
      dependencies: [2],
      status: 'pending',
    });

    // Step 6: Monitoring & iteration
    actions.push({
      step: step++,
      action: 'Monitor & Iterate',
      description: 'Track rankings, traffic, and user engagement. Optimize based on data.',
      priority: 'LOW',
      estimatedHours: 2,
      dependencies: [3, 4, 5].filter(d => d <= step),
      status: 'pending',
    });

    return actions;
  }

  private generateTimeline(difficulty: number, actions: OptimizationAction[]): Timeline {
    const totalHours = actions.reduce((sum, a) => sum + a.estimatedHours, 0);
    const estimatedDays = Math.ceil(totalHours / 4); // Assuming 4 hours/day of focused work

    const milestones: Milestone[] = [
      {
        day: Math.ceil(estimatedDays * 0.2),
        title: 'Research Complete',
        deliverable: 'Competitive analysis and content strategy document',
      },
      {
        day: Math.ceil(estimatedDays * 0.5),
        title: 'Content Published',
        deliverable: 'Optimized content live on site',
      },
      {
        day: Math.ceil(estimatedDays * 0.75),
        title: 'Promotion Complete',
        deliverable: 'Link building and promotion campaigns launched',
      },
      {
        day: estimatedDays,
        title: 'Monitoring Active',
        deliverable: 'Tracking setup and first optimization cycle complete',
      },
    ];

    return { estimatedDays, milestones };
  }

  private calculateResources(difficulty: number, actions: OptimizationAction[]): ResourceRequirements {
    const totalHours = actions.reduce((sum, a) => sum + a.estimatedHours, 0);
    const contentHours = actions.find(a => a.action.includes('Content'))?.estimatedHours || 0;
    const technicalHours = actions.find(a => a.action.includes('Technical'))?.estimatedHours || 0;
    const linksNeeded = difficulty < 40 ? 5 : difficulty < 70 ? 20 : 35;

    // Estimate budget (hourly rate + link building costs)
    const hourlyRate = 75; // $75/hour for SEO work
    const linkCost = difficulty < 40 ? 50 : difficulty < 70 ? 100 : 200; // Cost per quality link
    const budget = (totalHours * hourlyRate) + (linksNeeded * linkCost);

    return {
      contentWriting: contentHours,
      technicalSEO: technicalHours,
      linkBuilding: linksNeeded,
      budget: Math.round(budget),
    };
  }

  private defineSuccessMetrics(keyword: any, targetRank: number): SuccessMetrics {
    const targetTraffic = Math.round(keyword.searchVolume * this.getCTR(targetRank));
    const avgConversionRate = keyword.intent === 'transactional' ? 0.02 : 0.005; // 2% vs 0.5%
    const targetConversions = Math.round(targetTraffic * avgConversionRate);
    const avgOrderValue = 100; // Assuming $100 AOV
    const estimatedRevenue = targetConversions * avgOrderValue;
    const resources = this.calculateResources(keyword.difficulty, []);
    const estimatedROI = resources.budget > 0 ? estimatedRevenue / resources.budget : 0;

    return {
      targetRank,
      targetTraffic,
      targetConversions,
      estimatedROI: Math.round(estimatedROI * 100) / 100,
      trackingStartDate: new Date(),
    };
  }

  private determineContentType(intent: string | null): ContentRequirements['contentType'] {
    switch (intent) {
      case 'informational':
        return 'guide';
      case 'navigational':
        return 'landing-page';
      case 'transactional':
        return 'landing-page';
      case 'commercial':
        return 'listicle';
      default:
        return 'blog-post';
    }
  }

  private calculateWordCount(difficulty: number, contentType: string): number {
    const baseCount = contentType === 'guide' ? 2500 : contentType === 'landing-page' ? 1200 : 1500;
    const difficultyMultiplier = difficulty < 40 ? 0.8 : difficulty < 70 ? 1 : 1.5;
    return Math.round(baseCount * difficultyMultiplier);
  }

  private determineTone(intent: string | null): ContentRequirements['tone'] {
    switch (intent) {
      case 'informational':
        return 'professional';
      case 'transactional':
        return 'friendly';
      case 'commercial':
        return 'professional';
      default:
        return 'casual';
    }
  }

  private generateTitle(keyword: string, intent: string | null): string {
    const templates: Record<string, string[]> = {
      informational: [
        `The Complete Guide to ${keyword}`,
        `Everything You Need to Know About ${keyword}`,
        `${keyword}: A Comprehensive Guide`,
      ],
      transactional: [
        `Buy ${keyword} - Best Deals & Free Shipping`,
        `${keyword} - Shop Now & Save`,
      ],
      commercial: [
        `Top 10 ${keyword} Reviewed`,
        `Best ${keyword} Compared`,
      ],
    };

    const options = templates[intent || 'informational'] || templates.informational;
    return options[0];
  }

  private generateMetaDescription(keyword: string, intent: string | null): string {
    return `Discover the ultimate guide to ${keyword}. Learn everything you need to know with expert tips, best practices, and actionable advice.`;
  }

  private generateHeadingStructure(keyword: string, contentType: string): HeadingStructure[] {
    return [
      { level: 'H1', text: keyword, includeKeyword: true },
      { level: 'H2', text: `What is ${keyword}?`, includeKeyword: true },
      { level: 'H2', text: `Benefits of ${keyword}`, includeKeyword: true },
      { level: 'H2', text: `How to Get Started with ${keyword}`, includeKeyword: true },
      { level: 'H2', text: 'Best Practices', includeKeyword: false },
      { level: 'H2', text: 'Common Mistakes to Avoid', includeKeyword: false },
      { level: 'H2', text: 'Conclusion', includeKeyword: false },
    ];
  }

  private generateSecondaryKeywords(keyword: string): string[] {
    // In production, query related keywords from database
    return [
      `${keyword} guide`,
      `best ${keyword}`,
      `${keyword} tips`,
    ];
  }

  private generateRelatedKeywords(keyword: string): string[] {
    // In production, query semantic keywords
    return [
      `${keyword} tutorial`,
      `how to ${keyword}`,
      `${keyword} examples`,
    ];
  }

  private getRequiredSections(contentType: string, intent: string | null): string[] {
    const sections: Record<string, string[]> = {
      'guide': ['Introduction', 'Background', 'Step-by-Step Instructions', 'Examples', 'Best Practices', 'FAQs', 'Conclusion'],
      'blog-post': ['Introduction', 'Main Points', 'Examples', 'Conclusion', 'Call to Action'],
      'landing-page': ['Hero Section', 'Benefits', 'Features', 'Social Proof', 'FAQ', 'CTA'],
      'listicle': ['Introduction', 'List Items (numbered)', 'Comparison', 'Conclusion'],
      'how-to': ['Introduction', 'Prerequisites', 'Step-by-Step Guide', 'Tips & Tricks', 'Troubleshooting', 'Conclusion'],
    };

    return sections[contentType] || sections['blog-post'];
  }

  private getAuthorityDomains(category: string): string[] {
    // In production, maintain a database of authority domains by category
    const general = ['wikipedia.org', 'nytimes.com', 'forbes.com', 'techcrunch.com'];
    return general;
  }
}
