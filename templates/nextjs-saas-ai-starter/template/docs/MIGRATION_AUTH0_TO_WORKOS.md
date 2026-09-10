# 🔄 Migrating from Auth0 to WorkOS

This guide moves a deployed Next.js SaaS AI Template instance from Auth0 to
WorkOS as the production SSO provider. The migration is a provider swap plus
environment variables — no database migration is required.

## What Changes

| Old (Auth0)                          | New (WorkOS)                          |
|--------------------------------------|---------------------------------------|
| `AUTH0_CLIENT_ID`                    | `WORKOS_CLIENT_ID`                    |
| `AUTH0_CLIENT_SECRET`                | `WORKOS_CLIENT_SECRET` (`sk_...` API key) |
| `AUTH0_ISSUER`                       | `WORKOS_CONNECTION_ID` (optional)     |
| `signIn('auth0')`                    | `signIn('workos')`                    |
| Callback `/api/auth/callback/auth0`  | Callback `/api/auth/callback/workos`  |

## What Stays the Same

- `AUTH_SECRET` — unchanged
- Drizzle schema (`users`, `accounts`, `sessions`) — provider-agnostic
- RBAC and permissions — independent of the auth provider
- Multi-tenant routing and session scoping
- All page components, layouts, and server actions

## Step 1 — Create a WorkOS Account and Get API Keys

1. Sign up at [dashboard.workos.com](https://dashboard.workos.com/)
2. Copy the **Client ID** (`client_...`) → `WORKOS_CLIENT_ID`
3. Copy the **API key** (`sk_...`) → `WORKOS_CLIENT_SECRET`

## Step 2 — Configure the SSO Connection

1. In the WorkOS dashboard, create an SSO connection (SAML or OIDC) for
   your organization, or enable social logins
2. Add the redirect URI for every environment:
   - Local: `http://localhost:3000/api/auth/callback/workos`
   - Production: `https://your-app.com/api/auth/callback/workos`
3. (Optional) Copy the connection ID (`conn_...`) → `WORKOS_CONNECTION_ID`
   to pin logins to one connection; omit it to let users pick by domain

## Step 3 — Set the New Environment Variables

```env
AUTH_PROVIDER="workos"
NEXT_PUBLIC_AUTH_PROVIDER="workos"
WORKOS_CLIENT_ID="client_..."
WORKOS_CLIENT_SECRET="sk_..."
WORKOS_CONNECTION_ID="conn_..."  # optional
```

Keep the old `AUTH0_*` variables until you have verified the WorkOS flow;
they are ignored while `AUTH_PROVIDER=workos`. Remove them after cutover.

## Step 4 — Deploy

```bash
pnpm type-check && pnpm lint && pnpm test
pnpm build
```

Set both `AUTH_PROVIDER` and `NEXT_PUBLIC_AUTH_PROVIDER` in your hosting
provider (the server registers the provider; the client renders the button).

## Step 5 — Handle Existing Users

The Auth.js `accounts` table stores one row per provider linkage, so existing
Auth0 accounts **coexist** with new WorkOS accounts:

- A user signing in via WorkOS for the first time creates a **new** `users`
  row (matched by email in development mode only) linked to a `workos`
  account row
- To link a WorkOS login to an existing Auth0 user, match on the verified
  email and attach the new account row to the existing user ID
- Tenant memberships are keyed by user ID: re-create memberships for the new
  user rows, or link accounts before users need access

## Step 6 — Verify

- [ ] `signIn('workos')` redirects to WorkOS and back to `/select-tenant`
- [ ] New row in `accounts` has `provider = 'workos'`
- [ ] Roles/permissions resolve in the session (tenant switching works)
- [ ] `pnpm lint`, `pnpm type-check`, `pnpm test` pass

## Files Involved

1. `src/shared/lib/env.ts` — `AUTH_PROVIDER` + `WORKOS_*` schema
2. `src/shared/lib/auth.ts` — provider registration + `activeAuthProviderId`
3. `src/shared/lib/auth-providers.ts` — resolution logic (tested)
4. `src/features/auth/hooks/use-auth.ts` — configurable default provider
5. `src/features/auth/components/LoginForm.tsx` — active-provider button
6. `src/features/auth/components/TenantLoginForm.tsx` — active-provider button
7. `.env.example` / `.envrc.example` — WorkOS variables
8. `docs/AUTHENTICATION.md` — WorkOS setup section (this guide is linked there)

## References

- [WorkOS dashboard](https://dashboard.workos.com/)
- [Auth.js v5 WorkOS provider](https://authjs.dev/getting-started/providers/workos)
- [WorkOS NextAuth integration](https://workos.com/docs/integrations/next-auth)
- [WorkOS SSO API reference](https://workos.com/docs/reference/sso)
