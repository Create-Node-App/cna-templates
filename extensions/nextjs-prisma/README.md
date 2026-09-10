# Prisma for Next.js

Adds [Prisma](https://www.prisma.io/) ORM (v7) with PostgreSQL support for type-safe database access in Next.js.

## Generated files

- `prisma/schema.prisma` — database schema with example User and Post models
- `prisma.config.ts` — Prisma 7 CLI config (connection string for migrate/push/studio)
- `src/db/prisma.ts` — singleton Prisma client instance (uses the `@prisma/adapter-pg` driver adapter)
- `.env.example.append` — database connection string

Run `npm install` (or `npm run db:generate`) once to generate the type-safe
client into `prisma/generated/prisma` — it is gitignored and rebuilt on every install.

## Available scripts

- `npm run db:generate` — generate Prisma Client after schema changes
- `npm run db:migrate` — apply migrations in development
- `npm run db:push` — push schema changes without migrations
- `npm run db:studio` — open Prisma Studio GUI

## Usage

Copy `.env.example` to `.env` and set `DATABASE_URL`, then import the Prisma client anywhere:

```typescript
import { prisma } from '@/db/prisma';

const users = await prisma.user.findMany();
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [Upgrading to Prisma 7](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
