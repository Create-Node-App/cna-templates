/**
 * Database Schema - Next.js SaaS AI Template
 *
 * This is the central export for all database tables and types.
 * Import from this file for full schema access.
 *
 * @example
 * import * as schema from '@/shared/db/schema';
 * import { db } from '@/shared/db';
 *
 * const tenant = await db.query.tenants.findFirst();
 */

// Auth entities (Auth.js)
export * from './auth';

// Core entities
export * from './tenants';
export * from './persons';
export * from './audit';
export * from './assistant-conversations';

// Files (S3)
export * from './files';

// Departments (basic org structure)
export * from './departments';

// Roles and permissions (PBAC)
export * from './roles';

// Integration sync engine
export * from './integration-sync-control';
export * from './integration-jobs';

// AI / vector embeddings
export * from './embeddings';

// User invitations
export * from './invitations';

// Outgoing webhooks
export * from './webhooks';

// Re-export enums for easy access
export { personStatusEnum, personRelationTypeEnum, employmentTypeEnum } from './persons';
export { fileObjectTypeEnum } from './files';
export { tenantRoleEnum } from './auth';
export { embeddingEntityTypeEnum } from './embeddings';
export { webhookDeliveryStatusEnum } from './webhooks';
export {
  integrationProviderEnum,
  integrationSyncModeEnum,
  integrationSyncRunStatusEnum,
  integrationSyncItemStatusEnum,
  integrationEntityLinkStateEnum,
  integrationConflictStatusEnum,
  integrationConflictSeverityEnum,
  integrationFieldOwnershipEnum,
} from './integration-sync-control';
export { integrationTypeEnum, integrationProcessingStatusEnum } from './integration-jobs';
