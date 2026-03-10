# AGENTS.md – AI Agent Guide

**Audience:** AI assistants (Cursor, Copilot, PR bots). **Humans:** read <a>CONTRIBUTING.md</a> and <a>docs/</a>.

**Source of truth:** All authoritative content lives in **`docs/`**. This file is an index and execution guide only. Do not duplicate or summarize doc content here; always read the linked doc for the topic.

---

## 1. Where to Look First

- **Index of all docs:** <a>docs/README.md</a>
- **Architecture &amp; routing:** <a>docs/PROJECT_STRUCTURE.md</a>
- **Terms &amp; concepts:** <a>docs/GLOSSARY.md</a>

Before changing code, **read the relevant doc** from the table below for that topic.

---

## 2. Topic → Doc (Source of Truth)

| Topic                                  | Document                              |
| -------------------------------------- | ------------------------------------- |
| Project architecture, folders, routes  | <a>docs/PROJECT_STRUCTURE.md</a>      |
| Design system, tokens, visual identity | <a>docs/DESIGN_SYSTEM.md</a>          |
| Brand guidelines, logo, palette        | <a>docs/BRAND_GUIDELINES.md</a>       |
| Components, Tailwind, shadcn/ui        | <a>docs/COMPONENTS_AND_STYLING.md</a> |
| shadcn/ui components, forms, theming   | <a>docs/SHADCN_AND_COMPONENTS.md</a>  |
| Storybook (stories, visual testing)    | <a>docs/STORYBOOK.md</a>              |
| Database, Drizzle, pgvector            | <a>docs/DATABASE.md</a>               |
| Authentication (Auth.js)               | <a>docs/AUTHENTICATION.md</a>         |
| Roles and permissions (PBAC)           | <a>docs/ROLES_AND_PERMISSIONS.md</a>  |
| Performance and optimization           | <a>docs/PERFORMANCE.md</a>            |
| State management                       | <a>docs/STATE_MANAGEMENT.md</a>       |
| Build, config, scripts                 | <a>docs/PROJECT_CONFIGURATION.md</a>  |
| Testing                                | <a>docs/TESTING_GUIDE.md</a>          |
| API routes and contracts               | <a>docs/API.md</a>                    |
| Integrations (OAuth2, third-party API) | <a>docs/INTEGRATIONS.md</a>           |
| Deployment and infra                   | <a>docs/DEPLOYMENT.md</a>             |
| GitHub, CI/CD                          | <a>docs/GITHUB_SETUP_GUIDE.md</a>     |
| Glossary                               | <a>docs/GLOSSARY.md</a>               |

`.template` files under `src/features/_feature-template_/` are authoritative when materialized.

---

## 3. Operating Principles

- **Documentation-first:** Read the doc for the topic before proposing code.
- **Reuse-before-build:** Prefer existing components, hooks, and patterns.
- **Type safety:** No unvetted `any`; use exported types.
- **Deterministic, incremental changes:** Small, reviewable diffs.
- **Explicit assumptions:** State assumptions when they affect behavior.
- **Domain concepts matter:** Understand the domain model before implementing features (see section 3.1).

### 3.1 Critical Domain Concepts

Before implementing features related to members, tenants, or permissions, **read the relevant docs** to understand these critical design decisions:

#### Permissions (PBAC, not RBAC)

- **Read:** <a>docs/ROLES_AND_PERMISSIONS.md</a>
- Authorization is **always by permission key** (`hasPermission(tenantSlug, 'permission:key')`), never by role name.
- A member can have **multiple roles**; effective permissions are the **union** of all roles.
- `session.user.permissions` is for **UI only**. API authorization must always call `hasPermission()` against the DB.

#### Multi-tenancy

- Every resource is scoped to a tenant via `tenantId`.
- Use `getTenantBySlug(slug)` to resolve tenant from URL slug.
- Never expose data across tenant boundaries.

#### Scope and visibility

- **Admin panel** shows data for all tenant members (requires `admin:dashboard`).
- **Manager features** (`manager:*`) are for users with reports in the management hierarchy.
- **1:1 Facilitator features** (`one_on_one:*`) are for users who facilitate 1:1 conversations.

#### Anti-patterns to avoid

- **Do not** check role names for authorization; always check permissions.
- **Do not** hardcode "if admin" checks; use permission keys.
- **Do not** skip tenant scoping on DB queries.
- **Do not** derive manager relations from projects (project manager ≠ org manager).

---

## 4. Execution Protocol (Features / Routes)

1. **Identify** target: `src/features/<domain>` or app route under `src/app/`; justify new folders.
2. **Read** the doc(s) for that area (structure, components, API) from the table above.
3. **Reuse** existing components and patterns; extend rather than replace.
4. **Plan** file tree and diff before writing code.
5. **Validate** after changes: format, lint, type-check, tests (or state why deferred).

---

## 5. Guardrails

- Do **not** invent file paths, component APIs, or library versions.
- Do **not** remove accessibility props (`aria-*`, `alt`, `role`) without rationale and replacement.
- Do **not** add global untracked singletons; follow documented patterns.
- **Flag** large dependency additions (&gt;1 lib) for human confirmation.
- **Surface** possible performance regressions (server/client boundary, bundle size).

---

## 6. Component / Route Checklist

- Typed props and params (exported interfaces).
- Next.js conventions: RSC vs Client Component respected.
- Accessibility: labels, semantics.
- Usage or example considered.
- Test added or explicitly deferred with reason.

---

## 7. When to Ask vs Refuse

- **Ask** when: route placement is unclear, patterns conflict, or target directory is missing.
- **Refuse** when: asked to skip validation, remove type safety, or duplicate a documented component.
- **Refuse** when: asked to implement authorization by role name instead of permission key.

---

## 8. Post-Change Summary

Provide a short bullet list:

- Files touched
- New dependencies (if any)
- Type/lint status
- Suggested manual QA
- Deferred items (tests, docs)

---

_AGENTS.md is an index and guide only. The single source of truth for project knowledge is `docs/`._
