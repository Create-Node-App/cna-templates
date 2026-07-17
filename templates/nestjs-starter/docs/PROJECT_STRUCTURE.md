# Project Structure

This document describes the NestJS starter layout and where to add new backend features.

## Directory layout

```txt
nestjs-starter/
├── src/
│   ├── main.ts                 # Bootstrap, CORS, Swagger, listen port
│   ├── app.module.ts           # Root module (global filter/interceptor)
│   ├── app.controller.ts       # Root route (/)
│   ├── app.service.ts          # Shared app-level logic
│   ├── common/
│   │   ├── dto/                # Shared DTOs (Swagger + typing)
│   │   ├── filters/            # Global exception handling
│   │   └── interceptors/       # Cross-cutting request logging
│   ├── config/
│   │   ├── env.schema.ts       # Zod schema for environment variables
│   │   └── env.validation.ts   # ConfigModule validate hook
│   └── health/
│       ├── health.controller.ts
│       └── health.controller.spec.ts
├── test/
│   └── app.e2e-spec.ts         # Supertest e2e tests
├── docs/                       # Extended documentation (this folder)
├── package/                    # CNA template dependency manifests
├── docker/                     # Compose helper scripts
├── compose.yml                 # Local Docker Compose stack
├── .env.example                # Documented environment template
├── nest-cli.json               # Nest CLI configuration
├── jest.config.js              # Unit test config
└── tsconfig.json               # TypeScript compiler options
```

## NestJS building blocks

| Concept | Role in this template |
| ------- | --------------------- |
| **Module** | Groups controllers, providers, and imports (`AppModule` is the root) |
| **Controller** | Handles HTTP routes and delegates to services |
| **Provider / Service** | Injectable business logic (`AppService`) |
| **DTO** | Typed request/response shapes; used with Swagger decorators |
| **Filter** | Global error formatting (`HttpExceptionFilter`) |
| **Interceptor** | Request/response cross-cutting behavior (`LoggingInterceptor`) |

## Adding a feature module

Follow NestJS conventions: one module per domain area.

1. Create a folder under `src/`, for example `src/users/`.
2. Add `users.module.ts`, `users.controller.ts`, and `users.service.ts`.
3. Register `UsersModule` in `AppModule` imports.
4. Add DTOs under `src/users/dto/` with validation and Swagger decorators as needed.
5. Add unit tests (`*.spec.ts`) beside the files they cover.

Example registration in `app.module.ts`:

```typescript
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ /* ... */ }),
    UsersModule,
  ],
  // ...
})
export class AppModule {}
```

## Shared vs feature code

| Location | Use for |
| -------- | ------- |
| `src/common/` | Filters, interceptors, pipes, guards, and DTOs reused across modules |
| `src/config/` | Environment schema and validation |
| `src/<feature>/` | Domain-specific controllers, services, and DTOs |

Keep feature modules focused. Prefer importing shared utilities from `common/` instead of reaching across feature boundaries.

## Configuration and bootstrap flow

1. `main.ts` creates the Nest application from `AppModule`.
2. `ConfigModule` loads `.env` and runs Zod validation (fail fast on invalid values).
3. Global filter and interceptor are registered via `APP_FILTER` / `APP_INTERCEPTOR` in `AppModule`.
4. Swagger is mounted at `/docs`.
5. The HTTP server listens on `PORT` (default `3000`).

## Related docs

- [CONFIGURATION.md](./CONFIGURATION.md) — Environment variables
- [TESTING.md](./TESTING.md) — Jest and e2e setup
- [API.md](./API.md) — Routes and OpenAPI
