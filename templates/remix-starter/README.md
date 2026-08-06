# Remix Starter

> React Router v7 with file-based routes, loaders/actions, and TypeScript — SSR and nested data routes for full-stack React.

[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | React Router v7 (file-based routes) |
| Language | TypeScript (strict) |
| Bundler | Vite 6 |
| Lint/Format | ESLint + Prettier |

## Scaffold

```bash
npx create-awesome-node-app --template remix-starter
```

## Key features

- File-based routes (`app/routes/_index.tsx.template`)
- Loaders + actions (contact demo with in-memory store)
- Nested routes and `ErrorBoundary` at root
- `vite.config.ts.template` + `react-router.config.ts.template`
- `cna.config.json` → `srcDir` prompt

## Docs

[`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `COMPONENTS_AND_STYLING.md`, `PROJECT_CONFIGURATION.md`. Demo routes: `/contact` (loader/action), root error boundary.

---

*Thanks to @slegarraga — enhanced with React Router v7 details.*
