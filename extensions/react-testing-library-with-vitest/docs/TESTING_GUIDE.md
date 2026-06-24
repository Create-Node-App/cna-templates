# Vitest + React Testing Library Guide

## Quick start

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Example

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    screen.getByRole('button', { name: 'Click me' }).click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Resources

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
