# Next.js SaaS AI Template

> Production-ready Next.js boilerplate for multi-tenant SaaS with AI built-in

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/Create-Node-App/nextjs-saas-ai-template?style=social)](https://github.com/Create-Node-App/nextjs-saas-ai-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

[![Built with create-awesome-node-app](https://img.shields.io/badge/Built%20with-create--awesome--node--app-blue?style=flat-square)](https://www.npmjs.com/package/create-awesome-node-app)

</div>

A fully-featured, production-ready Next.js 15 template for building multi-tenant SaaS applications with AI capabilities built-in. Part of the [Create-Node-App](https://github.com/Create-Node-App) ecosystem.

---

## ✨ Features

- 🏢 **Multi-tenant architecture** — tenant-scoped routes (`/t/[tenant]`), full tenant isolation in DB
- 🔐 **Auth.js v5 + Auth0** — SSO, database sessions, development credentials provider
- 🗄️ **PostgreSQL 17 + pgvector + Drizzle ORM** — type-safe queries, vector similarity search
- 🤖 **AI assistant** — OpenAI/Anthropic via Vercel AI SDK, RAG with embeddings
- 🔑 **Permission-Based Access Control (PBAC)** — roles are bundles of permissions, multi-role support
- 🔗 **Integration architecture** — GitHub OAuth2 example, extensible via `integration_sync_control`
- 🛡️ **Admin panel** — member management, roles, settings, webhooks, bulk import
- 📣 **Outbound webhooks** — configurable with delivery tracking
- 📋 **Audit logging** — all sensitive operations are tracked
- 📁 **File uploads** — AWS S3 in production, MinIO for local dev
- 📦 **DevContainer + direnv** — zero-config local development environment
- 🌍 **i18n** — next-intl with English and Spanish out of the box
- 📚 **Storybook** — component development and visual testing
- ⚡ **GitHub Actions CI** — build, lint, type-check, tests, mega-linter
- 🧩 **Feature template** — `_feature-template_` scaffold for adding new features

---

## 🚀 Quick Start

### Option 1: Use this template (Recommended)

Click **"Use this template"** on [GitHub](https://github.com/Create-Node-App/nextjs-saas-ai-template), or use the CLI:

```bash
gh repo create my-saas-app --template Create-Node-App/nextjs-saas-ai-template
cd my-saas-app
```

### Option 2: Clone and run with DevContainer

**Prerequisites:** [Docker](https://www.docker.com/) + IDE with Dev Containers support (VS Code, Cursor)

```bash
git clone https://github.com/Create-Node-App/nextjs-saas-ai-template.git my-saas-app
cd my-saas-app
# Open in VS Code/Cursor and click "Reopen in Container"
pnpm dev
```

The DevContainer automatically configures PostgreSQL + pgvector, environment variables, and all tooling. No manual setup needed.

### Option 3: DevContainer CLI

```bash
npm install -g @devcontainers/cli

git clone https://github.com/Create-Node-App/nextjs-saas-ai-template.git my-saas-app
cd my-saas-app

devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Create `.env.local` only if you need to override specific values (e.g., `OPENAI_API_KEY` for AI features).

---

## 🛠️ Tech Stack

| Category     | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Framework    | Next.js 15 (App Router, RSC, Turbopack)               |
| Language     | TypeScript 5+ (strict)                                |
| Styling      | Tailwind CSS v4 + shadcn/ui                           |
| Database     | PostgreSQL 17 + pgvector + Drizzle ORM                |
| Auth         | Auth.js v5 + Auth0 (SSO) + database sessions          |
| AI           | OpenAI / Anthropic via Vercel AI SDK + RAG/embeddings |
| File Storage | AWS S3 (production) / MinIO (local dev)               |
| i18n         | next-intl (EN + ES)                                   |
| Testing      | Jest + React Testing Library                          |
| Linting      | ESLint 9 (flat config) + Prettier + Mega Linter       |
| CI/CD        | GitHub Actions                                        |
| Dev Env      | DevContainer + direnv                                 |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, tenant selection)
│   ├── (tenant)/t/[tenant]/ # Tenant-scoped routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── features/              # Feature modules
│   ├── admin/             # Admin panel
│   ├── assistant/         # AI assistant
│   ├── auth/              # Authentication
│   └── _feature-template_/ # Template for new features
├── shared/                # Shared infrastructure
│   ├── components/ui/     # shadcn/ui components
│   ├── db/                # Database (Drizzle + pgvector)
│   └── lib/               # Utilities (auth, permissions, env)
└── i18n/                  # Translations (EN, ES)
```

---

## 📜 Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `pnpm dev`        | Start development server      |
| `pnpm build`      | Build for production          |
| `pnpm lint`       | Run ESLint                    |
| `pnpm type-check` | Run TypeScript check          |
| `pnpm test`       | Run tests                     |
| `pnpm storybook`  | Start Storybook (port 6006)   |
| `pnpm db:push`    | Push schema to database (dev) |
| `pnpm db:migrate` | Run pending migrations        |
| `pnpm db:studio`  | Open Drizzle Studio           |

---

## 📖 Documentation

The **single source of truth** is **[docs/](./docs/)**.

- **Full index:** [docs/README.md](./docs/README.md)
- **Architecture:** [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)
- **Auth:** [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)
- **Database:** [docs/DATABASE.md](./docs/DATABASE.md)
- **Permissions (PBAC):** [docs/ROLES_AND_PERMISSIONS.md](./docs/ROLES_AND_PERMISSIONS.md)
- **API:** [docs/API.md](./docs/API.md)
- **Integrations:** [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)
- **Deployment:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

_Part of the [Create-Node-App](https://github.com/Create-Node-App) ecosystem — spin up production-ready applications with best practices baked in._
