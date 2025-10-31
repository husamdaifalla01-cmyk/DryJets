import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * ML-based Content Performance Predictor
 * Predicts content success before publishing using historical patterns
 */

export interface ContentPrediction {
  contentId?: string;
  predictedViews: number;
  predictedEngagement: number;
  predictedCTR: number;
  predictedShares: number;
  viralPotential: number; // 0-100
  successProbability: number; // 0-100
  confidenceScore: number; // 0-100
  recommendations: string[];
  riskFactors: string[];
  topPerformingElements: string[];
}

export interface ContentFeatures {
  headline: string;
  contentType: 'blog' | 'video' | 'social' | 'email';
  wordCount?: number;
  duration?: number; // for videos in seconds
  platform?: string;
  topic: string;
  keywords: string[];
  hasImage: boolean;
  hasVideo: boolean;
  hasCTA: boolean;
  emotionalTone: string;
  targetAudience: string;
  publishTime?: Date;
}

@Injectable()
export class ContentPerformancePredictorService {
  private readonly logger = new Logger('ContentPerformancePredictor');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Predict content performance using ML
   */
  async predictPerformance(
    features: ContentFeatures,
  ): Promise<ContentPrediction> {
    this.logger.log(`Predicting performance for: ${features.headline}`);

    // Analyze headline quality
    const headlineScore = await this.analyzeHeadline(features.headline);

    // Get historical performance data
    const historicalData = await this.getHistoricalPerformance(
      features.contentType,
      features.topic,
    );

    // Extract patterns from historical data
    const patterns = this.extractPerformancePatterns(historicalData);

    // Generate ML prediction
    const mlPrediction = await this.generateMLPrediction(features, patterns, headlineScore);

    // Calculate viral potential
    const viralPotential = this.calculateViralPotential(features, mlPrediction);

    // Calculate success probability
    const successProbability = this.calculateSuccessProbability(
      mlPrediction,
      patterns,
    );

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      features,
      mlPrediction,
      patterns,
    );

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(features, mlPrediction);

    // Identify top performing elements
    const topPerformingElements = this.identifyTopElements(features, patterns);

    return {
      predictedViews: mlPrediction.views,
      predictedEngagement: mlPrediction.engagement,
      predictedCTR: mlPrediction.ctr,
      predictedShares: mlPrediction.shares,
      viralPotential,
      successProbability,
      confidenceScore: mlPrediction.confidence,
      recommendations,
      riskFactors,
      topPerformingElements,
    };
  }

  /**
   * Analyze headline quality and appeal
   */
  private async analyzeHeadline(headline: string): Promise<{
    score: number;
    emotionalImpact: number;
    curiosityGap: number;
    clarity: number;
    length: number;
  }> {
    const prompt = `Analyze this headline for marketing performance:

Headline: "${headline}"

Rate on scale 0-100:
1. Overall Score (click-worthiness)
2. Emotional Impact (triggers emotion)
3. Curiosity Gap (makes people want to know more)
4. Clarity (clear value proposition)
5. Length (optimal is 60-70 chars)

Return JSON:
{
  "score": <0-100>,
  "emotionalImpact": <0-100>,
  "curiosityGap": <0-100>,
  "clarity": <0-100>,
  "length": <0-100>
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Headline analysis error: ${error.message}`);
    }

    // Fallback: Basic analysis
    return {
      score: 50,
      emotionalImpact: 50,
      curiosityGap: 50,
      clarity: 50,
      length: headline.length >= 60 && headline.length <= 70 ? 100 : 50,
    };
  }

  /**
   * Get historical performance data for similar content
   */
  private async getHistoricalPerformance(
    contentType: string,
    topic: string,
  ): Promise<any[]> {
    // In production, query actual content performance data
    // For now, return simulated historical data
    return [
      { views: 5000, engagement: 400, ctr: 0.08, shares: 50, viralScore: 65 },
      { views: 3000, engagement: 240, ctr: 0.06, shares: 30, viralScore: 55 },
      { views: 8000, engagement: 640, ctr: 0.10, shares: 80, viralScore: 75 },
      { views: 2000, engagement: 160, ctr: 0.05, shares: 20, viralScore: 45 },
      { views: 6000, engagement: 480, ctr: 0.09, shares: 60, viralScore: 70 },
    ];
  }

  /**
   * Extract performance patterns from historical data
   */
  private extractPerformancePatterns(historicalData: any[]): {
    avgViews: number;
    avgEngagement: number;
    avgCTR: number;
    avgShares: number;
    avgViralScore: number;
    topPerformers: any[];
  } {
    if (historicalData.length === 0) {
      return {
        avgViews: 3000,
        avgEngagement: 240,
        avgCTR: 0.06,
        avgShares: 30,
        avgViralScore: 55,
        topPerformers: [],
      };
    }

    const avgViews =
      historicalData.reduce((sum, d) => sum + d.views, 0) /
      historicalData.length;
    const avgEngagement =
      historicalData.reduce((sum, d) => sum + d.engagement, 0) /
      historicalData.length;
    const avgCTR =
      historicalData.reduce((sum, d) => sum + d.ctr, 0) / historicalData.length;
    const avgShares =
      historicalData.reduce((sum, d) => sum + d.shares, 0) /
      historicalData.length;
    const avgViralScore =
      historicalData.reduce((sum, d) => sum + d.viralScore, 0) /
      historicalData.length;

    // Top 20% performers
    const sortedByViews = [...historicalData].sort((a, b) => b.views - a.views);
    const topPerformers = sortedByViews.slice(
      0,
      Math.ceil(historicalData.length * 0.2),
    );

    return {
      avgViews,
      avgEngagement,
      avgCTR,
      avgShares,
      avgViralScore,
      topPerformers,
    };
  }

  /**
   * Generate ML-based performance prediction
   */
  private async generateMLPrediction(
    features: ContentFeatures,
    patterns: any,
    headlineScore: any,
  ): Promise<{
    views: number;
    engagement: number;
    ctr: number;
    shares: number;
    confidence: number;
  }> {
    // Base prediction on historical patterns
    let views = patterns.avgViews;
    let engagement = patterns.avgEngagement;
    let ctr = patterns.avgCTR;
    let shares = patterns.avgShares;

    // Adjust based on headline quality
    const headlineMultiplier = headlineScore.score / 100;
    views *= 0.7 + headlineMultiplier * 0.6; // 70-130% of average
    engagement *= 0.7 + headlineMultiplier * 0.6;
    ctr *= 0.7 + headlineMultiplier * 0.6;
    shares *= 0.7 + headlineMultiplier * 0.6;

    // Adjust based on content features
    if (features.hasVideo) {
      views *= 1.5;
      engagement *= 1.3;
    }
    if (features.hasImage) {
      engagement *= 1.2;
    }
    if (features.hasCTA) {
      ctr *= 1.4;
    }

    // Content type adjustments
    if (features.contentType === 'video') {
      views *= 1.8;
      engagement *= 1.5;
      shares *= 1.6;
    } else if (features.contentType === 'social') {
      shares *= 2.0;
    }

    // Platform-specific adjustments
    if (features.platform === 'tiktok') {
      views *= 2.0;
      shares *= 1.8;
    } else if (features.platform === 'youtube') {
      views *= 1.5;
    } else if (features.platform === 'linkedin') {
      engagement *= 1.3;
    }

    // Calculate confidence based on data quality
    let confidence = 65; // Base confidence
    if (patterns.topPerformers.length > 5) confidence += 15;
    if (headlineScore.score > 70) confidence += 10;
    if (features.keywords.length >= 3) confidence += 5;

    return {
      views: Math.round(views),
      engagement: Math.round(engagement),
      ctr: Math.round(ctr * 10000) / 10000,
      shares: Math.round(shares),
      confidence: Math.min(95, confidence),
    };
  }

  /**
   * Calculate viral potential
   */
  private calculateViralPotential(
    features: ContentFeatures,
    prediction: any,
  ): number {
    let score = 40; // Base score

    // High share rate indicates viral potential
    const shareRate = prediction.shares / prediction.views;
    if (shareRate > 0.02) score += 30;
    else if (shareRate > 0.01) score += 20;
    else if (shareRate > 0.005) score += 10;

    // Content type impact
    if (features.contentType === 'video') score += 15;
    if (features.contentType === 'social') score += 10;

    // Platform impact
    if (features.platform === 'tiktok') score += 20;
    else if (features.platform === 'instagram') score += 15;

    // Emotional tone
    if (
      features.emotionalTone === 'humorous' ||
      features.emotionalTone === 'inspiring'
    ) {
      score += 10;
    }

    // Media richness
    if (features.hasVideo) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate success probability
   */
  private calculateSuccessProbability(prediction: any, patterns: any): number {
    let probability = 50;

    // Compare to average performance
    if (prediction.views > patterns.avgViews * 1.5) probability += 25;
    else if (prediction.views > patterns.avgViews) probability += 15;

    if (prediction.engagement > patterns.avgEngagement * 1.5) probability += 20;
    else if (prediction.engagement > patterns.avgEngagement) probability += 10;

    if (prediction.ctr > patterns.avgCTR * 1.3) probability += 15;

    // Confidence multiplier
    probability = probability * (prediction.confidence / 100);

    return Math.min(95, Math.max(5, Math.round(probability)));
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    features: ContentFeatures,
    prediction: any,
    patterns: any,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // View optimization
    if (prediction.views < patterns.avgViews) {
      recommendations.push('📈 Optimize headline for better click-through rate');
      if (!features.hasImage) {
        recommendations.push('🖼️ Add compelling featured image');
      }
    }

    // Engagement optimization
    if (prediction.engagement < patterns.avgEngagement) {
      recommendations.push('💬 Add more interactive elements (polls, questions)');
      if (!features.hasCTA) {
        recommendations.push('🎯 Include clear call-to-action');
      }
    }

    // Shareability
    if (prediction.shares < patterns.avgShares) {
      recommendations.push('🔄 Make content more shareable (quotable insights, stats)');
      if (features.contentType !== 'video') {
        recommendations.push('🎥 Consider creating video version');
      }
    }

    // Platform-specific
    if (features.platform === 'tiktok' && !features.hasVideo) {
      recommendations.push('📹 TikTok requires video content');
    }

    if (features.platform === 'linkedin' && features.emotionalTone !== 'professional') {
      recommendations.push('👔 Adjust tone for LinkedIn professional audience');
    }

    // Timing
    if (!features.publishTime) {
      recommendations.push('⏰ Schedule for optimal publish time (analyze audience activity)');
    }

    return recommendations;
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(features: ContentFeatures, prediction: any): string[] {
    const risks: string[] = [];

    if (prediction.confidence < 50) {
      risks.push('⚠️ Low confidence prediction - insufficient historical data');
    }

    if (!features.hasImage && !features.hasVideo) {
      risks.push('⚠️ Text-only content typically underperforms');
    }

    if (features.headline.length < 40) {
      risks.push('⚠️ Headline may be too short to capture attention');
    } else if (features.headline.length > 80) {
      risks.push('⚠️ Headline may be too long, could get truncated');
    }

    if (features.keywords.length === 0) {
      risks.push('⚠️ No keywords specified - poor SEO optimization');
    }

    if (features.contentType === 'blog' && features.wordCount && features.wordCount < 800) {
      risks.push('⚠️ Blog post may be too short for good SEO performance');
    }

    if (prediction.views < 1000) {
      risks.push('⚠️ Low predicted reach - consider different angle or timing');
    }

    return risks;
  }

  /**
   * Identify top performing elements
   */
  private identifyTopElements(features: ContentFeatures, patterns: any): string[] {
    const elements: string[] = [];

    if (features.hasVideo) {
      elements.push('✅ Video content (1.5-2x engagement boost)');
    }

    if (features.hasCTA) {
      elements.push('✅ Clear call-to-action (1.4x CTR boost)');
    }

    if (features.keywords.length >= 5) {
      elements.push('✅ Strong keyword targeting');
    }

    if (features.emotionalTone === 'humorous' || features.emotionalTone === 'inspiring') {
      elements.push('✅ High-engagement emotional tone');
    }

    if (features.hasImage) {
      elements.push('✅ Visual content included');
    }

    return elements;
  }

  /**
   * Batch predict performance for multiple content pieces
   */
  async batchPredictPerformance(
    contentList: ContentFeatures[],
  ): Promise<ContentPrediction[]> {
    const predictions: ContentPrediction[] = [];

    for (const content of contentList) {
      try {
        const prediction = await this.predictPerformance(content);
        predictions.push(prediction);
      } catch (error) {
        this.logger.error(
          `Error predicting ${content.headline}: ${error.message}`,
        );
      }
    }

    return predictions.sort((a, b) => b.successProbability - a.successProbability);
  }

  /**
   * Get content optimization suggestions
   */
  async getOptimizationSuggestions(
    features: ContentFeatures,
  ): Promise<{
    currentScore: number;
    potentialScore: number;
    improvements: Array<{
      element: string;
      impact: number;
      suggestion: string;
    }>;
  }> {
    const currentPrediction = await this.predictPerformance(features);

    const improvements = [];

    // Test adding video
    if (!features.hasVideo) {
      const withVideo = { ...features, hasVideo: true };
      const videoImpact =
        ((await this.predictPerformance(withVideo)).predictedViews -
          currentPrediction.predictedViews) /
        currentPrediction.predictedViews;

      improvements.push({
        element: 'Add Video',
        impact: Math.round(videoImpact * 100),
        suggestion: 'Add video to increase views by ~50-80%',
      });
    }

    // Test adding CTA
    if (!features.hasCTA) {
      const withCTA = { ...features, hasCTA: true };
      const ctaImpact =
        ((await this.predictPerformance(withCTA)).predictedCTR -
          currentPrediction.predictedCTR) /
        currentPrediction.predictedCTR;

      improvements.push({
        element: 'Add CTA',
        impact: Math.round(ctaImpact * 100),
        suggestion: 'Add call-to-action to increase CTR by ~40%',
      });
    }

    return {
      currentScore: currentPrediction.successProbability,
      potentialScore: Math.min(
        95,
        currentPrediction.successProbability +
          improvements.reduce((sum, i) => sum + i.impact, 0),
      ),
      improvements: improvements.sort((a, b) => b.impact - a.impact),
    };
  }
}
