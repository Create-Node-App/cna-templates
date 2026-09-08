# Next.js SaaS AI Starter

> Production-ready multi-tenant SaaS with integrated AI — Next.js App Router, Auth.js v5, PostgreSQL + pgvector, and Drizzle. The flagship product showcase, not a minimal starter.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://www.typescriptlang.org) [![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript (strict) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| Auth | Auth.js v5 + Auth0 SSO + credentials (dev) |
| Database | PostgreSQL + pgvector + Drizzle ORM |
| AI | OpenAI / Anthropic via Vercel AI SDK + RAG |
| Storage | AWS S3 (prod) / MinIO (local) |
| i18n | next-intl (EN + ES) |
| Test | Jest + React Testing Library + Storybook |
| Runtime | Node 22 |
| API | tRPC for Nextjs |
| Tooling | husky + lint staged

## Scaffold

```bash
npx create-awesome-node-app --template nextjs-saas-ai-starter
```
After scaffolding, copy `.env.example` to `.env.local` for overrides (API keys, Auth0, Sentry). PostgreSQL + pgvector is required; the generated project includes DevContainer and Compose setups.

## Key features

- Multi-tenant routes (`src/app/(tenant)/t/[tenant]/`) with tenant isolation
- Permission-based access control (PBAC) — authorize by permission key, not role name
- Admin panel: members, roles, settings, webhooks, audit logs
- Feature-based modules (`src/features/{admin,assistant,auth}`) + `_feature-template_`
- Outbound webhooks, GitHub OAuth example, and tenant feature flags
- `cna.config.json` has no custom prompts — scaffold uses the template as-is

## Docs

[`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `AUTHENTICATION.md`, `DATABASE.md`, `ROLES_AND_PERMISSIONS.md`, `API.md`, `DEPLOYMENT.md`. Full index in [`template/docs/README.md`](./template/docs/README.md).

---

*Thanks to @aizen404x for the catalog READMEs — added Next.js SaaS AI Starter documentation.*