/**
 * Tests for URL State Hooks
 */

import { act, renderHook } from '@testing-library/react';

// Mock next/navigation
const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => mockSearchParams,
}));

import { useUrlDialog, useUrlId, useUrlParam, useUrlTab } from '../use-url-state';

describe('URL State Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('useUrlTab', () => {
    it('should return default tab when URL has no tab param', () => {
      const { result } = renderHook(() => useUrlTab({ defaultTab: 'overview' }));

      expect(result.current[0]).toBe('overview');
    });

    it('should return tab from URL when present', () => {
      mockSearchParams = new URLSearchParams('tab=settings');

      const { result } = renderHook(() => useUrlTab({ defaultTab: 'overview' }));

      expect(result.current[0]).toBe('settings');
    });

    it('should return default tab when URL tab is invalid', () => {
      mockSearchParams = new URLSearchParams('tab=invalid');

      const { result } = renderHook(() =>
        useUrlTab({
          defaultTab: 'overview',
          validTabs: ['overview', 'settings', 'profile'],
        }),
      );

      expect(result.current[0]).toBe('overview');
    });

    it('should update URL when setting tab', () => {
      const { result } = renderHook(() => useUrlTab({ defaultTab: 'overview' }));

      act(() => {
        result.current[1]('settings');
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path?tab=settings', { scroll: false });
    });

    it('should remove tab param when setting to default', () => {
      mockSearchParams = new URLSearchParams('tab=settings');

      const { result } = renderHook(() => useUrlTab({ defaultTab: 'overview' }));

      act(() => {
        result.current[1]('overview');
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path', { scroll: false });
    });

    it('should use push instead of replace when configured', () => {
      const { result } = renderHook(() =>
        useUrlTab({
          defaultTab: 'overview',
          replace: false,
        }),
      );

      act(() => {
        result.current[1]('settings');
      });

      expect(mockPush).toHaveBeenCalledWith('/test-path?tab=settings', { scroll: false });
    });

    it('should use custom param name', () => {
      const { result } = renderHook(() =>
        useUrlTab({
          defaultTab: 'main',
          paramName: 'section',
        }),
      );

      act(() => {
        result.current[1]('other');
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path?section=other', { scroll: false });
    });
  });

  describe('useUrlParam', () => {
    it('should return default value when URL has no param', () => {
      const { result } = renderHook(() =>
        useUrlParam({
          paramName: 'q',
          defaultValue: '',
        }),
      );

      expect(result.current[0]).toBe('');
    });

    it('should return value from URL', () => {
      mockSearchParams = new URLSearchParams('q=hello');

      const { result } = renderHook(() =>
        useUrlParam({
          paramName: 'q',
          defaultValue: '',
        }),
      );

      expect(result.current[0]).toBe('hello');
    });

    it('should parse numeric values', () => {
      mockSearchParams = new URLSearchParams('page=5');

      const { result } = renderHook(() =>
        useUrlParam({
          paramName: 'page',
          defaultValue: 1,
          parse: Number,
        }),
      );

      expect(result.current[0]).toBe(5);
    });

    it('should return default on parse error', () => {
      mockSearchParams = new URLSearchParams('page=notanumber');

      const { result } = renderHook(() =>
        useUrlParam({
          paramName: 'page',
          defaultValue: 1,
          parse: (v) => {
            const n = Number(v);
            if (isNaN(n)) throw new Error('Not a number');
            return n;
          },
        }),
      );

      expect(result.current[0]).toBe(1);
    });

    it('should update URL when setting value', () => {
      const { result } = renderHook(() =>
        useUrlParam<string>({
          paramName: 'q',
          defaultValue: '',
        }),
      );

      act(() => {
        result.current[1]('search term');
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path?q=search+term', { scroll: false });
    });

    it('should serialize values correctly', () => {
      const { result } = renderHook(() =>
        useUrlParam<number>({
          paramName: 'count',
          defaultValue: 0,
          serialize: String,
        }),
      );

      act(() => {
        result.current[1](42);
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path?count=42', { scroll: false });
    });
  });

  describe('useUrlDialog', () => {
    it('should return false when dialog is not open in URL', () => {
      const { result } = renderHook(() =>
        useUrlDialog({
          paramName: 'settings',
        }),
      );

      expect(result.current[0]).toBe(false);
    });

    it('should return true when dialog is open in URL', () => {
      mockSearchParams = new URLSearchParams('settings=open');

      const { result } = renderHook(() =>
        useUrlDialog({
          paramName: 'settings',
        }),
      );

      expect(result.current[0]).toBe(true);
    });

    it('should handle custom open value', () => {
      mockSearchParams = new URLSearchParams('modal=1');

      const { result } = renderHook(() =>
        useUrlDialog({
          paramName: 'modal',
          openValue: '1',
        }),
      );

      expect(result.current[0]).toBe(true);
    });

    it('should update URL when opening dialog', () => {
      const { result } = renderHook(() =>
        useUrlDialog({
          paramName: 'settings',
        }),
      );

      act(() => {
        result.current[1](true);
      });

      expect(mockPush).toHaveBeenCalledWith('/test-path?settings=open', { scroll: false });
    });

    it('should update URL when closing dialog', () => {
      mockSearchParams = new URLSearchParams('settings=open');

      const { result } = renderHook(() =>
        useUrlDialog({
          paramName: 'settings',
        }),
      );

      act(() => {
        result.current[1](false);
      });

      expect(mockPush).toHaveBeenCalledWith('/test-path', { scroll: false });
    });

    it('should use replace when configured', () => {
      const { result } = renderHook(() =>
        useUrlDialog({
          paramName: 'modal',
          replace: true,
        }),
      );

      act(() => {
        result.current[1](true);
      });

      expect(mockReplace).toHaveBeenCalled();
    });
  });

  describe('useUrlId', () => {
    it('should return null when no ID in URL', () => {
      const { result } = renderHook(() =>
        useUrlId({
          paramName: 'job',
        }),
      );

      expect(result.current[0]).toBeNull();
    });

    it('should return ID from URL', () => {
      mockSearchParams = new URLSearchParams('job=job-123');

      const { result } = renderHook(() =>
        useUrlId({
          paramName: 'job',
        }),
      );

      expect(result.current[0]).toBe('job-123');
    });

    it('should update URL when setting ID', () => {
      const { result } = renderHook(() =>
        useUrlId({
          paramName: 'job',
        }),
      );

      act(() => {
        result.current[1]('new-job-id');
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path?job=new-job-id', { scroll: false });
    });

    it('should remove param when setting ID to null', () => {
      mockSearchParams = new URLSearchParams('job=job-123');

      const { result } = renderHook(() =>
        useUrlId({
          paramName: 'job',
        }),
      );

      act(() => {
        result.current[1](null);
      });

      expect(mockReplace).toHaveBeenCalledWith('/test-path', { scroll: false });
    });

    it('should use push when configured', () => {
      const { result } = renderHook(() =>
        useUrlId({
          paramName: 'item',
          replace: false,
        }),
      );

      act(() => {
        result.current[1]('item-1');
      });

      expect(mockPush).toHaveBeenCalledWith('/test-path?item=item-1', { scroll: false });
    });
  });
});
