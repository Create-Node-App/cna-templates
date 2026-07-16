# 🧱 Components and Styling

Astro components are the primary building block. They can render static HTML, scoped CSS, and optional client-side JavaScript via [islands](https://docs.astro.build/en/concepts/islands/).

## Component patterns

### Prefer `.astro` for static UI

Use `.astro` files when no client JavaScript is required. The compiler strips unused JS and ships HTML by default.

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---
<button type="button">{label}</button>
```

### Colocate styles with components

Scoped styles live in the same file:

```astro
<p class="note">Hello</p>
<style>
  .note {
    color: var(--cna-text-muted);
  }
</style>
```

Use `is:global` sparingly — the landing page imports `src/styles/cna-landing.css` because those utilities span many elements.

### Extract shared pieces early

When two pages repeat the same header, meta tags, or shell:

- **`BaseHead.astro`** — SEO and document metadata
- **`BaseLayout.astro`** — shared HTML document wrapper

Add `SiteHeader.astro`, `SiteFooter.astro`, etc. as the site grows.

### Keep components focused

Avoid large single files with many responsibilities. Split cards, lists, and navigation into dedicated components under `<%= srcDir %>/components/`.

## Styling options

This starter uses plain CSS files under `<%= srcDir %>/styles/` for the CNA landing and blog pages. Astro supports multiple approaches:

| Approach | Good for |
|----------|----------|
| Scoped `<style>` in `.astro` | Component-specific rules |
| Global CSS imports | Shared tokens, landing themes |
| [Tailwind](https://tailwindcss.com/) | Utility-first teams (add `@astrojs/tailwind`) |
| [CSS Modules](https://docs.astro.build/en/guides/styling/#css-modules) | Locally scoped class names |
| Sass/Less | Teams already standardized on preprocessors |

Pick one primary strategy per project to avoid conflicting conventions.

## Islands (interactive components)

This template does **not** ship a UI framework integration. When you need hydration:

1. Add an integration, e.g. `npx astro add react`
2. Place interactive components in `<%= srcDir %>/components/`
3. Opt in with a client directive:

```astro
---
import Counter from '<%= projectImportPath%>components/Counter';
---
<Counter client:load />
```

Use the smallest directive that fits (`client:visible`, `client:idle`) to limit JavaScript payload.

## Accessibility

- Use semantic HTML (`nav`, `main`, `article`, `time`)
- Provide `alt` text on images and meaningful link labels
- Prefer real headings in order (`h1` → `h2`)
- Test keyboard focus when adding islands or custom buttons

## Component libraries

For marketing sites, consider:

- **Headless + your CSS** — Radix primitives, Headless UI (via React/Vue/Solid islands)
- **Full libraries** — only when their look-and-feel matches your brand

Wrap third-party components in your own Astro wrapper so you can swap implementations later.

## File naming

- PascalCase for components: `BaseHead.astro`, `PostCard.astro`
- kebab-case for routes: `pages/about.astro`
- kebab-case for content slugs: `welcome-to-your-blog.md`
