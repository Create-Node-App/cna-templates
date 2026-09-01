CREATE TYPE "saas_template"."embedding_entity_type" AS ENUM('skill', 'skill_alias', 'capability', 'evidence', 'cv_chunk', 'knowledge_doc', 'knowledge_doc_version', 'assessment_note', 'person_profile');--> statement-breakpoint
CREATE TYPE "saas_template"."employment_type" AS ENUM('employee', 'contractor', 'intern', 'freelancer');--> statement-breakpoint
CREATE TYPE "saas_template"."file_object_type" AS ENUM('document', 'image', 'other');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_conflict_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_conflict_status" AS ENUM('open', 'resolved', 'ignored');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_entity_link_state" AS ENUM('linked', 'conflict', 'orphaned', 'deleted_remote');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_field_ownership" AS ENUM('remote_authoritative', 'local_authoritative', 'merge', 'append_only');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_processing_status" AS ENUM('queued', 'processing', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_provider" AS ENUM('github');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_sync_item_status" AS ENUM('created', 'updated', 'skipped_no_change', 'conflict', 'error');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_sync_mode" AS ENUM('migration_full', 'sync_incremental', 'reconcile', 'dry_run');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_sync_run_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "saas_template"."integration_type" AS ENUM('github');--> statement-breakpoint
CREATE TYPE "saas_template"."person_relation_type" AS ENUM('manager', 'mentor', 'peer');--> statement-breakpoint
CREATE TYPE "saas_template"."person_status" AS ENUM('active', 'inactive', 'onboarding');--> statement-breakpoint
CREATE TYPE "saas_template"."tenant_role" AS ENUM('member', 'manager', 'admin');--> statement-breakpoint
CREATE TYPE "saas_template"."webhook_delivery_status" AS ENUM('pending', 'success', 'failed', 'retrying');--> statement-breakpoint
CREATE TYPE "saas_template"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE "saas_template"."accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."authenticators" (
	"credential_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_user_id_credential_id_pk" PRIMARY KEY("user_id","credential_id"),
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."tenant_membership_roles" (
	"membership_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_membership_roles_membership_id_role_id_pk" PRIMARY KEY("membership_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."tenant_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid,
	"role" "saas_template"."tenant_role" DEFAULT 'member' NOT NULL,
	"primary_role_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"settings" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."person_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"related_person_id" uuid NOT NULL,
	"relation_type" "saas_template"."person_relation_type" NOT NULL,
	"is_primary_manager" boolean DEFAULT true,
	"notes" text,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"external_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"display_name" varchar(255),
	"avatar_url" text,
	"status" "saas_template"."person_status" DEFAULT 'active' NOT NULL,
	"title" varchar(255),
	"department" varchar(255),
	"department_id" text,
	"location" varchar(255),
	"timezone" varchar(50),
	"employment_type" "saas_template"."employment_type" DEFAULT 'employee',
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"work_email" varchar(255),
	"personal_email" varchar(255),
	"phone_number" varchar(50),
	"nationality" varchar(100),
	"pronouns" varchar(50),
	"linkedin_url" varchar(500),
	"github_username" varchar(100),
	"bio" text,
	"profile_initialized" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "saas_template"."audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"changes" jsonb,
	"metadata" jsonb,
	"request_id" text,
	"trace_id" text,
	"ip_address" text,
	"user_agent" text,
	"ai_model_version" text,
	"ai_prompt_version" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."assistant_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"title" text DEFAULT 'Nueva conversación' NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."file_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"owner_person_id" uuid,
	"type" "saas_template"."file_object_type" NOT NULL,
	"s3_bucket" varchar(255) NOT NULL,
	"s3_key" varchar(1024) NOT NULL,
	"original_filename" varchar(255),
	"mime_type" varchar(127) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"checksum" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."department_managers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"department_id" text NOT NULL,
	"manager_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"key" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_entity_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" "saas_template"."integration_provider" NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"external_id" text NOT NULL,
	"local_entity_type" varchar(80) NOT NULL,
	"local_entity_id" text NOT NULL,
	"sync_hash" varchar(128),
	"external_updated_at" timestamp with time zone,
	"link_state" "saas_template"."integration_entity_link_state" DEFAULT 'linked' NOT NULL,
	"metadata" jsonb,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_field_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" "saas_template"."integration_provider" NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"field_path" varchar(255) NOT NULL,
	"ownership" "saas_template"."integration_field_ownership" DEFAULT 'merge' NOT NULL,
	"merge_strategy" varchar(80),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_sync_conflicts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"run_id" uuid,
	"provider" "saas_template"."integration_provider" NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"external_id" text,
	"status" "saas_template"."integration_conflict_status" DEFAULT 'open' NOT NULL,
	"severity" "saas_template"."integration_conflict_severity" DEFAULT 'medium' NOT NULL,
	"conflict_type" varchar(100) NOT NULL,
	"details" jsonb,
	"resolution_action" varchar(80),
	"resolved_by_person_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_sync_cursors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" "saas_template"."integration_provider" NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"scope_hash" varchar(128) NOT NULL,
	"cursor_value" text NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_sync_run_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"provider" "saas_template"."integration_provider" NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"external_id" text,
	"local_entity_type" varchar(80),
	"local_entity_id" text,
	"status" "saas_template"."integration_sync_item_status" NOT NULL,
	"reason" text,
	"payload_hash" varchar(128),
	"diff" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_sync_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" "saas_template"."integration_provider" NOT NULL,
	"mode" "saas_template"."integration_sync_mode" NOT NULL,
	"status" "saas_template"."integration_sync_run_status" DEFAULT 'queued' NOT NULL,
	"entities" text[] DEFAULT '{}' NOT NULL,
	"scope" jsonb,
	"summary" jsonb,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"triggered_by_person_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."integration_processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"integration" "saas_template"."integration_type" NOT NULL,
	"status" "saas_template"."integration_processing_status" DEFAULT 'queued' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."embedding_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" "saas_template"."embedding_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"chunk_index" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"metadata" text,
	"embedding" vector(1536) NOT NULL,
	"embedding_model" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_template"."tenant_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(64) NOT NULL,
	"role" "saas_template"."tenant_role" DEFAULT 'member' NOT NULL,
	"role_id" uuid,
	"status" "saas_template"."invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by_user_id" text,
	"message" text,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "saas_template"."webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "saas_template"."webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"response_status" integer,
	"response_body" text,
	"error_message" text,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "saas_template"."webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"secret" varchar(64) NOT NULL,
	"events" text[] NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"headers" jsonb,
	"retry_count" integer DEFAULT 3 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saas_template"."accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "saas_template"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "saas_template"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "saas_template"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_membership_roles" ADD CONSTRAINT "tenant_membership_roles_membership_id_tenant_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "saas_template"."tenant_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_membership_roles" ADD CONSTRAINT "tenant_membership_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "saas_template"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "saas_template"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "saas_template"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_memberships" ADD CONSTRAINT "tenant_memberships_primary_role_id_roles_id_fk" FOREIGN KEY ("primary_role_id") REFERENCES "saas_template"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."person_relations" ADD CONSTRAINT "person_relations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."person_relations" ADD CONSTRAINT "person_relations_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "saas_template"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."person_relations" ADD CONSTRAINT "person_relations_related_person_id_persons_id_fk" FOREIGN KEY ("related_person_id") REFERENCES "saas_template"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."persons" ADD CONSTRAINT "persons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."audit_events" ADD CONSTRAINT "audit_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."audit_events" ADD CONSTRAINT "audit_events_actor_id_persons_id_fk" FOREIGN KEY ("actor_id") REFERENCES "saas_template"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."assistant_conversations" ADD CONSTRAINT "assistant_conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."assistant_conversations" ADD CONSTRAINT "assistant_conversations_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "saas_template"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."file_objects" ADD CONSTRAINT "file_objects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."file_objects" ADD CONSTRAINT "file_objects_owner_person_id_persons_id_fk" FOREIGN KEY ("owner_person_id") REFERENCES "saas_template"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."department_managers" ADD CONSTRAINT "department_managers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."department_managers" ADD CONSTRAINT "department_managers_manager_id_persons_id_fk" FOREIGN KEY ("manager_id") REFERENCES "saas_template"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."permissions" ADD CONSTRAINT "permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "saas_template"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "saas_template"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_entity_links" ADD CONSTRAINT "integration_entity_links_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_field_mappings" ADD CONSTRAINT "integration_field_mappings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_conflicts" ADD CONSTRAINT "integration_sync_conflicts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_conflicts" ADD CONSTRAINT "integration_sync_conflicts_run_id_integration_sync_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "saas_template"."integration_sync_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_conflicts" ADD CONSTRAINT "integration_sync_conflicts_resolved_by_person_id_persons_id_fk" FOREIGN KEY ("resolved_by_person_id") REFERENCES "saas_template"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_cursors" ADD CONSTRAINT "integration_sync_cursors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_run_items" ADD CONSTRAINT "integration_sync_run_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_run_items" ADD CONSTRAINT "integration_sync_run_items_run_id_integration_sync_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "saas_template"."integration_sync_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_runs" ADD CONSTRAINT "integration_sync_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_sync_runs" ADD CONSTRAINT "integration_sync_runs_triggered_by_person_id_persons_id_fk" FOREIGN KEY ("triggered_by_person_id") REFERENCES "saas_template"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_processing_jobs" ADD CONSTRAINT "integration_processing_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."integration_processing_jobs" ADD CONSTRAINT "integration_processing_jobs_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "saas_template"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."embedding_chunks" ADD CONSTRAINT "embedding_chunks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_invitations" ADD CONSTRAINT "tenant_invitations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_invitations" ADD CONSTRAINT "tenant_invitations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "saas_template"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_invitations" ADD CONSTRAINT "tenant_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "saas_template"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."tenant_invitations" ADD CONSTRAINT "tenant_invitations_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "saas_template"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_webhook_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "saas_template"."webhook_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_template"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "saas_template"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tenant_membership_roles_membership_idx" ON "saas_template"."tenant_membership_roles" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "tenant_membership_roles_role_idx" ON "saas_template"."tenant_membership_roles" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_memberships_user_tenant_idx" ON "saas_template"."tenant_memberships" USING btree ("user_id","tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_memberships_tenant_idx" ON "saas_template"."tenant_memberships" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_memberships_user_idx" ON "saas_template"."tenant_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_events_tenant_idx" ON "saas_template"."audit_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "saas_template"."audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_events_actor_idx" ON "saas_template"."audit_events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_events_timestamp_idx" ON "saas_template"."audit_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_events_request_idx" ON "saas_template"."audit_events" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "assistant_conversations_tenant_person_idx" ON "saas_template"."assistant_conversations" USING btree ("tenant_id","person_id");--> statement-breakpoint
CREATE INDEX "assistant_conversations_updated_idx" ON "saas_template"."assistant_conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "file_objects_owner_idx" ON "saas_template"."file_objects" USING btree ("owner_person_id");--> statement-breakpoint
CREATE INDEX "file_objects_s3_idx" ON "saas_template"."file_objects" USING btree ("s3_bucket","s3_key");--> statement-breakpoint
CREATE INDEX "department_managers_department_idx" ON "saas_template"."department_managers" USING btree ("tenant_id","department_id");--> statement-breakpoint
CREATE INDEX "department_managers_manager_idx" ON "saas_template"."department_managers" USING btree ("tenant_id","manager_id");--> statement-breakpoint
CREATE INDEX "permissions_tenant_idx" ON "saas_template"."permissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "permissions_tenant_key_idx" ON "saas_template"."permissions" USING btree ("tenant_id","key");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "saas_template"."role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "saas_template"."role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "roles_tenant_idx" ON "saas_template"."roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "roles_tenant_slug_idx" ON "saas_template"."roles" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_entity_links_external_unique" ON "saas_template"."integration_entity_links" USING btree ("tenant_id","provider","entity_type","external_id");--> statement-breakpoint
CREATE INDEX "integration_entity_links_local_lookup_idx" ON "saas_template"."integration_entity_links" USING btree ("tenant_id","local_entity_type","local_entity_id");--> statement-breakpoint
CREATE INDEX "integration_entity_links_state_idx" ON "saas_template"."integration_entity_links" USING btree ("tenant_id","provider","link_state");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_field_mappings_unique" ON "saas_template"."integration_field_mappings" USING btree ("tenant_id","provider","entity_type","field_path");--> statement-breakpoint
CREATE INDEX "integration_sync_conflicts_open_idx" ON "saas_template"."integration_sync_conflicts" USING btree ("tenant_id","provider","status");--> statement-breakpoint
CREATE INDEX "integration_sync_conflicts_run_idx" ON "saas_template"."integration_sync_conflicts" USING btree ("run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_sync_cursors_unique" ON "saas_template"."integration_sync_cursors" USING btree ("tenant_id","provider","entity_type","scope_hash");--> statement-breakpoint
CREATE INDEX "integration_sync_run_items_run_idx" ON "saas_template"."integration_sync_run_items" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "integration_sync_run_items_status_idx" ON "saas_template"."integration_sync_run_items" USING btree ("tenant_id","provider","status");--> statement-breakpoint
CREATE INDEX "integration_sync_runs_provider_status_idx" ON "saas_template"."integration_sync_runs" USING btree ("tenant_id","provider","status");--> statement-breakpoint
CREATE INDEX "integration_sync_runs_started_at_idx" ON "saas_template"."integration_sync_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "integration_processing_jobs_status_idx" ON "saas_template"."integration_processing_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "integration_processing_jobs_person_idx" ON "saas_template"."integration_processing_jobs" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "integration_processing_jobs_integration_idx" ON "saas_template"."integration_processing_jobs" USING btree ("integration");--> statement-breakpoint
CREATE INDEX "integration_processing_jobs_person_integration_idx" ON "saas_template"."integration_processing_jobs" USING btree ("person_id","integration");--> statement-breakpoint
CREATE INDEX "embedding_chunks_embedding_idx" ON "saas_template"."embedding_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "embedding_chunks_entity_idx" ON "saas_template"."embedding_chunks" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "embedding_chunks_tenant_idx" ON "saas_template"."embedding_chunks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_tenant_idx" ON "saas_template"."webhook_deliveries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_endpoint_idx" ON "saas_template"."webhook_deliveries" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_status_idx" ON "saas_template"."webhook_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_pending_idx" ON "saas_template"."webhook_deliveries" USING btree ("tenant_id","status","next_retry_at");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_event_idx" ON "saas_template"."webhook_deliveries" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_tenant_idx" ON "saas_template"."webhook_endpoints" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_enabled_idx" ON "saas_template"."webhook_endpoints" USING btree ("tenant_id","enabled");