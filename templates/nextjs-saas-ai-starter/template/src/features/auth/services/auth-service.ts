/**
 * Auth Service - Server-side authentication utilities
 *
 * This module provides server-side authentication helpers.
 * For client-side auth, use the useAuth hook or next-auth/react directly.
 */

import { auth } from '@/shared/lib/auth';

/**
 * Get the current session on the server
 *
 * @example
 * // In a Server Component or API route
 * const session = await getSession();
 * if (!session) {
 *   redirect('/login');
 * }
 */
export async function getSession() {
  return auth();
}

/**
 * Get the current user from the session
 *
 * @example
 * const user = await getCurrentUser();
 * if (!user) {
 *   throw new Error('Not authenticated');
 * }
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}
