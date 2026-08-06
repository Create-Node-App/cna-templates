# Testing

This starter uses **Vitest** with Hono's `app.request()` helper (no live port required).

```bash
npm test
npm run test:watch
```

Smoke coverage lives in `tests/app.test.ts`:

- `GET /`
- `GET /health`
- `POST /echo` validation

When adding routes, co-locate `*.test.ts` next to the module or extend `app.test.ts` for HTTP-level checks.
