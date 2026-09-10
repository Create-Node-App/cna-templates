/**
 * Audit Service - System-wide audit logging
 *
 * Records important actions with full context including:
 * - Actor (who did it)
 * - Action (what they did)
 * - Entity (what they did it to)
 * - Request correlation (trace_id, request_id)
 * - AI context (model version, prompt version)
 */

import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/shared/db';
import { auditEvents } from '@/shared/db/schema';
import { logger } from '@/shared/lib/logger';

export interface AuditLogInput {
  /** Tenant the event belongs to (omit for system-level events) */
  tenantId?: string;
  /** ID of the user or service that performed the action */
  actorId?: string;
  /** Action key, e.g. one of {@link AuditActions} */
  action: string;
  /** Type of entity acted upon, e.g. `'person'` */
  entityType: string;
  /** ID of the entity acted upon */
  entityId?: string;
  /** Before/after field changes */
  changes?: Record<string, unknown>;
  /** Additional structured context */
  metadata?: Record<string, unknown>;
  /** AI model version when the event came from an AI flow */
  aiModelVersion?: string;
  /** Prompt version when the event came from an AI flow */
  aiPromptVersion?: string;
}

/**
 * Get request correlation IDs from headers or generate new ones.
 *
 * Reads `x-request-id` / `x-trace-id` from the incoming request headers so
 * audit rows can be joined with logs; falls back to fresh UUIDs when the
 * headers are absent (e.g. background jobs).
 *
 * @returns The request and trace IDs for the current execution context.
 * @throws Never throws — header access failures surface as generated UUIDs.
 */
export async function getCorrelationIds(): Promise<{ requestId: string; traceId: string }> {
  const headersList = await headers();
  return {
    requestId: headersList.get('x-request-id') || uuidv4(),
    traceId: headersList.get('x-trace-id') || uuidv4(),
  };
}

/**
 * Log an audit event to the database and the structured logger.
 *
 * Persists the event with request correlation IDs, client IP, and user agent
 * resolved from request headers, then mirrors it to the application logger
 * with `audit: true` for log-pipeline filtering.
 *
 * @param input - The audit event fields (actor, action, entity, context).
 * @returns The ID of the inserted audit event row.
 * @throws When the database insert fails.
 */
export async function logAuditEvent(input: AuditLogInput): Promise<string> {
  const { requestId, traceId } = await getCorrelationIds();
  const headersList = await headers();

  const [result] = await db
    .insert(auditEvents)
    .values({
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      changes: input.changes,
      metadata: input.metadata,
      requestId,
      traceId,
      ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
      userAgent: headersList.get('user-agent'),
      aiModelVersion: input.aiModelVersion,
      aiPromptVersion: input.aiPromptVersion,
    })
    .returning({ id: auditEvents.id });

  // Also log to structured logger
  logger.info({
    audit: true,
    ...input,
    requestId,
    traceId,
  });

  return result.id;
}

/**
 * Common audit action keys grouped by domain.
 *
 * Use these constants as the `action` field of {@link AuditLogInput} to keep
 * audit rows queryable instead of scattering string literals.
 */
export const AuditActions = {
  // Person actions
  PERSON_CREATED: 'person.created',
  PERSON_UPDATED: 'person.updated',
  PERSON_DELETED: 'person.deleted',
  PERSON_PROFILE_INITIALIZED: 'person.profile_initialized',

  // File actions
  FILE_UPLOADED: 'file.uploaded',
  FILE_DELETED: 'file.deleted',

  // Knowledge document actions
  KNOWLEDGE_DOC_CREATED: 'knowledge_doc.created',
  KNOWLEDGE_DOC_UPDATED: 'knowledge_doc.updated',
  KNOWLEDGE_DOC_PUBLISHED: 'knowledge_doc.published',
  KNOWLEDGE_DOC_DELETED: 'knowledge_doc.deleted',

  // AI actions
  AI_CONVERSATION: 'ai.conversation',

  // Integration sync actions
  INTEGRATION_SYNC_COMPLETED: 'integration.sync_completed',
  INTEGRATION_SYNC_FAILED: 'integration.sync_failed',

  // Auth actions
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
} as const;

/** Union of all known audit action keys from {@link AuditActions}. */
export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
