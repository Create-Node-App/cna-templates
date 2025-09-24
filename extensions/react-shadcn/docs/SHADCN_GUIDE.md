# shadcn/ui Best Practices

## Quick Start

shadcn/ui is a collection of copy/paste component patterns built on Radix primitives + Tailwind CSS. This extension sets up the core utilities (`cva`, `tailwind-merge`, `clsx`, Radix Slot, icons) so you can scaffold components consistently.

## Core Utilities

### `cn` Helper

Place in `src/lib/cn.ts` (or similar):

```ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
```

### Variant Pattern

Use `class-variance-authority` for style variants:

```ts
import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700',
        success: 'bg-emerald-500 text-white border-transparent',
        warning: 'bg-amber-500 text-white border-transparent',
        destructive: 'bg-red-600 text-white border-transparent'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);
```

## Component Composition

### Button with Icon

```tsx
import { Button } from '../ui/button';
import { Loader2, Save } from 'lucide-react';

export function SaveButton({ loading }: { loading?: boolean }) {
  return (
    <Button disabled={loading} className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {loading ? 'Saving…' : 'Save'}
    </Button>
  );
}
```

### Dialog Pattern

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';

export function Modal({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; children: React.ReactNode; }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-lg',
          'dark:bg-zinc-900 dark:border-zinc-700 data-[state=open]:animate-scale-in'
        )}>
          <Dialog.Title className="mb-4 text-lg font-semibold tracking-tight">{title}</Dialog.Title>
          <div className="space-y-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Theming

- Use CSS variables in `:root` and `.dark` for dynamic design tokens.
- Avoid hardcoding hex values in components; centralize in vars.

Example snippet:

```css
:root {
  --radius: 0.5rem;
  --color-bg: 255 255 255;
  --color-fg: 24 24 27;
}
.dark {
  --color-bg: 24 24 27;
  --color-fg: 244 244 245;
}
```

Use in Tailwind config:

```js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)'
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)'
      }
    }
  }
};
```

## Accessibility Tips

- Always forward refs for interactive primitives.
- Use ARIA labels only when semantic elements are insufficient.
- Keep focus outlines intact (`focus-visible` utilities).

## Performance

- Avoid over-nesting Radix primitives; flatten where possible.
- Combine variant usage with `cn` once per component.
- Lazy load icon-heavy sections when feasible.

## Common Issues

### Style Collisions

Use `tailwind-merge` through `cn` to avoid duplicate conflicting classes.

### Animations Not Running

Ensure you define keyframes in `tailwind.config.js` and reference them via `animate-*` utilities.

### Dark Mode Not Switching

Check that `<html class="dark">` toggles and `dark:` variants exist in classes.

## Resources

- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
