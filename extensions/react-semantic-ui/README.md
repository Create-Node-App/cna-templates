# Semantic UI React

Extension to add Semantic UI React to your setup
> **Note:** Semantic UI React is unmaintained (last release 2021) and depends on legacy `semantic-ui-css`. Consider migrating to shadcn/ui or Material UI for new projects.


## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `[src]/theme/index.ts.append` — Semantic UI CSS import snippet
- `package.json` — `semantic-ui-react@^2.1.5`, `semantic-ui-css@^2.5.0`

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons semantic-ui-react
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: semantic-ui-react
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `semantic-ui-react`.
