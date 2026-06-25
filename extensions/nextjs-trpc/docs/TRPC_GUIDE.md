# tRPC Guide

## Server

Define procedures in `src/server/routers/index.ts`:

```typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => ({
      greeting: `Hello ${input.text ?? 'world'}`,
    })),
});
```

Add sub-routers by merging them into `appRouter`.

## Client

Use the generated hooks in Client Components:

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';

export function Greeting() {
  const trpc = useTRPC();
  const result = useQuery(trpc.hello.queryOptions({ text: 'Next.js' }));

  if (result.isLoading) return null;
  return <p>{result.data?.greeting}</p>;
}
```

## Provider composition

Provider registration lives in `src/app-providers.tsx`. Additional CNA extensions (for example TanStack Query) can append providers to the same registry.

## References

- [tRPC Next.js App Router setup](https://trpc.io/docs/client/nextjs/app-router/setup)
- [TanStack React Query integration](https://trpc.io/docs/client/tanstack-react-query/setup)
