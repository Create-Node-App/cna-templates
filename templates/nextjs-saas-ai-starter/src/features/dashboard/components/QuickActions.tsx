'use client';

/**
 * Quick Actions Component
 *
 * Grid of common actions with beautiful hover effects.
 */

import { MessageSquare, Settings, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface QuickActionsProps {
  tenantSlug: string;
}

export function QuickActions({ tenantSlug }: QuickActionsProps) {
  const t = useTranslations('dashboard');
  const tAssistant = useTranslations('assistant');

  const actions = useMemo(
    () => [
      {
        href: `/t/${tenantSlug}/admin/invites`,
        icon: UserPlus,
        label: t('inviteMember'),
        description: t('onboardNewTeamMember'),
        iconBg: 'bg-violet-500/10',
        iconColor: 'text-violet-500',
      },
      {
        href: `/t/${tenantSlug}/people`,
        icon: Users,
        label: t('viewDirectory'),
        description: t('browseTeamMembers'),
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
      },
      {
        href: `/t/${tenantSlug}/assistant`,
        icon: MessageSquare,
        label: tAssistant('title'),
        description: t('getPersonalizedHelp'),
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
      },
      {
        href: `/t/${tenantSlug}/admin/settings`,
        icon: Settings,
        label: t('manageSettings'),
        description: t('configureYourTenant'),
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500',
      },
    ],
    [tenantSlug, t, tAssistant],
  );

  return (
    <Card data-tutorial="quick-actions" className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{t('quickActions')}</CardTitle>
        <CardDescription>{t('commonTasks')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'group relative flex items-center gap-4 p-4 rounded-xl border bg-card',
              'transition-shadow duration-200 hover:shadow-md',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl',
                'transition-transform duration-300 group-hover:scale-110',
                action.iconBg,
                action.iconColor,
              )}
            >
              <action.icon className="h-5 w-5" />
            </div>

            <div className="relative z-10 text-left flex-1">
              <p className="font-semibold group-hover:text-primary transition-colors">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
