# CNA Templates

[![L0 Integrity](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-integrity.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-integrity.yml)
[![L1 Templates](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-templates.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-templates.yml)
[![L2 Extensions](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-extensions.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-extensions.yml)
[![L3 Profiles](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-profiles.yml/badge.svg)](https://github.com/Create-Node-App/cna-templates/actions/workflows/ci-profiles.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node Version](https://img.shields.io/badge/node-22+-green.svg)

This repository contains official templates and extensions for [create-awesome-node-app](https://www.npmjs.com/package/create-awesome-node-app).

## Quick start

Browse templates and extensions on the [official site](https://create-awesome-node-app.vercel.app), then scaffold locally:

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
| [docs/MAINTENANCE_RUNBOOK.md](./docs/MAINTENANCE_RUNBOOK.md) | Operational procedures for maintaining templates, extensions, CI, dependencies, security, and releases |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to add templates and extensions |

## CI trust layers

Green Actions mean templates and realistic selections work — **not** that every
extension can be merged into one mega-app. See [#309](https://github.com/Create-Node-App/cna-templates/issues/309) and [docs/TESTING.md](./docs/TESTING.md).

| Workflow | Trigger | Scope |
|----------|---------|-------|
| [L0 Integrity](./.github/workflows/ci-integrity.yml) | PR, main, weekly | Registry paths, doc links, assets, profiles |
| [L1 Templates](./.github/workflows/ci-templates.yml) | PR, main, weekly | Every template alone |
| [L2 Extensions](./.github/workflows/ci-extensions.yml) | PR (changed), weekly (all) | One extension × canonical template |
| [L3 Profiles](./.github/workflows/ci-profiles.yml) | PR (affected), weekly (all) | Curated one-per-category stacks |

- **PR required bar:** L0 + L1 (always). L2/L3 run for touched paths.
- **Weekly:** full L1 + L2 + L3.
- **Never:** stack all compatible extensions in one job.

See the [Actions tab](https://github.com/Create-Node-App/cna-templates/actions) for latest runs.

## For AI assistants: copy-paste to start a maintenance session

If you are an AI agent beginning work on this repository, paste the following prompt exactly (after reading any prior conversation context the user provides):

```text
You are maintaining the Create-Node-App ecosystem: the `create-node-app` CLI monorepo and the `cna-templates` template/extension bank.

Follow the maintenance runbook at `docs/MAINTENANCE_RUNBOOK.md` and its companion guides (`docs/MAINTENANCE_TEMPLATES.md`, `docs/MAINTENANCE_DEPENDENCIES.md`, `docs/MAINTENANCE_SECURITY.md`, `docs/MAINTENANCE_CI.md`, `docs/MAINTENANCE_RELEASE.md`).

Always:
1. Run the pre-flight checklist in `docs/MAINTENANCE_RUNBOOK.md` Section 3 before changing code.
2. Start every significant task with a GitHub issue. If the solution is not obvious, use the issue to analyze options before writing code.
3. Scope work to one fix per PR with a `Closes #<issue>` link when applicable.
4. Open PRs as **ready for review** (not drafts) and wait for automated AI reviewers such as CodeRabbit to finish before merging.
5. Write commits, PRs, issues, and docs in English.
6. Validate locally with `file://` URLs before pushing (see `docs/MAINTENANCE_TEMPLATES.md` Section 9).
7. Run the relevant full CI workflow manually after risky merges and watch it to completion.
8. Update `knowledge/processes/create-node-app-maintenance.md` in the workspace if you discover a new pattern or decision.

Current known constraints:
- Storybook extension is pinned to `^8.6.18` with `legacy-peer-deps=true` in `extensions/storybook/.npmrc`; do not upgrade to Storybook v10 without resolving issue #161 first.
- CI uses layered L0–L3 workflows (`ci-*.yml`); do not reintroduce all-extensions stacking.
- Always resolve `file://` paths from `templates.json` `url` directories, never from public slugs.
- `create-node-app` releases use npm Trusted Publishing via OIDC; do not use a manual `NPM_TOKEN`.

If the user only says "continue" or asks "what should I do next", summarize the current CI/issues state and propose the next action.
```

## Support

- 🌐 [Official site](https://create-awesome-node-app.vercel.app)
- 📚 [Templates](https://create-awesome-node-app.vercel.app/templates)
- 🧩 [Extensions](https://create-awesome-node-app.vercel.app/extensions)
- 📦 [NPM Package](https://www.npmjs.com/package/create-awesome-node-app)
- 🐛 [Report Issues](https://github.com/Create-Node-App/cna-templates/issues)
- 💬 [Discussions](https://github.com/Create-Node-App/cna-templates/discussions)

## 👥 Contributors

<a href="https://github.com/Create-Node-App/cna-templates/contributors">
  <img src="https://contrib.rocks/image?repo=Create-Node-App/cna-templates"/>
</a>

Made with [contributors-img](https://contrib.rocks).