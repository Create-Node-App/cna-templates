'use client';

import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';

export type ViewType = 'my' | 'admin';

export interface ViewContextValue {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  availableViews: ViewType[];
  hasView: (view: ViewType) => boolean;
  hasManagerAccess: boolean;
  hasOneOnOneAccess: boolean;
  hasAdminAccess: boolean;
}

export const ViewContext = createContext<ViewContextValue | null>(null);

function checkAdminAccess(permissions: string[]): boolean {
  return permissions.includes('admin:dashboard') || permissions.includes('admin:settings');
}

interface ViewProviderProps {
  children: ReactNode;
  permissions: string[];
  tenantSlug: string;
}

export function ViewProvider({ children, permissions, tenantSlug }: ViewProviderProps) {
  const pathname = usePathname();

  const hasAdminAccess = useMemo(() => checkAdminAccess(permissions), [permissions]);

  const availableViews = useMemo<ViewType[]>(() => {
    const views: ViewType[] = ['my'];
    if (hasAdminAccess) views.push('admin');
    return views;
  }, [hasAdminAccess]);

  const currentView = useMemo((): ViewType => {
    if (pathname.startsWith(`/t/${tenantSlug}/admin`)) return 'admin';
    return 'my';
  }, [pathname, tenantSlug]);

  const setView = useCallback((_view: ViewType) => {
    // View is determined by URL
  }, []);

  const hasView = useCallback((view: ViewType): boolean => availableViews.includes(view), [availableViews]);

  const contextValue: ViewContextValue = useMemo(
    () => ({
      currentView,
      setView,
      availableViews,
      hasView,
      hasManagerAccess: false,
      hasOneOnOneAccess: false,
      hasAdminAccess,
    }),
    [currentView, setView, availableViews, hasView, hasAdminAccess],
  );

  return <ViewContext.Provider value={contextValue}>{children}</ViewContext.Provider>;
}

export function useView(): ViewContextValue {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}

export function useViewOptional(): ViewContextValue | null {
  return useContext(ViewContext);
}
