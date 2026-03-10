'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Auth Provider wrapper for client-side session access
 *
 * Wraps the application with NextAuth's SessionProvider to enable
 * useSession() hook in client components.
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
