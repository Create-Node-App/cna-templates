# Maintenance: Security

> How to handle security alerts, audits, and hardening in the `create-node-app` ecosystem.
>
> Read after the top-level [MAINTENANCE_RUNBOOK.md](./MAINTENANCE_RUNBOOK.md).

---

## 1. Sources of alerts

There are three main channels:

1. **GitHub Dependabot alerts** — vulnerabilities in direct and transitive dependencies.
2. **OSV-Scanner CI** — runs in `create-node-app` via `.github/workflows/osv-scanner.yml`.
3. **CodeQL alerts** — code scanning alerts in `create-node-app`.

Check all three when doing security work:

```bash
# Dependabot alerts
gh api repos/Create-Node-App/create-node-app/dependabot/alerts --jq '.[] | {number, severity, package: .dependency.package.name, title}' | head -n 20
gh api repos/Create-Node-App/cna-templates/dependabot/alerts --jq '.[] | {number, severity, package: .dependency.package.name, title}' | head -n 20

# CodeQL
gh code-scanning alerts list --repo Create-Node-App/create-node-app --state open
gh code-scanning alerts list --repo Create-Node-App/cna-templates --state open
```

---

## 2. Triage

| Severity | Action |
|---|---|
| Critical / High in CLI code path | P0 — fix immediately and release |
| High in transitive dependency of a template | P1 — fix within the sprint |
| Moderate / Low | Batch with other maintenance |
| Informational only | Document and close if not actionable |

Questions to ask:

- Is the vulnerable dependency in the **CLI execution path** or only in generated projects?
- Can we bump the dependency without breaking the template/extension?
- Is the fix already available upstream?
- Can we mitigate with `overrides` while waiting for upstream?

---

## 3. Fixing in `create-node-app`

The CLI monorepo uses pnpm. Root-level overrides can pin transitive dependencies across all packages.

```json
{
  "pnpm": {
    "overrides": {
      "esbuild": "^0.28.0",
      "picomatch": "^4.0.2"
    }
  }
}
```

Then run:

```bash
pnpm install
pnpm run build
pnpm run test:all
pnpm run lint
```

**Case study:** PR #165 "enforce secure esbuild and picomatch versions via overrides" used this exact pattern.

---

## 4. Fixing in `cna-templates`

Templates/extensions do not have committed lockfiles, so the fix must be in `package.json` ranges or `overrides`.

### 4.1 Direct dependency bump

If the vulnerable package is a direct dependency of an extension, bump it in the extension's `package.json`.

### 4.2 Transitive dependency override

If the vulnerable package is transitive, add an `overrides` field in the relevant extension `package.json`:

```json
{
  "devDependencies": { ... },
  "overrides": {
    "some-vulnerable-pkg": "^x.y.z"
  }
}
```

### 4.3 Cannot fix quickly

If no fixed version exists or the bump is breaking, open a tracking issue and document:

- The CVE or advisory ID.
- Why it cannot be fixed yet.
- The planned remediation date.

---

## 5. Running audits locally

```bash
# In create-node-app
pnpm audit

# In a generated project
npm audit

# OSV scanner (requires osv-scanner CLI)
osv-scanner -r .
```

---

## 6. CodeQL fixes

CodeQL alerts often relate to:

- Unsafe shell command construction from environment variables or user input.
- Injection via template strings in CLI code.

### General fix pattern

- Validate and sanitize inputs before passing them to `exec`, `spawn`, or shell templates.
- Prefer structured arguments (`execFile`, `spawn` with array) over string shell commands.
- Avoid interpolating user-controlled values directly into commands.

If an alert is a false positive, dismiss it with a comment explaining why.

---

## 7. Validation

After any security change:

1. Run the relevant audit command until the alert is gone or mitigated.
2. Run the normal CI checks (`test:all`, `lint`, `build`).
3. For `cna-templates`: scaffold the affected template + extensions and validate.
4. For `create-node-app`: run `npm run test:all` and the full workflow if possible.

---

## 8. Checklist

- [ ] Alert has been triaged and prioritized.
- [ ] Fix is minimal and scoped.
- [ ] Audit no longer reports the vulnerability (or it is documented as unfixable).
- [ ] CI passes.
- [ ] Generated projects still install, lint, type-check, and build.
- [ ] A changeset is added if the fix affects a published package.
