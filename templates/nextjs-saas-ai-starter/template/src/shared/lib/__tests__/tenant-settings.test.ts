/**
 * Tests for tenant-settings utilities
 */

import {
  applySettingsDefaults,
  DEFAULT_AI,
  DEFAULT_DEPARTMENTS,
  DEFAULT_FEATURES,
  DEFAULT_INTEGRATIONS,
  DEFAULT_STORAGE,
  DEFAULT_UI,
  generateWebhookSecret,
  getDefaultTenantSettings,
  getDepartments,
  hasAIConfigured,
  hasStorageConfigured,
  isFeatureEnabled,
  isValidWebhookUrl,
  mergeTenantSettings,
  parseTenantSettings,
  type TenantSettingsInput,
} from '../tenant-settings';

describe('tenant-settings', () => {
  describe('applySettingsDefaults', () => {
    it('should return all default values for empty settings', () => {
      const result = applySettingsDefaults({});

      expect(result.features).toEqual(DEFAULT_FEATURES);
      expect(result.ui).toEqual(DEFAULT_UI);
      expect(result.integrations).toEqual(DEFAULT_INTEGRATIONS);
      expect(result.ai).toEqual(DEFAULT_AI);
      expect(result.storage).toEqual(DEFAULT_STORAGE);
      expect(result.departments).toEqual(DEFAULT_DEPARTMENTS);
    });

    it('should merge custom values with defaults', () => {
      const settings: TenantSettingsInput = {
        features: { knowledgeBase: false },
        ui: { primaryColor: '#FF0000' },
      };

      const result = applySettingsDefaults(settings);

      expect(result.features.knowledgeBase).toBe(false);
      expect(result.features.webhooks).toBe(false); // default
      expect(result.ui.primaryColor).toBe('#FF0000');
      expect(result.ui.secondaryColor).toBe('#7C6EAF'); // default
    });
  });

  describe('parseTenantSettings', () => {
    it('should parse valid settings object', () => {
      const input = { features: { knowledgeBase: true } };
      const result = parseTenantSettings(input);
      expect(result.features?.knowledgeBase).toBe(true);
    });

    it('should parse JSON string', () => {
      const input = JSON.stringify({ features: { webhooks: false } });
      const result = parseTenantSettings(input);
      expect(result.features?.webhooks).toBe(false);
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
        features: { knowledgeBase: true, webhooks: true },
        ui: { primaryColor: '#0000FF' },
      };
      const partial: Partial<TenantSettingsInput> = {
        features: { knowledgeBase: false },
      };

      const result = mergeTenantSettings(existing, partial);

      expect(result.features?.knowledgeBase).toBe(false);
      expect(result.features?.webhooks).toBe(true);
      expect(result.ui?.primaryColor).toBe('#0000FF');
    });

    it('should preserve existing values when partial is undefined', () => {
      const existing: TenantSettingsInput = {
        features: { knowledgeBase: true },
      };

      const result = mergeTenantSettings(existing, {});

      expect(result.features?.knowledgeBase).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', () => {
      const settings: TenantSettingsInput = { features: { knowledgeBase: true } };
      expect(isFeatureEnabled(settings, 'knowledgeBase')).toBe(true);
    });

    it('should return false for disabled feature', () => {
      const settings: TenantSettingsInput = { features: { knowledgeBase: false } };
      expect(isFeatureEnabled(settings, 'knowledgeBase')).toBe(false);
    });

    it('should return default value for missing feature', () => {
      const settings: TenantSettingsInput = {};
      expect(isFeatureEnabled(settings, 'knowledgeBase')).toBe(true); // default is true
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
      expect(DEFAULT_FEATURES.knowledgeBase).toBe(true);
      expect(DEFAULT_FEATURES.webhooks).toBe(false);
      expect(DEFAULT_FEATURES.allowCustomRoles).toBe(true);
    });

    it('should have correct DEFAULT_UI', () => {
      expect(DEFAULT_UI.primaryColor).toBe('#4F5BD5');
      expect(DEFAULT_UI.defaultLanguage).toBe('en');
    });

    it('should have correct DEFAULT_AI', () => {
      expect(DEFAULT_AI.chatModel).toBe('gpt-4o-mini');
      expect(DEFAULT_AI.temperature).toBe(0.1);
    });
  });
});
