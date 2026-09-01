# Drizzle ORM SQLite

Add Drizzle ORM with SQLite to your NestJS API with TypeScript support and best practices for database operations.

## Compatible types

- `nestjs-backend` → `nestjs-boilerplate`

## Files

- `drizzle.config.ts` — Drizzle Kit config (SQLite)
- `src/db/schema.ts` — example table schema
- `src/db/drizzle.provider.ts` — NestJS provider for Drizzle
- `src/app.module.ts` — imports Drizzle module
- `.env.example.append` / `.env.local.append` — DB env vars
- `package.json` — scripts `drizzle:*`, deps `drizzle-orm`, `better-sqlite3`

## Apply

```sh
npx create-awesome-node-app my-app --template nestjs-boilerplate --addons drizzle-orm-sqlite
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: drizzle-orm-sqlite
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `drizzle-orm-sqlite`.
