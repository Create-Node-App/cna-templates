# 🗄️ Database

The Next.js SaaS AI Template uses **Drizzle ORM** with **PostgreSQL** and **pgvector** for AI embeddings.

## Setup

### Prerequisites

- PostgreSQL 15+ with pgvector extension
- Connection string in `.env.local` (search_path should include `saas_template,public,drizzle`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_template?options=--search_path%3Dsaas_template,public,drizzle"
```

### Commands

| Command                         | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| `pnpm db:generate`              | Generate migrations from schema changes               |
| `pnpm db:migrate`               | Run pending migrations                                |
| `pnpm db:push`                  | Push schema directly (dev only)                       |
| `pnpm db:studio`                | Open Drizzle Studio GUI                               |
| `pnpm db:cloud:url`             | Get DATABASE_URL for cloud connection                 |
| `pnpm db:setup:cloud`           | Run migrations, seeds, and embeddings for cloud DB    |
| `pnpm db:backfill:translations` | Backfill i18n descriptions into `entity_translations` |

## Schema Overview

The database schema is defined in `src/shared/db/schema/`:

### Core Entities

```
tenants          # Multi-tenant organizations
├── persons      # Users/employees within a tenant
├── skills       # Skill taxonomy with AI embeddings
├── assessments  # Skill evaluations (self, supervised, inferred)
├── interests    # Career aspirations and learning goals
└── audit_logs   # Change tracking
```

### Auth Entities (Auth.js)

```
users            # Auth.js user records
├── accounts     # OAuth provider connections
├── sessions     # Active sessions
├── verification_tokens
└── authenticators  # WebAuthn/Passkeys
```

## Schema Details

### Tenants

```typescript
// src/shared/db/schema/tenants.ts
import { appSchema } from './schema';
export const tenants = appSchema.table('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 63 }).unique().notNull(),
  name: text('name').notNull(),
  // ...
});
```

### Skills with Embeddings

```typescript
// src/shared/db/schema/skills.ts
import { appSchema } from './schema';
export const skills = appSchema.table('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  name: text('name').notNull(),
  category: skillCategoryEnum('category').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI embeddings
  // ...
});
```

### Assessments

Supports multiple assessment sources:

- `self` - Self-assessment
- `supervised` - Manager/supervisor assessment
- `teacher` - Instructor assessment
- `peer` - Peer review
- `inferred` - AI-inferred from activity

## Usage

### Database Client

```typescript
import { db } from '@/shared/db';
import { tenants, persons } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';

// Query
const tenant = await db.query.tenants.findFirst({
  where: eq(tenants.slug, 'acme'),
});

// Insert
await db.insert(persons).values({
  tenantId: tenant.id,
  email: 'user@example.com',
  displayName: 'John Doe',
});
```

### With Relations

```typescript
const personWithSkills = await db.query.persons.findFirst({
  where: eq(persons.id, personId),
  with: {
    assessments: {
      with: {
        skill: true,
      },
    },
  },
});
```

### Vector Similarity Search

```typescript
import { sql } from 'drizzle-orm';

// Find similar skills using cosine distance
const similarSkills = await db
  .select()
  .from(skills)
  .orderBy(sql`embedding <=> ${queryEmbedding}`)
  .limit(10);
```

## Localized Admin Content

Admin-editable DB content can be localized through `saas_template.entity_translations`:

- Keys: `tenant_id`, `entity_type`, `entity_id`, `field`, `locale`
- Value: `value`
- Fallback chain at read time: `requestedLocale -> tenantDefaultLanguage -> en -> base field value`

This keeps legacy `description` columns/settings as fallback while enabling per-locale content for Admin entities.

## Migrations

### Development Workflow

1. Modify schema files in `src/shared/db/schema/`
2. Generate migration: `pnpm db:generate`
3. Review generated SQL in `drizzle/`
4. Apply migration: `pnpm db:migrate`

### Production

Always use migrations in production:

```bash
pnpm db:migrate
```

## Cloud Database Access

The application uses shared AWS RDS PostgreSQL instances in cloud environments (dev, staging, prod). Access requires proper AWS credentials and network connectivity.

### Prerequisites

1. **AWS credentials**: Configure AWS profile with SecretsManager and SSM permissions
2. **Network access**:
   - Direct connection: VPN or AWS network access to RDS
   - Bastion tunnel: SSH tunnel to bastion host forwarding `localhost:5432` → RDS

### Getting the Database URL

Use `pnpm db:cloud:url` to fetch and construct the DATABASE_URL for cloud databases:

```bash
# Direct connection (requires VPN or AWS network access)
pnpm db:cloud:url --stage dev

# Via bastion host tunnel (localhost:5432)
pnpm db:cloud:url --stage dev --tunnel

# Custom tunnel port
pnpm db:cloud:url --stage dev --tunnel --tunnel-port 15432

# Quiet mode (only output URL, no logs)
pnpm db:cloud:url --stage dev --tunnel --quiet
```

**Example: Using with individual scripts**

```bash
# 1. Establish bastion tunnel (separate terminal)
ssh -L 5432:rds-endpoint:5432 bastion-host

# 2. Get DATABASE_URL and export it (use --silent to suppress pnpm output)
export DATABASE_URL=$(pnpm --silent db:cloud:url --stage dev --tunnel --quiet)

# 3. Disable SSL certificate validation for tunnel (localhost won't have valid certs)
export NODE_TLS_REJECT_UNAUTHORIZED=0

# 4. Run any database script
pnpm tsx scripts/generate-embeddings.ts
pnpm db:migrate
pnpm db:seed
```

### Full Cloud Setup

For complete database setup (migrations + seeding + embeddings), use `pnpm db:setup:cloud`:

```bash
# Full setup with bastion tunnel
pnpm db:setup:cloud --stage dev --tunnel

# Skip embeddings generation (faster, for testing)
pnpm db:setup:cloud --stage dev --tunnel --skip-embeddings

# Only run migrations (no seeding or embeddings)
pnpm db:setup:cloud --stage dev --tunnel --skip-seed --skip-embeddings
```

**Note**: The `db:setup:cloud` command orchestrates multiple steps:

1. Fetch DATABASE_URL from AWS (Secrets Manager + SSM Parameter Store)
2. Run Drizzle migrations (`pnpm db:migrate`)
3. Seed demo tenant data (`pnpm db:seed`)
4. Seed demo tenant data (`pnpm db:seed`)
5. Generate AI embeddings for skills/profiles (`pnpm embeddings:generate`)

**Important**: The RDS instance must have the `pgvector` extension already created by a DBA:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Never use `db:push` in production as it can cause data loss.

## Best Practices

1. **Use transactions** for multi-table operations
2. **Index foreign keys** for query performance
3. **Use soft deletes** (set `deletedAt`) for audit trails
4. **Validate at schema level** with Drizzle constraints
5. **Use enums** for finite value sets

## Related Documentation

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [pgvector](https://github.com/pgvector/pgvector)
- [Project Structure](./PROJECT_STRUCTURE.md)
