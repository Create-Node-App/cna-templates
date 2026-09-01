/**
 * Database Reset Script
 *
 * Completely cleans all data from the database while preserving the schema.
 * Use with caution - this is destructive!
 *
 * Run with: pnpm db:reset
 * Or with confirmation skip: pnpm db:reset --force
 */

import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as readline from 'readline';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Tables in correct deletion order (respecting foreign keys)
// Order: Child tables first, then parent tables
const TABLES_TO_CLEAN = [
  // ============================================================================
  // AUDIT & EVENTS (no dependencies on other app tables)
  // ============================================================================
  'audit_events',

  // ============================================================================
  // EMBEDDINGS (depend on tenants)
  // ============================================================================
  'embedding_chunks',

  // ============================================================================
  // WEBHOOKS (depend on tenants)
  // ============================================================================
  'webhook_deliveries', // depends on webhook_endpoints
  'webhook_endpoints', // depends on tenants

  // ============================================================================
  // INTEGRATION SYNC ENGINE (depend on tenants)
  // ============================================================================
  'integration_sync_run_items', // depends on integration_sync_runs
  'integration_sync_conflicts', // depends on integration_sync_runs
  'integration_sync_runs', // depends on tenants
  'integration_sync_cursors', // depends on tenants
  'integration_entity_links', // depends on tenants
  'integration_field_mappings', // depends on tenants
  'integration_processing_jobs', // depends on tenants

  // ============================================================================
  // FILES (depend on persons)
  // ============================================================================
  'file_objects', // depends on persons

  // ============================================================================
  // PERSONS & RELATIONS (depend on tenants)
  // ============================================================================
  'assistant_conversations', // depends on persons, tenants
  'person_relations', // depends on persons
  'department_managers', // depends on persons, tenants
  'tenant_membership_roles', // depends on tenant_memberships, roles (PBAC)
  'tenant_memberships', // depends on users, tenants, persons
  'tenant_invitations', // depends on tenants, users (optional roleId → roles)
  'persons', // depends on tenants

  // ============================================================================
  // ROLES & PERMISSIONS / PBAC (depend on tenants)
  // ============================================================================
  'role_permissions', // depends on roles, permissions
  'roles', // depends on tenants
  'permissions', // depends on tenants (tenantId nullable)

  // ============================================================================
  // TENANTS (core entity, must be deleted after dependents)
  // ============================================================================
  'tenants',

  // ============================================================================
  // AUTH TABLES (Auth.js - independent of app tables except tenant_memberships)
  // ============================================================================
  'authenticators', // depends on users
  'sessions', // depends on users
  'accounts', // depends on users
  'verification_tokens', // no dependencies
  'users', // core auth entity
];

async function confirmReset(): Promise<boolean> {
  // Check for --force flag
  if (process.argv.includes('--force') || process.argv.includes('-f')) {
    return true;
  }

  // Non-interactive mode: if no TTY (CI, scripts), auto-confirm
  if (!process.stdin.isTTY) {
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the database!');
    console.log('   Running in non-interactive mode, proceeding automatically.\n');
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the database!');
    console.log('   The schema will be preserved, but all records will be removed.\n');

    rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function resetDatabase() {
  console.log('\n🗑️  Starting database reset...\n');

  let deletedCount = 0;

  for (const table of TABLES_TO_CLEAN) {
    try {
      // Check if table exists in saas_template schema
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'saas_template'
          AND table_name = ${table}
        );
      `);

      if (tableExists.rows[0]?.exists) {
        // Delete all rows from the table (use schema-qualified name)
        const result = await db.execute(sql.raw(`DELETE FROM "saas_template"."${table}"`));
        const rowCount = result.rowCount || 0;
        if (rowCount > 0) {
          console.log(`  ✓ Cleaned ${table}: ${rowCount} rows deleted`);
          deletedCount += rowCount;
        } else {
          console.log(`  - ${table}: already empty`);
        }
      }
    } catch (error) {
      // Table might not exist or have different constraints
      console.log(`  ⚠ ${table}: skipped (${(error as Error).message.split('\n')[0]})`);
    }
  }

  console.log(`\n✅ Database reset complete! Deleted ${deletedCount} total rows.`);
}

async function main() {
  try {
    const confirmed = await confirmReset();

    if (!confirmed) {
      console.log('\n❌ Reset cancelled.\n');
      process.exit(0);
    }

    await resetDatabase();
  } catch (error) {
    console.error('\n❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
