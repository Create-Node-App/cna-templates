// @ts-expect-error -- @apollo/client v3; types may not resolve with bundler mode in TS6
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
// @ts-expect-error
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql',
  credentials: 'same-origin',
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const { message, locations, path } of graphQLErrors) {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    }
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
