# shadcn/ui Components Guide

This document describes how Next.js SaaS AI Template uses [shadcn/ui](https://ui.shadcn.com) — a collection of reusable, accessible components built on [Radix UI](https://www.radix-ui.com/) primitives and styled with [Tailwind CSS](https://tailwindcss.com/).

---

## How We Use shadcn/ui

Next.js SaaS AI Template follows the **copy/paste** model of shadcn/ui. Components are **not** installed as a dependency; they live directly in the codebase under `src/shared/components/ui/`. This gives us full control to customize, extend, and compose components to fit our domain.

### Key Differences from a Standard shadcn Setup

| Aspect        | Standard shadcn                | Next.js SaaS AI Template                               |
| ------------- | ------------------------------ | ------------------------------------------------------ |
| Installation  | `npx shadcn@latest add button` | Manual copy + adapt                                    |
| Location      | `components/ui/`               | `src/shared/components/ui/`                            |
| Alias         | `@/components/ui`              | `@/shared/components/ui`                               |
| Style         | `new-york`                     | `new-york`                                             |
| Customization | Minimal                        | Extended (custom variants, domain-specific components) |
| Barrel export | None (individual imports)      | `src/shared/components/ui/index.ts`                    |

We have a `components.json` at the project root configured for the shadcn CLI (style `new-york`, aliases pointing to `@/shared/`), but historically components have been added manually rather than via the CLI. Both approaches are valid.

---

## Configuration

### `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}
```

### Utility Function — `cn()`

All components use the `cn()` utility from `src/shared/lib/utils.ts`, which combines [`clsx`](https://github.com/lukeed/clsx) and [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) for class merging:

```typescript
import { cn } from '@/shared/lib/utils';

// Merges classes intelligently — last conflicting class wins
cn('px-4 py-2', 'px-6'); // → 'py-2 px-6'
```

---

## Component Inventory

### Radix-Backed Components (Official shadcn Patterns)

These components use `@radix-ui/*` primitives under the hood and follow official shadcn/ui patterns:

| Component        | Radix Primitive                                                      | File                |
| ---------------- | -------------------------------------------------------------------- | ------------------- |
| **Avatar**       | `@radix-ui/react-avatar`                                             | `avatar.tsx`        |
| **Checkbox**     | `@radix-ui/react-checkbox`                                           | `checkbox.tsx`      |
| **Dialog**       | `@radix-ui/react-dialog`                                             | `dialog.tsx`        |
| **DropdownMenu** | `@radix-ui/react-dropdown-menu`                                      | `dropdown-menu.tsx` |
| **Form**         | `react-hook-form` + `@radix-ui/react-label` + `@radix-ui/react-slot` | `form.tsx`          |
| **HoverCard**    | `@radix-ui/react-hover-card`                                         | `hover-card.tsx`    |
| **Label**        | `@radix-ui/react-label`                                              | `label.tsx`         |
| **Popover**      | `@radix-ui/react-popover`                                            | `popover.tsx`       |
| **Progress**     | `@radix-ui/react-progress`                                           | `progress.tsx`      |
| **RadioGroup**   | `@radix-ui/react-radio-group`                                        | `radio-group.tsx`   |
| **ScrollArea**   | `@radix-ui/react-scroll-area`                                        | `scroll-area.tsx`   |
| **Select**       | `@radix-ui/react-select`                                             | `select.tsx`        |
| **Separator**    | `@radix-ui/react-separator`                                          | `separator.tsx`     |
| **Sheet**        | `@radix-ui/react-dialog`                                             | `sheet.tsx`         |
| **Slider**       | `@radix-ui/react-slider`                                             | `slider.tsx`        |
| **Switch**       | `@radix-ui/react-switch`                                             | `switch.tsx`        |
| **Tabs**         | `@radix-ui/react-tabs`                                               | `tabs.tsx`          |
| **Tooltip**      | `@radix-ui/react-tooltip`                                            | `tooltip.tsx`       |

### Non-Radix Components (shadcn Style)

These follow shadcn/ui conventions (forwardRef, `cn()`, CSS variables) but don't wrap a Radix primitive:

| Component    | Description                 | File           |
| ------------ | --------------------------- | -------------- |
| **Alert**    | Contextual alert messages   | `alert.tsx`    |
| **Badge**    | Inline labels/tags          | `badge.tsx`    |
| **Button**   | Primary interactive element | `button.tsx`   |
| **Card**     | Surface container           | `card.tsx`     |
| **Input**    | Text input field            | `input.tsx`    |
| **Skeleton** | Loading placeholder         | `skeleton.tsx` |
| **Table**    | Data table                  | `table.tsx`    |
| **Textarea** | Multi-line text input       | `textarea.tsx` |

### Toast / Notifications

We use [**Sonner**](https://sonner.emilkowal.dev/) as recommended by shadcn/ui:

| File         | Purpose                                                |
| ------------ | ------------------------------------------------------ |
| `sonner.tsx` | `<Toaster>` component, mounted in root layout          |
| `toast.tsx`  | Backward-compatible `useToast()` wrapper around Sonner |

**Usage (preferred — direct Sonner):**

```typescript
import { toast } from 'sonner';

toast.success('Saved successfully');
toast.error('Something went wrong', { description: 'Please try again.' });
```

**Usage (legacy — useToast compatibility layer):**

```typescript
import { useToast } from '@/shared/components/ui';

const { toast } = useToast();
toast({ title: 'Saved', variant: 'default' });
toast({ title: 'Error', description: 'Failed', variant: 'destructive' });
```

### Domain-Specific Components

Built on top of shadcn primitives for Next.js SaaS AI Template-specific UI patterns:

| Component                   | Purpose                           | File                             |
| --------------------------- | --------------------------------- | -------------------------------- |
| **CapabilityMatchCard**     | Capability match visualization    | `capability-match-card.tsx`      |
| **ComparedLevelBadge**      | Level comparison indicator        | `compared-level-badge.tsx`       |
| **EmptyState**              | Domain-aware empty states         | `empty-state.tsx`                |
| **LevelIndicator**          | Skill/interest level display      | `level-indicator.tsx`            |
| **LevelSelector**           | Level picker control              | `level-selector.tsx`             |
| **PageHeader**              | Page-level header with tabs/steps | `page-header.tsx`                |
| **PerformanceDimensionRow** | Assessment dimension row          | `performance-dimension-row.tsx`  |
| **RichTextEditor**          | Markdown/rich text editing        | `rich-text-editor.tsx`           |
| **SectionHeader**           | Section-level header              | `section-header.tsx`             |
| **SkillLevelAssessmentRow** | Skill assessment row              | `skill-level-assessment-row.tsx` |
| **SkillLevelBadge**         | Skill level display               | `skill-level-badge.tsx`          |
| **StarRating**              | Star-based rating input           | `star-rating.tsx`                |
| **StatCard**                | Statistic display card            | `stat-card.tsx`                  |
| **StatusDot**               | Colored status indicator          | `status-dot.tsx`                 |
| **TeamMemberCard**          | Team member profile card          | `team-member-card.tsx`           |
| **ThemeToggle**             | Light/dark mode switch            | `theme-toggle.tsx`               |
| **TrendIndicator**          | Trend direction indicator         | `trend-indicator.tsx`            |
| **ViewModeToggle**          | Grid/list view toggle             | `view-mode-toggle.tsx`           |
| **WizardStepIndicator**     | Multi-step wizard progress        | `wizard-step-indicator.tsx`      |

---

## Forms

All forms use **React Hook Form** (RHF) with **Zod** for schema validation and the shadcn **Form** component for layout and error display.

### Form Architecture

```
┌─────────────────────────────────────────┐
│  <Form {...form}>                       │  ← FormProvider (react-hook-form)
│    <FormField                           │  ← Controller wrapper
│      control={form.control}             │
│      name="fieldName"                   │
│      render={({ field }) => (           │
│        <FormItem>                       │  ← Layout container
│          <FormLabel>Label</FormLabel>   │  ← Accessible label
│          <FormControl>                  │  ← Connects input to form state
│            <Input {...field} />         │  ← Any input component
│          </FormControl>                 │
│          <FormDescription />           │  ← Help text
│          <FormMessage />               │  ← Validation error
│        </FormItem>                      │
│      )}                                 │
│    />                                   │
│  </Form>                                │
└─────────────────────────────────────────┘
```

### Standard Form Pattern

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Button, Form, FormField, FormItem, FormLabel,
  FormControl, FormMessage, Input
} from '@/shared/components/ui';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success('Saved!');
    } else {
      toast.error('Failed to save');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

### Legacy Form Helpers

For backward compatibility, two custom helpers are still available:

- **`FormFieldError`** — Standalone field error display (without RHF context)
- **`FormGlobalError`** — Server-side / global error banner

These are used in forms that handle server errors outside of Zod validation.

---

## Custom Button Variants

Next.js SaaS AI Template extends the standard shadcn Button with domain-specific variants using `class-variance-authority` (CVA):

| Variant       | Color            | Usage                    |
| ------------- | ---------------- | ------------------------ |
| `default`     | Primary (indigo) | General actions          |
| `destructive` | Red              | Destructive actions      |
| `outline`     | Border only      | Secondary actions        |
| `secondary`   | Muted            | Less prominent actions   |
| `ghost`       | Transparent      | Minimal emphasis         |
| `link`        | Text only        | Navigation-like actions  |
| `skill`       | Purple           | Skill-related actions    |
| `interest`    | Amber            | Interest-related actions |

---

## Theming

### CSS Variables

Colors are defined as HSL CSS variables in `src/app/globals.css` with automatic light/dark mode support:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 243 75% 59%;
  --accent: 173 80% 40%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Using Theme Colors

Always use semantic color classes:

```tsx
// ✅ Good — uses CSS variables, adapts to dark mode
<div className="bg-background text-foreground border-border" />
<Button className="bg-primary text-primary-foreground" />

// ❌ Bad — hardcoded colors, breaks in dark mode
<div className="bg-white text-black border-gray-200" />
```

---

## Adding a New Component

### Option A: From shadcn/ui Docs

1. Visit [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)
2. Copy the component code
3. Create the file in `src/shared/components/ui/`
4. Adjust the import paths:
   - `@/lib/utils` → `@/shared/lib/utils`
   - `@/components/ui/...` → `@/shared/components/ui/...`
5. Export from `src/shared/components/ui/index.ts`

### Option B: Using the CLI

```bash
npx shadcn@latest add <component-name>
```

> **Note:** The CLI uses `components.json` to resolve paths. It will place components in `src/shared/components/ui/` automatically.

### Option C: Custom Component

Follow the shadcn conventions:

1. Use `React.forwardRef` for DOM element wrapping
2. Use `cn()` for class merging
3. Accept `className` prop for extension
4. Use CSS variables for colors
5. Set `displayName` for DevTools

```typescript
'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const MyComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-md border bg-card p-4 text-card-foreground', className)}
    {...props}
  />
));
MyComponent.displayName = 'MyComponent';

export { MyComponent };
```

---

## Barrel Exports

All UI components are re-exported from `src/shared/components/ui/index.ts`. Always import from the barrel:

```typescript
// ✅ Good
import {
  Button,
  Card,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/shared/components/ui';

// ❌ Bad — direct file imports bypass the barrel
import { Button } from '@/shared/components/ui/button';
```

When adding a new component, remember to export it from `index.ts`.

---

## Related Documentation

- [Components & Styling](./COMPONENTS_AND_STYLING.md) — Styling best practices and Tailwind CSS patterns
- [Storybook](./STORYBOOK.md) — Component stories and visual testing
- [Testing Guide](./TESTING_GUIDE.md) — Component testing patterns
