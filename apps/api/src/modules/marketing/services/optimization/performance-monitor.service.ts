import { Injectable, Logger } from '@nestjs/common';

/**
 * Performance Monitor Service
 * Tracks API response times and resource usage
 * Provides real-time performance insights and bottleneck detection
 */

export interface APICallMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  memoryUsed?: number;
  cpuUsed?: number;
}

export interface EndpointPerformance {
  endpoint: string;
  method: string;
  totalCalls: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number; // requests per minute
  lastCalled: Date;
}

export interface PerformanceBottleneck {
  endpoint: string;
  issue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  avgResponseTime: number;
  recommendation: string;
  estimatedImprovement: string;
}

export interface PerformanceDashboard {
  overall: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  slowestEndpoints: EndpointPerformance[];
  bottlenecks: PerformanceBottleneck[];
  trends: {
    responseTimeChange: number; // % change from previous period
    throughputChange: number;
    errorRateChange: number;
  };
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger('PerformanceMonitor');
  private metrics: Map<string, APICallMetric[]> = new Map();
  private readonly maxMetricsPerEndpoint = 1000;
  private readonly slowThreshold = 1000; // 1 second

  /**
   * Track API call
   */
  async trackAPICall(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
  ): Promise<void> {
    const key = this.getEndpointKey(endpoint, method);

    const metric: APICallMetric = {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: new Date(),
      memoryUsed: process.memoryUsage().heapUsed,
      cpuUsed: process.cpuUsage().user,
    };

    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const endpointMetrics = this.metrics.get(key)!;
    endpointMetrics.push(metric);

    // Keep only last N metrics
    if (endpointMetrics.length > this.maxMetricsPerEndpoint) {
      endpointMetrics.shift();
    }

    // Log slow requests
    if (responseTime > this.slowThreshold) {
      this.logger.warn(
        `Slow API call: ${method} ${endpoint} (${responseTime}ms, status: ${statusCode})`,
      );
    }

    // Log errors
    if (statusCode >= 400) {
      this.logger.error(
        `API error: ${method} ${endpoint} (${responseTime}ms, status: ${statusCode})`,
      );
    }
  }

  /**
   * Get endpoint performance statistics
   */
  async getEndpointPerformance(
    endpoint: string,
    method: string,
  ): Promise<EndpointPerformance> {
    const key = this.getEndpointKey(endpoint, method);
    const metrics = this.metrics.get(key);

    if (!metrics || metrics.length === 0) {
      throw new Error(`No metrics found for ${method} ${endpoint}`);
    }

    const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
    const errorCount = metrics.filter(m => m.statusCode >= 400).length;

    // Calculate time range for throughput
    const oldestMetric = metrics[0].timestamp;
    const newestMetric = metrics[metrics.length - 1].timestamp;
    const durationMinutes = (newestMetric.getTime() - oldestMetric.getTime()) / (1000 * 60);

    return {
      endpoint,
      method,
      totalCalls: metrics.length,
      avgResponseTime: this.average(responseTimes),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p50ResponseTime: this.percentile(responseTimes, 50),
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      errorRate: (errorCount / metrics.length) * 100,
      throughput: durationMinutes > 0 ? metrics.length / durationMinutes : 0,
      lastCalled: metrics[metrics.length - 1].timestamp,
    };
  }

  /**
   * Get all endpoints performance
   */
  async getAllEndpointsPerformance(): Promise<EndpointPerformance[]> {
    const performances: EndpointPerformance[] = [];

    for (const [key, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;

      const [endpoint, method] = key.split('::');
      try {
        const perf = await this.getEndpointPerformance(endpoint, method);
        performances.push(perf);
      } catch (error) {
        this.logger.error(`Error getting performance for ${key}: ${error}`);
      }
    }

    return performances;
  }

  /**
   * Get slowest endpoints
   */
  async getSlowestEndpoints(limit: number = 10): Promise<EndpointPerformance[]> {
    const allPerformances = await this.getAllEndpointsPerformance();

    return allPerformances
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }

  /**
   * Detect performance bottlenecks
   */
  async detectBottlenecks(): Promise<PerformanceBottleneck[]> {
    const bottlenecks: PerformanceBottleneck[] = [];
    const allPerformances = await this.getAllEndpointsPerformance();

    for (const perf of allPerformances) {
      // Check for slow endpoints
      if (perf.avgResponseTime > 5000) {
        bottlenecks.push({
          endpoint: `${perf.method} ${perf.endpoint}`,
          issue: 'Extremely slow response time (>5s)',
          severity: 'CRITICAL',
          avgResponseTime: perf.avgResponseTime,
          recommendation: 'Implement aggressive caching, consider breaking into smaller operations, add database indexes',
          estimatedImprovement: '70-90% response time reduction',
        });
      } else if (perf.avgResponseTime > 2000) {
        bottlenecks.push({
          endpoint: `${perf.method} ${perf.endpoint}`,
          issue: 'Slow response time (>2s)',
          severity: 'HIGH',
          avgResponseTime: perf.avgResponseTime,
          recommendation: 'Add caching layer, optimize database queries, review N+1 query patterns',
          estimatedImprovement: '50-70% response time reduction',
        });
      } else if (perf.avgResponseTime > this.slowThreshold) {
        bottlenecks.push({
          endpoint: `${perf.method} ${perf.endpoint}`,
          issue: 'Moderate response time (>1s)',
          severity: 'MEDIUM',
          avgResponseTime: perf.avgResponseTime,
          recommendation: 'Consider caching, optimize expensive operations',
          estimatedImprovement: '30-50% response time reduction',
        });
      }

      // Check for high error rates
      if (perf.errorRate > 10) {
        bottlenecks.push({
          endpoint: `${perf.method} ${perf.endpoint}`,
          issue: `High error rate (${perf.errorRate.toFixed(1)}%)`,
          severity: 'HIGH',
          avgResponseTime: perf.avgResponseTime,
          recommendation: 'Review error handling, validate input parameters, check external API availability',
          estimatedImprovement: 'Reduce error rate by 60-80%',
        });
      } else if (perf.errorRate > 5) {
        bottlenecks.push({
          endpoint: `${perf.method} ${perf.endpoint}`,
          issue: `Elevated error rate (${perf.errorRate.toFixed(1)}%)`,
          severity: 'MEDIUM',
          avgResponseTime: perf.avgResponseTime,
          recommendation: 'Investigate error patterns, improve validation',
          estimatedImprovement: 'Reduce error rate by 40-60%',
        });
      }

      // Check for high p99 latency variance
      if (perf.p99ResponseTime > perf.p50ResponseTime * 5) {
        bottlenecks.push({
          endpoint: `${perf.method} ${perf.endpoint}`,
          issue: 'High latency variance (p99 >> p50)',
          severity: 'MEDIUM',
          avgResponseTime: perf.avgResponseTime,
          recommendation: 'Investigate outliers, add request timeouts, optimize worst-case scenarios',
          estimatedImprovement: '40-60% p99 latency reduction',
        });
      }
    }

    return bottlenecks.sort((a, b) => {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get performance dashboard
   */
  async getPerformanceDashboard(): Promise<PerformanceDashboard> {
    const allPerformances = await this.getAllEndpointsPerformance();
    const bottlenecks = await this.detectBottlenecks();
    const slowestEndpoints = await this.getSlowestEndpoints(10);

    // Calculate overall metrics
    let totalRequests = 0;
    let totalResponseTime = 0;
    let totalErrors = 0;

    for (const perf of allPerformances) {
      totalRequests += perf.totalCalls;
      totalResponseTime += perf.avgResponseTime * perf.totalCalls;
      totalErrors += (perf.errorRate / 100) * perf.totalCalls;
    }

    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const throughput = allPerformances.reduce((sum, p) => sum + p.throughput, 0);

    return {
      overall: {
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        throughput: Math.round(throughput),
      },
      slowestEndpoints,
      bottlenecks,
      trends: {
        responseTimeChange: 0, // Would calculate from historical data
        throughputChange: 0,
        errorRateChange: 0,
      },
    };
  }

  /**
   * Get resource usage statistics
   */
  async getResourceUsage(): Promise<{
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      user: number;
      system: number;
    };
    uptime: number;
  }> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      cpu: {
        user: cpuUsage.user / 1000000, // Convert to seconds
        system: cpuUsage.system / 1000000,
      },
      uptime: process.uptime(),
    };
  }

  /**
   * Clear metrics
   */
  async clearMetrics(): Promise<void> {
    const endpointCount = this.metrics.size;
    this.metrics.clear();
    this.logger.log(`Cleared metrics for ${endpointCount} endpoints`);
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<Array<{
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendation: string;
    estimatedImpact: string;
  }>> {
    const bottlenecks = await this.detectBottlenecks();
    const recommendations: Array<{
      category: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      recommendation: string;
      estimatedImpact: string;
    }> = [];

    // Add caching recommendations
    const slowEndpoints = bottlenecks.filter(b => b.avgResponseTime > 1000);
    if (slowEndpoints.length > 0) {
      recommendations.push({
        category: 'Caching',
        priority: 'HIGH',
        recommendation: `Implement Redis caching for ${slowEndpoints.length} slow endpoints`,
        estimatedImpact: '50-80% response time reduction',
      });
    }

    // Add database optimization recommendations
    const verySlowEndpoints = bottlenecks.filter(b => b.avgResponseTime > 2000);
    if (verySlowEndpoints.length > 0) {
      recommendations.push({
        category: 'Database',
        priority: 'HIGH',
        recommendation: 'Add database indexes and optimize slow queries',
        estimatedImpact: '60-85% query time reduction',
      });
    }

    // Add error handling recommendations
    const highErrorEndpoints = bottlenecks.filter(b => b.issue.includes('error rate'));
    if (highErrorEndpoints.length > 0) {
      recommendations.push({
        category: 'Error Handling',
        priority: 'HIGH',
        recommendation: 'Improve error handling and input validation',
        estimatedImpact: '60-80% error reduction',
      });
    }

    // Add load balancing recommendations
    const allPerformances = await this.getAllEndpointsPerformance();
    const highTrafficEndpoints = allPerformances.filter(p => p.throughput > 100);
    if (highTrafficEndpoints.length > 0) {
      recommendations.push({
        category: 'Scalability',
        priority: 'MEDIUM',
        recommendation: 'Consider load balancing for high-traffic endpoints',
        estimatedImpact: '40-60% improved throughput',
      });
    }

    return recommendations;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private getEndpointKey(endpoint: string, method: string): string {
    return `${endpoint}::${method}`;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
  }

  private percentile(sortedNumbers: number[], p: number): number {
    if (sortedNumbers.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.max(0, index)];
  }
}
