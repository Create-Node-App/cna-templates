# Hono Starter

> Minimal Hono API in TypeScript — edge/serverless-friendly, Zod-validated, with Vitest smoke tests. Reach for it when Express/Nest is heavier than you need.

[![Hono](https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white)](https://hono.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Hono 4 (Node, edge, serverless) |
| Language | TypeScript (strict) |
| Validation | Zod (env + request bodies) |
| Test | Vitest |
| Lint/Format | ESLint + Prettier |
| Runtime | Node 22 + `.node-version` |

## Scaffold

```bash
npx create-awesome-node-app --template hono-starter
```

## Key features

- Modular routes (`src/routes/` → `GET /`, `GET /health`, `POST /echo`)
- Zod env + request validation, JSON error handling (`src/middleware/error-handler.ts`)
- `GET /health` ready for probes, `POST /echo` validates `{ message }`
- `_module-template/` to copy-paste new modules
- `vitest` smoke tests (`tests/app.test.ts`) + `cna.config.json` with no prompts

## Docs

- [`docs/README.md`](./template/docs/README.md) — overview
- [`docs/PROJECT_STRUCTURE.md`](./template/docs/PROJECT_STRUCTURE.md)
- [`docs/API.md`](./template/docs/API.md) — endpoints
- [`docs/CONFIGURATION.md`](./template/docs/CONFIGURATION.md)
- [`docs/TESTING.md`](./template/docs/TESTING.md)

Compatible extensions: `github-setup`, `husky-lint-staged`, `development-container`.

---

*Thanks to @slegarraga for the initial catalog READMEs — enhanced with stack table and endpoint list.*
