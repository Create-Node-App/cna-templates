/**
 * Tests for feature flag hooks
 */

import { renderHook } from '@testing-library/react';
import React from 'react';

import { applySettingsDefaults, DEFAULT_FEATURES } from '@/shared/lib/tenant-settings';
import { TenantContext, type TenantContextValue } from '@/shared/providers/tenant-provider';

import { useFeatureEnabled, useFeatureFlags, useTenantSettings } from '../use-feature-enabled';

// Helper to create a wrapper with TenantContext
const createWrapper = (value: TenantContextValue | null) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    if (!value) {
      return <>{children}</>;
    }
    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
  };
};

describe('use-feature-enabled', () => {
  describe('useTenantSettings', () => {
    it('should return tenant settings from context', () => {
      const settings = applySettingsDefaults({ features: { knowledgeBase: false } });
      const wrapper = createWrapper({
        id: 'tenant-123',
        slug: 'test',
        name: 'Test',
        settings,
      });

      const { result } = renderHook(() => useTenantSettings(), { wrapper });

      expect(result.current.features.knowledgeBase).toBe(false);
    });

    it('should return default settings when no context', () => {
      const wrapper = createWrapper(null);

      const { result } = renderHook(() => useTenantSettings(), { wrapper });

      // Should have all default values
      expect(result.current.features.knowledgeBase).toBe(true);
      expect(result.current.ui.primaryColor).toBe('#4F5BD5');
    });
  });

  describe('useFeatureEnabled', () => {
    it('should return true for enabled feature', () => {
      const settings = applySettingsDefaults({ features: { knowledgeBase: true } });
      const wrapper = createWrapper({
        id: 'tenant-123',
        slug: 'test',
        name: 'Test',
        settings,
      });

      const { result } = renderHook(() => useFeatureEnabled('knowledgeBase'), { wrapper });

      expect(result.current).toBe(true);
    });

    it('should return false for disabled feature', () => {
      const settings = applySettingsDefaults({ features: { webhooks: false } });
      const wrapper = createWrapper({
        id: 'tenant-123',
        slug: 'test',
        name: 'Test',
        settings,
      });

      const { result } = renderHook(() => useFeatureEnabled('webhooks'), { wrapper });

      expect(result.current).toBe(false);
    });

    it('should return default value when no context', () => {
      const wrapper = createWrapper(null);

      // knowledgeBase default is true
      const { result: kbResult } = renderHook(() => useFeatureEnabled('knowledgeBase'), { wrapper });
      expect(kbResult.current).toBe(true);

      // webhooks default is false
      const { result: webhooksResult } = renderHook(() => useFeatureEnabled('webhooks'), { wrapper });
      expect(webhooksResult.current).toBe(false);
    });

    it('should use default when feature not explicitly set', () => {
      const settings = applySettingsDefaults({});
      const wrapper = createWrapper({
        id: 'tenant-123',
        slug: 'test',
        name: 'Test',
        settings,
      });

      // aiAssistantEnabled default is true
      const { result } = renderHook(() => useFeatureEnabled('aiAssistantEnabled'), { wrapper });
      expect(result.current).toBe(DEFAULT_FEATURES.aiAssistantEnabled);
    });
  });

  describe('useFeatureFlags', () => {
    it('should return multiple feature flags', () => {
      const settings = applySettingsDefaults({
        features: { knowledgeBase: false, aiAssistantEnabled: true, webhooks: true },
      });
      const wrapper = createWrapper({
        id: 'tenant-123',
        slug: 'test',
        name: 'Test',
        settings,
      });

      const { result } = renderHook(() => useFeatureFlags(['knowledgeBase', 'aiAssistantEnabled', 'webhooks']), {
        wrapper,
      });

      expect(result.current.knowledgeBase).toBe(false);
      expect(result.current.aiAssistantEnabled).toBe(true);
      expect(result.current.webhooks).toBe(true);
    });

    it('should return defaults when no context', () => {
      const wrapper = createWrapper(null);

      const { result } = renderHook(() => useFeatureFlags(['knowledgeBase', 'webhooks']), { wrapper });

      expect(result.current.knowledgeBase).toBe(DEFAULT_FEATURES.knowledgeBase);
      expect(result.current.webhooks).toBe(DEFAULT_FEATURES.webhooks);
    });

    it('should handle empty array', () => {
      const settings = applySettingsDefaults({});
      const wrapper = createWrapper({
        id: 'tenant-123',
        slug: 'test',
        name: 'Test',
        settings,
      });

      const { result } = renderHook(() => useFeatureFlags([]), { wrapper });

      expect(result.current).toEqual({});
    });
  });
});
