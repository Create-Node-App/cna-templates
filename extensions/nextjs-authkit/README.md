# WorkOS AuthKit for Next.js

Adds [WorkOS AuthKit](https://workos.com/docs/authkit) to your Next.js project —
a fully hosted authentication UI with sign-in, sign-up, MFA, password reset,
and enterprise SSO, with no auth screens for you to build or maintain.

## AuthKit vs raw SSO: when to use which

- **`nextjs-authkit`** (this extension) — you want a complete, hosted auth
  experience out of the box: sign-in/sign-up pages, password reset, MFA, and
  session management, all handled by WorkOS. Best default choice for most
  apps, including B2C.
- **`nextjs-workos`** — you only need the raw SSO connection (e.g. enterprise
  customers signing in via their own IdP) and want to build your own sign-in
  UI around it. More control, more work.

These two extensions are **incompatible** — install only one.

## Setup

### 1. WorkOS dashboard setup

1. Create a free account at [dashboard.workos.com](https://dashboard.workos.com).
2. Grab your **API key** and **Client ID** from the dashboard home screen.
3. Under **Redirects**, set:
   - **Redirect URI**: `http://localhost:3000/callback` for local dev
   - **Sign-in endpoint**: `http://localhost:3000/sign-in`
   - **Logout URI**: wherever you want users sent after sign-out
4. (Optional) Configure MFA, password policy, and SSO connections under
   **Authentication** and **Organizations**.

### 2. Environment configuration

Copy the appended variables from `.env.example` into `.env.local` and fill them in:

```dotenv
WORKOS_API_KEY=sk_your_api_key
WORKOS_CLIENT_ID=client_your_client_id
WORKOS_COOKIE_PASSWORD="<replace-with-a-randomly-generated-secret-of-32+-characters>"
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

Generate a cookie password (must be 32+ characters) with:

```bash
openssl rand -base64 24
```

### 3. Callback and sign-in routes

This extension adds two route handlers:

- `app/callback/route.ts` — exchanges the WorkOS redirect code for a session.
  Must be reachable at the exact path set as your dashboard's **Redirect URI**.
- `app/sign-in/route.ts` — the entry point that starts the AuthKit flow. Must
  match your dashboard's **Sign-in endpoint**. Without this, WorkOS-initiated
  flows like dashboard impersonation will fail.

### 4. proxy.ts / middleware integration

This extension appends an AuthKit check into `middleware-handlers.ts`, the
project's composable middleware system, using AuthKit's `authkit()` +
`handleAuthkitHeaders()` helpers. This works the same way whether your
project uses `proxy.ts` (Next.js 16+) or `middleware.ts` (Next.js ≤15) —
only the entry file name differs, not the handler logic.

### 5. Wrap your layout in `AuthKitProvider`

```tsx
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthKitProvider>{children}</AuthKitProvider>
      </body>
    </html>
  );
}
```

## Usage

### `withAuth()` — server-side session

Use in Server Components, Route Handlers, or Server Actions:

```tsx
import { getSignInUrl, getSignUpUrl, withAuth, signOut } from '@workos-inc/authkit-nextjs';

export default async function HomePage() {
  const { user } = await withAuth();

  if (!user) {
    const signInUrl = await getSignInUrl();
    const signUpUrl = await getSignUpUrl();
    return (
      <>
        <a href={signInUrl}>Log in</a>
        <a href={signUpUrl}>Sign up</a>
      </>
    );
  }

  return (
    <form action={async () => { 'use server'; await signOut(); }}>
      <p>Welcome back{user.firstName && `, ${user.firstName}`}</p>
      <button type="submit">Sign out</button>
    </form>
  );
}
```

For pages where sign-in is mandatory, pass `{ ensureSignedIn: true }` to
`withAuth()` — it will redirect unauthenticated users to AuthKit automatically.
Don't wrap it in try/catch; Next.js redirects must happen outside one.

### `useAuth()` — client-side session

```tsx
'use client';
import { useAuth } from '@workos-inc/authkit-nextjs/components';

export function UserBadge() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <span>{user?.email}</span>;
}
```

### Organization-to-tenant mapping

For multi-tenant apps, each WorkOS `Organization` maps to a tenant in your
app. The session's `organizationId` (available via `withAuth()`) is the key
to use when scoping data per tenant — treat it the same way you'd treat a
`tenantId` foreign key elsewhere in your schema. `refreshSession` /
`refreshAuth` also accept an `organizationId` to switch a session between
organizations.

## References

- [AuthKit Next.js docs](https://workos.com/docs/authkit/nextjs)
- [authkit-nextjs GitHub repo & full README](https://github.com/workos/authkit-nextjs)
- [WorkOS dashboard](https://dashboard.workos.com)
