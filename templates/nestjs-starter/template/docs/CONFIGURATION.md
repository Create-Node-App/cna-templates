# Configuration

The NestJS starter uses `@nestjs/config` with **Zod** validation so invalid environment values fail at startup instead of at runtime.

## Environment files

| File | Purpose | Committed |
| ---- | ------- | --------- |
| `.env.example` | Documented defaults and optional keys | Yes |
| `.env` | Local development values (copy from example) | No (gitignored) |

Copy the example file before your first run:

```sh
cp .env.example .env
```

Adjust values for your machine. Never commit secrets.

## Validated variables

These fields are defined in `.env.example` and validated in `src/config/env.schema.ts`:

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `PORT` | No | `3000` | HTTP listen port (positive integer) |
| `APP_NAME` | No | `NestJS API` | Application name (used in Swagger title) |
| `LOG_LEVEL` (validated; wire Nest Logger levels as needed) | No | `debug` | `debug`, `info`, `warn`, or `error` |
| `DATABASE_URL` | No | — | PostgreSQL connection URL (when you add a database) |
| `JWT_SECRET` | No | — | Signing secret (when you add auth) |
| `JWT_EXPIRATION` | No | — | Token lifetime in seconds |
| `CORS_ORIGIN` | No | — | Allowed browser origin; omit to allow all origins |

Optional keys can stay commented out in `.env` until you need them.

## How validation works

`AppModule` registers ConfigModule with a `validate` function:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env'],
  validate: validateEnv,
});
```

`validateEnv` (in `src/config/env.validation.ts`) parses the loaded config with Zod. On failure, NestJS aborts bootstrap with a descriptive error:

```txt
Error: Invalid environment configuration: PORT: Expected number, received nan
```

This **fail-fast** behavior catches typos and missing required values early.

## Reading config in code

Inject `ConfigService` with the typed `EnvConfig` shape:

```typescript
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.schema';

constructor(private readonly config: ConfigService<EnvConfig, true>) {}

const port = this.config.get('PORT', { infer: true });
const appName = this.config.get('APP_NAME', { infer: true });
```

`main.ts` uses the same pattern for CORS, Swagger title, and the listen port.

## CORS

When `CORS_ORIGIN` is set, `main.ts` passes it to `enableCors({ origin })`. When unset, all origins are allowed (convenient for local development). Tighten this in production.

## Extending the schema

When you add new environment variables:

1. Document them in `.env.example`.
2. Add fields to `envSchema` in `src/config/env.schema.ts`.
3. Use `ConfigService` (or a dedicated config factory) in the modules that need them.

Keep validation rules close to the schema so `.env.example` and runtime checks stay in sync.

## Related docs

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — Where config files live
- [API.md](./API.md) — Swagger and HTTP surface

## Notes

- `LOG_LEVEL` is validated at boot. Application loggers may still use Nest defaults until you wire `Logger` levels explicitly.
