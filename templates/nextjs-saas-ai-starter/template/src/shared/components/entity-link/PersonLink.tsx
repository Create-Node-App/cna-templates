'use client';

import Link from 'next/link';

import { cn } from '@/shared/lib/utils';

export interface PersonLinkProps {
  tenantSlug: string;
  personId: string;
  displayName: string;
  showHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PersonLink({ tenantSlug, personId, displayName, className, style }: PersonLinkProps) {
  const href = `/t/${tenantSlug}/team/${personId}`;

  return (
    <Link
      href={href}
      className={cn('font-medium text-primary hover:underline truncate inline-block', className)}
      style={style}
      title={displayName}
    >
      {displayName}
    </Link>
  );
}
