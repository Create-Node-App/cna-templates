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
  tenantId?: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  aiModelVersion?: string;
  aiPromptVersion?: string;
}

/**
 * Get request correlation IDs from headers or generate new ones
 */
export async function getCorrelationIds(): Promise<{ requestId: string; traceId: string }> {
  const headersList = await headers();
  return {
    requestId: headersList.get('x-request-id') || uuidv4(),
    traceId: headersList.get('x-trace-id') || uuidv4(),
  };
}

/**
 * Log an audit event
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
 * Common audit actions
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

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
