'use server';

import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { getTenantBySlug } from '@/shared/lib/tenant';

// ============================================================================
// Types
// ============================================================================

export type IntegrationSyncAction =
  | 'integration.sync.started'
  | 'integration.sync.completed'
  | 'integration.sync.failed';

export type IntegrationConfigAction =
  | 'integration.config.enabled'
  | 'integration.config.disabled'
  | 'integration.config.updated';

export type IntegrationAction = IntegrationSyncAction | IntegrationConfigAction;

export interface IntegrationSyncSummary {
  clientsCreated: number;
  clientsUpdated: number;
  projectsCreated: number;
  projectsUpdated: number;
  personsCreated: number;
  personsExisting: number;
  assignmentsCreated: number;
}

export interface IntegrationSyncEntityRecord {
  id: string;
  name: string;
  email?: string;
  action: 'created' | 'updated' | 'skipped';
  roles?: string[];
}

export interface IntegrationSyncEntities {
  clients: IntegrationSyncEntityRecord[];
  projects: IntegrationSyncEntityRecord[];
  persons: IntegrationSyncEntityRecord[];
}

export interface IntegrationSyncChanges {
  integration: string;
  accountSubdomain?: string;
  dateRange?: { start: string; end: string };
  mode?: string;
}

export interface IntegrationSyncMetadata {
  summary: IntegrationSyncSummary;
  entities: IntegrationSyncEntities;
  errors: string[];
  durationMs?: number;
}

export interface IntegrationConfigChanges {
  integration: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface IntegrationAuditEvent {
  id: string;
  tenantId: string;
  actorId: string | null;
  actorDisplayName?: string;
  action: IntegrationAction;
  entityType: 'integration_sync' | 'integration_config';
  entityId: string;
  changes: IntegrationSyncChanges | IntegrationConfigChanges;
  metadata: IntegrationSyncMetadata | Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// Write Functions
// ============================================================================

/**
 * Record the start of an integration sync operation.
 * Returns the sync ID to use for subsequent updates.
 */
export async function recordSyncStarted(
  tenantSlug: string,
  integration: string,
  options: {
    accountSubdomain?: string;
    dateRange?: { start: string; end: string };
    mode?: string;
  },
): Promise<{ syncId: string } | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return null;

    // Get the person ID for the current user
    const person = await db.query.persons.findFirst({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email ?? '')),
      columns: { id: true },
    });

    const syncId = uuidv4();

    await db.insert(schema.auditEvents).values({
      tenantId: tenant.id,
      actorId: person?.id ?? null,
      action: 'integration.sync.started',
      entityType: 'integration_sync',
      entityId: syncId,
      changes: {
        integration,
        accountSubdomain: options.accountSubdomain,
        dateRange: options.dateRange,
        mode: options.mode,
      },
      metadata: {
        summary: {
          clientsCreated: 0,
          clientsUpdated: 0,
          projectsCreated: 0,
          projectsUpdated: 0,
          personsCreated: 0,
          personsExisting: 0,
          assignmentsCreated: 0,
        },
        entities: { clients: [], projects: [], persons: [] },
        errors: [],
      },
    });

    return { syncId };
  } catch (error) {
    console.error('Failed to record sync started:', error);
    return null;
  }
}

/**
 * Record the successful completion of an integration sync operation.
 */
export async function recordSyncCompleted(
  tenantSlug: string,
  syncId: string,
  integration: string,
  options: {
    accountSubdomain?: string;
    dateRange?: { start: string; end: string };
    mode?: string;
  },
  summary: IntegrationSyncSummary,
  entities: IntegrationSyncEntities,
  durationMs?: number,
): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return;

    const person = await db.query.persons.findFirst({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email ?? '')),
      columns: { id: true },
    });

    await db.insert(schema.auditEvents).values({
      tenantId: tenant.id,
      actorId: person?.id ?? null,
      action: 'integration.sync.completed',
      entityType: 'integration_sync',
      entityId: syncId,
      changes: {
        integration,
        accountSubdomain: options.accountSubdomain,
        dateRange: options.dateRange,
        mode: options.mode,
      },
      metadata: {
        summary,
        entities,
        errors: [],
        durationMs,
      },
    });
  } catch (error) {
    console.error('Failed to record sync completed:', error);
  }
}

/**
 * Record a failed integration sync operation.
 */
export async function recordSyncFailed(
  tenantSlug: string,
  syncId: string,
  integration: string,
  options: {
    accountSubdomain?: string;
    dateRange?: { start: string; end: string };
    mode?: string;
  },
  errors: string[],
  partialSummary?: Partial<IntegrationSyncSummary>,
  durationMs?: number,
): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return;

    const person = await db.query.persons.findFirst({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email ?? '')),
      columns: { id: true },
    });

    await db.insert(schema.auditEvents).values({
      tenantId: tenant.id,
      actorId: person?.id ?? null,
      action: 'integration.sync.failed',
      entityType: 'integration_sync',
      entityId: syncId,
      changes: {
        integration,
        accountSubdomain: options.accountSubdomain,
        dateRange: options.dateRange,
        mode: options.mode,
      },
      metadata: {
        summary: {
          clientsCreated: partialSummary?.clientsCreated ?? 0,
          clientsUpdated: partialSummary?.clientsUpdated ?? 0,
          projectsCreated: partialSummary?.projectsCreated ?? 0,
          projectsUpdated: partialSummary?.projectsUpdated ?? 0,
          personsCreated: partialSummary?.personsCreated ?? 0,
          personsExisting: partialSummary?.personsExisting ?? 0,
          assignmentsCreated: partialSummary?.assignmentsCreated ?? 0,
        },
        entities: { clients: [], projects: [], persons: [] },
        errors,
        durationMs,
      },
    });
  } catch (error) {
    console.error('Failed to record sync failed:', error);
  }
}

/**
 * Record an integration configuration change (enable/disable/update).
 */
export async function recordIntegrationConfigChange(
  tenantSlug: string,
  integration: string,
  action: IntegrationConfigAction,
  changes?: { field?: string; oldValue?: unknown; newValue?: unknown },
): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return;

    const person = await db.query.persons.findFirst({
      where: and(eq(schema.persons.tenantId, tenant.id), eq(schema.persons.email, session.user.email ?? '')),
      columns: { id: true },
    });

    await db.insert(schema.auditEvents).values({
      tenantId: tenant.id,
      actorId: person?.id ?? null,
      action,
      entityType: 'integration_config',
      entityId: uuidv4(),
      changes: {
        integration,
        ...changes,
      },
      metadata: {},
    });
  } catch (error) {
    console.error('Failed to record integration config change:', error);
  }
}

// ============================================================================
// Read Functions
// ============================================================================

/**
 * Get sync history for an integration.
 */
export async function getIntegrationSyncHistory(
  tenantSlug: string,
  integration: string,
  options?: {
    limit?: number;
    offset?: number;
  },
): Promise<IntegrationAuditEvent[]> {
  try {
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return [];

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const events = await db.query.auditEvents.findMany({
      where: and(eq(schema.auditEvents.tenantId, tenant.id), eq(schema.auditEvents.entityType, 'integration_sync')),
      orderBy: [desc(schema.auditEvents.timestamp)],
      limit: limit + 1, // Fetch one extra to check if there are more
      offset,
      with: {
        actor: {
          columns: { id: true, displayName: true, firstName: true, lastName: true },
        },
      },
    });

    // Filter by integration in changes
    const filtered = events.filter((e) => {
      const changes = e.changes as IntegrationSyncChanges | null;
      return changes?.integration === integration;
    });

    return filtered.slice(0, limit).map((e) => ({
      id: e.id,
      tenantId: e.tenantId ?? '',
      actorId: e.actorId,
      actorDisplayName:
        e.actor?.displayName || `${e.actor?.firstName ?? ''} ${e.actor?.lastName ?? ''}`.trim() || 'Unknown',
      action: e.action as IntegrationAction,
      entityType: e.entityType as 'integration_sync',
      entityId: e.entityId ?? '',
      changes: (e.changes ?? {}) as unknown as IntegrationSyncChanges,
      metadata: (e.metadata ?? {
        summary: {
          clientsCreated: 0,
          clientsUpdated: 0,
          projectsCreated: 0,
          projectsUpdated: 0,
          personsCreated: 0,
          personsExisting: 0,
          assignmentsCreated: 0,
        },
        entities: { clients: [], projects: [], persons: [] },
        errors: [],
      }) as unknown as IntegrationSyncMetadata,
      timestamp: e.timestamp,
    }));
  } catch (error) {
    console.error('Failed to get integration sync history:', error);
    return [];
  }
}

/**
 * Get a single sync event by ID.
 */
export async function getIntegrationSyncById(
  tenantSlug: string,
  syncId: string,
): Promise<IntegrationAuditEvent | null> {
  try {
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return null;

    // Get the completed or failed event for this sync
    const event = await db.query.auditEvents.findFirst({
      where: and(
        eq(schema.auditEvents.tenantId, tenant.id),
        eq(schema.auditEvents.entityType, 'integration_sync'),
        eq(schema.auditEvents.entityId, syncId),
      ),
      orderBy: [desc(schema.auditEvents.timestamp)],
      with: {
        actor: {
          columns: { id: true, displayName: true, firstName: true, lastName: true },
        },
      },
    });

    if (!event) return null;

    return {
      id: event.id,
      tenantId: event.tenantId ?? '',
      actorId: event.actorId,
      actorDisplayName:
        event.actor?.displayName ||
        `${event.actor?.firstName ?? ''} ${event.actor?.lastName ?? ''}`.trim() ||
        'Unknown',
      action: event.action as IntegrationAction,
      entityType: event.entityType as 'integration_sync',
      entityId: event.entityId ?? '',
      changes: (event.changes ?? {}) as unknown as IntegrationSyncChanges,
      metadata: (event.metadata ?? {
        summary: {
          clientsCreated: 0,
          clientsUpdated: 0,
          projectsCreated: 0,
          projectsUpdated: 0,
          personsCreated: 0,
          personsExisting: 0,
          assignmentsCreated: 0,
        },
        entities: { clients: [], projects: [], persons: [] },
        errors: [],
      }) as unknown as IntegrationSyncMetadata,
      timestamp: event.timestamp,
    };
  } catch (error) {
    console.error('Failed to get integration sync by ID:', error);
    return null;
  }
}

/**
 * Get sync statistics for an integration (counts of synced data).
 */
export async function getIntegrationSyncStats(
  tenantSlug: string,
  integration: string,
): Promise<{
  totalSyncs: number;
  lastSyncAt: Date | null;
  totalClientsCreated: number;
  totalProjectsCreated: number;
  totalPersonsCreated: number;
} | null> {
  try {
    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) return null;

    const events = await db.query.auditEvents.findMany({
      where: and(eq(schema.auditEvents.tenantId, tenant.id), eq(schema.auditEvents.entityType, 'integration_sync')),
      orderBy: [desc(schema.auditEvents.timestamp)],
    });

    // Filter by integration and completed syncs
    const completedSyncs = events.filter((e) => {
      const changes = e.changes as IntegrationSyncChanges | null;
      return changes?.integration === integration && e.action === 'integration.sync.completed';
    });

    let totalClientsCreated = 0;
    let totalProjectsCreated = 0;
    let totalPersonsCreated = 0;

    for (const sync of completedSyncs) {
      const metadata = sync.metadata as IntegrationSyncMetadata | null;
      if (metadata?.summary) {
        totalClientsCreated += metadata.summary.clientsCreated ?? 0;
        totalProjectsCreated += metadata.summary.projectsCreated ?? 0;
        totalPersonsCreated += metadata.summary.personsCreated ?? 0;
      }
    }

    return {
      totalSyncs: completedSyncs.length,
      lastSyncAt: completedSyncs[0]?.timestamp ?? null,
      totalClientsCreated,
      totalProjectsCreated,
      totalPersonsCreated,
    };
  } catch (error) {
    console.error('Failed to get integration sync stats:', error);
    return null;
  }
}
