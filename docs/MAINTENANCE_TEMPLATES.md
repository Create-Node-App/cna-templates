# Maintenance: Templates and Extensions

> How to inspect, fix, add, and update templates and extensions in `cna-templates`.
>
> Read after the top-level [MAINTENANCE_RUNBOOK.md](./MAINTENANCE_RUNBOOK.md).

---

## 1. Core concepts

These are defined in `AGENTS.md` and `docs/ARCHITECTURE.md`; the critical points are repeated here because they drive almost every maintenance decision.

### 1.1 Registry

- `templates.json` is the single registry of templates, extensions, and categories.
- `templates.schema.json` validates the registry.
- Every template/extension needs: `name`, `slug`, `description`, `url`, `type`, `category`, `labels`.
- Extensions may also have `incompatibleWith` to declare mutually exclusive extensions.

### 1.2 Type system

- A template has **one** `type` string.
- An extension has a `type` string **or array** of strings.
- An extension is compatible with a template when `template.type` is in `[ext.type].flat()`.

### 1.3 File conventions

| Convention | Behavior |
|---|---|
| `package/index.js` | Exports a function that returns the generated `package.json`. Most templates use this. |
| `package/dependencies.js` / `devDependencies.js` | Optional helpers imported by `index.js`. |
| `*.template` | Processed with EJS; output filename strips `.template`. |
| `*.append` | Content is appended to the matching file in the project. |
| `*.if-pnpm` | Only included when the user selects pnpm. |
| `[name]/` directory | Renamed to the value of the `name` custom option. |

### 1.4 EJS variables

Common variables available in `.template` files:

| Variable | Source |
|---|---|
| `<%= projectName %>` | User input or `--set projectName=...` |
| `<%= srcDir %>` | `cna.config.json` custom option |
| `<%= projectImportPath %>` | `cna.config.json` custom option |
| `<%= scope %>` | `cna.config.json` custom option (monorepo) |
| `<%= installCommand %>` | CLI context |
| `<%= runCommand %>` | CLI context |

### 1.5 Generation order

1. Resolve template + extension URLs from `templates.json`.
2. Copy template files.
3. Process `.template`, `.append`, `.if-pnpm` files.
4. Rename `[bracket]/` directories based on `customOptions`.
5. Generate `package.json` from `package/index.js` (or static `package.json`).
6. Merge extension files and dependencies on top.
7. Run install and post-generation scripts.

---

## 2. How to inspect an existing template

```bash
cd repos/github.com/Create-Node-App/cna-templates

# List templates
ls templates/

# Read the registry entry
grep -A 15 '"slug": "nestjs-boilerplate"' templates.json

# Read the package generator
cat templates/nestjs-starter/package/index.js

# Read custom options
cat templates/nestjs-starter/cna.config.json
```

Key questions:

- What `type` does it have?
- What `customOptions` does it define?
- What scripts does `package/index.js` generate?
- Are there `[bracket]/` directories that depend on custom options?

---

## 3. How to inspect an existing extension

```bash
# List extensions
ls extensions/

# Read the registry entry
grep -A 15 '"slug": "storybook"' templates.json

# Read dependencies and scripts
cat extensions/storybook/package.json

# Read files it injects
ls -la extensions/storybook
```

Key questions:

- Which `type`s is it compatible with?
- Does it inject a `.npmrc`? (See [dependency resolution](./MAINTENANCE_DEPENDENCIES.md).)
- Does it have `.template` files needing EJS variables?
- Does it have `.append` files that modify existing template files?

---

## 4. Fixing TypeScript / lint / build errors in generated projects

When a generated project fails `type-check`, `lint`, or `build`, the cause is usually in the template or an extension.

### 4.1 Reproduce locally

```bash
REPO=/absolute/path/to/cna-templates
CI=true npx create-awesome-node-app@latest my-app \
  -t "file://$REPO?subdir=templates/<slug>" \
  --addons "file://$REPO?subdir=extensions/<ext1>"

cd my-app
npm install
npm run lint
npm run type-check
SKIP_ENV_VALIDATION=true npm run build
```

### 4.2 Isolate the offending extension

Remove extensions one at a time until the project passes. Then fix the last removed extension.

### 4.3 Common fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| `Property 'x' has no initializer` | Class property not assigned in constructor under strict mode. | Initialize in lifecycle hook or use a getter with runtime guard. |
| `Argument of type 'string \| undefined'` | `configService.get('VAR')` may return `undefined`. | Add a fallback: `configService.get('VAR') \|\| 'default'`. |
| `Cannot find module` | Missing dependency or wrong peer dependency range. | Update the extension `package.json`. |
| ESLint flat config parser error | Parser not applied to `.ts`/`.tsx`. | Check `eslint.config.mjs` template. |
| `next build` peer conflict | Storybook/other addon does not support current Next major. | Update addon OR pin Next OR use `.npmrc` with `legacy-peer-deps`. |

### 4.4 Case studies in this repo

- **#153** — `nestjs-drizzle-sqlite` provider had an uninitialized `db` property and implicit string types. Fixed by initializing in `onModuleInit` and adding string fallbacks.
- **#154** — Storybook 8 peer-required Next `^13\|\|14\|\|15`, but `nextjs-starter` uses Next 16. Fixed by keeping Storybook 8 and adding `legacy-peer-deps=true` in `extensions/storybook/.npmrc`.

---

## 5. Adding or modifying a template

### 5.1 Adding a template

1. Create `templates/<directory>/`.
2. Add `package/index.js` (and optionally `dependencies.js`/`devDependencies.js`).
3. Add source files and `.template` files.
4. Add `cna.config.json` with `customOptions` if interactive prompts are needed.
5. Add an entry to `templates.json` under `templates`.
6. Ensure the entry point matches the directory structure.
7. Run local validation against the new template.
8. Run the full matrix after merge.

### 5.2 Directory naming caveat

The directory name in `templates/` and the slug in `templates.json` may differ. For example, `nestjs-boilerplate` (slug) lives in `templates/nestjs-starter` (directory). The CLI resolves via `url`, not slug. When generating locally with `file://`, use the directory name:

```bash
-t "file://$REPO?subdir=templates/nestjs-starter"
```

### 5.3 Modifying a template

1. Re-scaffold the template with a representative set of extensions.
2. Apply the change.
3. Validate lint/type-check/build.
4. Re-scaffold with **all** compatible extensions (full matrix worst case) to detect conflicts.

---

## 6. Adding or modifying an extension

### 6.1 Adding an extension

1. Create `extensions/<slug>/`.
2. Add a `package.json` with dependencies and scripts to merge.
3. Add files, templates, appends, or `.npmrc` as needed.
4. Add the extension to `templates.json` under `extensions`.
5. Set `type` to match compatible template types.
6. Set `category` to avoid selecting multiple extensions from the same category in random CI.
7. Define `incompatibleWith` if it cannot coexist with other extensions.
8. Validate locally with **each** compatible template.
9. Validate the full matrix after merge.

### 6.2 Modifying an extension

1. Identify all templates compatible with the extension (`type` match).
2. Test the extension against **at least one** template locally.
3. If the change affects dependencies, also test the full matrix of that template (all extensions at once) to detect peer conflicts.

---

## 7. Handling incompatible extensions

When two extensions cannot be used together, declare it explicitly.

### 7.1 Via `incompatibleWith`

In `templates.json`, add `incompatibleWith` to both extensions:

```json
{
  "slug": "react-redux-saga",
  "incompatibleWith": ["react-redux-thunk"]
}
```

The CI generator reads this and never selects both in the same combination. The full matrix generator also respects it.

### 7.2 Via `.npmrc`

If the incompatibility is only a peer-dependency resolution issue at install time, a `.npmrc` with `legacy-peer-deps=true` may be enough. Several extensions already do this:

```text
extensions/react-hookstate/.npmrc
extensions/react-semantic-ui/.npmrc
extensions/storybook/.npmrc
```

This is cheaper than `incompatibleWith` because it keeps both extensions available. Use it when the conflict is a semver-peer restriction, not a logical conflict.

### 7.3 Decision matrix

| Situation | Use |
|---|---|
| Extensions logically conflict (e.g., two Redux middleware choices) | `incompatibleWith` |
| Peer dependency disagreement that resolves with `legacy-peer-deps` | `.npmrc` |
| Extension breaks a specific template but works elsewhere | Isolate the problem; consider template-specific branch or do not list the type match |
| Extension is obsolete | Remove from `templates.json` or archive |

---

## 8. Updating dependencies inside a template or extension

1. Open the relevant `package.json` (or `package/index.js` for templates).
2. Use `npm view` to find the latest compatible version.
3. Update the range conservatively (prefer caret minors, not arbitrary majors).
4. Re-scaffold locally and run validation.
5. If the update is security-related, also read [MAINTENANCE_SECURITY.md](./MAINTENANCE_SECURITY.md).

See [MAINTENANCE_DEPENDENCIES.md](./MAINTENANCE_DEPENDENCIES.md) for deeper dependency troubleshooting.

---

## 9. Local validation command

Use this exact sequence after every template or extension change:

```bash
REPO=/absolute/path/to/cna-templates
CI=true npx create-awesome-node-app@latest my-app \
  -t "file://$REPO?subdir=templates/<slug>" \
  --addons "file://$REPO?subdir=extensions/<ext1>" \
         "file://$REPO?subdir=extensions/<ext2>"

cd my-app
npm install
npm run format --if-present
npm run lint:fix --if-present
npm run lint --if-present
npm run type-check --if-present
SKIP_ENV_VALIDATION=true npm run build --if-present
```

If any step fails, fix the template or extension, then regenerate from scratch. Do not reuse `my-app` between attempts because files are merged, not reset.

---

## 10. Checklist

- [ ] Registry entry is valid against `templates.schema.json`.
- [ ] `type` matches between template and compatible extensions.
- [ ] `category` is set to avoid random CI selecting duplicates.
- [ ] `incompatibleWith` is defined for mutually exclusive extensions.
- [ ] `.npmrc` is added if peer-dependency conflicts exist.
- [ ] `.template` files use available EJS variables.
- [ ] Local validation passes.
- [ ] Full matrix worst case (all compatible extensions) is tested for risky changes.
