import { envSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}
