# Playwright E2E testing

End-to-end browser tests with Playwright, including a dev-server bootstrap and cross-browser projects.

## Scripts

- `npm run test:e2e` — run Playwright tests (starts `npm run dev` automatically)
- `npm run test:e2e:ui` — interactive UI mode

## Generated files

- `playwright.config.ts` — chromium, firefox, and webkit projects
- `e2e/example.spec.ts` — smoke test against the home page
- `.github/workflows/e2e.yml` — CI job (chromium) when this extension is included

## CI

Install browsers once per runner:

```bash
npx playwright install --with-deps chromium
```

When combined with `all-github-setup`, the bundled `tests.yml` workflow runs unit tests; this extension adds a dedicated E2E workflow.
