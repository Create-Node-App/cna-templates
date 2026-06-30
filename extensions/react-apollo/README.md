# Apollo Client Extension

Adds [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL data fetching, caching, and state management in React applications.

## Generated files

- `src/app/apollo-provider.tsx` — Apollo Provider wrapper for client-side usage
- `src/lib/apollo-client.ts` — Apollo Client instance with configurable URI

## Usage

Wrap your app with the `ApolloProvider`:

```tsx
import { ApolloProvider } from '@/app/apollo-provider';

export default function RootLayout({ children }) {
  return <ApolloProvider>{children}</ApolloProvider>;
}
```

Set `NEXT_PUBLIC_GRAPHQL_ENDPOINT` to your GraphQL API URL (defaults to `/api/graphql`).

## Resources

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Documentation](https://graphql.org/learn/)
