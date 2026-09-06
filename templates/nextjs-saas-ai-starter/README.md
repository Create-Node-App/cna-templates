# NextJS SaaS AI Starter

> Multi-tenant Next.js SaaS with AI providers, Auth.js v5, Drizzle + PostgreSQL, Tailwind v4, shadcn/ui, RBAC, audit logs, webhooks, and i18n — the flagship product showcase, not a minimal starter.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 15 (App Router, RSC) |
| Auth | Auth.js v5 (NextAuth) |
| Database | Drizzle ORM + PostgreSQL |
| UI | Tailwind CSS 4 + shadcn/ui |
| AI | Multi-provider AI integrations |
| Governance | RBAC, audit logs, webhooks |
| i18n | Built-in internationalization |
| Test | Jest |
| Tooling | ESLint, Prettier, commitlint, cspell |

## Scaffold

```bash
npx create-awesome-node-app --template nextjs-saas-ai-starter
```

## Key features

- Multi-tenant architecture with tenant isolation
- Auth.js v5 authentication flows
- Drizzle schema + PostgreSQL migrations (`drizzle.config.ts`)
- Role-based access control and audit logging
- Webhook subsystem for integrations
- shadcn/ui component library (`components.json`)
- Commit conventions enforced via commitlint + Husky
- Tooling scripts in `template/scripts/` and `template/tools/`

## Docs

See [`template/docs/`](./template/docs) and the generated project's `README.md` for setup, environment variables, and provider configuration.
