# React Query (TanStack Query) Guide

## Quick Start

React Query is configured in this project. See the [official documentation](https://tanstack.com/query/latest) for complete details.

## Essential Patterns

### Basic Query
Fetch data with caching:

```tsx
import { useQuery } from '@tanstack/react-query';

function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Mutations
Handle data updates:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateUser() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (newUser) => 
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      }),
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <button 
      onClick={() => mutation.mutate({ name: 'New User' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Creating...' : 'Create User'}
    </button>
  );
}
```

### Query with Parameters
Parameterized queries:

```tsx
function UserDetail({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
    enabled: !!userId, // Only run when userId exists
  });

  return <div>{user?.name}</div>;
}
```

### Optimistic Updates
Update UI before server response:

```tsx
const updateUser = useMutation({
  mutationFn: updateUserApi,
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // Snapshot previous value
    const previousUsers = queryClient.getQueryData(['users']);

    // Optimistically update
    queryClient.setQueryData(['users'], (old) =>
      old?.map(user => user.id === newUser.id ? newUser : user)
    );

    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['users'], context.previousUsers);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

## Advanced Patterns

### Infinite Queries
Handle pagination:

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteUsers() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['users'],
    queryFn: ({ pageParam }) =>
      fetch(`/api/users?page=${pageParam}`).then(res => res.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  return (
    <div>
      {data?.pages.map((group, i) => (
        <div key={i}>
          {group.users.map(user => (
            <div key={user.id}>{user.name}</div>
          ))}
        </div>
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  );
}
```

### Query Client Setup
Configure global settings:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Performance Tips

- Use query keys effectively for caching
- Implement proper error boundaries
- Use `staleTime` to reduce refetching
- Leverage background refetching
- Implement loading states properly

## Common Issues

### Stale Data
Configure stale time appropriately:
```tsx
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
});
```

### Memory Leaks
Set proper garbage collection:
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
```

### Error Handling
Implement proper error boundaries:
```tsx
const { data, error, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  throwOnError: false, // Handle errors manually
});

if (isError) {
  console.error('Failed to fetch users:', error);
}
```

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Migration Guide](https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys) 