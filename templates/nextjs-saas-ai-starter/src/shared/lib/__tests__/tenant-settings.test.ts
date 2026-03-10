/**
 * Tests for tenant-settings utilities
 */

import {
  applySettingsDefaults,
  DEFAULT_AI,
  DEFAULT_BULK_IMPORT,
  DEFAULT_DEPARTMENTS,
  DEFAULT_EVIDENCE_UPLOAD,
  DEFAULT_FEATURES,
  DEFAULT_INTEGRATIONS,
  DEFAULT_PROCESSING,
  DEFAULT_QUIZ,
  DEFAULT_SKILL_MATCHING,
  DEFAULT_STORAGE,
  DEFAULT_TAXONOMY,
  DEFAULT_UI,
  generateWebhookSecret,
  getDefaultTenantSettings,
  getDepartments,
  getSkillCategories,
  getSkillCategoryById,
  hasAIConfigured,
  hasStorageConfigured,
  isFeatureEnabled,
  isValidWebhookUrl,
  mergeTenantSettings,
  parseTenantSettings,
  type TenantSettings,
  type TenantSettingsInput,
} from '../tenant-settings';

describe('tenant-settings', () => {
  describe('applySettingsDefaults', () => {
    it('should return all default values for empty settings', () => {
      const result = applySettingsDefaults({});

      expect(result.features).toEqual(DEFAULT_FEATURES);
      expect(result.skillMatching).toEqual(DEFAULT_SKILL_MATCHING);
      expect(result.processing).toEqual(DEFAULT_PROCESSING);
      expect(result.ui).toEqual(DEFAULT_UI);
      expect(result.integrations).toEqual(DEFAULT_INTEGRATIONS);
      expect(result.bulkImport).toEqual(DEFAULT_BULK_IMPORT);
      expect(result.evidenceUpload).toEqual(DEFAULT_EVIDENCE_UPLOAD);
      expect(result.ai).toEqual(DEFAULT_AI);
      expect(result.storage).toEqual(DEFAULT_STORAGE);
      expect(result.departments).toEqual(DEFAULT_DEPARTMENTS);
      expect(result.taxonomy).toEqual(DEFAULT_TAXONOMY);
    });

    it('should merge custom values with defaults', () => {
      // Using plain objects - TenantSettingsInput accepts partials for nested objects
      const settings: TenantSettingsInput = {
        features: { bulkImport: false },
        ui: { primaryColor: '#FF0000' },
      };

      const result = applySettingsDefaults(settings);

      expect(result.features.bulkImport).toBe(false);
      expect(result.features.knowledgeBase).toBe(true); // default
      expect(result.ui.primaryColor).toBe('#FF0000');
      expect(result.ui.secondaryColor).toBe('#7C6EAF'); // default
    });
  });

  describe('parseTenantSettings', () => {
    it('should parse valid settings object', () => {
      const input = { features: { bulkImport: true } };
      const result = parseTenantSettings(input);
      expect(result.features?.bulkImport).toBe(true);
    });

    it('should parse JSON string', () => {
      const input = JSON.stringify({ features: { quiz: false } });
      const result = parseTenantSettings(input);
      expect(result.features?.quiz).toBe(false);
    });

    it('should return empty object for invalid input', () => {
      const result = parseTenantSettings('invalid json');
      expect(result).toEqual({});
    });

    it('should return empty object for null/undefined', () => {
      expect(parseTenantSettings(null)).toEqual({});
      expect(parseTenantSettings(undefined)).toEqual({});
    });
  });

  describe('mergeTenantSettings', () => {
    it('should merge partial settings into existing', () => {
      const existing: TenantSettingsInput = {
        features: { bulkImport: true, quiz: true },
        ui: { primaryColor: '#0000FF' },
      };
      const partial: Partial<TenantSettingsInput> = {
        features: { bulkImport: false },
      };

      const result = mergeTenantSettings(existing, partial);

      expect(result.features?.bulkImport).toBe(false);
      expect(result.features?.quiz).toBe(true);
      expect(result.ui?.primaryColor).toBe('#0000FF');
    });

    it('should preserve existing values when partial is undefined', () => {
      const existing: TenantSettingsInput = {
        features: { bulkImport: true },
      };

      const result = mergeTenantSettings(existing, {});

      expect(result.features?.bulkImport).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', () => {
      const settings: TenantSettingsInput = { features: { bulkImport: true } };
      expect(isFeatureEnabled(settings, 'bulkImport')).toBe(true);
    });

    it('should return false for disabled feature', () => {
      const settings: TenantSettingsInput = { features: { bulkImport: false } };
      expect(isFeatureEnabled(settings, 'bulkImport')).toBe(false);
    });

    it('should return default value for missing feature', () => {
      const settings: TenantSettingsInput = {};
      expect(isFeatureEnabled(settings, 'bulkImport')).toBe(true); // default is true
      expect(isFeatureEnabled(settings, 'webhooks')).toBe(false); // default is false
    });
  });

  describe('getDefaultTenantSettings', () => {
    it('should return empty object', () => {
      expect(getDefaultTenantSettings()).toEqual({});
    });
  });

  describe('hasAIConfigured', () => {
    it('should return true when AI is configured', () => {
      const settings: TenantSettingsInput = {
        ai: { provider: 'openai', apiKey: 'sk-test' },
      };
      expect(hasAIConfigured(settings)).toBe(true);
    });

    it('should return false when provider is missing', () => {
      const settings: TenantSettingsInput = {
        ai: { apiKey: 'sk-test' },
      };
      expect(hasAIConfigured(settings)).toBe(false);
    });

    it('should return false when API key is missing', () => {
      const settings: TenantSettingsInput = {
        ai: { provider: 'openai' },
      };
      expect(hasAIConfigured(settings)).toBe(false);
    });

    it('should return false for empty settings', () => {
      expect(hasAIConfigured({})).toBe(false);
    });
  });

  describe('hasStorageConfigured', () => {
    it('should return true when storage is fully configured', () => {
      const settings: TenantSettingsInput = {
        storage: {
          provider: 's3',
          accessKey: 'access',
          secretKey: 'secret',
          bucket: 'my-bucket',
        },
      };
      expect(hasStorageConfigured(settings)).toBe(true);
    });

    it('should return false when missing required fields', () => {
      const settings: TenantSettingsInput = {
        storage: { provider: 's3', accessKey: 'access' },
      };
      expect(hasStorageConfigured(settings)).toBe(false);
    });

    it('should return false for empty settings', () => {
      expect(hasStorageConfigured({})).toBe(false);
    });
  });

  describe('getSkillCategories', () => {
    it('should return custom categories when defined', () => {
      const customCategories = [
        { id: 'custom1', name: 'Custom 1', sortOrder: 1 },
        { id: 'custom2', name: 'Custom 2', sortOrder: 2 },
      ];
      const settings: TenantSettings = {
        taxonomy: { skillCategories: customCategories },
      };

      const result = getSkillCategories(settings);
      expect(result).toEqual(customCategories);
    });

    it('should return sorted categories', () => {
      const unsortedCategories = [
        { id: 'b', name: 'B', sortOrder: 2 },
        { id: 'a', name: 'A', sortOrder: 1 },
      ];
      const settings: TenantSettings = {
        taxonomy: { skillCategories: unsortedCategories },
      };

      const result = getSkillCategories(settings);
      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('b');
    });

    it('should return default categories when not defined', () => {
      const result = getSkillCategories({});
      expect(result).toEqual(DEFAULT_TAXONOMY.skillCategories);
    });
  });

  describe('getDepartments', () => {
    it('should return departments list', () => {
      const depts = [{ id: 'eng', name: 'Engineering', sortOrder: 0 }];
      const settings: TenantSettingsInput = {
        departments: { list: depts },
      };

      expect(getDepartments(settings)).toEqual(depts);
    });

    it('should return empty array when not defined', () => {
      expect(getDepartments({})).toEqual([]);
    });
  });

  describe('getSkillCategoryById', () => {
    it('should return category by ID', () => {
      const categories = [
        { id: 'tech', name: 'Technical', sortOrder: 1 },
        { id: 'soft', name: 'Soft Skills', sortOrder: 2 },
      ];
      const settings: TenantSettingsInput = {
        taxonomy: { skillCategories: categories },
      };

      const result = getSkillCategoryById(settings, 'tech');
      expect(result?.name).toBe('Technical');
    });

    it('should return undefined for non-existing ID', () => {
      const settings: TenantSettingsInput = {
        taxonomy: { skillCategories: [{ id: 'tech', name: 'Technical', sortOrder: 1 }] },
      };

      expect(getSkillCategoryById(settings, 'unknown')).toBeUndefined();
    });
  });

  describe('isValidWebhookUrl', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      // Use Object.defineProperty to avoid TS error on read-only property
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should accept HTTPS URLs', () => {
      expect(isValidWebhookUrl('https://example.com/webhook')).toBe(true);
    });

    it('should accept HTTP URLs in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      expect(isValidWebhookUrl('http://localhost:3000/webhook')).toBe(true);
    });

    it('should reject HTTP URLs in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      expect(isValidWebhookUrl('http://example.com/webhook')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidWebhookUrl('not-a-url')).toBe(false);
      expect(isValidWebhookUrl('')).toBe(false);
    });
  });

  describe('generateWebhookSecret', () => {
    it('should generate a 32-character string', () => {
      const secret = generateWebhookSecret();
      expect(secret.length).toBe(32);
    });

    it('should only contain alphanumeric characters', () => {
      const secret = generateWebhookSecret();
      expect(/^[A-Za-z0-9]+$/.test(secret)).toBe(true);
    });

    it('should generate unique secrets', () => {
      const secrets = new Set<string>();
      for (let i = 0; i < 100; i++) {
        secrets.add(generateWebhookSecret());
      }
      expect(secrets.size).toBe(100);
    });
  });

  describe('default constants', () => {
    it('should have correct DEFAULT_FEATURES', () => {
      expect(DEFAULT_FEATURES.bulkImport).toBe(true);
      expect(DEFAULT_FEATURES.webhooks).toBe(false);
      expect(DEFAULT_FEATURES.hrisIntegration).toBe(false);
    });

    it('should have correct DEFAULT_SKILL_MATCHING', () => {
      expect(DEFAULT_SKILL_MATCHING.exactMatchThreshold).toBe(0.92);
      expect(DEFAULT_SKILL_MATCHING.suggestThreshold).toBe(0.75);
    });

    it('should have correct DEFAULT_PROCESSING', () => {
      expect(DEFAULT_PROCESSING.batchSize).toBe(10);
      expect(DEFAULT_PROCESSING.maxRetries).toBe(3);
    });

    it('should have correct DEFAULT_UI', () => {
      expect(DEFAULT_UI.primaryColor).toBe('#4F5BD5');
      expect(DEFAULT_UI.defaultLanguage).toBe('en');
    });

    it('should have correct DEFAULT_QUIZ', () => {
      expect(DEFAULT_QUIZ.enabled).toBe(true);
      expect(DEFAULT_QUIZ.questionsPerQuiz).toBe(10);
      expect(DEFAULT_QUIZ.cacheTtlDays).toBe(-1);
    });
  });
});
