import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, createIdGenerator, stepCountIs, streamText, type UIMessage } from 'ai';
import { and, eq } from 'drizzle-orm';

import { db } from '@/shared/db';
import { assistantConversations, persons, tenants } from '@/shared/db/schema';
import { auth } from '@/shared/lib/auth';
import { logger } from '@/shared/lib/logger';
import { AuditActions, logAuditEvent } from '@/shared/services/audit-service';

export const maxDuration = 30;

function deriveConversationTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New Conversation';
  const parts = first.parts as Array<{ type: string; text?: string }> | undefined;
  const text = parts?.map((p) => (p.type === 'text' ? p.text : '')).join(' ') || 'New Conversation';
  return text.slice(0, 60) + (text.length > 60 ? '...' : '');
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    messages,
    tenantSlug,
    conversationId = `conv_${Date.now()}`,
  } = body as {
    messages: UIMessage[];
    tenantSlug: string;
    conversationId?: string;
  };

  const session = await auth();
  if (!session?.user?.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, tenantSlug),
  });

  if (!tenant) {
    return new Response('Tenant not found', { status: 404 });
  }

  const person = await db.query.persons.findFirst({
    where: and(eq(persons.tenantId, tenant.id), eq(persons.email, session.user.email)),
  });

  const modelMessages = await convertToModelMessages(messages as Parameters<typeof convertToModelMessages>[0]);

  const systemPrompt = `You are an AI assistant for ${tenant.name}. 
You help users with their questions and tasks.
Be helpful, concise, and professional.
Current user: ${session.user.name || session.user.email}`;

  if (person) {
    const parts = messages.at(-1)?.parts as Array<{ type: string; text?: string }> | undefined;
    const messagePreview =
      parts
        ?.map((p) => (p.type === 'text' ? p.text : ''))
        .join(' ')
        .slice(0, 100) || '';
    logAuditEvent({
      tenantId: tenant.id,
      actorId: person.id,
      action: AuditActions.AI_CONVERSATION,
      entityType: 'ai_assistant',
      metadata: { messagePreview, messageCount: messages.length },
      aiModelVersion: 'gpt-4o',
    }).catch((err) => logger.error({ error: err }, 'Failed to log AI conversation'));
  }

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
    onFinish: async ({ messages: finishedMessages }) => {
      if (!person) return;
      const title = deriveConversationTitle(finishedMessages as UIMessage[]);
      await db
        .insert(assistantConversations)
        .values({
          id: conversationId,
          tenantId: tenant.id,
          personId: person.id,
          title,
          messages: finishedMessages as unknown[],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: assistantConversations.id,
          set: { title, messages: finishedMessages as unknown[], updatedAt: new Date() },
        });
    },
  });
}
