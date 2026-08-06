'use client';

/**
 * Activity Feed Component
 *
 * Shows recent user activity with beautiful timeline-style UI.
 */

import { formatDistanceToNow } from 'date-fns';
import { Activity, Bot, User, Zap } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

import type { ActivityItem } from '../types';

interface ActivityFeedProps {
  activities: ActivityItem[];
  emptyMessage?: string;
  tenantSlug?: string;
}

const activityIcons = {
  profile_update: User,
  ai_conversation: Bot,
  member_joined: User,
  invitation_sent: Activity,
  integration_synced: Zap,
};

// Design System compliant: solid colors with subtle backgrounds (10% opacity)
const activityConfig = {
  profile_update: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
  },
  ai_conversation: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  member_joined: {
    iconBg: 'bg-green-500/10 dark:bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-600 dark:text-green-400',
  },
  invitation_sent: {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  integration_synced: {
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
};

export function ActivityFeed({ activities, emptyMessage, tenantSlug }: ActivityFeedProps) {
  const t = useTranslations('dashboard');
  const displayedActivities = activities.slice(0, 5);
  const hasMore = activities.length > 5;
  const finalEmptyMessage = emptyMessage || t('noActivity');
  const profileHref = tenantSlug ? `/t/${tenantSlug}/profile` : null;

  const cardContent = (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          {t('recentActivity')}
        </CardTitle>
        <CardDescription>{t('yourLatestActions')}</CardDescription>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground">{finalEmptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="relative">
              {/* Timeline line — animates height from top on mount */}
              <div
                className="absolute left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/30 to-transparent origin-top"
                style={{ animation: 'timeline-grow 1s ease-out both' }}
              />

              <div className="space-y-4">
                {displayedActivities.map((activity, index) => {
                  const Icon = activityIcons[activity.type] || Activity;
                  const config = activityConfig[activity.type] || {
                    iconBg: 'bg-muted',
                    iconColor: 'text-muted-foreground',
                    bg: 'bg-muted',
                    text: 'text-muted-foreground',
                  };

                  return (
                    <div
                      key={activity.id}
                      className={cn(
                        'flex items-start gap-4 pl-1 transition-all duration-200 hover:translate-x-1',
                        'entrance-fade entrance-stagger',
                      )}
                      style={{ '--stagger-index': index + 1 } as React.CSSProperties}
                    >
                      {/* Icon badge — scales in */}
                      <div
                        className={cn(
                          'relative z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-md',
                          config.iconBg,
                        )}
                        style={{ animation: `icon-scale-in 0.3s ${0.2 + index * 0.1}s ease-out both` }}
                      >
                        <Icon className={cn('h-4 w-4', config.iconColor)} />
                      </div>

                      {/* Content */}
                      <div
                        className={cn('flex-1 min-w-0 p-3 rounded-lg transition-colors', config.bg, 'hover:shadow-sm')}
                      >
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.description}</p>
                        )}
                        <p className={cn('text-xs mt-1 font-medium', config.text)}>
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {hasMore && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    {t('viewAllActivity')} ({activities.length})
                  </span>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </>
  );

  if (profileHref) {
    return (
      <Link
        href={profileHref}
        className="block transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
      >
        <Card data-tutorial="activity-feed" className="border-0 shadow-md cursor-pointer h-full">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card data-tutorial="activity-feed" className="border-0 shadow-md">
      {cardContent}
    </Card>
  );
}
