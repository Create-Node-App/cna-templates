import type { UIMessage } from 'ai';

import { getConversation, getInitialData } from '@/features/assistant';

import { AssistantClient } from './AssistantClient';

interface AssistantPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ chat?: string }>;
}

export default async function AssistantPage({ params, searchParams }: AssistantPageProps) {
  const { tenant: tenantSlug } = await params;
  const { chat: conversationId } = await searchParams;
  const initialData = await getInitialData(tenantSlug);

  const conversation =
    conversationId && conversationId.trim() !== '' ? await getConversation(tenantSlug, conversationId.trim()) : null;

  return (
    <div className="-mx-4 -my-6 h-[calc(100vh-4rem)]">
      <AssistantClient
        initialData={initialData}
        conversationId={conversation?.id}
        initialMessages={(conversation?.messages as UIMessage[]) ?? undefined}
        initialTitle={conversation?.title}
      />
    </div>
  );
}
