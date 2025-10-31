import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SonnetService } from '../../ai/sonnet.service';
import { CompetitorAnalysisService } from '../competitor-analysis.service';

/**
 * LANDSCAPE ANALYZER SERVICE
 *
 * Performs deep market and competitive landscape analysis using AI.
 * Analyzes industry trends, competitor strategies, market gaps, and opportunities.
 *
 * Features:
 * - Industry/niche analysis
 * - Competitor strategy analysis
 * - Market opportunity identification
 * - Audience psychographics
 * - Content gap analysis
 * - Platform opportunity mapping
 * - Threat/opportunity assessment (SWOT)
 */

export interface LandscapeAnalysis {
  profileId: string;
  industry: string;

  // Market Analysis
  marketSize: {
    totalAddressableMarket: string;
    serviceableMarket: string;
    growth: string;
    trends: string[];
  };

  // Competitive Landscape
  competitiveIntensity: 'low' | 'medium' | 'high' | 'very_high';
  competitors: {
    name: string;
    url: string;
    strength: 'weak' | 'moderate' | 'strong' | 'dominant';
    strategies: string[];
    weaknesses: string[];
    contentTypes: string[];
    platforms: string[];
    estimatedBudget: string;
  }[];

  // Audience Insights
  audienceInsights: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
    desires: string[];
    onlineBehavior: {
      platforms: string[];
      contentPreferences: string[];
      engagementPatterns: string;
    };
    buyingJourney: {
      awareness: string;
      consideration: string;
      decision: string;
    };
  };

  // Content Opportunities
  contentGaps: {
    topics: string[];
    formats: string[];
    platforms: string[];
    keywords: string[];
    reasoning: string;
  };

  // Platform Analysis
  platformOpportunities: {
    platform: string;
    opportunity: 'low' | 'medium' | 'high' | 'critical';
    reasoning: string;
    competitorPresence: 'none' | 'weak' | 'moderate' | 'strong';
    recommendedStrategy: string;
  }[];

  // SWOT Analysis
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Strategic Recommendations
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    reasoning: string;
    estimatedImpact: string;
  }[];

  // Metadata
  analyzedAt: Date;
  confidence: number; // 0-100
}

@Injectable()
export class LandscapeAnalyzerService {
  private readonly logger = new Logger(LandscapeAnalyzerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sonnetService: SonnetService,
    private readonly competitorAnalysis: CompetitorAnalysisService,
  ) {}

  /**
   * Analyze landscape for a marketing profile
   */
  async analyzeLandscape(profileId: string): Promise<LandscapeAnalysis> {
    this.logger.log(`= Analyzing landscape for profile: ${profileId}`);

    // Get profile data
    const profile = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    // Step 1: Analyze competitors
    this.logger.log('   Analyzing competitors...');
    const competitorData = await this.analyzeCompetitors(profile);

    // Step 2: Analyze industry and market
    this.logger.log('   Analyzing industry and market...');
    const marketAnalysis = await this.analyzeMarket(profile);

    // Step 3: Analyze audience
    this.logger.log('   Analyzing target audience...');
    const audienceInsights = await this.analyzeAudience(profile);

    // Step 4: Identify content gaps
    this.logger.log('   Identifying content gaps...');
    const contentGaps = await this.identifyContentGaps(profile, competitorData);

    // Step 5: Analyze platform opportunities
    this.logger.log('   Analyzing platform opportunities...');
    const platformOpportunities = await this.analyzePlatformOpportunities(
      profile,
      competitorData,
    );

    // Step 6: Generate SWOT analysis
    this.logger.log('   Generating SWOT analysis...');
    const swot = await this.generateSWOT(profile, competitorData, marketAnalysis);

    // Step 7: Generate strategic recommendations
    this.logger.log('   Generating strategic recommendations...');
    const recommendations = await this.generateRecommendations(
      profile,
      {
        competitors: competitorData,
        market: marketAnalysis,
        audience: audienceInsights,
        contentGaps,
        platforms: platformOpportunities,
        swot,
      },
    );

    // Compile full analysis
    const analysis: LandscapeAnalysis = {
      profileId,
      industry: profile.industry,
      marketSize: marketAnalysis.marketSize,
      competitiveIntensity: this.assessCompetitiveIntensity(competitorData),
      competitors: competitorData,
      audienceInsights,
      contentGaps,
      platformOpportunities,
      swot,
      recommendations,
      analyzedAt: new Date(),
      confidence: 85, // AI confidence score
    };

    // Save analysis to profile
    await this.prisma.marketingProfile.update({
      where: { id: profileId },
      data: {
        landscapeAnalysis: analysis as any,
      },
    });

    this.logger.log(` Landscape analysis complete for profile: ${profileId}`);

    return analysis;
  }

  /**
   * Analyze competitors
   */
  private async analyzeCompetitors(profile: any) {
    const competitors = [];

    // Analyze each competitor URL
    for (const url of profile.competitorUrls || []) {
      try {
        const analysis = await this.competitorAnalysis.analyzeCompetitor(url);
        competitors.push({
          name: analysis.name || url,
          url,
          strength: this.assessCompetitorStrength(analysis),
          strategies: analysis.strategies || [],
          weaknesses: analysis.weaknesses || [],
          contentTypes: analysis.contentTypes || [],
          platforms: analysis.platforms || [],
          estimatedBudget: analysis.estimatedBudget || 'Unknown',
        });
      } catch (error) {
        this.logger.warn(`Failed to analyze competitor ${url}:`, error.message);
      }
    }

    // If no competitor URLs, generate hypothetical competitors using AI
    if (competitors.length === 0) {
      this.logger.log('   No competitor URLs provided. Generating hypothetical competitors using AI...');
      const hypotheticalCompetitors = await this.generateHypotheticalCompetitors(profile);
      competitors.push(...hypotheticalCompetitors);
    }

    return competitors;
  }

  /**
   * Analyze market and industry
   */
  private async analyzeMarket(profile: any) {
    const prompt = `
Analyze the market for this industry/niche:

Industry: ${profile.industry}
Target Audience: ${profile.targetAudience}
Primary Goal: ${profile.primaryGoal}
Product: ${profile.productDescription || 'Not specified'}
Geographic Focus: ${profile.geographicFocus || 'Global'}

Provide a comprehensive market analysis including:
1. Total Addressable Market (TAM) estimate
2. Serviceable Addressable Market (SAM) estimate
3. Market growth rate and trends
4. Key industry trends (at least 5)
5. Market dynamics and forces

Format as JSON:
{
  "marketSize": {
    "totalAddressableMarket": "...",
    "serviceableMarket": "...",
    "growth": "...",
    "trends": ["trend 1", "trend 2", ...]
  }
}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);
    return response;
  }

  /**
   * Analyze target audience
   */
  private async analyzeAudience(profile: any) {
    const prompt = `
Analyze the target audience for this marketing profile:

Target Audience: ${profile.targetAudience}
Industry: ${profile.industry}
Primary Goal: ${profile.primaryGoal}
Product: ${profile.productDescription || 'Not specified'}
Value Proposition: ${profile.valueProposition || 'Not specified'}

Provide deep audience insights including:
1. Demographics
2. Psychographics (values, beliefs, lifestyle)
3. Pain points (at least 5)
4. Desires and aspirations (at least 5)
5. Online behavior (platforms, content preferences, engagement patterns)
6. Buying journey stages (awareness, consideration, decision)

Format as JSON following this structure:
{
  "demographics": "...",
  "psychographics": "...",
  "painPoints": ["...", "...", ...],
  "desires": ["...", "...", ...],
  "onlineBehavior": {
    "platforms": ["...", "...", ...],
    "contentPreferences": ["...", "...", ...],
    "engagementPatterns": "..."
  },
  "buyingJourney": {
    "awareness": "...",
    "consideration": "...",
    "decision": "..."
  }
}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);
    return response;
  }

  /**
   * Identify content gaps
   */
  private async identifyContentGaps(profile: any, competitors: any[]) {
    const competitorContent = competitors
      .map(c => `${c.name}: ${c.contentTypes.join(', ')}`)
      .join('\n');

    const prompt = `
Identify content gaps and opportunities:

Industry: ${profile.industry}
Target Audience: ${profile.targetAudience}
Primary Goal: ${profile.primaryGoal}

Competitor Content:
${competitorContent || 'No competitor data available'}

Identify:
1. Topics competitors are missing
2. Content formats with low competition
3. Platforms with content opportunities
4. Keywords/topics with high value but low competition

Format as JSON:
{
  "topics": ["topic 1", "topic 2", ...],
  "formats": ["format 1", "format 2", ...],
  "platforms": ["platform 1", "platform 2", ...],
  "keywords": ["keyword 1", "keyword 2", ...],
  "reasoning": "Why these gaps exist and how to exploit them"
}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);
    return response;
  }

  /**
   * Analyze platform opportunities
   */
  private async analyzePlatformOpportunities(profile: any, competitors: any[]) {
    const platforms = [
      'Twitter',
      'LinkedIn',
      'Facebook',
      'Instagram',
      'TikTok',
      'YouTube',
      'Blog/SEO',
      'Medium',
      'Reddit',
      'Pinterest',
    ];

    const opportunities = [];

    for (const platform of platforms) {
      const competitorPresence = this.assessCompetitorPresence(platform, competitors);

      const prompt = `
Assess the opportunity for ${platform} for this profile:

Industry: ${profile.industry}
Target Audience: ${profile.targetAudience}
Primary Goal: ${profile.primaryGoal}
Competitor Presence: ${competitorPresence}

Rate the opportunity (low/medium/high/critical) and explain:
1. Why this platform is a good/bad fit
2. What strategy would work best
3. Expected ROI

Format as JSON:
{
  "opportunity": "high",
  "reasoning": "...",
  "recommendedStrategy": "..."
}
`;

      try {
        const response = await this.sonnetService.generateStructuredContent(prompt);
        opportunities.push({
          platform,
          opportunity: response.opportunity,
          reasoning: response.reasoning,
          competitorPresence,
          recommendedStrategy: response.recommendedStrategy,
        });
      } catch (error) {
        this.logger.warn(`Failed to analyze ${platform}:`, error.message);
      }
    }

    return opportunities.sort((a, b) => {
      const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityMap[b.opportunity] - priorityMap[a.opportunity];
    });
  }

  /**
   * Generate SWOT analysis
   */
  private async generateSWOT(profile: any, competitors: any[], market: any) {
    const prompt = `
Generate a SWOT analysis for this marketing profile:

Industry: ${profile.industry}
Target Audience: ${profile.targetAudience}
Primary Goal: ${profile.primaryGoal}
Monthly Budget: $${profile.monthlyBudget}
Brand Voice: ${profile.brandVoice || 'Not specified'}
Value Proposition: ${profile.valueProposition || 'Not specified'}

Market Context:
${JSON.stringify(market, null, 2)}

Competitor Count: ${competitors.length}
Competitive Intensity: ${this.assessCompetitiveIntensity(competitors)}

Provide:
1. Strengths (5-7 items)
2. Weaknesses (5-7 items)
3. Opportunities (5-7 items)
4. Threats (5-7 items)

Format as JSON:
{
  "strengths": ["...", "...", ...],
  "weaknesses": ["...", "...", ...],
  "opportunities": ["...", "...", ...],
  "threats": ["...", "...", ...]
}
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);
    return response;
  }

  /**
   * Generate strategic recommendations
   */
  private async generateRecommendations(profile: any, context: any) {
    const prompt = `
Generate strategic recommendations for this marketing profile:

Profile:
- Industry: ${profile.industry}
- Target Audience: ${profile.targetAudience}
- Primary Goal: ${profile.primaryGoal}
- Monthly Budget: $${profile.monthlyBudget}

Context:
${JSON.stringify(context, null, 2)}

Provide 10-15 strategic recommendations with:
1. Priority (high/medium/low)
2. Category (Content, Distribution, Budget, Strategy, etc.)
3. Specific recommendation
4. Reasoning
5. Estimated impact

Format as JSON array:
[
  {
    "priority": "high",
    "category": "Content",
    "recommendation": "...",
    "reasoning": "...",
    "estimatedImpact": "..."
  },
  ...
]
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);
    return response;
  }

  /**
   * Generate hypothetical competitors using AI
   */
  private async generateHypotheticalCompetitors(profile: any) {
    const prompt = `
Generate 3-5 hypothetical typical competitors in this industry:

Industry: ${profile.industry}
Target Audience: ${profile.targetAudience}

For each competitor, provide:
1. Typical company name
2. Typical strategies they use
3. Common weaknesses
4. Content types they create
5. Platforms they use
6. Estimated marketing budget

Format as JSON array:
[
  {
    "name": "...",
    "url": "hypothetical",
    "strength": "moderate",
    "strategies": ["...", "..."],
    "weaknesses": ["...", "..."],
    "contentTypes": ["...", "..."],
    "platforms": ["...", "..."],
    "estimatedBudget": "..."
  },
  ...
]
`;

    const response = await this.sonnetService.generateStructuredContent(prompt);
    return response;
  }

  /**
   * Assess competitive intensity
   */
  private assessCompetitiveIntensity(competitors: any[]): 'low' | 'medium' | 'high' | 'very_high' {
    if (competitors.length === 0) return 'low';

    const strongCompetitors = competitors.filter(c =>
      c.strength === 'strong' || c.strength === 'dominant'
    ).length;

    if (strongCompetitors >= 3) return 'very_high';
    if (strongCompetitors >= 2 || competitors.length >= 5) return 'high';
    if (competitors.length >= 3) return 'medium';
    return 'low';
  }

  /**
   * Assess competitor strength
   */
  private assessCompetitorStrength(analysis: any): 'weak' | 'moderate' | 'strong' | 'dominant' {
    // Simple scoring based on analysis
    let score = 0;

    if (analysis.strategies?.length > 3) score += 2;
    if (analysis.contentTypes?.length > 5) score += 2;
    if (analysis.platforms?.length > 4) score += 2;
    if (analysis.estimatedBudget && parseInt(analysis.estimatedBudget) > 50000) score += 3;

    if (score >= 7) return 'dominant';
    if (score >= 5) return 'strong';
    if (score >= 3) return 'moderate';
    return 'weak';
  }

  /**
   * Assess competitor presence on platform
   */
  private assessCompetitorPresence(
    platform: string,
    competitors: any[],
  ): 'none' | 'weak' | 'moderate' | 'strong' {
    const presentCount = competitors.filter(c =>
      c.platforms.some(p => p.toLowerCase().includes(platform.toLowerCase())),
    ).length;

    if (presentCount === 0) return 'none';
    if (presentCount >= competitors.length * 0.7) return 'strong';
    if (presentCount >= competitors.length * 0.4) return 'moderate';
    return 'weak';
  }

  /**
   * Get cached landscape analysis
   */
  async getCachedAnalysis(profileId: string): Promise<LandscapeAnalysis | null> {
    const profile = await this.prisma.marketingProfile.findUnique({
      where: { id: profileId },
      select: { landscapeAnalysis: true },
    });

    return profile?.landscapeAnalysis as LandscapeAnalysis || null;
  }

  /**
   * Refresh landscape analysis
   */
  async refreshAnalysis(profileId: string): Promise<LandscapeAnalysis> {
    this.logger.log(`Refreshing landscape analysis for profile: ${profileId}`);
    return this.analyzeLandscape(profileId);
  }
}
