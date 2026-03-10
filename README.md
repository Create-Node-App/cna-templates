# CNA Templates

[![Validation](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/test-combinations.yml)

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

## Support

- 📦 [NPM Package](https://www.npmjs.com/package/create-awesome-node-app)
- 🐛 [Report Issues](https://github.com/Create-Node-App/cna-templates/issues)
- 💬 [Discussions](https://github.com/Create-Node-App/cna-templates/discussions)
