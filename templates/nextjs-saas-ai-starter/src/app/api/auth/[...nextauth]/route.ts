/**
 * Auth.js API Route Handler
 *
 * Handles all /api/auth/* routes for authentication.
 * - GET /api/auth/signin - Sign in page
 * - GET /api/auth/signout - Sign out page
 * - POST /api/auth/signin/:provider - Provider sign in
 * - GET /api/auth/callback/:provider - OAuth callback
 * - GET /api/auth/session - Get session
 * - POST /api/auth/session - Update session
 */

import { handlers } from '@/shared/lib/auth';

export const { GET, POST } = handlers;
