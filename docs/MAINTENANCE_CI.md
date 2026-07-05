# Maintenance: CI and Workflows

> How to diagnose, fix, and extend the CI workflows that validate the `create-node-app` ecosystem.
>
> Read after the top-level [MAINTENANCE_RUNBOOK.md](./MAINTENANCE_RUNBOOK.md).

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

### `cna-templates`

| Workflow | Purpose |
|---|---|
| `test-combinations.yml` | Random + full matrix of template × extension combinations |
| `smoke-test.yml` | Quick end-to-end smoke tests on PRs |

---

## 2. Reading CI failures

Always start with the failed logs:

```bash
gh run view <run-id> --repo Create-Node-App/<repo> --log-failed
```

For long logs, filter:

```bash
gh run view <run-id> --repo Create-Node-App/<repo> --log-failed | grep -iE "error|fail|cannot|unable"
```

List recent runs:

```bash
gh run list --repo Create-Node-App/<repo> --limit 20
```

---

## 3. Running workflows manually

```bash
# cna-templates random + full matrix
gh workflow run "Test Template and Extension Combinations" \
  --repo Create-Node-App/cna-templates --ref main

# Watch until it finishes
gh run watch <run-id> --repo Create-Node-App/cna-templates --exit-status

# create-node-app tests
gh workflow run "Test" --repo Create-Node-App/create-node-app --ref main
```

Use `--ref <branch>` to test a PR branch before merging.

---

## 4. The `test-combinations.yml` generator

This workflow is the most common source of maintenance work. It has four jobs:

1. `generate-combinations` — builds a JSON matrix of random, non-conflicting combinations.
2. `test-combinations` — runs the random matrix.
3. `generate-full-matrix` — builds a JSON matrix of every template with **all** compatible extensions.
4. `test-full-matrix` — runs the full matrix.

### 4.1 Random matrix logic

For each template:

- Filter compatible extensions by `type`.
- Group by `category`.
- Pick one random extension per category.
- Skip any extension that conflicts with already-selected ones (`incompatibleWith`).

### 4.2 Full matrix logic

For each template:

- Filter compatible extensions by `type`.
- Add every mutually-compatible extension to a single job per template.

This is the worst-case scenario and catches peer-dependency blowups.

---

## 5. Common workflow failures

### 5.1 `SyntaxError: Identifier has already been declared`

**Cause:** The Node script embedded in the YAML has a duplicate function or variable declaration.

**Fix:** Remove the duplicate in `.github/workflows/test-combinations.yml`.

**Historical fix:** #159 and #160.

### 5.2 Empty `templateUrl` like `file://?subdir=templates/`

**Cause:** Escaped JS template variables (`\${repoDir}`, `\${tplDir}`) are passed as literal strings instead of being interpolated by Node.

**Fix:** Use `${repoDir}` and `${tplDir}` without backslashes. GitHub Actions does not interpolate `${...}`, only `${{ ... }}`, so the JS here-doc receives the raw `${repoDir}` text that Node evaluates correctly.

**Historical fix:** commit `9d95c3f`.

### 5.3 `npm error ETARGET`

See [MAINTENANCE_DEPENDENCIES.md](./MAINTENANCE_DEPENDENCIES.md).

### 5.4 `npm error ERESOLVE`

See [MAINTENANCE_DEPENDENCIES.md](./MAINTENANCE_DEPENDENCIES.md).

### 5.5 Full matrix passes but random fails (or vice versa)

This usually means:

- The random matrix hit an unlucky combination not covered by the all-at-once full matrix.
- The full matrix selects all extensions, shadowing a per-extension failure.

Re-run the exact combination locally using the failed job's `templateUrl` and `extensions`.

---

## 6. Testing the embedded Node script locally

The `test-combinations.yml` embeds Node code inside `<<EOF` heredocs. Validate the script before pushing:

```bash
node - <<'PY'
const fs = require('fs');
const txt = fs.readFileSync('.github/workflows/test-combinations.yml', 'utf8');
let idx = 0;
for (const match of txt.matchAll(/node <<EOF\n([\s\S]*?)\n          EOF/g)) {
  let code = match[1].replace(/^          /gm, '');
  // For syntax validation only, turn escaped template literals back into real ones
  code = code.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  try {
    new Function(code);
    console.log(`Block ${idx}: OK`);
  } catch (e) {
    console.error(`Block ${idx}: SYNTAX ERROR — ${e.message}`);
    process.exit(1);
  }
  idx++;
}
PY
```

Run this from the `cna-templates` root.

---

## 7. Modifying a workflow safely

1. Make the change in a branch.
2. Run the syntax validator above.
3. Push and open a PR.
4. Run the workflow manually on the branch if possible:
   ```bash
   gh workflow run "Test Template and Extension Combinations" \
     --repo Create-Node-App/cna-templates --ref <branch>
   ```
5. Merge only after the manual run succeeds.

---

## 8. Checklist

- [ ] Embedded Node scripts pass local syntax validation.
- [ ] Workflow YAML is valid (use `cat` + visual check or a YAML linter).
- [ ] Manual workflow run on the branch passes.
- [ ] The full matrix is green for risky changes.
- [ ] Changes do not introduce new secret exposure or permissions escalation.
