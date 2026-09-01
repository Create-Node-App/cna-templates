# Web Extension React Vite Boilerplate

> React + Vite WebExtension with HMR, `webextension-polyfill`, and cross-browser `manifest.json` — Chrome/Firefox/Edge from one codebase.

[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev) [![WebExtension](https://img.shields.io/badge/WebExtension-polyfill-FF7139?logo=firefox)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + Vite 6 |
| Extension | `webextension-polyfill` + `manifest.ts.template` (typed) |
| Language | TypeScript |
| Test | Vitest + Testing Library |
| Tooling | `web-ext` (run in browsers) |

## Scaffold

```bash
npx create-awesome-node-app --template web-extension-react-boilerplate
# directory is templates/webextension-react-vite-starter — public slug is web-extension-react-boilerplate
```

## Key features

- Instant HMR (`vite.config.ts.template` + `public/`) + `manifest.ts.template` → `manifest.json` with types
- Shared `src/` islands: `popup/`, `options/`, `panel/`, `background/`, `content/`, `devtools/`, `shared/`
- Message passing (`shared/messages.ts`) + `Browser` polyfill
- `vitest.config.ts.template` + `vitest.setup.ts.template` with `jsdom`
- `web-ext:chromium` / `web-ext:firefox` scripts

## Docs

[`template/docs/`](./template/docs) — `PROJECT_STRUCTURE.md`, `COMPONENTS_AND_STYLING.md`, `PERFORMANCE.md`.

Load: `npm run web-ext:chromium` or `web-ext:firefox` after `npm run dev`.

---

*Thanks to @slegarraga — corrected public slug and added HMR/manifest notes.*
