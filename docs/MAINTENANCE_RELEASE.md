# Maintenance: Release and Publishing

> How to manage releases, changesets, and npm Trusted Publishing for `create-node-app`.
>
> Read after the top-level [MAINTENANCE_RUNBOOK.md](./MAINTENANCE_RUNBOOK.md).

---

## 1. Release model

`create-node-app` is a Changesets-powered monorepo. Releases happen automatically via GitHub Actions.

- Developers add `.changeset/*.md` files with their PRs.
- The `Release` workflow opens a "Version Packages" PR when changesets exist.
- Once the Version Packages PR is merged, the workflow publishes to npm.

No manual `npm publish` should be run from a local machine.

---

## 2. Adding a changeset

When a PR modifies a publishable package, add a changeset:

```bash
npx changeset
```

Follow the prompts. This creates a file like `.changeset/silly-bears-jump.md`:

```md
---
"create-awesome-node-app": patch
"@create-node-app/core": patch
---

Fix dependency resolution edge case.
```

Commit this file as part of the PR.

---

## 3. Publishing requirements

The `publish.yml` workflow uses npm **Trusted Publishing** via OIDC. Requirements:

1. Every publishable `package.json` must have a valid `repository.url`.
2. The npm CLI in CI must be at least `11.5.1`:
   ```yaml
   - run: npm install -g npm@^11.5.1
   ```
3. The workflow job must request `id-token: write` permission.
4. The GitHub environment `npm-publish` must be configured in npmjs.org with the correct publisher identity.

No `NPM_TOKEN` secret is required; the npm CLI auto-detects the OIDC token.

---

## 4. Troubleshooting release failures

### 4.1 "provenance requirements not met" or publish rejected

Check:

- `repository.url` is present and points to the correct GitHub repo.
- The workflow is running with `id-token: write`.
- The npm environment in npmjs.org is trusted for this repository.
- The npm CLI version in CI is `>= 11.5.1`.

### 4.2 Changeset PR not created

Check:

- The PR included a `.changeset/*.md` file.
- The `release-pr` job in `publish.yml` has `contents: write` and `pull-requests: write` permissions.
- There are no open changesets already.

### 4.3 Version Packages PR merge fails

If the Version Packages PR fails CI after being auto-generated, fix `main` first, then have Changesets regenerate the PR.

---

## 5. Verifying a release

### 5.1 npm registry

```bash
npm view create-awesome-node-app@latest version
npm view @create-node-app/core@latest version
```

### 5.2 Provenance

Check that the published package has provenance attestation:

```bash
npm view create-awesome-node-app@latest --json | jq '.dist'
```

Look for provenance metadata or verify directly in the npmjs package page.

### 5.3 Smoke test

```bash
npx create-awesome-node-app@latest --help
```

If all packages were published correctly, the latest CLI starts without errors.

---

## 6. When to release

| Change | Release needed? |
|---|---|
| Docs only | No |
| Template/extension in `cna-templates` | No (templates are fetched from GitHub, not npm) |
| Fix in `create-node-app` CLI package | Yes, add changeset |
| Fix in `@create-node-app/*` package | Yes, add changeset |
| Security fix in CLI dependency | Yes, add changeset and release quickly |

---

## 7. Checklist

- [ ] A changeset was added for every publishable package change.
- [ ] `repository.url` is present and correct in all publishable `package.json` files.
- [ ] The Version Packages PR passed CI before merge.
- [ ] The publish workflow completed successfully.
- [ ] New versions appear on npm and `npx create-awesome-node-app@latest` works.
- [ ] No `NPM_TOKEN` or personal npm token was used.
