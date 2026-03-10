'use client';

import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/shared/lib/utils';

import { DocsHeader } from './DocsHeader';
import { DocsSearch } from './DocsSearch';
import { DocsSidebar } from './DocsSidebar';

interface DocsLayoutClientProps {
  children: React.ReactNode;
}

export function DocsLayoutClient({ children }: DocsLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close sidebar on route change (mobile)
  const handleNavigate = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Cmd+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DocsHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSearch={() => setSearchOpen(true)}
        sidebarOpen={sidebarOpen}
      />

      <div className="mx-auto max-w-screen-2xl">
        <div className="flex">
          {/* Sidebar — desktop: always visible, mobile: overlay */}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-30 mt-14 w-64 shrink-0 overflow-y-auto border-r border-border bg-background p-4 transition-transform lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <DocsSidebar onNavigate={handleNavigate} />
          </aside>

          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
          )}

          {/* Main content area */}
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>

      {/* Search dialog */}
      <DocsSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
