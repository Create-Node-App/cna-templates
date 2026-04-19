'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState, useTransition } from 'react';

import type { TenantSettings } from '@/shared/lib/tenant-settings';
import { DEFAULT_AI, DEFAULT_FEATURES, DEFAULT_STORAGE, DEFAULT_UI } from '@/shared/lib/tenant-settings';

// ============================================================================
// Types
// ============================================================================

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SettingsContextValue {
  // Core data
  tenantSlug: string;
  tenantName: string;
  tenantDescription: string;
  settings: TenantSettings;

  // Computed settings with defaults
  features: NonNullable<TenantSettings['features']>;
  ui: NonNullable<TenantSettings['ui']>;
  ai: NonNullable<TenantSettings['ai']>;
  storage: NonNullable<TenantSettings['storage']>;

  // State
  name: string;
  description: string;
  isPending: boolean;
  saveStatus: SaveStatus;

  // Actions
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setSettings: (settings: TenantSettings) => void;
  handleSave: (
    section: string,
    data: Partial<TenantSettings> | { name?: string; description?: string },
  ) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface SettingsProviderProps {
  children: ReactNode;
  tenantSlug: string;
  tenantName: string;
  tenantDescription: string | null;
  initialSettings: TenantSettings;
}

export function SettingsProvider({
  children,
  tenantSlug,
  tenantName: initialName,
  tenantDescription: initialDescription,
  initialSettings,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<TenantSettings>(initialSettings);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Memoized settings with defaults
  const features = useMemo(() => ({ ...DEFAULT_FEATURES, ...settings.features }), [settings.features]);
  const ui = useMemo(() => ({ ...DEFAULT_UI, ...settings.ui }), [settings.ui]);
  const ai = useMemo(() => ({ ...DEFAULT_AI, ...settings.ai }), [settings.ai]);
  const storage = useMemo(() => ({ ...DEFAULT_STORAGE, ...settings.storage }), [settings.storage]);

  // Save handler
  const handleSave = useCallback(
    async (section: string, data: Partial<TenantSettings> | { name?: string; description?: string }) => {
      setSaveStatus('saving');
      startTransition(async () => {
        try {
          const response = await fetch(`/api/tenants/${tenantSlug}/settings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section, data }),
          });

          if (!response.ok) {
            throw new Error('Failed to save settings');
          }

          const result = await response.json();
          if (result.settings) {
            setSettings(result.settings);
          }
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      });
    },
    [tenantSlug],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      tenantSlug,
      tenantName: name,
      tenantDescription: description,
      settings,
      features,
      ui,
      ai,
      storage,
      name,
      description,
      isPending,
      saveStatus,
      setName,
      setDescription,
      setSettings,
      handleSave,
    }),
    [tenantSlug, name, description, settings, features, ui, ai, storage, isPending, saveStatus, handleSave],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
