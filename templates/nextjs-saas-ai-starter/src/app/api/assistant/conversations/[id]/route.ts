import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/shared/db';
import { assistantConversations, persons, tenants } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';

/**
 * GET /api/assistant/conversations/[id]?tenantSlug=...
 * Return one conversation by id for the authenticated user in the given tenant.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
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
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const [conversation] = await db
    .select({
      id: assistantConversations.id,
      title: assistantConversations.title,
      messages: assistantConversations.messages,
      createdAt: assistantConversations.createdAt,
      updatedAt: assistantConversations.updatedAt,
    })
    .from(assistantConversations)
    .where(
      and(
        eq(assistantConversations.id, id),
        eq(assistantConversations.tenantId, tenant.id),
        eq(assistantConversations.personId, person.id),
      ),
    )
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title,
    messages: conversation.messages,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  });
}
