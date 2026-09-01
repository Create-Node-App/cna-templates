# Docker Compose Setup

Add docker environments for development and production to your project setup with docker-compose

## Compatible types

- `react` → `react-vite-boilerplate`

## Files

- `Dockerfile` — multi-stage Node + Nginx production build
- `.nginx.conf` — Nginx config for SPA fallback
- `compose.yml` — dev service (volume-mounted, port 3000)
- `compose.prod.yml` — production service overrides
- `.dockerignore` — Docker ignore rules

## Apply

```sh
npx create-awesome-node-app my-app --template react-vite-boilerplate --addons docker-compose-setup
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: docker-compose-setup
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `docker-compose-setup`.
