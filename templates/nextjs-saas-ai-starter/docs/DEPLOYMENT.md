# Deployment

Next.js SaaS AI Template is a standard Next.js application with a PostgreSQL + pgvector database. It can be deployed to any platform that supports Node.js and PostgreSQL.

## Recommended Deployment Options

| Platform                 | Notes                                                  |
| ------------------------ | ------------------------------------------------------ |
| **Vercel**               | Zero-config Next.js deployment; add a Neon/Supabase DB |
| **Railway**              | Full-stack (app + PostgreSQL) with minimal config      |
| **Render**               | Similar to Railway; supports Docker deploys            |
| **Docker / Self-hosted** | Use the included `Dockerfile` or `compose.yml`         |
| **AWS (custom)**         | Deploy to ECS/Lambda@Edge with your own infra tooling  |

## Prerequisites

- Node.js (see `.node-version`) and pnpm
- PostgreSQL 15+ with the **pgvector** extension enabled
- Environment variables (see `.env.example` for the full list)

## Environment Variables

Copy `.env.example` to `.env` (or configure in your platform's dashboard) and set:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
AUTH_SECRET=<min-32-char-secret>   # openssl rand -base64 32

# Optional (AI features)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
ENABLE_AI_FEATURES=true

# Optional (SSO via Auth0)
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_ISSUER=https://your-tenant.auth0.com

# Optional (file uploads via S3)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-bucket
```

## Build & Start

```bash
pnpm install
pnpm db:migrate        # run pending migrations
pnpm build
pnpm start             # or: node .next/standalone/server.js
```

## Database Setup

1. Provision a PostgreSQL 15+ instance with pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE SCHEMA IF NOT EXISTS saas_template;
   ```
2. Set `DATABASE_URL` and run migrations:
   ```bash
   pnpm db:migrate
   ```
3. (Optional) seed demo data:
   ```bash
   pnpm db:seed
   ```

## Docker (self-hosted)

A `compose.yml` is included for local development (app + postgres + minio). For production, build the image and configure environment variables through your container orchestration tool.

```bash
docker build -t nextjs-saas-ai-template .
docker run -p 3000:3000 --env-file .env nextjs-saas-ai-template
```

## CI / CD

The repository includes GitHub Actions workflows for:

- `build.yml` — builds and type-checks on every push
- `lint.yml` — runs ESLint
- `tests.yml` — runs the test suite
- `type-check.yml` — runs TypeScript checks
- `pr-review.yml` — automated PR review

Add a deployment step to your own workflow by calling your chosen platform's deploy action (Vercel, Railway, etc.) after the build succeeds.
