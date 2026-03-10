import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment variables configuration with runtime validation.
 *
 * This module uses @t3-oss/env-nextjs for type-safe environment variable
 * validation. Variables are validated at build time and runtime.
 *
 * @see https://env.t3.gg/docs/nextjs
 */
export const env = createEnv({
  /**
   * Server-side environment variables schema.
   * These are only available on the server.
   */
  server: {
    // Node environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Database
    DATABASE_URL: z.url().describe('PostgreSQL connection string'),

    // Authentication (Auth.js / Auth0)
    AUTH_SECRET: z.string().min(32).describe('Secret for signing tokens (min 32 chars)'),
    AUTH_URL: z.url().optional().describe('Canonical URL of the app'),
    AUTH0_CLIENT_ID: z.string().optional().describe('Auth0 client ID'),
    AUTH0_CLIENT_SECRET: z.string().optional().describe('Auth0 client secret'),
    AUTH0_ISSUER: z.url().optional().describe('Auth0 issuer URL'),

    // AI / LLM
    OPENAI_API_KEY: z.string().optional().describe('OpenAI API key'),
    ANTHROPIC_API_KEY: z.string().optional().describe('Anthropic API key'),

    // AWS (for file storage, CloudWatch)
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional().default('us-east-1'),
    AWS_S3_BUCKET: z.string().optional().describe('S3 bucket for file uploads'),

    // S3-compatible storage (MinIO for local dev)
    S3_ENDPOINT: z.string().optional().describe('S3-compatible endpoint (for MinIO)'),
    S3_PUBLIC_ENDPOINT: z.string().optional().describe('Public S3 endpoint for browser-accessible presigned URLs'),
    S3_ACCESS_KEY: z.string().optional().describe('S3 access key (overrides AWS_ACCESS_KEY_ID)'),
    S3_SECRET_KEY: z.string().optional().describe('S3 secret key (overrides AWS_SECRET_ACCESS_KEY)'),
    S3_BUCKET: z.string().optional().describe('S3 bucket name (overrides AWS_S3_BUCKET)'),
    S3_REGION: z.string().optional().default('us-east-1'),

    // Observability
    SENTRY_DSN: z.url().optional().describe('Sentry DSN for error tracking'),

    // Feature flags
    ENABLE_AI_FEATURES: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),

    // GitHub (OAuth App integration)
    GITHUB_INTEGRATION_CLIENT_ID: z.string().optional().describe('GitHub OAuth App client ID'),
    GITHUB_INTEGRATION_CLIENT_SECRET: z.string().optional().describe('GitHub OAuth App client secret'),

    // LinkedIn (OpenID Connect integration)
    LINKEDIN_CLIENT_ID: z.string().optional().describe('LinkedIn OAuth client ID'),
    LINKEDIN_CLIENT_SECRET: z.string().optional().describe('LinkedIn OAuth client secret'),
  },

  /**
   * Client-side environment variables schema.
   * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_).
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Next.js SaaS AI Template'),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  },

  /**
   * Runtime environment variables.
   * Destructure all variables from `process.env` to ensure they're validated.
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_ISSUER: process.env.AUTH0_ISSUER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PUBLIC_ENDPOINT: process.env.S3_PUBLIC_ENDPOINT,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
    GITHUB_INTEGRATION_CLIENT_ID: process.env.GITHUB_INTEGRATION_CLIENT_ID,
    GITHUB_INTEGRATION_CLIENT_SECRET: process.env.GITHUB_INTEGRATION_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  /**
   * Skip validation in certain environments.
   * Useful for Docker builds or CI where env vars aren't available.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined.
   * Makes it easier to use optional variables with falsy defaults.
   */
  emptyStringAsUndefined: true,
});

/**
 * Type-safe environment variable access.
 * Use this instead of process.env for validated variables.
 *
 * @example
 * import { env } from '@/shared/lib/env';
 *
 * // Server-side
 * const dbUrl = env.DATABASE_URL;
 *
 * // Client-side
 * const appName = env.NEXT_PUBLIC_APP_NAME;
 */
