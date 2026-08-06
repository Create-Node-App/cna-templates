# Configuration

## Environment

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `PORT` | `3000` | HTTP listen port |
| `APP_NAME` | `Hono API` | Service name (logs + `X-App-Name` header) |

Validation lives in `src/env.ts` (Zod). Invalid env fails fast at boot.

## Tooling

- TypeScript strict (`tsconfig.json`)
- ESLint flat config (`eslint.config.mjs`)
- Prettier (`.prettierrc.js`)
- Node pin (`.node-version`)

## Scripts

See the root README for `dev`, `build`, `start`, `test`, `lint`, and `type-check`.
