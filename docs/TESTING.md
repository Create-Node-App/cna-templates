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

# Remote template slug + local extension (for extension-only development)
CI=true npx create-awesome-node-app my-app \
  --template react-vite-boilerplate \
  --addons "file://$REPO?subdir=extensions/my-new-extension"
```

### Debug output

Add `--verbose` to any command to see detailed scaffolding logs.

## CI Workflow

`.github/workflows/test-combinations.yml` runs on every push/PR to `main` and weekly on Sundays.

For each template it:
1. Picks one random compatible extension per category
2. Runs `npx create-awesome-node-app --template <slug> --addons <...>` (CI mode)
3. Verifies `npm run format --if-present`, `npm run lint:fix --if-present`, and `npm run build --if-present` all pass

To reproduce a CI run locally:

```sh
CI=true npx create-awesome-node-app my-app \
  --template <slug> --addons <ext1> <ext2>
cd my-app && npm run format --if-present && npm run lint:fix --if-present && npm run build --if-present
```
