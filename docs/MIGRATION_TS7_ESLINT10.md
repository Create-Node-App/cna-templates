# Migration Plan — TypeScript 7, ESLint 10, Vitest 4

> WIP tracking branch: `chore/major-ts7-eslint10` · Refs [#371](https://github.com/Create-Node-App/cna-templates/issues/371) · PR [#388](https://github.com/Create-Node-App/cna-templates/pull/388) (Dependabot devDependencies major batch)

## Context

Dependabot PRs [#363](https://github.com/Create-Node-App/cna-templates/pull/363) / [#388](https://github.com/Create-Node-App/cna-templates/pull/388) propose a combined major bump:

- `typescript ^6.0.3 → ^7.0.2` (TS 7 is the Go rewrite, ships as `7.0.2` on npm)
- `eslint ^9.39.4 → ^10.8.1`, `@eslint/js ^9.39.4 → ^10.0.1`, `globals ^16.5.0 → ^17.11.0`
- `vitest ^3.2.4 → ^4.1.11`, `eslint-plugin-astro ^2.1.1 → ^3.1.0`, and related majors

Per [#371](https://github.com/Create-Node-App/cna-templates/issues/371), CI fails 8/10 templates on L1 and broadly on L3 when applied as a single batch. Per `docs/MAINTENANCE_DEPENDENCIES.md §3.3`, majors require isolated changelog review, peer-dep checks, and full-matrix validation. This branch stays **draft** until upstream ranges relax.

## Why blocked

Upstream peer ranges / tooling not yet compatible with the new majors:

| Blocker | Current constraint | Impact |
|---|---|---|
| `typescript-eslint` | `^8.x` declares peer `typescript <6.1.0` (pre-TS7 line; TS7 support lands in `typescript-eslint@9` / `eslint@10` line — pending) | Blocks `hono-starter`, `nestjs-starter`, `nextjs-*`, `react-vite-starter`, `remix-starter` flat-config stacks |
| `eslint-plugin-import` | `^2.32.0` — peer `eslint <9` / unmaintained; ESLint 10 support moved to [`eslint-plugin-import-x@4`](https://github.com/un-ts/eslint-plugin-import-x) (import-x) | Blocks `nextjs-starter`, `nextjs-saas-ai-starter`, `react-vite-starter`, `remix-starter` |
| `eslint-plugin-jsx-a11y` | `^6.10.2` — peer `eslint ^3..^9` | Same four templates above |
| `@astrojs/check` | `^0.9.9` with peer `typescript ^5 \|\| ^6` (`@astrojs/language-server` / `@astrojs/check` `^5\|\|^6` has no TS7 release yet) | Blocks `astro-starter` |
| `tsup` + `rollup-plugin-dts` (monorepo DTS build) | `tsup@8.5.1` bundles `rollup-plugin-dts` / `rollup ^3/4`; TS7 changes `baseUrl` / `ignoreDeprecations` handling and DTS emit — requires `tsup@9` or `rollup-plugin-dts@6` / `rollup@4.30+` validation | Blocks `turborepo-starter` package builds |
| `eslint-config-prettier` / `eslint-plugin-prettier` | compat with ESLint 10 flat config needs verification | All templates with `eslint-config-prettier@10.1.8` |
| `vitest` 4 | breaking: `pool` defaults, `browser` fs allowlist, `importOriginal` + optimizer query changes, mocker hoisting | Affects `hono-starter`, `turborepo-starter`, `webextension-react-vite-starter` and `react-testing-library-with-vitest` extension |
| `@types/node` `22 → 26` / `globals` `16 → 17` | minor but pulls new lib dom / node globals | Sweep after TS7/ESLint10 |

> Until the rows above ship relaxed ranges, `npm install` fails with `ERESOLVE` / peer warnings that become hard errors on Node 22 + npm 10 (see `docs/MAINTENANCE_DEPENDENCIES.md §2.2`).

## Phases

### Phase 1 — Prep (done)

- **W2 TS6 unification** — [#383](https://github.com/Create-Node-App/cna-templates/pull/383) pinned all templates to `typescript ^6.0.3` (except `hono-starter` at `^5.8.3` — follow-up) and added `ignoreDeprecations: ["6.0"]` where needed; W1 CI hardening [#379](https://github.com/Create-Node-App/cna-templates/pull/379) added concurrency/timeout/cache/SHA-pin.
- Establishes the baseline for a clean `6.0.3 → 7.0.2` diff.

### Phase 2 — TypeScript 7

Scope: `typescript ^7.0.2` + compiler-option fixes + DTS tooling.

- Bump `typescript` to `^7.0.2` in every `templates/*/template/package.json` (currently 10 dirs in #388).
- Add/adjust `tsconfig.json`:
  - `"ignoreDeprecations": "6.0"` → `"7.0"` (TS7 removes `baseUrl` without `paths` warning handling; see `microsoft/TypeScript#56541`, `typescript-go#4558`).
  - Audit `baseUrl` / `paths` — TS7 stricter resolution; `turborepo-starter` packages/apps need explicit `baseUrl: "."` + `paths` or removal.
  - `moduleResolution: "nodenext"` / `"bundler"` compatibility check (Astro, Remix).
- Tooling:
  - `tsup` → `^9.x` (when released) or pin `rollup-plugin-dts@^6` + `rollup@^4.30`; validate `turborepo-starter` `apps/*` + `packages/*` builds.
  - `@astrojs/check@^0.9.9` → wait for `@astrojs/check@^0.10` with TS7 peer; gate `astro-starter` behind flag if needed.
  - `typescript-eslint@^8.62+` → `^9.x` (when it declares `typescript ^7` peer) — coordinate with Phase 3.
- Validate: `npm install` clean on Node `22.22.0` (engines), `tsc --noEmit`, `turbo run type-check`.
- Rollback: keep `ignoreDeprecations` toggle so `6.0.3` and `7.0.2` both type-check during matrix.

### Phase 3 — ESLint 10

Scope: `eslint ^10.8.1`, `@eslint/js ^10.0.1`, flat-config compat.

- `eslint` `^10.8.1` + `@eslint/js` `^10.0.1` — breaking: removes legacy `.eslintrc` support, `SourceCode` deprecations, `eslint-env` comment errors, Node `^20.19 || ^22.13 || >=24` (see `eslint/eslint#20160`).
- Plugins / configs:
  - `eslint-plugin-import@^2.32.0` → `eslint-plugin-import-x@^4.3+` (rename, flat-config native) — update `eslint.config.mjs` imports in `nextjs-starter`, `nextjs-saas-ai-starter`, `react-vite-starter`, `remix-starter`.
  - `eslint-plugin-jsx-a11y@^6.10.2` → wait for `^7.x` with ESLint 10 peer (track `jsx-eslint/eslint-plugin-jsx-a11y#1048`).
  - `eslint-plugin-astro@^2.1.1 → ^3.1.0` (handled — already ESLint 10 ready; keep `eslint@10` gate).
  - `globals@^17.11.0`, `@types/node@^26` — sweep after plugin upgrades.
  - `typescript-eslint` → `^9.x` line aligned with TS7.
- Config: add `name` to each object in `eslint.config.mjs` (ESLint 10 `feat!: add name to configs` #20015), adjust `eslint:recommended` deltas.
- Validate: `eslint .` + `eslint . --fix` on each template; no `SourceCode#getAllComments` / `getNodeByRangeIndex` usage.

### Phase 4 — Vitest 4 (+ Vite 6→8 spillover)

Scope: `vitest ^4.1.11` and transitive `vite`, `jsdom`, `@vitejs/plugin-react` majors (seen in `webextension-react-vite-starter` in #388).

- Vitest 4 breakings: `pool` defaults, `browser` fs allowlist / `allowWrite` gating, `importOriginal` + optimizer query, `vi.mock` hoisting for `vite-plus/test`, concurrency per task branch (see `vitest-dev/vitest` 4.0 release notes).
- `vite 6.4.3 → 8.2.2`, `@vitejs/plugin-react 4.7.0 → 6.1.0`, `jsdom 26 → 29`, `chokidar 4 → 5`, `web-ext 9 → 10` — each needs `vitest.config.*` / `vite.config.*` audit.
- Validate: `vitest run` / `vitest --run` on `hono-starter`, `turborepo-starter`, `webextension-react-vite-starter`; storybook `build-storybook` unaffected.
- Gate behind Phase 2/3 — do not merge Vitest 4 before TS7 + ESLint10 type/lint green.

## Matrix strategy

Once unblocked, CI will run a **TypeScript version matrix** so `main` stays green during rollout:

```yaml
strategy:
  fail-fast: false
  matrix:
    typescript: ["6.0.3", "7.0.2"]
    cell: ${{ fromJson(needs.generate.outputs.matrix) }}
```

- `templates.json` / `generate-matrix.js` will expand each L1/L3 cell with `typescript` axis (install override via `npm i -D typescript@${{ matrix.typescript }}` before `run-scaffold-check.js`).
- Branch `chore/major-ts7-eslint10` hosts the matrix and `ignoreDeprecations` dual-support; `main` keeps `6.0.3` default until Phase 2 merge.
- Branch protection: `main` requires L0 + L1 + L2 + L3 green — matrix PRs target this branch first, then merge to `main` once `7.0.2` column is green.

## Templates & extensions affected

| Template | TS7 | ESLint10 | Vitest4 | Notes |
|---|---|---|---|---|
| `astro-starter` | ● blocked (`@astrojs/check`) | ● (`eslint-plugin-astro@3.1.0` ready) | — | Gate TS7 on `@astrojs/check@^0.10` |
| `hono-starter` | ● | ● | ● (`vitest@3.2.7→4.1.11`) | Also fix TS `^5.8.3 → ^6.0.3` skew first |
| `nestjs-starter` | ● | ● | — | Legacy `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` → `typescript-eslint` |
| `nextjs-starter` | ● | ● (`import`/`jsx-a11y`) | — | |
| `nextjs-saas-ai-starter` | ● | ● (`import`/`jsx-a11y` + 3 updates) | — | Also `@testing-library/jest-dom@7` |
| `react-vite-starter` | ● | ● | — | |
| `remix-starter` | ● | ● | — | |
| `turborepo-starter` | ● (`tsup` DTS) | — | ● (`vitest@4.1.9`) | `tsup@8.5.1→9`, `rollup-plugin-dts` |
| `wdio-starter` | ● | — | — | Chromedriver / cross-env also in #388 |
| `webextension-react-vite-starter` | ● | ● | ● (10 updates: vitest, vite8, plugin-react6, jsdom29…) | Highest risk — may split out |
| `nestjs-serverless` (ext) | — | — | — | `esbuild-node-externals 1.23→2.0` ESM-only breaking |

## Upstream issues to watch

- `typescript-eslint/typescript-eslint` — TS7 peer support (`typescript@^7`) milestone / `v9.0.0` release.
- `un-ts/eslint-plugin-import-x` — ESLint 10 compat (`import-x@4.x`) migration guide.
- `jsx-eslint/eslint-plugin-jsx-a11y` — ESLint 10 peer (`^7.0.0`).
- `withastro/astro` + `@astrojs/check` — `typescript@^7` peer.
- `egoist/tsup` — TS7 / `rollup@4` DTS support; `swc/jest` / `rollup-plugin-dts` TS7 fix.
- `vitest-dev/vitest` — `v4.0` migration guide (`pool`, `browser`, `mocker`).
- `vitejs/vite` — `v8` + `jsdom@29` compat with `vitest@4`.
- `eslint/eslint` — `v10.0` breaking list (#20160 Node range, #20037 eslintrc removal, #20137 SourceCode removals).

Subscribe to each tracker; unblock phases as ranges relax. Keep this branch rebased on `origin/main` weekly and re-run #388 via `/tmp/opencode/cna-templates` `node scripts/validate-templates.js` + `node scripts/ci/generate-matrix.js --layer validate-profiles`.

## Checklist

- [ ] Subscribe/watch upstream issues above (assign owner)
- [ ] Weekly rebase `chore/major-ts7-eslint10` on `origin/main`
- [ ] Phase 1 confirm: all templates on `typescript ^6.0.3` (fix `hono-starter` skew) — ref #383
- [ ] Phase 2 PR: bump TS7 + `ignoreDeprecations` + `tsup`/`rollup-plugin-dts` + `@astrojs/check` gate
- [ ] Phase 3 PR: ESLint 10 + `import-x` + `jsx-a11y` + `typescript-eslint@9` + `globals`/`@types/node`
- [ ] Phase 4 PR: Vitest 4 + Vite 8 / jsdom 29 / plugin-react 6 spillover
- [ ] Matrix: `typescript: [6.0.3, 7.0.2]` in `ci-templates.yml` / `ci-profiles.yml` on this branch
- [ ] L0 `validate-templates.js` + `validate-profiles` green before each phase merge
- [ ] Full L1/L2/L3 green on `chore/major-ts7-eslint10` before merging to `main`
- [ ] Dependabot: keep #388 open as tracker; close superseded `#363` via phase PRs per #371 guidance
- [ ] Docs: update `MAINTENANCE_DEPENDENCIES.md §3.3` + `MAINTENANCE_RUNBOOK.md` after each phase

## References

- #371 — major bump needs migration (TS7/ESLint10/Vitest4)
- #388 — Dependabot devDependencies major batch (11 dirs, 17 updates)
- #383 — W2 TS6 unification baseline
- #379 — W1 CI hardening
- `docs/MAINTENANCE_DEPENDENCIES.md`, `docs/MAINTENANCE_TEMPLATES.md`, `docs/MAINTENANCE_CI.md`

---
*Branch `chore/major-ts7-eslint10` is draft/WIP and branch-protected on `main`. Do not merge to `main` until all upstream peer ranges relax and the matrix is green. See PR body for CI expectations.*
