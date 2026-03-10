'use client';

import { ArrowRight, CheckCircle, Github, Image, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProfileCompletionWidgetProps {
  tenantSlug: string;
  profileCompletion: {
    hasBio: boolean;
    hasAvatar: boolean;
    hasGitHub: boolean;
    hasInvitedMember: boolean;
    percentage: number;
  };
  variant?: 'card' | 'inline' | 'compact';
  className?: string;
}

export function ProfileCompletionWidget({
  tenantSlug,
  profileCompletion,
  variant = 'card',
  className,
}: ProfileCompletionWidgetProps) {
  const t = useTranslations('profile');

  const items: CompletionItem[] = [
    {
      id: 'bio',
      label: t('addBio'),
      completed: profileCompletion.hasBio,
      href: `/t/${tenantSlug}/profile`,
      icon: User,
    },
    {
      id: 'avatar',
      label: t('uploadAvatar'),
      completed: profileCompletion.hasAvatar,
      href: `/t/${tenantSlug}/profile`,
      icon: Image,
    },
    {
      id: 'github',
      label: t('connectGitHub'),
      completed: profileCompletion.hasGitHub,
      href: `/t/${tenantSlug}/profile`,
      icon: Github,
    },
    {
      id: 'invite',
      label: t('inviteTeamMember'),
      completed: profileCompletion.hasInvitedMember,
      href: `/t/${tenantSlug}/admin/invites`,
      icon: Mail,
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const nextIncomplete = items.find((i) => !i.completed);

  if (profileCompletion.percentage >= 100) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t('completionTitle')}</span>
            <span className="font-medium">{profileCompletion.percentage}%</span>
          </div>
          <Progress value={profileCompletion.percentage} className="h-2" />
        </div>
        {nextIncomplete?.href && (
          <Button asChild size="sm" variant="outline">
            <Link href={nextIncomplete.href}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20', className)}>
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 * (1 - profileCompletion.percentage / 100)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{profileCompletion.percentage}%</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{t('completionTitle')}</h3>
          <p className="text-sm text-muted-foreground truncate">{t('completionDescription')}</p>
        </div>
        {nextIncomplete?.href && (
          <Button asChild>
            <Link href={nextIncomplete.href}>
              {nextIncomplete.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-primary/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            {t('completionTitle')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{profileCompletion.percentage}%</span>
          </div>
        </div>
        <Progress value={profileCompletion.percentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">{t('completionDescription')}</p>
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                {item.completed ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="line-through">{item.label}</span>
                  </div>
                ) : item.href ? (
                  <Link href={item.href} className="flex items-center gap-3 text-primary hover:underline">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 pt-4 border-t text-center">
          <span className="text-sm text-muted-foreground">
            {completedCount} of {items.length} completed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
