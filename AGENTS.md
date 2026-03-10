# AGENTS.md

This repo is the template and extension bank for [create-awesome-node-app](https://www.npmjs.com/package/create-awesome-node-app).

## Key concepts

- **`templates.json`** — single registry of all templates, extensions, and categories. Every entry needs `name`, `slug`, `description`, `url`, `type`, `category`, `labels`. Slugs must be globally unique.
- **`type`** — links templates to extensions. A template has one type string; extensions list one or more compatible types. Only matching extensions appear when a template is selected.
- **`package/index.js`** — most templates use this instead of a static `package.json`. It exports a function `(setup, { appName, runCommand, usePnpm }) => packageJson`.
- **`.template` files** — processed with EJS (`<%= variable %>`). Variables come from user input and `customOptions`.
- **`.append` files** — content is appended to the matching existing file instead of replacing it.
- **`.if-pnpm` files** — only included when the user picks pnpm.
- **`[bracket]/` dirs** — renamed based on the matching `customOption` value.
- **`customOptions`** — template-only field that defines interactive CLI prompts; answers become EJS variables.

## How to test

```sh
# With published slugs (CI=true uses customOptions defaults automatically)
CI=true npx create-awesome-node-app my-app --template <slug> --addons <ext1> <ext2>
cd my-app && npm install && npm run lint:fix && npm run build

# Local extension against a published template (best for extension development)
CI=true npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons "file://$PWD?subdir=extensions/my-extension"
```

See [docs/TESTING.md](./docs/TESTING.md) for more examples, `file://` caveats, and CI details.

## Docs

| File | Contents |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System overview, type system, generation flow |
| [docs/AUTHORING.md](./docs/AUTHORING.md) | File conventions, EJS variables, `package/` system, `customOptions` |
| [docs/TESTING.md](./docs/TESTING.md) | Local testing commands and CI workflow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to add templates and extensions |
