/**
 * GenUI types: shapes of tool outputs for the AI assistant chat.
 * Each tool returns an object that the client receives in part.output when part.type === 'tool-${toolName}'.
 */

import { z } from 'zod';

// ============================================================================
// SHARED ITEM TYPES
// ============================================================================

export interface PersonListItem {
  personId: string;
  name: string;
  department?: string;
  skills?: Array<{ name: string; level: number }>;
}

export interface CandidateItem {
  personId: string;
  name: string;
  score: number;
  department?: string;
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

export interface SearchPeopleOutput {
  summary: string;
  items: PersonListItem[];
}

export interface FindCandidatesOutput {
  summary: string;
  capabilityId?: string;
  capabilityName?: string;
  candidates: CandidateItem[];
}

export interface GetCapabilityOutput {
  summary: string;
  capabilityId: string;
  name: string;
  requirements?: Array<{ skill: string; level: number }>;
}

export interface ListCapabilitiesOutput {
  summary: string;
  items: Array<{ id: string; name: string }>;
}

export interface GetPersonOutput {
  summary: string;
  item: PersonListItem | null;
}

export interface CompareCandidatesOutput {
  summary: string;
  personIds: string[];
  personNames: string[];
  capabilityId?: string;
  headers: string[];
  rows: Array<{ skill: string; values: string[] }>;
}

export interface SearchKnowledgeOutput {
  summary: string;
  documents: KnowledgeDocItem[];
}

// Union of all tool outputs for type-safe part.output handling
export type ToolOutput =
  | SearchPeopleOutput
  | FindCandidatesOutput
  | GetCapabilityOutput
  | ListCapabilitiesOutput
  | GetPersonOutput
  | CompareCandidatesOutput
  | SearchKnowledgeOutput;

// Tool names as used in message parts (part.type === `tool-${ToolPartType}`)
export const TOOL_PART_NAMES = [
  'tool-searchPeople',
  'tool-findCandidates',
  'tool-getCapability',
  'tool-listCapabilities',
  'tool-getPerson',
  'tool-searchKnowledge',
  'tool-compareCandidates',
  'tool-findAndCompareTop',
] as const;

export type ToolPartType = (typeof TOOL_PART_NAMES)[number];

// ============================================================================
// ZOD SCHEMAS (optional client-side validation of part.output)
// ============================================================================

const personListItemSchema = z.object({
  personId: z.string(),
  name: z.string(),
  department: z.string().optional(),
  skills: z.array(z.object({ name: z.string(), level: z.number() })).optional(),
});

const candidateItemSchema = z.object({
  personId: z.string(),
  name: z.string(),
  score: z.number(),
  department: z.string().optional(),
  met: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
});

const knowledgeDocItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  docType: z.string(),
});

export const searchPeopleOutputSchema = z.object({
  summary: z.string(),
  items: z.array(personListItemSchema),
});

export const findCandidatesOutputSchema = z.object({
  summary: z.string(),
  capabilityId: z.string().optional(),
  capabilityName: z.string().optional(),
  candidates: z.array(candidateItemSchema),
});

export const getCapabilityOutputSchema = z.object({
  summary: z.string(),
  capabilityId: z.string(),
  name: z.string(),
  requirements: z.array(z.object({ skill: z.string(), level: z.number() })).optional(),
});

export const listCapabilitiesOutputSchema = z.object({
  summary: z.string(),
  items: z.array(z.object({ id: z.string(), name: z.string() })),
});

export const getPersonOutputSchema = z.object({
  summary: z.string(),
  item: personListItemSchema.nullable(),
});

export const compareCandidatesOutputSchema = z.object({
  summary: z.string(),
  personIds: z.array(z.string()),
  personNames: z.array(z.string()),
  capabilityId: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.object({ skill: z.string(), values: z.array(z.string()) })),
});

export const searchKnowledgeOutputSchema = z.object({
  summary: z.string(),
  documents: z.array(knowledgeDocItemSchema),
});
