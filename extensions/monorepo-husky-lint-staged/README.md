# Husky + Lint Staged (Monorepo)

Improve code quality with pre-commit hooks using Husky and Lint Staged for monorepo projects.

## Compatible types

- `monorepo` → `turborepo-boilerplate`

## Files

- `.husky/commit-msg`, `.husky/pre-commit` — Husky hooks
- `.husky/pre-push.template` — optional pre-push hook template
- `.lintstagedrc.json.template` — lint-staged config (EJS)
- `commitlint.config.ts` — commitlint rules
- `package.json` — devDependencies: husky, lint-staged, commitlint

## Apply

```sh
npx create-awesome-node-app my-app --template turborepo-boilerplate --addons monorepo-husky-lint-staged
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: monorepo-husky-lint-staged
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `monorepo-husky-lint-staged`.
