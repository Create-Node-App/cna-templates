# React Recoil Extension

> **Deprecation notice:** Recoil has had minimal maintenance since 2020 and Meta has not announced a successor. This extension remains available for legacy projects, but **new projects should prefer [Jotai](../react-jotai) or [Zustand](../react-zustand)**. This extension may be removed in a future major release of the template catalog.

This extension adds Recoil state management to your React application with atomic state management and fine-grained reactivity.

## Features

- Integration with Recoil
- Atomic state management
- Fine-grained reactivity
- Concurrent mode support
- Performance optimization
- Development workflow helpers

## Usage

Recoil is automatically configured when this extension is added to your project. The extension includes:

- Recoil library and React integration
- Atom and selector patterns
- State persistence utilities
- DevTools integration
- TypeScript support

## Key Concepts

- **Atoms**: Units of state that components can subscribe to
- **Selectors**: Pure functions that derive state from atoms
- **RecoilRoot**: Context provider for Recoil state
- **Hooks**: useRecoilState, useRecoilValue, useSetRecoilState

## Basic Usage

```tsx
import { atom, selector, useRecoilState } from 'recoil';

const countState = atom({
  key: 'countState',
  default: 0,
});

const doubleCountState = selector({
  key: 'doubleCountState',
  get: ({get}) => {
    const count = get(countState);
    return count * 2;
  },
});

function Counter() {
  const [count, setCount] = useRecoilState(countState);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Resources

- [Recoil Documentation](https://recoiljs.org/)
- [Recoil GitHub Repository](https://github.com/facebookexperimental/Recoil)
- [React State Management Guide](https://react.dev/learn/managing-state) 