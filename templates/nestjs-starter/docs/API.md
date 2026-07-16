# API Reference

The NestJS starter exposes a small HTTP API for status, health checks, and OpenAPI discovery. All routes return JSON.

## Base URL

Local development (default):

```
http://localhost:3000
```

The port follows the `PORT` environment variable.

## OpenAPI (Swagger UI)

Interactive documentation is available at:

```
GET /docs
```

Swagger is configured in `src/main.ts` using `@nestjs/swagger`. Controller DTOs in `src/common/dto/` drive the generated schema.

Use `/docs` to explore request/response shapes and try endpoints from the browser.

## Endpoints

### `GET /`

Starter status payload with route hints and suggested next steps.

**Response `200`**

```json
{
  "status": "ok",
  "message": "NestJS starter API is running.",
  "timestamp": "2026-07-16T20:00:00.000Z",
  "routes": {
    "root": "/",
    "health": "/health",
    "docs": "/docs"
  },
  "nextSteps": [
    "Add your first feature module.",
    "Wire your environment variables in .env.",
    "Browse the OpenAPI UI at /docs.",
    "Install compatible CNA addons when you need more capabilities."
  ]
}
```

### `GET /health`

Lightweight health check suitable for load balancers and container orchestrators.

**Response `200`**

```json
{
  "status": "ok",
  "uptime": 12.34,
  "timestamp": "2026-07-16T20:00:00.000Z"
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `status` | string | Always `"ok"` when the process is running |
| `uptime` | number | Node.js process uptime in seconds |
| `timestamp` | string | ISO-8601 timestamp |

## Error responses

Unhandled exceptions and NestJS `HttpException` responses are normalized by `HttpExceptionFilter`:

```json
{
  "statusCode": 404,
  "message": "Cannot GET /unknown",
  "timestamp": "2026-07-16T20:00:00.000Z",
  "path": "/unknown"
}
```

## Request logging

`LoggingInterceptor` logs each successful request:

```txt
[HTTP] GET /health 200 +2ms
```

Server errors (5xx) are also logged by the global exception filter.

## Adding new routes

1. Create or extend a controller in a feature module.
2. Define DTO classes with `@ApiProperty` for Swagger.
3. Add `@ApiTags`, `@ApiOperation`, and `@ApiOkResponse` (or other response decorators).
4. Document the route in this file and verify it appears under `/docs`.

See [NestJS OpenAPI decorators](https://docs.nestjs.com/openapi/operations) for full decorator reference.

## Related docs

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — Module layout
- [CONFIGURATION.md](./CONFIGURATION.md) — Environment and CORS
- [TESTING.md](./TESTING.md) — E2e coverage for these routes
