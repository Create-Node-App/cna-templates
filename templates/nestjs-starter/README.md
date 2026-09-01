# NestJS Boilerplate

> Modular NestJS API with TypeScript, OpenAPI/Swagger, Zod env validation, and Docker — clear module boundaries for HTTP services.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | NestJS 11 (controllers, providers, modules) |
| Language | TypeScript |
| Validation | Zod + `@nestjs/config` |
| Docs | OpenAPI/Swagger (`/docs`) |
| Test | Jest + e2e (`test/`) |
| Tooling | ESLint, Prettier, Docker, Compose |

## Scaffold

```bash
npx create-awesome-node-app --template nestjs-boilerplate
# directory is templates/nestjs-starter — public slug is nestjs-boilerplate
```

## Key features

- Module layout (`src/app.module.ts`, `src/health/`, `src/common/{filters,interceptors,dto}`)
- Swagger UI at `http://localhost:3000/docs` (`/` + `/health` documented)
- `env.schema.ts` + `env.validation.ts` (Zod via `@nestjs/config`)
- Global `HttpExceptionFilter` + `LoggingInterceptor`
- `Dockerfile` + `compose.yml`/`compose.prod.yml` + `docker/docker-compose.sh`
- `.node-version` pinned, `.env.example` provided

## Docs

See [`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `CONFIGURATION.md`, `API.md`, `TESTING.md`.

## Quickstart

```bash
fnm use
npm install
npm run dev        # http://localhost:3000
# or
npm run compose:up # Docker
```

---

*Thanks to @slegarraga — improved with correct public slug and Docker notes.*
