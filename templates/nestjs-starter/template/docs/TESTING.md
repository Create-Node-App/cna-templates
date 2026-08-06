# Testing

The NestJS starter ships with **Jest** for unit tests and **Supertest** for HTTP e2e tests.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run test` | Run unit tests (`src/**/*.spec.ts`) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:cov` | Unit tests with coverage report |
| `npm run test:e2e` | End-to-end HTTP tests (`test/*.e2e-spec.ts`) |
| `npm run test:debug` | Debug Jest with Node inspector |

Replace `npm run` with your package manager's run command if different.

## Unit tests

Unit tests live next to the code they cover:

- `src/app.controller.spec.ts` — Root controller
- `src/health/health.controller.spec.ts` — Health controller

Configuration: `jest.config.js` (rootDir `src`, matches `*.spec.ts`).

Unit tests typically:

1. Build a testing module with `Test.createTestingModule`.
2. Provide mocked dependencies where isolation is needed.
3. Assert controller/service behavior without starting HTTP.

Example pattern:

```typescript
const module = await Test.createTestingModule({
  controllers: [HealthController],
  providers: [{ provide: AppService, useValue: mockAppService }],
}).compile();
```

## E2e tests

E2e tests live in `test/` and boot the full `AppModule`:

- `test/app.e2e-spec.ts` — Exercises `/` and `/health` over HTTP

Configuration: `test/jest-e2e.json`.

E2e tests use Supertest against `app.getHttpServer()` so global filters, interceptors, and ConfigModule validation run as in production.

### Environment in tests

Config validation runs when `AppModule` loads. The Zod schema supplies defaults for `NODE_ENV`, `PORT`, `APP_NAME`, and `LOG_LEVEL`, so e2e tests work without a `.env` file. If you add required env keys later, set them in the e2e `beforeAll` hook or a Jest setup file.

## Writing tests for new modules

When you add a feature module:

1. Add `*.spec.ts` beside controllers and services.
2. Mock external I/O (database, HTTP clients) in unit tests.
3. Add e2e cases for critical HTTP routes in `test/` or a feature-specific e2e file.

NestJS testing utilities: [@nestjs/testing](https://docs.nestjs.com/fundamentals/testing).

## Coverage

Run `npm run test:cov` to generate a coverage report under `coverage/`. Focus on business logic in services; controllers with thin delegation need fewer assertions.

## Related docs

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — Source layout
- [API.md](./API.md) — Routes covered by e2e tests
