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
  // QUIZZES (depend on persons, skills, tenants)
  // ============================================================================
  'quiz_attempts',
  'quiz_cache',

  // ============================================================================
  // EMBEDDINGS (depend on tenants)
  // ============================================================================
  'embedding_chunks',

  // ============================================================================
  // LEARNING (depend on persons, knowledge_documents, tenants)
  // ============================================================================
  'roadmap_node_progress', // depends on roadmap_progress
  'roadmap_progress', // depends on persons, knowledge_documents
  'training_completions', // depends on persons, knowledge_documents
  'learning_assignments', // depends on persons

  // ============================================================================
  // OKRs / OBJECTIVES (depend on persons, capabilities, knowledge_documents)
  // ============================================================================
  'kr_check_ins', // depends on key_results, persons
  'key_results', // depends on objectives, skills
  'objective_comments', // depends on objectives, persons
  'objectives', // depends on persons, capabilities, knowledge_documents

  // ============================================================================
  // ASSESSMENT HISTORY (depend on persons, skills)
  // ============================================================================
  'assessment_history',

  // ============================================================================
  // PERFORMANCE ASSESSMENTS & PROJECTS (depend on persons, projects, evidences, tenants)
  // ============================================================================
  'performance_assessment_dimensions', // depends on performance_assessments
  'performance_assessments', // depends on persons, projects, evidences, tenants
  'performance_assessment_requests', // depends on persons, projects, tenants
  'peer_nominations', // depends on review_cycles, persons
  'review_cycle_assignments', // depends on review_cycles, persons, performance_assessments
  'review_cycle_participants', // depends on review_cycles, persons
  'review_cycles', // depends on tenants, persons
  'pulse_response_answers', // depends on pulse_responses, pulse_questions
  'pulse_responses', // depends on pulse_surveys, persons
  'pulse_questions', // depends on pulse_surveys
  'pulse_surveys', // depends on tenants, persons
  'project_members', // depends on projects, persons, tenants
  'projects', // depends on clients, persons, tenants

  // TRACK bridge tables (M:N, depend on track entities)
  'track_goal_kpis',
  'track_goal_objectives',
  'track_route_projects',
  'track_play_routes',
  'track_play_assignments',
  'track_cadence_participants',

  'clients', // depends on tenants

  // ============================================================================
  // KNOWLEDGE DOCUMENTS (depend on persons, tenants)
  // ============================================================================
  'knowledge_document_versions', // depends on knowledge_documents
  'knowledge_documents', // depends on tenants, persons

  // ============================================================================
  // CAPABILITIES (depend on skills, tenants)
  // ============================================================================
  'capability_requirements', // depends on capabilities, skills
  'capabilities', // depends on tenants

  // ============================================================================
  // INTERESTS (depend on skills, persons)
  // ============================================================================
  'interest_signals',

  // ============================================================================
  // ASSESSMENTS (depend on skills, persons)
  // ============================================================================
  'assessment_evidence', // depends on assessments, evidences
  'assessments',

  // ============================================================================
  // EVIDENCES & FILES (depend on persons)
  // ============================================================================
  'cv_processing_jobs', // depends on persons, file_objects
  'file_objects', // depends on persons
  'evidences', // depends on persons, skills

  // ============================================================================
  // FEEDBACK & 1:1 MEETINGS & RECOGNITIONS (depend on persons, tenants)
  // ============================================================================
  'feedback', // depends on persons, one_on_one_meetings
  'one_on_one_meetings', // depends on persons
  'recognitions', // depends on persons, recognition_categories
  'recognition_categories', // depends on tenants

  // ============================================================================
  // PERSONS & RELATIONS (depend on tenants)
  // ============================================================================
  'management_hierarchy_cache', // depends on persons
  'assistant_conversations', // depends on persons, tenants
  'person_relations', // depends on persons
  'department_managers', // depends on persons, tenants
  'tenant_membership_roles', // depends on tenant_memberships, roles (PBAC)
  'tenant_memberships', // depends on users, tenants, persons
  'tenant_invitations', // depends on tenants, users (optional roleId → roles)
  'persons', // depends on tenants

  // ============================================================================
  // SKILLS (depend on tenants)
  // ============================================================================
  'skill_scale_levels', // optional: old schema, depends on skill_scales
  'skill_scales', // depends on tenants
  'skill_aliases', // depends on skills
  'skills', // depends on tenants

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
