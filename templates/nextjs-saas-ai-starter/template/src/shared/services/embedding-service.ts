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
 * The client is created once and cached for the lifetime of the process.
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
 * Returns the cached client when one exists; otherwise reads the tenant's AI
 * settings (merged over {@link DEFAULT_AI}) and creates a client from the
 * tenant API key, falling back to {@link getOpenAIClient} when the tenant
 * has no AI key configured.
 *
 * @param tenantId - The tenant ID to resolve AI settings for.
 * @returns The OpenAI client plus the effective AI settings (model names).
 * @throws When neither the tenant nor the environment provides an API key.
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
 * Call this after the tenant's AI settings change so the next request picks
 * up the new API key instead of reusing the stale cached client.
 *
 * @param tenantId - The tenant whose cached client should be dropped.
 * @returns Nothing.
 */
export function clearTenantOpenAIClient(tenantId: string): void {
  tenantOpenAIClients.delete(tenantId);
}

// Embedding model configuration (default)
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/** Input for storing (or upserting) a single embedding chunk. */
export interface EmbeddingInput {
  /** Tenant owning the chunk (all queries are tenant-scoped) */
  tenantId: string;
  /** Entity type the chunk belongs to */
  entityType: EmbeddingEntityType;
  /** Entity ID the chunk belongs to */
  entityId: string;
  /** Raw text to embed and store */
  text: string;
  /** Optional JSON metadata stored alongside the chunk */
  metadata?: Record<string, unknown>;
  /** Chunk position within the entity (default 0) */
  chunkIndex?: number;
}

/** A single semantic-search hit with its cosine similarity score. */
export interface SearchResult {
  /** Entity type of the matched chunk */
  entityType: EmbeddingEntityType;
  /** Entity ID of the matched chunk */
  entityId: string;
  /** Stored chunk text */
  text: string;
  /** Stored chunk metadata, if any */
  metadata: Record<string, unknown> | null;
  /** Cosine similarity in [0, 1]; higher means more relevant */
  similarity: number;
}

/**
 * Generate an embedding vector for the given text.
 *
 * Uses the default OpenAI client (environment-variable fallback) and the
 * default embedding model. Input is truncated to 8000 characters to stay
 * within model limits.
 *
 * @param text - The text to embed.
 * @returns The embedding vector (`EMBEDDING_DIMENSIONS` floats).
 * @throws When the OpenAI API key is missing or the API call fails.
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
 * Generate an embedding vector using tenant-specific AI settings.
 *
 * Resolves the tenant's OpenAI client and embedding model via
 * {@link getTenantOpenAIClient}, falling back to environment configuration.
 * Input is truncated to 8000 characters to stay within model limits.
 *
 * @param tenantId - The tenant whose AI settings select the model.
 * @param text - The text to embed.
 * @returns The embedding vector.
 * @throws When no API key is available or the API call fails.
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
 * Generate an embedding for the input text and store it as a chunk row.
 *
 * @param input - Tenant, entity reference, text, and optional metadata/chunk index.
 * @returns The ID of the inserted embedding chunk row.
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
 * Replace the embedding chunk(s) for an entity.
 *
 * Deletes existing chunks for the tenant/entity/chunk-index tuple, then
 * stores a fresh embedding via {@link storeEmbedding}.
 *
 * @param input - Tenant, entity reference, text, and optional metadata/chunk index.
 * @returns The ID of the newly inserted embedding chunk row.
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
 * Semantic search across a tenant's embeddings using cosine similarity.
 *
 * Embeds the query, then ranks chunks with pgvector (`<=>`) filtered by
 * tenant, minimum similarity, and optional entity types.
 *
 * @param tenantId - The tenant whose embeddings are searched.
 * @param query - The natural-language query to embed and match.
 * @param options - Optional `entityTypes` filter, `limit` (default 10), and `minSimilarity` (default 0.5).
 * @returns Matching chunks ordered by descending similarity.
 * @throws When query-embedding generation or the database query fails.
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
 * Delete all embedding chunks for an entity.
 *
 * @param tenantId - The tenant owning the embeddings.
 * @param entityType - The entity type to delete chunks for.
 * @param entityId - The entity ID to delete chunks for.
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
 * Split text into overlapping chunks for embedding.
 *
 * Slides a window of `maxChunkSize` characters with `overlap` characters of
 * overlap so semantic context survives chunk boundaries.
 *
 * @param text - The text to split.
 * @param maxChunkSize - Maximum characters per chunk (default 1000).
 * @param overlap - Characters of overlap between consecutive chunks (default 100).
 * @returns The list of text chunks.
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
