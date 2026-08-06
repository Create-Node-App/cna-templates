# 🧱 Components And Styling

## Components Best Practices

### Colocate things as close as possible to where it's being used

Keep components, functions, styles, state, etc. as close as possible to the component where it's being used. This will not only make your codebase more readable and easier to understand but it will also improve your application performance since it will reduce redundant re-renders on state updates.

### Avoid large components with nested rendering functions

Do not add multiple rendering functions inside your application, this gets out of control pretty quickly. What you should do instead is if there is a piece of UI that can be considered as a unit, is to extract it in a separate component.

```javascript
// this is very difficult to maintain as soon as the component starts growing
function Component() {
  function renderItems() {
    return <ul>...</ul>;
  }
  return <div>{renderItems()}</div>;
}

// extract it in a separate component
function Items() {
  return <ul>...</ul>;
}

function Component() {
  return (
    <div>
      <Items />
    </div>
  );
}
```

### Stay consistent

### Limit the number of props a component is accepting as input

If your component is accepting too many props you might consider splitting it into multiple components or use the composition technique via children or slots.

### Abstract shared components into a component library

For larger projects, it is a good idea to build abstractions around all the shared components. It makes the application more consistent and easier to maintain. Identify repetitions before creating the components to avoid wrong abstractions.

It is a good idea to wrap 3rd party components as well in order to adapt them to the application's needs. It might be easier to make the underlying changes in the future without affecting the application's functionality.

## Next.js SaaS AI Template UI Stack

This project uses **shadcn/ui** with **Tailwind CSS v4** and **Radix UI** primitives.

### Why shadcn/ui?

- **Copy/paste components**: Components live in your codebase, not a dependency
- **Full customization**: Modify any component to fit your needs
- **Radix primitives**: Accessible, unstyled components as the foundation
- **Tailwind styling**: Zero-runtime CSS with full design system control

### Adding New Components

Components are located in `src/shared/components/ui/`. To add a new shadcn component:

```bash
# Visit https://ui.shadcn.com/docs/components
# Copy the component code and add to src/shared/components/ui/
# Export from src/shared/components/ui/index.ts
```

### Using Components

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="skill">Skill Action</Button>
        <Button variant="interest">Interest Action</Button>
      </CardContent>
    </Card>
  );
}
```

### Custom Variants

Next.js SaaS AI Template extends shadcn with custom button variants:

- `skill` - Purple theme for skill-related actions
- `interest` - Amber theme for interest-related actions

## Styling with Tailwind CSS v4

Tailwind v4 uses a **CSS-first** architecture. Theme and design tokens live in `src/app/globals.css` inside the `@theme` block. The `tailwind.config.ts` file is kept minimal for tooling (e.g. shadcn CLI) but does **not** control theme — all customization is done in CSS.

### Theme Configuration

**Light/dark palettes** are defined in `:root` and `.dark` in `src/app/globals.css`. The `@theme` block maps these to Tailwind utilities (`--color-primary`, `--color-background`, etc.) so classes like `bg-primary` and `text-muted-foreground` work.

```css
/* :root defines HSL values; @theme maps to utilities */
:root {
  --primary: 245 58% 52%; /* Indigo — buttons, links, focus */
  --background: 240 8% 96%; /* Warm neutral canvas */
}
@theme {
  --color-primary: hsl(var(--primary));
  --color-background: hsl(var(--background));
}
```

**Domain colors** (skill, interest, assessment types) are defined in OKLCH in the `@theme` block and are NOT tenant-configurable:

```css
--color-skill: oklch(55% 0.18 290); /* Violet */
--color-interest: oklch(70% 0.16 75); /* Amber */
```

**Typography**, **shadows**, **border-radius**, and **breakpoints** (e.g. `--breakpoint-2xl`) are also defined in `@theme`. The **container** utility is customized via `@utility container`.

### Utility Classes

```tsx
// Brand gradient — ONLY for logo mark and hero sections
<div className="brand-gradient">Logo background</div>
<h1 className="brand-gradient-text">Next.js SaaS AI Template</h1>

// Glass effect — for special surfaces
<div className="glass">Frosted glass background</div>

// Card interaction — shadow elevation on hover
<div className="card-interactive">Hover for elevation</div>

// Entrance animation
<div className="entrance-fade">Fades in on mount</div>

// AI cursor animation
<span className="ai-cursor">Typing</span>
```

### Design System Anti-Patterns

Do NOT use these patterns (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) Section 11):

- **No gradients on buttons** — use solid `bg-primary`
- **No hardcoded hex** — use CSS variables (`bg-primary`, `text-muted-foreground`)
- **No `bg-linear-to-r`** — this is an invalid Tailwind class
- **No decorative blur blobs** — signals AI-generated UI

## Forms

All forms use **React Hook Form** with **Zod** validation and shadcn Form components. See [shadcn/ui Components Guide](./SHADCN_AND_COMPONENTS.md#forms) for the full pattern.

## Toasts / Notifications

We use **Sonner** (shadcn's recommended toast library). Import directly:

```typescript
import { toast } from 'sonner';

toast.success('Saved!');
toast.error('Something went wrong');
```

A backward-compatible `useToast()` hook is also available. See [shadcn/ui Components Guide](./SHADCN_AND_COMPONENTS.md#toast--notifications).

## Best Practices

1. **Use semantic color classes**: `bg-primary`, `text-muted-foreground`
2. **Leverage CSS variables**: For consistent theming
3. **Server components first**: Only add `'use client'` when necessary
4. **Compose components**: Use slots and children for flexibility

## Related Documentation

- [Design System](./DESIGN_SYSTEM.md) — Design philosophy, principles, tokens, and visual identity
- [Brand Guidelines](./BRAND_GUIDELINES.md) — Logo, color palette, typography, do's and don'ts
- [shadcn/ui Components Guide](./SHADCN_AND_COMPONENTS.md) — Complete component inventory, form patterns, adding new components
- [Storybook](./STORYBOOK.md) — Developing and testing components in isolation
