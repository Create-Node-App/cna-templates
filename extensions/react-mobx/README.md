# React MobX Extension

This extension adds MobX state management to your React application with reactive programming patterns and automatic UI updates.

## Features

- Integration with MobX
- Reactive state management
- Automatic UI updates
- Object-oriented state design
- Performance optimization
- Development workflow helpers

## Usage

MobX is automatically configured when this extension is added to your project. The extension includes:

- MobX core library and React bindings
- TypeScript support and decorators
- Store creation patterns
- Observer component setup
- Development tools integration

## Key Concepts

- **Observables**: State that can be observed for changes
- **Actions**: Functions that modify state
- **Computed**: Derived values that update automatically
- **Reactions**: Side effects that run when state changes

## Basic Usage

```tsx
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count++;
  }
}

const Counter = observer(() => {
  return <button onClick={() => store.increment()}>{store.count}</button>;
});
```

## Resources

- [MobX Documentation](https://mobx.js.org/)
- [MobX React Documentation](https://mobx.js.org/react-integration.html)
- [MobX State Tree](https://mobx-state-tree.js.org/) 