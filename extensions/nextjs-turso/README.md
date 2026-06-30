# Turso/LibSQL for Next.js

Adds [Turso](https://turso.tech/) (libSQL) database client with [Drizzle ORM](https://orm.drizzle.team/) for Next.js App Router.

## Generated files

- `src/db/client.ts` — Turso/libSQL client instance
- `src/db/schema/index.ts` — Drizzle schema definitions
- `drizzle.config.ts` — Drizzle Kit configuration for Turso
- `docker/compose.yml` — local Turso/libSQL server for development

## Usage

```typescript
import { db } from '@/db/client';
import { users } from '@/db/schema';

const allUsers = await db.select().from(users);
```

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for Turso cloud, or use the local Docker setup.

## Resources

- [Turso Documentation](https://docs.turso.tech/)
- [libSQL Documentation](https://github.com/tursodatabase/libsql)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
