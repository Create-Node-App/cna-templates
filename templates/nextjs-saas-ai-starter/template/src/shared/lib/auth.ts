/**
 * Auth.js Configuration - Next.js SaaS AI Template
 *
 * Centralized authentication configuration using Auth.js v5.
 * Supports Auth0 as primary provider with Drizzle adapter.
 *
 * @see https://authjs.dev
 */

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import Credentials from 'next-auth/providers/credentials';

// Re-export Session type for use in tests and type utilities
export type { Session };

import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import type { TenantRole } from '@/shared/db/schema/auth';
import { env } from '@/shared/lib/env';
import { getAllTenantPermissionsForUser } from '@/shared/lib/permissions';

// ============================================================================
// TYPE EXTENSIONS
// ============================================================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** Role per tenant slug: { "example": "admin", "acme": "member" } */
      roles: Record<string, TenantRole>;
      /** Permission keys per tenant slug (for UI/nav only; API authorization always uses DB) */
      permissions?: Record<string, string[]>;
    };
  }
}

// ============================================================================
// PROVIDERS
// ============================================================================

// Build providers array based on available configuration
const providers: NextAuthConfig['providers'] = [];

// Auth0 provider (production)
if (env.AUTH0_CLIENT_ID && env.AUTH0_CLIENT_SECRET && env.AUTH0_ISSUER) {
  providers.push(
    Auth0({
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      issuer: env.AUTH0_ISSUER,
    }),
  );
}

// Credentials provider for development/testing
// Use NEXT_PUBLIC_STAGE for deployment (build is always NODE_ENV=production)
// Fall back to NODE_ENV for local development
const isDevelopmentStage =
  typeof window !== 'undefined' ? false : process.env.NEXT_PUBLIC_STAGE === 'dev' || env.NODE_ENV === 'development';

if (isDevelopmentStage) {
  providers.push(
    Credentials({
      id: 'development',
      name: 'Development Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'dev@example.com' },
      },
      async authorize(credentials) {
        // In development, allow any email to sign in
        const email = credentials?.email as string;
        if (!email) return null;

        // Find or create user in database to ensure consistent IDs
        let user = await db.query.users.findFirst({
          where: eq(schema.users.email, email),
        });

        if (!user) {
          // Create the user if doesn't exist
          const [newUser] = await db
            .insert(schema.users)
            .values({
              email,
              name: email.split('@')[0],
            })
            .returning();
          user = newUser;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  );
}

// ============================================================================
// HELPER: Load user roles from database
// ============================================================================

async function loadUserRoles(userId: string): Promise<Record<string, TenantRole>> {
  try {
    const memberships = await db.query.tenantMemberships.findMany({
      where: eq(schema.tenantMemberships.userId, userId),
      with: {
        tenant: true,
      },
    });

    return Object.fromEntries(memberships.map((m) => [m.tenant.slug, m.role]));
  } catch {
    // Table might not exist yet during initial setup
    return {};
  }
}

// ============================================================================
// NEXT AUTH CONFIG
// ============================================================================

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
    authenticatorsTable: schema.authenticators,
  }),
  providers,
  session: {
    // Use JWT for credentials provider (no database session)
    // Check NEXT_PUBLIC_STAGE for deployment, NODE_ENV for local dev
    strategy:
      typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_STAGE === 'dev' || env.NODE_ENV === 'development')
        ? 'jwt'
        : 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user id and permissions to the token on sign in (JWT strategy)
      if (user?.id) {
        token.id = user.id;
        token.roles = await loadUserRoles(user.id);
        token.permissions = await getAllTenantPermissionsForUser(user.id);
      }
      return token;
    },
    async session({ session, user, token }) {
      // Add user ID, roles and permissions to session
      if (session.user) {
        const userId = user?.id ?? token?.id;
        if (typeof userId === 'string') {
          session.user.id = userId;

          if (token?.roles) {
            session.user.roles = token.roles as Record<string, TenantRole>;
          } else {
            session.user.roles = await loadUserRoles(userId);
          }

          // Permissions: from token (JWT) or compute for database strategy (UI/nav only; APIs always use hasPermission against DB)
          if (token?.permissions) {
            session.user.permissions = token.permissions as Record<string, string[]>;
          } else {
            session.user.permissions = await getAllTenantPermissionsForUser(userId);
          }
        } else {
          session.user.roles = {};
          session.user.permissions = {};
        }
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes that don't require authentication
      const publicRoutes = ['/login', '/api/health', '/'];
      const isPublicRoute =
        publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/auth')) ||
        pathname.startsWith('/docs') ||
        pathname.startsWith('/api/docs');

      if (isPublicRoute) {
        return true;
      }

      // Tenant login pages are public (allow unauthenticated access)
      // Format: /t/[tenant]/login
      if (pathname.match(/^\/t\/[^/]+\/login$/)) {
        return true;
      }

      // Select tenant page requires auth (it's the post-login landing)
      if (pathname === '/select-tenant') {
        return isLoggedIn;
      }

      // Other tenant routes require authentication
      if (pathname.startsWith('/t/')) {
        return isLoggedIn;
      }

      return true;
    },
  },
  trustHost: true,
  debug: process.env.NEXT_PUBLIC_STAGE === 'dev' || process.env.NODE_ENV === 'development',
});
