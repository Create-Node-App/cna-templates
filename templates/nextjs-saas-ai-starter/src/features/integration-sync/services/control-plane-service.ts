'use server';

import { and, count, desc, eq, sql } from 'drizzle-orm';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { AuditActions, logAuditEvent } from '@/shared/services/audit-service';

import { toScopeHash } from '../lib/hash';
import type {
  AppendIntegrationRunItemInput,
  IntegrationConflictStatus,
  IntegrationProvider,
  IntegrationRunStatus,
  RegisterIntegrationConflictInput,
  StartIntegrationRunInput,
} from '../types';

export async function startIntegrationRun(input: StartIntegrationRunInput): Promise<schema.IntegrationSyncRun> {
  const [run] = await db
    .insert(schema.integrationSyncRuns)
    .values({
      tenantId: input.tenantId,
      provider: input.provider,
      mode: input.mode,
      status: 'running',
      entities: input.entities,
      scope: input.scope ?? null,
      startedAt: new Date(),
      triggeredByPersonId: input.triggeredByPersonId ?? null,
      updatedAt: new Date(),
    })
    .returning();

  await logAuditEvent({
    tenantId: input.tenantId,
    actorId: input.triggeredByPersonId,
    action: AuditActions.INTEGRATION_SYNC_COMPLETED,
    entityType: 'integration_sync_run',
    entityId: run.id,
    metadata: {
      provider: input.provider,
      mode: input.mode,
      entities: input.entities,
      phase: 'started',
    },
  });

  return run;
}

export async function finishIntegrationRun(input: {
  runId: string;
  tenantId: string;
  status: IntegrationRunStatus;
  summary?: Record<string, unknown>;
  actorId?: string;
}): Promise<schema.IntegrationSyncRun> {
  const [run] = await db
    .update(schema.integrationSyncRuns)
    .set({
      status: input.status,
      summary: input.summary ?? null,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(schema.integrationSyncRuns.id, input.runId), eq(schema.integrationSyncRuns.tenantId, input.tenantId)))
    .returning();

  await logAuditEvent({
    tenantId: input.tenantId,
    actorId: input.actorId,
    action: input.status === 'failed' ? AuditActions.INTEGRATION_SYNC_FAILED : AuditActions.INTEGRATION_SYNC_COMPLETED,
    entityType: 'integration_sync_run',
    entityId: run.id,
    metadata: {
      provider: run.provider,
      mode: run.mode,
      status: input.status,
      summary: input.summary,
      phase: 'finished',
    },
  });

  return run;
}

export async function appendIntegrationRunItem(input: AppendIntegrationRunItemInput): Promise<void> {
  await db.insert(schema.integrationSyncRunItems).values({
    tenantId: input.tenantId,
    runId: input.runId,
    provider: input.provider,
    entityType: input.entityType,
    externalId: input.externalId ?? null,
    localEntityType: input.localEntityType ?? null,
    localEntityId: input.localEntityId ?? null,
    status: input.status,
    reason: input.reason ?? null,
    payloadHash: input.payloadHash ?? null,
    diff: input.diff ?? null,
  });
}

export async function upsertIntegrationEntityLink(input: {
  tenantId: string;
  provider: IntegrationProvider;
  entityType: string;
  externalId: string;
  localEntityType: string;
  localEntityId: string;
  syncHash?: string;
  externalUpdatedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  await db
    .insert(schema.integrationEntityLinks)
    .values({
      tenantId: input.tenantId,
      provider: input.provider,
      entityType: input.entityType,
      externalId: input.externalId,
      localEntityType: input.localEntityType,
      localEntityId: input.localEntityId,
      syncHash: input.syncHash ?? null,
      externalUpdatedAt: input.externalUpdatedAt ?? null,
      metadata: input.metadata ?? null,
      linkState: 'linked',
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        schema.integrationEntityLinks.tenantId,
        schema.integrationEntityLinks.provider,
        schema.integrationEntityLinks.entityType,
        schema.integrationEntityLinks.externalId,
      ],
      set: {
        localEntityType: input.localEntityType,
        localEntityId: input.localEntityId,
        syncHash: input.syncHash ?? null,
        externalUpdatedAt: input.externalUpdatedAt ?? null,
        metadata: input.metadata ?? null,
        linkState: 'linked',
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
    });
}

export async function getIntegrationEntityLink(input: {
  tenantId: string;
  provider: IntegrationProvider;
  entityType: string;
  externalId: string;
}): Promise<schema.IntegrationEntityLink | null> {
  return (
    (await db.query.integrationEntityLinks.findFirst({
      where: and(
        eq(schema.integrationEntityLinks.tenantId, input.tenantId),
        eq(schema.integrationEntityLinks.provider, input.provider),
        eq(schema.integrationEntityLinks.entityType, input.entityType),
        eq(schema.integrationEntityLinks.externalId, input.externalId),
      ),
    })) ?? null
  );
}

export async function upsertIntegrationCursor(input: {
  tenantId: string;
  provider: IntegrationProvider;
  entityType: string;
  scope?: unknown;
  cursorValue: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const scopeHash = toScopeHash(input.scope);
  await db
    .insert(schema.integrationSyncCursors)
    .values({
      tenantId: input.tenantId,
      provider: input.provider,
      entityType: input.entityType,
      scopeHash,
      cursorValue: input.cursorValue,
      metadata: input.metadata ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        schema.integrationSyncCursors.tenantId,
        schema.integrationSyncCursors.provider,
        schema.integrationSyncCursors.entityType,
        schema.integrationSyncCursors.scopeHash,
      ],
      set: {
        cursorValue: input.cursorValue,
        metadata: input.metadata ?? null,
        updatedAt: new Date(),
      },
    });
}

export async function getIntegrationCursor(input: {
  tenantId: string;
  provider: IntegrationProvider;
  entityType: string;
  scope?: unknown;
}): Promise<schema.IntegrationSyncCursor | null> {
  const scopeHash = toScopeHash(input.scope);
  return (
    (await db.query.integrationSyncCursors.findFirst({
      where: and(
        eq(schema.integrationSyncCursors.tenantId, input.tenantId),
        eq(schema.integrationSyncCursors.provider, input.provider),
        eq(schema.integrationSyncCursors.entityType, input.entityType),
        eq(schema.integrationSyncCursors.scopeHash, scopeHash),
      ),
    })) ?? null
  );
}

export async function registerIntegrationConflict(
  input: RegisterIntegrationConflictInput,
): Promise<schema.IntegrationSyncConflict> {
  const [conflict] = await db
    .insert(schema.integrationSyncConflicts)
    .values({
      tenantId: input.tenantId,
      runId: input.runId ?? null,
      provider: input.provider,
      entityType: input.entityType,
      externalId: input.externalId ?? null,
      conflictType: input.conflictType,
      severity: input.severity ?? 'medium',
      details: input.details ?? null,
      status: 'open',
      updatedAt: new Date(),
    })
    .returning();
  return conflict;
}

export async function resolveIntegrationConflict(input: {
  tenantId: string;
  conflictId: string;
  actorPersonId: string;
  action: string;
  status?: IntegrationConflictStatus;
}): Promise<schema.IntegrationSyncConflict | null> {
  const [conflict] = await db
    .update(schema.integrationSyncConflicts)
    .set({
      status: input.status ?? 'resolved',
      resolutionAction: input.action,
      resolvedByPersonId: input.actorPersonId,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.integrationSyncConflicts.id, input.conflictId),
        eq(schema.integrationSyncConflicts.tenantId, input.tenantId),
      ),
    )
    .returning();
  return conflict ?? null;
}

export async function listIntegrationRuns(input: {
  tenantId: string;
  provider?: IntegrationProvider;
  limit?: number;
}): Promise<schema.IntegrationSyncRun[]> {
  return db.query.integrationSyncRuns.findMany({
    where: input.provider
      ? and(
          eq(schema.integrationSyncRuns.tenantId, input.tenantId),
          eq(schema.integrationSyncRuns.provider, input.provider),
        )
      : eq(schema.integrationSyncRuns.tenantId, input.tenantId),
    orderBy: [desc(schema.integrationSyncRuns.createdAt)],
    limit: input.limit ?? 20,
  });
}

export async function listIntegrationConflicts(input: {
  tenantId: string;
  provider?: IntegrationProvider;
  onlyOpen?: boolean;
  limit?: number;
}): Promise<schema.IntegrationSyncConflict[]> {
  return db.query.integrationSyncConflicts.findMany({
    where: and(
      eq(schema.integrationSyncConflicts.tenantId, input.tenantId),
      ...(input.provider ? [eq(schema.integrationSyncConflicts.provider, input.provider)] : []),
      ...(input.onlyOpen ? [eq(schema.integrationSyncConflicts.status, 'open')] : []),
    ),
    orderBy: [desc(schema.integrationSyncConflicts.createdAt)],
    limit: input.limit ?? 100,
  });
}

export async function upsertIntegrationFieldMapping(input: {
  tenantId: string;
  provider: IntegrationProvider;
  entityType: string;
  fieldPath: string;
  ownership: 'remote_authoritative' | 'local_authoritative' | 'merge' | 'append_only';
  mergeStrategy?: string | null;
  isEnabled?: boolean;
}): Promise<schema.IntegrationFieldMapping> {
  const [mapping] = await db
    .insert(schema.integrationFieldMappings)
    .values({
      tenantId: input.tenantId,
      provider: input.provider,
      entityType: input.entityType,
      fieldPath: input.fieldPath,
      ownership: input.ownership,
      mergeStrategy: input.mergeStrategy ?? null,
      isEnabled: input.isEnabled ?? true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        schema.integrationFieldMappings.tenantId,
        schema.integrationFieldMappings.provider,
        schema.integrationFieldMappings.entityType,
        schema.integrationFieldMappings.fieldPath,
      ],
      set: {
        ownership: input.ownership,
        mergeStrategy: input.mergeStrategy ?? null,
        isEnabled: input.isEnabled ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  return mapping;
}

export async function listIntegrationFieldMappings(input: {
  tenantId: string;
  provider?: IntegrationProvider;
}): Promise<schema.IntegrationFieldMapping[]> {
  return db.query.integrationFieldMappings.findMany({
    where: input.provider
      ? and(
          eq(schema.integrationFieldMappings.tenantId, input.tenantId),
          eq(schema.integrationFieldMappings.provider, input.provider),
        )
      : eq(schema.integrationFieldMappings.tenantId, input.tenantId),
    orderBy: [desc(schema.integrationFieldMappings.updatedAt)],
  });
}

export async function getIntegrationMetrics(input: {
  tenantId: string;
  provider?: IntegrationProvider;
  days?: number;
}): Promise<{
  runsTotal: number;
  runsCompleted: number;
  runsFailed: number;
  conflictsOpen: number;
  avgRunTimeSeconds: number;
}> {
  const days = input.days ?? 14;
  const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const whereConditions = [
    eq(schema.integrationSyncRuns.tenantId, input.tenantId),
    sql`${schema.integrationSyncRuns.createdAt} >= ${windowStart}`,
    ...(input.provider ? [eq(schema.integrationSyncRuns.provider, input.provider)] : []),
  ];
  const [runsAgg] = await db
    .select({
      runsTotal: count(),
      runsCompleted: sql<number>`sum(case when ${schema.integrationSyncRuns.status} = 'completed' then 1 else 0 end)`,
      runsFailed: sql<number>`sum(case when ${schema.integrationSyncRuns.status} = 'failed' then 1 else 0 end)`,
      avgRunTimeSeconds: sql<number>`coalesce(avg(extract(epoch from (${schema.integrationSyncRuns.finishedAt} - ${schema.integrationSyncRuns.startedAt}))), 0)`,
    })
    .from(schema.integrationSyncRuns)
    .where(and(...whereConditions));

  const [conflictsAgg] = await db
    .select({ conflictsOpen: count() })
    .from(schema.integrationSyncConflicts)
    .where(
      and(
        eq(schema.integrationSyncConflicts.tenantId, input.tenantId),
        eq(schema.integrationSyncConflicts.status, 'open'),
        ...(input.provider ? [eq(schema.integrationSyncConflicts.provider, input.provider)] : []),
      ),
    );

  return {
    runsTotal: Number(runsAgg?.runsTotal ?? 0),
    runsCompleted: Number(runsAgg?.runsCompleted ?? 0),
    runsFailed: Number(runsAgg?.runsFailed ?? 0),
    conflictsOpen: Number(conflictsAgg?.conflictsOpen ?? 0),
    avgRunTimeSeconds: Number(runsAgg?.avgRunTimeSeconds ?? 0),
  };
}

export async function getCutoverReadiness(input: { tenantId: string; provider: IntegrationProvider }): Promise<{
  ready: boolean;
  checks: Array<{ key: string; passed: boolean; value: number | string }>;
}> {
  const metrics = await getIntegrationMetrics({
    tenantId: input.tenantId,
    provider: input.provider,
    days: 14,
  });
  const checks = [
    {
      key: 'min_runs_completed',
      passed: metrics.runsCompleted >= 3,
      value: metrics.runsCompleted,
    },
    {
      key: 'failed_runs_limit',
      passed: metrics.runsFailed <= 1,
      value: metrics.runsFailed,
    },
    {
      key: 'open_conflicts_limit',
      passed: metrics.conflictsOpen === 0,
      value: metrics.conflictsOpen,
    },
    {
      key: 'success_rate_threshold',
      passed: metrics.runsTotal === 0 ? false : metrics.runsCompleted / metrics.runsTotal >= 0.9,
      value: metrics.runsTotal === 0 ? '0%' : `${Math.round((metrics.runsCompleted / metrics.runsTotal) * 100)}%`,
    },
  ];
  return { ready: checks.every((check) => check.passed), checks };
}
