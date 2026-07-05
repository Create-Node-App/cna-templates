# Maintenance: Dependencies

> How to update, investigate, and resolve dependency conflicts in templates and extensions.
>
> Read after the top-level [MAINTENANCE_RUNBOOK.md](./MAINTENANCE_RUNBOOK.md).

---

## 1. Investigating a dependency

Before bumping a version, verify that it exists and that its peer requirements are compatible.

```bash
# Does a specific version exist?
npm view <pkg>@<version>

# List recent versions
npm view <pkg> versions --json | tail -n 20

# Check peer dependencies
npm view <pkg>@<version> peerDependencies

# Check the whole dependency tree
npm view <pkg>@<version> dependencies
```

Example:

```bash
npm view storybook@10.4.6
npm view @storybook/addon-essentials versions --json | tail -n 20
npm view @storybook/nextjs@8.6.18 peerDependencies
```

If a version is missing, `npm view` returns a 404. That immediately tells you that the range in `package.json` is invalid.

---

## 2. Dependency resolution failures

### 2.1 `npm error ETARGET`

**Meaning:** The requested version does not exist on the registry.

**Common cause:** A template or extension pins a version that has not been published for every package in a monorepo.

**Fix:**

1. Verify which package in the monorepo lacks the version.
2. Either:
   - Drop the package if it is no longer needed in the new major line.
   - Pin to the latest common version across all related packages.
   - Wait/research the new addon/package name in the new major line.

**Case study:** Storybook `^10.4.6` exists for `storybook`, `@storybook/nextjs`, `@storybook/react`, and `@storybook/addon-links`, but **not** for `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/blocks`, or `@storybook/test`. The immediate fix was to revert to `^8.6.18`. The follow-up is tracked in issue #161.

### 2.2 `npm error ERESOLVE`

**Meaning:** npm cannot satisfy the dependency tree, usually because of a peer-dependency conflict.

**Common cause:** Two packages require different major versions of the same peer.

**Fix strategies (in order of preference):**

1. **Update both sides** to a mutually compatible version. This is the cleanest fix.
2. **Downgrade the more aggressive requirement** if the newer major is not strictly needed.
3. **Add `.npmrc` with `legacy-peer-deps=true`** if the packages are known to work together despite the declared peer range. Several extensions already do this (see `MAINTENANCE_TEMPLATES.md`).
4. **Mark extensions as incompatible** if they truly cannot coexist.

**Case study:** `@storybook/nextjs@8.6.18` declares `peer next@"^13.5.0 || ^14.0.0 || ^15.0.0"`, but `nextjs-starter` uses Next 16. Keeping Storybook 8 and adding `.npmrc` with `legacy-peer-deps=true` is the current workaround.

### 2.3 Peer dependency warnings that turn into errors

In newer npm versions, peer conflicts can fail installs even when the rest of the tree resolves. Treat peer conflicts as errors if CI breaks.

---

## 3. Updating dependencies

### 3.1 In an extension

1. Edit `extensions/<slug>/package.json`.
2. Use conservative ranges: `^x.y.z`.
3. Avoid major-version bumps unless you have validated the breaking changes.
4. Re-scaffold the extension with each compatible template and run validation.

### 3.2 In a template

Templates usually generate `package.json` via `package/index.js`. Update the versions there or in `dependencies.js`/`devDependencies.js`.

### 3.3 Major updates

A major dependency update is high-risk. For each major:

1. Read the changelog or migration guide.
2. Check peer dependency requirements.
3. Test with the full matrix of the affected template.
4. If breaking changes affect generated code, update template `.template` files or extension files.

---

## 4. Lockfiles

Generated projects do **not** commit lockfiles in this repo, but the validation relies on fresh `npm install`. If a transitive dependency starts breaking installs, consider:

- Pinning the transitive dependency in the extension `package.json`.
- Using `overrides` in `create-node-app` core (see [MAINTENANCE_SECURITY.md](./MAINTENANCE_SECURITY.md)).

Generated projects will receive whatever the registry returns at install time, so try to avoid relying on transient registry states.

---

## 5. Dependabot PRs

### 5.1 Reviewing

```bash
gh pr list --repo Create-Node-App/create-node-app --author dependabot --state open
gh pr view <pr> --repo Create-Node-App/create-node-app
```

### 5.2 Rebasing if conflicted

```bash
gh pr comment <pr> --repo Create-Node-App/create-node-app --body "@dependabot rebase"
```

### 5.3 Merging

Only merge if CI passes. Security-related bumps take priority. If a Dependabot PR fails CI, treat it as a bug fix: reproduce, adjust the dependency range or lockfile, and push to the same PR rather than opening a duplicate.

---

## 6. Tools for complex resolution

```bash
# Inspect why a version was chosen
npm ls <pkg>

# Show outdated packages in a generated project
npm outdated

# Install with maximum logs
npm install --loglevel verbose

# Force legacy peer resolution (local sanity check)
npm install --legacy-peer-deps
```

---

## 7. Checklist

- [ ] The target version exists for every related package in the monorepo.
- [ ] Peer dependencies are satisfied or explicitly worked around.
- [ ] The change is scoped to the affected template/extension.
- [ ] Local validation passes.
- [ ] Full matrix passes for affected templates.
- [ ] If security-related, the CVE is actually addressed by the bump.
