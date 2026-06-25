# tRPC for Next.js

Adds [tRPC v11](https://trpc.io/) with TanStack Query and the App Router fetch adapter for end-to-end type-safe APIs.

## Generated files

- `src/server/trpc.ts` — tRPC initialization and context
- `src/server/routers/index.ts` — root router with an example `hello` procedure
- `src/utils/query-client.ts` — shared React Query client factory
- `src/utils/trpc.tsx` — client hooks and `TRPCReactProvider`
- `src/app/api/trpc/[trpc]/route.ts` — App Router handler
- `src/app-providers.tsx` — composable provider registry (works with other CNA provider extensions)
- `src/components/providers.tsx` — client wrapper used by the root layout

## Usage

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc';

export function Example() {
  const trpc = useTRPC();
  const hello = useQuery(trpc.hello.queryOptions({ text: 'world' }));
  return <p>{hello.data?.greeting}</p>;
}
```

See `docs/TRPC_GUIDE.md` for router and client patterns.
