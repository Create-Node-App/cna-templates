'use client';

import { cn } from '@/shared/lib/utils';
import { useSidebarOptional } from '@/shared/providers';

/**
 * Sidebar-aware separator line.
 * Hidden when the sidebar is collapsed (and not peeking) since icon-only
 * nav items don't benefit from horizontal dividers.
 */
export function SidebarSeparator() {
  const sidebarContext = useSidebarOptional();
  const isCollapsed = sidebarContext?.isCollapsed ?? false;
  const isPeeking = sidebarContext?.isPeeking ?? false;

  // Hide when truly collapsed (not peeking) — no visual noise between icons
  const hidden = isCollapsed && !isPeeking;

  return <div className={cn('my-1 border-t border-border/50', hidden && 'hidden')} role="separator" aria-hidden />;
}
