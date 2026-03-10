'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState, useTransition } from 'react';

import type { SkillCategory, TenantSettings } from '@/shared/lib/tenant-settings';
import {
  DEFAULT_AI,
  DEFAULT_BULK_IMPORT,
  DEFAULT_EVIDENCE_UPLOAD,
  DEFAULT_FEATURES,
  DEFAULT_PROCESSING,
  DEFAULT_QUIZ,
  DEFAULT_SKILL_MATCHING,
  DEFAULT_STORAGE,
  DEFAULT_TAXONOMY,
  DEFAULT_UI,
} from '@/shared/lib/tenant-settings';

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
  skillMatching: NonNullable<TenantSettings['skillMatching']>;
  processing: NonNullable<TenantSettings['processing']>;
  ui: NonNullable<TenantSettings['ui']>;
  bulkImport: NonNullable<TenantSettings['bulkImport']>;
  evidenceUpload: NonNullable<TenantSettings['evidenceUpload']>;
  ai: NonNullable<TenantSettings['ai']>;
  storage: NonNullable<TenantSettings['storage']>;
  taxonomy: NonNullable<TenantSettings['taxonomy']>;
  quiz: NonNullable<TenantSettings['quiz']>;

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

  // Categories
  handleAddCategory: () => void;
  handleUpdateCategory: (id: string, updates: Partial<SkillCategory>) => void;
  handleRemoveCategory: (id: string) => void;
  handleResetCategories: () => void;
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
  const skillMatching = useMemo(
    () => ({ ...DEFAULT_SKILL_MATCHING, ...settings.skillMatching }),
    [settings.skillMatching],
  );
  const processing = useMemo(() => ({ ...DEFAULT_PROCESSING, ...settings.processing }), [settings.processing]);
  const ui = useMemo(() => ({ ...DEFAULT_UI, ...settings.ui }), [settings.ui]);
  const bulkImport = useMemo(() => ({ ...DEFAULT_BULK_IMPORT, ...settings.bulkImport }), [settings.bulkImport]);
  const evidenceUpload = useMemo(
    () => ({ ...DEFAULT_EVIDENCE_UPLOAD, ...settings.evidenceUpload }),
    [settings.evidenceUpload],
  );
  const ai = useMemo(() => ({ ...DEFAULT_AI, ...settings.ai }), [settings.ai]);
  const storage = useMemo(() => ({ ...DEFAULT_STORAGE, ...settings.storage }), [settings.storage]);
  const taxonomy = useMemo(() => ({ ...DEFAULT_TAXONOMY, ...settings.taxonomy }), [settings.taxonomy]);
  const quiz = useMemo(() => ({ ...DEFAULT_QUIZ, ...settings.quiz }), [settings.quiz]);

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

  // Categories management
  const handleAddCategory = useCallback(() => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: '',
      color: '#6B7280',
      sortOrder: (taxonomy.skillCategories?.length ?? 0) + 1,
    };
    const newList = [...(taxonomy.skillCategories ?? []), newCat];
    setSettings((prev) => ({ ...prev, taxonomy: { ...taxonomy, skillCategories: newList } }));
  }, [taxonomy]);

  const handleUpdateCategory = useCallback(
    (id: string, updates: Partial<SkillCategory>) => {
      const newList = (taxonomy.skillCategories ?? []).map((c) => (c.id === id ? { ...c, ...updates } : c));
      setSettings((prev) => ({ ...prev, taxonomy: { ...taxonomy, skillCategories: newList } }));
    },
    [taxonomy],
  );

  const handleRemoveCategory = useCallback(
    (id: string) => {
      const newList = (taxonomy.skillCategories ?? []).filter((c) => c.id !== id);
      setSettings((prev) => ({ ...prev, taxonomy: { ...taxonomy, skillCategories: newList } }));
    },
    [taxonomy],
  );

  const handleResetCategories = useCallback(() => {
    setSettings((prev) => ({ ...prev, taxonomy: DEFAULT_TAXONOMY }));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      tenantSlug,
      tenantName: name,
      tenantDescription: description,
      settings,
      features,
      skillMatching,
      processing,
      ui,
      bulkImport,
      evidenceUpload,
      ai,
      storage,
      taxonomy,
      quiz,
      name,
      description,
      isPending,
      saveStatus,
      setName,
      setDescription,
      setSettings,
      handleSave,
      handleAddCategory,
      handleUpdateCategory,
      handleRemoveCategory,
      handleResetCategories,
    }),
    [
      tenantSlug,
      name,
      description,
      settings,
      features,
      skillMatching,
      processing,
      ui,
      bulkImport,
      evidenceUpload,
      ai,
      storage,
      taxonomy,
      quiz,
      isPending,
      saveStatus,
      handleSave,
      handleAddCategory,
      handleUpdateCategory,
      handleRemoveCategory,
      handleResetCategories,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
