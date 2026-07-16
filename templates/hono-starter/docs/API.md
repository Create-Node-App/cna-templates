# API

## `GET /`

Returns a welcome payload.

```json
{ "message": "Hello from Hono!", "docs": "./docs/README.md" }
```

## `GET /health`

Liveness probe for platforms and smoke tests.

```json
{ "status": "ok" }
```

## `POST /echo`

Demonstrates `@hono/zod-validator` on JSON bodies.

Request:

```json
{ "message": "ping" }
```

Response:

```json
{ "echo": "ping" }
```

Invalid bodies return `400` from the validator.

## Errors

Unhandled errors go through `src/middleware/error-handler.ts` and return:

```json
{ "error": { "code": "INTERNAL_ERROR", "message": "..." } }
```

Throw `AppError` from `src/lib/errors.ts` for intentional HTTP failures with a custom `code` and status.
