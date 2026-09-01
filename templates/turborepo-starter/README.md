# Turborepo Boilerplate

> Turborepo + pnpm workspaces with shared packages, Changesets, and React+Vite apps — fast monorepo for teams sharing UI/config.

[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)](https://turbo.build) [![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm)](https://pnpm.io) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Monorepo | Turborepo 2 + pnpm workspaces |
| Language | TypeScript |
| Release | Changesets |
| Lint/Format | ESLint + Prettier |
| Apps | `apps/web` (Vite+React), `apps/playground` (Storybook) |

## Scaffold

```bash
npx create-awesome-node-app --template turborepo-boilerplate
# directory is templates/turborepo-starter — public slug is turborepo-boilerplate
```

Requires `pnpm` — `pnpm-workspace.yaml.if-pnpm` is included.

## Key features

- `apps/web` consumes `packages/ui` (shared React), `apps/playground` for Storybook
- `packages/*` + `apps/*` workspaces, `turbo run` task caching
- Changesets for versioning (`npm run changeset`, `publish-packages`)
- `cna.config.json` → `scope` + `projectName` (default `@app/` + `turbo-app`)

## Docs

[`template/docs/`](./template/docs) — monorepo structure, tasks, release workflow.

---

*Thanks to @slegarraga — corrected public slug and added pnpm note.*
