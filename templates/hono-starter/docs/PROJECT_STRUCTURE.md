# Project Structure

```text
src/
├── index.ts                 # Node server bootstrap (`@hono/node-server`)
├── app.ts                   # Hono app factory + middleware
├── env.ts                   # Zod environment schema
├── lib/errors.ts            # AppError + JSON error body helper
├── middleware/error-handler.ts
├── routes/
│   ├── root.ts              # GET / , POST /echo
│   └── health.ts            # GET /health
└── _module-template_/       # Copy-paste scaffold for new route modules

tests/
└── app.test.ts              # Vitest smoke tests via `app.request`
```

## Conventions

- Keep route modules small; mount them from `app.ts` with `app.route`.
- Put shared helpers under `src/lib/`.
- Put cross-cutting middleware under `src/middleware/`.
- Copy `src/_module-template_/` when adding a domain (users, webhooks, …).

Do not grow this into Nest. Prefer Hono + small modules for edge/serverless-friendly APIs.
