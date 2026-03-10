# Testing Templates and Extensions

## Testing with published slugs (recommended)

Use slugs from `templates.json` to generate and verify a project:

```sh
npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons tailwind-css zustand github-setup
cd my-app && npm install && npm run lint:fix && npm run build
```

In non-interactive/CI mode the CLI reads `customOptions.initial` values from the registry automatically, so all EJS variables resolve without user input:

```sh
CI=true npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons zustand
cd my-app && npm install && npm run lint:fix && npm run build
```

## Testing local changes with `file://`

Use `file://` URLs to test unpublished templates or extensions without pushing to GitHub.

### Local extension against a published template (most common during development)

```sh
REPO=/absolute/path/to/cna-templates

CI=true npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons "file://$REPO?subdir=extensions/react-zustand"
cd my-app && npm install && npm run lint:fix && npm run build
```

> The template slug provides `customOptions` defaults (e.g. `srcDir`, `projectImportPath`).
> The local extension is applied on top. This is the recommended pattern for extension development.

### Local template (only works for templates without `customOptions`)

Templates like `nestjs-boilerplate` and `webdriverio-boilerplate` have no `customOptions` so they work fully locally:

```sh
REPO=/absolute/path/to/cna-templates

CI=true npx create-awesome-node-app my-app \
  -t "file://$REPO?subdir=templates/nestjs-starter" \
  --addons \
    "file://$REPO?subdir=extensions/nestjs-openapi" \
    "file://$REPO?subdir=extensions/all-github-setup"
cd my-app && npm install && npm run build
```

> Templates **with** `customOptions` (react, nextjs, webextension) will fail with `file://` in non-interactive mode because EJS variables like `<%= srcDir %>` and `<%= projectImportPath %>` have no defaults without a registry lookup. For those templates, use the published slug and test your extension locally via the mixed pattern above.

### Debug output

Add `--verbose` to any command to see detailed scaffolding logs:

```sh
CI=true npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons "file://$REPO?subdir=extensions/react-zustand" \
  --verbose
```

## CI Workflow

`.github/workflows/test-combinations.yml` runs on every push/PR to `main` and weekly on Sundays.

For each template it:
1. Picks one random compatible extension per category
2. Runs `npx create-awesome-node-app --template <slug> --addons <...>` (CI mode, uses `customOptions` defaults from registry)
3. Verifies `npm run format --if-present`, `npm run lint:fix --if-present`, and `npm run build --if-present` all pass

To reproduce a CI run locally, pick extensions manually (one per category) and run:

```sh
CI=true npx create-awesome-node-app my-app \
  --template <slug> --addons <ext1> <ext2>
cd my-app && npm run format --if-present && npm run lint:fix --if-present && npm run build --if-present
```
