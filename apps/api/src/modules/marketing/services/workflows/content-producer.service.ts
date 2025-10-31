import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ContentBrief } from './content-strategist.service';

/**
 * Content Producer Service
 *
 * Handles content production and quality control:
 * - Generate content outlines from briefs
 * - Create first drafts (integration point for AI writing)
 * - Quality scoring and validation
 * - SEO optimization verification
 * - Publishing workflow management
 * - Performance tracking post-publish
 */

export interface ContentDraft {
  id: string;
  briefId: string;
  title: string;

  // Content
  content: string; // Full article content
  wordCount: number;

  // Structure
  sections: DraftSection[];

  // SEO
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordDensity: number;

  // Quality metrics
  qualityScore: number; // 0-100
  readabilityScore: number; // Flesch reading ease
  seoScore: number; // 0-100

  // Status
  status: 'draft' | 'review' | 'approved' | 'published';
  version: number;

  // Metadata
  author: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface DraftSection {
  heading: string;
  content: string;
  wordCount: number;
  keywords: string[];
  qualityIssues: string[];
}

export interface QualityReport {
  overallScore: number; // 0-100

  // Content quality
  contentQuality: {
    score: number;
    issues: string[];
    strengths: string[];
  };

  // SEO quality
  seoQuality: {
    score: number;
    issues: string[];
    optimizations: string[];
  };

  // Readability
  readability: {
    score: number; // Flesch reading ease
    grade: string; // Reading grade level
    issues: string[];
  };

  // Structure
  structure: {
    score: number;
    issues: string[];
    suggestions: string[];
  };

  // Completeness
  completeness: {
    score: number;
    missing: string[];
    present: string[];
  };

  // Recommendations
  recommendations: string[];
  readyToPublish: boolean;
}

export interface PublishingPlan {
  draftId: string;
  title: string;

  // Publishing details
  scheduledDate: Date;
  primaryChannel: string;
  secondaryChannels: string[];

  // Distribution
  distributionSteps: DistributionStep[];

  // Promotion
  promotionStrategy: PromotionAction[];

  // Monitoring
  trackingSetup: TrackingConfig;

  // Expectations
  expectedResults: {
    views: number;
    engagement: number;
    shares: number;
    conversions: number;
  };

  // Status
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  publishedAt: Date | null;
}

export interface DistributionStep {
  step: number;
  action: string;
  channel: string;
  timing: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface PromotionAction {
  action: string;
  channel: string;
  timing: string; // "immediately", "1 hour after", "1 day after"
  template: string;
  status: 'pending' | 'completed';
}

export interface TrackingConfig {
  trackViews: boolean;
  trackEngagement: boolean;
  trackConversions: boolean;
  trackSEO: boolean;
  utmParameters: {
    source: string;
    medium: string;
    campaign: string;
  };
}

export interface PerformanceReport {
  draftId: string;
  title: string;
  publishedAt: Date;
  daysSincePublish: number;

  // Traffic metrics
  traffic: {
    views: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    bounceRate: number;
  };

  // Engagement metrics
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };

  // SEO metrics
  seo: {
    currentRank: number | null;
    impressions: number;
    clicks: number;
    ctr: number;
    keywordsRanking: number;
  };

  // Conversion metrics
  conversions: {
    leads: number;
    signups: number;
    sales: number;
    revenue: number;
  };

  // Performance vs expectations
  performance: {
    viewsVsExpected: number; // Percentage
    engagementVsExpected: number;
    conversionsVsExpected: number;
    overallPerformance: 'EXCEEDING' | 'MEETING' | 'BELOW';
  };

  // Insights
  insights: string[];
  recommendations: string[];
}

@Injectable()
export class ContentProducerService {
  private readonly logger = new Logger(ContentProducerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate content draft from a brief
   * In production, this would integrate with Claude API for content generation
   */
  async generateDraft(brief: ContentBrief): Promise<ContentDraft> {
    this.logger.log(`Generating draft for brief: "${brief.title}"`);

    // Generate sections based on outline
    const sections: DraftSection[] = brief.outline.map(section => {
      return {
        heading: section.heading,
        content: this.generateSectionContent(section, brief),
        wordCount: section.wordCount,
        keywords: section.keywords,
        qualityIssues: [],
      };
    });

    // Calculate total word count
    const wordCount = sections.reduce((sum, s) => sum + s.wordCount, 0);

    // Generate full content
    const content = this.assembleDraft(sections, brief);

    // Calculate keyword density
    const keywordDensity = this.calculateKeywordDensity(content, brief.primaryKeyword);

    // Initial quality scoring
    const qualityScore = this.calculateInitialQualityScore(content, brief);
    const readabilityScore = this.calculateReadabilityScore(content);
    const seoScore = this.calculateSEOScore(content, brief);

    const draft: ContentDraft = {
      id: `draft-${Date.now()}`,
      briefId: brief.id,
      title: brief.title,
      content,
      wordCount,
      sections,
      metaTitle: brief.metaTitle,
      metaDescription: brief.metaDescription,
      primaryKeyword: brief.primaryKeyword,
      secondaryKeywords: brief.secondaryKeywords,
      keywordDensity,
      qualityScore,
      readabilityScore,
      seoScore,
      status: 'draft',
      version: 1,
      author: 'AI Content Generator',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
    };

    this.logger.log(`Draft generated: ${wordCount} words, Quality: ${qualityScore}/100`);

    return draft;
  }

  /**
   * Perform comprehensive quality check on draft
   */
  async checkQuality(draft: ContentDraft): Promise<QualityReport> {
    this.logger.log(`Checking quality for draft: "${draft.title}"`);

    // Content quality
    const contentQuality = this.assessContentQuality(draft);

    // SEO quality
    const seoQuality = this.assessSEOQuality(draft);

    // Readability
    const readability = this.assessReadability(draft);

    // Structure
    const structure = this.assessStructure(draft);

    // Completeness
    const completeness = this.assessCompleteness(draft);

    // Calculate overall score
    const overallScore = Math.round(
      (contentQuality.score * 0.3) +
      (seoQuality.score * 0.25) +
      (readability.score / 100 * 0.2) + // Normalize Flesch score to 0-100
      (structure.score * 0.15) +
      (completeness.score * 0.1)
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      contentQuality,
      seoQuality,
      readability,
      structure,
      completeness,
    );

    const readyToPublish = overallScore >= 75 && completeness.score >= 90;

    const report: QualityReport = {
      overallScore,
      contentQuality,
      seoQuality,
      readability,
      structure,
      completeness,
      recommendations,
      readyToPublish,
    };

    this.logger.log(`Quality check complete: ${overallScore}/100 (${readyToPublish ? 'READY' : 'NEEDS WORK'})`);

    return report;
  }

  /**
   * Optimize content for SEO
   */
  async optimizeForSEO(draft: ContentDraft): Promise<ContentDraft> {
    this.logger.log(`Optimizing SEO for draft: "${draft.title}"`);

    let optimizedContent = draft.content;

    // 1. Optimize keyword placement
    optimizedContent = this.optimizeKeywordPlacement(optimizedContent, draft.primaryKeyword);

    // 2. Add internal links (placeholder - in production, would link to related content)
    optimizedContent = this.addInternalLinks(optimizedContent);

    // 3. Optimize headings for keywords
    const optimizedSections = draft.sections.map(section => ({
      ...section,
      heading: this.optimizeHeading(section.heading, draft.secondaryKeywords),
    }));

    // 4. Ensure keyword density is optimal (1-2%)
    const currentDensity = this.calculateKeywordDensity(optimizedContent, draft.primaryKeyword);
    if (currentDensity < 1.0) {
      optimizedContent = this.increaseKeywordDensity(optimizedContent, draft.primaryKeyword);
    } else if (currentDensity > 2.5) {
      optimizedContent = this.decreaseKeywordDensity(optimizedContent, draft.primaryKeyword);
    }

    // 5. Optimize meta tags
    const optimizedMetaTitle = this.optimizeMetaTitle(draft.metaTitle, draft.primaryKeyword);
    const optimizedMetaDescription = this.optimizeMetaDescription(
      draft.metaDescription,
      draft.primaryKeyword,
    );

    // Recalculate SEO score
    const newSEOScore = this.calculateSEOScore(optimizedContent, {
      primaryKeyword: draft.primaryKeyword,
      secondaryKeywords: draft.secondaryKeywords,
    } as any);

    this.logger.log(`SEO optimization complete. Score: ${draft.seoScore} → ${newSEOScore}`);

    return {
      ...draft,
      content: optimizedContent,
      sections: optimizedSections,
      metaTitle: optimizedMetaTitle,
      metaDescription: optimizedMetaDescription,
      seoScore: newSEOScore,
      keywordDensity: this.calculateKeywordDensity(optimizedContent, draft.primaryKeyword),
      version: draft.version + 1,
      updatedAt: new Date(),
    };
  }

  /**
   * Create publishing plan for approved content
   */
  async createPublishingPlan(
    draft: ContentDraft,
    scheduledDate: Date,
    channels: { primary: string; secondary: string[] },
  ): Promise<PublishingPlan> {
    this.logger.log(`Creating publishing plan for: "${draft.title}"`);

    // Generate distribution steps
    const distributionSteps = this.generateDistributionSteps(channels.primary, channels.secondary);

    // Generate promotion strategy
    const promotionStrategy = this.generatePromotionStrategy(draft, channels);

    // Setup tracking
    const trackingSetup: TrackingConfig = {
      trackViews: true,
      trackEngagement: true,
      trackConversions: true,
      trackSEO: true,
      utmParameters: {
        source: channels.primary,
        medium: 'content-marketing',
        campaign: this.generateCampaignName(draft.title),
      },
    };

    // Expected results (from brief if available, otherwise estimate)
    const expectedResults = {
      views: 5000,
      engagement: 250,
      shares: 100,
      conversions: 50,
    };

    const plan: PublishingPlan = {
      draftId: draft.id,
      title: draft.title,
      scheduledDate,
      primaryChannel: channels.primary,
      secondaryChannels: channels.secondary,
      distributionSteps,
      promotionStrategy,
      trackingSetup,
      expectedResults,
      status: 'scheduled',
      publishedAt: null,
    };

    this.logger.log(`Publishing plan created. Scheduled for: ${scheduledDate.toISOString()}`);

    return plan;
  }

  /**
   * Execute publishing plan
   * In production, this would integrate with CMS and social media APIs
   */
  async executePublishing(plan: PublishingPlan): Promise<void> {
    this.logger.log(`Executing publishing plan for: "${plan.title}"`);

    // Update status
    plan.status = 'publishing';

    // Execute distribution steps
    for (const step of plan.distributionSteps) {
      step.status = 'in-progress';
      this.logger.log(`  Executing step ${step.step}: ${step.action} (${step.channel})`);

      // Simulate publishing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      step.status = 'completed';
      this.logger.log(`  ✓ Step ${step.step} completed`);
    }

    // Execute promotion actions
    for (const action of plan.promotionStrategy) {
      this.logger.log(`  Executing promotion: ${action.action} (${action.channel})`);
      action.status = 'completed';
    }

    // Mark as published
    plan.status = 'published';
    plan.publishedAt = new Date();

    this.logger.log(`Publishing complete! Published at: ${plan.publishedAt.toISOString()}`);
  }

  /**
   * Track performance after publishing
   * In production, this would integrate with analytics APIs
   */
  async trackPerformance(draftId: string, daysSincePublish: number): Promise<PerformanceReport> {
    this.logger.log(`Tracking performance for draft: ${draftId} (${daysSincePublish} days)`);

    // In production, this would fetch real analytics data
    // For now, generate simulated performance data

    const traffic = this.simulateTrafficMetrics(daysSincePublish);
    const engagement = this.simulateEngagementMetrics(daysSincePublish);
    const seo = this.simulateSEOMetrics(daysSincePublish);
    const conversions = this.simulateConversionMetrics(daysSincePublish);

    // Compare to expectations
    const expectedViews = 5000;
    const expectedEngagement = 250;
    const expectedConversions = 50;

    const viewsVsExpected = Math.round((traffic.views / expectedViews) * 100);
    const engagementVsExpected = Math.round((engagement.likes + engagement.comments + engagement.shares) / expectedEngagement * 100);
    const conversionsVsExpected = Math.round((conversions.leads / expectedConversions) * 100);

    const avgPerformance = (viewsVsExpected + engagementVsExpected + conversionsVsExpected) / 3;
    const overallPerformance = avgPerformance >= 90 ? 'EXCEEDING' : avgPerformance >= 70 ? 'MEETING' : 'BELOW';

    // Generate insights
    const insights = this.generatePerformanceInsights(traffic, engagement, seo, conversions);
    const recommendations = this.generatePerformanceRecommendations(overallPerformance, insights);

    const report: PerformanceReport = {
      draftId,
      title: 'Content Title', // Would fetch from database
      publishedAt: new Date(Date.now() - daysSincePublish * 24 * 60 * 60 * 1000),
      daysSincePublish,
      traffic,
      engagement,
      seo,
      conversions,
      performance: {
        viewsVsExpected,
        engagementVsExpected,
        conversionsVsExpected,
        overallPerformance,
      },
      insights,
      recommendations,
    };

    this.logger.log(`Performance tracking complete. Overall: ${overallPerformance}`);

    return report;
  }

  // ============================================
  // PRIVATE HELPER METHODS - CONTENT GENERATION
  // ============================================

  private generateSectionContent(section: any, brief: ContentBrief): string {
    // In production, this would call Claude API to generate content
    // For now, generate placeholder content

    const paragraphs: string[] = [];

    // Introduction paragraph
    paragraphs.push(
      `${section.heading} is a critical aspect of ${brief.primaryKeyword}. ` +
      `This section covers ${section.keyPoints.join(', ')}.`
    );

    // Add key points as paragraphs
    section.keyPoints.forEach((point: string) => {
      paragraphs.push(
        `When considering ${point}, it's important to understand the broader context. ` +
        `Research shows that ${brief.primaryKeyword} plays a significant role in this area. ` +
        `${this.generateSupportingContent(point, brief.primaryKeyword)}`
      );
    });

    // Add keywords naturally
    paragraphs.push(
      `In summary, ${section.keywords.join(', ')} are essential elements to consider. ` +
      `By understanding these concepts, you can better leverage ${brief.primaryKeyword}.`
    );

    return paragraphs.join('\n\n');
  }

  private generateSupportingContent(point: string, keyword: string): string {
    const templates = [
      `Experts in ${keyword} recommend focusing on ${point} to achieve better results.`,
      `Studies have shown that ${point} can significantly impact ${keyword} outcomes.`,
      `Many successful implementations of ${keyword} prioritize ${point} as a key factor.`,
      `Understanding ${point} in the context of ${keyword} provides a competitive advantage.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private assembleDraft(sections: DraftSection[], brief: ContentBrief): string {
    const parts: string[] = [];

    // Introduction
    parts.push(`# ${brief.title}\n`);
    parts.push(`${brief.metaDescription}\n`);

    // Sections
    sections.forEach(section => {
      parts.push(`## ${section.heading}\n`);
      parts.push(`${section.content}\n`);
    });

    // Conclusion with CTA
    parts.push(`## Conclusion\n`);
    parts.push(
      `In this comprehensive guide, we've explored ${brief.primaryKeyword} from multiple angles. ` +
      `By implementing the strategies and insights shared above, you can achieve better results.\n`
    );
    parts.push(`${brief.cta}\n`);

    return parts.join('\n');
  }

  // ============================================
  // PRIVATE HELPER METHODS - QUALITY ASSESSMENT
  // ============================================

  private calculateInitialQualityScore(content: string, brief: ContentBrief): number {
    let score = 70; // Start with 70

    // Word count check
    const actualWordCount = content.split(/\s+/).length;
    if (actualWordCount >= brief.wordCount * 0.9 && actualWordCount <= brief.wordCount * 1.1) {
      score += 10;
    }

    // Keyword presence
    if (content.toLowerCase().includes(brief.primaryKeyword.toLowerCase())) {
      score += 10;
    }

    // Section structure
    if (content.includes('##')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private calculateReadabilityScore(content: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 60;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countSyllables(word: string): number {
    // Simple syllable counter
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let count = 0;
    let prevWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevWasVowel) {
        count++;
      }
      prevWasVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e')) count--;

    return Math.max(1, count);
  }

  private calculateSEOScore(content: string, brief: any): number {
    let score = 0;

    // Keyword in title (20 points)
    if (content.toLowerCase().includes(brief.primaryKeyword.toLowerCase())) {
      score += 20;
    }

    // Keyword density (20 points)
    const density = this.calculateKeywordDensity(content, brief.primaryKeyword);
    if (density >= 1.0 && density <= 2.5) {
      score += 20;
    } else if (density >= 0.5 && density < 3.0) {
      score += 10;
    }

    // Secondary keywords (20 points)
    const secondaryKeywordsPresent = brief.secondaryKeywords.filter((kw: string) =>
      content.toLowerCase().includes(kw.toLowerCase())
    ).length;
    score += (secondaryKeywordsPresent / brief.secondaryKeywords.length) * 20;

    // Headings (20 points)
    const headingCount = (content.match(/##/g) || []).length;
    if (headingCount >= 5) score += 20;
    else if (headingCount >= 3) score += 15;
    else if (headingCount >= 1) score += 10;

    // Word count (20 points)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 1500) score += 20;
    else if (wordCount >= 1000) score += 15;
    else if (wordCount >= 500) score += 10;

    return Math.round(score);
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const contentLower = content.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const wordCount = content.split(/\s+/).length;

    const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;

    return (keywordCount / wordCount) * 100;
  }

  private assessContentQuality(draft: ContentDraft): { score: number; issues: string[]; strengths: string[] } {
    const issues: string[] = [];
    const strengths: string[] = [];
    let score = 80;

    // Check word count
    if (draft.wordCount < 500) {
      issues.push('Content is too short (< 500 words)');
      score -= 20;
    } else if (draft.wordCount >= 1500) {
      strengths.push('Comprehensive content length');
      score += 10;
    }

    // Check sections
    if (draft.sections.length < 3) {
      issues.push('Too few sections - add more structure');
      score -= 10;
    } else if (draft.sections.length >= 5) {
      strengths.push('Well-structured with multiple sections');
      score += 10;
    }

    // Check quality score
    if (draft.qualityScore >= 80) {
      strengths.push('High overall quality score');
    } else if (draft.qualityScore < 60) {
      issues.push('Quality score below acceptable threshold');
      score -= 10;
    }

    return { score: Math.max(0, Math.min(100, score)), issues, strengths };
  }

  private assessSEOQuality(draft: ContentDraft): { score: number; issues: string[]; optimizations: string[] } {
    const issues: string[] = [];
    const optimizations: string[] = [];
    let score = draft.seoScore;

    // Keyword density check
    if (draft.keywordDensity < 0.5) {
      issues.push('Keyword density too low - add more keyword mentions');
      optimizations.push('Increase primary keyword usage');
    } else if (draft.keywordDensity > 3.0) {
      issues.push('Keyword density too high - risk of keyword stuffing');
      optimizations.push('Reduce keyword repetition');
    } else {
      optimizations.push('Keyword density is optimal');
    }

    // Meta tags check
    if (draft.metaTitle.length < 30 || draft.metaTitle.length > 60) {
      issues.push('Meta title length not optimal (should be 30-60 chars)');
    }

    if (draft.metaDescription.length < 120 || draft.metaDescription.length > 160) {
      issues.push('Meta description length not optimal (should be 120-160 chars)');
    }

    return { score: Math.max(0, Math.min(100, score)), issues, optimizations };
  }

  private assessReadability(draft: ContentDraft): { score: number; grade: string; issues: string[] } {
    const issues: string[] = [];
    const score = draft.readabilityScore;

    // Interpret Flesch score
    let grade = 'College';
    if (score >= 90) grade = '5th Grade';
    else if (score >= 80) grade = '6th Grade';
    else if (score >= 70) grade = '7th Grade';
    else if (score >= 60) grade = '8th-9th Grade';
    else if (score >= 50) grade = '10th-12th Grade';

    if (score < 50) {
      issues.push('Content is difficult to read - simplify sentences');
    } else if (score >= 70) {
      // No issues - good readability
    }

    return { score, grade, issues };
  }

  private assessStructure(draft: ContentDraft): { score: number; issues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 70;

    // Check section count
    if (draft.sections.length >= 5) {
      score += 15;
    } else if (draft.sections.length < 3) {
      issues.push('Add more sections for better structure');
      score -= 15;
    }

    // Check section balance
    const avgWordsPerSection = draft.wordCount / draft.sections.length;
    if (avgWordsPerSection < 100) {
      suggestions.push('Sections are too short - expand with more details');
    } else if (avgWordsPerSection > 500) {
      suggestions.push('Some sections are too long - consider breaking into subsections');
    } else {
      score += 15;
    }

    return { score: Math.max(0, Math.min(100, score)), issues, suggestions };
  }

  private assessCompleteness(draft: ContentDraft): { score: number; missing: string[]; present: string[] } {
    const missing: string[] = [];
    const present: string[] = [];
    let score = 100;

    // Check required elements
    if (!draft.title || draft.title.length === 0) {
      missing.push('Title');
      score -= 20;
    } else {
      present.push('Title');
    }

    if (!draft.content || draft.content.length < 100) {
      missing.push('Content');
      score -= 30;
    } else {
      present.push('Content');
    }

    if (!draft.metaTitle || draft.metaTitle.length === 0) {
      missing.push('Meta Title');
      score -= 10;
    } else {
      present.push('Meta Title');
    }

    if (!draft.metaDescription || draft.metaDescription.length === 0) {
      missing.push('Meta Description');
      score -= 10;
    } else {
      present.push('Meta Description');
    }

    if (draft.sections.length === 0) {
      missing.push('Sections');
      score -= 30;
    } else {
      present.push('Sections');
    }

    return { score: Math.max(0, score), missing, present };
  }

  private generateRecommendations(
    contentQuality: any,
    seoQuality: any,
    readability: any,
    structure: any,
    completeness: any,
  ): string[] {
    const recommendations: string[] = [];

    // Content recommendations
    if (contentQuality.issues.length > 0) {
      recommendations.push(`Content: ${contentQuality.issues[0]}`);
    }

    // SEO recommendations
    if (seoQuality.issues.length > 0) {
      recommendations.push(`SEO: ${seoQuality.issues[0]}`);
    }

    // Readability recommendations
    if (readability.issues.length > 0) {
      recommendations.push(`Readability: ${readability.issues[0]}`);
    }

    // Structure recommendations
    if (structure.suggestions.length > 0) {
      recommendations.push(`Structure: ${structure.suggestions[0]}`);
    }

    // Completeness recommendations
    if (completeness.missing.length > 0) {
      recommendations.push(`Missing: ${completeness.missing.join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Content is ready to publish!');
    }

    return recommendations;
  }

  // ============================================
  // PRIVATE HELPER METHODS - SEO OPTIMIZATION
  // ============================================

  private optimizeKeywordPlacement(content: string, keyword: string): string {
    // Ensure keyword appears in first paragraph
    const paragraphs = content.split('\n\n');
    if (paragraphs.length > 0 && !paragraphs[0].toLowerCase().includes(keyword.toLowerCase())) {
      paragraphs[0] = `${keyword}: ${paragraphs[0]}`;
    }

    return paragraphs.join('\n\n');
  }

  private addInternalLinks(content: string): string {
    // Placeholder - in production, would add links to related content
    return content;
  }

  private optimizeHeading(heading: string, keywords: string[]): string {
    // Try to include a secondary keyword if not present
    const headingLower = heading.toLowerCase();
    const missingKeyword = keywords.find(kw => !headingLower.includes(kw.toLowerCase()));

    if (missingKeyword && Math.random() > 0.7) {
      return `${heading} and ${missingKeyword}`;
    }

    return heading;
  }

  private increaseKeywordDensity(content: string, keyword: string): string {
    // Add keyword mentions naturally (simplified)
    return content.replace(/\. /g, `. ${keyword} is important. `);
  }

  private decreaseKeywordDensity(content: string, keyword: string): string {
    // Remove excessive keyword mentions (simplified)
    const regex = new RegExp(`${keyword}`, 'gi');
    let matches = 0;
    return content.replace(regex, (match) => {
      matches++;
      return matches % 3 === 0 ? 'it' : match;
    });
  }

  private optimizeMetaTitle(metaTitle: string, keyword: string): string {
    if (!metaTitle.toLowerCase().includes(keyword.toLowerCase())) {
      return `${keyword}: ${metaTitle.slice(0, 50)}`;
    }
    return metaTitle.slice(0, 60);
  }

  private optimizeMetaDescription(metaDescription: string, keyword: string): string {
    if (!metaDescription.toLowerCase().includes(keyword.toLowerCase())) {
      return `${keyword} - ${metaDescription.slice(0, 140)}`;
    }
    return metaDescription.slice(0, 160);
  }

  // ============================================
  // PRIVATE HELPER METHODS - PUBLISHING
  // ============================================

  private generateDistributionSteps(primary: string, secondary: string[]): DistributionStep[] {
    const steps: DistributionStep[] = [];

    steps.push({
      step: 1,
      action: `Publish to ${primary}`,
      channel: primary,
      timing: 'immediately',
      status: 'pending',
    });

    secondary.forEach((channel, index) => {
      steps.push({
        step: index + 2,
        action: `Share to ${channel}`,
        channel,
        timing: '1 hour after publish',
        status: 'pending',
      });
    });

    return steps;
  }

  private generatePromotionStrategy(draft: ContentDraft, channels: any): PromotionAction[] {
    const actions: PromotionAction[] = [];

    // Social media promotion
    actions.push({
      action: 'Share on Twitter',
      channel: 'twitter',
      timing: 'immediately',
      template: `New article: ${draft.title} - ${draft.metaDescription.slice(0, 100)}... [LINK]`,
      status: 'pending',
    });

    actions.push({
      action: 'Share on LinkedIn',
      channel: 'linkedin',
      timing: '2 hours after',
      template: `I just published a comprehensive guide on ${draft.primaryKeyword}. Check it out! [LINK]`,
      status: 'pending',
    });

    // Email promotion
    actions.push({
      action: 'Send to email list',
      channel: 'email',
      timing: '1 day after',
      template: `Subject: ${draft.title}`,
      status: 'pending',
    });

    return actions;
  }

  private generateCampaignName(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  }

  // ============================================
  // PRIVATE HELPER METHODS - PERFORMANCE TRACKING
  // ============================================

  private simulateTrafficMetrics(days: number): {
    views: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    bounceRate: number;
  } {
    const baseViews = 100 * days;
    return {
      views: baseViews + Math.floor(Math.random() * baseViews * 0.5),
      uniqueVisitors: Math.floor(baseViews * 0.7),
      averageTimeOnPage: 120 + Math.floor(Math.random() * 180),
      bounceRate: 0.4 + Math.random() * 0.3,
    };
  }

  private simulateEngagementMetrics(days: number): {
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  } {
    const baseLikes = 20 * days;
    const likes = baseLikes + Math.floor(Math.random() * baseLikes * 0.5);
    const comments = Math.floor(likes * 0.2);
    const shares = Math.floor(likes * 0.3);

    return {
      likes,
      comments,
      shares,
      engagementRate: 0.03 + Math.random() * 0.05,
    };
  }

  private simulateSEOMetrics(days: number): {
    currentRank: number | null;
    impressions: number;
    clicks: number;
    ctr: number;
    keywordsRanking: number;
  } {
    const impressions = 500 * days;
    const ctr = 0.02 + Math.random() * 0.03;
    const clicks = Math.floor(impressions * ctr);

    return {
      currentRank: days >= 7 ? Math.floor(Math.random() * 30) + 10 : null,
      impressions,
      clicks,
      ctr,
      keywordsRanking: Math.floor(Math.random() * 10) + 5,
    };
  }

  private simulateConversionMetrics(days: number): {
    leads: number;
    signups: number;
    sales: number;
    revenue: number;
  } {
    const leads = Math.floor(10 * days * (0.5 + Math.random()));
    const signups = Math.floor(leads * 0.6);
    const sales = Math.floor(signups * 0.1);
    const revenue = sales * (50 + Math.random() * 150);

    return {
      leads,
      signups,
      sales,
      revenue: Math.round(revenue),
    };
  }

  private generatePerformanceInsights(traffic: any, engagement: any, seo: any, conversions: any): string[] {
    const insights: string[] = [];

    if (traffic.bounceRate < 0.5) {
      insights.push('Low bounce rate indicates high-quality, engaging content');
    }

    if (engagement.engagementRate > 0.05) {
      insights.push('High engagement rate - content resonates with audience');
    }

    if (seo.ctr > 0.03) {
      insights.push('Above-average CTR from search results');
    }

    if (conversions.leads > 50) {
      insights.push('Strong lead generation - content effectively drives conversions');
    }

    if (insights.length === 0) {
      insights.push('Performance is within expected ranges');
    }

    return insights;
  }

  private generatePerformanceRecommendations(performance: string, insights: string[]): string[] {
    const recommendations: string[] = [];

    if (performance === 'EXCEEDING') {
      recommendations.push('Content is performing exceptionally - replicate this approach');
      recommendations.push('Consider creating follow-up content on related topics');
    } else if (performance === 'BELOW') {
      recommendations.push('Performance below expectations - analyze and optimize');
      recommendations.push('Consider updating content with fresh information');
      recommendations.push('Increase promotion efforts on high-performing channels');
    } else {
      recommendations.push('Performance meeting expectations - continue monitoring');
    }

    return recommendations;
  }
}
