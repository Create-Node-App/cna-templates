# Zustand State Management Guide

## Quick Start

Zustand is configured in this project. See the [official documentation](https://zustand-demo.pmnd.rs/) for complete details.

## Essential Patterns

### Basic Store
Create a simple store:

```tsx
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: () => void;
  decrease: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
}));

// Usage in component
function Counter() {
  const { bears, increase, decrease } = useBearStore();
  
  return (
    <div>
      <p>Bears: {bears}</p>
      <button onClick={increase}>+</button>
      <button onClick={decrease}>-</button>
    </div>
  );
}
```

### Async Actions
Handle async operations:

```tsx
interface UserState {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const users = await api.getUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
}));
```

### Slices Pattern
Organize large stores:

```tsx
import { StateCreator } from 'zustand';

interface AuthSlice {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

interface TodoSlice {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
}

const createAuthSlice: StateCreator<
  AuthSlice & TodoSlice,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  login: async (credentials) => {
    const user = await authApi.login(credentials);
    set({ user });
  },
  logout: () => set({ user: null }),
});

const createTodoSlice: StateCreator<
  AuthSlice & TodoSlice,
  [],
  [],
  TodoSlice
> = (set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({ 
    todos: [...state.todos, todo] 
  })),
  removeTodo: (id) => set((state) => ({ 
    todos: state.todos.filter(t => t.id !== id) 
  })),
});

export const useAppStore = create<AuthSlice & TodoSlice>()((...a) => ({
  ...createAuthSlice(...a),
  ...createTodoSlice(...a),
}));
```

### Persistence
Persist store state:

```tsx
import { persist } from 'zustand/middleware';

const useUserPrefsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'user-preferences',
    }
  )
);
```

## Advanced Patterns

### Store Subscriptions
Listen to specific changes:

```tsx
// Subscribe to specific state changes
const unsubscribe = useBearStore.subscribe(
  (state) => state.bears,
  (bears) => console.log('Bears changed:', bears)
);

// Remember to unsubscribe
useEffect(() => {
  return unsubscribe;
}, []);
```

### Computed Values
Create derived state:

```tsx
const useCartStore = create((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  
  // Computed value
  get total() {
    return get().items.reduce((sum, item) => sum + item.price, 0);
  },
}));
```

## Performance Tips

- Use selectors to prevent unnecessary re-renders:
```tsx
// ✅ Good: Only re-render when bears change
const bears = useBearStore(state => state.bears);

// ❌ Avoid: Re-renders on any state change
const { bears } = useBearStore();
```

- Split large stores into smaller ones
- Use `shallow` for object comparisons:
```tsx
import { shallow } from 'zustand/shallow';

const { bears, increase } = useBearStore(
  (state) => ({ bears: state.bears, increase: state.increase }),
  shallow
);
```

## Common Issues

### Stale Closures
Use `get()` for accessing current state in actions:
```tsx
// ✅ Good
const store = create((set, get) => ({
  count: 0,
  increment: () => {
    const current = get().count;
    set({ count: current + 1 });
  },
}));
```

### TypeScript Issues
Always type your store properly:
```tsx
interface StoreState {
  count: number;
  increment: () => void;
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [GitHub Repository](https://github.com/pmndrs/zustand)
- [TypeScript Guide](https://zustand-demo.pmnd.rs/docs/guides/typescript) 