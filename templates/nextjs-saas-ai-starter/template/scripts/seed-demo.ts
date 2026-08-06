/**
 * Demo Seed Script
 *
 * Seeds the database with a basic demo tenant and users for development/testing.
 * Run with: pnpm db:seed
 */

import { db } from '../src/shared/db';
import * as schema from '../src/shared/db/schema';

async function main() {
  console.log('🌱 Seeding demo data...');

  // Seed demo tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      name: 'Acme Corp',
      slug: 'acme',
      settings: null,
    })
    .onConflictDoNothing()
    .returning();

  if (!tenant) {
    console.log('Tenant "acme" already exists, skipping seed.');
    return;
  }

  console.log(`✅ Created tenant: ${tenant.name} (${tenant.slug})`);

  // Seed admin role
  await db
    .insert(schema.roles)
    .values({
      tenantId: tenant.id,
      name: 'Admin',
      slug: 'admin',
      description: 'Full administrative access',
      isSystem: true,
    })
    .onConflictDoNothing();

  // Seed member role
  await db
    .insert(schema.roles)
    .values({
      tenantId: tenant.id,
      name: 'Member',
      slug: 'member',
      description: 'Standard member access',
      isSystem: true,
    })
    .onConflictDoNothing();

  console.log(`✅ Created roles: Admin, Member`);

  console.log('\n🎉 Demo seed complete!');
  console.log('\nDemo credentials:');
  console.log('  Tenant: acme');
  console.log('  Login at: http://localhost:3000/t/acme/login');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
