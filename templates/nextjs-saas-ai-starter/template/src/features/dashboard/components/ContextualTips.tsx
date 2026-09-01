'use client';

/**
 * Contextual Tips Component
 *
 * Shows generic platform tips to help users get started.
 */

import { ArrowRight, Lightbulb, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface Tip {
  id: string;
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  type: 'info' | 'action' | 'success';
}

interface ContextualTipsProps {
  tenantSlug: string;
  profileCompletion: number;
  className?: string;
}

export function ContextualTips({ tenantSlug, profileCompletion, className }: ContextualTipsProps) {
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  const dismissTip = useCallback((tipId: string) => {
    setDismissedTips((prev) => new Set([...prev, tipId]));
  }, []);

  const tips: Tip[] = [
    {
      id: 'complete-profile',
      title: 'Complete your profile',
      description: 'Add a bio, avatar, and connect your GitHub account to help team members find you.',
      href: `/t/${tenantSlug}/profile`,
      actionLabel: 'Go to profile',
      type: 'action',
    },
    {
      id: 'invite-team',
      title: 'Invite your team',
      description: 'Get the most out of the platform by inviting your colleagues.',
      href: `/t/${tenantSlug}/admin/invites`,
      actionLabel: 'Invite members',
      type: 'info',
    },
    {
      id: 'try-assistant',
      title: 'Try the AI assistant',
      description: 'Ask questions, search your knowledge base, and get instant answers.',
      href: `/t/${tenantSlug}/assistant`,
      actionLabel: 'Open assistant',
      type: 'info',
    },
    {
      id: 'setup-integrations',
      title: 'Set up integrations',
      description: 'Connect GitHub and other tools to enrich your team data automatically.',
      href: `/t/${tenantSlug}/admin/integrations`,
      actionLabel: 'View integrations',
      type: 'info',
    },
  ];

  // Hide the profile tip once profile is reasonably complete
  const visibleTips = tips
    .filter((tip) => !dismissedTips.has(tip.id))
    .filter((tip) => tip.id !== 'complete-profile' || profileCompletion < 80);

  if (visibleTips.length === 0) {
    return null;
  }

  return (
    <div data-tutorial="contextual-tips" className={cn('space-y-3', className)}>
      {visibleTips.slice(0, 2).map((tip) => (
        <div
          key={tip.id}
          className={cn(
            'relative flex items-start gap-4 p-4 rounded-lg border-0 shadow-md transition-all bg-card',
            tip.type === 'action' && 'ring-1 ring-primary/20',
            tip.type === 'info' && 'ring-1 ring-blue-500/20',
            tip.type === 'success' && 'ring-1 ring-green-500/20',
          )}
        >
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              tip.type === 'action' && 'bg-primary/10 text-primary',
              tip.type === 'info' && 'bg-blue-500/10 text-blue-500',
              tip.type === 'success' && 'bg-green-500/10 text-green-500',
            )}
          >
            {tip.type === 'action' ? <Sparkles className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground">{tip.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{tip.description}</p>
            {tip.href && tip.actionLabel && (
              <Button asChild size="sm" variant="link" className="p-0 h-auto mt-2">
                <Link href={tip.href}>
                  {tip.actionLabel}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          <button
            onClick={() => dismissTip(tip.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss tip"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
