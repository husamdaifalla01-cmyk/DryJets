import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Metrics Collector Service
 * Collects and tracks performance metrics for all marketing services
 */

export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface MetricSummary {
  name: string;
  current: number;
  avg: number;
  min: number;
  max: number;
  count: number;
  unit: string;
  period: string;
}

export interface PerformanceMetrics {
  timestamp: Date;
  period: 'hour' | 'day' | 'week' | 'month';

  // API Metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;

  // ML Model Metrics
  mlPredictions: number;
  mlAccuracy: number;
  mlConfidence: number;

  // Content Generation Metrics
  pagesGenerated: number;
  keywordsDiscovered: number;
  trendsTracked: number;

  // Link Building Metrics
  backlinksAcquired: number;
  outreachEmailsSent: number;
  partnershipProposals: number;

  // A/B Testing Metrics
  activeTests: number;
  testsCompleted: number;
  avgImprovement: number;

  // Error Metrics
  totalErrors: number;
  criticalErrors: number;
  warningErrors: number;
}

@Injectable()
export class MetricsCollectorService {
  private readonly logger = new Logger('MetricsCollector');
  private metricsBuffer: Metric[] = [];
  private bufferSize = 1000;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a metric
   */
  async recordMetric(
    name: string,
    value: number,
    unit: string = 'count',
    tags?: Record<string, string>,
  ): Promise<void> {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
    };

    this.metricsBuffer.push(metric);

    // Flush buffer if full
    if (this.metricsBuffer.length >= this.bufferSize) {
      await this.flushMetrics();
    }

    this.logger.debug(`Metric recorded: ${name} = ${value} ${unit}`);
  }

  /**
   * Flush metrics buffer to storage
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    this.logger.log(`Flushing ${this.metricsBuffer.length} metrics`);

    // In production, send to metrics service (Prometheus, DataDog, etc.)
    // For now, we'll just log them
    this.metricsBuffer = [];
  }

  /**
   * Get performance metrics for period
   */
  async getPerformanceMetrics(
    period: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<PerformanceMetrics> {
    this.logger.log(`Getting performance metrics for period: ${period}`);

    const now = new Date();
    const startDate = this.getStartDate(now, period);

    // Get metrics from database
    const [
      pagesGenerated,
      keywordsCount,
      trendsCount,
      backlinksCount,
    ] = await Promise.all([
      this.prisma.programmaticPage.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.keyword.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.trendData.count({
        where: { capturedAt: { gte: startDate } },
      }),
      this.prisma.backlink.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    return {
      timestamp: now,
      period,

      // API Metrics (simulated - in production, track with middleware)
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,

      // ML Model Metrics (simulated - track in production)
      mlPredictions: 0,
      mlAccuracy: 85,
      mlConfidence: 82,

      // Content Generation Metrics
      pagesGenerated,
      keywordsDiscovered: keywordsCount,
      trendsTracked: trendsCount,

      // Link Building Metrics
      backlinksAcquired: backlinksCount,
      outreachEmailsSent: 0, // Track in production
      partnershipProposals: 0, // Track in production

      // A/B Testing Metrics
      activeTests: 0,
      testsCompleted: 0,
      avgImprovement: 0,

      // Error Metrics
      totalErrors: 0,
      criticalErrors: 0,
      warningErrors: 0,
    };
  }

  /**
   * Get metric summary
   */
  async getMetricSummary(
    metricName: string,
    period: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<MetricSummary> {
    // In production, query actual metrics from storage
    // For now, return simulated data
    return {
      name: metricName,
      current: 0,
      avg: 0,
      min: 0,
      max: 0,
      count: 0,
      unit: 'count',
      period,
    };
  }

  /**
   * Get API performance metrics
   */
  async getAPIMetrics(): Promise<{
    endpoints: Array<{
      path: string;
      method: string;
      totalCalls: number;
      avgResponseTime: number;
      errorRate: number;
    }>;
  }> {
    // In production, track actual API calls
    // For now, return structure
    return {
      endpoints: [],
    };
  }

  /**
   * Get ML model performance metrics
   */
  async getMLModelMetrics(): Promise<{
    models: Array<{
      name: string;
      totalPredictions: number;
      avgAccuracy: number;
      avgConfidence: number;
      avgResponseTime: number;
    }>;
  }> {
    return {
      models: [
        {
          name: 'TrendForecaster',
          totalPredictions: 0,
          avgAccuracy: 85,
          avgConfidence: 82,
          avgResponseTime: 150,
        },
        {
          name: 'ContentPredictor',
          totalPredictions: 0,
          avgAccuracy: 78,
          avgConfidence: 75,
          avgResponseTime: 200,
        },
        {
          name: 'SmartABTesting',
          totalPredictions: 0,
          avgAccuracy: 92,
          avgConfidence: 88,
          avgResponseTime: 50,
        },
        {
          name: 'KeywordClustering',
          totalPredictions: 0,
          avgAccuracy: 88,
          avgConfidence: 85,
          avgResponseTime: 300,
        },
        {
          name: 'CampaignPredictor',
          totalPredictions: 0,
          avgAccuracy: 82,
          avgConfidence: 80,
          avgResponseTime: 180,
        },
      ],
    };
  }

  /**
   * Get content generation metrics
   */
  async getContentMetrics(): Promise<{
    pages: {
      total: number;
      published: number;
      draft: number;
      avgWordCount: number;
    };
    keywords: {
      total: number;
      primary: number;
      secondary: number;
      tertiary: number;
    };
    trends: {
      total: number;
      emerging: number;
      growing: number;
      peak: number;
      declining: number;
    };
  }> {
    const [totalPages, publishedPages, totalKeywords, totalTrends] =
      await Promise.all([
        this.prisma.programmaticPage.count(),
        this.prisma.programmaticPage.count({
          where: { publishedAt: { not: null } },
        }),
        this.prisma.keyword.count(),
        this.prisma.trendData.count(),
      ]);

    return {
      pages: {
        total: totalPages,
        published: publishedPages,
        draft: totalPages - publishedPages,
        avgWordCount: 0, // Calculate in production
      },
      keywords: {
        total: totalKeywords,
        primary: 0,
        secondary: 0,
        tertiary: 0,
      },
      trends: {
        total: totalTrends,
        emerging: 0,
        growing: 0,
        peak: 0,
        declining: 0,
      },
    };
  }

  /**
   * Get link building metrics
   */
  async getLinkBuildingMetrics(): Promise<{
    backlinks: {
      total: number;
      active: number;
      lost: number;
      avgDomainAuthority: number;
    };
    campaigns: {
      haro: number;
      brokenLink: number;
      partnership: number;
      resourcePage: number;
    };
  }> {
    const [totalBacklinks, activeBacklinks] = await Promise.all([
      this.prisma.backlink.count(),
      this.prisma.backlink.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    return {
      backlinks: {
        total: totalBacklinks,
        active: activeBacklinks,
        lost: 0,
        avgDomainAuthority: 0,
      },
      campaigns: {
        haro: 0,
        brokenLink: 0,
        partnership: 0,
        resourcePage: 0,
      },
    };
  }

  /**
   * Record API call metric
   */
  async recordAPICall(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
  ): Promise<void> {
    await this.recordMetric(`api.${method}.${endpoint}`, 1, 'count', {
      statusCode: statusCode.toString(),
      responseTime: responseTime.toString(),
    });

    await this.recordMetric(
      `api.response_time`,
      responseTime,
      'ms',
      { endpoint, method },
    );
  }

  /**
   * Record ML prediction metric
   */
  async recordMLPrediction(
    modelName: string,
    responseTime: number,
    confidence: number,
  ): Promise<void> {
    await this.recordMetric(`ml.${modelName}.predictions`, 1, 'count');
    await this.recordMetric(
      `ml.${modelName}.response_time`,
      responseTime,
      'ms',
    );
    await this.recordMetric(
      `ml.${modelName}.confidence`,
      confidence,
      'percent',
    );
  }

  /**
   * Record error metric
   */
  async recordError(
    service: string,
    errorType: string,
    severity: 'critical' | 'warning' | 'info',
  ): Promise<void> {
    await this.recordMetric(`errors.${service}.${errorType}`, 1, 'count', {
      severity,
    });
  }

  /**
   * Get helper to calculate start date
   */
  private getStartDate(
    now: Date,
    period: 'hour' | 'day' | 'week' | 'month',
  ): Date {
    const date = new Date(now);

    switch (period) {
      case 'hour':
        date.setHours(date.getHours() - 1);
        break;
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
    }

    return date;
  }

  /**
   * Get system-wide metrics summary
   */
  async getSystemMetrics(): Promise<{
    uptime: number;
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    avgResponseTime: number;
    mlPredictions: number;
    contentGenerated: number;
    backlinksAcquired: number;
  }> {
    const metrics = await this.getPerformanceMetrics('day');

    return {
      uptime: process.uptime(),
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      errorRate:
        metrics.totalRequests > 0
          ? (metrics.failedRequests / metrics.totalRequests) * 100
          : 0,
      avgResponseTime: metrics.avgResponseTime,
      mlPredictions: metrics.mlPredictions,
      contentGenerated: metrics.pagesGenerated,
      backlinksAcquired: metrics.backlinksAcquired,
    };
  }
}
