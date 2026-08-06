# 🗃️ State Management

Most Astro pages are **static** and do not need client-side state. Reach for state only inside **islands** (hydrated components) or when integrating with external APIs at request time.

## Default: no global store

The starter intentionally avoids Redux, Zustand, or similar libraries. Static content, layouts, and content collections cover the common docs/marketing use case without a client store.

## Where state belongs

### 1. Content and configuration (build time)

**Source of truth**: Markdown/MDX in `<%= srcDir %>/content/` plus schemas in `<%= srcDir %>/content.config.ts`.

Use `getCollection()` and `getEntry()` in pages — not client fetches — for blog posts, docs, and changelog entries.

### 2. Page-local data (server / build time)

Fetch or compute data in the frontmatter of `.astro` pages:

```astro
---
const items = (await getCollection('blog')).filter((p) => !p.data.draft);
---
<ul>
  {items.map((item) => <li>{item.data.title}</li>)}
</ul>
```

This runs at build time for static output and keeps HTML self-contained.

### 3. Component state (client islands)

When you add React, Preact, Solid, or Svelte via an Astro integration, use that framework's local state inside the island:

- React: `useState`, `useReducer`
- Vue: `ref`, `reactive`
- Svelte: `$:` / stores

Keep state inside the smallest interactive subtree. Pass data from Astro as props:

```astro
---
import Search from '<%= projectImportPath%>components/Search';
const tags = ['astro', 'content'];
---
<Search client:load tags={tags} />
```

### 4. URL as state

For filters, pagination, or tabs on mostly static sites, prefer:

- Dedicated routes (`/blog/page/2`)
- Query params parsed on the server (SSR/adapter mode)
- Native `<details>` / anchor links for simple toggles

### 5. Server cache / remote data

If you later enable SSR or server endpoints:

- Use `fetch` in Astro page frontmatter or `src/pages/api/*` routes
- Consider TanStack Query or SWR **inside islands** when client refetching is required

## Anti-patterns for Astro content sites

| Avoid | Prefer |
|-------|--------|
| Global client store for static copy | Content collections + layouts |
| Fetching markdown in the browser | Build-time `getCollection()` |
| Hydrating entire pages | Small islands with `client:*` directives |
| Duplicating frontmatter in components | Read from `post.data` once in the page |

## When to add a client store

Add Zustand, Nanostores, or similar only if:

- Multiple islands must share live client state
- You build a logged-in app shell with persistent UI state
- Real-time collaboration or websockets drive the UI

For those cases, colocate the store next to the feature and document the public API in `docs/`.

## Forms

Static sites often use:

- HTML forms posting to external services (Formspree, Netlify Forms)
- Server actions or API routes when you adopt an SSR adapter

Client form libraries (React Hook Form, etc.) belong inside hydrated form islands, not in static `.astro` shells.
