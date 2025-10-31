import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

/**
 * Query Optimizer Service
 * Tracks and optimizes database query performance
 * Identifies slow queries and provides optimization recommendations
 */

export interface QueryMetrics {
  queryName: string;
  executionTime: number;
  rowsReturned: number;
  timestamp: Date;
  params?: any;
}

export interface SlowQuery {
  queryName: string;
  avgExecutionTime: number;
  maxExecutionTime: number;
  totalExecutions: number;
  lastExecuted: Date;
  recommendations: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface QueryOptimization {
  currentPerformance: {
    avgResponseTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  recommendations: Array<{
    query: string;
    issue: string;
    suggestion: string;
    estimatedImprovement: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  indexSuggestions: Array<{
    table: string;
    columns: string[];
    reason: string;
    estimatedImprovement: string;
  }>;
}

@Injectable()
export class QueryOptimizerService {
  private readonly logger = new Logger('QueryOptimizer');
  private queryMetrics: Map<string, QueryMetrics[]> = new Map();
  private slowQueryThreshold = 1000; // 1 second

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track query execution
   */
  async trackQuery(
    queryName: string,
    executionTime: number,
    rowsReturned: number,
    params?: any,
  ): Promise<void> {
    const metric: QueryMetrics = {
      queryName,
      executionTime,
      rowsReturned,
      timestamp: new Date(),
      params,
    };

    if (!this.queryMetrics.has(queryName)) {
      this.queryMetrics.set(queryName, []);
    }

    this.queryMetrics.get(queryName)!.push(metric);

    // Keep only last 100 executions per query
    const metrics = this.queryMetrics.get(queryName)!;
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      this.logger.warn(
        `Slow query detected: ${queryName} (${executionTime}ms, ${rowsReturned} rows)`,
      );
    }
  }

  /**
   * Execute query with tracking
   */
  async executeWithTracking<T>(
    queryName: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      // Determine rows returned
      let rowsReturned = 0;
      if (Array.isArray(result)) {
        rowsReturned = result.length;
      } else if (result && typeof result === 'object') {
        rowsReturned = 1;
      }

      await this.trackQuery(queryName, executionTime, rowsReturned);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.trackQuery(queryName, executionTime, 0);
      throw error;
    }
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(threshold?: number): Promise<SlowQuery[]> {
    const slowThreshold = threshold || this.slowQueryThreshold;
    const slowQueries: SlowQuery[] = [];

    for (const [queryName, metrics] of this.queryMetrics.entries()) {
      const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;

      if (avgTime > slowThreshold) {
        const maxTime = Math.max(...metrics.map(m => m.executionTime));
        const recommendations = this.generateRecommendations(queryName, avgTime, metrics);

        slowQueries.push({
          queryName,
          avgExecutionTime: Math.round(avgTime),
          maxExecutionTime: maxTime,
          totalExecutions: metrics.length,
          lastExecuted: metrics[metrics.length - 1].timestamp,
          recommendations,
          priority: this.getPriority(avgTime),
        });
      }
    }

    return slowQueries.sort((a, b) => b.avgExecutionTime - a.avgExecutionTime);
  }

  /**
   * Get query statistics
   */
  async getQueryStats(): Promise<{
    totalQueries: number;
    slowQueries: number;
    avgResponseTime: number;
    queriesByType: Record<string, number>;
  }> {
    let totalExecutions = 0;
    let totalTime = 0;
    let slowCount = 0;
    const queriesByType: Record<string, number> = {};

    for (const [queryName, metrics] of this.queryMetrics.entries()) {
      totalExecutions += metrics.length;
      totalTime += metrics.reduce((sum, m) => sum + m.executionTime, 0);

      const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
      if (avgTime > this.slowQueryThreshold) {
        slowCount++;
      }

      // Categorize by query type
      const type = this.getQueryType(queryName);
      queriesByType[type] = (queriesByType[type] || 0) + metrics.length;
    }

    return {
      totalQueries: this.queryMetrics.size,
      slowQueries: slowCount,
      avgResponseTime: totalExecutions > 0 ? Math.round(totalTime / totalExecutions) : 0,
      queriesByType,
    };
  }

  /**
   * Get comprehensive query optimization report
   */
  async getOptimizationReport(): Promise<QueryOptimization> {
    const stats = await this.getQueryStats();
    const slowQueries = await this.getSlowQueries();

    const recommendations = slowQueries.map(sq => ({
      query: sq.queryName,
      issue: `Query averaging ${sq.avgExecutionTime}ms (${sq.totalExecutions} executions)`,
      suggestion: sq.recommendations[0] || 'Consider adding indexes or optimizing query structure',
      estimatedImprovement: this.estimateImprovement(sq.avgExecutionTime),
      priority: sq.priority,
    }));

    const indexSuggestions = this.generateIndexSuggestions();

    return {
      currentPerformance: {
        avgResponseTime: stats.avgResponseTime,
        slowQueries: stats.slowQueries,
        totalQueries: stats.totalQueries,
      },
      recommendations,
      indexSuggestions,
    };
  }

  /**
   * Optimize specific query
   */
  async optimizeQuery(queryName: string): Promise<{
    original: { avgTime: number; maxTime: number };
    recommendations: string[];
    estimatedImprovement: string;
  }> {
    const metrics = this.queryMetrics.get(queryName);

    if (!metrics || metrics.length === 0) {
      throw new Error(`No metrics found for query: ${queryName}`);
    }

    const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const maxTime = Math.max(...metrics.map(m => m.executionTime));

    return {
      original: {
        avgTime: Math.round(avgTime),
        maxTime,
      },
      recommendations: this.generateRecommendations(queryName, avgTime, metrics),
      estimatedImprovement: this.estimateImprovement(avgTime),
    };
  }

  /**
   * Clear query metrics
   */
  async clearMetrics(): Promise<void> {
    const queryCount = this.queryMetrics.size;
    this.queryMetrics.clear();
    this.logger.log(`Cleared metrics for ${queryCount} queries`);
  }

  /**
   * Get N+1 query detection
   */
  async detectNPlusOne(): Promise<Array<{
    pattern: string;
    occurrences: number;
    recommendation: string;
  }>> {
    const patterns: Map<string, number> = new Map();

    // Analyze query patterns for potential N+1
    for (const [queryName, metrics] of this.queryMetrics.entries()) {
      // Check for repeated similar queries in short timeframe
      const recentQueries = metrics.filter(
        m => Date.now() - m.timestamp.getTime() < 5000, // Last 5 seconds
      );

      if (recentQueries.length > 10) {
        patterns.set(queryName, recentQueries.length);
      }
    }

    return Array.from(patterns.entries()).map(([pattern, count]) => ({
      pattern,
      occurrences: count,
      recommendation: `Detected ${count} similar queries. Consider using eager loading or batch queries.`,
    }));
  }

  /**
   * Suggest database indexes
   */
  async suggestIndexes(): Promise<Array<{
    table: string;
    columns: string[];
    reason: string;
  }>> {
    // In production, analyze actual query plans
    // For now, provide common index suggestions
    return [
      {
        table: 'ProgrammaticPage',
        columns: ['merchantId', 'publishedAt'],
        reason: 'Frequently filtered by merchant and publication status',
      },
      {
        table: 'Keyword',
        columns: ['difficulty', 'searchVolume'],
        reason: 'Commonly used in sorting and filtering',
      },
      {
        table: 'TrendData',
        columns: ['keywordId', 'capturedAt'],
        reason: 'Time-series queries benefit from compound index',
      },
      {
        table: 'Backlink',
        columns: ['merchantId', 'status'],
        reason: 'Filtered by merchant and status frequently',
      },
      {
        table: 'Campaign',
        columns: ['merchantId', 'status', 'startDate'],
        reason: 'Complex queries on campaign status and dates',
      },
    ];
  }

  /**
   * Get query execution plan (simulated)
   */
  async explainQuery(queryName: string): Promise<{
    plan: string;
    estimatedCost: number;
    suggestions: string[];
  }> {
    const metrics = this.queryMetrics.get(queryName);

    if (!metrics || metrics.length === 0) {
      throw new Error(`No metrics found for query: ${queryName}`);
    }

    const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;

    return {
      plan: 'Sequential Scan (simulated)', // In production, use EXPLAIN
      estimatedCost: avgTime,
      suggestions: this.generateRecommendations(queryName, avgTime, metrics),
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private generateRecommendations(
    queryName: string,
    avgTime: number,
    metrics: QueryMetrics[],
  ): string[] {
    const recommendations: string[] = [];

    // Check if query is very slow
    if (avgTime > 5000) {
      recommendations.push('CRITICAL: Query exceeds 5s - consider breaking into smaller queries');
    } else if (avgTime > 2000) {
      recommendations.push('Add database indexes for frequently queried columns');
    } else if (avgTime > 1000) {
      recommendations.push('Consider caching results for frequently accessed data');
    }

    // Check for large result sets
    const avgRows = metrics.reduce((sum, m) => sum + m.rowsReturned, 0) / metrics.length;
    if (avgRows > 1000) {
      recommendations.push('Implement pagination to reduce data transfer');
    }

    // Check for frequent executions
    if (metrics.length > 50) {
      recommendations.push('High execution frequency - excellent caching candidate');
    }

    // Generic recommendations
    if (queryName.includes('join')) {
      recommendations.push('Review JOIN strategy - ensure proper indexes on join columns');
    }

    if (queryName.includes('count')) {
      recommendations.push('Consider caching count queries or using approximations');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Query performance is acceptable - no immediate optimizations needed'];
  }

  private getPriority(avgTime: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (avgTime > 5000) return 'HIGH';
    if (avgTime > 2000) return 'MEDIUM';
    return 'LOW';
  }

  private estimateImprovement(currentTime: number): string {
    if (currentTime > 5000) {
      return '70-90% reduction possible with proper indexing and caching';
    } else if (currentTime > 2000) {
      return '50-70% reduction possible with optimizations';
    } else if (currentTime > 1000) {
      return '30-50% reduction possible with caching';
    }
    return '10-30% marginal improvement possible';
  }

  private getQueryType(queryName: string): string {
    const name = queryName.toLowerCase();

    if (name.includes('keyword')) return 'Keyword';
    if (name.includes('trend')) return 'Trend';
    if (name.includes('page') || name.includes('content')) return 'Content';
    if (name.includes('backlink') || name.includes('link')) return 'LinkBuilding';
    if (name.includes('campaign')) return 'Campaign';
    if (name.includes('ml') || name.includes('predict')) return 'ML';

    return 'Other';
  }

  private generateIndexSuggestions(): Array<{
    table: string;
    columns: string[];
    reason: string;
    estimatedImprovement: string;
  }> {
    return [
      {
        table: 'ProgrammaticPage',
        columns: ['merchantId', 'publishedAt'],
        reason: 'High-frequency filtering by merchant and publication status',
        estimatedImprovement: '60-80% query time reduction',
      },
      {
        table: 'Keyword',
        columns: ['searchVolume', 'difficulty'],
        reason: 'Frequently used in sorting and range queries',
        estimatedImprovement: '40-60% query time reduction',
      },
      {
        table: 'TrendData',
        columns: ['keywordId', 'capturedAt'],
        reason: 'Time-series queries with keyword joins',
        estimatedImprovement: '70-85% query time reduction',
      },
      {
        table: 'Backlink',
        columns: ['merchantId', 'status', 'domainAuthority'],
        reason: 'Complex filtering and sorting operations',
        estimatedImprovement: '50-70% query time reduction',
      },
      {
        table: 'Campaign',
        columns: ['merchantId', 'startDate', 'endDate'],
        reason: 'Date range queries with merchant filtering',
        estimatedImprovement: '55-75% query time reduction',
      },
    ];
  }
}
