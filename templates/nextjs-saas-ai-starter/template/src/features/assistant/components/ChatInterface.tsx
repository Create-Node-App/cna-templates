'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { Brain, Briefcase, GraduationCap, Loader2, Send, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { useTenant } from '@/shared/providers';

import { ChatMessageRenderer } from './ChatMessageRenderer';
import { ToolPartRenderer } from './ToolPartRenderer';
import type { AssistantCapability, SuggestedQuestion } from '../types';

const capabilityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  skills: Brain,
  career: Briefcase,
  learning: GraduationCap,
};

interface ChatInterfaceProps {
  id?: string;
  initialMessages?: UIMessage[];
  welcomeMessage: string;
  suggestedQuestions: SuggestedQuestion[];
  capabilities?: AssistantCapability[];
  /** Called when a new conversation is created (after first response and URL update). */
  onConversationCreated?: (id: string) => void;
}

export function ChatInterface({
  id: conversationId,
  initialMessages,
  welcomeMessage,
  suggestedQuestions,
  capabilities,
  onConversationCreated,
}: ChatInterfaceProps) {
  const t = useTranslations('assistant');
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const { slug: tenantSlug } = useTenant();
  const [clientNewChatId] = useState<string | null>(() => (conversationId === undefined ? crypto.randomUUID() : null));
  const hasNotifiedNewConversationRef = useRef(false);

  const requestId = conversationId ?? clientNewChatId ?? undefined;

  const { messages, sendMessage, status, setMessages } = useChat({
    id: requestId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { tenantSlug, id: requestId },
    }),
  });

  // After first message in a new chat, update URL so refresh keeps the same conversation
  useEffect(() => {
    if (!conversationId && clientNewChatId && messages.length >= 2) {
      router.replace(`/t/${tenantSlug}/assistant?chat=${clientNewChatId}`);
    }
  }, [conversationId, tenantSlug, clientNewChatId, messages.length, router]);

  // When the AI response finishes (status === 'ready'), server has saved the conversation;
  // notify parent so the sidebar list refetches and shows the new chat
  useEffect(() => {
    if (
      status === 'ready' &&
      !conversationId &&
      clientNewChatId &&
      messages.length >= 2 &&
      !hasNotifiedNewConversationRef.current
    ) {
      hasNotifiedNewConversationRef.current = true;
      onConversationCreated?.(clientNewChatId ?? '');
    }
  }, [status, conversationId, clientNewChatId, messages.length, onConversationCreated]);

  // Add welcome message on mount only when there are no initial messages (new chat)
  useEffect(() => {
    if (messages.length === 0 && !(initialMessages && initialMessages.length > 0)) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          parts: [{ type: 'text', text: welcomeMessage }],
        },
      ]);
    }
  }, [welcomeMessage, messages.length, setMessages, initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user is typing a mention (@ at the end without space)
    if (input.trim() && status === 'ready') {
      // Send message with mentions metadata if needed
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSuggestedQuestion = (question: SuggestedQuestion) => {
    if (status === 'ready') {
      sendMessage({ text: question.text });
    }
  };

  const showWelcome = messages.length === 1;
  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden" role="region" aria-label="AI Assistant Chat">
      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/20"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-3xl rounded-2xl px-4 py-3 shadow-sm entrance-fade',
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-card border border-l-[3px] border-l-violet-400 dark:border-l-violet-500',
                )}
                role="article"
                aria-label={message.role === 'user' ? 'Your message' : 'Assistant message'}
              >
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <ChatMessageRenderer
                        key={index}
                        content={part.text}
                        isUserMessage={message.role === 'user'}
                        className={message.role === 'user' ? 'text-white **:text-white' : ''}
                        tenantSlug={tenantSlug}
                      />
                    );
                  }
                  if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                    const toolPart = part as {
                      type: string;
                      state?: string;
                      output?: unknown;
                      errorText?: string;
                    };
                    return (
                      <ToolPartRenderer
                        key={index}
                        partType={toolPart.type}
                        partState={toolPart.state ?? 'input-available'}
                        partOutput={toolPart.output}
                        partErrorText={toolPart.errorText}
                        tenantSlug={tenantSlug}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {status === 'submitted' && (
            <div className="flex justify-start" aria-live="polite">
              <div className="bg-card border border-l-[3px] border-l-violet-400 dark:border-l-violet-500 rounded-2xl px-4 py-3 shadow-sm entrance-fade">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">{t('thinking')}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Welcome screen: capabilities + suggested questions */}
      {showWelcome && (
        <div className="shrink-0 border-t bg-muted/20">
          <div className="mx-auto max-w-3xl px-4 lg:px-6 py-4 space-y-4">
            {/* Capabilities grid */}
            {capabilities && capabilities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {capabilities.map((cap) => {
                  const Icon = capabilityIconMap[cap.id] || Brain;
                  return (
                    <div key={cap.id} className="rounded-xl border bg-card p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium text-sm">{cap.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggested questions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="inline-flex items-center gap-1.5 text-xs bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 text-card-foreground px-4 py-2 rounded-full transition-all duration-200 hover:border-primary/50"
                  disabled={isLoading}
                  aria-disabled={isLoading}
                >
                  <Sparkles className="h-3 w-3 text-primary/60" />
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t bg-card p-3 lg:p-4 relative z-50">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl flex gap-2" aria-label="Send message">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={t('placeholder')}
              disabled={isLoading}
              aria-label="Message input"
              aria-disabled={isLoading}
              className="h-11 rounded-xl border-muted-foreground/20 w-full"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            aria-busy={isLoading}
            className="h-11 w-11 rounded-xl bg-primary hover:opacity-90 shadow-md shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
