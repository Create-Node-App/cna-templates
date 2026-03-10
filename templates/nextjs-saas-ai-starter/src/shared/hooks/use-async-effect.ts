import { DependencyList, useEffect, useRef } from 'react';

/**
 * Hook for handling async operations in useEffect without lint warnings.
 *
 * This hook properly handles:
 * - Async function execution in useEffect
 * - Cleanup/cancellation when dependencies change
 * - Avoiding state updates after unmount
 *
 * @example
 * ```tsx
 * useAsyncEffect(async (signal) => {
 *   const data = await fetchData();
 *   if (!signal.aborted) {
 *     setData(data);
 *   }
 * }, [dependency]);
 * ```
 */
export function useAsyncEffect(
  effect: (signal: AbortSignal) => Promise<void | (() => void)>,
  deps: DependencyList,
): void {
  const isMountedRef = useRef(true);

  useEffect(() => {
    const abortController = new AbortController();
    isMountedRef.current = true;

    let cleanup: void | (() => void);

    const runEffect = async () => {
      try {
        cleanup = await effect(abortController.signal);
      } catch (error) {
        // Only log errors if not aborted
        if (!abortController.signal.aborted) {
          console.error('useAsyncEffect error:', error);
        }
      }
    };

    runEffect();

    return () => {
      isMountedRef.current = false;
      abortController.abort();
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Simpler version that just runs an async callback.
 * Use when you don't need abort signal or cleanup.
 *
 * @example
 * ```tsx
 * useAsyncEffectOnce(async () => {
 *   await loadData();
 * }, [dependency]);
 * ```
 */
export function useAsyncEffectOnce(effect: () => Promise<void>, deps: DependencyList): void {
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await effect();
      } catch (error) {
        if (mounted) {
          console.error('useAsyncEffectOnce error:', error);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
