# WorkOS SSO for Next.js

Adds enterprise SSO via [WorkOS](https://workos.com/) to your Next.js project
using the Auth.js v5 built-in [`next-auth/providers/workos`](https://authjs.dev/getting-started/providers/workos)
provider — SAML, OIDC, and social login with connection support.

## When to use this

- **`nextjs-workos`** (this extension) — you only need the raw SSO connection
  (e.g. enterprise customers signing in via their own IdP) and want to build
  your own sign-in UI around Auth.js. More control, more work.
- **`nextjs-authkit`** — you want a complete, hosted auth experience out of
  the box: sign-in/sign-up pages, password reset, MFA, and session management,
  all handled by WorkOS. Best default choice for most apps, including B2C.

These two extensions are **incompatible** — install only one.

## Compatible types

- `nextjs` → `nextjs-starter`

Combine with `nextjs-auth` to get the base Auth.js config (`[src]/lib/auth.ts`
plus the `/api/auth/[...nextauth]` route) and spread `workosProvider` into its
`providers` array.

## Files

- `[src]/lib/workos.ts` — preconfigured WorkOS provider (`workosProvider`)
- `.env.example.append` — `WORKOS_CLIENT_ID`, `WORKOS_CLIENT_SECRET`, `WORKOS_CONNECTION_ID`
- `package.json` — `next-auth@5.0.0-beta.32` (same version as `nextjs-auth`, so combined installs dedupe)

## Setup

Full walkthrough: [WorkOS SSO Setup](./docs/WORKOS_SSO_SETUP.md).

1. Create a free account at [dashboard.workos.com](https://dashboard.workos.com)
   and grab your **Client ID** and **API key**.
2. Create an SSO **connection** for your identity provider and note its **Connection ID**.
3. Set the redirect URI to `http://localhost:3000/api/auth/callback/workos` for local dev.
4. Copy the appended `WORKOS_*` variables from `.env.example` into `.env.local` and fill them in.
5. Add the provider to your Auth.js config:

```typescript
import { workosProvider } from './workos';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ...your other providers
    workosProvider,
  ],
});
```

## Apply

```sh
npx create-awesome-node-app my-app --template nextjs-starter --addons nextjs-auth nextjs-workos
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addons: nextjs-auth, nextjs-workos
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `nextjs-workos`.
3. Generated `.env.example` includes the `WORKOS_*` variables and `[src]/lib/workos.ts` exports `workosProvider`.

## References

- [WorkOS x NextAuth.js](https://workos.com/docs/integrations/next-auth)
- [Auth.js WorkOS provider](https://authjs.dev/getting-started/providers/workos)
- [WorkOS docs](https://workos.com/docs)
