'use client';

/**
 * Auth Hook - Wrapper around next-auth/react
 *
 * Provides convenient access to authentication state and actions.
 * For most use cases, prefer using next-auth/react directly.
 */

import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback } from 'react';

export interface UseAuthReturn {
  /** Current user if authenticated */
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  /** Whether authentication state is loading */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Sign in with a provider */
  login: (provider?: string, callbackUrl?: string) => Promise<void>;
  /** Sign out */
  logout: (callbackUrl?: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const { data: session, status } = useSession();

  const login = useCallback(async (provider = 'auth0', callbackUrl = '/') => {
    await signIn(provider, { callbackUrl });
  }, []);

  const logout = useCallback(async (callbackUrl = '/login') => {
    await signOut({ callbackUrl });
  }, []);

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
  };
};
