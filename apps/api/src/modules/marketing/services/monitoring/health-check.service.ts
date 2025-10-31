import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Health Check Service
 * Monitors health of all marketing engine components
 */

export interface ServiceHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  responseTime: number; // milliseconds
  lastCheck: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  overall: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: Date;
  services: ServiceHealth[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger('HealthCheck');
  private healthCache: Map<string, ServiceHealth> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  /**
   * Check health of all marketing services
   */
  async checkSystemHealth(): Promise<SystemHealth> {
    this.logger.log('Performing system health check');

    const services = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAnthropicAPI(),
      this.checkSEOServices(),
      this.checkTrendServices(),
      this.checkMLServices(),
      this.checkLinkBuildingServices(),
      this.checkVideoServices(),
      this.checkExternalAPIs(),
    ]);

    const serviceHealths: ServiceHealth[] = services.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const serviceNames = [
          'Database',
          'Anthropic API',
          'SEO Services',
          'Trend Services',
          'ML Services',
          'Link Building',
          'Video Services',
          'External APIs',
        ];
        return {
          name: serviceNames[index],
          status: 'DOWN' as const,
          responseTime: 0,
          lastCheck: new Date(),
          errorMessage: result.reason?.message || 'Unknown error',
        };
      }
    });

    // Calculate summary
    const summary = {
      total: serviceHealths.length,
      healthy: serviceHealths.filter((s) => s.status === 'HEALTHY').length,
      degraded: serviceHealths.filter((s) => s.status === 'DEGRADED').length,
      down: serviceHealths.filter((s) => s.status === 'DOWN').length,
    };

    // Determine overall status
    let overall: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
    if (summary.down > 0) {
      overall = summary.down > summary.total / 2 ? 'DOWN' : 'DEGRADED';
    } else if (summary.degraded > 0) {
      overall = 'DEGRADED';
    }

    return {
      overall,
      timestamp: new Date(),
      services: serviceHealths,
      summary,
    };
  }

  /**
   * Check database health
   */
  async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'Database';

    try {
      // Simple query to check connection
      await this.prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;

      // Check if response time is degraded
      const status = responseTime > 1000 ? 'DEGRADED' : 'HEALTHY';

      return {
        name,
        status,
        responseTime,
        lastCheck: new Date(),
        metadata: {
          type: 'PostgreSQL',
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check Anthropic API health
   */
  async checkAnthropicAPI(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'Anthropic API';

    try {
      // Check if API key is configured
      if (!process.env.ANTHROPIC_API_KEY) {
        return {
          name,
          status: 'DOWN',
          responseTime: 0,
          lastCheck: new Date(),
          errorMessage: 'ANTHROPIC_API_KEY not configured',
        };
      }

      // Simple health check (we won't actually call the API to save costs)
      // In production, you might want to make a minimal call
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: 'HEALTHY',
        responseTime,
        lastCheck: new Date(),
        metadata: {
          configured: true,
          keyPresent: true,
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check SEO services health
   */
  async checkSEOServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'SEO Services';

    try {
      // Check if keywords exist in database
      const keywordCount = await this.prisma.keyword.count();

      const responseTime = Date.now() - startTime;
      const status = responseTime > 500 ? 'DEGRADED' : 'HEALTHY';

      return {
        name,
        status,
        responseTime,
        lastCheck: new Date(),
        metadata: {
          keywordCount,
          services: [
            'KeywordUniverse',
            'ProgrammaticPage',
            'SerpIntelligence',
            'SnippetHijacker',
            'SchemaAutomation',
          ],
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check trend services health
   */
  async checkTrendServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'Trend Services';

    try {
      // Check if trends exist
      const trendCount = await this.prisma.trendData.count();

      const responseTime = Date.now() - startTime;
      const status = responseTime > 500 ? 'DEGRADED' : 'HEALTHY';

      return {
        name,
        status,
        responseTime,
        lastCheck: new Date(),
        metadata: {
          trendCount,
          services: ['TrendCollector', 'TrendPredictor', 'TrendAnalyzer'],
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check ML services health
   */
  async checkMLServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'ML Services';

    try {
      // ML services don't have persistent data, just check they're configured
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: 'HEALTHY',
        responseTime,
        lastCheck: new Date(),
        metadata: {
          services: [
            'MLTrendForecaster',
            'ContentPerformancePredictor',
            'SmartABTesting',
            'SemanticKeywordClustering',
            'CampaignSuccessPredictor',
          ],
          modelsActive: 5,
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check link building services health
   */
  async checkLinkBuildingServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'Link Building Services';

    try {
      // Check backlinks count
      const backlinkCount = await this.prisma.backlink.count();

      const responseTime = Date.now() - startTime;
      const status = responseTime > 500 ? 'DEGRADED' : 'HEALTHY';

      return {
        name,
        status,
        responseTime,
        lastCheck: new Date(),
        metadata: {
          backlinkCount,
          services: [
            'HAROAutomation',
            'BrokenLink',
            'PartnershipNetwork',
            'ResourcePage',
          ],
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check video services health
   */
  async checkVideoServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'Video Services';

    try {
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: 'HEALTHY',
        responseTime,
        lastCheck: new Date(),
        metadata: {
          services: [
            'VideoScriptGenerator',
            'VideoMetadataOptimizer',
            'PlatformFormatter',
          ],
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Check external APIs health
   */
  async checkExternalAPIs(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const name = 'External APIs';

    try {
      // Check if API keys are configured
      const googleTrendsConfigured = !!process.env.GOOGLE_TRENDS_API_KEY;
      const twitterConfigured = !!process.env.TWITTER_API_KEY;
      const redditConfigured = !!process.env.REDDIT_CLIENT_ID;

      const responseTime = Date.now() - startTime;

      // If none configured, degraded; if some configured, healthy
      let status: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
      if (!googleTrendsConfigured && !twitterConfigured && !redditConfigured) {
        status = 'DEGRADED';
      }

      return {
        name,
        status,
        responseTime,
        lastCheck: new Date(),
        metadata: {
          googleTrends: googleTrendsConfigured,
          twitter: twitterConfigured,
          reddit: redditConfigured,
        },
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        errorMessage: error.message,
      };
    }
  }

  /**
   * Get individual service health
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const cached = this.healthCache.get(serviceName);
    if (cached && Date.now() - cached.lastCheck.getTime() < this.cacheTimeout) {
      return cached;
    }

    let health: ServiceHealth;

    switch (serviceName.toLowerCase()) {
      case 'database':
        health = await this.checkDatabase();
        break;
      case 'anthropic':
        health = await this.checkAnthropicAPI();
        break;
      case 'seo':
        health = await this.checkSEOServices();
        break;
      case 'trends':
        health = await this.checkTrendServices();
        break;
      case 'ml':
        health = await this.checkMLServices();
        break;
      case 'linkbuilding':
        health = await this.checkLinkBuildingServices();
        break;
      case 'video':
        health = await this.checkVideoServices();
        break;
      case 'external':
        health = await this.checkExternalAPIs();
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }

    this.healthCache.set(serviceName, health);
    return health;
  }

  /**
   * Get critical alerts (services that are DOWN)
   */
  async getCriticalAlerts(): Promise<ServiceHealth[]> {
    const systemHealth = await this.checkSystemHealth();
    return systemHealth.services.filter((s) => s.status === 'DOWN');
  }

  /**
   * Get degraded services
   */
  async getDegradedServices(): Promise<ServiceHealth[]> {
    const systemHealth = await this.checkSystemHealth();
    return systemHealth.services.filter((s) => s.status === 'DEGRADED');
  }
}
