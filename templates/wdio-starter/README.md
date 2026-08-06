# WebdriverIO Boilerplate

> WebdriverIO + TypeScript + Selenoid harness for browser acceptance-test suites — cross-browser, parallel, containerized.

[![WebdriverIO](https://img.shields.io/badge/WebdriverIO-8-EA5906?logo=webdriverio&logoColor=white)](https://webdriver.io) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Tech stack

| Layer | Tool |
|-------|------|
| Runner | WebdriverIO 8 (Mocha + Chai) |
| Language | TypeScript |
| Grid | Selenoid (Docker) + `bin/selenoid` |
| Reports | Multiple reporters + `allure` |

## Scaffold

```bash
npx create-awesome-node-app --template webdriverio-boilerplate
# directory is templates/wdio-starter — public slug is webdriverio-boilerplate
```

*Note:* This template scaffolds a **test suite**, not an app — `test/` + `wdio.conf.js` are the product.

## Key features

- Cross-browser (`Chrome`, `Firefox`, `Safari`) + parallel execution
- `config/` (capabilities) + `types/` helpers + `bin/selenoid` for grid
- `wdio.conf.js` with `allure` + `spec` reporters, `maxInstances`
- `.env.example` for `GRID_HOST` etc., `test/` structure for specs
- `tsconfig.json` for type-safe specs

## Docs

[`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `TEST_CONFIGURATION.md`, `WRITING_TESTS.md`, `RUNNING_TESTS.md`.

Run: `npm test` (local) or `npm run test:remote` (Selenoid).

---

*Thanks to @slegarraga — corrected public slug and clarified test-suite purpose.*
