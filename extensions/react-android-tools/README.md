# Android Tools

Avoid using heavy IDEs by installing this extension that creates an elegant tool setup for your android app

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `android.Dockerfile` / `develop.Dockerfile` — Android + Ionic dev images
- `bin/ionic-react` / `bin/test-avd` — helper scripts for containerized dev
- `docs/ANDROID_BUILD.md.template` / `docs/ANDROID_DEVELOPMENT.md` — Android guides
- `docs/README.md.append` — README append with Android section

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons android-tools
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: android-tools
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `android-tools`.
