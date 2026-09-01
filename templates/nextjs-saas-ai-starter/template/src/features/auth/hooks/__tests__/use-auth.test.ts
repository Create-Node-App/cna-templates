/**
 * Tests for useAuth Hook
 */

import { act, renderHook } from '@testing-library/react';

// Mock next-auth/react
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockUseSession = jest.fn();

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  useSession: () => mockUseSession(),
}));

import { useAuth } from '../use-auth';

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when session is loading', () => {
    it('should return isLoading as true', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'user@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated',
      });
    });

    it('should return user data', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should call signOut when logout is called', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
    });

    it('should call signOut with custom callback URL', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout('/custom-logout');
      });

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/custom-logout' });
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    it('should return null user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should call signIn when login is called', async () => {
      mockSignIn.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login();
      });

      expect(mockSignIn).toHaveBeenCalledWith('auth0', { callbackUrl: '/' });
    });

    it('should call signIn with custom provider and callback URL', async () => {
      mockSignIn.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('google', '/dashboard');
      });

      expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
    });
  });
});
