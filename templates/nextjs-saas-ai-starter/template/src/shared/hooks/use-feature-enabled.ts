'use client';

import { useContext } from 'react';

import { applySettingsDefaults, DEFAULT_FEATURES, type FeatureFlags } from '../lib/tenant-settings';
import { TenantContext } from '../providers/tenant-provider';

// ============================================================================
// Feature Flag Hooks
// ============================================================================

type FeatureFlagKey = keyof FeatureFlags;

/**
 * Hook to access tenant settings directly
 */
export function useTenantSettings() {
  const context = useContext(TenantContext);
  return context?.settings ?? applySettingsDefaults({});
}

/**
 * Hook to check if a feature is enabled for the current tenant
 *
 * @example
 * const isKnowledgeBaseEnabled = useFeatureEnabled('knowledgeBase');
 * if (!isKnowledgeBaseEnabled) return null;
 */
export function useFeatureEnabled(flag: FeatureFlagKey): boolean {
  const context = useContext(TenantContext);

  if (!context) {
    // Fallback to default when not in provider
    return DEFAULT_FEATURES[flag] ?? false;
  }

  return context.settings.features[flag] ?? DEFAULT_FEATURES[flag] ?? false;
}

/**
 * Hook to get multiple feature flags at once
 *
 * @example
 * const { knowledgeBase, assessments } = useFeatureFlags(['knowledgeBase', 'assessments']);
 */
export function useFeatureFlags<T extends FeatureFlagKey>(flags: T[]): Record<T, boolean> {
  const context = useContext(TenantContext);

  const result = {} as Record<T, boolean>;
  for (const flag of flags) {
    if (context) {
      result[flag] = context.settings.features[flag] ?? DEFAULT_FEATURES[flag] ?? false;
    } else {
      result[flag] = DEFAULT_FEATURES[flag] ?? false;
    }
  }

  return result;
}
