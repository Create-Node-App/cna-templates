# React Redux with Redux Saga

Extension to add Redux Toolkit (RTK) with React Redux bindings and Redux Saga for side-effect management

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `[src]/store.ts.template` — Redux Toolkit store with saga middleware (EJS)
- `[src]/reducers/index.ts` — root reducer
- `[src]/sagas/index.ts.template` + `[src]/sagas/example/index.ts` — example saga
- `[src]/app-providers.tsx.append.template` — Provider wrapper (EJS)
- `[src]/types/store.ts.template` — typed `RootState` / `AppDispatch`
- `package.json` — `@reduxjs/toolkit`, `react-redux`, `redux-saga`, `redux-logger`, `redux-persist`

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons react-redux-saga
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: react-redux-saga
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `react-redux-saga`.
