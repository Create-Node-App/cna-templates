import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/shared/db';
import { assistantConversations, persons, tenants } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';

const LIST_LIMIT = 50;

/**
 * GET /api/assistant/conversations?tenantSlug=...
 * List conversations for the authenticated user in the given tenant.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenantSlug');
  if (!tenantSlug) {
    return NextResponse.json({ error: 'Missing tenantSlug' }, { status: 400 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const [person] = await db
    .select({ id: persons.id })
    .from(persons)
    .where(and(eq(persons.tenantId, tenant.id), eq(persons.email, session.user.email)))
    .limit(1);
  if (!person) {
    return NextResponse.json({ conversations: [] });
  }

  const conversations = await db
    .select({
      id: assistantConversations.id,
      title: assistantConversations.title,
      updatedAt: assistantConversations.updatedAt,
      createdAt: assistantConversations.createdAt,
    })
    .from(assistantConversations)
    .where(and(eq(assistantConversations.tenantId, tenant.id), eq(assistantConversations.personId, person.id)))
    .orderBy(desc(assistantConversations.updatedAt))
    .limit(LIST_LIMIT);

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
  });
}
