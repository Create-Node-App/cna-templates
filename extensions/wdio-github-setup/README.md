# GitHub Setup for User Acceptance Testing

This extension adds GitHub setup to your project including GitHub Actions, Dependabot, Issue Templates, Pull Request Templates, and more. It also adds a GitHub Action to run User Acceptance Tests using Selenium.

## Compatible types

- `webdriverio` → `webdriverio-boilerplate`

## Files

- `.github/workflows/*.yml` — GitHub Actions workflows (CI, PR review, automation)
- `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODE_OF_CONDUCT.md` — community health files
- `tools/danger/dangerfile.ts` + `package.json.template` — Danger.js setup for PR checks
- `README.md.template` — WebdriverIO project README (EJS)

## Apply

```sh
npx create-awesome-node-app my-app --template webdriverio-boilerplate --addons github-setup-uat
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: github-setup-uat
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `github-setup-uat`.
