'use server';

/**
 * Audit Logs Admin Service
 *
 * Server actions for viewing and filtering audit events in the admin panel.
 */

import { and, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { logger } from '@/shared/lib/logger';
import { requireTenantAdmin } from '@/shared/lib/rbac';

import type { AdminActionResult, PaginatedResult } from '../types';

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
  actorId?: string;
  actions?: string[];
  entityTypes?: string[];
  entityId?: string;
  search?: string;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  requestId: string | null;
  traceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  aiModelVersion: string | null;
  aiPromptVersion: string | null;
  timestamp: Date;
}

/**
 * List audit events with pagination and filters
 */
export async function listAuditEvents(
  tenantSlug: string,
  filters: AuditLogFilters = {},
): Promise<AdminActionResult<PaginatedResult<AuditLogEntry>>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { page = 1, pageSize = 50, startDate, endDate, actorId, actions, entityTypes, entityId, search } = filters;

  try {
    // Get tenant
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Build where conditions
    const conditions = [eq(schema.auditEvents.tenantId, tenant.id)];

    if (startDate) {
      conditions.push(gte(schema.auditEvents.timestamp, startDate));
    }

    if (endDate) {
      conditions.push(lte(schema.auditEvents.timestamp, endDate));
    }

    if (actorId) {
      conditions.push(eq(schema.auditEvents.actorId, actorId));
    }

    if (actions && actions.length > 0) {
      conditions.push(or(...actions.map((action) => eq(schema.auditEvents.action, action))) ?? sql`true`);
    }

    if (entityTypes && entityTypes.length > 0) {
      conditions.push(or(...entityTypes.map((type) => eq(schema.auditEvents.entityType, type))) ?? sql`true`);
    }

    if (entityId) {
      conditions.push(eq(schema.auditEvents.entityId, entityId));
    }

    if (search) {
      // Search in action, entityType, and metadata (as text)
      conditions.push(
        or(
          ilike(schema.auditEvents.action, `%${search}%`),
          ilike(schema.auditEvents.entityType, `%${search}%`),
          sql`${schema.auditEvents.metadata}::text ILIKE ${`%${search}%`}`,
        ) ?? sql`true`,
      );
    }

    const whereClause = and(...conditions);

    // Get total count
    const [{ total }] = await db.select({ total: count() }).from(schema.auditEvents).where(whereClause);

    // Get audit events with actor info
    const events = await db
      .select({
        id: schema.auditEvents.id,
        tenantId: schema.auditEvents.tenantId,
        actorId: schema.auditEvents.actorId,
        action: schema.auditEvents.action,
        entityType: schema.auditEvents.entityType,
        entityId: schema.auditEvents.entityId,
        changes: schema.auditEvents.changes,
        metadata: schema.auditEvents.metadata,
        requestId: schema.auditEvents.requestId,
        traceId: schema.auditEvents.traceId,
        ipAddress: schema.auditEvents.ipAddress,
        userAgent: schema.auditEvents.userAgent,
        aiModelVersion: schema.auditEvents.aiModelVersion,
        aiPromptVersion: schema.auditEvents.aiPromptVersion,
        timestamp: schema.auditEvents.timestamp,
        actorName: schema.persons.displayName,
        actorEmail: schema.persons.email,
      })
      .from(schema.auditEvents)
      .leftJoin(schema.persons, eq(schema.auditEvents.actorId, schema.persons.id))
      .where(whereClause)
      .orderBy(desc(schema.auditEvents.timestamp))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items: AuditLogEntry[] = events.map((event) => ({
      id: event.id,
      tenantId: event.tenantId,
      actorId: event.actorId,
      actorName: event.actorName,
      actorEmail: event.actorEmail,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      changes: event.changes,
      metadata: event.metadata,
      requestId: event.requestId,
      traceId: event.traceId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      aiModelVersion: event.aiModelVersion,
      aiPromptVersion: event.aiPromptVersion,
      timestamp: event.timestamp,
    }));

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to list audit events:');
    return { success: false, error: 'Failed to list audit events' };
  }
}

/**
 * Get a single audit event by ID
 */
export async function getAuditEvent(tenantSlug: string, eventId: string): Promise<AdminActionResult<AuditLogEntry>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const [event] = await db
      .select({
        id: schema.auditEvents.id,
        tenantId: schema.auditEvents.tenantId,
        actorId: schema.auditEvents.actorId,
        action: schema.auditEvents.action,
        entityType: schema.auditEvents.entityType,
        entityId: schema.auditEvents.entityId,
        changes: schema.auditEvents.changes,
        metadata: schema.auditEvents.metadata,
        requestId: schema.auditEvents.requestId,
        traceId: schema.auditEvents.traceId,
        ipAddress: schema.auditEvents.ipAddress,
        userAgent: schema.auditEvents.userAgent,
        aiModelVersion: schema.auditEvents.aiModelVersion,
        aiPromptVersion: schema.auditEvents.aiPromptVersion,
        timestamp: schema.auditEvents.timestamp,
        actorName: schema.persons.displayName,
        actorEmail: schema.persons.email,
      })
      .from(schema.auditEvents)
      .leftJoin(schema.persons, eq(schema.auditEvents.actorId, schema.persons.id))
      .where(and(eq(schema.auditEvents.id, eventId), eq(schema.auditEvents.tenantId, tenant.id)));

    if (!event) {
      return { success: false, error: 'Audit event not found' };
    }

    return {
      success: true,
      data: {
        id: event.id,
        tenantId: event.tenantId,
        actorId: event.actorId,
        actorName: event.actorName,
        actorEmail: event.actorEmail,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        changes: event.changes,
        metadata: event.metadata,
        requestId: event.requestId,
        traceId: event.traceId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        aiModelVersion: event.aiModelVersion,
        aiPromptVersion: event.aiPromptVersion,
        timestamp: event.timestamp,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get audit event:');
    return { success: false, error: 'Failed to get audit event' };
  }
}

/**
 * Get distinct actions for filter dropdown
 */
export async function getDistinctActions(tenantSlug: string): Promise<AdminActionResult<string[]>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const result = await db
      .selectDistinct({ action: schema.auditEvents.action })
      .from(schema.auditEvents)
      .where(eq(schema.auditEvents.tenantId, tenant.id))
      .orderBy(schema.auditEvents.action);

    return {
      success: true,
      data: result.map((r) => r.action),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get distinct actions:');
    return { success: false, error: 'Failed to get distinct actions' };
  }
}

/**
 * Get distinct entity types for filter dropdown
 */
export async function getDistinctEntityTypes(tenantSlug: string): Promise<AdminActionResult<string[]>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const result = await db
      .selectDistinct({ entityType: schema.auditEvents.entityType })
      .from(schema.auditEvents)
      .where(eq(schema.auditEvents.tenantId, tenant.id))
      .orderBy(schema.auditEvents.entityType);

    return {
      success: true,
      data: result.map((r) => r.entityType),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get distinct entity types:');
    return { success: false, error: 'Failed to get distinct entity types' };
  }
}

/**
 * Get actors (persons) who have audit events for filter dropdown
 */
export async function getAuditActors(
  tenantSlug: string,
): Promise<AdminActionResult<Array<{ id: string; name: string; email: string | null }>>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.slug, tenantSlug),
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Get distinct actors with their info
    const result = await db
      .selectDistinct({
        id: schema.persons.id,
        name: schema.persons.displayName,
        email: schema.persons.email,
      })
      .from(schema.auditEvents)
      .innerJoin(schema.persons, eq(schema.auditEvents.actorId, schema.persons.id))
      .where(eq(schema.auditEvents.tenantId, tenant.id))
      .orderBy(schema.persons.displayName);

    return {
      success: true,
      data: result.map((r) => ({
        id: r.id,
        name: r.name || 'Unknown',
        email: r.email,
      })),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get audit actors:');
    return { success: false, error: 'Failed to get audit actors' };
  }
}

/**
 * Export audit events to CSV format
 */
export async function exportAuditEventsCSV(
  tenantSlug: string,
  filters: Omit<AuditLogFilters, 'page' | 'pageSize'> = {},
): Promise<AdminActionResult<string>> {
  const session = await requireTenantAdmin(tenantSlug);
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Fetch all events (no pagination for export)
    const result = await listAuditEvents(tenantSlug, { ...filters, page: 1, pageSize: 10000 });

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Failed to fetch events' };
    }

    const events = result.data.items;

    // Build CSV
    const headers = ['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Request ID'];
    const rows = events.map((event) => [
      event.timestamp.toISOString(),
      event.actorName || event.actorEmail || 'System',
      event.action,
      event.entityType,
      event.entityId || '',
      event.ipAddress || '',
      event.requestId || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return { success: true, data: csvContent };
  } catch (error) {
    logger.error({ error }, 'Failed to export audit events:');
    return { success: false, error: 'Failed to export audit events' };
  }
}
