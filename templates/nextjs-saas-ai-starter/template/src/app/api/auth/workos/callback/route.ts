import { handleAuth } from '@workos-inc/authkit-nextjs';

/**
 * WorkOS AuthKit callback handler (advanced opt-in).
 *
 * Completes the AuthKit login flow and establishes the session cookie.
 * Only reachable in a deployment with full AuthKit configuration; the
 * default Auth.js flow uses `/api/auth/callback/workos` instead.
 *
 * Set `WORKOS_REDIRECT_URI` to this route's public URL.
 */
export const GET = handleAuth();
