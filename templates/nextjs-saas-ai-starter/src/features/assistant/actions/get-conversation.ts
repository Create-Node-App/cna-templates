'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import { assistantConversations, persons, tenants } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';

export type ConversationForPage = {
  id: string;
  title: string;
  messages: unknown[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Load one conversation by id for the current user in the given tenant.
 * Returns null if not found or unauthorized.
 */
export async function getConversation(tenantSlug: string, conversationId: string): Promise<ConversationForPage | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });
  if (!tenant) return null;

  const [person] = await db
    .select({ id: persons.id })
    .from(persons)
    .where(eq(persons.email, session.user.email))
    .limit(1);
  if (!person) return null;

  const [row] = await db
    .select()
    .from(assistantConversations)
    .where(
      and(
        eq(assistantConversations.id, conversationId),
        eq(assistantConversations.tenantId, tenant.id),
        eq(assistantConversations.personId, person.id),
      ),
    )
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    messages: row.messages ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
