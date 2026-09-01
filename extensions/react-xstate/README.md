# XState

Add XState, a state management and orchestration solution for complex state machines and workflows.

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `package.json` — `dependencies`: `xstate@^5.19.2`, `@xstate/react@^6.1.0`
- No additional source files — define machines with `createMachine()` / `setup()` and use `useMachine()` from `@xstate/react`.

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons xstate
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: xstate
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `xstate`.
