import { relations } from 'drizzle-orm';
import { index, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { persons } from './persons';
import { appSchema } from './schema';
import { tenants } from './tenants';

/**
 * Assistant conversations table - Persisted AI assistant chat sessions
 *
 * Each row is one conversation (thread) owned by a person within a tenant.
 * Messages are stored as UIMessage[] in the AI SDK format for useChat persistence.
 */
export const assistantConversations = appSchema.table(
  'assistant_conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    personId: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),

    title: text('title').notNull().default('Nueva conversación'),
    messages: jsonb('messages').$type<unknown[]>().notNull().default([]),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('assistant_conversations_tenant_person_idx').on(table.tenantId, table.personId),
    index('assistant_conversations_updated_idx').on(table.updatedAt),
  ],
);

export const assistantConversationsRelations = relations(assistantConversations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [assistantConversations.tenantId],
    references: [tenants.id],
  }),
  person: one(persons, {
    fields: [assistantConversations.personId],
    references: [persons.id],
  }),
}));

export type AssistantConversation = typeof assistantConversations.$inferSelect;
export type NewAssistantConversation = typeof assistantConversations.$inferInsert;
