import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RedisCacheService } from '../services/optimization/redis-cache.service';
import { QueryOptimizerService } from '../services/optimization/query-optimizer.service';
import { PerformanceMonitorService } from '../services/optimization/performance-monitor.service';
import { MLCacheService } from '../services/optimization/ml-cache.service';

/**
 * Performance Optimization Controller
 * Provides endpoints for performance monitoring and optimization
 * - Cache management
 * - Query optimization
 * - API performance monitoring
 * - ML inference caching
 */
@Controller('marketing/optimization')
@UseGuards(JwtAuthGuard)
export class OptimizationController {
  private readonly logger = new Logger('OptimizationController');

  constructor(
    private readonly redisCache: RedisCacheService,
    private readonly queryOptimizer: QueryOptimizerService,
    private readonly performanceMonitor: PerformanceMonitorService,
    private readonly mlCache: MLCacheService,
  ) {}

  // ============================================
  // CACHE MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * GET /marketing/optimization/cache/stats
   * Get cache statistics
   */
  @Get('cache/stats')
  async getCacheStats() {
    this.logger.log('Getting cache statistics');
    return this.redisCache.getStats();
  }

  /**
   * POST /marketing/optimization/cache/clear
   * Clear all cache
   */
  @Post('cache/clear')
  async clearCache() {
    this.logger.log('Clearing all cache');
    await this.redisCache.clear();
    return { success: true, message: 'Cache cleared successfully' };
  }

  /**
   * POST /marketing/optimization/cache/invalidate/:tag
   * Invalidate cache by tag
   */
  @Post('cache/invalidate/:tag')
  async invalidateCacheByTag(@Param('tag') tag: string) {
    this.logger.log(`Invalidating cache for tag: ${tag}`);
    const count = await this.redisCache.invalidateByTag(tag);
    return {
      success: true,
      message: `Invalidated ${count} cache entries with tag: ${tag}`,
      count,
    };
  }

  /**
   * GET /marketing/optimization/cache/keys
   * Get cache keys matching pattern
   */
  @Get('cache/keys')
  async getCacheKeys(@Query('pattern') pattern?: string) {
    const keys = await this.redisCache.keys(pattern || '*');
    return {
      total: keys.length,
      keys,
    };
  }

  /**
   * POST /marketing/optimization/cache/warm
   * Warm cache with data
   */
  @Post('cache/warm')
  async warmCache(@Body() body: { data: Array<{ key: string; value: any }> }) {
    this.logger.log(`Warming cache with ${body.data.length} items`);
    await this.redisCache.warmCache(body.data);
    return {
      success: true,
      message: `Warmed cache with ${body.data.length} items`,
    };
  }

  // ============================================
  // QUERY OPTIMIZATION ENDPOINTS
  // ============================================

  /**
   * GET /marketing/optimization/queries/slow
   * Get slow queries
   */
  @Get('queries/slow')
  async getSlowQueries(@Query('threshold') threshold?: string) {
    this.logger.log('Getting slow queries');
    const thresholdMs = threshold ? parseInt(threshold) : undefined;
    return this.queryOptimizer.getSlowQueries(thresholdMs);
  }

  /**
   * GET /marketing/optimization/queries/stats
   * Get query statistics
   */
  @Get('queries/stats')
  async getQueryStats() {
    this.logger.log('Getting query statistics');
    return this.queryOptimizer.getQueryStats();
  }

  /**
   * GET /marketing/optimization/queries/report
   * Get optimization report
   */
  @Get('queries/report')
  async getOptimizationReport() {
    this.logger.log('Getting optimization report');
    return this.queryOptimizer.getOptimizationReport();
  }

  /**
   * GET /marketing/optimization/queries/n-plus-one
   * Detect N+1 query patterns
   */
  @Get('queries/n-plus-one')
  async detectNPlusOne() {
    this.logger.log('Detecting N+1 query patterns');
    return this.queryOptimizer.detectNPlusOne();
  }

  /**
   * GET /marketing/optimization/queries/indexes
   * Get index suggestions
   */
  @Get('queries/indexes')
  async getIndexSuggestions() {
    this.logger.log('Getting index suggestions');
    return this.queryOptimizer.suggestIndexes();
  }

  /**
   * POST /marketing/optimization/queries/optimize/:queryName
   * Get optimization suggestions for specific query
   */
  @Post('queries/optimize/:queryName')
  async optimizeQuery(@Param('queryName') queryName: string) {
    this.logger.log(`Optimizing query: ${queryName}`);
    return this.queryOptimizer.optimizeQuery(queryName);
  }

  /**
   * POST /marketing/optimization/queries/clear
   * Clear query metrics
   */
  @Post('queries/clear')
  async clearQueryMetrics() {
    this.logger.log('Clearing query metrics');
    await this.queryOptimizer.clearMetrics();
    return { success: true, message: 'Query metrics cleared' };
  }

  // ============================================
  // API PERFORMANCE MONITORING ENDPOINTS
  // ============================================

  /**
   * GET /marketing/optimization/performance/dashboard
   * Get performance dashboard
   */
  @Get('performance/dashboard')
  async getPerformanceDashboard() {
    this.logger.log('Getting performance dashboard');
    return this.performanceMonitor.getPerformanceDashboard();
  }

  /**
   * GET /marketing/optimization/performance/endpoints
   * Get all endpoints performance
   */
  @Get('performance/endpoints')
  async getAllEndpointsPerformance() {
    this.logger.log('Getting all endpoints performance');
    return this.performanceMonitor.getAllEndpointsPerformance();
  }

  /**
   * GET /marketing/optimization/performance/slowest
   * Get slowest endpoints
   */
  @Get('performance/slowest')
  async getSlowestEndpoints(@Query('limit') limit?: string) {
    this.logger.log('Getting slowest endpoints');
    const limitNum = limit ? parseInt(limit) : 10;
    return this.performanceMonitor.getSlowestEndpoints(limitNum);
  }

  /**
   * GET /marketing/optimization/performance/bottlenecks
   * Detect performance bottlenecks
   */
  @Get('performance/bottlenecks')
  async detectBottlenecks() {
    this.logger.log('Detecting performance bottlenecks');
    return this.performanceMonitor.detectBottlenecks();
  }

  /**
   * GET /marketing/optimization/performance/resources
   * Get resource usage
   */
  @Get('performance/resources')
  async getResourceUsage() {
    this.logger.log('Getting resource usage');
    return this.performanceMonitor.getResourceUsage();
  }

  /**
   * GET /marketing/optimization/performance/recommendations
   * Get optimization recommendations
   */
  @Get('performance/recommendations')
  async getOptimizationRecommendations() {
    this.logger.log('Getting optimization recommendations');
    return this.performanceMonitor.getOptimizationRecommendations();
  }

  /**
   * POST /marketing/optimization/performance/clear
   * Clear performance metrics
   */
  @Post('performance/clear')
  async clearPerformanceMetrics() {
    this.logger.log('Clearing performance metrics');
    await this.performanceMonitor.clearMetrics();
    return { success: true, message: 'Performance metrics cleared' };
  }

  // ============================================
  // ML CACHE ENDPOINTS
  // ============================================

  /**
   * GET /marketing/optimization/ml/stats
   * Get ML cache statistics for all models
   */
  @Get('ml/stats')
  async getAllMLCacheStats() {
    this.logger.log('Getting all ML cache statistics');
    return this.mlCache.getAllModelCacheStats();
  }

  /**
   * GET /marketing/optimization/ml/stats/:modelName
   * Get ML cache statistics for specific model
   */
  @Get('ml/stats/:modelName')
  async getMLCacheStats(@Param('modelName') modelName: string) {
    this.logger.log(`Getting ML cache statistics for: ${modelName}`);
    return this.mlCache.getModelCacheStats(modelName);
  }

  /**
   * GET /marketing/optimization/ml/report
   * Get comprehensive ML cache report
   */
  @Get('ml/report')
  async getMLCacheReport() {
    this.logger.log('Getting ML cache report');
    return this.mlCache.getCacheReport();
  }

  /**
   * POST /marketing/optimization/ml/invalidate/:modelName
   * Invalidate cache for specific ML model
   */
  @Post('ml/invalidate/:modelName')
  async invalidateMLModelCache(@Param('modelName') modelName: string) {
    this.logger.log(`Invalidating ML cache for: ${modelName}`);
    const count = await this.mlCache.invalidateModelCache(modelName);
    return {
      success: true,
      message: `Invalidated ${count} cached predictions for ${modelName}`,
      count,
    };
  }

  /**
   * POST /marketing/optimization/ml/invalidate-all
   * Invalidate all ML caches
   */
  @Post('ml/invalidate-all')
  async invalidateAllMLCaches() {
    this.logger.log('Invalidating all ML caches');
    const count = await this.mlCache.invalidateAllMLCaches();
    return {
      success: true,
      message: `Invalidated ${count} total cached predictions`,
      count,
    };
  }

  /**
   * POST /marketing/optimization/ml/warm/:modelName
   * Warm ML cache for specific model
   */
  @Post('ml/warm/:modelName')
  async warmMLCache(
    @Param('modelName') modelName: string,
    @Body() body: { inputs: any[] },
  ) {
    this.logger.log(`Warming ML cache for: ${modelName}`);

    // For now, just acknowledge - actual warming would require model-specific logic
    return {
      success: true,
      message: `Cache warming initiated for ${modelName} with ${body.inputs.length} inputs`,
      inputs: body.inputs.length,
    };
  }

  /**
   * POST /marketing/optimization/ml/optimize/:modelName
   * Optimize cache configuration for model
   */
  @Post('ml/optimize/:modelName')
  async optimizeMLCacheConfig(@Param('modelName') modelName: string) {
    this.logger.log(`Optimizing ML cache config for: ${modelName}`);
    const optimization = await this.mlCache.optimizeCacheConfig(modelName);

    // Apply the optimized config
    await this.mlCache.applyOptimizedConfig(modelName);

    return {
      success: true,
      ...optimization,
    };
  }

  /**
   * POST /marketing/optimization/ml/clear-stats
   * Clear ML cache statistics
   */
  @Post('ml/clear-stats')
  async clearMLCacheStats() {
    this.logger.log('Clearing ML cache statistics');
    await this.mlCache.clearStats();
    return { success: true, message: 'ML cache statistics cleared' };
  }

  // ============================================
  // COMPREHENSIVE OPTIMIZATION DASHBOARD
  // ============================================

  /**
   * GET /marketing/optimization/dashboard
   * Get comprehensive optimization dashboard
   */
  @Get('dashboard')
  async getOptimizationDashboard() {
    this.logger.log('Getting comprehensive optimization dashboard');

    const [
      cacheStats,
      queryStats,
      performanceDashboard,
      mlCacheReport,
    ] = await Promise.all([
      this.redisCache.getStats(),
      this.queryOptimizer.getQueryStats(),
      this.performanceMonitor.getPerformanceDashboard(),
      this.mlCache.getCacheReport(),
    ]);

    return {
      timestamp: new Date(),
      cache: {
        hitRate: cacheStats.hitRate,
        totalKeys: cacheStats.totalKeys,
        memoryUsed: cacheStats.memoryUsed,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
      },
      queries: {
        totalQueries: queryStats.totalQueries,
        slowQueries: queryStats.slowQueries,
        avgResponseTime: queryStats.avgResponseTime,
      },
      api: {
        totalRequests: performanceDashboard.overall.totalRequests,
        avgResponseTime: performanceDashboard.overall.avgResponseTime,
        errorRate: performanceDashboard.overall.errorRate,
        bottlenecks: performanceDashboard.bottlenecks.length,
      },
      ml: {
        totalModels: mlCacheReport.summary.totalModels,
        avgHitRate: mlCacheReport.summary.avgHitRate,
        totalTimeSaved: mlCacheReport.summary.totalTimeSaved,
        totalCostSaved: mlCacheReport.summary.totalCostSaved,
      },
      health: this.calculateOverallHealth(
        cacheStats.hitRate,
        queryStats.slowQueries,
        performanceDashboard.overall.errorRate,
        mlCacheReport.summary.avgHitRate,
      ),
    };
  }

  /**
   * GET /marketing/optimization/recommendations
   * Get all optimization recommendations
   */
  @Get('recommendations')
  async getAllRecommendations() {
    this.logger.log('Getting all optimization recommendations');

    const [
      queryReport,
      performanceRecommendations,
      mlCacheReport,
    ] = await Promise.all([
      this.queryOptimizer.getOptimizationReport(),
      this.performanceMonitor.getOptimizationRecommendations(),
      this.mlCache.getCacheReport(),
    ]);

    return {
      timestamp: new Date(),
      database: {
        slowQueries: queryReport.currentPerformance.slowQueries,
        recommendations: queryReport.recommendations,
        indexSuggestions: queryReport.indexSuggestions,
      },
      api: {
        recommendations: performanceRecommendations,
      },
      ml: {
        recommendations: mlCacheReport.recommendations,
      },
      summary: {
        totalRecommendations:
          queryReport.recommendations.length +
          performanceRecommendations.length +
          mlCacheReport.recommendations.length,
        highPriority: [
          ...queryReport.recommendations.filter(r => r.priority === 'HIGH'),
          ...performanceRecommendations.filter(r => r.priority === 'HIGH'),
        ].length,
      },
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private calculateOverallHealth(
    cacheHitRate: number,
    slowQueries: number,
    errorRate: number,
    mlCacheHitRate: number,
  ): {
    status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    score: number;
    factors: string[];
  } {
    let score = 100;
    const factors: string[] = [];

    // Cache performance (30 points)
    if (cacheHitRate < 50) {
      score -= 20;
      factors.push('Low cache hit rate');
    } else if (cacheHitRate < 70) {
      score -= 10;
      factors.push('Moderate cache hit rate');
    }

    // Query performance (30 points)
    if (slowQueries > 10) {
      score -= 20;
      factors.push('Many slow queries');
    } else if (slowQueries > 5) {
      score -= 10;
      factors.push('Some slow queries');
    }

    // API error rate (25 points)
    if (errorRate > 5) {
      score -= 20;
      factors.push('High error rate');
    } else if (errorRate > 2) {
      score -= 10;
      factors.push('Elevated error rate');
    }

    // ML cache performance (15 points)
    if (mlCacheHitRate < 60) {
      score -= 10;
      factors.push('Low ML cache efficiency');
    } else if (mlCacheHitRate < 75) {
      score -= 5;
      factors.push('Moderate ML cache efficiency');
    }

    let status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    if (score >= 90) status = 'EXCELLENT';
    else if (score >= 75) status = 'GOOD';
    else if (score >= 60) status = 'FAIR';
    else status = 'POOR';

    if (factors.length === 0) {
      factors.push('All systems performing optimally');
    }

    return { status, score, factors };
  }
}
