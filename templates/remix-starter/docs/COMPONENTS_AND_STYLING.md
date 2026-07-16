# 🧱 Components And Styling

## Route Components

Route modules in `app/routes/` (or your chosen `srcDir`) export the page UI. Keep them focused on layout and wiring loader data — extract reusable pieces into `features/` or shared components.

Prefer React Router primitives:

- [`<Link>`](https://reactrouter.com/components/link) for internal navigation (preserves SSR/hydration)
- [`<Form>`](https://reactrouter.com/components/form) for mutations that hit route `action`s
- [`useLoaderData`](https://reactrouter.com/hooks/use-loader-data) / [`useActionData`](https://reactrouter.com/hooks/use-action-data) for server round-trips

Avoid plain `<a href>` for in-app routes unless linking externally.

## Server vs Client Components

React Router v7 renders on the server by default. You do **not** need a `"use client"` directive for every interactive component — hydration handles client behavior after the initial HTML response.

Add [`"use client"`](https://react.dev/reference/rsc/use-client) only when you pull in libraries that assume a browser-only environment during the server pass.

## Styling Options

This template ships plain CSS (`app/styles/landing.css`). Common upgrades:

| Approach | Best for |
|----------|----------|
| [CSS Modules](https://github.com/css-modules/css-modules) | Colocated, scoped route/feature styles |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first rapid UI (add via CNA extension) |
| [vanilla-extract](https://github.com/seek-oss/vanilla-extract) | Type-safe zero-runtime CSS |

Import global styles from `root.tsx`; colocate route-specific CSS next to the route module or feature component.

## Component Guidelines

1. **Colocate** — keep helpers near the route or feature that uses them
2. **Extract** when a JSX block becomes a reusable unit (don't nest large `renderX()` functions)
3. **Accessibility** — labels, focus order, and semantic HTML especially on `<Form>` fields processed by actions
4. **Consistent props** — typed interfaces exported from feature `index.ts`

## UI Libraries

For production apps, consider headless primitives plus your design system:

- [Radix UI](https://www.radix-ui.com/)
- [Headless UI](https://headlessui.com/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)

Or full libraries (Chakra, MUI, Ant Design) via CNA extensions when you need a complete design system out of the box.
