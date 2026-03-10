# Authoring Templates and Extensions

## Template Directory Layout

```
my-template/
├── package/
│   ├── index.js           # Required: exports a function that returns package.json
│   ├── dependencies.js    # module.exports = { "lib": "^1.0.0" }
│   └── devDependencies.js
├── [src]/                 # Renamed based on the `srcDir` customOption
│   └── App.tsx.template   # Processed with EJS
├── vite.config.ts.template
└── .gitignore             # Static — copied as-is
```

## `package/index.js`

Exports a function that receives user context and returns the full `package.json`:

```js
const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand, usePnpm }) {
  return {
    name: appName,
    version: "0.1.0",
    scripts: { dev: "vite", build: "tsc && vite build" },
    dependencies,
    devDependencies,
  };
};
```

Available parameters: `appName`, `runCommand`, `installCommand`, `usePnpm`.

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

## `customOptions`

Only templates can define these. They become EJS variables and control bracket directory renaming.

```json
"customOptions": [
  {
    "name": "srcDir",
    "type": "text",
    "message": "Source directory (e.g. `src`). Leave blank for root.",
    "initial": "src"
  }
]
```

| Field | Description |
|---|---|
| `name` | Used as `<%= name %>` in templates and matches `[name]/` dirs |
| `type` | Prompt type (`"text"` is the standard) |
| `message` | Question shown in the CLI |
| `initial` | Default value |
| `required` | Optional. Defaults to true |
