# Default Landing Page Guide

> How to build, maintain, and update the default landing pages of Create-Node-App templates.

---

## 1. Purpose

Every CNA template ships a default landing page so users immediately understand what they just scaffolded and where to start. This guide documents the shared structure, design tokens, and implementation conventions used across templates.

---

## 2. Shared identity

The landing pages follow the CNA design system defined in [`DEFAULT_LANDING_DESIGN.md`](./DEFAULT_LANDING_DESIGN.md). Master assets live in `shared/assets/`:

| File | Usage |
|---|---|
| `shared/assets/logo-mark.svg` | Icon-only logo (nav, footer, favicon source) |
| `shared/assets/logo-wordmark.svg` | Logo + name for large hero placements |
| `shared/assets/logo-mark-dark.svg` | Dark-background variant of the mark |
| `shared/assets/favicon.svg` | Favicon source |

When the identity changes, update the master files first, then copy them into each affected template.

---

## 3. Landing page structure

Every default landing should contain:

1. **Header** with the CNA mark and brand name.
2. **Hero** with an eyebrow, project name, one-line description, primary CTA, and secondary docs link.
3. **Feature cards** (3–6 items) highlighting what the template includes.
4. **Documentation links** pointing to `docs/README.md`, `docs/PROJECT_STRUCTURE.md`, `docs/COMPONENTS_AND_STYLING.md`, and `docs/STATE_MANAGEMENT.md`.
5. **Footer** with a link back to `create-awesome-node-app` on npm.

Keep content honest to the template. Do not list features the template does not include.

---

## 4. Implementation conventions

### No new runtime dependencies

Landings must look good without Tailwind, shadcn/ui, or any other UI extension. Use plain CSS, CSS Modules, or scoped framework styles.

### Design tokens

Use CSS custom properties with the `cna-` prefix to avoid collisions:

```css
:root {
  --cna-bg: #0f172a;
  --cna-surface: #1e293b;
  --cna-text: #f8fafc;
  --cna-text-muted: #94a3b8;
  --cna-border: #334155;
  --cna-amber: #f59e0b;
  --cna-amber-soft: #fbbf24;
  --cna-teal: #14b8a6;
  --cna-shadow-glow: 0 0 40px -10px rgba(245, 158, 11, 0.25);
}
```

Dark mode is the default. Light mode is provided via `prefers-color-scheme: light`.

### Motion

Use a single entrance animation with staggered delays:

```css
@keyframes cna-fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Respect `prefers-reduced-motion` by collapsing animation and transition durations.

### CTAs

Primary and secondary CTAs must be useful in the browser. Prefer:

1. **Read the docs** → `./docs/README.md` (or `/docs/README.md` when that path is served).
2. **Run the app** → a non-link hint such as `npm run dev` (or the package-manager equivalent), not a dead file URL.
3. **Template docs on the website** → `https://create-awesome-node-app.vercel.app/templates` when a third link is useful.

Do **not** use primary CTAs that point at source paths like `src/app/page.tsx` or `app/routes/_index.tsx`. Those paths are not served by the dev server and look broken to users.

### Interpolation in `.template` files

EJS processes `.template` files before they reach the user. Avoid ES template literals that contain variables EJS would try to interpolate. Prefer string concatenation:

```tsx
// Good in .template files
className={styles.button + " " + styles.buttonPrimary}

// Risky: EJS may try to evaluate `${styles.button}`
className={`${styles.button} ${styles.buttonPrimary}`}
```

---

## 5. Per-template notes

| Template | Entry file(s) | Style approach | Notes |
|---|---|---|---|
| `react-vite-starter` | `src/pages/Landing.tsx.template`, `Landing.css` | Plain CSS | Reference implementation |
| `nextjs-starter` | `src/app/page.tsx.template`, `page.module.css`, `globals.css` | CSS Modules | Use `Image` with `unoptimized` for SVG; add `favicon.svg` to `src/app/` |
| `nextjs-saas-ai-starter` | Brand component only | Existing product UI | Flagship showcase — see §9; nest mark as fallback logo only |
| `remix-starter` | `app/routes/_index.tsx.template`, `app/styles/landing.css` | Plain CSS + import | Add `app/types/css.d.ts` for CSS side-effect imports |
| `astro-starter` | `src/pages/index.astro` | Scoped global `<style>` | Copy SVG mark/favicon to `public/` |
| `webextension-react-vite-starter` | `src/newtab/Newtab.tsx.template`, `src/popup/Popup.tsx.template` | Plain CSS | Keep popup compact; newtab can use full landing layout |
| `turborepo-starter` | `apps/playground/src/stories/Introduction.stories.mdx` | Storybook docs | Update intro copy and page styling only |

---

## 6. Preview / screenshot metadata (deferred)

`templates.schema.json` sets `additionalProperties: false` on the catalog root and only allows the existing template fields (`name`, `slug`, `description`, `url`, `type`, `category`, `labels`).

**Do not** add `preview`, `screenshot`, `ogImage`, or similar fields to `templates.json` until the website catalog can consume them and the schema is intentionally extended. Adding those keys today would fail validation and break consumers.

When the site is ready:

1. Extend `templates.schema.json` with optional preview fields.
2. Wire the website catalog to render them.
3. Then add URLs or asset paths to `templates.json`.

Until then, keep catalog copy craft-forward in `description` only.

---

## 7. Testing checklist

For every new or updated landing:

- [ ] `CI=true npx create-awesome-node-app@latest <test-dir> -t "file://...?subdir=templates/<name>"` succeeds.
- [ ] `npm run lint` passes.
- [ ] `npm run type-check` passes.
- [ ] `npm run build` passes.
- [ ] Dark mode, light mode, and reduced motion look acceptable.
- [ ] Logo and favicon render correctly.
- [ ] No new runtime dependencies were added.

---

## 8. Updating the system

1. Open an issue describing the change and affected templates.
2. Update `shared/assets/` and `DEFAULT_LANDING_DESIGN.md` first.
3. Copy assets and update each affected landing.
4. Run the template-specific checklist above.
5. Run the full CI matrix before merging.

---

## 9. SaaS brand relationship (`nextjs-saas-ai-starter`)

`nextjs-saas-ai-starter` is the flagship product showcase. It keeps its own marketing UI, design system, and landing narrative.

Rules:

- **Do not** force a full cozy-nest restyle of the SaaS landing.
- Align only the **fallback nest mark** (and favicon source when needed) with `shared/assets/`.
- Treat the SaaS template as a separate brand surface that still belongs to the CNA ecosystem, not as another copy of the default starter landing.

---

## 10. Related documents

- [`DEFAULT_LANDING_DESIGN.md`](./DEFAULT_LANDING_DESIGN.md) — tokens, typography, motion, logo rules
- [`docs/TESTING.md`](./TESTING.md) — local testing commands and CI details
- [`docs/MAINTENANCE_RUNBOOK.md`](./MAINTENANCE_RUNBOOK.md) — release and maintenance process
