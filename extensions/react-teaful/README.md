# Teaful (Deprecated)

Add Teaful, a tiny and fast state management solution with a simple API and TypeScript support. Note: Teaful has very low adoption (~126 weekly downloads) and may not receive future updates.

> **Deprecated:** Teaful has very low weekly downloads and may be removed in a future major release. Prefer Jotai, Zustand, or Valtio for new projects.

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `package.json` — `dependencies`: `teaful@^0.12.1`
- No additional source files — import `teaful` directly in components.

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons teaful
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: teaful
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `teaful`.
