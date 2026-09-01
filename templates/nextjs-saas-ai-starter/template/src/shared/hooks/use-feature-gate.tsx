'use client';

import type { ReactNode } from 'react';

import { useFeatureEnabled } from './use-feature-enabled';
import type { FeatureFlags } from '../lib/tenant-settings';

type FeatureFlagKey = keyof FeatureFlags;

/**
 * Component wrapper that only renders children if feature is enabled
 *
 * @example
 * <FeatureGate feature="knowledgeBase">
 *   <KnowledgeBaseLink />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isEnabled = useFeatureEnabled(feature);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
