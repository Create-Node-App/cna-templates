'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/shared/lib/utils';
import { useTenantOptional } from '@/shared/providers/tenant-provider';

type LogoSize = 'sm' | 'md' | 'lg';

interface AppLogoProps {
  size?: LogoSize;
  showText?: boolean;
  href?: string | null;
  className?: string;
  ariaLabel?: string;
}

const sizeConfig: Record<
  LogoSize,
  { icon: string; iconText: string; textMain: string; textSub: string; imgSize: number }
> = {
  sm: { icon: 'h-7 w-7', iconText: 'text-sm', textMain: 'text-base', textSub: 'text-base', imgSize: 28 },
  md: { icon: 'h-8 w-8', iconText: 'text-lg', textMain: 'text-lg', textSub: 'text-lg', imgSize: 32 },
  lg: { icon: 'h-10 w-10', iconText: 'text-xl', textMain: 'text-2xl', textSub: 'text-2xl', imgSize: 40 },
};

/**
 * App Logo — renders tenant custom logo or default app brand.
 * If the tenant has a custom logoUrl configured, it renders that instead.
 */
export function AppLogo({ size = 'md', showText = true, href = '/', className, ariaLabel }: AppLogoProps) {
  const tenant = useTenantOptional();
  const s = sizeConfig[size];
  const logoUrl = tenant?.settings?.ui?.logoUrl;
  const displayName = tenant?.settings?.ui?.displayName || tenant?.name || 'A8n Hub';

  const content = (
    <>
      {logoUrl ? (
        <div className={cn('flex items-center justify-center rounded-xl overflow-hidden', s.icon)}>
          <Image
            src={logoUrl}
            alt={displayName}
            width={s.imgSize}
            height={s.imgSize}
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-xl brand-gradient shadow-sm transition-transform duration-300 group-hover:rotate-3',
            s.icon,
          )}
        >
          <span className={cn('font-bold text-white', s.iconText)}>A</span>
        </div>
      )}
      {showText && <span className={cn('font-bold brand-gradient-text', s.textMain)}>{displayName}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn('flex items-center gap-2 group', className)} aria-label={ariaLabel ?? 'Home'}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)} aria-label={ariaLabel}>
      {content}
    </div>
  );
}

// Backward-compat alias for any remaining imports
// Legacy alias for backward compatibility
export { AppLogo as A8nHubLogo };
