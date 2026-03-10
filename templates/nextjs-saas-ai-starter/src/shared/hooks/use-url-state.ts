'use client';

/**
 * URL State Hooks
 *
 * Hooks for syncing component state with URL parameters for deep linking.
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

// ============================================================================
// useUrlTab - Sync tab state with URL
// ============================================================================

interface UseUrlTabOptions {
  /** URL parameter name (default: 'tab') */
  paramName?: string;
  /** Default tab if not in URL */
  defaultTab: string;
  /** Valid tab values (for validation) */
  validTabs?: string[];
  /** Whether to replace history instead of push (default: true) */
  replace?: boolean;
}

/**
 * Hook to sync tab state with URL query parameter
 *
 * @example
 * const [activeTab, setActiveTab] = useUrlTab({ defaultTab: 'overview' });
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 */
export function useUrlTab({
  paramName = 'tab',
  defaultTab,
  validTabs,
  replace = true,
}: UseUrlTabOptions): [string, (tab: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL or default
  const currentTab = useMemo(() => {
    const urlTab = searchParams.get(paramName);
    if (!urlTab) return defaultTab;
    if (validTabs && !validTabs.includes(urlTab)) return defaultTab;
    return urlTab;
  }, [searchParams, paramName, defaultTab, validTabs]);

  // Set tab and update URL
  const setTab = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newTab === defaultTab) {
        // Remove param if it's the default
        params.delete(paramName);
      } else {
        params.set(paramName, newTab);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams, paramName, defaultTab, replace],
  );

  return [currentTab, setTab];
}

// ============================================================================
// useUrlParam - Generic URL parameter sync
// ============================================================================

interface UseUrlParamOptions<T> {
  /** URL parameter name */
  paramName: string;
  /** Default value if not in URL */
  defaultValue: T;
  /** Parse string from URL to value */
  parse?: (value: string) => T;
  /** Serialize value to string for URL */
  serialize?: (value: T) => string;
  /** Whether to replace history instead of push (default: true) */
  replace?: boolean;
}

/**
 * Hook to sync any value with a URL query parameter
 *
 * @example
 * const [search, setSearch] = useUrlParam({ paramName: 'q', defaultValue: '' });
 * const [page, setPage] = useUrlParam({
 *   paramName: 'page',
 *   defaultValue: 1,
 *   parse: Number,
 *   serialize: String,
 * });
 */
export function useUrlParam<T extends string | number | boolean>({
  paramName,
  defaultValue,
  parse,
  serialize,
  replace = true,
}: UseUrlParamOptions<T>): [T, (value: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current value from URL or default
  const currentValue = useMemo(() => {
    const urlValue = searchParams.get(paramName);
    if (urlValue === null) return defaultValue;

    if (parse) {
      try {
        return parse(urlValue);
      } catch {
        return defaultValue;
      }
    }

    return urlValue as T;
  }, [searchParams, paramName, defaultValue, parse]);

  // Set value and update URL
  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams.toString());
      const serialized = serialize ? serialize(newValue) : String(newValue);
      const defaultSerialized = serialize ? serialize(defaultValue) : String(defaultValue);

      if (serialized === defaultSerialized) {
        // Remove param if it's the default
        params.delete(paramName);
      } else {
        params.set(paramName, serialized);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams, paramName, defaultValue, serialize, replace],
  );

  return [currentValue, setValue];
}

// ============================================================================
// useUrlDialog - Sync dialog open state with URL
// ============================================================================

interface UseUrlDialogOptions {
  /** URL parameter name */
  paramName: string;
  /** Expected value to indicate dialog is open (default: 'open') */
  openValue?: string;
  /** Whether to replace history instead of push (default: false for dialogs) */
  replace?: boolean;
}

/**
 * Hook to sync dialog/modal open state with URL
 *
 * @example
 * const [isOpen, setIsOpen] = useUrlDialog({ paramName: 'settings' });
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 */
export function useUrlDialog({
  paramName,
  openValue = 'open',
  replace = false,
}: UseUrlDialogOptions): [boolean, (open: boolean) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current state from URL
  const isOpen = useMemo(() => {
    return searchParams.get(paramName) === openValue;
  }, [searchParams, paramName, openValue]);

  // Set state and update URL
  const setIsOpen = useCallback(
    (open: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (open) {
        params.set(paramName, openValue);
      } else {
        params.delete(paramName);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams, paramName, openValue, replace],
  );

  return [isOpen, setIsOpen];
}

// ============================================================================
// useUrlId - Sync selected item ID with URL
// ============================================================================

interface UseUrlIdOptions {
  /** URL parameter name */
  paramName: string;
  /** Whether to replace history instead of push (default: true) */
  replace?: boolean;
}

/**
 * Hook to sync a selected item ID with URL
 *
 * @example
 * const [selectedId, setSelectedId] = useUrlId({ paramName: 'job' });
 * if (selectedId) showJobDetails(selectedId);
 */
export function useUrlId({ paramName, replace = true }: UseUrlIdOptions): [string | null, (id: string | null) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current ID from URL
  const currentId = useMemo(() => {
    return searchParams.get(paramName);
  }, [searchParams, paramName]);

  // Set ID and update URL
  const setId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (id) {
        params.set(paramName, id);
      } else {
        params.delete(paramName);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams, paramName, replace],
  );

  return [currentId, setId];
}
