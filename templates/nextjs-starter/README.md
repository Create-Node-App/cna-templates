# Next.js Starter

> Next.js App Router + React + TypeScript with feature-based architecture — full-stack React with server components, nested routes, and clear module boundaries.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| UI | React 19 + Server Components |
| Lint/Format | ESLint + Prettier + markdownlint |
| Runtime | Node 22 |

## Scaffold

```bash
npx create-awesome-node-app --template nextjs-starter
```

## Key features

- Feature-based architecture (`[src]/features/auth` → `components/`, `hooks/`, `services/`)
- Encapsulated feature modules + domain-driven design
- App Router conventions (`[src]/app/(auth)/login/page.tsx` example)
- `instrumentation.ts` + `middleware.ts` templates
- `cna.config.json` → `srcDir` prompt (default `src/`)

## Docs

[`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `COMPONENTS_AND_STYLING.md`, `STATE_MANAGEMENT.md`, `PROJECT_CONFIGURATION.md`.

Includes example auth feature (`features/auth`) to copy for new domains.

---

*Thanks to @slegarraga for the catalog READMEs — enhanced with App Router details.*
