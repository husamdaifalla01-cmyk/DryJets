/**
 * ENDPOINT VALIDATION TESTS
 *
 * Tests to validate API endpoint references against TRUTH_MAP.yaml
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { getTruthMapLoader } from './helpers/truth-loader';
import { validateEndpoint, validatePlatform } from './helpers/validators';

describe('Endpoint Validation Tests', () => {
  let loader: ReturnType<typeof getTruthMapLoader>;

  beforeAll(() => {
    loader = getTruthMapLoader();
    loader.load();
  });

  describe('Profile Endpoints', () => {
    test('should validate existing profile endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/' },
        { method: 'GET', path: '/' },
        { method: 'GET', path: '/:id' },
        { method: 'PATCH', path: '/:id' },
        { method: 'DELETE', path: '/:id' },
        { method: 'POST', path: '/:id/activate' },
        { method: 'GET', path: '/:id/stats' },
        { method: 'POST', path: '/:id/connections' },
        { method: 'GET', path: '/:id/connections' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('profile', method, path);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject non-existent profile endpoints', () => {
      const invalidEndpoints = [
        { method: 'POST', path: '/:id/fake-endpoint' },
        { method: 'PUT', path: '/:id' }, // We use PATCH, not PUT
        { method: 'GET', path: '/:id/non-existent' },
      ];

      invalidEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('profile', method, path);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Campaign Endpoints', () => {
    test('should validate campaign CRUD endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/' },
        { method: 'GET', path: '/' },
        { method: 'GET', path: '/:id' },
        { method: 'PATCH', path: '/:id' },
        { method: 'DELETE', path: '/:id' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('campaigns', method, path);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate campaign workflow endpoints', () => {
      const workflowEndpoints = [
        { method: 'POST', path: '/:id/analyze-trends' },
        { method: 'GET', path: '/:id/trends' },
        { method: 'POST', path: '/:id/analyze-seo' },
        { method: 'GET', path: '/:id/seo' },
        { method: 'POST', path: '/:id/orchestrate' },
        { method: 'GET', path: '/:id/orchestration' },
        { method: 'POST', path: '/:id/approve' },
        { method: 'POST', path: '/:id/start' },
      ];

      workflowEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('campaigns', method, path);
        expect(result.valid).toBe(true);
      });
    });

    test('should reject invalid campaign endpoints', () => {
      const invalidEndpoints = [
        { method: 'POST', path: '/:id/execute' }, // We use 'start'
        { method: 'POST', path: '/:id/stop' }, // We use 'pause' or 'end'
        { method: 'GET', path: '/:id/metrics' }, // Wrong path
      ];

      invalidEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('campaigns', method, path);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Content Endpoints', () => {
    test('should validate content generation endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/blog/generate' },
        { method: 'GET', path: '/blog/:id' },
        { method: 'POST', path: '/repurpose' },
        { method: 'GET', path: '/repurpose/:jobId' },
        { method: 'GET', path: '/' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('content', method, path);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Trends Endpoints', () => {
    test('should validate trend intelligence endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/collect' },
        { method: 'GET', path: '/' },
        { method: 'POST', path: '/predict' },
        { method: 'GET', path: '/opportunities' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('trends', method, path);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('SEO Endpoints', () => {
    test('should validate SEO automation endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/keywords/discover' },
        { method: 'GET', path: '/keywords' },
        { method: 'POST', path: '/keywords/:id/track' },
        { method: 'POST', path: '/programmatic-pages/generate' },
        { method: 'GET', path: '/programmatic-pages' },
        { method: 'POST', path: '/serp/track' },
        { method: 'GET', path: '/serp/rankings' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('seo', method, path);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Video Endpoints', () => {
    test('should validate video generation endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/script/generate' },
        { method: 'POST', path: '/metadata/generate' },
        { method: 'POST', path: '/hashtags/generate' },
        { method: 'POST', path: '/dna/create' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('video', method, path);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate but warn about unimplemented endpoints', () => {
      // These endpoints exist in TRUTH_MAP but are marked as not_implemented
      const unimplementedEndpoints = [
        { method: 'POST', path: '/generate/runway' },
        { method: 'POST', path: '/generate/pika' },
      ];

      unimplementedEndpoints.forEach(({ method, path }) => {
        const endpoints = loader.getControllerEndpoints('video');
        const endpoint = endpoints.find(
          (ep) => ep.method === method && ep.path === path
        );
        expect(endpoint).toBeDefined();
        expect(endpoint?.status).toBe('not_implemented');
      });
    });
  });

  describe('Analytics Endpoints', () => {
    test('should validate analytics endpoints', () => {
      const validEndpoints = [
        { method: 'GET', path: '/dashboard' },
        { method: 'GET', path: '/campaigns/:id' },
        { method: 'GET', path: '/campaigns/:id/platform/:platform' },
        { method: 'GET', path: '/content/:id' },
        { method: 'GET', path: '/roi' },
        { method: 'POST', path: '/reports/custom' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('analytics', method, path);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('ML Lab Endpoints', () => {
    test('should validate ML endpoints', () => {
      const validEndpoints = [
        { method: 'GET', path: '/dashboard' },
        { method: 'POST', path: '/trends/forecast' },
        { method: 'POST', path: '/content/predict' },
        { method: 'POST', path: '/keywords/cluster' },
        { method: 'POST', path: '/campaigns/predict' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('ml', method, path);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Offer Lab Endpoints', () => {
    test('should validate Offer Lab endpoints', () => {
      const validEndpoints = [
        { method: 'POST', path: '/offers/import' },
        { method: 'GET', path: '/offers' },
        { method: 'POST', path: '/funnels/generate' },
        { method: 'GET', path: '/funnels/:id' },
        { method: 'POST', path: '/traffic/connect' },
        { method: 'POST', path: '/campaigns/deploy' },
      ];

      validEndpoints.forEach(({ method, path }) => {
        const result = validateEndpoint('offer_lab', method, path);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Platform Support Validation', () => {
    test('should validate supported platforms', () => {
      const validPlatforms = [
        'linkedin',
        'youtube',
        'tiktok',
        'twitter',
        'facebook',
        'instagram',
        'pinterest',
        'medium',
        'substack',
      ];

      validPlatforms.forEach((platform) => {
        const result = validatePlatform(platform);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject unsupported platforms', () => {
      const invalidPlatforms = [
        'snapchat',
        'reddit',
        'tumblr',
        'LinkedIn', // Case sensitive
        'Youtube', // Case sensitive
      ];

      invalidPlatforms.forEach((platform) => {
        const result = validatePlatform(platform);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Real-world Hallucination Scenarios', () => {
    test('should catch invented API paths', () => {
      const inventedPaths = [
        { controller: 'campaigns', method: 'POST', path: '/:id/publish' },
        { controller: 'profile', method: 'GET', path: '/:id/metrics' },
        { controller: 'content', method: 'POST', path: '/generate' },
      ];

      inventedPaths.forEach(({ controller, method, path }) => {
        const result = validateEndpoint(controller, method, path);
        expect(result.valid).toBe(false);
      });
    });

    test('should catch wrong HTTP methods', () => {
      const wrongMethods = [
        { controller: 'campaigns', method: 'PUT', path: '/:id' }, // Should be PATCH
        { controller: 'profile', method: 'POST', path: '/:id' }, // Should be PATCH
      ];

      wrongMethods.forEach(({ controller, method, path }) => {
        const result = validateEndpoint(controller, method, path);
        expect(result.valid).toBe(false);
      });
    });

    test('should catch plausible but non-existent endpoints', () => {
      const plausibleButWrong = [
        { controller: 'campaigns', method: 'POST', path: '/:id/stop' }, // We use pause/end
        { controller: 'campaigns', method: 'POST', path: '/:id/activate' }, // We use start
        { controller: 'trends', method: 'POST', path: '/analyze' }, // Not a real endpoint
      ];

      plausibleButWrong.forEach(({ controller, method, path }) => {
        const result = validateEndpoint(controller, method, path);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Controller Coverage', () => {
    test('should have all major controllers in TRUTH_MAP', () => {
      const expectedControllers = [
        'profile',
        'campaigns',
        'content',
        'trends',
        'seo',
        'video',
        'publishing',
        'analytics',
        'intelligence',
        'ml',
        'workflows',
        'optimization',
        'monitoring',
        'offer_lab',
      ];

      const truthMap = loader.load();
      const controllers = Object.keys(truthMap.api_endpoints.controllers);

      expectedControllers.forEach((controllerName) => {
        expect(controllers).toContain(controllerName);
      });
    });
  });
});
