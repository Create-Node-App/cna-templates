# 🚄 Performance

Next.js SaaS AI Template is optimized for performance using Next.js 15, React Server Components, and Tailwind CSS v4.

## Server Components First

React Server Components (RSC) reduce client-side JavaScript:

```typescript
// ✅ Server Component (default) - no JS sent to client
export default async function Page() {
  const data = await fetchData();
  return <DataDisplay data={data} />;
}

// ❌ Only use 'use client' when necessary
'use client';
export function InteractiveWidget() {
  const [state, setState] = useState();
  // ...
}
```

## Code Splitting

Code splitting is a technique of splitting production JavaScript into smaller files, thus allowing the application to be only partially downloaded. Any unused code will not be downloaded until it is required by the application.

Most of the time code splitting should be done on the routes level, but can also be used for other lazy loaded parts of application.

Do not code split everything as it might even worsen your application's performance.

## Component and state optimizations

- Do not put everything in a single state. That might trigger unnecessary re-renders. Instead split the global state into multiple stores according to where it is being used.

- Keep the state as close as possible to where it is being used. This will prevent re-rendering components that do not depend on the updated state.

- If you have a piece of state that is initialized by an expensive computation, use the state initializer function instead of executing it directly because the expensive function will be run only once as it is supposed to. e.g:

```javascript
import { useState } from 'react';

// instead of this which would be executed on every re-render:
const [state, setState] = useState(myExpensiveFn());

// prefer this which is executed only once:
const [state, setState] = useState(() => myExpensiveFn());
```

- If you develop an application that requires the state to track many elements at once, you might consider state management libraries with atomic updates such as [recoil](https://recoiljs.org/) or [jotai](https://jotai.pmnd.rs/).

- If your application is expected to have frequent updates that might affect performance, use zero-runtime styling solutions. **Next.js SaaS AI Template uses Tailwind CSS v4** which generates styles at build time with no runtime overhead.

## Database Performance

- Use **indexes** on frequently queried columns
- Use **pgvector HNSW indexes** for embedding similarity searches
- Implement **pagination** for large datasets
- Use **Drizzle's query builder** for type-safe, optimized queries

```typescript
// Paginated query
const skills = await db.query.skills.findMany({
  limit: 20,
  offset: page * 20,
  orderBy: [asc(skills.name)],
});
```

## Image optimizations

Consider lazy loading images that are not in the viewport.

Use modern image formats such as WEBP for faster image loading.

Use `srcset` to load the most optimal image for the clients screen size.

## Web vitals

Since Google started taking web vitals in account when indexing websites, you should keep an eye on web vitals scores from [Lighthouse](https://web.dev/measure/) and [Pagespeed Insights](https://pagespeed.web.dev/).
