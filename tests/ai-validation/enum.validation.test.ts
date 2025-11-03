/**
 * ENUM VALIDATION TESTS
 *
 * Tests to validate enum values against TRUTH_MAP.yaml
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { getTruthMapLoader } from './helpers/truth-loader';
import { validateEnumValue } from './helpers/validators';

describe('Enum Validation Tests', () => {
  let loader: ReturnType<typeof getTruthMapLoader>;

  beforeAll(() => {
    loader = getTruthMapLoader();
    loader.load();
  });

  describe('UserRole Enum', () => {
    test('should validate valid UserRole values', () => {
      const validRoles = ['CUSTOMER', 'BUSINESS', 'ENTERPRISE', 'DRIVER', 'MERCHANT', 'ADMIN'];

      validRoles.forEach((role) => {
        const result = validateEnumValue('UserRole', role);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid UserRole values', () => {
      const invalidRoles = ['USER', 'GUEST', 'MODERATOR', 'customer', 'admin'];

      invalidRoles.forEach((role) => {
        const result = validateEnumValue('UserRole', role);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CampaignType Enum', () => {
    test('should validate valid CampaignType values', () => {
      const validTypes = [
        'PAID_SEARCH',
        'PAID_SOCIAL',
        'EMAIL',
        'SEO',
        'CONTENT',
        'VIDEO',
        'MULTI_CHANNEL',
      ];

      validTypes.forEach((type) => {
        const result = validateEnumValue('CampaignType', type);
        expect(result.valid).toBe(true);
      });
    });

    test('should reject invalid CampaignType values', () => {
      const invalidTypes = [
        'SOCIAL', // Missing PAID_ prefix
        'DISPLAY', // Not in enum
        'AFFILIATE', // Not in enum
        'multi-channel', // Wrong case
      ];

      invalidTypes.forEach((type) => {
        const result = validateEnumValue('CampaignType', type);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('CampaignStatus Enum', () => {
    test('should validate valid CampaignStatus values', () => {
      const validStatuses = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];

      validStatuses.forEach((status) => {
        const result = validateEnumValue('CampaignStatus', status);
        expect(result.valid).toBe(true);
      });
    });

    test('should reject invalid CampaignStatus values', () => {
      const invalidStatuses = [
        'PENDING', // Not in enum
        'RUNNING', // We use ACTIVE
        'STOPPED', // We use PAUSED
        'draft', // Wrong case
      ];

      invalidStatuses.forEach((status) => {
        const result = validateEnumValue('CampaignStatus', status);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('TrendLifecycle Enum', () => {
    test('should validate valid TrendLifecycle values', () => {
      const validLifecycles = ['EMERGING', 'GROWING', 'PEAK', 'DECLINING', 'DEAD'];

      validLifecycles.forEach((lifecycle) => {
        const result = validateEnumValue('TrendLifecycle', lifecycle);
        expect(result.valid).toBe(true);
      });
    });

    test('should reject invalid TrendLifecycle values', () => {
      const invalidLifecycles = ['NEW', 'TRENDING', 'VIRAL', 'EXPIRED'];

      invalidLifecycles.forEach((lifecycle) => {
        const result = validateEnumValue('TrendLifecycle', lifecycle);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('OrderStatus Enum', () => {
    test('should validate complex OrderStatus values', () => {
      const validStatuses = [
        'PENDING_PAYMENT',
        'DRIVER_ASSIGNED',
        'IN_PROCESS',
        'DELIVERED',
        'CANCELLED',
      ];

      validStatuses.forEach((status) => {
        const result = validateEnumValue('OrderStatus', status);
        expect(result.valid).toBe(true);
      });
    });

    test('should reject plausible but invalid OrderStatus values', () => {
      const invalidStatuses = [
        'PROCESSING', // We use IN_PROCESS
        'COMPLETED', // We use DELIVERED or PICKED_UP_BY_CUSTOMER
        'SHIPPED', // Not applicable to our model
      ];

      invalidStatuses.forEach((status) => {
        const result = validateEnumValue('OrderStatus', status);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('FulfillmentMode Enum', () => {
    test('should validate FulfillmentMode values', () => {
      const validModes = [
        'FULL_SERVICE',
        'CUSTOMER_DROPOFF_PICKUP',
        'CUSTOMER_DROPOFF_DRIVER_DELIVERY',
        'DRIVER_PICKUP_CUSTOMER_PICKUP',
      ];

      validModes.forEach((mode) => {
        const result = validateEnumValue('FulfillmentMode', mode);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Equipment & IoT Enums', () => {
    test('should validate EquipmentType values', () => {
      const validTypes = ['WASHER', 'DRYER', 'PRESSER', 'STEAMER', 'OTHER'];

      validTypes.forEach((type) => {
        const result = validateEnumValue('EquipmentType', type);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate MaintenanceAlertType values', () => {
      const validAlerts = [
        'TEMPERATURE_ANOMALY',
        'VIBRATION_SPIKE',
        'PREDICTIVE_FAILURE',
        'FILTER_REPLACEMENT',
      ];

      validAlerts.forEach((alert) => {
        const result = validateEnumValue('MaintenanceAlertType', alert);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate AlertSeverity values', () => {
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

      validSeverities.forEach((severity) => {
        const result = validateEnumValue('AlertSeverity', severity);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('SEO & Content Enums', () => {
    test('should validate KeywordIntent values', () => {
      const validIntents = ['INFORMATIONAL', 'COMMERCIAL', 'TRANSACTIONAL', 'NAVIGATIONAL'];

      validIntents.forEach((intent) => {
        const result = validateEnumValue('KeywordIntent', intent);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate PageType values', () => {
      const validTypes = [
        'LOCATION_PAGE',
        'SERVICE_PAGE',
        'COMPARISON_PAGE',
        'QUESTION_PAGE',
        'ULTIMATE_GUIDE',
        'BLOG_POST',
      ];

      validTypes.forEach((type) => {
        const result = validateEnumValue('PageType', type);
        expect(result.valid).toBe(true);
      });
    });

    test('should validate BacklinkType values', () => {
      const validTypes = [
        'HARO',
        'GUEST_POST',
        'BROKEN_LINK',
        'RESOURCE_PAGE',
        'PARTNERSHIP',
        'UGC_TOOL',
      ];

      validTypes.forEach((type) => {
        const result = validateEnumValue('BacklinkType', type);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Video Enums', () => {
    test('should validate VideoStatus values', () => {
      const validStatuses = [
        'GENERATING',
        'GENERATED',
        'QUALITY_CHECK_FAILED',
        'APPROVED',
        'PUBLISHED',
        'REJECTED',
      ];

      validStatuses.forEach((status) => {
        const result = validateEnumValue('VideoStatus', status);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Real-world Hallucination Scenarios', () => {
    test('should catch case sensitivity errors', () => {
      const caseSensitiveTests = [
        { enum: 'CampaignStatus', value: 'active' }, // Should be ACTIVE
        { enum: 'UserRole', value: 'admin' }, // Should be ADMIN
        { enum: 'TrendLifecycle', value: 'Peak' }, // Should be PEAK
      ];

      caseSensitiveTests.forEach(({ enum: enumName, value }) => {
        const result = validateEnumValue(enumName, value);
        expect(result.valid).toBe(false);
      });
    });

    test('should catch plausible but invented enum values', () => {
      const plausibleHallucinations = [
        { enum: 'CampaignStatus', value: 'PENDING' }, // Plausible but wrong
        { enum: 'OrderStatus', value: 'PROCESSING' }, // We use IN_PROCESS
        { enum: 'UserRole', value: 'MODERATOR' }, // Doesn't exist
      ];

      plausibleHallucinations.forEach(({ enum: enumName, value }) => {
        const result = validateEnumValue(enumName, value);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('All Enum Names', () => {
    test('should load all enums from TRUTH_MAP', () => {
      const enums = loader.getEnumNames();
      expect(enums).toContain('UserRole');
      expect(enums).toContain('CampaignType');
      expect(enums).toContain('CampaignStatus');
      expect(enums).toContain('TrendLifecycle');
      expect(enums).toContain('OrderStatus');
      expect(enums).toContain('FulfillmentMode');
      expect(enums.length).toBeGreaterThan(30); // Should have 40+ enums
    });
  });
});
