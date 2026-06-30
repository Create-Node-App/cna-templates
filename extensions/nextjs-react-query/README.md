# React Query for Next.js

Adds [TanStack React Query](https://tanstack.com/query/latest) with SSR-compatible setup for Next.js App Router.

## Generated files

- `src/lib/query-client.ts` — server and client query client factories
- `src/app/providers.tsx` — QueryClientProvider with SSR hydration support

## Features

- SSR-compatible with `dehydrate`/`hydrate` pattern
- Separate query client instances per request (avoids stale data)
- React Query Devtools in development

## Usage

In server components, prefetch data:

```tsx
import { getQueryClient } from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({ queryKey: ['data'], queryFn: fetchData });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  );
}
```

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [SSR with Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
