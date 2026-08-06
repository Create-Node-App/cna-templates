import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('My App'),
});

function parseEnv() {
  const skipValidation = process.env.SKIP_ENV_VALIDATION === 'true';

  if (skipValidation) {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV ?? 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'My App',
    });
  }

  return envSchema.parse(process.env);
}

export const env = parseEnv();
