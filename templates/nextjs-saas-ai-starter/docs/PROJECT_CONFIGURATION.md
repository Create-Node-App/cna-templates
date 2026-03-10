# ⚙️ Project Configuration

Next.js SaaS AI Template is configured with modern tooling for type safety, code quality, and developer experience.

## Tech Stack

| Category   | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                                     |
| Language   | TypeScript 5+ (strict)                                      |
| Styling    | Tailwind CSS v4 + shadcn/ui (theme in `globals.css` @theme) |
| Database   | Drizzle ORM + PostgreSQL + pgvector                         |
| Auth       | Auth.js v5                                                  |
| Testing    | Jest + React Testing Library                                |
| Linting    | ESLint 9 (flat config)                                      |
| Formatting | Prettier                                                    |
| Git Hooks  | Husky + lint-staged                                         |

## ESLint

ESLint is a linting tool for JavaScript. By providing specific configuration defined in the`eslint.config.mjs` file it prevents developers from making silly mistakes in their code and enforces consistency in the codebase.

[ESLint Configuration](../eslint.config.mjs)

## Prettier

This is a great tool for formatting code. It enforces a consistent code style across your entire codebase. By utilizing the "format on save" feature in your IDE you can automatically format the code based on the configuration provided in the `.prettierrc.js` file. It will also give you good feedback when something is wrong with the code. If the auto-format doesn't work, something is wrong with the code.

[Prettier Configuration](../.prettierrc.js)

## TypeScript

ESLint is great for catching some of the bugs related to the language, but since JavaScript is a dynamic language ESLint cannot check data that run through the applications, which can lead to bugs, especially on larger projects. That is why TypeScript should be used. It is very useful during large refactors because it reports any issues you might miss otherwise. When refactoring, change the type declaration first, then fix all the TypeScript errors throughout the project and you are done. One thing you should keep in mind is that TypeScript does not protect your application from failing during runtime, it only does type checking during build time, but it increases development confidence drastically anyways. Here is a [great resource on using TypeScript with React](https://react-typescript-cheatsheet.netlify.app/).

## Husky

Husky is a tool for executing git hooks. Use Husky to run your code validations before every commit, thus making sure the code is in the best shape possible at any point of time and no faulty commits get into the repo. It can run linting, code formatting and type checking, etc. before it allows pushing the code. You can check how to configure it [here](https://typicode.github.io/husky/#/?id=usage).

## Environment Variables

### direnv Setup

The project uses [direnv](https://direnv.net/) for automatic environment loading. When you `cd` into the project directory, direnv automatically loads the environment variables.

| File                 | Purpose                                     | Git          |
| -------------------- | ------------------------------------------- | ------------ |
| `.envrc.example` | Dev template with default values            | ✅ Committed |
| `.envrc`             | Your local environment (copy of a template) | ❌ Ignored   |
| `.env.local`         | Additional overrides (API keys, secrets)    | ❌ Ignored   |

**Setup (handled automatically by DevContainer):**

```bash
# Copy template (dev)
cp .envrc.example .envrc

# Allow direnv
direnv allow

# For AWS deploy helpers, use:
# direnv allow
```

The DevContainer handles this automatically on first setup. Create `.env.local` only to override specific values (e.g., `OPENAI_API_KEY` for AI features).

### Type-Safe Access

Environment variables are validated at build time using `@t3-oss/env-nextjs` and Zod.

Configuration: `src/shared/lib/env.ts`

```typescript
import { env } from '@/shared/lib/env';

// Type-safe access
const dbUrl = env.DATABASE_URL; // Server only
const appName = env.NEXT_PUBLIC_APP_NAME; // Client safe
```

### Required Variables

| Variable       | Description                   | Default                         |
| -------------- | ----------------------------- | ------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string  | `postgresql://...@localhost`    |
| `AUTH_SECRET`  | Auth.js secret (min 32 chars) | Dev default (override in prod!) |
| `AUTH0_*`      | Auth0 configuration           | Optional (for SSO)              |

See `.env.example` for the complete list of available variables.

## Tailwind CSS v4

Tailwind v4 uses a **CSS-first** approach. Theme configuration (colors, typography, shadows, breakpoints) lives in `src/app/globals.css` inside the `@theme` block. The `tailwind.config.ts` file is kept minimal (content paths only) for tooling compatibility; it does not control theme. See [COMPONENTS_AND_STYLING.md](./COMPONENTS_AND_STYLING.md#styling-with-tailwind-css-v4) for details.

## Absolute Imports

Absolute imports are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:

```typescript
// ✅ Good - absolute import
import { Button } from '@/shared/components/ui';

// ❌ Avoid - relative import
import { Button } from '../../../shared/components/ui';
```
