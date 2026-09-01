/**
 * GenUI types: shapes of tool outputs for the AI assistant chat.
 * Each tool returns an object that the client receives in part.output when part.type === 'tool-${toolName}'.
 *
 * These types are intentionally generic — they describe entities, attributes, and profiles
 * without coupling to any specific business domain.
 */

import { z } from 'zod';

// ============================================================================
// SHARED ITEM TYPES
// ============================================================================

export interface EntityItem {
  entityId: string;
  name: string;
  category?: string;
  attributes?: Array<{ name: string; level: number }>;
}

export interface ScoredEntityItem {
  entityId: string;
  name: string;
  score: number;
  category?: string;
  met?: string[];
  gaps?: string[];
}

export interface KnowledgeDocItem {
  id: string;
  slug: string;
  title: string;
  docType: string;
}

// ============================================================================
// TOOL OUTPUT TYPES (what each tool returns → part.output)
// ============================================================================

export interface SearchEntitiesOutput {
  summary: string;
  items: EntityItem[];
}

export interface FindMatchesOutput {
  summary: string;
  profileId?: string;
  profileName?: string;
  matches: ScoredEntityItem[];
}

export interface GetProfileOutput {
  summary: string;
  profileId: string;
  name: string;
  criteria?: Array<{ attribute: string; level: number }>;
}

export interface ListProfilesOutput {
  summary: string;
  items: Array<{ id: string; name: string }>;
}

export interface GetEntityOutput {
  summary: string;
  item: EntityItem | null;
}

export interface CompareEntitiesOutput {
  summary: string;
  entityIds: string[];
  entityNames: string[];
  profileId?: string;
  headers: string[];
  rows: Array<{ label: string; values: string[] }>;
}

export interface SearchKnowledgeOutput {
  summary: string;
  documents: KnowledgeDocItem[];
}

// Union of all tool outputs for type-safe part.output handling
export type ToolOutput =
  | SearchEntitiesOutput
  | FindMatchesOutput
  | GetProfileOutput
  | ListProfilesOutput
  | GetEntityOutput
  | CompareEntitiesOutput
  | SearchKnowledgeOutput;

// Tool names as used in message parts (part.type === `tool-${ToolPartType}`)
export const TOOL_PART_NAMES = [
  'tool-searchEntities',
  'tool-findMatches',
  'tool-getProfile',
  'tool-listProfiles',
  'tool-getEntity',
  'tool-searchKnowledge',
  'tool-compareEntities',
  'tool-findAndCompareTop',
] as const;

export type ToolPartType = (typeof TOOL_PART_NAMES)[number];

// ============================================================================
// ZOD SCHEMAS (optional client-side validation of part.output)
// ============================================================================

const entityItemSchema = z.object({
  entityId: z.string(),
  name: z.string(),
  category: z.string().optional(),
  attributes: z.array(z.object({ name: z.string(), level: z.number() })).optional(),
});

const scoredEntityItemSchema = z.object({
  entityId: z.string(),
  name: z.string(),
  score: z.number(),
  category: z.string().optional(),
  met: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
});

const knowledgeDocItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  docType: z.string(),
});

export const searchEntitiesOutputSchema = z.object({
  summary: z.string(),
  items: z.array(entityItemSchema),
});

export const findMatchesOutputSchema = z.object({
  summary: z.string(),
  profileId: z.string().optional(),
  profileName: z.string().optional(),
  matches: z.array(scoredEntityItemSchema),
});

export const getProfileOutputSchema = z.object({
  summary: z.string(),
  profileId: z.string(),
  name: z.string(),
  criteria: z.array(z.object({ attribute: z.string(), level: z.number() })).optional(),
});

export const listProfilesOutputSchema = z.object({
  summary: z.string(),
  items: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const getEntityOutputSchema = z.object({
  summary: z.string(),
  item: entityItemSchema.nullable(),
});

export const compareEntitiesOutputSchema = z.object({
  summary: z.string(),
  entityIds: z.array(z.string()),
  entityNames: z.array(z.string()),
  profileId: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.object({ label: z.string(), values: z.array(z.string()) })),
});

export const searchKnowledgeOutputSchema = z.object({
  summary: z.string(),
  documents: z.array(knowledgeDocItemSchema),
});
