# AGENTS.md – AI Interaction & Execution Guide

Humans: see CONTRIBUTING.md and docs/.

## Authoritative references

| Topic | Source |
|---|---|
| Architecture | docs/PROJECT_STRUCTURE.md |
| HTTP surface | docs/API.md |
| Env / tooling | docs/CONFIGURATION.md |
| Tests | docs/TESTING.md |

## Key commands

| Command | Purpose |
|---|---|
| `npm run dev` | tsx watch server |
| `npm run build` | `tsc` |
| `npm start` | run `dist/index.js` |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

## Operating principles

- Keep the stack lean (Hono + Zod). Do not Nest-ify this starter.
- Fail fast on invalid env.
- Prefer JSON error shapes from `AppError`.
- Copy `src/_module-template_/` when adding domains.
