# React shadcn/ui Extension

This extension adds shadcn/ui component primitives (Radix UI + Tailwind CSS) including utilities for variant-based theming and composable UI patterns.

## Features

- Preconfigured dependencies (Tailwind + Radix + cva + tailwind-merge)
- `cn` utility for class merging
- `button` component variant pattern
- Accessible primitives following Radix patterns
- Dark mode support via `class` strategy

## Documentation

See the [ShadCN Guide](./docs/SHADCN_GUIDE.md) for best practices and patterns.

## Usage

Add base Tailwind + shadcn configuration files (should be scaffolded by generator). Use the provided `cn` helper and component patterns.

Example `cn` helper (added in your utilities):

```ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
```

Example button variants:

```ts
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
        secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 focus-visible:outline-zinc-500',
        ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        outline: 'border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-10 px-6'
      }
    },
    defaultVariants: { variant: 'default', size: 'md' }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
```

## Resources

- [shadcn/ui Docs](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide icons](https://lucide.dev)
