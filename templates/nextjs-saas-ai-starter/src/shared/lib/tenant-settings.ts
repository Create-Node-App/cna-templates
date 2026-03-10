import { z } from 'zod';

// ============================================================================
// Feature Flags Schema
// ============================================================================

export const featureFlagsSchema = z.object({
  /** Enable bulk import functionality in admin */
  bulkImport: z.boolean().optional().default(true),
  /** Enable knowledge base features */
  knowledgeBase: z.boolean().optional().default(true),
  /** Enable AI-generated quiz assessments */
  quiz: z.boolean().optional().default(true),
  /** Enable webhook notifications */
  webhooks: z.boolean().optional().default(false),
  /** Enable HRIS integration */
  hrisIntegration: z.boolean().optional().default(false),
  /** When on, admins can create new roles in addition to system roles. */
  allowCustomRoles: z.boolean().optional().default(true),
  /** Enable GitHub integration */
  githubIntegrationEnabled: z.boolean().optional().default(true),
  /** Enable AI assistant */
  aiAssistantEnabled: z.boolean().optional().default(true),
});

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

// ============================================================================
// Skill Matching Schema
// ============================================================================

export const skillMatchingSchema = z.object({
  /** Threshold for exact skill match (0-1) */
  exactMatchThreshold: z.number().min(0).max(1).optional().default(0.92),
  /** Threshold for suggesting similar skills (0-1) */
  suggestThreshold: z.number().min(0).max(1).optional().default(0.75),
  /** Threshold below which to auto-create new skills (0-1) */
  autoCreateThreshold: z.number().min(0).max(1).optional().default(0.75),
  /** Require admin approval for auto-created skills */
  requireApprovalForNewSkills: z.boolean().optional().default(true),
  /** Maximum number of skill suggestions to show */
  maxSuggestions: z.number().int().min(1).max(10).optional().default(5),
});

export type SkillMatchingSettings = z.infer<typeof skillMatchingSchema>;

// ============================================================================
// Processing Schema
// ============================================================================

export const processingSchema = z.object({
  /** Batch size for evidence processing */
  batchSize: z.number().int().min(1).max(100).optional().default(10),
  /** Processing interval in minutes */
  processingIntervalMinutes: z.number().int().min(1).max(60).optional().default(5),
  /** Maximum retries for failed processing */
  maxRetries: z.number().int().min(0).max(10).optional().default(3),
  /** Timeout for AI processing in seconds */
  aiTimeoutSeconds: z.number().int().min(10).max(300).optional().default(60),
  /** Enable parallel processing */
  parallelProcessing: z.boolean().optional().default(true),
});

export type ProcessingSettings = z.infer<typeof processingSchema>;

// ============================================================================
// UI Customization Schema
// ============================================================================

export const uiSchema = z.object({
  // --- Colors ---
  /** Primary brand color (hex). Used for buttons, links, focus rings, brand gradient start. */
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default('#4F5BD5'),
  /** Secondary brand color (hex). Used for secondary actions, brand gradient end. */
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default('#7C6EAF'),
  /** Accent/tertiary color (hex). Used for tertiary highlights and differentiation. */
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default('#2BA8A4'),

  // --- Surface & Neutral ---
  /** Neutral warmth controls the background hue undertone. */
  neutralWarmth: z.enum(['cool', 'neutral', 'warm', 'soft']).optional().default('warm'),
  /** Surface style: flat (no shadow), elevated (layered shadows), glass (backdrop-blur). */
  surfaceStyle: z.enum(['flat', 'elevated', 'glass']).optional().default('elevated'),

  // --- Shape ---
  /** Border radius preset. Controls the --radius CSS variable. */
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().default('lg'),

  // --- Typography ---
  /** Font family preset. */
  fontFamily: z.enum(['dm-sans', 'inter', 'open-sans', 'system']).optional().default('dm-sans'),

  // --- Density ---
  /** UI density. Affects spacing multiplier. */
  density: z.enum(['compact', 'default', 'comfortable']).optional().default('default'),

  // --- Brand signature ---
  /** When enabled, the brand gradient (primary -> secondary) is used on the logo and hero. */
  brandGradientEnabled: z.boolean().optional().default(true),

  // --- Existing ---
  /** Logo URL */
  logoUrl: z.string().url().optional(),
  /** Favicon URL */
  faviconUrl: z.string().url().optional(),
  /** Custom tenant display name */
  displayName: z.string().max(100).optional(),
  /** Enable dark mode */
  darkModeEnabled: z.boolean().optional().default(true),
  /** Default language */
  defaultLanguage: z.enum(['en', 'es', 'pt']).optional().default('en'),
  /** Date format preference */
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional().default('YYYY-MM-DD'),
});

export type UISettings = z.infer<typeof uiSchema>;

// ============================================================================
// Webhook Configuration Schema
// ============================================================================

export const webhookEventTypes = [
  // Person events
  'person.created',
  'person.updated',
  // Member events
  'member.invited',
  'member.joined',
  'member.deactivated',
  // Integration events
  'integration.synced',
  'integration.failed',
  // Bulk import events
  'bulk_import.completed',
  'bulk_import.failed',
] as const;

export type WebhookEventType = (typeof webhookEventTypes)[number];

export const webhookSchema = z.object({
  /** Unique identifier for the webhook */
  id: z.string().uuid(),
  /** Webhook name for identification */
  name: z.string().min(1).max(100),
  /** Target URL for webhook delivery */
  url: z.string().url(),
  /** Events that trigger this webhook */
  events: z.array(z.enum(webhookEventTypes)).min(1),
  /** Secret for HMAC signature verification */
  secret: z.string().min(16).optional(),
  /** Whether the webhook is active */
  enabled: z.boolean().optional().default(true),
  /** Custom headers to include */
  headers: z.record(z.string(), z.string()).optional(),
  /** Retry configuration */
  retryCount: z.number().int().min(0).max(5).optional().default(3),
});

export type WebhookConfig = z.infer<typeof webhookSchema>;

// ============================================================================
// Integrations Schema
// ============================================================================

/** Base schema for all integrations - provides common fields */
const integrationBaseSchema = z.object({
  /** Integration enabled for this tenant */
  enabled: z.boolean().optional().default(false),
  /** Timestamp when integration was enabled/disabled */
  enabledAt: z.string().datetime().optional(),
  /** Person ID who enabled/disabled the integration */
  enabledBy: z.string().uuid().optional(),
});

const hrisSchema = integrationBaseSchema.extend({
  provider: z.enum(['workday', 'adp', 'custom']).optional(),
  apiUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  syncIntervalHours: z.number().int().min(1).max(168).optional().default(24),
});

const ssoSchema = z.object({
  provider: z.enum(['okta', 'azure_ad', 'google', 'custom']).optional(),
  enabled: z.boolean().optional().default(false),
});

// ============================================================================
// Google Workspace Integration Schema
// ============================================================================

const googleWorkspaceSettingsSchema = integrationBaseSchema.extend({
  /**
   * OAuth2 Client ID for Google Workspace Calendar.
   */
  clientId: z.string().optional(),
  /**
   * OAuth2 Client Secret for Google Workspace Calendar.
   */
  clientSecret: z.string().optional(),
  /**
   * Default language for AI-generated meeting notes/context.
   * Examples: en-US, es-AR.
   */
  defaultMeetingLanguage: z.string().optional().default('en-US'),
  /**
   * Default calendar ID where meetings are created.
   * If omitted, uses the primary calendar.
   */
  defaultCalendarId: z.string().optional(),
  /**
   * Automatically create Google Meet conference links when creating meetings.
   */
  autoCreateMeetConference: z.boolean().optional().default(true),
  /**
   * Try to import Gemini/Meet-generated notes artifacts when available.
   */
  autoImportGeminiNotes: z.boolean().optional().default(true),
  /**
   * Auto-generate a meeting notes draft in Next.js SaaS AI Template from agenda + imported notes.
   */
  autoDraftMeetingNotes: z.boolean().optional().default(true),
  /**
   * Require manual approval before persisting auto-generated notes to meeting notes.
   */
  requireManualApprovalForAutoNotes: z.boolean().optional().default(true),
  /**
   * Retention policy for imported meeting artifacts (days).
   */
  artifactRetentionDays: z.number().int().min(1).max(3650).optional().default(180),
  /**
   * Persist raw artifact payloads. If false, only normalized content is stored.
   */
  persistArtifactRawContent: z.boolean().optional().default(true),
  /** Last sync timestamp */
  lastSyncAt: z.string().datetime().optional(),
});

export type GoogleWorkspaceSettings = z.infer<typeof googleWorkspaceSettingsSchema>;

// ============================================================================
// GitHub Integration Schema
// ============================================================================

const githubSettingsSchema = integrationBaseSchema.extend({
  /**
   * OAuth App Client ID for GitHub. If not set, falls back to GITHUB_INTEGRATION_CLIENT_ID env var.
   */
  clientId: z.string().optional(),
  /**
   * OAuth App Client Secret for GitHub. If not set, falls back to GITHUB_INTEGRATION_CLIENT_SECRET env var.
   */
  clientSecret: z.string().optional(),
  /** GitHub organization to scope syncing to (optional; if empty, syncs all accessible repos) */
  organizationFilter: z.string().optional(),
  /** Sync repositories and language stats */
  syncRepositories: z.boolean().optional().default(true),
  /** Track contribution stats (commits, PRs, reviews) */
  syncContributions: z.boolean().optional().default(true),
  /** Include archived repositories */
  includeArchived: z.boolean().optional().default(false),
  /** Include forked repositories */
  includeForks: z.boolean().optional().default(false),
  /** Number of days to look back for contributions */
  contributionDaysLookback: z.number().int().min(30).max(730).optional().default(365),
  /** Last sync timestamp */
  lastSyncAt: z.string().datetime().optional(),
});

export type GitHubSettings = z.infer<typeof githubSettingsSchema>;

// ============================================================================
// LinkedIn Integration Schema
// ============================================================================

const linkedinSettingsSchema = integrationBaseSchema.extend({
  /**
   * OAuth Client ID for LinkedIn. If not set, falls back to LINKEDIN_CLIENT_ID env var.
   * Create an app at https://www.linkedin.com/developers/apps
   */
  clientId: z.string().optional(),
  /**
   * OAuth Client Secret for LinkedIn. If not set, falls back to LINKEDIN_CLIENT_SECRET env var.
   */
  clientSecret: z.string().optional(),
  /** Automatically update avatar URL from LinkedIn profile picture when user connects */
  autoUpdateAvatar: z.boolean().optional().default(true),
  /** Automatically update locale from LinkedIn profile when user connects */
  autoUpdateLocale: z.boolean().optional().default(true),
});

export type LinkedInSettings = z.infer<typeof linkedinSettingsSchema>;

export const integrationsSchema = z.object({
  /** Configured webhooks */
  webhooks: z.array(webhookSchema).optional().default([]),
  /** HRIS integration settings (placeholder for future) */
  hris: hrisSchema.optional(),
  /** SSO configuration (placeholder for future) */
  sso: ssoSchema.optional(),
  /** Google Workspace integration settings */
  googleWorkspace: googleWorkspaceSettingsSchema.optional(),
  /** GitHub integration settings */
  github: githubSettingsSchema.optional(),
  /** LinkedIn integration settings */
  linkedin: linkedinSettingsSchema.optional(),
});

export type IntegrationsSettings = z.infer<typeof integrationsSchema>;

// ============================================================================
// Bulk Import Schema
// ============================================================================

export const bulkImportSchema = z.object({
  /** Default mode: strict (fail on error) or lenient (skip invalid rows) */
  defaultMode: z.enum(['strict', 'lenient']).optional().default('strict'),
  /** Maximum rows per import */
  maxRowsPerImport: z.number().int().min(100).max(50000).optional().default(10000),
  /** Allowed file types */
  allowedFileTypes: z
    .array(z.enum(['csv', 'xlsx']))
    .optional()
    .default(['csv']),
  /** Enable duplicate detection */
  duplicateDetection: z.boolean().optional().default(true),
  /** Action on duplicate: skip, update, or error */
  duplicateAction: z.enum(['skip', 'update', 'error']).optional().default('skip'),
});

export type BulkImportSettings = z.infer<typeof bulkImportSchema>;

// ============================================================================
// Evidence Upload Schema
// ============================================================================

export const evidenceUploadSchema = z.object({
  /** Maximum file size in MB */
  maxFileSizeMB: z.number().int().min(1).max(100).optional().default(25),
  /** Allowed MIME types */
  allowedMimeTypes: z
    .array(z.string())
    .optional()
    .default([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ]),
  /** Maximum files per person */
  maxFilesPerPerson: z.number().int().min(1).max(100).optional().default(50),
  /** Require description for uploads */
  requireDescription: z.boolean().optional().default(false),
});

export type EvidenceUploadSettings = z.infer<typeof evidenceUploadSchema>;

// ============================================================================
// Departments Schema (Tenant-configurable)
// ============================================================================

export const departmentSchema = z.object({
  /** Unique identifier for the department */
  id: z.string().min(1),
  /** Display name */
  name: z.string().min(1).max(100),
  /** Parent department ID for hierarchy */
  parentId: z.string().optional(),
  /** Optional description */
  description: z.string().max(500).optional(),
  /** Sort order for display */
  sortOrder: z.number().int().optional().default(0),
});

export const departmentsSchema = z.object({
  /** List of departments for this tenant */
  list: z.array(departmentSchema).optional().default([]),
});

export type Department = z.infer<typeof departmentSchema>;
export type DepartmentsSettings = z.infer<typeof departmentsSchema>;

// ============================================================================
// Skill Categories Schema (Tenant-configurable Taxonomy)
// ============================================================================

export const skillCategorySchema = z.object({
  /** Unique identifier (slug) */
  id: z.string().min(1).max(50),
  /** Display name */
  name: z.string().min(1).max(100),
  /** Optional description */
  description: z.string().max(500).optional(),
  /** Color for UI display (hex) */
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  /** Icon name (from lucide-react) */
  icon: z.string().optional(),
  /** Sort order for display */
  sortOrder: z.number().int().optional().default(0),
});

export const taxonomySchema = z.object({
  /** Custom skill categories for this tenant */
  skillCategories: z.array(skillCategorySchema).optional(),
});

export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type TaxonomySettings = z.infer<typeof taxonomySchema>;

// ============================================================================
// AI Provider Settings Schema
// ============================================================================

export const aiProviders = ['openai', 'anthropic'] as const;
export type AIProvider = (typeof aiProviders)[number];

export const aiSettingsSchema = z.object({
  /** AI provider to use */
  provider: z.enum(aiProviders).optional(),
  /** API key for the AI provider (encrypted in DB) */
  apiKey: z.string().optional(),
  /** Model for embeddings */
  embeddingModel: z.string().optional().default('text-embedding-3-small'),
  /** Model for chat completions */
  chatModel: z.string().optional().default('gpt-4o-mini'),
  /** Model for skill extraction from CVs */
  extractionModel: z.string().optional().default('gpt-4o-mini'),
  /** Temperature for chat/extraction */
  temperature: z.number().min(0).max(2).optional().default(0.1),
  /** Max tokens for responses */
  maxTokens: z.number().int().min(100).max(16000).optional().default(4000),
});

export type AISettings = z.infer<typeof aiSettingsSchema>;

// ============================================================================
// Storage Settings Schema
// ============================================================================

export const storageProviders = ['s3', 'minio', 'r2'] as const;
export type StorageProvider = (typeof storageProviders)[number];

export const storageSettingsSchema = z.object({
  /** Storage provider type */
  provider: z.enum(storageProviders).optional(),
  /** S3-compatible endpoint URL */
  endpoint: z.string().optional(),
  /** Public endpoint for browser-accessible presigned URLs */
  publicEndpoint: z.string().optional(),
  /** Access key ID */
  accessKey: z.string().optional(),
  /** Secret access key (encrypted in DB) */
  secretKey: z.string().optional(),
  /** Bucket name */
  bucket: z.string().optional(),
  /** AWS region */
  region: z.string().optional().default('us-east-1'),
  /** Use path-style URLs (required for MinIO) */
  forcePathStyle: z.boolean().optional().default(true),
});

export type StorageSettings = z.infer<typeof storageSettingsSchema>;

// ============================================================================
// Quiz Settings Schema
// ============================================================================

export const quizSettingsSchema = z.object({
  /** Enable quiz feature */
  enabled: z.boolean().optional().default(true),
  /** Maximum number of quizzes a user can take per day */
  rateLimitPerDay: z.number().int().min(1).max(100).optional().default(10),
  /** Number of days quiz cache is valid (-1 for infinite/no expiration) */
  cacheTtlDays: z.number().int().min(-1).max(365).optional().default(-1),
  /** Number of questions per quiz */
  questionsPerQuiz: z.number().int().min(5).max(20).optional().default(10),
  /** AI model to use for quiz generation (falls back to ai.chatModel if not set) */
  aiModel: z.string().optional(),
  /** Temperature for quiz generation (0-2) */
  temperature: z.number().min(0).max(2).optional().default(0.7),
  /** Timeout for quiz generation in seconds */
  generationTimeoutSeconds: z.number().int().min(10).max(300).optional().default(60),
});

export type QuizSettings = z.infer<typeof quizSettingsSchema>;

// ============================================================================
// Complete Tenant Settings Schema
// ============================================================================

export const tenantSettingsSchema = z.object({
  features: featureFlagsSchema.optional(),
  skillMatching: skillMatchingSchema.optional(),
  processing: processingSchema.optional(),
  ui: uiSchema.optional(),
  integrations: integrationsSchema.optional(),
  bulkImport: bulkImportSchema.optional(),
  evidenceUpload: evidenceUploadSchema.optional(),
  ai: aiSettingsSchema.optional(),
  storage: storageSettingsSchema.optional(),
  /** Tenant departments configuration */
  departments: departmentsSchema.optional(),
  /** Skill taxonomy (categories) configuration */
  taxonomy: taxonomySchema.optional(),
  /** Quiz configuration */
  quiz: quizSettingsSchema.optional(),
});

export type TenantSettings = z.infer<typeof tenantSettingsSchema>;

/**
 * Input type for TenantSettings - allows partial nested objects.
 * Use this type for function parameters that accept partial/incomplete settings.
 */
export type TenantSettingsInput = z.input<typeof tenantSettingsSchema>;

// ============================================================================
// Default Settings Values
// ============================================================================

export const DEFAULT_FEATURES: NonNullable<TenantSettings['features']> = {
  bulkImport: true,
  knowledgeBase: true,
  quiz: true,
  webhooks: false,
  hrisIntegration: false,
  allowCustomRoles: true,
  githubIntegrationEnabled: true,
  aiAssistantEnabled: true,
};

export const DEFAULT_SKILL_MATCHING: NonNullable<TenantSettings['skillMatching']> = {
  exactMatchThreshold: 0.92,
  suggestThreshold: 0.75,
  autoCreateThreshold: 0.75,
  requireApprovalForNewSkills: true,
  maxSuggestions: 5,
};

export const DEFAULT_PROCESSING: NonNullable<TenantSettings['processing']> = {
  batchSize: 10,
  processingIntervalMinutes: 5,
  maxRetries: 3,
  aiTimeoutSeconds: 60,
  parallelProcessing: true,
};

export const DEFAULT_UI: NonNullable<TenantSettings['ui']> = {
  primaryColor: '#4F5BD5',
  secondaryColor: '#7C6EAF',
  accentColor: '#2BA8A4',
  neutralWarmth: 'warm',
  surfaceStyle: 'elevated',
  borderRadius: 'lg',
  fontFamily: 'dm-sans',
  density: 'default',
  brandGradientEnabled: true,
  darkModeEnabled: true,
  defaultLanguage: 'en',
  dateFormat: 'YYYY-MM-DD',
};

export const DEFAULT_INTEGRATIONS: NonNullable<TenantSettings['integrations']> = {
  webhooks: [],
  googleWorkspace: {
    enabled: false,
    defaultMeetingLanguage: 'en-US',
    autoCreateMeetConference: true,
    autoImportGeminiNotes: true,
    autoDraftMeetingNotes: true,
    requireManualApprovalForAutoNotes: true,
    artifactRetentionDays: 180,
    persistArtifactRawContent: true,
  },
};

export const DEFAULT_BULK_IMPORT: NonNullable<TenantSettings['bulkImport']> = {
  defaultMode: 'strict',
  maxRowsPerImport: 10000,
  allowedFileTypes: ['csv'],
  duplicateDetection: true,
  duplicateAction: 'skip',
};

export const DEFAULT_EVIDENCE_UPLOAD: NonNullable<TenantSettings['evidenceUpload']> = {
  maxFileSizeMB: 25,
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ],
  maxFilesPerPerson: 50,
  requireDescription: false,
};

export const DEFAULT_AI: NonNullable<TenantSettings['ai']> = {
  embeddingModel: 'text-embedding-3-small',
  chatModel: 'gpt-4o-mini',
  extractionModel: 'gpt-4o-mini',
  temperature: 0.1,
  maxTokens: 4000,
};

export const DEFAULT_STORAGE: NonNullable<TenantSettings['storage']> = {
  region: 'us-east-1',
  forcePathStyle: true,
};

export const DEFAULT_DEPARTMENTS: NonNullable<TenantSettings['departments']> = {
  list: [],
};

export const DEFAULT_TAXONOMY: NonNullable<TenantSettings['taxonomy']> = {
  skillCategories: [
    { id: 'technical', name: 'Technical', color: '#3B82F6', sortOrder: 1 },
    { id: 'soft', name: 'Soft Skills', color: '#8B5CF6', sortOrder: 2 },
    { id: 'domain', name: 'Domain', color: '#10B981', sortOrder: 3 },
    { id: 'language', name: 'Language', color: '#F59E0B', sortOrder: 4 },
    { id: 'certification', name: 'Certification', color: '#EF4444', sortOrder: 5 },
  ],
};

export const DEFAULT_QUIZ: NonNullable<TenantSettings['quiz']> = {
  enabled: true,
  rateLimitPerDay: 10,
  cacheTtlDays: -1, // -1 = infinite (no expiration)
  questionsPerQuiz: 10,
  temperature: 0.7,
  generationTimeoutSeconds: 60,
};

// ============================================================================
// Utility Functions
// ============================================================================

/** Return type for applySettingsDefaults - fully populated settings */
export type AppliedTenantSettings = Required<{
  features: NonNullable<TenantSettings['features']>;
  skillMatching: NonNullable<TenantSettings['skillMatching']>;
  processing: NonNullable<TenantSettings['processing']>;
  ui: NonNullable<TenantSettings['ui']>;
  integrations: NonNullable<TenantSettings['integrations']>;
  bulkImport: NonNullable<TenantSettings['bulkImport']>;
  evidenceUpload: NonNullable<TenantSettings['evidenceUpload']>;
  ai: NonNullable<TenantSettings['ai']>;
  storage: NonNullable<TenantSettings['storage']>;
  departments: NonNullable<TenantSettings['departments']>;
  taxonomy: NonNullable<TenantSettings['taxonomy']>;
}>;

/**
 * Apply defaults to settings - returns a fully populated settings object.
 * Accepts partial input and returns complete output.
 */
export function applySettingsDefaults(settings: TenantSettingsInput): AppliedTenantSettings {
  // Spread defaults with provided settings. The defaults guarantee all required properties.
  // Type assertion is safe because we're spreading complete defaults first.
  return {
    features: { ...DEFAULT_FEATURES, ...settings.features },
    skillMatching: { ...DEFAULT_SKILL_MATCHING, ...settings.skillMatching },
    processing: { ...DEFAULT_PROCESSING, ...settings.processing },
    ui: { ...DEFAULT_UI, ...settings.ui },
    integrations: { ...DEFAULT_INTEGRATIONS, ...settings.integrations },
    bulkImport: { ...DEFAULT_BULK_IMPORT, ...settings.bulkImport },
    evidenceUpload: { ...DEFAULT_EVIDENCE_UPLOAD, ...settings.evidenceUpload },
    ai: { ...DEFAULT_AI, ...settings.ai },
    storage: { ...DEFAULT_STORAGE, ...settings.storage },
    departments: { ...DEFAULT_DEPARTMENTS, ...settings.departments },
    taxonomy: { ...DEFAULT_TAXONOMY, ...settings.taxonomy },
  } as AppliedTenantSettings;
}

/**
 * Parse and validate tenant settings from database JSON
 * Returns default settings if parsing fails
 */
export function parseTenantSettings(data: unknown): TenantSettings {
  try {
    // If data is a string (from text column), parse it as JSON first
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return tenantSettingsSchema.parse(parsed ?? {});
  } catch {
    // Return defaults on parse error
    return {};
  }
}

/**
 * Merge partial settings with existing settings
 * Returns the raw merged TenantSettings (with optional fields)
 */
export function mergeTenantSettings(
  existing: TenantSettings | TenantSettingsInput,
  partial: Partial<TenantSettings | TenantSettingsInput>,
): TenantSettings {
  // Type assertion is safe because we're merging existing values with partial overrides
  return {
    features: partial.features !== undefined ? { ...existing.features, ...partial.features } : existing.features,
    skillMatching:
      partial.skillMatching !== undefined
        ? { ...existing.skillMatching, ...partial.skillMatching }
        : existing.skillMatching,
    processing:
      partial.processing !== undefined ? { ...existing.processing, ...partial.processing } : existing.processing,
    ui: partial.ui !== undefined ? { ...existing.ui, ...partial.ui } : existing.ui,
    integrations:
      partial.integrations !== undefined
        ? { ...existing.integrations, ...partial.integrations }
        : existing.integrations,
    bulkImport:
      partial.bulkImport !== undefined ? { ...existing.bulkImport, ...partial.bulkImport } : existing.bulkImport,
    evidenceUpload:
      partial.evidenceUpload !== undefined
        ? { ...existing.evidenceUpload, ...partial.evidenceUpload }
        : existing.evidenceUpload,
    ai: partial.ai !== undefined ? { ...existing.ai, ...partial.ai } : existing.ai,
    storage: partial.storage !== undefined ? { ...existing.storage, ...partial.storage } : existing.storage,
    departments:
      partial.departments !== undefined ? { ...existing.departments, ...partial.departments } : existing.departments,
    taxonomy: partial.taxonomy !== undefined ? { ...existing.taxonomy, ...partial.taxonomy } : existing.taxonomy,
  } as TenantSettings;
}

/**
 * Check if a feature is enabled for the tenant
 */
export function isFeatureEnabled(
  settings: TenantSettings | TenantSettingsInput,
  feature: keyof NonNullable<TenantSettings['features']>,
): boolean {
  return settings.features?.[feature] ?? DEFAULT_FEATURES[feature] ?? false;
}

/**
 * Get default tenant settings (empty object, use applySettingsDefaults for full defaults)
 */
export function getDefaultTenantSettings(): TenantSettings {
  return {};
}

/**
 * Check if AI settings are configured (has API key)
 */
export function hasAIConfigured(settings: TenantSettings | TenantSettingsInput): boolean {
  return !!(settings.ai?.provider && settings.ai?.apiKey);
}

/**
 * Check if storage settings are configured (has credentials)
 */
export function hasStorageConfigured(settings: TenantSettings | TenantSettingsInput): boolean {
  return !!(
    settings.storage?.provider &&
    settings.storage?.accessKey &&
    settings.storage?.secretKey &&
    settings.storage?.bucket
  );
}

/**
 * Get skill categories for a tenant (with defaults)
 */
export function getSkillCategories(settings: TenantSettings | TenantSettingsInput): SkillCategory[] {
  const categories = settings.taxonomy?.skillCategories;
  if (categories && categories.length > 0) {
    // Sort and return with default sortOrder values applied
    return categories
      .map((c) => ({ ...c, sortOrder: c.sortOrder ?? 0 }))
      .sort((a, b) => a.sortOrder - b.sortOrder) as SkillCategory[];
  }
  return DEFAULT_TAXONOMY.skillCategories!;
}

/**
 * Get departments for a tenant
 */
export function getDepartments(settings: TenantSettings | TenantSettingsInput): Department[] {
  const list = settings.departments?.list;
  if (!list) return [];
  // Apply default sortOrder if missing
  return list.map((d) => ({ ...d, sortOrder: d.sortOrder ?? 0 })) as Department[];
}

/**
 * Get skill category by ID
 */
export function getSkillCategoryById(
  settings: TenantSettings | TenantSettingsInput,
  id: string,
): SkillCategory | undefined {
  const categories = getSkillCategories(settings);
  return categories.find((c) => c.id === id);
}

/**
 * Validate webhook URL (basic security check)
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      return parsed.protocol === 'https:';
    }
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Generate a webhook secret
 */
export function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
