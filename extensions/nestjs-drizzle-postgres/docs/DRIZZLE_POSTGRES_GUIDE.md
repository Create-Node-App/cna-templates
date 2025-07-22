# Drizzle ORM with PostgreSQL Guide

## Quick Start

Drizzle ORM is configured for PostgreSQL integration. See the [official documentation](https://orm.drizzle.team/docs/overview) for complete details.

## Essential Patterns

### Schema Definition
Create type-safe schemas:

```typescript
import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Database Provider Setup
Configure Drizzle with NestJS:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db: ReturnType<typeof drizzle>;
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, { schema });
  }
}
```

### Service Implementation
Create service with common operations:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, and, or, like } from 'drizzle-orm';
import { DrizzleService } from './drizzle.service';
import { users, type User, type NewUser } from './schema';

@Injectable()
export class UserService {
  constructor(private drizzle: DrizzleService) {}

  async create(userData: NewUser): Promise<User> {
    const [user] = await this.drizzle.db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.drizzle.db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async findById(id: number): Promise<User | undefined> {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async update(id: number, userData: Partial<NewUser>): Promise<User> {
    const [user] = await this.drizzle.db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: number): Promise<void> {
    await this.drizzle.db
      .delete(users)
      .where(eq(users.id, id));
  }
}
```

### Advanced Queries
Complex querying patterns:

```typescript
// Pagination
async findWithPagination(page: number, limit: number) {
  const offset = (page - 1) * limit;
  
  return this.drizzle.db
    .select()
    .from(users)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.createdAt));
}

// Search and filters
async search(filters: UserFilters) {
  const conditions = [];
  
  if (filters.name) {
    conditions.push(like(users.name, `%${filters.name}%`));
  }
  
  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }
  
  return this.drizzle.db
    .select()
    .from(users)
    .where(and(...conditions));
}

// Joins
async findUsersWithPosts() {
  return this.drizzle.db
    .select({
      user: users,
      post: posts,
    })
    .from(users)
    .leftJoin(posts, eq(users.id, posts.authorId));
}
```

### Transactions
Handle database transactions:

```typescript
async transferUser(fromId: number, toId: number, amount: number) {
  return this.drizzle.db.transaction(async (tx) => {
    // Deduct from source
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} - ${amount}` })
      .where(eq(accounts.userId, fromId));

    // Add to destination
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${amount}` })
      .where(eq(accounts.userId, toId));
  });
}
```

## Database Management

### Migrations
Run database migrations:

```bash
# Generate migrations
npm run drizzle:generate

# Run migrations
npm run drizzle:migrate

# Start database with Docker
npm run drizzle:db-up
```

### Environment Configuration
Set up environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
STAGE=development
```

For production with AWS Secrets Manager, the provider automatically fetches credentials based on the `STAGE` environment variable.

## Performance Tips

- Use proper indexes on frequently queried columns
- Implement pagination for large datasets
- Use `returning()` to get updated data efficiently
- Leverage prepared statements for repeated queries

## Common Issues

### Connection Issues
Ensure proper connection string:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
```

### Migration Errors
Keep migrations in sync:
```bash
# Reset and re-run migrations
npm run drizzle:drop
npm run drizzle:migrate
```

### Type Safety
Always use inferred types:
```typescript
// ✅ Good: Type-safe
const user: User = await userService.findById(1);

// ❌ Avoid: Losing type safety
const user: any = await userService.findById(1);
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL with Drizzle](https://orm.drizzle.team/docs/get-started-postgresql)
- [NestJS Integration](https://orm.drizzle.team/docs/nestjs) 