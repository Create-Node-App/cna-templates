'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquarePlus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { useTenant } from '@/shared/providers';

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

interface ConversationListProps {
  currentConversationId?: string | null;
  onSelectConversation?: () => void;
  /** When this changes, the list is refetched (e.g. after a new conversation is created). */
  refetchTrigger?: number;
  className?: string;
}

export function ConversationList({
  currentConversationId,
  onSelectConversation,
  refetchTrigger,
  className,
}: ConversationListProps) {
  const t = useTranslations('assistant');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { slug: tenantSlug } = useTenant();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const basePath = `/t/${tenantSlug}/assistant`;
  const startNewConversation = useCallback(() => {
    onSelectConversation?.();
    setSidebarOpen(false);
    router.push(basePath);
  }, [router, basePath, onSelectConversation]);

  useEffect(() => {
    let cancelled = false;
    async function fetchConversations() {
      setLoading(true);
      try {
        const res = await fetch(`/api/assistant/conversations?tenantSlug=${encodeURIComponent(tenantSlug)}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { conversations: ConversationItem[] };
        if (!cancelled) setConversations(data.conversations ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchConversations();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug, currentConversationId, refetchTrigger]);

  const listContent = (
    <div className="flex flex-col h-full">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 mb-3"
        onClick={startNewConversation}
        type="button"
      >
        <MessageSquarePlus className="h-4 w-4" />
        {t('newConversation')}
      </Button>
      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noConversations')}</p>
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              href={`${basePath}?chat=${encodeURIComponent(c.id)}`}
              onClick={() => onSelectConversation?.()}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm truncate transition-colors',
                currentConversationId === c.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              title={c.title}
            >
              <span className="block truncate">{c.title || t('newConversation')}</span>
              <span className="block text-xs opacity-70 mt-0.5">
                {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside
        className={cn('hidden lg:flex flex-col w-[260px] shrink-0 border-r bg-muted/30 rounded-l-xl p-3', className)}
        aria-label={t('newConversation')}
      >
        {listContent}
      </aside>
      {/* Mobile: sheet trigger */}
      <div className="lg:hidden shrink-0">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0" aria-label={t('newConversation')}>
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t('title')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Close">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            {listContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
