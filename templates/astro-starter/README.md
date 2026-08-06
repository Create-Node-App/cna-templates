# Astro Starter

> Static-first Astro site with TypeScript, content collections, and island architecture — ideal for docs, marketing, and content sites that ship fast HTML.

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?logo=astro&logoColor=white)](https://astro.build) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Astro 7 (static + islands) |
| Language | TypeScript (strict) |
| Content | Content Collections (`src/content/`) |
| Lint/Format | ESLint (`eslint-plugin-astro`) + Prettier (`prettier-plugin-astro`) |
| Runtime | Node 22.14.0 (`.node-version` + `engines`) |

## Scaffold

```bash
npx create-awesome-node-app --template astro-starter
# or with pnpm/yarn/bun — the CLI adapts installCommand/runCommand
```

Generated project uses `README.md.template` → `README.md` with your `projectName`.

## Key features

- File-based routing (`src/pages/`) + content collections (`src/content/blog` → `/blog`)
- Shared `BaseLayout` + `BaseHead` for SEO (title, description, OG)
- `astro check` strict TypeScript
- Static output by default, opt-in islands (`npx astro add react`)
- No heavy test/husky preset — add when you need it

## Project structure

```
src/
  pages/        # Astro pages + blog routes
  layouts/      # BaseLayout.astro
  components/   # BaseHead.astro
  content/      # Collections config + markdown
  styles/       # blog.css, cna-landing.css
docs/
  PROJECT_STRUCTURE.md  # Full layout
  COMPONENTS_AND_STYLING.md
  PROJECT_CONFIGURATION.md
```

See [`docs/`](./template/docs) for full guides (structure, styling, config, state).

## Scripts (generated project)

| `npm run <script>` | Description |
|--------------------|-------------|
| `dev` | `astro dev` — dev server http://localhost:4321 |
| `build` | `astro build` → `dist/` |
| `preview` | Preview production build |

---

*Thanks to @slegarraga for adding the catalog READMEs — improved with stack table and quickstart.*
