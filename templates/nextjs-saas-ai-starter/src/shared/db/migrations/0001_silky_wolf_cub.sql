ALTER TABLE "saas_template"."embedding_chunks" ALTER COLUMN "entity_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "saas_template"."embedding_entity_type";--> statement-breakpoint
CREATE TYPE "saas_template"."embedding_entity_type" AS ENUM('evidence', 'knowledge_doc', 'knowledge_doc_version');--> statement-breakpoint
ALTER TABLE "saas_template"."embedding_chunks" ALTER COLUMN "entity_type" SET DATA TYPE "saas_template"."embedding_entity_type" USING "entity_type"::"saas_template"."embedding_entity_type";