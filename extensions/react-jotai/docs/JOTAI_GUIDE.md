# Jotai State Management Guide

## Quick Start

Jotai is configured in this project. See the [official documentation](https://jotai.org/) for complete details.

## Essential Patterns

### Basic Atoms
Create atomic state units:

```tsx
import { atom, useAtom } from 'jotai';

// Primitive atom
const countAtom = atom(0);

// Derived atom
const doubleCountAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubleCount] = useAtom(doubleCountAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### Async Atoms
Handle asynchronous data:

```tsx
import { atom } from 'jotai';

const userIdAtom = atom(1);

const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

function UserProfile() {
  const [user] = useAtom(userAtom);
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Write-only Atoms
Create actions with write-only atoms:

```tsx
const todosAtom = atom([]);

const addTodoAtom = atom(
  null, // no read function
  (get, set, newTodo: string) => {
    set(todosAtom, [...get(todosAtom), { 
      id: Date.now(), 
      text: newTodo, 
      completed: false 
    }]);
  }
);

const toggleTodoAtom = atom(
  null,
  (get, set, id: number) => {
    set(todosAtom, get(todosAtom).map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }
);

function TodoApp() {
  const [todos] = useAtom(todosAtom);
  const [, addTodo] = useAtom(addTodoAtom);
  const [, toggleTodo] = useAtom(toggleTodoAtom);

  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => toggleTodo(todo.id)}>Toggle</button>
        </div>
      ))}
      <button onClick={() => addTodo('New todo')}>Add Todo</button>
    </div>
  );
}
```

### Atom Families
Create dynamic atoms:

```tsx
import { atomFamily } from 'jotai/utils';

const postAtom = atomFamily((id: number) =>
  atom(async () => {
    const response = await fetch(`/api/posts/${id}`);
    return response.json();
  })
);

function Post({ id }: { id: number }) {
  const [post] = useAtom(postAtom(id));
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

## Advanced Patterns

### Persistence
Persist atoms to localStorage:

```tsx
import { atomWithStorage } from 'jotai/utils';

const userPrefsAtom = atomWithStorage('userPrefs', {
  theme: 'light',
  language: 'en',
});

function Settings() {
  const [prefs, setPrefs] = useAtom(userPrefsAtom);
  
  return (
    <div>
      <select
        value={prefs.theme}
        onChange={(e) => setPrefs(prev => ({ ...prev, theme: e.target.value }))}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

### Resettable Atoms
Create atoms that can be reset:

```tsx
import { atomWithReset, useResetAtom } from 'jotai/utils';

const countAtom = atomWithReset(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const resetCount = useResetAtom(countAtom);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={resetCount}>Reset</button>
    </div>
  );
}
```

### Focus Atoms
Handle focus and subscriptions:

```tsx
import { focusAtom } from 'jotai-optics';

const userAtom = atom({ name: 'John', age: 30 });
const nameAtom = focusAtom(userAtom, (optic) => optic.prop('name'));

function UserName() {
  const [name, setName] = useAtom(nameAtom);
  
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

## Performance Tips

- Use `useAtomValue` for read-only access
- Use `useSetAtom` for write-only access
- Split large atoms into smaller ones
- Use `atomFamily` for dynamic data

```tsx
import { useAtomValue, useSetAtom } from 'jotai';

// ✅ Good: Only subscribe to changes
const count = useAtomValue(countAtom);

// ✅ Good: Only get setter
const setCount = useSetAtom(countAtom);

// ❌ Avoid: Unnecessary subscription
const [count, setCount] = useAtom(countAtom); // when only reading
```

## Testing

Test atoms independently:

```tsx
import { createStore } from 'jotai';

describe('countAtom', () => {
  test('should increment count', () => {
    const store = createStore();
    
    expect(store.get(countAtom)).toBe(0);
    
    store.set(countAtom, 1);
    expect(store.get(countAtom)).toBe(1);
  });
});
```

## Common Issues

### Infinite Loops
Avoid circular dependencies:
```tsx
// ❌ Bad: Circular dependency
const aAtom = atom((get) => get(bAtom) + 1);
const bAtom = atom((get) => get(aAtom) + 1);
```

### Memory Leaks
Use atom families properly:
```tsx
// ✅ Good: Clean up when needed
const { remove } = atomFamily((id) => atom(defaultValue));
remove(unusedId);
```

## Resources

- [Jotai Documentation](https://jotai.org/)
- [Jotai Examples](https://jotai.org/docs/introduction)
- [Jotai Utils](https://jotai.org/docs/utils/atom-with-storage) 