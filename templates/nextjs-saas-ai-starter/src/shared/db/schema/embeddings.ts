import { relations } from 'drizzle-orm';
import { index, integer, text, timestamp, uuid, varchar, vector } from 'drizzle-orm/pg-core';

import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Embedding entity type enum - What the embedding represents
 */
export const embeddingEntityTypeEnum = appSchema.enum('embedding_entity_type', [
  'evidence', // Evidence/document content
  'knowledge_doc', // Knowledge document title + summary
  'knowledge_doc_version', // Chunk from knowledge document
]);

/**
 * Embedding chunks table - Unified vector embeddings for RAG
 *
 * Stores embeddings for semantic search across all entity types.
 * Each chunk represents a piece of text with its vector embedding.
 * Used for similarity search, RAG, and intelligent matching.
 */
export const embeddingChunks = appSchema.table(
  'embedding_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),

    // What entity this embedding represents
    entityType: embeddingEntityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),

    // Chunk position (for multi-chunk entities like CVs)
    chunkIndex: integer('chunk_index').default(0).notNull(),

    // Original text content
    text: text('text').notNull(),

    // Metadata (ACL, timestamps, source info, etc.)
    metadata: text('metadata').$type<Record<string, unknown>>(),

    // Vector embedding (1536 dimensions for OpenAI ada-002 / text-embedding-3-small)
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),

    // Model used for embedding generation
    embeddingModel: varchar('embedding_model', { length: 100 }).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // HNSW index for fast similarity search
    index('embedding_chunks_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
    // Composite index for entity lookups
    index('embedding_chunks_entity_idx').on(table.tenantId, table.entityType, table.entityId),
    // Index for tenant-scoped queries
    index('embedding_chunks_tenant_idx').on(table.tenantId),
  ],
);

// Relations
export const embeddingChunksRelations = relations(embeddingChunks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [embeddingChunks.tenantId],
    references: [tenants.id],
  }),
}));

// Types
export type EmbeddingChunk = typeof embeddingChunks.$inferSelect;
export type NewEmbeddingChunk = typeof embeddingChunks.$inferInsert;
