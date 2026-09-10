/**
 * Embedding Service - Generate and store embeddings using OpenAI
 *
 * Handles embedding generation for documents, knowledge base entries, and
 * other entities that need semantic search via pgvector.
 *
 * Supports tenant-specific AI settings with fallback to environment variables.
 */

import { and, eq, inArray, sql } from 'drizzle-orm';
import OpenAI from 'openai';

import { db } from '@/shared/db';
import { embeddingChunks, embeddingEntityTypeEnum, tenants } from '@/shared/db/schema';
import { env } from '@/shared/lib/env';
import { type AISettings, DEFAULT_AI, hasAIConfigured, parseTenantSettings } from '@/shared/lib/tenant-settings';

// Entity type union from the enum
type EmbeddingEntityType = (typeof embeddingEntityTypeEnum.enumValues)[number];

// Default OpenAI client - uses env vars (fallback)
let defaultOpenai: OpenAI | null = null;

// Cache for tenant-specific OpenAI clients
const tenantOpenAIClients = new Map<string, OpenAI>();

/**
 * Get the default OpenAI client using environment variables.
 *
 * Used as a fallback when a tenant has no AI settings configured.
 *
 * @returns The shared default OpenAI client.
 * @throws When `OPENAI_API_KEY` is not set.
 */
export function getOpenAIClient(): OpenAI {
  if (!defaultOpenai) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for embedding generation');
    }
    defaultOpenai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return defaultOpenai;
}

/**
 * Get an OpenAI client for a specific tenant.
 *
 * Returns a cached client when available; otherwise builds one from the
 * tenant's AI settings. Falls back to environment variables when the tenant
 * has no AI settings configured.
 *
 * @param tenantId - Tenant whose OpenAI client to resolve.
 * @returns The client plus the resolved AI settings (model names, ...).
 * @throws When the tenant lookup fails or no API key is available.
 */
export async function getTenantOpenAIClient(tenantId: string): Promise<{ client: OpenAI; settings: AISettings }> {
  // Check cache first
  const cachedClient = tenantOpenAIClients.get(tenantId);
  if (cachedClient) {
    // Get settings for the model names
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });
    const tenantSettings = tenant ? parseTenantSettings(tenant.settings) : {};
    const aiSettings = { ...DEFAULT_AI, ...tenantSettings.ai };
    return { client: cachedClient, settings: aiSettings };
  }

  // Fetch tenant settings
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  const tenantSettings = tenant ? parseTenantSettings(tenant.settings) : {};
  const aiSettings = { ...DEFAULT_AI, ...tenantSettings.ai };

  // Check if tenant has AI configured
  if (hasAIConfigured(tenantSettings)) {
    const client = new OpenAI({ apiKey: tenantSettings.ai!.apiKey! });
    tenantOpenAIClients.set(tenantId, client);
    return { client, settings: aiSettings };
  }

  // Fallback to env vars
  return { client: getOpenAIClient(), settings: aiSettings };
}

/**
 * Clear the cached OpenAI client for a tenant.
 *
 * Call this after AI settings change so the next lookup rebuilds the client
 * from fresh settings.
 *
 * @param tenantId - Tenant whose cached client should be dropped.
 * @returns Nothing.
 */
export function clearTenantOpenAIClient(tenantId: string): void {
  tenantOpenAIClients.delete(tenantId);
}

// Embedding model configuration (default)
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingInput {
  tenantId: string;
  entityType: EmbeddingEntityType;
  entityId: string;
  text: string;
  metadata?: Record<string, unknown>;
  chunkIndex?: number;
}

export interface SearchResult {
  entityType: EmbeddingEntityType;
  entityId: string;
  text: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

/**
 * Generate an embedding vector for the given text.
 *
 * Uses the default OpenAI client (environment-variable fallback). Input is
 * truncated to the model's character limit before sending.
 *
 * @param text - Text to embed.
 * @returns The embedding vector (`EMBEDDING_DIMENSIONS` floats).
 * @throws When the OpenAI embeddings request fails.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Truncate to model limit
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

/**
 * Generate an embedding vector using tenant-specific settings.
 *
 * Uses the tenant's configured embedding model when available.
 *
 * @param tenantId - Tenant whose AI settings (model) to use.
 * @param text - Text to embed.
 * @returns The embedding vector.
 * @throws When the tenant lookup or the OpenAI embeddings request fails.
 */
export async function generateTenantEmbedding(tenantId: string, text: string): Promise<number[]> {
  const { client, settings } = await getTenantOpenAIClient(tenantId);

  const response = await client.embeddings.create({
    model: settings.embeddingModel || EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Truncate to model limit
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

/**
 * Store an embedding chunk in the database.
 *
 * Generates the embedding for `input.text` and inserts the chunk row,
 * recording which model produced it.
 *
 * @param input - Tenant, entity reference, text, and optional metadata.
 * @returns The ID of the inserted embedding chunk.
 * @throws When embedding generation or the database insert fails.
 */
export async function storeEmbedding(input: EmbeddingInput): Promise<string> {
  const embedding = await generateEmbedding(input.text);

  const [result] = await db
    .insert(embeddingChunks)
    .values({
      tenantId: input.tenantId,
      entityType: input.entityType,
      entityId: input.entityId,
      chunkIndex: input.chunkIndex ?? 0,
      text: input.text,
      metadata: input.metadata ?? null,
      embedding,
      embeddingModel: EMBEDDING_MODEL,
    })
    .returning({ id: embeddingChunks.id });

  return result.id;
}

/**
 * Update or create the embedding for an entity.
 *
 * Deletes existing chunks for the entity's chunk index, then stores a fresh
 * embedding.
 *
 * @param input - Tenant, entity reference, text, and optional metadata.
 * @returns The ID of the new embedding chunk.
 * @throws When the delete or the subsequent store fails.
 */
export async function upsertEmbedding(input: EmbeddingInput): Promise<string> {
  // Delete existing embeddings for this entity
  await db
    .delete(embeddingChunks)
    .where(
      and(
        eq(embeddingChunks.tenantId, input.tenantId),
        eq(embeddingChunks.entityType, input.entityType),
        eq(embeddingChunks.entityId, input.entityId),
        eq(embeddingChunks.chunkIndex, input.chunkIndex ?? 0),
      ),
    );

  // Create new embedding
  return storeEmbedding(input);
}

/**
 * Semantic search across embeddings using cosine similarity.
 *
 * Embeds the query, then ranks chunks of the tenant's entities by vector
 * similarity, filtering by entity type and minimum similarity.
 *
 * @param tenantId - Tenant whose embeddings to search.
 * @param query - Natural-language search query.
 * @param options - Optional `entityTypes` filter, `limit` (default 10), and
 * `minSimilarity` threshold (default 0.5).
 * @returns Matching chunks ordered by descending similarity.
 * @throws When query embedding or the database query fails.
 */
export async function semanticSearch(
  tenantId: string,
  query: string,
  options: {
    entityTypes?: EmbeddingEntityType[];
    limit?: number;
    minSimilarity?: number;
  } = {},
): Promise<SearchResult[]> {
  const { entityTypes, limit = 10, minSimilarity = 0.5 } = options;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Build the similarity query
  const similarityExpr = sql<number>`1 - (${embeddingChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`;

  const queryBuilder = db
    .select({
      entityType: embeddingChunks.entityType,
      entityId: embeddingChunks.entityId,
      text: embeddingChunks.text,
      metadata: embeddingChunks.metadata,
      similarity: similarityExpr,
    })
    .from(embeddingChunks)
    .where(
      and(
        eq(embeddingChunks.tenantId, tenantId),
        sql`${similarityExpr} >= ${minSimilarity}`,
        ...(entityTypes && entityTypes.length > 0 ? [inArray(embeddingChunks.entityType, entityTypes)] : []),
      ),
    )
    .orderBy(sql`${similarityExpr} DESC`)
    .limit(limit);

  const results = await queryBuilder;

  return results.map((r) => ({
    ...r,
    metadata: r.metadata ?? null,
  }));
}

/**
 * Delete all embeddings for an entity.
 *
 * @param tenantId - Tenant owning the embeddings.
 * @param entityType - Entity type the chunks belong to.
 * @param entityId - Entity whose chunks should be removed.
 * @returns Nothing.
 * @throws When the database delete fails.
 */
export async function deleteEmbeddings(
  tenantId: string,
  entityType: EmbeddingEntityType,
  entityId: string,
): Promise<void> {
  await db
    .delete(embeddingChunks)
    .where(
      and(
        eq(embeddingChunks.tenantId, tenantId),
        eq(embeddingChunks.entityType, entityType),
        eq(embeddingChunks.entityId, entityId),
      ),
    );
}

/**
 * Chunk text into smaller overlapping pieces for embedding.
 *
 * @param text - Full text to split.
 * @param maxChunkSize - Maximum characters per chunk (default 1000).
 * @param overlap - Characters shared between consecutive chunks (default 100).
 * @returns The text chunks in order.
 */
export function chunkText(text: string, maxChunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }

  return chunks;
}
