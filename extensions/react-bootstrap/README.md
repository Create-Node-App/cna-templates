# Bootstrap React

Add Bootstrap React components with TypeScript support and responsive design patterns.

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `[src]/theme/index.ts.append` — Bootstrap CSS import snippet
- `package.json` — `react-bootstrap@^2.10.9`, `bootstrap@^5.3.3`

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons bootstrap-react
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: bootstrap-react
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `bootstrap-react`.
