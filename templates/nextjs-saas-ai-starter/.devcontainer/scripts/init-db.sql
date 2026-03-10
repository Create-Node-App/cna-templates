-- =============================================================================
-- PostgreSQL initialization script for Next.js SaaS AI Template
-- This script runs when the database container is first created
-- =============================================================================

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create dedicated schemas
CREATE SCHEMA IF NOT EXISTS saas_template;
CREATE SCHEMA IF NOT EXISTS drizzle;

-- Set default search_path for the app user
ALTER ROLE saas_app SET search_path TO saas_template, public, drizzle;

-- Grant privileges to saas_app user
GRANT ALL PRIVILEGES ON DATABASE saas_template_dev TO saas_app;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Next.js SaaS AI Template database initialized with extensions: vector, uuid-ossp, pg_trgm';
END $$;
