# shadcn/ui for Next.js

Add shadcn/ui component library to your Next.js project with Radix UI primitives, class-variance-authority, and a cn() utility.

## Compatible types

- `nextjs` → `nextjs-starter`

## Files

- `components.json` — shadcn/ui config
- `[src]/components/ui/button.tsx.template` — example shadcn button (EJS)
- `[src]/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `[src]/app/globals.css.append` — Tailwind base + shadcn CSS vars
- `tailwind.config.ts.template` / `postcss.config.mjs.template` — Tailwind setup
- `package.json` — Radix UI, CVA, clsx, tailwind-merge, tailwindcss

## Apply

```sh
npx create-awesome-node-app my-app --template nextjs-starter --addons nextjs-shadcn
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: nextjs-shadcn
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `nextjs-shadcn`.
