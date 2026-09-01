# Testing Templates and Extensions

## Testing with published slugs

Use slugs from `templates.json` to generate and verify a project:

```sh
CI=true npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons tailwind-css zustand github-setup
cd my-app && npm install && npm run lint:fix && npm run build
```

## Testing local changes with `file://`

Use `file://` URLs to test unpublished templates or extensions without pushing to GitHub.
`customOptions` defaults are read from `cna.config.json` inside the template directory,
so all EJS variables resolve automatically in non-interactive mode.

**Always use the on-disk directory name** from the registry `url` (for example
`templates/nestjs-starter`), never the public slug (`nestjs-boilerplate`). Wrong
paths produce empty scaffolds that look green if scripts are `--if-present`.

**`file://` templates ignore static `package.json`.** CNA only applies
`package/index.js` (or `package.js`). Do not keep both `package.json` and a
`package/` directory — Node resolves `…/package` to `package.json` and the
resolver never runs.

```sh
REPO=/absolute/path/to/cna-templates

# Local template only
CI=true npx create-awesome-node-app my-app \
  -t "file://$REPO?subdir=templates/react-vite-starter"

# Local template + local extensions
CI=true npx create-awesome-node-app my-app \
  -t "file://$REPO?subdir=templates/react-vite-starter" \
  --addons \
    "file://$REPO?subdir=extensions/react-zustand" \
    "file://$REPO?subdir=extensions/all-github-setup" \
  --no-install
cd my-app && npm install && npm run lint:fix && npm run build

# Shared CI runner (same checks as GitHub Actions)
node scripts/ci/run-scaffold-check.js \
  --template-url "file://$REPO/templates/react-vite-starter" \
  --addon-url "file://$REPO/extensions/react-zustand"
```

### Debug output

Add `--verbose` to any command to see detailed scaffolding logs.

## CI Workflow (layered trust — #309)

Green required checks mean **templates and realistic profiles work**, not that
every extension can be stacked into one mega-app.

| Layer | Workflow | When | What |
|-------|----------|------|------|
| **L0** | `ci-integrity.yml` | PR + main + weekly | `validate-templates.js` (paths exist), doc links, shared assets, profile schema |
| **L1** | `ci-templates.yml` | PR + main + weekly | **Every** template alone (correct `file://` dir from registry) |
| **L2** | `ci-extensions.yml` | PR (changed only) + weekly (all) | **One extension per job** on its canonical template |
| **L3** | `ci-profiles.yml` | PR (affected) + weekly (all) | Curated one-per-category stacks in `ci/profiles/*.json` |

### What we deliberately do **not** run

- Random “one extension per category” stacks on every push
- “Full matrix” = all compatible extensions at once (false negatives from UI/store collisions; false confidence)

### Local matrix generation

```sh
node scripts/ci/generate-matrix.js --layer templates
node scripts/ci/generate-matrix.js --layer extensions
node scripts/ci/generate-matrix.js --layer profiles
node scripts/ci/generate-matrix.js --layer validate-profiles
```

### Adding a curated profile

1. Create `ci/profiles/<id>.json` with `templateDir`, `addons` (registry **slugs**), optional `sets`.
2. Enforce **one addon per category** and honor `incompatibleWith`.
3. Run `node scripts/ci/generate-matrix.js --layer validate-profiles`.
