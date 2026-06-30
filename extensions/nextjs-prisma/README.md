# Prisma for Next.js

Adds [Prisma](https://www.prisma.io/) ORM with PostgreSQL support for type-safe database access in Next.js.

## Generated files

- `prisma/schema.prisma` — database schema with example User and Post models
- `src/db/prisma.ts` — singleton Prisma client instance
- `.env.example.append` — database connection string

## Available scripts

- `npm run db:generate` — generate Prisma Client after schema changes
- `npm run db:migrate` — apply migrations in development
- `npm run db:push` — push schema changes without migrations
- `npm run db:studio` — open Prisma Studio GUI

## Usage

Import the Prisma client anywhere:

```typescript
import { prisma } from '@/db/prisma';

const users = await prisma.user.findMany();
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
