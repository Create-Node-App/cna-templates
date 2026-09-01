/**
 * Types for the conversational assistant feature
 */

export type {
  CompareEntitiesOutput,
  EntityItem,
  FindMatchesOutput,
  GetEntityOutput,
  GetProfileOutput,
  KnowledgeDocItem,
  ListProfilesOutput,
  ScoredEntityItem,
  SearchEntitiesOutput,
  SearchKnowledgeOutput,
  ToolOutput,
  ToolPartType,
} from './genui';
export { TOOL_PART_NAMES } from './genui';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface ConversationContext {
  userId: string;
  personId: string;
  tenantId: string;
  currentContext?: string[];
  recentActivity?: string[];
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category: 'general' | 'automation' | 'integrations';
  icon?: string;
}

export interface AssistantCapability {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

// Response types for actions
export interface ChatResponse {
  message: string;
  suggestions?: SuggestedQuestion[];
}

export interface InitialDataResponse {
  suggestedQuestions: SuggestedQuestion[];
  capabilities: AssistantCapability[];
  welcomeMessage: string;
}
