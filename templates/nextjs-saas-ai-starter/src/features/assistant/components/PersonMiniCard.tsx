'use client';

/**
 * PersonMiniCard Component
 *
 * Compact person row for displaying in AI chat responses.
 * When personId and tenantSlug are provided, the card links to the team profile.
 */

import { Building2, CheckCircle, Star, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

import type { DetectedPerson } from '../utils/pattern-detectors';

interface PersonMiniCardProps {
  person: DetectedPerson;
  rank?: number;
  className?: string;
  /** When set with tenantSlug, the card links to team profile. */
  personId?: string;
  tenantSlug?: string;
  onViewProfile?: () => void;
  /** Capability match score (0-100) */
  score?: number;
  /** Skills that meet requirements, e.g. ["Python (4/3)", "SQL (5/3)"] */
  met?: string[];
  /** Skills that don't meet requirements, e.g. ["TensorFlow (2/4)"] */
  gaps?: string[];
}

export function PersonMiniCard({
  person,
  rank,
  className,
  personId,
  tenantSlug,
  onViewProfile,
  score,
  met,
  gaps,
}: PersonMiniCardProps) {
  const t = useTranslations('genui');
  const href = personId && tenantSlug ? `/t/${tenantSlug}/team/${personId}` : undefined;

  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hasContext = score != null || (met && met.length > 0) || (gaps && gaps.length > 0);
  const hasSkills = person.skills && person.skills.length > 0;

  const row = (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={cn(
        'rounded-lg px-3 py-2 transition-colors group',
        href ? 'hover:bg-muted/60 cursor-pointer' : '',
        rank === 1 && 'bg-primary/5',
        className,
      )}
      onClick={!href ? onViewProfile : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !href) {
          e.preventDefault();
          onViewProfile?.();
        }
      }}
      role={!href ? 'button' : undefined}
      tabIndex={!href ? 0 : undefined}
    >
      {/* Main row: rank + avatar + name + department + score + chevron */}
      <div className="flex items-center gap-2.5">
        {/* Rank badge */}
        {rank != null && (
          <span
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0',
              rank === 1 && 'bg-primary text-primary-foreground',
              rank === 2 && 'bg-blue-500 text-white',
              rank === 3 && 'bg-green-500 text-white',
              rank > 3 && 'bg-muted text-muted-foreground',
            )}
          >
            {rank}
          </span>
        )}

        {/* Avatar */}
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-green-500 text-white text-[10px]">{initials}</AvatarFallback>
        </Avatar>

        {/* Name + department */}
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">{person.name}</span>
          {person.department && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Building2 className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{person.department}</span>
            </span>
          )}
        </div>

        {/* Score badge */}
        {score != null && (
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] font-bold px-1.5 py-0 h-5 shrink-0 border-0',
              score >= 80 && 'bg-green-500/15 text-green-700 dark:text-green-400',
              score >= 50 && score < 80 && 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
              score < 50 && 'bg-red-500/15 text-red-700 dark:text-red-400',
            )}
          >
            {score}%
          </Badge>
        )}

        {/* Skills (compact badges) - only shown when no candidate context */}
        {!hasContext && hasSkills && (
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {person.skills!.slice(0, 3).map((skill, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] gap-0.5 px-1.5 py-0 h-5 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-0"
              >
                <Star className="h-2 w-2 fill-current" />
                {skill.name}
                <span className="opacity-70">{skill.level}</span>
              </Badge>
            ))}
            {person.skills!.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                +{person.skills!.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Link indicator */}
        {href && (
          <svg
            className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {/* Second row: met/gaps indicators (only for candidates) */}
      {hasContext && (met || gaps) && (
        <div className="flex flex-wrap gap-1 mt-1.5 ml-[calc(1.25rem+0.625rem+1.75rem+0.625rem)]">
          {met &&
            met.slice(0, 3).map((m, i) => (
              <span
                key={`met-${i}`}
                className="inline-flex items-center gap-0.5 text-[10px] text-green-700 dark:text-green-400"
              >
                <CheckCircle className="h-2.5 w-2.5" />
                {m}
              </span>
            ))}
          {gaps &&
            gaps.slice(0, 2).map((g, i) => (
              <span
                key={`gap-${i}`}
                className="inline-flex items-center gap-0.5 text-[10px] text-red-600 dark:text-red-400"
              >
                <XCircle className="h-2.5 w-2.5" />
                {g}
              </span>
            ))}
          {((met && met.length > 3) || (gaps && gaps.length > 2)) && (
            <span className="text-[10px] text-muted-foreground">
              +{(met ? Math.max(0, met.length - 3) : 0) + (gaps ? Math.max(0, gaps.length - 2) : 0)} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={t('viewProfile')}>
        {row}
      </Link>
    );
  }
  return row;
}

/**
 * PersonMiniCardList Component
 *
 * Renders a list of person cards in a compact list layout.
 */
interface PersonMiniCardListProps {
  persons: DetectedPerson[];
  showRanks?: boolean;
  className?: string;
}

export function PersonMiniCardList({ persons, showRanks = true, className }: PersonMiniCardListProps) {
  return (
    <div className={cn('divide-y divide-border/50', className)}>
      {persons.map((person, index) => (
        <PersonMiniCard key={`${person.name}-${index}`} person={person} rank={showRanks ? index + 1 : undefined} />
      ))}
    </div>
  );
}
