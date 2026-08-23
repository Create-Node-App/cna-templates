# Authoring Templates and Extensions

## Template Directory Layout

```
my-template/
├── cna.config.json         # customOptions (interactive prompts)
├── template/
│   ├── package.json        # static manifest — all 10 templates use this
│   ├── [src]/              # Renamed based on the `srcDir` customOption
│   │   └── App.tsx.template # Processed with EJS
│   ├── vite.config.ts.template
│   └── .gitignore          # Static — copied as-is
```

## `template/package.json` (static manifest)

All templates ship a static `template/package.json`. The CLI copies it verbatim (after EJS processing) as the base manifest; extensions then merge their `package.json` dependencies on top.

Legacy `package/index.js` (`(setup, { appName, runCommand, usePnpm }) => packageJson` with `package/dependencies.js` / `devDependencies.js`) is no longer used — zero templates currently ship it. Do not add a `package/` directory alongside `template/package.json`; Node resolves `…/package` to `package.json` and the dynamic resolver would never run (see `docs/TESTING.md`).

```json
{
  "name": "my-template",
  "version": "0.1.0",
  "scripts": { "dev": "vite", "build": "tsc && vite build" },
  "dependencies": { "react": "^19.0.0" },
  "devDependencies": { "vite": "^6.0.0" }
}
```

## File Naming Conventions

| Suffix | Behavior |
|---|---|
| `.template` | Processed with EJS, suffix stripped from output filename |
| `.append` | Content appended to the matching file already in the project |
| `.if-pnpm` | Included only when the user selects pnpm, suffix stripped |
| `[name]/` | Directory renamed to the value of the `name` customOption |

## EJS Variables

All `.template` files use `<%= variableName %>` syntax.

| Variable | Description | Example |
|---|---|---|
| `<%= projectName %>` | Project name entered by the user | `my-app` |
| `<%= srcDir %>` | Source directory (from customOption) | `src` |
| `<%= projectImportPath %>` | Import alias (from customOption) | `@/` |
| `<%= scope %>` | Package scope for monorepo | `@my-org/` |
| `<%= installCommand %>` | Full install command | `npm install` |
| `<%= runCommand %>` | Script run command | `npm run` |

## Extension Layout

Extensions are simpler — they only add files and dependencies.

**Most common pattern** — a plain `package.json` with deps to merge:

```json
{ "devDependencies": { "husky": "^9.0.0" } }
```

Everything else in the extension directory is copied into the project,
respecting all file suffix conventions above.

## `customOptions` — Interactive Prompts

Only templates can define these. They become EJS variables and control bracket directory renaming.

Define them in `cna.config.json` at `templates/<slug>/cna.config.json` (sibling to `template/`):

```json
{
  "customOptions": [
    {
      "name": "srcDir",
      "type": "text",
      "message": "Source directory (e.g. `src`). Leave blank for root.",
      "initial": "src"
    }
  ]
}
```

| Field | Description |
|---|---|
| `name` | Used as `<%= name %>` in templates and matches `[name]/` dirs |
| `type` | Prompt type (`"text"` is the standard) |
| `message` | Question shown in the CLI |
| `initial` | Default value (used automatically in non-interactive/CI mode) |
| `required` | Optional. Defaults to true |

> `cna.config.json` lives at `templates/<slug>/cna.config.json` (sibling to `template/`) so it works with both slug resolution and `file://` local URLs.
> Do **not** put `customOptions` in `templates.json` — it is no longer read from there.

## Template maturity

Before merging a new or heavily revised starter, meet the **M1 mature scaffold** bar documented in [MAINTENANCE_TEMPLATES.md §11](./MAINTENANCE_TEMPLATES.md#11-template-maturity-m1--m2--m3).

In short:

- Use static `template/package.json` with `cna.config.json` for prompts (all 10 templates do this). The legacy `package/index.js` is no longer used — do not introduce a `package/` directory.
- Ship a real `docs/` suite; **never** link landings or READMEs to docs that do not exist.
- `lint` / `test` scripts must do real work (or be omitted) — no `echo` stubs and no fake README scripts.
- Use `react-vite-starter` / `nextjs-starter` as the reference; do **not** treat `nextjs-saas-ai-starter` as the default scope.
