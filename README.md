# CNA Templates

[![Validation](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml)
[![Smoke Test](https://github.com/Create-Node-App/cna-templates/actions/workflows/smoke-test.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/smoke-test.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node Version](https://img.shields.io/badge/node-22+-green.svg)

This repository contains official templates and extensions for [create-awesome-node-app](https://www.npmjs.com/package/create-awesome-node-app).

## Quick start

```sh
# Interactive mode
npx create-awesome-node-app

# With template and extensions
npx create-awesome-node-app --template react-vite-boilerplate --addons material-ui zustand
```

## Available templates

| Template | Type | Use Case |
|----------|------|----------|
| [React Vite](./templates/react-vite-starter) | `react` | Frontend apps |
| [Next.js](./templates/nextjs-starter) | `nextjs` | Full-stack apps |
| [NestJS](./templates/nestjs-starter) | `nestjs-backend` | Backend APIs |
| [Remix / React Router v7](./templates/remix-starter) | `remix` | Full-stack apps |
| [Astro](./templates/astro-starter) | `astro` | Content sites |
| [Hono](./templates/hono-starter) | `hono` | Lightweight APIs |
| [Turborepo](./templates/turborepo-starter) | `monorepo` | Monorepos |
| [WebdriverIO](./templates/wdio-starter) | `webdriverio` | E2E testing |
| [WebExtension](./templates/webextension-react-vite-starter) | `webextension-react` | Browser extensions |

## Documentation

| File | Contents |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System overview, type system, generation flow |
| [docs/AUTHORING.md](./docs/AUTHORING.md) | File conventions, EJS variables, `package/` system |
| [docs/TESTING.md](./docs/TESTING.md) | Local testing and CI workflow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to add templates and extensions |

## CI compatibility matrix

The badges above reflect the CI workflows:

| Workflow | Trigger | Scope |
|----------|---------|-------|
| [Test Combinations](./.github/workflows/test-combinations.yml) | Push to `main`, PR, weekly | Randomized & full matrix of template × extension combinations |
| [Smoke Test](./.github/workflows/smoke-test.yml) | PRs to `main` | Quick end-to-end validation of scaffolded projects |

- **On push to `main`:** a randomized subset of template × extension combinations
- **On every PR:** a randomized subset + smoke test of scaffolded projects
- **Weekly (Sunday UTC):** full matrix — every template with all compatible extensions

See the [Actions tab](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml) for the latest run results.

## Support

- 📦 [NPM Package](https://www.npmjs.com/package/create-awesome-node-app)
- 🐛 [Report Issues](https://github.com/Create-Node-App/cna-templates/issues)
- 💬 [Discussions](https://github.com/Create-Node-App/cna-templates/discussions)
