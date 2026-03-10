# Testing Templates and Extensions

## Local Testing

Generate a project using the CLI and verify it builds:

```sh
# Template only
npx create-awesome-node-app --template react-vite-boilerplate
cd my-project && npm install && npm run lint:fix && npm run build

# Template + extensions
npx create-awesome-node-app \
  --template react-vite-boilerplate \
  --addons tailwind-css zustand github-setup
cd my-project && npm install && npm run lint:fix && npm run build

# Custom project name
npx create-awesome-node-app my-app --template nestjs-boilerplate --addons openapi
```

## CI Workflow

`.github/workflows/test-combinations.yml` runs on every push/PR to `main` and weekly on Sundays.

For each template it:
1. Picks one random compatible extension per category
2. Runs `npx create-awesome-node-app --template <slug> --addons <...>`
3. Verifies `npm run format`, `npm run lint:fix`, and `npm run build` all pass

To reproduce a CI run locally, pick extensions manually (one per category) and run the same commands.
