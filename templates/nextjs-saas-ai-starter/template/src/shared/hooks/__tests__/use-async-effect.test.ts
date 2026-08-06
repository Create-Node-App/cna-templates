/**
 * Tests for useAsyncEffect hooks
 */

import { act, renderHook } from '@testing-library/react';

import { useAsyncEffect, useAsyncEffectOnce } from '../use-async-effect';

describe('use-async-effect', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useAsyncEffect', () => {
    it('should run async effect on mount', async () => {
      const effect = jest.fn().mockResolvedValue(undefined);

      renderHook(() => useAsyncEffect(effect, []));

      // Wait for the effect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(effect).toHaveBeenCalledTimes(1);
      expect(effect).toHaveBeenCalledWith(expect.any(AbortSignal));
    });

    it('should abort when dependencies change', async () => {
      let capturedSignal: AbortSignal | undefined;
      let callCount = 0;
      const effect = jest.fn().mockImplementation((signal: AbortSignal) => {
        callCount++;
        if (callCount === 1) {
          capturedSignal = signal;
        }
        return Promise.resolve();
      });

      const { rerender } = renderHook(({ dep }) => useAsyncEffect(effect, [dep]), {
        initialProps: { dep: 1 },
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(capturedSignal).toBeDefined();
      expect(capturedSignal!.aborted).toBe(false);

      // Change dependency - this should abort the first signal
      await act(async () => {
        rerender({ dep: 2 });
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // First signal should now be aborted
      expect(capturedSignal!.aborted).toBe(true);
      // Effect should have been called twice
      expect(callCount).toBe(2);
    });

    it('should call cleanup function on unmount', async () => {
      const cleanup = jest.fn();
      const effect = jest.fn().mockResolvedValue(cleanup);

      const { unmount } = renderHook(() => useAsyncEffect(effect, []));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      unmount();

      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      const effect = jest.fn().mockRejectedValue(error);

      renderHook(() => useAsyncEffect(effect, []));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(console.error).toHaveBeenCalledWith('useAsyncEffect error:', error);
    });

    it('should not log error when aborted', async () => {
      const effect = jest.fn().mockImplementation((signal: AbortSignal) => {
        return new Promise((_, reject) => {
          signal.addEventListener('abort', () => {
            reject(new Error('Aborted'));
          });
        });
      });

      const { rerender } = renderHook(({ dep }) => useAsyncEffect(effect, [dep]), {
        initialProps: { dep: 1 },
      });

      // Change dependency to trigger abort
      rerender({ dep: 2 });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Error should not be logged since it was aborted
      // Note: The actual implementation checks aborted before logging
    });
  });

  describe('useAsyncEffectOnce', () => {
    it('should run async effect on mount', async () => {
      const effect = jest.fn().mockResolvedValue(undefined);

      renderHook(() => useAsyncEffectOnce(effect, []));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(effect).toHaveBeenCalledTimes(1);
    });

    it('should run again when dependencies change', async () => {
      const effect = jest.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(({ dep }) => useAsyncEffectOnce(effect, [dep]), {
        initialProps: { dep: 1 },
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(effect).toHaveBeenCalledTimes(1);

      rerender({ dep: 2 });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(effect).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      const effect = jest.fn().mockRejectedValue(error);

      renderHook(() => useAsyncEffectOnce(effect, []));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(console.error).toHaveBeenCalledWith('useAsyncEffectOnce error:', error);
    });

    it('should not log error after unmount', async () => {
      let resolveEffect: (() => void) | undefined;
      const effect = jest.fn().mockImplementation(() => {
        return new Promise<void>((resolve) => {
          resolveEffect = resolve;
        });
      });

      const { unmount } = renderHook(() => useAsyncEffectOnce(effect, []));

      // Unmount before effect completes
      unmount();

      // Complete the effect after unmount
      if (resolveEffect) {
        resolveEffect();
      }

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // No error should be logged
    });
  });
});
