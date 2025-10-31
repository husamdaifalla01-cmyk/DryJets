import { Injectable, Logger } from '@nestjs/common';

/**
 * Redis Cache Service
 * High-performance caching layer for marketing services
 * Reduces database load and improves API response times
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300 = 5 minutes)
  tags?: string[]; // Cache tags for bulk invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsed: number;
  avgResponseTime: number;
}

export interface CachedItem<T> {
  key: string;
  value: T;
  expiresAt: Date;
  tags: string[];
  hitCount: number;
}

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger('RedisCache');
  private cache: Map<string, any> = new Map();
  private expiryMap: Map<string, number> = new Map();
  private tagMap: Map<string, Set<string>> = new Map();
  private stats = { hits: 0, misses: 0 };

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);

    // Check if expired
    if (this.isExpired(fullKey)) {
      await this.delete(fullKey);
      this.stats.misses++;
      return null;
    }

    const value = this.cache.get(fullKey);

    if (value !== undefined) {
      this.stats.hits++;
      this.logger.debug(`Cache HIT: ${key}`);
      return value;
    }

    this.stats.misses++;
    this.logger.debug(`Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const fullKey = this.buildKey(key);
    const ttl = options.ttl || 300; // Default 5 minutes

    this.cache.set(fullKey, value);
    this.expiryMap.set(fullKey, Date.now() + ttl * 1000);

    // Store tags
    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        if (!this.tagMap.has(tag)) {
          this.tagMap.set(tag, new Set());
        }
        this.tagMap.get(tag)!.add(fullKey);
      }
    }

    this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    this.cache.delete(fullKey);
    this.expiryMap.delete(fullKey);

    // Remove from tag map
    for (const [tag, keys] of this.tagMap.entries()) {
      keys.delete(fullKey);
      if (keys.size === 0) {
        this.tagMap.delete(tag);
      }
    }

    this.logger.debug(`Cache DELETE: ${key}`);
  }

  /**
   * Invalidate all keys with specific tag
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagMap.get(tag);

    if (!keys || keys.size === 0) {
      return 0;
    }

    let count = 0;
    for (const key of keys) {
      this.cache.delete(key);
      this.expiryMap.delete(key);
      count++;
    }

    this.tagMap.delete(tag);
    this.logger.log(`Cache INVALIDATE TAG: ${tag} (${count} keys)`);

    return count;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    const keyCount = this.cache.size;
    this.cache.clear();
    this.expiryMap.clear();
    this.tagMap.clear();
    this.logger.log(`Cache CLEAR: ${keyCount} keys removed`);
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch from source
    const value = await factory();
    await this.set(key, value, options);

    return value;
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    // Clean up expired keys
    await this.cleanupExpired();

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalKeys: this.cache.size,
      memoryUsed: this.estimateMemoryUsage(),
      avgResponseTime: 0, // Would track in production
    };
  }

  /**
   * Reset statistics
   */
  async resetStats(): Promise<void> {
    this.stats = { hits: 0, misses: 0 };
    this.logger.log('Cache stats reset');
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(data: Array<{ key: string; value: any; options?: CacheOptions }>): Promise<void> {
    this.logger.log(`Warming cache with ${data.length} items`);

    for (const item of data) {
      await this.set(item.key, item.value, item.options);
    }

    this.logger.log(`Cache warmed successfully`);
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const matchingKeys: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        matchingKeys.push(key.replace('marketing:', ''));
      }
    }

    return matchingKeys;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);

    if (this.isExpired(fullKey)) {
      await this.delete(fullKey);
      return false;
    }

    return this.cache.has(fullKey);
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    const fullKey = this.buildKey(key);
    const expiry = this.expiryMap.get(fullKey);

    if (!expiry) {
      return -1; // Key doesn't exist
    }

    const ttl = Math.floor((expiry - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2; // -2 means expired
  }

  /**
   * Extend TTL for existing key
   */
  async extend(key: string, additionalSeconds: number): Promise<boolean> {
    const fullKey = this.buildKey(key);
    const expiry = this.expiryMap.get(fullKey);

    if (!expiry || this.isExpired(fullKey)) {
      return false;
    }

    this.expiryMap.set(fullKey, expiry + additionalSeconds * 1000);
    this.logger.debug(`Extended TTL for ${key} by ${additionalSeconds}s`);

    return true;
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<Array<T | null>> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  /**
   * Set multiple keys at once
   */
  async mset(items: Array<{ key: string; value: any; options?: CacheOptions }>): Promise<void> {
    await Promise.all(items.map(item => this.set(item.key, item.value, item.options)));
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private buildKey(key: string): string {
    return `marketing:${key}`;
  }

  private isExpired(fullKey: string): boolean {
    const expiry = this.expiryMap.get(fullKey);
    if (!expiry) return false;
    return Date.now() > expiry;
  }

  private async cleanupExpired(): Promise<void> {
    const expiredKeys: string[] = [];

    for (const [key, expiry] of this.expiryMap.entries()) {
      if (Date.now() > expiry) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.expiryMap.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.logger.debug(`Cleaned up ${expiredKeys.length} expired keys`);
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimate: each key-value pair is ~1KB
    return this.cache.size * 1024;
  }

  // ============================================
  // SPECIALIZED CACHE METHODS FOR MARKETING
  // ============================================

  /**
   * Cache ML prediction results
   */
  async cacheMLPrediction(
    modelName: string,
    inputHash: string,
    prediction: any,
  ): Promise<void> {
    await this.set(
      `ml:${modelName}:${inputHash}`,
      prediction,
      { ttl: 3600, tags: ['ml', modelName] }, // 1 hour cache
    );
  }

  /**
   * Get cached ML prediction
   */
  async getCachedMLPrediction(
    modelName: string,
    inputHash: string,
  ): Promise<any | null> {
    return this.get(`ml:${modelName}:${inputHash}`);
  }

  /**
   * Cache database query result
   */
  async cacheQuery(
    queryName: string,
    params: any,
    result: any,
    ttl: number = 300,
  ): Promise<void> {
    const paramHash = this.hashObject(params);
    await this.set(
      `query:${queryName}:${paramHash}`,
      result,
      { ttl, tags: ['query', queryName] },
    );
  }

  /**
   * Get cached query result
   */
  async getCachedQuery(queryName: string, params: any): Promise<any | null> {
    const paramHash = this.hashObject(params);
    return this.get(`query:${queryName}:${paramHash}`);
  }

  /**
   * Cache API response
   */
  async cacheAPIResponse(
    endpoint: string,
    params: any,
    response: any,
    ttl: number = 600,
  ): Promise<void> {
    const paramHash = this.hashObject(params);
    await this.set(
      `api:${endpoint}:${paramHash}`,
      response,
      { ttl, tags: ['api', endpoint] },
    );
  }

  /**
   * Get cached API response
   */
  async getCachedAPIResponse(endpoint: string, params: any): Promise<any | null> {
    const paramHash = this.hashObject(params);
    return this.get(`api:${endpoint}:${paramHash}`);
  }

  /**
   * Invalidate all ML caches
   */
  async invalidateMLCache(): Promise<number> {
    return this.invalidateByTag('ml');
  }

  /**
   * Invalidate all query caches
   */
  async invalidateQueryCache(): Promise<number> {
    return this.invalidateByTag('query');
  }

  /**
   * Invalidate all API caches
   */
  async invalidateAPICache(): Promise<number> {
    return this.invalidateByTag('api');
  }

  /**
   * Simple object hashing for cache keys
   */
  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 32);
  }
}
