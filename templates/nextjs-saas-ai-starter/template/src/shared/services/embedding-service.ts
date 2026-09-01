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
 * Get the default OpenAI client using environment variables
 * Used as fallback when tenant has no AI settings configured
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
 * Get an OpenAI client for a specific tenant
 * Falls back to env vars if tenant has no AI settings configured
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
 * Clear cached OpenAI client for a tenant (call when settings change)
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
 * Generate an embedding vector for the given text (uses env var fallback)
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
 * Generate an embedding vector for the given text using tenant-specific settings
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
 * Store an embedding chunk in the database
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
 * Update or create embedding for an entity
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
 * Semantic search across embeddings using cosine similarity
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
 * Delete all embeddings for an entity
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
 * Chunk text into smaller pieces for embedding
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
