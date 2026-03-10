import { relations } from 'drizzle-orm';
import { boolean, jsonb, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { appSchema } from './schema';
import { tenants } from './tenants';

export const personStatusEnum = appSchema.enum('person_status', ['active', 'inactive', 'onboarding']);

export const employmentTypeEnum = appSchema.enum('employment_type', ['employee', 'contractor', 'intern', 'freelancer']);

export const persons = appSchema.table('persons', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),

  // Identity
  externalId: varchar('external_id', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: text('avatar_url'),

  // Status
  status: personStatusEnum('status').default('active').notNull(),

  // Metadata
  title: varchar('title', { length: 255 }),
  department: varchar('department', { length: 255 }),
  departmentId: text('department_id'),
  location: varchar('location', { length: 255 }),
  timezone: varchar('timezone', { length: 50 }),

  // Employment details
  employmentType: employmentTypeEnum('employment_type').default('employee'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),

  // Contact information
  workEmail: varchar('work_email', { length: 255 }),
  personalEmail: varchar('personal_email', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 50 }),

  // Personal details
  nationality: varchar('nationality', { length: 100 }),
  pronouns: varchar('pronouns', { length: 50 }),

  // Social profiles
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  githubUsername: varchar('github_username', { length: 100 }),

  // Bio
  bio: text('bio'),

  // Profile state
  profileInitialized: boolean('profile_initialized').default(false),

  // Extra metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
});

export const personRelationTypeEnum = appSchema.enum('person_relation_type', ['manager', 'mentor', 'peer']);

export const personRelations = appSchema.table('person_relations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  personId: uuid('person_id')
    .notNull()
    .references(() => persons.id, { onDelete: 'cascade' }),
  relatedPersonId: uuid('related_person_id')
    .notNull()
    .references(() => persons.id, { onDelete: 'cascade' }),
  relationType: personRelationTypeEnum('relation_type').notNull(),
  isPrimaryManager: boolean('is_primary_manager').default(true),
  notes: text('notes'),
  startDate: timestamp('start_date', { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const personsRelations = relations(persons, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [persons.tenantId],
    references: [tenants.id],
  }),
  relations: many(personRelations),
}));

export const personRelationsRelations = relations(personRelations, ({ one }) => ({
  person: one(persons, {
    fields: [personRelations.personId],
    references: [persons.id],
  }),
  relatedPerson: one(persons, {
    fields: [personRelations.relatedPersonId],
    references: [persons.id],
  }),
  tenant: one(tenants, {
    fields: [personRelations.tenantId],
    references: [tenants.id],
  }),
}));

export type Person = typeof persons.$inferSelect;
export type NewPerson = typeof persons.$inferInsert;
export type PersonRelation = typeof personRelations.$inferSelect;
export type NewPersonRelation = typeof personRelations.$inferInsert;
