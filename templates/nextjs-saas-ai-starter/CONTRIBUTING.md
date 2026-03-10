# Contributing to Next.js SaaS AI Template

Thank you for contributing! This document guides human developers after reading the README.

**Source of truth:** Authoritative project knowledge lives in **`docs/`**. When you change architecture, patterns, or APIs, update the relevant doc there (see [docs/README.md](./docs/README.md) for the full index).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Bootstrap](#bootstrap)
- [Architecture & Routing](#architecture--routing)
- [Feature Modules](#feature-modules)
- [Server vs Client Components](#server-vs-client-components)
- [Coding Standards](#coding-standards)
- [Trunk Based Development](#trunk-based-development)
- [Dependencies](#dependencies)
- [Testing](#testing)
- [Documentation](#documentation)
- [PR Checklist](#pr-checklist)

## Prerequisites

- [Docker](https://www.docker.com/)
- IDE with DevContainer support (VS Code, Cursor) **OR** [DevContainer CLI](https://github.com/devcontainers/cli)

## Bootstrap

This project **requires DevContainer** for local development. It provides PostgreSQL + pgvector, Node.js, pnpm, and all tooling pre-configured.

### Using VS Code / Cursor

1. Open the project in your IDE
2. Click "Reopen in Container" when prompted
3. Wait for setup (~2 min first time)
4. Run `pnpm dev`

### Using DevContainer CLI

```sh
# Install CLI (once)
npm install -g @devcontainers/cli

# Start container
devcontainer up --workspace-folder .

# Run commands
devcontainer exec --workspace-folder . pnpm dev
```

### Environment Configuration

The project uses **direnv** for environment management:

| File                 | Purpose                    | Git          |
| -------------------- | -------------------------- | ------------ |
| `.envrc.example` | Dev template with defaults | ✅ Committed |
| `.envrc`             | Your local environment     | ❌ Ignored   |
| `.env.local`         | Additional overrides       | ❌ Ignored   |

The DevContainer automatically copies `.envrc.example` to `.envrc` on first setup. Create `.env.local` only to override specific values (e.g., API keys).

## Architecture & Routing

Consult [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md). App Router layout lives under `src/app/`. Features expose components & logic under `src/features/<domain>`.

## Feature Modules

Encapsulate UI, hooks, services, and types. Export a minimal public surface (`index.ts`).

## Server vs Client Components

- Prefer Server Components for data-fetch & static composition
- Add `"use client"` only when needed (state, effects, event handlers)

## Coding Standards

- Strict TypeScript
- Accessibility by default
- No large un-memoized lists; use streaming / pagination
- Avoid leaking server-only code to client bundles

## Trunk Based Development

This project follows **Trunk Based Development** - a source-control branching model where developers collaborate on code in a single branch called `main` (the "trunk").

### Branch Strategy

| Branch Type         | Naming Pattern        | Purpose               | Lifetime  |
| ------------------- | --------------------- | --------------------- | --------- |
| Main (trunk)        | `main`                | Production-ready code | Permanent |
| Short-lived feature | `feat/<description>`  | New features          | < 2 days  |
| Short-lived fix     | `fix/<description>`   | Bug fixes             | < 1 day   |
| Short-lived chore   | `chore/<description>` | Maintenance tasks     | < 1 day   |

### Key Principles

1. **Small, frequent commits**: Push to `main` at least once a day
2. **Short-lived branches**: Feature branches should live less than 2 days
3. **Feature flags**: Use feature flags for incomplete features in production
4. **No long-running branches**: Avoid branches that diverge significantly from `main`
5. **CI/CD gating**: All PRs must pass CI before merging

### Workflow

1. Pull latest `main`
2. Create a short-lived branch: `git checkout -b feat/my-feature`
3. Make small, incremental changes
4. Push and create PR as soon as possible
5. Get review and merge quickly
6. Delete branch after merge

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```sh
feat(auth): add login form validation
fix(api): handle null response from user endpoint
docs(readme): update installation instructions
```

### Release Strategy

- `main` is always deployable
- Use semantic versioning tags for releases
- Automate releases via CI/CD when tags are pushed

## Dependencies

Justify additions > 0 new runtime deps in PR. Prefer built-in Next.js / React features.

## Testing

Add tests for business logic (services, hooks). Snapshot or interaction tests for critical UI.

```sh
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
pnpm run test:coverage # Coverage report
```

## Documentation

- **`docs/`** is the single source of truth for architecture, patterns, APIs, and domain concepts.
- When you change architecture, routing, components, APIs, or permissions, update the corresponding doc in `docs/` (see [docs/README.md](./docs/README.md)).
- Do not duplicate doc content in CONTRIBUTING.md or README; link to the doc instead.

## PR Checklist

- [ ] Lint & type check pass (`pnpm run lint && pnpm run type-check`)
- [ ] Tests added/updated or reason stated
- [ ] Branch is up-to-date with `main`
- [ ] PR is small and focused (< 400 lines ideally)
- [ ] No unused exports
- [ ] Accessible UI changes
- [ ] Docs updated if needed
- [ ] Feature flag added if feature is incomplete

## Scripts Reference

| Script             | Description                   |
| ------------------ | ----------------------------- |
| `pnpm dev`         | Start development server      |
| `pnpm build`       | Build for production          |
| `pnpm start`       | Start production server       |
| `pnpm lint`        | Run ESLint                    |
| `pnpm lint:fix`    | Run ESLint with auto-fix      |
| `pnpm format`      | Format code with Prettier     |
| `pnpm type-check`  | TypeScript type checking      |
| `pnpm test`        | Run tests                     |
| `pnpm db:generate` | Generate Drizzle migrations   |
| `pnpm db:migrate`  | Run database migrations       |
| `pnpm db:push`     | Push schema to database (dev) |
| `pnpm db:studio`   | Open Drizzle Studio GUI       |

Happy building! 🚀
