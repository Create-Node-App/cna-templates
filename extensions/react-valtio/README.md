# Valtio

Extension to add Valtio, a tiny state management library for React

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `package.json` — `dependencies`: `valtio@^2.1.3`
- No additional source files — Valtio is a proxy-based state library; create proxies with `proxy()` and use `useSnapshot()`.

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons valtio
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: valtio
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `valtio`.
