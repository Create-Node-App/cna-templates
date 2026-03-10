'use client';

import { createContext, type ReactNode, useContext } from 'react';

import type { TenantSettings } from '../lib/tenant-settings';
import { applySettingsDefaults } from '../lib/tenant-settings';

// ============================================================================
// Tenant Context
// ============================================================================

/**
 * Tenant context type
 */
export interface TenantContextValue {
  /** Tenant slug from URL path */
  slug: string;
  /** Tenant ID (loaded from database) */
  id?: string;
  /** Tenant display name */
  name?: string;
  /** Tenant settings (parsed and with defaults applied) */
  settings: ReturnType<typeof applySettingsDefaults>;
  /** Raw tenant settings (as stored in DB) */
  rawSettings?: TenantSettings;
}

export const TenantContext = createContext<TenantContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface TenantProviderProps {
  children: ReactNode;
  value: {
    slug: string;
    id?: string;
    name?: string;
    settings?: TenantSettings;
  };
}

/**
 * Provider component for tenant context
 *
 * Used in tenant-scoped layouts to provide tenant information
 * to all child components.
 */
export function TenantProvider({ children, value }: TenantProviderProps) {
  const contextValue: TenantContextValue = {
    slug: value.slug,
    id: value.id,
    name: value.name,
    settings: applySettingsDefaults(value.settings ?? {}),
    rawSettings: value.settings,
  };

  return <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>;
}

// ============================================================================
// Hooks (convenience exports, also available from @/shared/hooks)
// ============================================================================

/**
 * Hook to access current tenant information
 *
 * @example
 * const { slug, name, settings } = useTenant();
 *
 * @throws Error if used outside TenantProvider
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook to optionally access tenant (returns null if not in tenant context)
 */
export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext);
}
