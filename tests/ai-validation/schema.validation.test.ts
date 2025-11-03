/**
 * SCHEMA VALIDATION TESTS
 *
 * Tests to validate database model and field references
 * against TRUTH_MAP.yaml
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { getTruthMapLoader } from './helpers/truth-loader';
import { validateModel, validateModelField } from './helpers/validators';

describe('Schema Validation Tests', () => {
  let loader: ReturnType<typeof getTruthMapLoader>;

  beforeAll(() => {
    loader = getTruthMapLoader();
    loader.load();
  });

  describe('Model Validation', () => {
    test('should validate existing models', () => {
      const validModels = [
        'User',
        'Customer',
        'Merchant',
        'Order',
        'Campaign',
        'MarketingProfile',
        'TrendData',
        'BlogPost',
        'VideoDNA',
      ];

      validModels.forEach((modelName) => {
        const result = validateModel(modelName);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject non-existent models', () => {
      const invalidModels = [
        'FakeModel',
        'InvalidUser',
        'NonExistentCampaign',
        'MadeUpData',
      ];

      invalidModels.forEach((modelName) => {
        const result = validateModel(modelName);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].type).toBe('model');
      });
    });

    test('should load all models from TRUTH_MAP', () => {
      const models = loader.getModelNames();
      expect(models).toContain('User');
      expect(models).toContain('Campaign');
      expect(models).toContain('MarketingProfile');
      expect(models).toContain('TrendData');
      expect(models).toContain('Offer');
      expect(models).toContain('Funnel');
      expect(models.length).toBeGreaterThan(100); // Should have 150+ models
    });
  });

  describe('Field Validation', () => {
    test('should validate existing fields on User model', () => {
      const validFields = ['id', 'email', 'role', 'status', 'passwordHash'];

      validFields.forEach((fieldName) => {
        const result = validateModelField('User', fieldName);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should validate existing fields on Campaign model', () => {
      const validFields = ['id', 'name', 'profileId', 'type', 'status', 'budget'];

      validFields.forEach((fieldName) => {
        const result = validateModelField('Campaign', fieldName);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject non-existent fields', () => {
      const testCases = [
        { model: 'User', field: 'fakeField' },
        { model: 'Campaign', field: 'inventedProperty' },
        { model: 'Order', field: 'nonExistentData' },
      ];

      testCases.forEach(({ model, field }) => {
        const result = validateModelField(model, field);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].type).toBe('field');
      });
    });

    test('should reject fields on non-existent models', () => {
      const result = validateModelField('NonExistentModel', 'anyField');
      expect(result.valid).toBe(false);
      expect(result.errors[0].type).toBe('model');
    });
  });

  describe('Marketing Engine Models', () => {
    test('should validate Marketing Profile model', () => {
      const result = validateModel('MarketingProfile');
      expect(result.valid).toBe(true);

      const fields = loader.getModelFields('MarketingProfile');
      expect(fields).toContain('id');
      expect(fields).toContain('userId');
      expect(fields).toContain('name');
      expect(fields).toContain('brandVoice');
    });

    test('should validate Campaign model', () => {
      const result = validateModel('Campaign');
      expect(result.valid).toBe(true);

      const fields = loader.getModelFields('Campaign');
      expect(fields).toContain('id');
      expect(fields).toContain('profileId');
      expect(fields).toContain('type');
      expect(fields).toContain('status');
      expect(fields).toContain('platforms');
    });

    test('should validate TrendData model', () => {
      const result = validateModel('TrendData');
      expect(result.valid).toBe(true);

      const fields = loader.getModelFields('TrendData');
      expect(fields).toContain('source');
      expect(fields).toContain('keyword');
      expect(fields).toContain('volume');
      expect(fields).toContain('lifecycle');
    });

    test('should validate Offer Lab models', () => {
      const offerLabModels = ['Offer', 'Funnel', 'LeadMagnet', 'AdCampaign'];

      offerLabModels.forEach((modelName) => {
        const result = validateModel(modelName);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Real-world Scenarios', () => {
    test('should catch common typos in model names', () => {
      const typos = [
        { wrong: 'Campain', correct: 'Campaign' }, // Missing 'g'
        { wrong: 'Usre', correct: 'User' }, // Swapped letters
        { wrong: 'Marchant', correct: 'Merchant' }, // Common misspelling
      ];

      typos.forEach(({ wrong }) => {
        const result = validateModel(wrong);
        expect(result.valid).toBe(false);
      });
    });

    test('should catch invented fields on real models', () => {
      // Common hallucinations: inventing fields that seem plausible
      const hallucinations = [
        { model: 'Campaign', field: 'createdBy' }, // Plausible but doesn't exist
        { model: 'User', field: 'username' }, // Common but we use email
        { model: 'Order', field: 'trackingNumber' }, // We use orderNumber
      ];

      hallucinations.forEach(({ model, field }) => {
        const result = validateModelField(model, field);
        // These should fail because fields don't exist in key_fields
        if (!result.valid) {
          expect(result.errors[0].type).toBe('field');
        }
      });
    });
  });
});
