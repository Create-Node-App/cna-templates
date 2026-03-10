'use client';

import type { UIMessage } from 'ai';
import { useCallback, useState } from 'react';
import { ChatInterface, ConversationList } from '@/features/assistant';
import type { InitialDataResponse } from '@/features/assistant';

interface AssistantClientProps {
  initialData: InitialDataResponse;
  conversationId?: string | null;
  initialMessages?: UIMessage[];
  initialTitle?: string;
}

export function AssistantClient({
  initialData,
  conversationId,
  initialMessages,
  initialTitle: _initialTitle,
}: AssistantClientProps) {
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const handleConversationCreated = useCallback(() => {
    setRefetchTrigger((n) => n + 1);
  }, []);

  return (
    <div className="flex h-full border-t bg-card overflow-hidden">
      <ConversationList currentConversationId={conversationId} refetchTrigger={refetchTrigger} />
      <div className="flex-1 min-w-0 flex flex-col">
        <ChatInterface
          id={conversationId ?? undefined}
          initialMessages={initialMessages}
          welcomeMessage={initialData.welcomeMessage}
          suggestedQuestions={initialData.suggestedQuestions}
          capabilities={initialData.capabilities}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
