export type IntegrationProvider = 'github';

export type IntegrationSyncMode = 'migration_full' | 'sync_incremental' | 'reconcile' | 'dry_run';
export type IntegrationRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type IntegrationItemStatus = 'created' | 'updated' | 'skipped_no_change' | 'conflict' | 'error';
export type IntegrationConflictStatus = 'open' | 'resolved' | 'ignored';
export type IntegrationConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IntegrationSyncScope {
  fromDate?: string;
  toDate?: string;
  personEmails?: string[];
  cycleIds?: string[];
  statuses?: string[];
}

export interface StartIntegrationRunInput {
  tenantId: string;
  triggeredByPersonId?: string;
  provider: IntegrationProvider;
  mode: IntegrationSyncMode;
  entities: string[];
  scope?: IntegrationSyncScope;
}

export interface AppendIntegrationRunItemInput {
  tenantId: string;
  runId: string;
  provider: IntegrationProvider;
  entityType: string;
  status: IntegrationItemStatus;
  externalId?: string;
  localEntityType?: string;
  localEntityId?: string;
  reason?: string;
  payloadHash?: string;
  diff?: Record<string, unknown>;
}

export interface RegisterIntegrationConflictInput {
  tenantId: string;
  runId?: string;
  provider: IntegrationProvider;
  entityType: string;
  conflictType: string;
  severity?: IntegrationConflictSeverity;
  externalId?: string;
  details?: Record<string, unknown>;
}
