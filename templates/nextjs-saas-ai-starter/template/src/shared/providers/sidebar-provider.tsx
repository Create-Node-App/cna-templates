'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ============================================================================
// Sidebar Context
// ============================================================================

const SIDEBAR_STORAGE_KEY = 'saas-template:sidebar:collapsed';

/**
 * Sidebar context type
 */
export interface SidebarContextValue {
  /** Whether the sidebar is collapsed (icons only) */
  isCollapsed: boolean;
  /** Toggle sidebar collapsed state */
  toggleCollapsed: () => void;
  /** Set sidebar collapsed state explicitly */
  setCollapsed: (collapsed: boolean) => void;
  /** Whether the sidebar is temporarily expanded via hover (peek overlay) */
  isPeeking: boolean;
  /** Set peek state (used by UnifiedSidebar hover handlers) */
  setIsPeeking: (peeking: boolean) => void;
  /** Whether sidebar is open on mobile (drawer state) */
  isMobileOpen: boolean;
  /** Toggle mobile sidebar drawer */
  toggleMobile: () => void;
  /** Close mobile sidebar drawer */
  closeMobile: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface SidebarProviderProps {
  children: ReactNode;
  /** Default collapsed state (defaults to false) */
  defaultCollapsed?: boolean;
}

/**
 * Provider component for sidebar state management
 *
 * Manages:
 * - Desktop sidebar collapse state (persisted to localStorage)
 * - Peek (hover-to-expand) overlay state
 * - Mobile sidebar drawer open/close state
 * - Keyboard shortcut (Cmd+\ / Ctrl+\) to toggle collapse
 *
 * @example
 * <SidebarProvider>
 *   <Sidebar />
 *   <MainContent />
 * </SidebarProvider>
 */
export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  // Desktop collapse state (persisted) - initialize from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // localStorage not available (SSR or privacy mode)
    }
    return defaultCollapsed;
  });

  // Peek (hover overlay) state — not persisted
  const [isPeeking, setIsPeekingState] = useState(false);

  // Mobile drawer state (not persisted)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Use ref to track initial render (avoid localStorage write on mount)
  const isInitialRender = useRef(true);

  // Persist collapse state to localStorage (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return undefined;
    }
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    } catch {
      // localStorage not available
    }
    return undefined;
  }, [isCollapsed]);

  // Keyboard shortcut: Cmd+\ (Mac) or Ctrl+\ (Windows/Linux) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
        // Clear peek when toggling via keyboard
        setIsPeekingState(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
    // Clear peek when explicitly toggling
    setIsPeekingState(false);
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    setIsPeekingState(false);
  }, []);

  const setIsPeeking = useCallback((peeking: boolean) => {
    setIsPeekingState(peeking);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const contextValue: SidebarContextValue = {
    isCollapsed,
    toggleCollapsed,
    setCollapsed,
    isPeeking,
    setIsPeeking,
    isMobileOpen,
    toggleMobile,
    closeMobile,
  };

  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access sidebar state and controls
 *
 * @example
 * const { isCollapsed, toggleCollapsed } = useSidebar();
 *
 * @throws Error if used outside SidebarProvider
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

/**
 * Hook to optionally access sidebar (returns null if not in provider)
 */
export function useSidebarOptional(): SidebarContextValue | null {
  return useContext(SidebarContext);
}
