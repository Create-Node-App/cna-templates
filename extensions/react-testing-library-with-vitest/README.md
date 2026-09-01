# Vitest + React Testing Library

Vite-native unit and integration testing with Vitest, jsdom, and React Testing Library.

## Scripts

- `npm run test` — run tests once
- `npm run test:watch` — watch mode
- `npm run test:coverage` — coverage via `@vitest/coverage-v8`
- `npm run test:ui` — Vitest UI

## Generated files

- `vitest.config.ts` — shares path aliases with the Vite app
- `src/setupTests.ts` — Testing Library matchers
- `src/pages/Landing.test.tsx` — example smoke test

See [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) for patterns.
