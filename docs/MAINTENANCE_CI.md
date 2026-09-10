# Maintenance: CI and Workflows

> How to diagnose, fix, and extend the CI workflows that validate the `create-node-app` ecosystem.
>
> Read after the top-level [MAINTENANCE_RUNBOOK.md](./MAINTENANCE_RUNBOOK.md).
> Trust model: [#309](https://github.com/Create-Node-App/cna-templates/issues/309).

---

## 1. Workflows overview

### `create-node-app`

| Workflow | Purpose |
|---|---|
| `test.yml` | Unit and integration tests |
| `type-check.yml` | TypeScript type checking |
| `lint.yml` | Linting |
| `mega-linter.yml` | MegaLinter across the repo |
| `osv-scanner.yml` | Security scanning |
| `publish.yml` | Changesets + npm Trusted Publishing |
| `pr-review.yml` | PR automation |

### `cna-templates` (layered CI)

| Workflow | Layer | Purpose |
|---|---|---|
| `ci-integrity.yml` | L0 | Registry paths, doc links, shared assets, profile validation |
| `ci-templates.yml` | L1 | Every template alone (required trust bar) |
| `ci-extensions.yml` | L2 | One extension per job on a canonical template |
| `ci-profiles.yml` | L3 | Curated one-per-category stacks (`ci/profiles/*.json`) |

**Removed:** `smoke-test.yml` (false greens from wrong slug→dir paths) and
`test-combinations.yml` (random stacks + “all extensions at once”).

---

## 2. Reading CI failures

```bash
gh run view <run-id> --repo Create-Node-App/cna-templates --log-failed
gh run list --repo Create-Node-App/cna-templates --limit 20
```

Job names encode the layer:

- `L1 · hono-starter` — bare template failed
- `L2 · zustand @ react-vite-starter` — that extension broke isolation
- `L3 · react-default` — curated profile composition failed

Phases inside `scripts/ci/run-scaffold-check.js`: `scaffold` → `empty-guard` →
`install` → `type-check` → `build` → `test`.

---

## 3. Running workflows manually

```bash
gh workflow run "CI Templates (L1)" --repo Create-Node-App/cna-templates --ref main
gh workflow run "CI Extensions (L2)" --repo Create-Node-App/cna-templates --ref main
gh workflow run "CI Profiles (L3)" --repo Create-Node-App/cna-templates --ref main
gh run watch <run-id> --repo Create-Node-App/cna-templates --exit-status
```

---

## 4. Matrix generators (testable Node, not YAML heredocs)

```bash
node scripts/ci/generate-matrix.js --layer templates
node scripts/ci/generate-matrix.js --layer extensions
node scripts/ci/generate-matrix.js --layer profiles
node scripts/ci/generate-matrix.js --layer validate-profiles
```

PR runs use `--changed-only` for L2/L3. Changes under `scripts/ci/`,
`ci/profiles/`, `templates.json`, or `ci-*.yml` force the full L2/L3 matrix.

### Canonical templates for L2

See `CANONICAL_TEMPLATE_BY_TYPE` in `scripts/ci/registry.js` (e.g. `react` →
`react-vite-starter`).

### Profiles (L3)

- One addon **per category**
- Must honor `incompatibleWith`
- Optional `sets` for `cna.config.json` custom options (e.g. turborepo `scope`)

---

## 5. Common failures

### 5.1 `empty-guard` / template path does not exist

**Cause:** `file://` pointed at a slug (`templates/nestjs-boilerplate`) instead
of the directory (`templates/nestjs-starter`).

**Fix:** Always resolve paths via `templates.json` `url` (see `scripts/ci/registry.js`).

### 5.2 `npm error ETARGET` / `ERESOLVE`

See [MAINTENANCE_DEPENDENCIES.md](./MAINTENANCE_DEPENDENCIES.md).

### 5.3 L3 profile validation fails

```bash
node scripts/ci/generate-matrix.js --layer validate-profiles
```

Fix duplicate categories or unknown slugs in `ci/profiles/*.json`.

### 5.4 Why we do not stack all extensions

Stacking 18–32 addons (multiple UIs + stores + test runners) produces
collisions nobody selects in the CLI. Isolation (L2) + curated profiles (L3)
match real UX and attribute failures.

---

## 6. Modifying CI safely

1. Change scripts under `scripts/ci/` or workflows under `.github/workflows/ci-*.yml`.
2. Run generators locally.
3. Spot-check with `run-scaffold-check.js` for one L1 and one L2 cell.
4. Open a PR; L0+L1 always run. L2/L3 run for touched paths (or full if CI scripts change).
5. For risky registry changes, manually dispatch L2/L3 on the branch.

---

## 7. Env validation model (`SKIP_ENV_VALIDATION`, #382/#398)

`SKIP_ENV_VALIDATION=true` lets builds pass without exercising env schemas,
which masks mis-configured schemas (missing required vars, weakened zod
constraints) that would fail in production. L0 enforces a model where real
schema bugs fail CI while legitimate skips still work:

```bash
node scripts/validate-env.js              # no-masking audit + model + fixtures
node scripts/validate-env.js --self-test  # plus the negative test (breakages must fail)
```

### 7.1 Classification

| Class | Meaning | CI treatment |
|---|---|---|
| `required` | No `.optional()` / `.default()` (e.g. SaaS `DATABASE_URL`, `AUTH_SECRET`) | Empty env **must fail**; CI supplies a placeholder-only fixture that satisfies the constraint (`z.url()`, `.min(32)`) |
| `build-defaulted` | Has a default (e.g. `NEXT_PUBLIC_APP_URL`) | Safe in CI without secrets; empty env passes |
| `runtime-optional` | `.optional()` (e.g. `OPENAI_API_KEY`) | May be absent everywhere |
| `ci-fixture` | Synthetic placeholder (`postgresql://ci:ci@localhost:5432/ci`) | CI-only, never a real secret; must look like a placeholder |

The required set is **derived from the schema source**, not trusted from the
model: silently weakening a field (adding `.optional()`, dropping
`.min(32)`), unwiring it from t3 `runtimeEnv`, or adding a new required var
without a fixture fails L0. The negative test (`--self-test`) runs the real
checker against such mutations and fails CI if any breakage goes undetected.

### 7.2 When the skip is appropriate

- **Never** set `SKIP_ENV_VALIDATION=true` blanket in workflows or
  `scripts/ci/` — L0 fails the PR. `run-scaffold-check.js` only propagates a
  caller-set value and logs a `⚠ [env]` warning when it does.
- **Appropriate:** a per-command opt-in where secrets are unavailable, e.g.
  the SaaS template `build:ci` script
  (`SKIP_ENV_VALIDATION=true NODE_ENV=production next build`); local
  scaffold debugging (`docs/MAINTENANCE_TEMPLATES.md` §4.1/§9).
- L1/L3 run `npm run build` **without** the flag, so template builds
  validate for real. The SaaS template skips build in L1/L3 (service-backed)
  and is covered by the L0 fixture proof instead.

## 8. Checklist

- [ ] `node scripts/validate-templates.js` passes (paths exist).
- [ ] `node scripts/validate-env.js` and `--self-test` pass (no env masking).
- [ ] Profiles validate.
- [ ] L1 covers every template after template changes.
- [ ] Changed extensions have a green L2 cell (or an issue explaining known break).
- [ ] No workflow stacks same-category extensions outside a named profile.
- [ ] Permissions stay `contents: read` unless a job truly needs more.
