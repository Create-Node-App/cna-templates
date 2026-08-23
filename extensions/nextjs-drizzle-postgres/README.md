# Drizzle ORM + PostgreSQL for Next.js

Add Drizzle ORM with PostgreSQL to your Next.js project. Includes schema setup, migrations, Docker Compose for local development, and db:* scripts.

## Compatible types

- `nextjs` → `nextjs-starter`

## Files

- `drizzle.config.ts.template` — Drizzle Kit config (PostgreSQL, EJS)
- `[src]/db/index.ts` — Drizzle client + connection
- `[src]/db/schema/index.ts` — example schema
- `docker/compose.yml` — local PostgreSQL service
- `.env.example.append` — `DATABASE_URL`
- `package.json` — `drizzle-orm`, `pg`/`postgres`, `drizzle-kit`, scripts `db:*`

## Apply

```sh
npx create-awesome-node-app my-app --template nextjs-starter --addons nextjs-drizzle-postgres
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: nextjs-drizzle-postgres
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `nextjs-drizzle-postgres`.
