# Auth.js v5 for Next.js

Add Auth.js v5 (next-auth@beta, latest: 5.0.0-beta.31) to your Next.js project with OAuth providers support, database sessions, and TypeScript-typed session. Note: v5 remains in beta as of 2026 — see https://authjs.dev for updates.

## Compatible types

- `nextjs` → `nextjs-starter`

## Files

- `[src]/lib/auth.ts` — Auth.js config & providers
- `[src]/app/api/auth/[...nextauth]/route.ts.template` — Auth.js route handler (EJS)
- `[src]/middleware-handlers.ts.append.template` — auth middleware snippet
- `.env.example.append` — `AUTH_SECRET`, provider env vars
- `package.json` — `next-auth@5.0.0-beta.32`

## Apply

```sh
npx create-awesome-node-app my-app --template nextjs-starter --addons nextjs-auth
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: nextjs-auth
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `nextjs-auth`.
