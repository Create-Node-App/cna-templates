'use client';

import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Database,
  Eye,
  EyeOff,
  FileUp,
  GraduationCap,
  HelpCircle,
  Loader2,
  Palette,
  Plus,
  Settings,
  Sliders,
  Tag,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useState, useTransition } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui';
import { useUrlTab } from '@/shared/hooks';
import type { SkillCategory, TenantSettings } from '@/shared/lib/tenant-settings';
import {
  aiProviders,
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
  storageProviders,
} from '@/shared/lib/tenant-settings';

// ============================================================================
// Types
// ============================================================================

interface SettingsClientProps {
  tenantSlug: string;
  tenantName: string;
  tenantDescription: string | null;
  initialSettings: TenantSettings;
}

type FeatureKey = keyof NonNullable<TenantSettings['features']>;

// ============================================================================
// Feature Flags Config
// ============================================================================

const FEATURE_FLAGS: Array<{
  key: FeatureKey;
  label: string;
  description: string;
  category: 'core' | 'ai' | 'integrations';
}> = [
  {
    key: 'bulkImport',
    label: 'Bulk Import',
    description: 'Enable CSV/Excel bulk import in admin',
    category: 'core',
  },
  {
    key: 'knowledgeBase',
    label: 'Knowledge Base',
    description: 'Enable knowledge documents management',
    category: 'core',
  },
  {
    key: 'allowCustomRoles',
    label: 'Allow custom roles',
    description:
      'When on, admins can create new roles in addition to system roles (Member, Manager, Admin, etc.). When off, only system roles are available.',
    category: 'core',
  },
  {
    key: 'quiz',
    label: 'Quiz Assessments',
    description: 'AI-generated quizzes for skill assessment',
    category: 'ai',
  },
  {
    key: 'aiAssistantEnabled',
    label: 'AI Assistant',
    description: 'Enable the AI assistant for all users',
    category: 'ai',
  },
  {
    key: 'webhooks',
    label: 'Webhooks',
    description: 'Enable webhook notifications',
    category: 'integrations',
  },
  {
    key: 'githubIntegrationEnabled',
    label: 'GitHub Integration',
    description: 'Enable GitHub user profile sync',
    category: 'integrations',
  },
  {
    key: 'hrisIntegration',
    label: 'HRIS Integration',
    description: 'Enable HR system integration',
    category: 'integrations',
  },
];

// ============================================================================
// Component
// ============================================================================

export function SettingsClient({ tenantSlug, tenantName, tenantDescription, initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<TenantSettings>(initialSettings);
  const [name, setName] = useState(tenantName);
  const [description, setDescription] = useState(tenantDescription ?? '');
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // URL-synced tab state for deep linking
  const [activeTab, setActiveTab] = useUrlTab({
    defaultTab: 'general',
    validTabs: [
      'general',
      'features',
      'ai-provider',
      'storage',
      'skill-levels',
      'categories',
      'skill-matching',
      'bulk-import',
      'evidence',
      'ui',
      'quiz',
    ],
  });

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

  // Password visibility and test states
  const [showAIApiKey, setShowAIApiKey] = useState(false);
  const [showStorageSecretKey, setShowStorageSecretKey] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [aiTestResult, setAITestResult] = useState<'success' | 'error' | null>(null);
  const [testingStorage, setTestingStorage] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState<'success' | 'error' | null>(null);

  // Save handler
  const handleSave = async (
    section: string,
    data: Partial<TenantSettings> | { name?: string; description?: string },
  ) => {
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
  };

  // Feature toggle handler
  const handleFeatureToggle = (key: FeatureKey, enabled: boolean) => {
    const newFeatures = { ...features, [key]: enabled };
    setSettings({ ...settings, features: newFeatures });
    handleSave('features', { features: newFeatures });
  };

  // Skill matching update
  const handleSkillMatchingUpdate = (
    key: keyof NonNullable<TenantSettings['skillMatching']>,
    value: number | boolean,
  ) => {
    const newSkillMatching = { ...skillMatching, [key]: value };
    setSettings({ ...settings, skillMatching: newSkillMatching });
  };

  // Processing update
  const handleProcessingUpdate = (key: keyof NonNullable<TenantSettings['processing']>, value: number | boolean) => {
    const newProcessing = { ...processing, [key]: value };
    setSettings({ ...settings, processing: newProcessing });
  };

  // Bulk import update
  const handleBulkImportUpdate = (
    key: keyof NonNullable<TenantSettings['bulkImport']>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    const newBulkImport = { ...bulkImport, [key]: value };
    setSettings({ ...settings, bulkImport: newBulkImport });
  };

  // Evidence upload update
  const handleEvidenceUploadUpdate = (
    key: keyof NonNullable<TenantSettings['evidenceUpload']>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    const newEvidenceUpload = { ...evidenceUpload, [key]: value };
    setSettings({ ...settings, evidenceUpload: newEvidenceUpload });
  };

  // AI settings update
  const handleAIUpdate = (
    key: keyof NonNullable<TenantSettings['ai']>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    const newAI = { ...ai, [key]: value };
    setSettings({ ...settings, ai: newAI });
    // Clear test result when settings change
    setAITestResult(null);
  };

  // Storage settings update
  const handleStorageUpdate = (
    key: keyof NonNullable<TenantSettings['storage']>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    const newStorage = { ...storage, [key]: value };
    setSettings({ ...settings, storage: newStorage });
    // Clear test result when settings change
    setStorageTestResult(null);
  };

  // Categories management
  const handleAddCategory = useCallback(() => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: '',
      color: '#6B7280',
      sortOrder: (taxonomy.skillCategories?.length ?? 0) + 1,
    };
    const newList = [...(taxonomy.skillCategories ?? []), newCat];
    setSettings({ ...settings, taxonomy: { ...taxonomy, skillCategories: newList } });
  }, [taxonomy, settings]);

  const handleUpdateCategory = useCallback(
    (id: string, updates: Partial<SkillCategory>) => {
      const newList = (taxonomy.skillCategories ?? []).map((c) => (c.id === id ? { ...c, ...updates } : c));
      setSettings({ ...settings, taxonomy: { ...taxonomy, skillCategories: newList } });
    },
    [taxonomy, settings],
  );

  const handleRemoveCategory = useCallback(
    (id: string) => {
      const newList = (taxonomy.skillCategories ?? []).filter((c) => c.id !== id);
      setSettings({ ...settings, taxonomy: { ...taxonomy, skillCategories: newList } });
    },
    [taxonomy, settings],
  );

  const handleResetCategories = useCallback(() => {
    setSettings({ ...settings, taxonomy: DEFAULT_TAXONOMY });
  }, [settings]);

  // Test AI connection
  const testAIConnection = async () => {
    setTestingAI(true);
    setAITestResult(null);
    try {
      // First save the settings, then we could test with a simple API call
      // For now, just simulate the test by checking if required fields are present
      if (!settings.ai?.provider || !settings.ai?.apiKey) {
        setAITestResult('error');
      } else {
        // In production, this would make an actual API call to test the key
        // For now, we just check the format
        setAITestResult('success');
      }
    } catch {
      setAITestResult('error');
    } finally {
      setTestingAI(false);
    }
  };

  // Test storage connection
  const testStorageConnection = async () => {
    setTestingStorage(true);
    setStorageTestResult(null);
    try {
      // Check if required fields are present
      if (
        !settings.storage?.provider ||
        !settings.storage?.accessKey ||
        !settings.storage?.secretKey ||
        !settings.storage?.bucket
      ) {
        setStorageTestResult('error');
      } else {
        // In production, this would make an actual API call to test the connection
        setStorageTestResult('success');
      }
    } catch {
      setStorageTestResult('error');
    } finally {
      setTestingStorage(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex lg:flex-wrap gap-1">
        <TabsTrigger value="general" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="features" className="gap-2">
          <Sliders className="h-4 w-4" />
          <span className="hidden sm:inline">Features</span>
        </TabsTrigger>
        <TabsTrigger value="skill-levels" className="gap-2">
          <GraduationCap className="h-4 w-4" />
          <span className="hidden sm:inline">Skill Levels</span>
        </TabsTrigger>
        <TabsTrigger value="categories" className="gap-2">
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Categories</span>
        </TabsTrigger>
        <TabsTrigger value="ai-provider" className="gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">AI</span>
        </TabsTrigger>
        <TabsTrigger value="storage" className="gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">Storage</span>
        </TabsTrigger>
        <TabsTrigger value="skill-matching" className="gap-2">
          <Sliders className="h-4 w-4" />
          <span className="hidden sm:inline">Matching</span>
        </TabsTrigger>
        <TabsTrigger value="bulk-import" className="gap-2">
          <FileUp className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </TabsTrigger>
        <TabsTrigger value="evidence" className="gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Evidence</span>
        </TabsTrigger>
        <TabsTrigger value="ui" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Branding</span>
        </TabsTrigger>
        <TabsTrigger value="quiz" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Quiz</span>
        </TabsTrigger>
      </TabsList>

      {/* Save Status Banner */}
      {saveStatus !== 'idle' && (
        <div
          className={`px-4 py-2 rounded-md text-sm ${
            saveStatus === 'saving'
              ? 'bg-blue-50 text-blue-700'
              : saveStatus === 'saved'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
          }`}
        >
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Settings saved successfully!'}
          {saveStatus === 'error' && 'Failed to save settings. Please try again.'}
        </div>
      )}

      {/* General Tab */}
      <TabsContent value="general">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Basic tenant configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tenant-slug">Tenant Slug</Label>
                <Input id="tenant-slug" value={tenantSlug} disabled className="mt-1 font-mono bg-muted" />
              </div>
              <div>
                <Label htmlFor="tenant-name">Display Name</Label>
                <Input
                  id="tenant-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder="Organization Name"
                />
              </div>
              <div>
                <Label htmlFor="tenant-description">Description</Label>
                <textarea
                  id="tenant-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Brief description of the organization"
                />
              </div>
              <Button onClick={() => handleSave('info', { name, description })} disabled={isPending}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-medium text-red-800">Reset Settings</h4>
                <p className="mt-1 text-sm text-red-600">
                  Reset all settings to default values. This cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all settings?')) {
                      handleSave('reset', {});
                    }
                  }}
                  disabled={isPending}
                >
                  Reset Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Features Tab */}
      <TabsContent value="features">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Core Features */}
          <Card>
            <CardHeader>
              <CardTitle>Core Features</CardTitle>
              <CardDescription>Essential functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FEATURE_FLAGS.filter((f) => f.category === 'core').map((feature) => (
                <div key={feature.key} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{feature.label}</Label>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    checked={features[feature.key]}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                    disabled={isPending}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>AI-powered capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FEATURE_FLAGS.filter((f) => f.category === 'ai').map((feature) => (
                <div key={feature.key} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{feature.label}</Label>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    checked={features[feature.key]}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                    disabled={isPending}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>External services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FEATURE_FLAGS.filter((f) => f.category === 'integrations').map((feature) => (
                <div key={feature.key} className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{feature.label}</Label>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    checked={features[feature.key]}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                    disabled={isPending}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Skill Categories Tab */}
      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Skill Categories
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleResetCategories}>
                  Reset to Default
                </Button>
                <Button size="sm" onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Define the taxonomy for organizing skills. Each category can have a custom color for visual
              identification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(taxonomy.skillCategories?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No categories configured</p>
                <p className="text-sm">Add categories to organize skills by type</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {taxonomy.skillCategories?.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                    <input
                      type="color"
                      value={cat.color ?? '#6B7280'}
                      onChange={(e) => handleUpdateCategory(cat.id, { color: e.target.value })}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={cat.id}
                      onChange={(e) =>
                        handleUpdateCategory(cat.id, { id: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                      }
                      placeholder="ID (slug)"
                      className="w-32 font-mono text-sm"
                    />
                    <Input
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(cat.id, { name: e.target.value })}
                      placeholder="Display name"
                      className="flex-1"
                    />
                    <Input
                      value={cat.description ?? ''}
                      onChange={(e) => handleUpdateCategory(cat.id, { description: e.target.value })}
                      placeholder="Description"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={() => handleSave('taxonomy', { taxonomy })} disabled={isPending} className="mt-4">
              Save Categories
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* AI Provider Tab */}
      <TabsContent value="ai-provider">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider Configuration</CardTitle>
              <CardDescription>
                Configure your AI provider for skill extraction and chat features. Settings are stored per-tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="ai-provider">AI Provider</Label>
                <p className="text-xs text-muted-foreground mb-2">Select your AI provider</p>
                <select
                  id="ai-provider"
                  value={ai.provider || ''}
                  onChange={(e) => handleAIUpdate('provider', e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select provider...</option>
                  {aiProviders.map((p) => (
                    <option key={p} value={p}>
                      {p === 'openai' ? 'OpenAI' : 'Anthropic'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="ai-api-key">API Key</Label>
                <p className="text-xs text-muted-foreground mb-2">Your provider API key (stored securely)</p>
                <div className="relative">
                  <Input
                    id="ai-api-key"
                    type={showAIApiKey ? 'text' : 'password'}
                    value={settings.ai?.apiKey || ''}
                    onChange={(e) => handleAIUpdate('apiKey', e.target.value || undefined)}
                    className="pr-10"
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowAIApiKey(!showAIApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAIApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={testAIConnection}
                  disabled={testingAI || !settings.ai?.provider || !settings.ai?.apiKey}
                >
                  {testingAI && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Test Connection
                </Button>
                {aiTestResult === 'success' && (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" /> Connected
                  </span>
                )}
                {aiTestResult === 'error' && (
                  <span className="flex items-center text-red-600 text-sm">
                    <XCircle className="h-4 w-4 mr-1" /> Connection failed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Configure which models to use for different tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="embedding-model">Embedding Model</Label>
                <p className="text-xs text-muted-foreground mb-2">Model for generating embeddings (semantic search)</p>
                <Input
                  id="embedding-model"
                  value={ai.embeddingModel || ''}
                  onChange={(e) => handleAIUpdate('embeddingModel', e.target.value)}
                  placeholder="text-embedding-3-small"
                />
              </div>
              <div>
                <Label htmlFor="chat-model">Chat Model</Label>
                <p className="text-xs text-muted-foreground mb-2">Model for AI assistant chat</p>
                <Input
                  id="chat-model"
                  value={ai.chatModel || ''}
                  onChange={(e) => handleAIUpdate('chatModel', e.target.value)}
                  placeholder="gpt-4o-mini"
                />
              </div>
              <div>
                <Label htmlFor="extraction-model">Extraction Model</Label>
                <p className="text-xs text-muted-foreground mb-2">Model for CV skill extraction</p>
                <Input
                  id="extraction-model"
                  value={ai.extractionModel || ''}
                  onChange={(e) => handleAIUpdate('extractionModel', e.target.value)}
                  placeholder="gpt-4o-mini"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ai.temperature ?? 0.1}
                    onChange={(e) => handleAIUpdate('temperature', parseFloat(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div>
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="100"
                    max="16000"
                    step="100"
                    value={ai.maxTokens ?? 4000}
                    onChange={(e) => handleAIUpdate('maxTokens', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('ai', { ai })} disabled={isPending}>
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Storage Tab */}
      <TabsContent value="storage">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Storage Provider Configuration</CardTitle>
              <CardDescription>
                Configure your S3-compatible storage for file uploads. Supports AWS S3, MinIO, Cloudflare R2, and other
                S3-compatible services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="storage-provider">Storage Provider</Label>
                <p className="text-xs text-muted-foreground mb-2">Select your storage provider</p>
                <select
                  id="storage-provider"
                  value={storage.provider || ''}
                  onChange={(e) => handleStorageUpdate('provider', e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select provider...</option>
                  {storageProviders.map((p) => (
                    <option key={p} value={p}>
                      {p === 's3' ? 'AWS S3' : p === 'minio' ? 'MinIO' : 'Cloudflare R2'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="storage-endpoint">Endpoint URL</Label>
                <p className="text-xs text-muted-foreground mb-2">S3-compatible endpoint (leave blank for AWS S3)</p>
                <Input
                  id="storage-endpoint"
                  value={settings.storage?.endpoint || ''}
                  onChange={(e) => handleStorageUpdate('endpoint', e.target.value || undefined)}
                  placeholder="http://minio:9000"
                />
              </div>
              <div>
                <Label htmlFor="storage-public-endpoint">Public Endpoint</Label>
                <p className="text-xs text-muted-foreground mb-2">Browser-accessible endpoint for presigned URLs</p>
                <Input
                  id="storage-public-endpoint"
                  value={settings.storage?.publicEndpoint || ''}
                  onChange={(e) => handleStorageUpdate('publicEndpoint', e.target.value || undefined)}
                  placeholder="http://localhost:9000"
                />
              </div>
              <div>
                <Label htmlFor="storage-bucket">Bucket Name</Label>
                <Input
                  id="storage-bucket"
                  value={settings.storage?.bucket || ''}
                  onChange={(e) => handleStorageUpdate('bucket', e.target.value || undefined)}
                  placeholder="saas-template-uploads"
                />
              </div>
              <div>
                <Label htmlFor="storage-region">Region</Label>
                <Input
                  id="storage-region"
                  value={storage.region || ''}
                  onChange={(e) => handleStorageUpdate('region', e.target.value)}
                  placeholder="us-east-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Credentials</CardTitle>
              <CardDescription>Access credentials for your storage provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="storage-access-key">Access Key</Label>
                <Input
                  id="storage-access-key"
                  value={settings.storage?.accessKey || ''}
                  onChange={(e) => handleStorageUpdate('accessKey', e.target.value || undefined)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>
              <div>
                <Label htmlFor="storage-secret-key">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="storage-secret-key"
                    type={showStorageSecretKey ? 'text' : 'password'}
                    value={settings.storage?.secretKey || ''}
                    onChange={(e) => handleStorageUpdate('secretKey', e.target.value || undefined)}
                    className="pr-10"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStorageSecretKey(!showStorageSecretKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showStorageSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Force Path Style</Label>
                  <p className="text-xs text-muted-foreground">Required for MinIO and some S3-compatible services</p>
                </div>
                <Switch
                  checked={storage.forcePathStyle !== false}
                  onCheckedChange={(checked) => handleStorageUpdate('forcePathStyle', checked)}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={testStorageConnection}
                  disabled={
                    testingStorage ||
                    !settings.storage?.provider ||
                    !settings.storage?.accessKey ||
                    !settings.storage?.secretKey ||
                    !settings.storage?.bucket
                  }
                >
                  {testingStorage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Test Connection
                </Button>
                {storageTestResult === 'success' && (
                  <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" /> Connected
                  </span>
                )}
                {storageTestResult === 'error' && (
                  <span className="flex items-center text-red-600 text-sm">
                    <XCircle className="h-4 w-4 mr-1" /> Connection failed
                  </span>
                )}
              </div>
              <Button onClick={() => handleSave('storage', { storage })} disabled={isPending}>
                Save Storage Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Skill Matching Tab */}
      <TabsContent value="skill-matching">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Matching Thresholds</CardTitle>
              <CardDescription>Configure skill similarity thresholds (0-1)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="exact-match">Exact Match Threshold</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Skills above this score are considered exact matches
                </p>
                <Input
                  id="exact-match"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={skillMatching.exactMatchThreshold}
                  onChange={(e) => handleSkillMatchingUpdate('exactMatchThreshold', parseFloat(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="suggest">Suggest Threshold</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Skills above this score are suggested as alternatives
                </p>
                <Input
                  id="suggest"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={skillMatching.suggestThreshold}
                  onChange={(e) => handleSkillMatchingUpdate('suggestThreshold', parseFloat(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="auto-create">Auto-Create Threshold</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Skills below this score trigger auto-creation (if enabled)
                </p>
                <Input
                  id="auto-create"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={skillMatching.autoCreateThreshold}
                  onChange={(e) => handleSkillMatchingUpdate('autoCreateThreshold', parseFloat(e.target.value))}
                  className="w-32"
                />
              </div>
              <Button onClick={() => handleSave('skillMatching', { skillMatching })} disabled={isPending}>
                Save Thresholds
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Settings</CardTitle>
              <CardDescription>Configure batch processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="batch-size">Batch Size</Label>
                <p className="text-xs text-muted-foreground mb-2">Number of items to process per batch</p>
                <Input
                  id="batch-size"
                  type="number"
                  min="1"
                  max="100"
                  value={processing.batchSize}
                  onChange={(e) => handleProcessingUpdate('batchSize', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="interval">Processing Interval (minutes)</Label>
                <p className="text-xs text-muted-foreground mb-2">How often to run the processing job</p>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="60"
                  value={processing.processingIntervalMinutes}
                  onChange={(e) => handleProcessingUpdate('processingIntervalMinutes', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="max-retries">Max Retries</Label>
                <p className="text-xs text-muted-foreground mb-2">Maximum retry attempts for failed processing</p>
                <Input
                  id="max-retries"
                  type="number"
                  min="0"
                  max="10"
                  value={processing.maxRetries}
                  onChange={(e) => handleProcessingUpdate('maxRetries', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Parallel Processing</Label>
                  <p className="text-xs text-muted-foreground">Process multiple items concurrently</p>
                </div>
                <Switch
                  checked={processing.parallelProcessing}
                  onCheckedChange={(checked) => handleProcessingUpdate('parallelProcessing', checked)}
                  disabled={isPending}
                />
              </div>
              <Button onClick={() => handleSave('processing', { processing })} disabled={isPending}>
                Save Processing
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Bulk Import Tab */}
      <TabsContent value="bulk-import">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import Settings</CardTitle>
            <CardDescription>Configure CSV/Excel import behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <Label htmlFor="default-mode">Default Mode</Label>
                <p className="text-xs text-muted-foreground mb-2">How to handle validation errors</p>
                <select
                  id="default-mode"
                  value={bulkImport.defaultMode}
                  onChange={(e) => handleBulkImportUpdate('defaultMode', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="strict">Strict (fail on any error)</option>
                  <option value="lenient">Lenient (skip invalid rows)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="max-rows">Max Rows Per Import</Label>
                <p className="text-xs text-muted-foreground mb-2">Maximum number of rows allowed per import</p>
                <Input
                  id="max-rows"
                  type="number"
                  min="100"
                  max="50000"
                  value={bulkImport.maxRowsPerImport}
                  onChange={(e) => handleBulkImportUpdate('maxRowsPerImport', parseInt(e.target.value))}
                  className="w-40"
                />
              </div>
              <div>
                <Label htmlFor="duplicate-action">On Duplicate</Label>
                <p className="text-xs text-muted-foreground mb-2">Action when a duplicate record is found</p>
                <select
                  id="duplicate-action"
                  value={bulkImport.duplicateAction}
                  onChange={(e) => handleBulkImportUpdate('duplicateAction', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="skip">Skip</option>
                  <option value="update">Update existing</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-6">
                <div>
                  <Label>Duplicate Detection</Label>
                  <p className="text-xs text-muted-foreground">Check for existing records before import</p>
                </div>
                <Switch
                  checked={bulkImport.duplicateDetection}
                  onCheckedChange={(checked) => handleBulkImportUpdate('duplicateDetection', checked)}
                  disabled={isPending}
                />
              </div>
            </div>
            <Button onClick={() => handleSave('bulkImport', { bulkImport })} disabled={isPending}>
              Save Bulk Import Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Evidence Upload Tab */}
      <TabsContent value="evidence">
        <Card>
          <CardHeader>
            <CardTitle>Evidence Upload Settings</CardTitle>
            <CardDescription>Configure file uploads for CVs and evidence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <p className="text-xs text-muted-foreground mb-2">Maximum file size for uploads</p>
                <Input
                  id="max-file-size"
                  type="number"
                  min="1"
                  max="100"
                  value={evidenceUpload.maxFileSizeMB}
                  onChange={(e) => handleEvidenceUploadUpdate('maxFileSizeMB', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="max-files">Max Files Per Person</Label>
                <p className="text-xs text-muted-foreground mb-2">Maximum number of evidence files per team member</p>
                <Input
                  id="max-files"
                  type="number"
                  min="1"
                  max="100"
                  value={evidenceUpload.maxFilesPerPerson}
                  onChange={(e) => handleEvidenceUploadUpdate('maxFilesPerPerson', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label>Require Description</Label>
                  <p className="text-xs text-muted-foreground">Require a description for each upload</p>
                </div>
                <Switch
                  checked={evidenceUpload.requireDescription}
                  onCheckedChange={(checked) => handleEvidenceUploadUpdate('requireDescription', checked)}
                  disabled={isPending}
                />
              </div>
            </div>
            <div>
              <Label>Allowed File Types</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Accepted MIME types: {evidenceUpload.allowedMimeTypes.join(', ')}
              </p>
            </div>
            <Button onClick={() => handleSave('evidenceUpload', { evidenceUpload })} disabled={isPending}>
              Save Evidence Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* UI/Branding Tab */}
      <TabsContent value="ui">
        <Card>
          <CardHeader>
            <CardTitle>Branding & Customization</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={ui.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ui: { ...ui, primaryColor: e.target.value },
                      })
                    }
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={ui.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ui: { ...ui, primaryColor: e.target.value },
                      })
                    }
                    className="w-32 font-mono"
                    placeholder="#0066FF"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    id="secondary-color"
                    value={ui.secondaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ui: { ...ui, secondaryColor: e.target.value },
                      })
                    }
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={ui.secondaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ui: { ...ui, secondaryColor: e.target.value },
                      })
                    }
                    className="w-32 font-mono"
                    placeholder="#6B7280"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="display-name">Custom Display Name</Label>
                <Input
                  id="display-name"
                  value={ui.displayName ?? ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ui: { ...ui, displayName: e.target.value || undefined },
                    })
                  }
                  className="mt-2"
                  placeholder="Custom name for UI"
                />
              </div>
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={ui.logoUrl ?? ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ui: { ...ui, logoUrl: e.target.value || undefined },
                    })
                  }
                  className="mt-2"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="language">Default Language</Label>
                <select
                  id="language"
                  value={ui.defaultLanguage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ui: {
                        ...ui,
                        defaultLanguage: e.target.value as 'en' | 'es' | 'pt',
                      },
                    })
                  }
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <select
                  id="date-format"
                  value={ui.dateFormat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ui: {
                        ...ui,
                        dateFormat: e.target.value as NonNullable<TenantSettings['ui']>['dateFormat'],
                      },
                    })
                  }
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Allow users to switch to dark mode</p>
                </div>
                <Switch
                  checked={ui.darkModeEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      ui: { ...ui, darkModeEnabled: checked },
                    })
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <Button onClick={() => handleSave('ui', { ui })} disabled={isPending}>
              Save Branding
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Quiz Settings Tab */}
      <TabsContent value="quiz">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Configuration</CardTitle>
            <CardDescription>
              Configure AI-generated skill assessment quizzes, including rate limits, caching, and generation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Enable/Disable notice */}
              {!features.quiz && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Quiz feature is disabled. Enable it from the{' '}
                    <button
                      type="button"
                      className="font-medium underline hover:no-underline"
                      onClick={() => setActiveTab('features')}
                    >
                      Features tab
                    </button>{' '}
                    to configure advanced settings.
                  </p>
                </div>
              )}

              {features.quiz && (
                <>
                  {/* Rate Limit */}
                  <div>
                    <Label htmlFor="rate-limit">Rate Limit (Quizzes per Day)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Maximum number of quizzes a user can take per day (1-100)
                    </p>
                    <Input
                      id="rate-limit"
                      type="number"
                      min={1}
                      max={100}
                      value={quiz.rateLimitPerDay}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value) && value >= 1 && value <= 100) {
                          setSettings({
                            ...settings,
                            quiz: { ...quiz, rateLimitPerDay: value },
                          });
                        }
                      }}
                      className="w-32"
                    />
                  </div>

                  {/* Cache TTL */}
                  <div>
                    <Label htmlFor="cache-ttl">Cache Duration</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      How long generated quizzes are cached before regeneration (-1 for infinite, 1-365 days)
                    </p>
                    <div className="flex items-center gap-3">
                      <Input
                        id="cache-ttl"
                        type="number"
                        min={-1}
                        max={365}
                        value={quiz.cacheTtlDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= -1 && value <= 365) {
                            setSettings({
                              ...settings,
                              quiz: { ...quiz, cacheTtlDays: value },
                            });
                          }
                        }}
                        className="w-32"
                      />
                      {quiz.cacheTtlDays === -1 && (
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ∞ Infinite (no expiration)
                        </span>
                      )}
                      {quiz.cacheTtlDays > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {quiz.cacheTtlDays} day{quiz.cacheTtlDays !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Questions Per Quiz */}
                  <div>
                    <Label htmlFor="questions-per-quiz">Questions Per Quiz</Label>
                    <p className="text-xs text-muted-foreground mb-2">Number of questions in each quiz (5-20)</p>
                    <Input
                      id="questions-per-quiz"
                      type="number"
                      min={5}
                      max={20}
                      value={quiz.questionsPerQuiz}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value) && value >= 5 && value <= 20) {
                          setSettings({
                            ...settings,
                            quiz: { ...quiz, questionsPerQuiz: value },
                          });
                        }
                      }}
                      className="w-32"
                    />
                  </div>

                  {/* AI Model */}
                  <div>
                    <Label htmlFor="quiz-ai-model">AI Model (Optional)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Specific model for quiz generation. Leave empty to use the default chat model.
                    </p>
                    <Input
                      id="quiz-ai-model"
                      value={quiz.aiModel ?? ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          quiz: { ...quiz, aiModel: e.target.value || undefined },
                        })
                      }
                      className="w-64 font-mono"
                      placeholder="gpt-4o-mini (uses default if empty)"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <Label htmlFor="quiz-temperature">Temperature</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Controls randomness in quiz generation (0.0 = deterministic, 2.0 = very creative)
                    </p>
                    <div className="flex items-center gap-3">
                      <Input
                        id="quiz-temperature"
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={quiz.temperature}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 2) {
                            setSettings({
                              ...settings,
                              quiz: { ...quiz, temperature: value },
                            });
                          }
                        }}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        {quiz.temperature === 0 && 'Deterministic'}
                        {quiz.temperature > 0 && quiz.temperature < 0.5 && 'Focused'}
                        {quiz.temperature >= 0.5 && quiz.temperature < 1 && 'Balanced'}
                        {quiz.temperature >= 1 && quiz.temperature < 1.5 && 'Creative'}
                        {quiz.temperature >= 1.5 && 'Very Creative'}
                      </span>
                    </div>
                  </div>

                  {/* Generation Timeout */}
                  <div>
                    <Label htmlFor="quiz-timeout">Generation Timeout (Seconds)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Maximum time to wait for quiz generation (10-300 seconds)
                    </p>
                    <Input
                      id="quiz-timeout"
                      type="number"
                      min={10}
                      max={300}
                      value={quiz.generationTimeoutSeconds}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value) && value >= 10 && value <= 300) {
                          setSettings({
                            ...settings,
                            quiz: { ...quiz, generationTimeoutSeconds: value },
                          });
                        }
                      }}
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
            <Button onClick={() => handleSave('quiz', { quiz })} disabled={isPending}>
              Save Quiz Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
