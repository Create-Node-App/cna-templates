import { relations } from 'drizzle-orm';
import { bigint, index, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { persons } from './persons';
import { appSchema } from './schema';
import { tenants } from './tenants';

export const fileObjectTypeEnum = appSchema.enum('file_object_type', ['document', 'image', 'other']);

/**
 * File objects table - S3 file references
 */
export const fileObjects = appSchema.table(
  'file_objects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    ownerPersonId: uuid('owner_person_id').references(() => persons.id, { onDelete: 'set null' }),
    type: fileObjectTypeEnum('type').notNull(),
    s3Bucket: varchar('s3_bucket', { length: 255 }).notNull(),
    s3Key: varchar('s3_key', { length: 1024 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }),
    mimeType: varchar('mime_type', { length: 127 }).notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    checksum: varchar('checksum', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('file_objects_owner_idx').on(table.ownerPersonId),
    index('file_objects_s3_idx').on(table.s3Bucket, table.s3Key),
  ],
);

export const fileObjectsRelations = relations(fileObjects, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fileObjects.tenantId],
    references: [tenants.id],
  }),
  owner: one(persons, {
    fields: [fileObjects.ownerPersonId],
    references: [persons.id],
  }),
}));

export type FileObject = typeof fileObjects.$inferSelect;
export type NewFileObject = typeof fileObjects.$inferInsert;
