# t3-env for Next.js

Adds [`@t3-oss/env-nextjs`](https://env.t3.gg/) with a Zod schema for server and client environment variables.

## Generated files

- `src/env.ts` — validated `env` export (path follows your `srcDir` choice)
- Startup validation runs via the base template `instrumentation.ts` hook

## Usage

```typescript
import { env } from '@/env';

const appName = env.NEXT_PUBLIC_APP_NAME;
```

## CI / Docker

Set `SKIP_ENV_VALIDATION=true` when environment variables are injected at runtime instead of build time.
