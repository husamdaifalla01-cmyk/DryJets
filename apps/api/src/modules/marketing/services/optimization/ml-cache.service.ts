import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

/**
 * ML Inference Caching Service
 * Caches ML model predictions to avoid redundant computations
 * Provides intelligent cache invalidation and warming strategies
 */

export interface MLCacheConfig {
  modelName: string;
  ttl: number; // Cache duration in seconds
  maxCacheSize: number; // Max predictions to cache
  warmingStrategy: 'EAGER' | 'LAZY' | 'PREDICTIVE';
}

export interface MLPredictionCache {
  modelName: string;
  inputHash: string;
  prediction: any;
  confidence: number;
  cachedAt: Date;
  expiresAt: Date;
  hitCount: number;
}

export interface MLCacheStats {
  modelName: string;
  totalPredictions: number;
  cachedPredictions: number;
  cacheHitRate: number;
  avgComputeTime: number; // Without cache
  avgCachedTime: number; // With cache
  timeSaved: number; // Total time saved (ms)
  computeCostSaved: number; // Estimated $ saved
}

@Injectable()
export class MLCacheService {
  private readonly logger = new Logger('MLCache');
  private modelConfigs: Map<string, MLCacheConfig> = new Map();
  private computeStats: Map<string, { computeTime: number; count: number }> = new Map();

  constructor(private readonly redisCache: RedisCacheService) {
    this.initializeModelConfigs();
  }

  /**
   * Initialize default cache configurations for all ML models
   */
  private initializeModelConfigs(): void {
    const defaultConfigs: MLCacheConfig[] = [
      {
        modelName: 'TrendForecaster',
        ttl: 3600, // 1 hour
        maxCacheSize: 10000,
        warmingStrategy: 'PREDICTIVE',
      },
      {
        modelName: 'ContentPredictor',
        ttl: 1800, // 30 minutes
        maxCacheSize: 5000,
        warmingStrategy: 'LAZY',
      },
      {
        modelName: 'SmartABTesting',
        ttl: 300, // 5 minutes (dynamic data)
        maxCacheSize: 2000,
        warmingStrategy: 'LAZY',
      },
      {
        modelName: 'KeywordClustering',
        ttl: 7200, // 2 hours
        maxCacheSize: 8000,
        warmingStrategy: 'EAGER',
      },
      {
        modelName: 'CampaignPredictor',
        ttl: 1800, // 30 minutes
        maxCacheSize: 5000,
        warmingStrategy: 'PREDICTIVE',
      },
    ];

    for (const config of defaultConfigs) {
      this.modelConfigs.set(config.modelName, config);
    }

    this.logger.log(`Initialized cache configs for ${defaultConfigs.length} ML models`);
  }

  /**
   * Get or compute ML prediction with caching
   */
  async getCachedPrediction<T>(
    modelName: string,
    input: any,
    computeFn: () => Promise<T>,
  ): Promise<{ prediction: T; cached: boolean; computeTime: number }> {
    const startTime = Date.now();
    const inputHash = this.hashInput(input);
    const cacheKey = this.buildCacheKey(modelName, inputHash);

    // Try to get from cache
    const cached = await this.redisCache.get<T>(cacheKey);

    if (cached !== null) {
      const computeTime = Date.now() - startTime;
      this.logger.debug(`ML Cache HIT: ${modelName} (${computeTime}ms)`);

      return {
        prediction: cached,
        cached: true,
        computeTime,
      };
    }

    // Cache miss - compute prediction
    this.logger.debug(`ML Cache MISS: ${modelName} - computing...`);
    const prediction = await computeFn();
    const computeTime = Date.now() - startTime;

    // Store compute stats
    this.recordComputeTime(modelName, computeTime);

    // Cache the result
    const config = this.modelConfigs.get(modelName);
    await this.redisCache.set(
      cacheKey,
      prediction,
      {
        ttl: config?.ttl || 1800,
        tags: ['ml', modelName],
      },
    );

    return {
      prediction,
      cached: false,
      computeTime,
    };
  }

  /**
   * Batch cache predictions
   */
  async batchCachePredictions(
    modelName: string,
    predictions: Array<{ input: any; output: any }>,
  ): Promise<number> {
    this.logger.log(`Batch caching ${predictions.length} predictions for ${modelName}`);

    const config = this.modelConfigs.get(modelName);
    const items = predictions.map(p => ({
      key: this.buildCacheKey(modelName, this.hashInput(p.input)),
      value: p.output,
      options: {
        ttl: config?.ttl || 1800,
        tags: ['ml', modelName],
      },
    }));

    await this.redisCache.mset(items);

    return predictions.length;
  }

  /**
   * Warm cache with frequently used predictions
   */
  async warmCache(
    modelName: string,
    inputs: any[],
    computeFn: (input: any) => Promise<any>,
  ): Promise<{ warmed: number; skipped: number }> {
    this.logger.log(`Warming cache for ${modelName} with ${inputs.length} predictions`);

    let warmed = 0;
    let skipped = 0;

    for (const input of inputs) {
      const inputHash = this.hashInput(input);
      const cacheKey = this.buildCacheKey(modelName, inputHash);

      // Skip if already cached
      const exists = await this.redisCache.exists(cacheKey);
      if (exists) {
        skipped++;
        continue;
      }

      // Compute and cache
      try {
        const prediction = await computeFn(input);
        const config = this.modelConfigs.get(modelName);

        await this.redisCache.set(
          cacheKey,
          prediction,
          {
            ttl: config?.ttl || 1800,
            tags: ['ml', modelName],
          },
        );

        warmed++;
      } catch (error) {
        this.logger.error(`Failed to warm cache for ${modelName}: ${error}`);
      }
    }

    this.logger.log(`Cache warming complete: ${warmed} warmed, ${skipped} skipped`);

    return { warmed, skipped };
  }

  /**
   * Invalidate cache for specific model
   */
  async invalidateModelCache(modelName: string): Promise<number> {
    this.logger.log(`Invalidating cache for model: ${modelName}`);
    return this.redisCache.invalidateByTag(modelName);
  }

  /**
   * Invalidate all ML caches
   */
  async invalidateAllMLCaches(): Promise<number> {
    this.logger.log('Invalidating all ML caches');
    return this.redisCache.invalidateByTag('ml');
  }

  /**
   * Get cache statistics for model
   */
  async getModelCacheStats(modelName: string): Promise<MLCacheStats> {
    const redisStats = await this.redisCache.getStats();
    const computeStat = this.computeStats.get(modelName);

    // Get cached predictions count
    const cacheKeys = await this.redisCache.keys(`ml:${modelName}:*`);
    const cachedPredictions = cacheKeys.length;

    // Calculate stats
    const avgComputeTime = computeStat
      ? computeStat.computeTime / computeStat.count
      : 0;
    const avgCachedTime = 5; // Typical cache lookup time
    const timeSavedPerHit = Math.max(0, avgComputeTime - avgCachedTime);

    const totalPredictions = computeStat?.count || 0;
    const cacheHits = Math.floor(
      totalPredictions * (redisStats.hitRate / 100),
    );
    const timeSaved = cacheHits * timeSavedPerHit;

    // Estimate compute cost ($0.001 per prediction @ 100ms)
    const costPerPrediction = (avgComputeTime / 100) * 0.001;
    const computeCostSaved = cacheHits * costPerPrediction;

    return {
      modelName,
      totalPredictions,
      cachedPredictions,
      cacheHitRate: redisStats.hitRate,
      avgComputeTime: Math.round(avgComputeTime),
      avgCachedTime,
      timeSaved: Math.round(timeSaved),
      computeCostSaved: Math.round(computeCostSaved * 100) / 100,
    };
  }

  /**
   * Get cache stats for all models
   */
  async getAllModelCacheStats(): Promise<MLCacheStats[]> {
    const modelNames = Array.from(this.modelConfigs.keys());
    const stats = await Promise.all(
      modelNames.map(name => this.getModelCacheStats(name)),
    );
    return stats;
  }

  /**
   * Optimize cache configuration based on usage
   */
  async optimizeCacheConfig(modelName: string): Promise<{
    currentConfig: MLCacheConfig;
    recommendedConfig: MLCacheConfig;
    reasoning: string[];
  }> {
    const stats = await this.getModelCacheStats(modelName);
    const currentConfig = this.modelConfigs.get(modelName);

    if (!currentConfig) {
      throw new Error(`No config found for model: ${modelName}`);
    }

    const recommendedConfig = { ...currentConfig };
    const reasoning: string[] = [];

    // Adjust TTL based on hit rate
    if (stats.cacheHitRate > 80) {
      // High hit rate - can increase TTL
      recommendedConfig.ttl = Math.min(currentConfig.ttl * 1.5, 7200);
      reasoning.push(
        `High cache hit rate (${stats.cacheHitRate}%) - increased TTL to ${recommendedConfig.ttl}s`,
      );
    } else if (stats.cacheHitRate < 30) {
      // Low hit rate - decrease TTL to save memory
      recommendedConfig.ttl = Math.max(currentConfig.ttl * 0.7, 300);
      reasoning.push(
        `Low cache hit rate (${stats.cacheHitRate}%) - decreased TTL to ${recommendedConfig.ttl}s`,
      );
    }

    // Adjust cache size based on usage
    if (stats.cachedPredictions > currentConfig.maxCacheSize * 0.9) {
      // Near capacity - increase size
      recommendedConfig.maxCacheSize = Math.floor(
        currentConfig.maxCacheSize * 1.3,
      );
      reasoning.push(
        `Cache near capacity (${stats.cachedPredictions}/${currentConfig.maxCacheSize}) - increased to ${recommendedConfig.maxCacheSize}`,
      );
    }

    // Adjust warming strategy based on compute time
    if (stats.avgComputeTime > 1000 && currentConfig.warmingStrategy === 'LAZY') {
      recommendedConfig.warmingStrategy = 'PREDICTIVE';
      reasoning.push(
        `High compute time (${stats.avgComputeTime}ms) - switched to PREDICTIVE warming`,
      );
    }

    if (reasoning.length === 0) {
      reasoning.push('Current configuration is optimal');
    }

    return {
      currentConfig,
      recommendedConfig,
      reasoning,
    };
  }

  /**
   * Apply optimized configuration
   */
  async applyOptimizedConfig(modelName: string): Promise<void> {
    const optimization = await this.optimizeCacheConfig(modelName);

    this.modelConfigs.set(modelName, optimization.recommendedConfig);

    this.logger.log(
      `Applied optimized config for ${modelName}: ${optimization.reasoning.join(', ')}`,
    );
  }

  /**
   * Clear cache stats
   */
  async clearStats(): Promise<void> {
    this.computeStats.clear();
    await this.redisCache.resetStats();
    this.logger.log('Cleared ML cache statistics');
  }

  /**
   * Get comprehensive cache report
   */
  async getCacheReport(): Promise<{
    summary: {
      totalModels: number;
      totalCachedPredictions: number;
      avgHitRate: number;
      totalTimeSaved: number;
      totalCostSaved: number;
    };
    modelStats: MLCacheStats[];
    recommendations: string[];
  }> {
    const allStats = await this.getAllModelCacheStats();

    const totalModels = allStats.length;
    const totalCachedPredictions = allStats.reduce(
      (sum, s) => sum + s.cachedPredictions,
      0,
    );
    const avgHitRate =
      allStats.reduce((sum, s) => sum + s.cacheHitRate, 0) / totalModels;
    const totalTimeSaved = allStats.reduce((sum, s) => sum + s.timeSaved, 0);
    const totalCostSaved = allStats.reduce(
      (sum, s) => sum + s.computeCostSaved,
      0,
    );

    // Generate recommendations
    const recommendations: string[] = [];

    const lowHitRateModels = allStats.filter(s => s.cacheHitRate < 40);
    if (lowHitRateModels.length > 0) {
      recommendations.push(
        `${lowHitRateModels.length} models have low cache hit rates - consider cache warming`,
      );
    }

    const slowModels = allStats.filter(s => s.avgComputeTime > 500);
    if (slowModels.length > 0) {
      recommendations.push(
        `${slowModels.length} models have high compute times - prioritize caching`,
      );
    }

    if (totalCostSaved > 10) {
      recommendations.push(
        `Cache is saving $${totalCostSaved.toFixed(2)}/day in compute costs`,
      );
    }

    return {
      summary: {
        totalModels,
        totalCachedPredictions,
        avgHitRate: Math.round(avgHitRate * 100) / 100,
        totalTimeSaved: Math.round(totalTimeSaved),
        totalCostSaved: Math.round(totalCostSaved * 100) / 100,
      },
      modelStats: allStats,
      recommendations,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private buildCacheKey(modelName: string, inputHash: string): string {
    return `ml:${modelName}:${inputHash}`;
  }

  private hashInput(input: any): string {
    // Simple hash function - in production use crypto
    const str = JSON.stringify(input);
    return Buffer.from(str).toString('base64').slice(0, 32);
  }

  private recordComputeTime(modelName: string, timeMs: number): void {
    const stat = this.computeStats.get(modelName) || {
      computeTime: 0,
      count: 0,
    };

    stat.computeTime += timeMs;
    stat.count += 1;

    this.computeStats.set(modelName, stat);
  }
}
