import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * ML-based Trend Forecasting Service
 * Uses time-series analysis and pattern recognition to predict trend trajectories
 */

export interface TrendForecast {
  trendId: string;
  keyword: string;
  currentVolume: number;
  forecastedVolume: number;
  peakDate: Date;
  peakVolume: number;
  confidence: number; // 0-100
  growthRate: number; // percentage
  lifecycle: 'EMERGING' | 'GROWING' | 'PEAK' | 'DECLINING' | 'DEAD';
  daysUntilPeak: number;
  opportunityScore: number; // 0-100
  modelVersion: string;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  volume: number;
  growth: number;
  sentiment?: number;
}

@Injectable()
export class MLTrendForecasterService {
  private readonly logger = new Logger('MLTrendForecaster');
  private readonly anthropic: Anthropic;

  constructor(private readonly prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Forecast trend trajectory using ML
   */
  async forecastTrend(trendId: string): Promise<TrendForecast> {
    this.logger.log(`Forecasting trend: ${trendId}`);

    // Get historical trend data
    const trendData = await this.getTrendHistory(trendId);
    if (!trendData || trendData.length === 0) {
      throw new Error('Insufficient trend data for forecasting');
    }

    const latestTrend = trendData[0];

    // Extract time series features
    const features = this.extractTimeSeriesFeatures(trendData);

    // Generate ML-based forecast using Claude
    const mlForecast = await this.generateMLForecast(
      latestTrend.keyword,
      features,
      trendData,
    );

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(trendData, mlForecast);

    // Determine lifecycle stage
    const lifecycle = this.determineLifecycleStage(
      features.growthAcceleration,
      features.volatility,
      mlForecast,
    );

    // Calculate opportunity score
    const opportunityScore = this.calculateOpportunityScore(
      mlForecast,
      lifecycle,
      confidence,
    );

    return {
      trendId: latestTrend.id,
      keyword: latestTrend.keyword,
      currentVolume: latestTrend.volume,
      forecastedVolume: mlForecast.peakVolume,
      peakDate: mlForecast.peakDate,
      peakVolume: mlForecast.peakVolume,
      confidence,
      growthRate: features.averageGrowthRate,
      lifecycle,
      daysUntilPeak: mlForecast.daysUntilPeak,
      opportunityScore,
      modelVersion: 'ml-v1.0',
    };
  }

  /**
   * Batch forecast multiple trends
   */
  async batchForecastTrends(limit: number = 50): Promise<TrendForecast[]> {
    this.logger.log(`Batch forecasting top ${limit} trends`);

    // Get active trends
    const trends = await this.prisma.trendData.findMany({
      where: {
        lifecycle: {
          in: ['EMERGING', 'GROWING'],
        },
      },
      orderBy: {
        volume: 'desc',
      },
      take: limit,
      distinct: ['keyword'],
    });

    const forecasts: TrendForecast[] = [];

    for (const trend of trends) {
      try {
        const forecast = await this.forecastTrend(trend.id);
        forecasts.push(forecast);
      } catch (error) {
        this.logger.error(
          `Error forecasting trend ${trend.keyword}: ${error.message}`,
        );
      }
    }

    return forecasts.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }

  /**
   * Get trend history for analysis
   */
  private async getTrendHistory(trendId: string): Promise<any[]> {
    const trend = await this.prisma.trendData.findUnique({
      where: { id: trendId },
    });

    if (!trend) return [];

    // Get all data points for this keyword
    const history = await this.prisma.trendData.findMany({
      where: {
        keyword: trend.keyword,
      },
      orderBy: {
        capturedAt: 'desc',
      },
      take: 30, // Last 30 data points
    });

    return history;
  }

  /**
   * Extract time-series features from trend data
   */
  private extractTimeSeriesFeatures(trendData: any[]): {
    averageGrowthRate: number;
    maxGrowth: number;
    minGrowth: number;
    growthAcceleration: number;
    volatility: number;
    trendDirection: 'UPWARD' | 'DOWNWARD' | 'STABLE';
    dataPoints: number;
    timeSpanDays: number;
  } {
    if (trendData.length < 2) {
      return {
        averageGrowthRate: 0,
        maxGrowth: 0,
        minGrowth: 0,
        growthAcceleration: 0,
        volatility: 0,
        trendDirection: 'STABLE',
        dataPoints: trendData.length,
        timeSpanDays: 0,
      };
    }

    // Calculate growth rates
    const growthRates = trendData
      .slice(0, -1)
      .map((data, i) => {
        const current = data.volume;
        const previous = trendData[i + 1].volume;
        return previous > 0 ? ((current - previous) / previous) * 100 : 0;
      });

    const averageGrowthRate =
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const maxGrowth = Math.max(...growthRates);
    const minGrowth = Math.min(...growthRates);

    // Calculate growth acceleration (second derivative)
    const growthAcceleration =
      growthRates.length > 1
        ? growthRates[0] - growthRates[growthRates.length - 1]
        : 0;

    // Calculate volatility (standard deviation of growth rates)
    const variance =
      growthRates.reduce(
        (sum, rate) => sum + Math.pow(rate - averageGrowthRate, 2),
        0,
      ) / growthRates.length;
    const volatility = Math.sqrt(variance);

    // Determine trend direction
    let trendDirection: 'UPWARD' | 'DOWNWARD' | 'STABLE' = 'STABLE';
    if (averageGrowthRate > 5) trendDirection = 'UPWARD';
    else if (averageGrowthRate < -5) trendDirection = 'DOWNWARD';

    // Calculate time span
    const oldestDate = new Date(trendData[trendData.length - 1].capturedAt);
    const newestDate = new Date(trendData[0].capturedAt);
    const timeSpanDays = Math.floor(
      (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      averageGrowthRate,
      maxGrowth,
      minGrowth,
      growthAcceleration,
      volatility,
      trendDirection,
      dataPoints: trendData.length,
      timeSpanDays,
    };
  }

  /**
   * Generate ML forecast using Claude with advanced prompting
   */
  private async generateMLForecast(
    keyword: string,
    features: any,
    historicalData: any[],
  ): Promise<{
    peakDate: Date;
    peakVolume: number;
    daysUntilPeak: number;
    reasoning: string;
  }> {
    // Prepare historical data summary
    const dataSummary = historicalData.slice(0, 10).map((d) => ({
      date: d.capturedAt,
      volume: d.volume,
      growth: d.growth,
    }));

    const prompt = `You are a time-series forecasting AI. Analyze this trend and predict its peak.

Keyword: "${keyword}"

Historical Data (last 10 points):
${JSON.stringify(dataSummary, null, 2)}

Features:
- Average Growth Rate: ${features.averageGrowthRate.toFixed(2)}%
- Growth Acceleration: ${features.growthAcceleration.toFixed(2)}%
- Volatility: ${features.volatility.toFixed(2)}
- Trend Direction: ${features.trendDirection}
- Data Points: ${features.dataPoints}
- Time Span: ${features.timeSpanDays} days

Task: Predict when this trend will reach its peak volume.

Consider:
1. Current growth trajectory
2. Growth acceleration/deceleration
3. Typical trend lifecycle patterns
4. Seasonal effects
5. Market saturation indicators

Return JSON:
{
  "daysUntilPeak": <number of days until peak>,
  "peakVolume": <predicted peak search volume>,
  "reasoning": "<brief explanation of prediction>"
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const forecast = JSON.parse(jsonMatch[0]);

        const peakDate = new Date();
        peakDate.setDate(peakDate.getDate() + forecast.daysUntilPeak);

        return {
          peakDate,
          peakVolume: forecast.peakVolume,
          daysUntilPeak: forecast.daysUntilPeak,
          reasoning: forecast.reasoning,
        };
      }
    } catch (error) {
      this.logger.error(`ML forecast error: ${error.message}`);
    }

    // Fallback: Simple linear projection
    const currentVolume = historicalData[0].volume;
    const projectedGrowth = features.averageGrowthRate;
    const daysUntilPeak = Math.max(7, Math.min(30, 14 - features.growthAcceleration));

    return {
      peakDate: new Date(Date.now() + daysUntilPeak * 24 * 60 * 60 * 1000),
      peakVolume: Math.floor(
        currentVolume * (1 + (projectedGrowth / 100) * (daysUntilPeak / 7)),
      ),
      daysUntilPeak,
      reasoning: 'Linear projection based on average growth rate',
    };
  }

  /**
   * Calculate forecast confidence
   */
  private calculateConfidence(trendData: any[], forecast: any): number {
    let confidence = 50; // Base confidence

    // More data points = higher confidence
    if (trendData.length >= 20) confidence += 20;
    else if (trendData.length >= 10) confidence += 10;
    else confidence -= 10;

    // Consistent growth = higher confidence
    const growthRates = trendData.slice(0, -1).map((d, i) => {
      const current = d.volume;
      const previous = trendData[i + 1].volume;
      return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    });

    const variance =
      growthRates.reduce((sum, rate) => {
        const avg =
          growthRates.reduce((s, r) => s + r, 0) / growthRates.length;
        return sum + Math.pow(rate - avg, 2);
      }, 0) / growthRates.length;

    const stdDev = Math.sqrt(variance);
    if (stdDev < 10) confidence += 15;
    else if (stdDev < 20) confidence += 5;
    else confidence -= 10;

    // Recent data = higher confidence
    const daysSinceLastUpdate = Math.floor(
      (Date.now() - new Date(trendData[0].capturedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSinceLastUpdate <= 1) confidence += 10;
    else if (daysSinceLastUpdate > 7) confidence -= 15;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Determine trend lifecycle stage
   */
  private determineLifecycleStage(
    growthAcceleration: number,
    volatility: number,
    forecast: any,
  ): 'EMERGING' | 'GROWING' | 'PEAK' | 'DECLINING' | 'DEAD' {
    if (growthAcceleration > 10 && forecast.daysUntilPeak > 14) {
      return 'EMERGING';
    }
    if (growthAcceleration > 0 && forecast.daysUntilPeak > 7) {
      return 'GROWING';
    }
    if (forecast.daysUntilPeak <= 3) {
      return 'PEAK';
    }
    if (growthAcceleration < -5) {
      return 'DECLINING';
    }
    return 'GROWING';
  }

  /**
   * Calculate opportunity score
   */
  private calculateOpportunityScore(
    forecast: any,
    lifecycle: string,
    confidence: number,
  ): number {
    let score = 50;

    // Peak volume impact
    if (forecast.peakVolume > 50000) score += 20;
    else if (forecast.peakVolume > 10000) score += 10;
    else if (forecast.peakVolume < 1000) score -= 10;

    // Days until peak (sweet spot is 7-14 days)
    if (forecast.daysUntilPeak >= 7 && forecast.daysUntilPeak <= 14) {
      score += 20;
    } else if (forecast.daysUntilPeak > 14) {
      score += 10;
    } else if (forecast.daysUntilPeak < 3) {
      score -= 20; // Too late
    }

    // Lifecycle bonus
    if (lifecycle === 'EMERGING') score += 15;
    else if (lifecycle === 'GROWING') score += 10;
    else if (lifecycle === 'DECLINING') score -= 20;

    // Confidence multiplier
    score = score * (confidence / 100);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get top opportunities based on ML forecasts
   */
  async getTopOpportunities(limit: number = 20): Promise<TrendForecast[]> {
    const forecasts = await this.batchForecastTrends(100);

    // Filter for high-opportunity trends
    return forecasts
      .filter((f) => f.opportunityScore >= 60 && f.daysUntilPeak >= 5)
      .slice(0, limit);
  }

  /**
   * Predict content performance for a trend
   */
  async predictContentPerformance(
    trendId: string,
    contentType: 'blog' | 'video' | 'social',
  ): Promise<{
    estimatedViews: number;
    estimatedEngagement: number;
    bestPublishDate: Date;
    competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    const forecast = await this.forecastTrend(trendId);

    // Calculate optimal publish date (before peak)
    const optimalDaysBefore = 3;
    const bestPublishDate = new Date(forecast.peakDate);
    bestPublishDate.setDate(bestPublishDate.getDate() - optimalDaysBefore);

    // Estimate views based on peak volume and content type
    const multiplier = contentType === 'blog' ? 0.1 : contentType === 'video' ? 0.05 : 0.02;
    const estimatedViews = Math.floor(forecast.peakVolume * multiplier);

    // Estimate engagement (based on lifecycle)
    const engagementRate = forecast.lifecycle === 'EMERGING' ? 0.08 :
                          forecast.lifecycle === 'GROWING' ? 0.06 : 0.04;
    const estimatedEngagement = Math.floor(estimatedViews * engagementRate);

    // Determine competition level
    let competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (forecast.lifecycle === 'EMERGING') competitionLevel = 'LOW';
    else if (forecast.lifecycle === 'PEAK' || forecast.lifecycle === 'DECLINING') {
      competitionLevel = 'HIGH';
    }

    return {
      estimatedViews,
      estimatedEngagement,
      bestPublishDate,
      competitionLevel,
    };
  }
}
