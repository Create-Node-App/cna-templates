# 🔐 Authentication

The Next.js SaaS AI Template uses **Auth.js v5** (NextAuth) with database sessions and Auth0 as the primary provider.

## Configuration

### Environment Variables

```env
# Required
AUTH_SECRET="your-secret-key-min-32-chars"  # Generate: openssl rand -base64 32
DATABASE_URL="postgresql://..."

# Auth0 (production)
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
AUTH0_ISSUER="https://your-tenant.auth0.com"
```

### Auth.js Setup

Configuration is in `src/shared/lib/auth.ts`:

```typescript
import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { ... }),
  providers: [Auth0({ ... })],
  session: { strategy: 'database' },
  // ...
});
```

## Usage

### Server Components

```typescript
import { auth } from '@/shared/lib/auth';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <div>Hello {session.user.name}</div>;
}
```

### Client Components

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <Spinner />;

  if (!session) {
    return <Button onClick={() => signIn('auth0')}>Sign In</Button>;
  }

  return (
    <div>
      <span>{session.user.name}</span>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
```

### Feature Hook

The auth feature provides a convenient hook:

```typescript
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // ...
}
```

### Server-Side Utilities

```typescript
import { getSession, getCurrentUser, isAuthenticated } from '@/features/auth';

// In API routes or server actions
export async function myServerAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // ...
}
```

## Protected Routes

### Middleware Protection

Routes are protected via `src/middleware.ts`:

```typescript
export default auth((request) => {
  // Auth.js automatically handles session validation
  // The authorized callback in auth.ts defines which routes are protected
});
```

### Auth Callback Configuration

In `src/shared/lib/auth.ts`:

```typescript
callbacks: {
  async authorized({ auth, request }) {
    const isLoggedIn = !!auth?.user;
    const { pathname } = request.nextUrl;

    // Public routes
    const publicRoutes = ['/login', '/api/health', '/'];
    if (publicRoutes.includes(pathname)) return true;

    // Tenant routes require auth
    if (pathname.startsWith('/t/')) return isLoggedIn;

    return true;
  },
}
```

## Development Mode

In development, a credentials provider is available for testing:

```typescript
// Login with any email in development
await signIn('development', { email: 'test@example.com' });
```

This is automatically enabled when `NODE_ENV=development`.

## Database Schema

Auth.js tables are defined in `src/shared/db/schema/auth.ts`:

- `users` - User accounts
- `accounts` - OAuth provider connections
- `sessions` - Active sessions
- `verification_tokens` - Email verification
- `authenticators` - WebAuthn credentials

## Auth0 Setup

1. Create an Auth0 application (Regular Web Application)
2. Configure callback URLs:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback/auth0`
   - Allowed Logout URLs: `http://localhost:3000`
3. Copy Client ID, Client Secret, and Issuer to `.env.local`

## Best Practices

1. **Always check auth server-side** before rendering sensitive data
2. **Use session strategy: database** for security (not JWT for sensitive apps)
3. **Protect API routes** with session checks
4. **Log auth events** for security auditing
5. **Use HTTPS in production** (Auth.js requires it)

## Related Documentation

- [Auth.js v5 Docs](https://authjs.dev)
- [Auth0 Quickstart](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Project Structure](./PROJECT_STRUCTURE.md)
