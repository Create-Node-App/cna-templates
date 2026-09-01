'use client';

/**
 * Profile Completion Component
 *
 * Shows progress toward completing the user profile with beautiful visuals.
 */

import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

interface ProfileCompletionStep {
  label: string;
  completed: boolean;
  href?: string;
  action?: string;
}

interface ProfileCompletionProps {
  tenantSlug: string;
  percentage: number;
  steps?: ProfileCompletionStep[];
}

const getDefaultSteps = (t: (key: string) => string, tenantSlug: string): ProfileCompletionStep[] => [
  { label: t('addBio'), completed: false, href: `/t/${tenantSlug}/profile`, action: 'profile' },
  { label: t('uploadAvatar'), completed: false, href: `/t/${tenantSlug}/profile`, action: 'avatar' },
  { label: t('connectGitHub'), completed: false, href: `/t/${tenantSlug}/profile`, action: 'github' },
  { label: t('inviteTeamMember'), completed: false, href: `/t/${tenantSlug}/admin/invites`, action: 'invite' },
];

export function ProfileCompletion({ tenantSlug, percentage, steps }: ProfileCompletionProps) {
  const t = useTranslations('dashboard');
  const defaultSteps = getDefaultSteps(t, tenantSlug);
  const finalSteps = steps || defaultSteps;
  return (
    <Card data-tutorial="profile-completion" className="border-0 shadow-md relative overflow-hidden rounded-xl">
      {/* Decorative background */}
      {percentage >= 100 && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
      )}

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('profileCompletion')}
        </CardTitle>
        <CardDescription>{t('completeProfileToUnlock')}</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('progress')}</span>
            <span className={cn('font-bold', percentage >= 100 ? 'text-primary' : 'text-primary')}>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2.5" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {finalSteps.map((step, index) => {
            const StepContent = (
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                  step.completed
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/20'
                    : 'bg-muted/30 dark:bg-muted/20 border-border hover:bg-muted/50',
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                )}
                <span className={cn('text-sm flex-1', step.completed ? 'text-primary font-medium' : 'text-foreground')}>
                  {step.label}
                </span>
                {!step.completed && step.href && <span className="text-xs text-primary font-medium">→</span>}
              </div>
            );

            if (step.completed || !step.href) {
              return <div key={index}>{StepContent}</div>;
            }

            return (
              <Link key={index} href={step.href} className="block">
                {StepContent}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
