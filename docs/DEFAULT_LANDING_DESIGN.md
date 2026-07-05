# Default Landing Design System

> Visual identity and implementation guide for the default landing pages of Create-Node-App templates.
>
> This is a brand-new identity, independent of the public website.

---

## 1. Design principles

1. **Cozy, not corporate.** Soft surfaces, warm neutrals, and friendly shapes.
2. **Developer-first clarity.** Every landing explains what the user just scaffolded and where to start.
3. **Motion with purpose.** Animations welcome the user; they never obstruct content.
4. **No dependencies.** Landings must look good without Tailwind, shadcn, or any UI extension.
5. **Dark default, light capable.** Projects ship dark by default and respect system preference via `prefers-color-scheme`.

---

## 2. Color palette

### Brand colors

| Token | Hex | Usage |
|---|---|---|
| `brand-amber` | `#f59e0b` | Primary accent, highlights, CTAs |
| `brand-amber-dark` | `#d97706` | Hover states, secondary accents |
| `brand-teal` | `#0d9488` | Success, links, secondary accent |
| `brand-teal-soft` | `#14b8a6` | Soft teal surfaces |

### Neutral colors

| Token | Light mode | Dark mode (default) | Usage |
|---|---|---|---|
| `bg` | `#fffcf5` | `#0f172a` | Page background |
| `surface` | `#ffffff` | `#1e293b` | Cards, panels |
| `surface-elevated` | `#fffbeb` | `#27364f` | Hover/elevated cards |
| `text` | `#1f2937` | `#f8fafc` | Primary text |
| `text-muted` | `#6b7280` | `#94a3b8` | Secondary text |
| `border` | `#fed7aa` | `#334155` | Subtle borders |
| `glow` | `rgba(245, 158, 11, 0.15)` | `rgba(245, 158, 11, 0.12)` | Ambient glows |

### Semantic colors

| Token | Hex | Usage |
|---|---|---|
| `success` | `#14b8a6` | Feature available, success messages |
| `warning` | `#f59e0b` | Warnings |
| `error` | `#ef4444` | Errors |

### Gradient

Primary brand gradient:

```css
background: linear-gradient(135deg, #f59e0b 0%, #d97706 55%, #0d9488 100%);
```

Use it for:
- Logo mark strokes.
- Primary buttons.
- Hero headline accent.

---

## 3. Typography

### Font stack

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

For monospaced snippets:

```css
font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
```

### Type scale

| Name | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| Hero | `clamp(2rem, 5vw, 3.5rem)` | 800 | 1.1 | Main headline |
| H2 | `clamp(1.5rem, 3vw, 2rem)` | 700 | 1.2 | Section titles |
| H3 | `1.125rem` | 700 | 1.3 | Card titles |
| Body | `1rem` | 400 | 1.65 | Paragraphs |
| Small | `0.875rem` | 500 | 1.5 | Labels, badges |
| Code | `0.8125rem` | 700 | 1.4 | Inline paths/commands |

---

## 4. Spacing and shape

### Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `0.5rem` (8px) | Buttons, badges |
| `radius-md` | `0.75rem` (12px) | Small cards |
| `radius-lg` | `1.25rem` (20px) | Large cards, panels |
| `radius-xl` | `1.75rem` (28px) | Hero containers |
| `radius-full` | `9999px` | Pills |

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-glow: 0 0 40px -10px rgba(245, 158, 11, 0.25);
```

Use `shadow-glow` sparingly on hero containers.

---

## 5. Motion

### Entrance animation

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Apply with staggered delays:

```css
animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
animation-delay: calc(var(--index) * 80ms);
```

### Hover transitions

```css
transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
```

Card hover:

```css
.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Logo and assets

Master assets live in `shared/assets/`:

| File | Description |
|---|---|
| `shared/assets/logo-mark.svg` | Icon-only logo (64x64 viewBox) |
| `shared/assets/logo-wordmark.svg` | Logo + "Create Awesome Node App" text |
| `shared/assets/favicon.svg` | 32x32 favicon source |

When updating the identity, edit the master files first, then copy the new versions into each template that needs them:

- `templates/<name>/public/logo.svg` (or equivalent)
- `templates/<name>/public/favicon.svg` / `favicon.ico`

### Logo usage rules

- Prefer the mark at 40–64px in navbars and footers.
- Use the wordmark in the hero at 160–280px wide.
- Never distort the SVG aspect ratio.
- When placed on dark surfaces, the mark remains visible because the amber/teal gradient has enough contrast.

---

## 7. Landing page structure

Every template landing should follow this layout:

```
+----------------------------------+
|  [Mark]  Create Awesome Node App |
+----------------------------------+
|                                  |
|  Welcome to <projectName>        |
|  One command. Any stack.         |
|                                  |
|  [Primary CTA]  [Secondary]      |
|                                  |
+----------------------------------+
|  Feature cards (3-6 items)       |
+----------------------------------+
|  Docs + next steps               |
+----------------------------------+
|  Footer with links               |
+----------------------------------+
```

### Feature card content pattern

Each feature card contains:

1. A small amber or teal icon.
2. A short title.
3. One-sentence description.
4. Optional doc link.

Example cards per template:

- **React Vite**: React 19, Vite 8, React Router 7, TypeScript, ESLint + Prettier, feature-based structure.
- **Next.js**: Next.js 16 App Router, TypeScript, feature-based structure, login example, ESLint + Prettier.
- **Remix**: React Router v7, TypeScript, ESLint + Prettier, fast builds.
- **Astro**: Astro 7, static output, partial hydration, TypeScript.

### Documentation links

Link to the generated docs folder using relative paths:

- `docs/README.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/COMPONENTS_AND_STYLING.md`
- `docs/STATE_MANAGEMENT.md`

Use a `DocsLink` helper component with an icon + label.

---

## 8. Implementation notes per stack

### React Vite

- Use plain CSS or CSS Modules for the landing.
- Import `logo.svg` as a React component or `<img>`.
- Avoid adding new runtime dependencies.

### Next.js App Router

- Use CSS Modules for the page.
- Place shared color tokens in `globals.css`.
- Keep metadata in `layout.tsx` if needed.

### Remix / React Router

- Use plain CSS files in `app/styles/`.
- `LinksFunction` can preload the stylesheet.

### Astro

- Use scoped `<style>` inside `index.astro`.
- Use CSS variables on `:root` for theming.

### WebExtension

- Inline SVG logo to avoid asset-path issues in popup.
- Popup: compact vertical card, no heavy animations.
- Newtab: full landing layout, can use more motion.

### Turborepo

- Update Storybook intro page CSS only.
- Keep styled-components dependency in `packages/ui` if already present.

---

## 9. Accessibility

- Text must meet WCAG 4.5:1 contrast.
- Interactive elements must have visible focus states.
- Respect `prefers-reduced-motion`.
- Logo SVGs must include `<title>` and `role="img"`.
- Avoid auto-playing motion that cannot be paused.

---

## 10. Updating this system

1. Propose token changes in a dedicated issue.
2. Update `shared/assets/*` and this document.
3. Copy assets to each affected template.
4. Update each landing implementation.
5. Run the full matrix before merging.
