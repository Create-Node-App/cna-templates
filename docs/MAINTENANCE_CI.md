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

## 7. Checklist

- [ ] `node scripts/validate-templates.js` passes (paths exist).
- [ ] Profiles validate.
- [ ] L1 covers every template after template changes.
- [ ] Changed extensions have a green L2 cell (or an issue explaining known break).
- [ ] No workflow stacks same-category extensions outside a named profile.
- [ ] Permissions stay `contents: read` unless a job truly needs more.
