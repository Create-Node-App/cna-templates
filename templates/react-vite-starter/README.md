# React Vite Boilerplate

> React SPA on Vite with React Router, TypeScript, and feature-based architecture — instant HMR for client-only apps where build speed matters.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev) [![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + React Router (SPA) |
| Bundler | Vite 6 (HMR) |
| Language | TypeScript |
| Lint/Format | ESLint + Prettier + markdownlint |
| Test | Vitest (via extension) |

## Scaffold

```bash
npx create-awesome-node-app --template react-vite-boilerplate
# directory is templates/react-vite-starter — public slug is react-vite-boilerplate
```

## Key features

- Instant Vite HMR + `index.html.template` with `<%= projectName %>`
- Feature-based modules (`[src]/features/_feature-template_/`)
- `AGENTS.md.template` + `docs/` guides (structure, styling, state)
- `vite.config.ts.template`, `tsconfig.json.template` with path aliases
- `cna.config.json` → `srcDir` prompt

## Docs

[`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `COMPONENTS_AND_STYLING.md`, `PERFORMANCE.md`.

---

*Thanks to @slegarraga — corrected public slug and added Vite/HMR notes.*
