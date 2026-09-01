'use client';

/**
 * Global Search Provider
 *
 * Context provider for shared search state across the application.
 * Enables coordination between CommandPalette, SearchWithMentions, and other search components.
 */

import * as React from 'react';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  similarity?: number;
  url: string;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface GlobalSearchState {
  // Command palette state
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Recent searches
  recentSearches: RecentSearch[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Search state for sharing between components
  globalQuery: string;
  setGlobalQuery: (query: string) => void;

  // Cached results for quick access (via getter/setter functions only)
  setCachedResults: (query: string, results: SearchResult[]) => void;
  getCachedResults: (query: string) => SearchResult[] | undefined;
}

const GlobalSearchContext = React.createContext<GlobalSearchState | null>(null);

const MAX_RECENT_SEARCHES = 10;
const RECENT_SEARCHES_KEY = 'saas_template_recent_searches';

interface GlobalSearchProviderProps {
  children: React.ReactNode;
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([]);
  const [globalQuery, setGlobalQuery] = React.useState('');
  const cachedResultsRef = React.useRef(new Map<string, SearchResult[]>());

  // Load recent searches from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentSearch[];
        setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Save recent searches to localStorage when they change
  React.useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  }, [recentSearches]);

  const openCommandPalette = React.useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = React.useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const toggleCommandPalette = React.useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  const addRecentSearch = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((s) => s.query.toLowerCase() !== trimmed.toLowerCase());
      // Add new search at the beginning
      const newSearches = [{ query: trimmed, timestamp: Date.now() }, ...filtered];
      // Keep only max number of searches
      return newSearches.slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const clearRecentSearches = React.useCallback(() => {
    setRecentSearches([]);
  }, []);

  const setCachedResults = React.useCallback((query: string, results: SearchResult[]) => {
    cachedResultsRef.current.set(query.toLowerCase(), results);
    // Limit cache size
    if (cachedResultsRef.current.size > 50) {
      const firstKey = cachedResultsRef.current.keys().next().value;
      if (firstKey) cachedResultsRef.current.delete(firstKey);
    }
  }, []);

  const getCachedResults = React.useCallback((query: string): SearchResult[] | undefined => {
    return cachedResultsRef.current.get(query.toLowerCase());
  }, []);

  const value: GlobalSearchState = React.useMemo(
    () => ({
      isCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      globalQuery,
      setGlobalQuery,
      setCachedResults,
      getCachedResults,
    }),
    [
      isCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
      toggleCommandPalette,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      globalQuery,
      setCachedResults,
      getCachedResults,
    ],
  );

  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>;
}

/**
 * Hook to access global search state
 */
export function useGlobalSearch(): GlobalSearchState {
  const context = React.useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
}

/**
 * Optional hook that doesn't throw if provider is missing
 */
export function useGlobalSearchOptional(): GlobalSearchState | null {
  return React.useContext(GlobalSearchContext);
}
