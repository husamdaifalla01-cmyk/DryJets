import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Content Strategist Service
 *
 * Generates content strategy from trend opportunities:
 * - Generate content ideas from trends
 * - Match trends to keyword opportunities
 * - Create content briefs (angle, structure, CTA)
 * - Prioritize content by impact potential
 * - Define content formats and distribution channels
 */

export interface ContentIdea {
  id: string;
  trendId: string;
  trendTopic: string;

  // Content details
  title: string;
  angle: string; // Unique perspective on the trend
  hook: string; // Opening line to grab attention
  format: 'blog-post' | 'video' | 'social-thread' | 'guide' | 'news-article' | 'infographic';

  // Target audience
  targetAudience: string[];
  painPoints: string[];

  // SEO integration
  primaryKeyword: string | null;
  secondaryKeywords: string[];
  estimatedSearchVolume: number;

  // Virality potential
  viralScore: number; // 0-100
  shareabilityFactors: string[];
  emotionalTriggers: string[];

  // Content requirements
  estimatedWordCount: number;
  requiredResearch: string[];
  suggestedSources: string[];

  // Distribution
  primaryChannel: string;
  secondaryChannels: string[];

  // Impact
  estimatedReach: number;
  estimatedEngagement: number;
  conversionPotential: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface KeywordMatch {
  trendId: string;
  trendTopic: string;
  keywordId: string;
  keyword: string;

  // Match quality
  matchScore: number; // 0-100
  matchType: 'EXACT' | 'SEMANTIC' | 'RELATED' | 'TANGENTIAL';

  // Opportunity metrics
  searchVolume: number;
  difficulty: number;
  currentRank: number | null;

  // Synergy potential
  contentAngle: string;
  synergyFactors: string[];
  estimatedRankImpact: number; // Position improvement estimate

  // Traffic potential
  estimatedTrafficGain: number;
  timeToRank: number; // Days
}

export interface ContentBrief {
  id: string;
  trendId: string;
  keywordId: string | null;

  // Core brief
  title: string;
  angle: string;
  targetAudience: string[];

  // Content structure
  outline: ContentSection[];
  wordCount: number;
  format: string;
  tone: 'professional' | 'casual' | 'authoritative' | 'conversational' | 'humorous';

  // SEO requirements
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordDensity: number; // Target percentage
  metaTitle: string;
  metaDescription: string;

  // Content requirements
  research: ResearchRequirement[];
  statistics: string[];
  examples: string[];
  visuals: VisualRequirement[];

  // Call to action
  cta: string;
  ctaType: 'newsletter' | 'product' | 'service' | 'download' | 'share';

  // Distribution strategy
  primaryChannel: string;
  secondaryChannels: string[];
  publishingTimeline: string;
  promotionStrategy: string[];

  // Success metrics
  targetMetrics: {
    views: number;
    engagement: number;
    shares: number;
    conversions: number;
  };

  // Tracking
  priority: number;
  estimatedImpact: number;
  conversionPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline: Date;
  createdAt: Date;
}

export interface ContentSection {
  heading: string;
  purpose: string;
  keyPoints: string[];
  wordCount: number;
  keywords: string[];
}

export interface ResearchRequirement {
  topic: string;
  depth: 'SURFACE' | 'MODERATE' | 'DEEP';
  sources: string[];
  requiredDataPoints: string[];
}

export interface VisualRequirement {
  type: 'image' | 'infographic' | 'chart' | 'diagram' | 'video';
  purpose: string;
  placement: string;
  description: string;
}

export interface PrioritizedContent {
  briefId: string;
  title: string;
  trendTopic: string;

  // Prioritization scores
  priorityScore: number; // 0-100
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';

  // ROI estimation
  estimatedReach: number;
  estimatedTraffic: number;
  estimatedConversions: number;
  estimatedRevenue: number;

  // Resource requirements
  timeToCreate: number; // Hours
  skillsRequired: string[];
  toolsRequired: string[];

  // Timing
  deadline: Date;
  timeWindow: number; // Days remaining

  // Recommendation
  recommendation: string;
  reasoning: string[];
}

@Injectable()
export class ContentStrategistService {
  private readonly logger = new Logger(ContentStrategistService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate content ideas from a trend
   */
  async generateContentIdeas(
    trendId: string,
    limit: number = 5,
  ): Promise<ContentIdea[]> {
    this.logger.log(`Generating content ideas for trend: ${trendId}`);

    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend not found: ${trendId}`);
    }

    this.logger.log(`Trend: "${trend.keyword}" (${trend.lifecycle}, viral: ${Number(trend.viralCoefficient) || 0})`);

    // Generate multiple content angles for the same trend
    const ideas: ContentIdea[] = [];

    // Angle 1: News/Announcement (if EMERGING or GROWING)
    if (trend.lifecycle === 'EMERGING' || trend.lifecycle === 'GROWING') {
      ideas.push(this.generateNewsAngleIdea(trend));
    }

    // Angle 2: How-to/Guide
    ideas.push(this.generateHowToIdea(trend));

    // Angle 3: Analysis/Opinion (if PEAK or high viral)
    if (trend.lifecycle === 'PEAK' || Number(trend.viralCoefficient) || 0 >= 75) {
      ideas.push(this.generateAnalysisIdea(trend));
    }

    // Angle 4: Listicle (always works)
    ideas.push(this.generateListicleIdea(trend));

    // Angle 5: Case Study/Example (if high relevance)
    if (trend.relevanceScore >= 70) {
      ideas.push(this.generateCaseStudyIdea(trend));
    }

    this.logger.log(`Generated ${ideas.length} content ideas`);

    return ideas.slice(0, limit);
  }

  /**
   * Match trends to keyword opportunities
   */
  async matchTrendToKeywords(
    trendId: string,
    limit: number = 10,
  ): Promise<KeywordMatch[]> {
    this.logger.log(`Matching trend ${trendId} to keywords...`);

    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend not found: ${trendId}`);
    }

    // Find keywords that relate to the trend topic
    const trendWords = trend.keyword.toLowerCase().split(/\s+/);
    const keywords = await this.prisma.keyword.findMany({
      where: {
        OR: trendWords.map(word => ({
          keyword: { contains: word, mode: 'insensitive' as any },
        })),
      },
      take: 50, // Get more to filter later
    });

    this.logger.log(`Found ${keywords.length} potential keyword matches`);

    // Score each keyword match
    const matches: KeywordMatch[] = keywords
      .map(keyword => {
        const matchScore = this.calculateKeywordMatchScore(trend, keyword);
        const matchType = this.determineMatchType(trend.keyword, keyword.keyword);
        const contentAngle = this.generateContentAngle(trend.keyword, keyword.keyword);
        const synergyFactors = this.identifySynergyFactors(trend, keyword);
        const estimatedRankImpact = this.estimateRankImpact(keyword, Number(trend.viralCoefficient) || 0);
        const estimatedTrafficGain = this.estimateTrafficGain(
          keyword.searchVolume,
          keyword.currentRank,
          estimatedRankImpact,
        );
        const timeToRank = this.estimateTimeToRank(keyword.difficulty, trend.lifecycle);

        return {
          trendId: trend.id,
          trendTopic: trend.keyword,
          keywordId: keyword.id,
          keyword: keyword.keyword,
          matchScore,
          matchType,
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty,
          currentRank: keyword.currentRank,
          contentAngle,
          synergyFactors,
          estimatedRankImpact,
          estimatedTrafficGain,
          timeToRank,
        };
      })
      .filter(m => m.matchScore >= 50) // Only keep good matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    this.logger.log(`Identified ${matches.length} high-quality keyword matches`);

    return matches;
  }

  /**
   * Create a detailed content brief
   */
  async createContentBrief(
    trendId: string,
    angle: string,
    keywordId?: string,
  ): Promise<ContentBrief> {
    this.logger.log(`Creating content brief for trend: ${trendId}, angle: ${angle}`);

    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) {
      throw new Error(`Trend not found: ${trendId}`);
    }

    // Get keyword if provided
    let keyword: any = null;
    if (keywordId) {
      keyword = await this.prisma.keyword.findUnique({
        where: { id: keywordId },
      });
    }

    // Generate title based on angle
    const title = this.generateTitle(trend.keyword, angle, keyword?.keyword);

    // Generate outline
    const outline = this.generateOutline(trend.keyword, angle, keyword?.keyword);

    // Calculate word count based on format and depth
    const wordCount = this.calculateWordCount(angle, Number(trend.viralCoefficient) || 0);

    // Determine format
    const format = this.determineFormat(trend, angle);

    // Select tone
    const tone = this.selectTone(trend.pillar[0] || 'general', angle);

    // SEO requirements
    const primaryKeyword = keyword?.keyword || this.extractPrimaryKeyword(trend.keyword);
    const secondaryKeywords = this.generateSecondaryKeywords(trend.keyword, keyword?.keyword);
    const metaTitle = this.generateMetaTitle(title, primaryKeyword);
    const metaDescription = this.generateMetaDescription(trend.keyword, primaryKeyword);

    // Research requirements
    const research = this.generateResearchRequirements(trend.keyword, angle);

    // Visuals
    const visuals = this.generateVisualRequirements(format, outline.length);

    // CTA
    const { cta, ctaType } = this.generateCTA(angle, trend.pillar[0] || 'general');

    // Distribution
    const primaryChannel = this.selectPrimaryChannel(trend, format);
    const secondaryChannels = this.selectSecondaryChannels(trend, format);

    // Timeline
    const deadline = this.calculateDeadline(trend.lifecycle, Number(trend.viralCoefficient) || 0);
    const publishingTimeline = this.generatePublishingTimeline(deadline);

    // Promotion strategy
    const promotionStrategy = this.generatePromotionStrategy(trend, format, primaryChannel);

    // Success metrics
    const targetMetrics = this.calculateTargetMetrics(
      Number(trend.viralCoefficient) || 0,
      keyword?.searchVolume || 0,
    );

    // Priority and impact
    const priority = this.calculatePriority(trend, keyword);
    const estimatedImpact = this.estimateContentImpact(trend, keyword, format);

    const brief: ContentBrief = {
      id: `brief-${Date.now()}`,
      trendId: trend.id,
      keywordId: keywordId || null,
      title,
      angle,
      targetAudience: this.identifyTargetAudience(trend.pillar[0] || 'general'),
      outline,
      wordCount,
      format,
      tone,
      primaryKeyword,
      secondaryKeywords,
      keywordDensity: 1.5, // 1.5% target
      metaTitle,
      metaDescription,
      research,
      statistics: this.suggestStatistics(trend.keyword),
      examples: this.suggestExamples(trend.keyword),
      visuals,
      cta,
      ctaType,
      primaryChannel,
      secondaryChannels,
      publishingTimeline,
      promotionStrategy,
      targetMetrics,
      priority,
      estimatedImpact,
      conversionPotential: this.determineConversionPotential(angle, format),
      deadline,
      createdAt: new Date(),
    };

    this.logger.log(`Content brief created: "${title}"`);
    this.logger.log(`  Format: ${format}, Word count: ${wordCount}, Priority: ${priority}`);

    return brief;
  }

  /**
   * Prioritize content briefs by various criteria
   */
  async prioritizeContent(
    criteria: 'viral' | 'evergreen' | 'conversion' = 'viral',
    limit: number = 20,
  ): Promise<PrioritizedContent[]> {
    this.logger.log(`Prioritizing content by criteria: ${criteria}`);

    // Get trends that are good for content
    const trends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: { in: ['EMERGING', 'GROWING', 'PEAK'] },
        relevanceScore: { gte: 60 },
      },
      take: 50,
    });

    this.logger.log(`Found ${trends.length} content-worthy trends`);

    // Create briefs and prioritize
    const prioritized: PrioritizedContent[] = [];

    for (const trend of trends) {
      // Determine best angle based on criteria
      const angle = this.selectBestAngle(trend, criteria);

      // Find matching keyword
      const matches = await this.matchTrendToKeywords(trend.id, 1);
      const keywordId = matches.length > 0 ? matches[0].keywordId : undefined;

      // Create brief
      const brief = await this.createContentBrief(trend.id, angle, keywordId);

      // Calculate prioritization metrics
      const priorityScore = this.calculatePriorityScore(brief, trend, criteria);
      const urgency = this.determineUrgency(trend.lifecycle);
      const impact = this.categorizeImpact(brief.estimatedImpact);
      const effort = this.estimateEffort(brief.wordCount, brief.research.length);

      // ROI estimation
      const estimatedReach = brief.targetMetrics.views;
      const estimatedTraffic = matches.length > 0 ? matches[0].estimatedTrafficGain : 0;
      const estimatedConversions = Math.round(estimatedTraffic * 0.02); // 2% conversion rate
      const estimatedRevenue = estimatedConversions * 100; // $100 per conversion

      // Resource requirements
      const timeToCreate = this.estimateCreationTime(brief.wordCount, brief.research.length);
      const skillsRequired = this.identifyRequiredSkills(brief.format, brief.research);
      const toolsRequired = this.identifyRequiredTools(brief.format, brief.visuals);

      // Timing
      const timeWindow = Math.max(
        0,
        Math.floor((brief.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );

      // Recommendation
      const { recommendation, reasoning } = this.generateRecommendation(
        priorityScore,
        urgency,
        impact,
        effort,
        timeWindow,
      );

      prioritized.push({
        briefId: brief.id,
        title: brief.title,
        trendTopic: trend.keyword,
        priorityScore,
        urgency,
        impact,
        effort,
        estimatedReach,
        estimatedTraffic,
        estimatedConversions,
        estimatedRevenue,
        timeToCreate,
        skillsRequired,
        toolsRequired,
        deadline: brief.deadline,
        timeWindow,
        recommendation,
        reasoning,
      });
    }

    // Sort by priority score
    const sorted = prioritized.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, limit);

    this.logger.log(`Prioritized ${sorted.length} content pieces`);
    this.logger.log(`Top 3:`);
    sorted.slice(0, 3).forEach((p, i) => {
      this.logger.log(`  ${i + 1}. "${p.title}" (score: ${p.priorityScore}, urgency: ${p.urgency})`);
    });

    return sorted;
  }

  // ============================================
  // PRIVATE HELPER METHODS - IDEA GENERATION
  // ============================================

  private generateNewsAngleIdea(trend: any): ContentIdea {
    return {
      id: `idea-${Date.now()}-news`,
      trendId: trend.id,
      trendTopic: trend.keyword,
      title: `Breaking: ${trend.keyword} - What You Need to Know`,
      angle: 'news',
      hook: `A new trend is emerging in ${trend.pillar[0] || 'general'} that could change everything.`,
      format: 'news-article',
      targetAudience: this.identifyTargetAudience(trend.pillar[0] || 'general'),
      painPoints: ['staying up-to-date', 'missing important trends', 'competitive disadvantage'],
      primaryKeyword: null,
      secondaryKeywords: this.extractKeywords(trend.keyword),
      estimatedSearchVolume: Math.round(Number(trend.viralCoefficient) || 0 * 100),
      viralScore: Number(trend.viralCoefficient) || 0,
      shareabilityFactors: ['timeliness', 'novelty', 'relevance'],
      emotionalTriggers: ['curiosity', 'FOMO', 'excitement'],
      estimatedWordCount: 800,
      requiredResearch: ['trend source', 'expert opinions', 'early adopter reactions'],
      suggestedSources: [trend.source, 'industry publications', 'social media'],
      primaryChannel: this.selectPrimaryChannelForFormat('news-article', trend),
      secondaryChannels: ['twitter', 'linkedin'],
      estimatedReach: Math.round(Number(trend.viralCoefficient) || 0 * 1000),
      estimatedEngagement: Math.round(Number(trend.viralCoefficient) || 0 * 50),
      conversionPotential: 'MEDIUM',
    };
  }

  private generateHowToIdea(trend: any): ContentIdea {
    return {
      id: `idea-${Date.now()}-howto`,
      trendId: trend.id,
      trendTopic: trend.keyword,
      title: `How to Leverage ${trend.keyword} for Your Business`,
      angle: 'how-to',
      hook: `Want to capitalize on ${trend.keyword}? Here's your step-by-step guide.`,
      format: 'guide',
      targetAudience: this.identifyTargetAudience(trend.pillar[0] || 'general'),
      painPoints: ['unclear implementation', 'lack of expertise', 'fear of missing out'],
      primaryKeyword: null,
      secondaryKeywords: this.extractKeywords(`how to ${trend.keyword}`),
      estimatedSearchVolume: Math.round(trend.relevanceScore * 50),
      viralScore: Math.round(Number(trend.viralCoefficient) || 0 * 0.7),
      shareabilityFactors: ['practicality', 'comprehensiveness', 'actionability'],
      emotionalTriggers: ['curiosity', 'empowerment', 'confidence'],
      estimatedWordCount: 2000,
      requiredResearch: ['implementation steps', 'best practices', 'common mistakes'],
      suggestedSources: ['expert guides', 'case studies', 'tutorials'],
      primaryChannel: this.selectPrimaryChannelForFormat('guide', trend),
      secondaryChannels: ['blog', 'youtube'],
      estimatedReach: Math.round(trend.relevanceScore * 800),
      estimatedEngagement: Math.round(trend.relevanceScore * 40),
      conversionPotential: 'HIGH',
    };
  }

  private generateAnalysisIdea(trend: any): ContentIdea {
    return {
      id: `idea-${Date.now()}-analysis`,
      trendId: trend.id,
      trendTopic: trend.keyword,
      title: `${trend.keyword}: Hype or Reality? An In-Depth Analysis`,
      angle: 'analysis',
      hook: `Everyone's talking about ${trend.keyword}, but is it worth your attention?`,
      format: 'blog-post',
      targetAudience: this.identifyTargetAudience(trend.pillar[0] || 'general'),
      painPoints: ['information overload', 'unclear value proposition', 'skepticism'],
      primaryKeyword: null,
      secondaryKeywords: this.extractKeywords(`${trend.keyword} analysis`),
      estimatedSearchVolume: Math.round(trend.relevanceScore * 30),
      viralScore: Math.round(Number(trend.viralCoefficient) || 0 * 0.8),
      shareabilityFactors: ['thoughtfulness', 'balanced perspective', 'data-driven'],
      emotionalTriggers: ['curiosity', 'validation', 'intellectual stimulation'],
      estimatedWordCount: 1500,
      requiredResearch: ['trend data', 'expert opinions', 'pros and cons'],
      suggestedSources: ['industry reports', 'expert interviews', 'data sources'],
      primaryChannel: this.selectPrimaryChannelForFormat('blog-post', trend),
      secondaryChannels: ['linkedin', 'medium'],
      estimatedReach: Math.round(trend.relevanceScore * 600),
      estimatedEngagement: Math.round(trend.relevanceScore * 35),
      conversionPotential: 'MEDIUM',
    };
  }

  private generateListicleIdea(trend: any): ContentIdea {
    return {
      id: `idea-${Date.now()}-listicle`,
      trendId: trend.id,
      trendTopic: trend.keyword,
      title: `10 Ways ${trend.keyword} Will Transform ${trend.pillar[0] || 'general'}`,
      angle: 'listicle',
      hook: `${trend.keyword} is reshaping ${trend.pillar[0] || 'general'}. Here are the top 10 impacts.`,
      format: 'blog-post',
      targetAudience: this.identifyTargetAudience(trend.pillar[0] || 'general'),
      painPoints: ['information overload', 'lack of clarity', 'need for quick insights'],
      primaryKeyword: null,
      secondaryKeywords: this.extractKeywords(trend.keyword),
      estimatedSearchVolume: Math.round(Number(trend.viralCoefficient) || 0 * 80),
      viralScore: Math.round(Number(trend.viralCoefficient) || 0 * 0.9),
      shareabilityFactors: ['scannability', 'visual appeal', 'bite-sized insights'],
      emotionalTriggers: ['curiosity', 'satisfaction', 'shareability'],
      estimatedWordCount: 1200,
      requiredResearch: ['trend applications', 'examples', 'statistics'],
      suggestedSources: ['case studies', 'expert quotes', 'data sources'],
      primaryChannel: this.selectPrimaryChannelForFormat('blog-post', trend),
      secondaryChannels: ['social-media', 'email'],
      estimatedReach: Math.round(Number(trend.viralCoefficient) || 0 * 1200),
      estimatedEngagement: Math.round(Number(trend.viralCoefficient) || 0 * 60),
      conversionPotential: 'MEDIUM',
    };
  }

  private generateCaseStudyIdea(trend: any): ContentIdea {
    return {
      id: `idea-${Date.now()}-case`,
      trendId: trend.id,
      trendTopic: trend.keyword,
      title: `Case Study: How [Company] Used ${trend.keyword} to [Achieve Result]`,
      angle: 'case-study',
      hook: `Real-world proof that ${trend.keyword} works. Here's the full story.`,
      format: 'blog-post',
      targetAudience: this.identifyTargetAudience(trend.pillar[0] || 'general'),
      painPoints: ['skepticism', 'need for proof', 'implementation uncertainty'],
      primaryKeyword: null,
      secondaryKeywords: this.extractKeywords(`${trend.keyword} case study`),
      estimatedSearchVolume: Math.round(trend.relevanceScore * 25),
      viralScore: Math.round(Number(trend.viralCoefficient) || 0 * 0.6),
      shareabilityFactors: ['credibility', 'specificity', 'results-driven'],
      emotionalTriggers: ['trust', 'inspiration', 'validation'],
      estimatedWordCount: 1800,
      requiredResearch: ['company background', 'implementation details', 'results data'],
      suggestedSources: ['company interviews', 'published results', 'third-party validation'],
      primaryChannel: this.selectPrimaryChannelForFormat('blog-post', trend),
      secondaryChannels: ['linkedin', 'email'],
      estimatedReach: Math.round(trend.relevanceScore * 500),
      estimatedEngagement: Math.round(trend.relevanceScore * 30),
      conversionPotential: 'HIGH',
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS - KEYWORD MATCHING
  // ============================================

  private calculateKeywordMatchScore(trend: any, keyword: any): number {
    // Calculate match quality
    let score = 0;

    // Exact match
    if (trend.keyword.toLowerCase().includes(keyword.keyword.toLowerCase())) {
      score += 50;
    }

    // Word overlap
    const trendWords = trend.keyword.toLowerCase().split(/\s+/);
    const keywordWords = keyword.keyword.toLowerCase().split(/\s+/);
    const overlap = trendWords.filter(w => keywordWords.includes(w)).length;
    score += (overlap / Math.max(trendWords.length, keywordWords.length)) * 30;

    // Relevance alignment
    score += (trend.relevanceScore / 100) * 10;

    // Category alignment
    if (keyword.category === trend.pillar[0] || 'general') {
      score += 10;
    }

    return Math.round(Math.min(100, score));
  }

  private determineMatchType(trendTopic: string, keyword: string): 'EXACT' | 'SEMANTIC' | 'RELATED' | 'TANGENTIAL' {
    const trendLower = trendTopic.toLowerCase();
    const keywordLower = keyword.toLowerCase();

    if (trendLower === keywordLower) return 'EXACT';
    if (trendLower.includes(keywordLower) || keywordLower.includes(trendLower)) return 'SEMANTIC';

    const trendWords = trendLower.split(/\s+/);
    const keywordWords = keywordLower.split(/\s+/);
    const overlap = trendWords.filter(w => keywordWords.includes(w)).length;

    if (overlap >= 2) return 'RELATED';
    return 'TANGENTIAL';
  }

  private generateContentAngle(trendTopic: string, keyword: string): string {
    // Generate a unique angle combining trend and keyword
    const angles = [
      `How ${trendTopic} is changing ${keyword}`,
      `The ultimate guide to ${keyword} in the age of ${trendTopic}`,
      `Why ${keyword} matters for ${trendTopic}`,
      `${keyword}: The secret to mastering ${trendTopic}`,
      `${trendTopic} meets ${keyword}: What you need to know`,
    ];

    return angles[Math.floor(Math.random() * angles.length)];
  }

  private identifySynergyFactors(trend: any, keyword: any): string[] {
    const factors: string[] = [];

    if (Number(trend.viralCoefficient) || 0 >= 80 && keyword.searchVolume >= 1000) {
      factors.push('High viral potential + High search volume');
    }

    if (trend.lifecycle === 'EMERGING' && keyword.difficulty < 40) {
      factors.push('Emerging trend + Low difficulty keyword');
    }

    if (trend.lifecycle === 'GROWING' && !keyword.currentRank) {
      factors.push('Growing trend + Unranked keyword (fresh opportunity)');
    }

    if (trend.relevanceScore >= 80 && keyword.searchVolume >= 500) {
      factors.push('Highly relevant trend + Meaningful search volume');
    }

    if (factors.length === 0) {
      factors.push('General topic alignment');
    }

    return factors;
  }

  private estimateRankImpact(keyword: any, viralCoefficient: number): number {
    // Estimate how many positions we could improve by combining keyword + trend
    const baseImprovement = keyword.currentRank ? Math.floor(keyword.currentRank * 0.3) : 20;
    const viralBoost = Math.floor((viralCoefficient / 100) * 10);
    return Math.min(50, baseImprovement + viralBoost);
  }

  private estimateTrafficGain(searchVolume: number, currentRank: number | null, rankImprovement: number): number {
    const ctrBefore = currentRank ? this.getCTR(currentRank) : 0;
    const newRank = currentRank ? Math.max(1, currentRank - rankImprovement) : rankImprovement;
    const ctrAfter = this.getCTR(newRank);

    const trafficBefore = searchVolume * ctrBefore;
    const trafficAfter = searchVolume * ctrAfter;

    return Math.round(trafficAfter - trafficBefore);
  }

  private getCTR(rank: number): number {
    const ctrMap: Record<number, number> = {
      1: 0.285, 2: 0.157, 3: 0.11, 4: 0.08, 5: 0.08,
      6: 0.05, 7: 0.05, 8: 0.05, 9: 0.05, 10: 0.05,
    };
    return ctrMap[rank] || (rank <= 20 ? 0.02 : rank <= 50 ? 0.01 : 0.005);
  }

  private estimateTimeToRank(difficulty: number, lifecycle: string): number {
    let baseDays = difficulty * 2; // 2 days per difficulty point

    // Trend timing adjustment
    if (lifecycle === 'EMERGING') baseDays *= 0.7;
    if (lifecycle === 'GROWING') baseDays *= 0.8;
    if (lifecycle === 'PEAK') baseDays *= 0.9;

    return Math.round(baseDays);
  }

  // ============================================
  // PRIVATE HELPER METHODS - CONTENT BRIEF
  // ============================================

  private generateTitle(trendTopic: string, angle: string, keyword?: string): string {
    const templates: Record<string, string[]> = {
      news: [
        `Breaking: ${trendTopic} - What You Need to Know`,
        `${trendTopic}: The Latest Developments`,
        `${trendTopic} Explained: Everything You Need to Know`,
      ],
      'how-to': [
        `How to Leverage ${trendTopic} ${keyword ? `for ${keyword}` : ''}`,
        `The Complete Guide to ${trendTopic}`,
        `Master ${trendTopic}: A Step-by-Step Guide`,
      ],
      analysis: [
        `${trendTopic}: Hype or Reality?`,
        `The Truth About ${trendTopic}`,
        `${trendTopic} - An In-Depth Analysis`,
      ],
      listicle: [
        `10 Ways ${trendTopic} Will Transform ${keyword || 'Your Business'}`,
        `7 Things You Need to Know About ${trendTopic}`,
        `The Top 5 ${trendTopic} Trends to Watch`,
      ],
      'case-study': [
        `Case Study: Success with ${trendTopic}`,
        `How [Company] Used ${trendTopic} to [Achieve Result]`,
        `Real Results: ${trendTopic} in Action`,
      ],
    };

    const options = templates[angle] || templates.news;
    return options[0];
  }

  private generateOutline(trendTopic: string, angle: string, keyword?: string): ContentSection[] {
    const outlines: Record<string, ContentSection[]> = {
      news: [
        {
          heading: 'Introduction',
          purpose: 'Hook the reader and explain the trend',
          keyPoints: ['What is happening', 'Why it matters', 'Who is affected'],
          wordCount: 150,
          keywords: [trendTopic],
        },
        {
          heading: 'Background',
          purpose: 'Provide context',
          keyPoints: ['Origin of the trend', 'Key players', 'Timeline'],
          wordCount: 200,
          keywords: [trendTopic, 'background'],
        },
        {
          heading: 'Key Developments',
          purpose: 'Detail the main points',
          keyPoints: ['Latest updates', 'Expert reactions', 'Data and statistics'],
          wordCount: 250,
          keywords: [trendTopic, 'developments'],
        },
        {
          heading: 'Implications',
          purpose: 'Explain impact',
          keyPoints: ['Short-term effects', 'Long-term consequences', 'What to watch for'],
          wordCount: 150,
          keywords: [trendTopic, 'impact'],
        },
        {
          heading: 'Conclusion',
          purpose: 'Wrap up and CTA',
          keyPoints: ['Summary', 'Next steps', 'Call to action'],
          wordCount: 100,
          keywords: [trendTopic],
        },
      ],
      'how-to': [
        {
          heading: 'Introduction',
          purpose: 'Explain what the reader will learn',
          keyPoints: ['Problem statement', 'Solution overview', 'Expected outcomes'],
          wordCount: 200,
          keywords: [keyword || trendTopic],
        },
        {
          heading: 'Prerequisites',
          purpose: 'Set expectations',
          keyPoints: ['Required knowledge', 'Tools needed', 'Time commitment'],
          wordCount: 150,
          keywords: ['requirements', 'tools'],
        },
        {
          heading: 'Step-by-Step Guide',
          purpose: 'Main instructional content',
          keyPoints: ['Detailed steps', 'Screenshots/examples', 'Tips and tricks'],
          wordCount: 1000,
          keywords: [keyword || trendTopic, 'guide', 'tutorial'],
        },
        {
          heading: 'Common Mistakes',
          purpose: 'Help avoid pitfalls',
          keyPoints: ['What to avoid', 'Troubleshooting', 'Best practices'],
          wordCount: 300,
          keywords: ['mistakes', 'best practices'],
        },
        {
          heading: 'Conclusion',
          purpose: 'Recap and encourage action',
          keyPoints: ['Summary', 'Next steps', 'Additional resources'],
          wordCount: 150,
          keywords: [keyword || trendTopic],
        },
      ],
    };

    return outlines[angle] || outlines.news;
  }

  private calculateWordCount(angle: string, viralCoefficient: number): number {
    const baseCounts: Record<string, number> = {
      news: 800,
      'how-to': 2000,
      analysis: 1500,
      listicle: 1200,
      'case-study': 1800,
    };

    const baseCount = baseCounts[angle] || 1000;

    // High viral content can be shorter
    if (viralCoefficient >= 85) {
      return Math.round(baseCount * 0.7);
    }

    return baseCount;
  }

  private determineFormat(trend: any, angle: string): string {
    if (Number(trend.viralCoefficient) || 0 >= 85 && angle !== 'how-to') return 'video';
    if (angle === 'how-to') return 'guide';
    if (trend.lifecycle === 'PEAK' && trend.source === 'twitter') return 'social-thread';
    if (angle === 'news') return 'news-article';
    return 'blog-post';
  }

  private selectTone(category: string, angle: string): 'professional' | 'casual' | 'authoritative' | 'conversational' | 'humorous' {
    if (category === 'business' || category === 'finance') return 'professional';
    if (angle === 'analysis') return 'authoritative';
    if (angle === 'how-to') return 'conversational';
    return 'casual';
  }

  private extractPrimaryKeyword(topic: string): string {
    return topic.toLowerCase();
  }

  private generateSecondaryKeywords(topic: string, primaryKeyword?: string): string[] {
    const words = topic.toLowerCase().split(/\s+/);
    const keywords: string[] = [];

    // Add variations
    keywords.push(`${topic} guide`);
    keywords.push(`${topic} trends`);
    keywords.push(`${topic} examples`);

    if (primaryKeyword) {
      keywords.push(`${primaryKeyword} ${topic}`);
    }

    return keywords.slice(0, 5);
  }

  private generateMetaTitle(title: string, keyword: string): string {
    if (title.length <= 60) return title;
    return `${keyword} - ${title.slice(0, 50)}...`;
  }

  private generateMetaDescription(topic: string, keyword: string): string {
    return `Discover everything you need to know about ${topic}. Learn how ${keyword} is changing the game. Read our comprehensive guide.`;
  }

  private generateResearchRequirements(topic: string, angle: string): ResearchRequirement[] {
    const baseRequirements: ResearchRequirement[] = [
      {
        topic: `${topic} overview`,
        depth: 'MODERATE',
        sources: ['industry publications', 'expert blogs'],
        requiredDataPoints: ['key definitions', 'current state', 'main players'],
      },
    ];

    if (angle === 'how-to') {
      baseRequirements.push({
        topic: 'Implementation steps',
        depth: 'DEEP',
        sources: ['tutorials', 'documentation', 'case studies'],
        requiredDataPoints: ['step-by-step process', 'tools required', 'common issues'],
      });
    }

    if (angle === 'analysis') {
      baseRequirements.push({
        topic: 'Data and statistics',
        depth: 'DEEP',
        sources: ['research reports', 'data sources', 'surveys'],
        requiredDataPoints: ['growth metrics', 'adoption rates', 'market size'],
      });
    }

    return baseRequirements;
  }

  private suggestStatistics(topic: string): string[] {
    return [
      `Market size of ${topic}`,
      `Growth rate of ${topic}`,
      `Adoption rate among businesses`,
      `ROI statistics`,
      `User satisfaction metrics`,
    ];
  }

  private suggestExamples(topic: string): string[] {
    return [
      `Real-world use case of ${topic}`,
      `Success story`,
      `Before/after comparison`,
      `Industry-specific application`,
    ];
  }

  private generateVisualRequirements(format: string, sectionCount: number): VisualRequirement[] {
    const visuals: VisualRequirement[] = [
      {
        type: 'image',
        purpose: 'Featured image for social sharing',
        placement: 'Top of article',
        description: 'Eye-catching header image relevant to topic',
      },
    ];

    if (format === 'guide' || format === 'blog-post') {
      visuals.push({
        type: 'infographic',
        purpose: 'Visualize key statistics',
        placement: 'Mid-article',
        description: 'Data visualization showing trend growth',
      });
    }

    if (sectionCount >= 5) {
      visuals.push({
        type: 'chart',
        purpose: 'Break up text and illustrate concepts',
        placement: 'After each major section',
        description: 'Supporting images or diagrams',
      });
    }

    return visuals;
  }

  private generateCTA(angle: string, category: string): { cta: string; ctaType: 'newsletter' | 'product' | 'service' | 'download' | 'share' } {
    if (angle === 'how-to') {
      return {
        cta: 'Ready to implement this? Download our free checklist.',
        ctaType: 'download',
      };
    }

    if (angle === 'analysis' || angle === 'news') {
      return {
        cta: 'Stay updated on the latest trends. Subscribe to our newsletter.',
        ctaType: 'newsletter',
      };
    }

    return {
      cta: 'Share this with your network to help spread the word.',
      ctaType: 'share',
    };
  }

  private selectPrimaryChannel(trend: any, format: string): string {
    if (format === 'video') return 'youtube';
    if (format === 'social-thread') return 'twitter';
    const category = trend.pillar[0] || 'general';
    if (category === 'business') return 'linkedin';
    return 'blog';
  }

  private selectSecondaryChannels(trend: any, format: string): string[] {
    const channels: string[] = [];
    const category = trend.pillar[0] || 'general';

    if (Number(trend.viralCoefficient) || 0 >= 80) {
      channels.push('twitter', 'linkedin');
    }

    if (format === 'guide') {
      channels.push('email', 'pinterest');
    }

    if (category === 'technology') {
      channels.push('reddit', 'hackernews');
    }

    return [...new Set(channels)].slice(0, 3);
  }

  private calculateDeadline(lifecycle: string, viralCoefficient: number): Date {
    const now = new Date();
    let daysToAdd = 14; // Default 2 weeks

    if (lifecycle === 'EMERGING') daysToAdd = 7;
    if (lifecycle === 'PEAK') daysToAdd = 3;
    if (viralCoefficient >= 90) daysToAdd = Math.min(daysToAdd, 5);

    now.setDate(now.getDate() + daysToAdd);
    return now;
  }

  private generatePublishingTimeline(deadline: Date): string {
    const days = Math.floor((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (days <= 3) return 'URGENT - Publish within 48 hours';
    if (days <= 7) return 'Publish within 1 week';
    return 'Publish within 2 weeks';
  }

  private generatePromotionStrategy(trend: any, format: string, primaryChannel: string): string[] {
    const strategies: string[] = [];

    strategies.push(`Publish on ${primaryChannel}`);

    if (Number(trend.viralCoefficient) || 0 >= 80) {
      strategies.push('Share on all social channels');
      strategies.push('Reach out to influencers for amplification');
    }

    if (format === 'guide') {
      strategies.push('Email to subscriber list');
      strategies.push('Create lead magnet version');
    }

    strategies.push('Monitor engagement and respond to comments');
    strategies.push('Repurpose into social media snippets');

    return strategies;
  }

  private calculateTargetMetrics(viralCoefficient: number, searchVolume: number): {
    views: number;
    engagement: number;
    shares: number;
    conversions: number;
  } {
    return {
      views: Math.round(viralCoefficient * 100 + searchVolume * 0.3),
      engagement: Math.round((viralCoefficient * 100 + searchVolume * 0.3) * 0.05),
      shares: Math.round((viralCoefficient * 100 + searchVolume * 0.3) * 0.02),
      conversions: Math.round((viralCoefficient * 100 + searchVolume * 0.3) * 0.01),
    };
  }

  private calculatePriority(trend: any, keyword: any): number {
    let score = 0;

    // Trend factors (60%)
    score += (Number(trend.viralCoefficient) || 0 / 100) * 30;
    score += (trend.relevanceScore / 100) * 20;

    const lifecycleScores: Record<string, number> = {
      EMERGING: 10, GROWING: 8, PEAK: 5, DECLINING: 2, DEAD: 0,
    };
    score += lifecycleScores[trend.lifecycle] || 0;

    // Keyword factors (40%)
    if (keyword) {
      score += Math.min(20, (keyword.searchVolume / 5000) * 20);
      score += ((100 - keyword.difficulty) / 100) * 20;
    }

    return Math.round(score);
  }

  private estimateContentImpact(trend: any, keyword: any, format: string): number {
    // Estimate monthly traffic impact
    const trendImpact = Number(trend.viralCoefficient) || 0 * 10;
    const keywordImpact = keyword ? keyword.searchVolume * 0.3 : 0;

    const formatMultipliers: Record<string, number> = {
      video: 1.5,
      guide: 1.3,
      'blog-post': 1.0,
      'news-article': 0.8,
      'social-thread': 0.6,
    };

    const multiplier = formatMultipliers[format] || 1.0;

    return Math.round((trendImpact + keywordImpact) * multiplier);
  }

  // ============================================
  // PRIVATE HELPER METHODS - PRIORITIZATION
  // ============================================

  private selectBestAngle(trend: any, criteria: 'viral' | 'evergreen' | 'conversion'): string {
    if (criteria === 'viral') {
      if (trend.lifecycle === 'EMERGING' || trend.lifecycle === 'GROWING') return 'news';
      if (Number(trend.viralCoefficient) || 0 >= 85) return 'listicle';
      return 'analysis';
    }

    if (criteria === 'evergreen') {
      return 'how-to';
    }

    // conversion
    return 'case-study';
  }

  private calculatePriorityScore(brief: ContentBrief, trend: any, criteria: string): number {
    let score = brief.priority;

    if (criteria === 'viral' && Number(trend.viralCoefficient) || 0 >= 80) {
      score += 20;
    }

    if (criteria === 'evergreen' && brief.format === 'guide') {
      score += 15;
    }

    if (criteria === 'conversion' && brief.conversionPotential === 'HIGH') {
      score += 25;
    }

    return Math.min(100, Math.round(score));
  }

  private determineUrgency(lifecycle: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (lifecycle === 'PEAK') return 'CRITICAL';
    if (lifecycle === 'GROWING') return 'HIGH';
    if (lifecycle === 'EMERGING') return 'MEDIUM';
    return 'LOW';
  }

  private categorizeImpact(estimatedImpact: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (estimatedImpact >= 5000) return 'HIGH';
    if (estimatedImpact >= 1000) return 'MEDIUM';
    return 'LOW';
  }

  private estimateEffort(wordCount: number, researchCount: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    const totalEffort = wordCount / 500 + researchCount * 2;
    if (totalEffort >= 8) return 'HIGH';
    if (totalEffort >= 4) return 'MEDIUM';
    return 'LOW';
  }

  private estimateCreationTime(wordCount: number, researchCount: number): number {
    // Hours
    const writingTime = wordCount / 500; // 500 words per hour
    const researchTime = researchCount * 1.5; // 1.5 hours per research item
    return Math.round(writingTime + researchTime);
  }

  private identifyRequiredSkills(format: string, research: ResearchRequirement[]): string[] {
    const skills: string[] = ['writing', 'research'];

    if (format === 'video') {
      skills.push('video production', 'editing');
    }

    if (research.some(r => r.depth === 'DEEP')) {
      skills.push('data analysis', 'subject matter expertise');
    }

    return skills;
  }

  private identifyRequiredTools(format: string, visuals: VisualRequirement[]): string[] {
    const tools: string[] = ['word processor'];

    if (format === 'video') {
      tools.push('video editing software', 'screen recorder');
    }

    if (visuals.some(v => v.type === 'infographic')) {
      tools.push('design software', 'Canva');
    }

    if (visuals.some(v => v.type === 'chart')) {
      tools.push('data visualization tool');
    }

    return [...new Set(tools)];
  }

  private generateRecommendation(
    priorityScore: number,
    urgency: string,
    impact: string,
    effort: string,
    timeWindow: number,
  ): { recommendation: string; reasoning: string[] } {
    const reasoning: string[] = [];

    if (priorityScore >= 80) {
      reasoning.push('High priority score indicates strong opportunity');
    }

    if (urgency === 'CRITICAL' || urgency === 'HIGH') {
      reasoning.push(`${urgency} urgency - time-sensitive content`);
    }

    if (impact === 'HIGH') {
      reasoning.push('High impact potential for traffic and engagement');
    }

    if (effort === 'LOW' && impact === 'HIGH') {
      reasoning.push('Excellent effort-to-impact ratio');
    }

    if (timeWindow <= 3) {
      reasoning.push('Extremely time-sensitive - publish immediately');
    }

    let recommendation = 'PROCEED';

    if (priorityScore >= 80 && urgency === 'CRITICAL') {
      recommendation = 'URGENT - START IMMEDIATELY';
    } else if (priorityScore >= 70) {
      recommendation = 'HIGH PRIORITY - Schedule Soon';
    } else if (effort === 'HIGH' && impact === 'LOW') {
      recommendation = 'DEPRIORITIZE - Low ROI';
    }

    return { recommendation, reasoning };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private identifyTargetAudience(category: string): string[] {
    const audiences: Record<string, string[]> = {
      technology: ['Tech enthusiasts', 'developers', 'early adopters'],
      business: ['Entrepreneurs', 'business owners', 'executives'],
      entertainment: ['General public', 'content consumers'],
      health: ['Health-conscious individuals', 'wellness seekers'],
      finance: ['Investors', 'financial planners', 'crypto enthusiasts'],
      marketing: ['Marketers', 'content creators', 'growth hackers'],
    };

    return audiences[category.toLowerCase()] || ['General audience'];
  }

  private extractKeywords(topic: string): string[] {
    return topic.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);
  }

  private selectPrimaryChannelForFormat(format: string, trend: any): string {
    if (format === 'video') return 'youtube';
    if (format === 'social-thread') return 'twitter';
    if (format === 'news-article' && trend.source === 'twitter') return 'twitter';
    const category = trend.pillar[0] || 'general';
    if (category === 'business') return 'linkedin';
    return 'blog';
  }

  private determineConversionPotential(angle: string, format: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    // High conversion: how-to, case-study
    if (angle === 'how-to' || angle === 'case-study') return 'HIGH';

    // Medium conversion: analysis, listicle
    if (angle === 'analysis' || angle === 'listicle') return 'MEDIUM';

    // Low conversion: news
    return 'LOW';
  }
}
