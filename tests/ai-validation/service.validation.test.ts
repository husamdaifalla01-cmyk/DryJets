/**
 * SERVICE VALIDATION TESTS
 *
 * Tests to validate service references and external API integrations
 * against TRUTH_MAP.yaml
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { getTruthMapLoader } from './helpers/truth-loader';
import { validateService, validateExternalAPI } from './helpers/validators';

describe('Service Validation Tests', () => {
  let loader: ReturnType<typeof getTruthMapLoader>;

  beforeAll(() => {
    loader = getTruthMapLoader();
    loader.load();
  });

  describe('Trend Services', () => {
    test('should validate trend intelligence services', () => {
      const validServices = [
        'TrendCollectorService',
        'TrendAnalyzerService',
        'TrendPredictorService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject non-existent trend services', () => {
      const invalidServices = [
        'TrendFetcherService',
        'TrendScraperService',
        'TrendMonitorService',
      ];

      invalidServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('SEO Services', () => {
    test('should validate SEO services', () => {
      const validServices = [
        'KeywordResearchService',
        'RankTrackerService',
        'BacklinkAnalyzerService',
        'ProgrammaticSEOService',
        'SnippetOptimizerService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('ML Services', () => {
    test('should validate ML services', () => {
      const validServices = [
        'TrendForecastingService',
        'ContentPerformanceMLService',
        'ABTestingMLService',
        'KeywordClusteringService',
        'CampaignPredictionService',
        'PerformancePredictorService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Video Services', () => {
    test('should validate video services', () => {
      const validServices = [
        'VideoScriptService',
        'VideoMetadataService',
        'VideoHashtagService',
        'VideoFormattingService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Publishing Services', () => {
    test('should validate platform publisher services', () => {
      const validServices = [
        'LinkedInPublisherService',
        'YouTubePublisherService',
        'TikTokPublisherService',
        'TwitterPublisherService',
        'FacebookPublisherService',
        'InstagramPublisherService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Orchestration Services', () => {
    test('should validate orchestration service', () => {
      const result = validateService('MultiPlatformWorkflowOrchestratorService');
      expect(result.valid).toBe(true);
    });
  });

  describe('Intelligence Services', () => {
    test('should validate intelligence services', () => {
      const validServices = [
        'NeuralNarrativeService',
        'QuantumForecastingService',
        'MultiTouchAttributionService',
        'CreativeIntelligenceService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Offer Lab Services', () => {
    test('should validate Offer Lab services', () => {
      const validServices = [
        'OfferIntelligenceService',
        'FunnelGeneratorService',
        'TrafficDeploymentService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('External API Services', () => {
    test('should validate external API services', () => {
      const validServices = [
        'GoogleTrendsAPIService',
        'TwitterAPIService',
        'RedditAPIService',
        'TikTokAPIService',
        'YouTubeAPIService',
        'ClaudeAPIService',
      ];

      validServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('External API Integration Validation', () => {
    test('should validate implemented trend sources', () => {
      const implementedAPIs = [
        { category: 'trend_sources', name: 'google_trends' },
        { category: 'trend_sources', name: 'twitter' },
        { category: 'trend_sources', name: 'reddit' },
        { category: 'trend_sources', name: 'youtube' },
      ];

      implementedAPIs.forEach(({ category, name }) => {
        const result = validateExternalAPI(category, name);
        expect(result.valid).toBe(true);
        expect(loader.isExternalAPIImplemented(category, name)).toBe(true);
      });
    });

    test('should warn about partial or planned APIs', () => {
      const partialAPIs = [
        { category: 'trend_sources', name: 'tiktok', expectedStatus: 'partial' },
      ];

      partialAPIs.forEach(({ category, name, expectedStatus }) => {
        const api = loader.getExternalAPI(category, name);
        expect(api).toBeDefined();
        expect(api?.status).toBe(expectedStatus);
      });
    });

    test('should validate AI provider integrations', () => {
      const aiProviders = [
        { category: 'ai_providers', name: 'claude' },
      ];

      aiProviders.forEach(({ category, name }) => {
        const result = validateExternalAPI(category, name);
        expect(result.valid).toBe(true);

        const api = loader.getExternalAPI(category, name);
        expect(api?.status).toBe('implemented');
      });
    });

    test('should warn about planned AI providers', () => {
      const plannedAPIs = [
        { category: 'ai_providers', name: 'openai' },
      ];

      plannedAPIs.forEach(({ category, name }) => {
        const result = validateExternalAPI(category, name);
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });

    test('should identify unimplemented video generation APIs', () => {
      const unimplementedAPIs = [
        { category: 'video_generation', name: 'runway' },
        { category: 'video_generation', name: 'pika' },
      ];

      unimplementedAPIs.forEach(({ category, name }) => {
        const api = loader.getExternalAPI(category, name);
        expect(api?.status).toBe('not_implemented');
      });
    });

    test('should reject references to non-existent external APIs', () => {
      const fakeAPIs = [
        { category: 'trend_sources', name: 'fake_api' },
        { category: 'ai_providers', name: 'non_existent_ai' },
        { category: 'seo_tools', name: 'invented_tool' },
      ];

      fakeAPIs.forEach(({ category, name }) => {
        const result = validateExternalAPI(category, name);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Service Categories', () => {
    test('should have all service categories', () => {
      const expectedCategories = [
        'trends',
        'seo',
        'ml',
        'video',
        'publishing',
        'orchestration',
        'intelligence',
        'optimization',
        'monitoring',
        'offer_lab',
        'external_apis',
      ];

      const truthMap = loader.load();
      const categories = Object.keys(truthMap.services);

      expectedCategories.forEach((category) => {
        expect(categories).toContain(category);
      });
    });

    test('should get services by category', () => {
      const categories = [
        { name: 'trends', expectedCount: 3 },
        { name: 'seo', expectedCount: 5 },
        { name: 'ml', minCount: 5 },
        { name: 'publishing', minCount: 6 },
      ];

      categories.forEach(({ name, expectedCount, minCount }) => {
        const services = loader.getServices(name);
        if (expectedCount) {
          expect(services.length).toBe(expectedCount);
        }
        if (minCount) {
          expect(services.length).toBeGreaterThanOrEqual(minCount);
        }
      });
    });
  });

  describe('Real-world Hallucination Scenarios', () => {
    test('should catch invented service names', () => {
      const inventedServices = [
        'CampaignGeneratorService', // Plausible but doesn't exist
        'ContentAnalyzerService', // Plausible but doesn't exist
        'SocialMediaService', // Too generic, doesn't exist
        'MarketingAutomationService', // Plausible but doesn't exist
      ];

      inventedServices.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(false);
      });
    });

    test('should catch typos in service names', () => {
      const typos = [
        'TrendCollectorServic', // Missing 'e'
        'KeywordResearchServce', // Typo
        'VideoScriptServise', // Common misspelling
      ];

      typos.forEach((serviceName) => {
        const result = validateService(serviceName);
        expect(result.valid).toBe(false);
      });
    });

    test('should catch references to non-existent external APIs', () => {
      const fakeAPIs = [
        { category: 'trend_sources', name: 'buzzsumo' },
        { category: 'ai_providers', name: 'gemini' },
        { category: 'seo_tools', name: 'moz' },
      ];

      fakeAPIs.forEach(({ category, name }) => {
        const api = loader.getExternalAPI(category, name);
        expect(api).toBeNull();
      });
    });

    test('should validate Claude API model names', () => {
      const api = loader.getExternalAPI('ai_providers', 'claude');
      expect(api).toBeDefined();
      expect(api?.models).toContain('claude-3-5-sonnet-20241022');
      expect(api?.models).toContain('claude-3-5-haiku-20241022');
      expect(api?.models).not.toContain('claude-3-opus-20240229'); // Old model
    });
  });

  describe('Service Count Validation', () => {
    test('should have 80+ total services', () => {
      const truthMap = loader.load();
      const allServices = Object.values(truthMap.services).flat();
      expect(allServices.length).toBeGreaterThanOrEqual(80);
    });

    test('should have no duplicate service names', () => {
      const truthMap = loader.load();
      const allServices = Object.values(truthMap.services).flat();
      const uniqueServices = new Set(allServices);
      expect(uniqueServices.size).toBe(allServices.length);
    });
  });
});
