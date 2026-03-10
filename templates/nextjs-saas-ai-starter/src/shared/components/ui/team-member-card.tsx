'use client';

/**
 * Team Member Card
 *
 * Molecule: card for team directory with avatar, name, status, title, location,
 * skills count, account badge (with account / pre-loaded), and optional bio.
 * Used on the team page (grid of person cards).
 */

import { ExternalLink, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface TopSkill {
  name: string;
  level: number; // 0–4 display scale
}

export interface TeamMemberCardProps {
  name: string;
  /** Optional; fallback uses initials from name */
  avatarUrl?: string | null;
  /** Optional; derived from name if not provided */
  initials?: string;
  status: string;
  title?: string | null;
  location?: string | null;
  skillsCount: number;
  skillsLabel: string;
  /** Up to 5 most relevant / highest-level skills */
  topSkills?: TopSkill[];
  hasAccount: boolean;
  withAccountLabel: string;
  preloadedLabel: string;
  bio?: string | null;
  /** When set, card renders as Link; otherwise as div (e.g. for Storybook) */
  href?: string;
  className?: string;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  onboarding: 'secondary',
  inactive: 'outline',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TeamMemberCard({
  name,
  avatarUrl,
  initials: initialsProp,
  status,
  title,
  location,
  skillsCount,
  skillsLabel,
  topSkills,
  hasAccount,
  withAccountLabel,
  preloadedLabel,
  bio,
  href,
  className,
}: TeamMemberCardProps) {
  const initials = initialsProp ?? getInitials(name);
  const statusVariant = statusVariants[status] ?? 'outline';

  const content = (
    <>
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all">
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{name}</h3>
            <Badge variant={statusVariant} className="text-xs shrink-0">
              {status}
            </Badge>
          </div>

          {title && <p className="text-sm text-muted-foreground truncate">{title}</p>}

          {location && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>📍</span> {location}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary/5 text-primary">
              🎯 {skillsCount} {skillsLabel}
            </span>
            {hasAccount ? (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <UserCheck className="h-3 w-3" />
                {withAccountLabel}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                <UserX className="h-3 w-3" />
                {preloadedLabel}
              </span>
            )}
          </div>

          {topSkills && topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {topSkills.slice(0, 5).map((skill, i) => (
                <Badge key={`${skill.name}-${i}`} variant="secondary">
                  {skill.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {href && (
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
      </div>

      {bio && <p className="text-sm text-muted-foreground mt-4 line-clamp-2 border-t pt-3">{bio}</p>}
    </>
  );

  const wrapperClassName = cn(
    'group bg-card rounded-xl border-0 shadow-md p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={wrapperClassName}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
