# Authentication Guide: Auth.js, WorkOS SSO, and WorkOS AuthKit

This guide helps you choose between the Next.js auth extensions in this repo
and set up WorkOS correctly. All three options below are production-ready;
they differ in how much UI and session plumbing you own.

## Options at a glance

- **`nextjs-auth`** — Auth.js v5 (NextAuth) with OAuth providers (GitHub,
  Google, Auth0, WorkOS, ...). You build your own sign-in UI and session
  handling around it. Maximum control, most work.
- **`nextjs-workos`** — enterprise SSO via WorkOS through the Auth.js v5
  built-in `workos` provider (verified present in `@auth/core@0.41.3`, the
  `next-auth@5.0.0-beta.32` dependency). Pick this when enterprise customers
  must sign in via their own IdP (SAML/OIDC) and you already own — or want to
  own — the sign-in UI. Combines with `nextjs-auth`.
- **`nextjs-authkit`** — WorkOS AuthKit: fully hosted sign-in/sign-up, MFA,
  password reset, and session management via `@workos-inc/authkit-nextjs`.
  Best default for most apps, including B2C. Incompatible with `nextjs-auth`
  and `nextjs-workos` — install only one of the two WorkOS extensions.

## Comparison

| Feature | WorkOS SSO (`nextjs-workos`) | WorkOS AuthKit (`nextjs-authkit`) | Auth0 (via `nextjs-auth`) |
|---|---|---|---|
| Auth.js integration | Built-in `workos` provider | Custom SDK (`authkit-nextjs`) | Built-in `auth0` provider |
| Hosted UI | No — you build sign-in UI | Yes — sign-in, sign-up, password reset | Yes — Universal Login |
| Enterprise SSO | Yes (SAML/OIDC connections) | Yes | Yes |
| Organization management | WorkOS API / dashboard | WorkOS dashboard, `organizationId` in session | Organizations feature |
| MFA | IdP-dependent | Built-in | Built-in |
| Pricing shape | WorkOS free tier; SSO usage-based | WorkOS free tier | Free tier; SSO/Organizations need a paid plan |

Provider availability was verified against the pinned `next-auth` dependency
(`@auth/core@0.41.3` ships `providers/workos.js` and `providers/auth0.js`).

## Setup pointers

- **WorkOS SSO (`nextjs-workos`)** — follow
  [`extensions/nextjs-workos/docs/WORKOS_SSO_SETUP.md`](https://github.com/Create-Node-App/cna-templates/tree/main/extensions/nextjs-workos/docs/WORKOS_SSO_SETUP.md):
  dashboard credentials, SSO connection, redirect URI
  `<origin>/api/auth/callback/workos`, `WORKOS_*` env vars, local testing with
  the WorkOS Test Organization.
- **WorkOS AuthKit (`nextjs-authkit`)** — see the extension README: dashboard
  Redirects (`/callback`, `/sign-in`), `.env.local` variables, `callback` and
  `sign-in` routes, `proxy.ts`/`middleware.ts` integration, and
  `AuthKitProvider` in the root layout. Each WorkOS Organization maps to one
  tenant in your app — scope per-tenant data by the session's `organizationId`.
- **Auth.js (`nextjs-auth`)** — see the extension README: providers in
  `[src]/lib/auth.ts`, the `/api/auth/[...nextauth]` route handler,
  `AUTH_SECRET` plus per-provider env vars.

## Migrating from Auth.js (`nextjs-auth`) to AuthKit (`nextjs-authkit`)

1. Remove the `nextjs-auth` extension files (`[src]/lib/auth.ts`, the
   `/api/auth/[...nextauth]` route, `middleware-handlers.ts` snippet) and its
   provider env vars.
2. Apply `nextjs-authkit` and configure the dashboard Redirects plus
   `.env.local` as described in its README.
3. Replace `auth()` / `useSession()` call sites with `withAuth()` (server) and
   `useAuth()` (client) from `@workos-inc/authkit-nextjs`.
4. Map tenants: where you previously keyed data by the OAuth `sub`/email, key
   by the AuthKit session's `organizationId` + `user.id` instead.
5. Keep both extensions out of the same project — they are declared
   `incompatibleWith` each other in `templates.json`.
