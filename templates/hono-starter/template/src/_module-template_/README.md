# Module template

Copy this folder to `src/routes/<name>/` (or `src/modules/<name>/`) when adding a domain.

Suggested files:

- `index.ts` — `new Hono()` router exported for `app.route`
- `schemas.ts` — Zod schemas for validators
- `service.ts` — pure business logic (easy to unit test)
- `index.test.ts` — Vitest coverage

Mount from `src/app.ts`:

```ts
import { usersRoutes } from "./routes/users";
app.route("/users", usersRoutes);
```
