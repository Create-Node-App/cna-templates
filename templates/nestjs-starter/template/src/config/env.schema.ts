import { z } from 'zod';

/** Treat blank env values as unset so optional keys can stay commented-in empty. */
const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().url().optional(),
);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().min(1).default('NestJS API'),
  DATABASE_URL: optionalUrl,
  JWT_SECRET: optionalNonEmptyString,
  JWT_EXPIRATION: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  CORS_ORIGIN: optionalNonEmptyString,
});

export type EnvConfig = z.infer<typeof envSchema>;
