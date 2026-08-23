# Hookstate

Add Hookstate, a modern state management solution with hooks-based API and TypeScript support.

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `package.json` — `dependencies`: `@hookstate/core@^4.0.1`
- No additional source files — Hookstate is added as a dependency; import `hookstate` in your stores.

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons hookstate
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: hookstate
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `hookstate`.
