# Serverless Framework

Add Serverless Framework packaging to deploy your NestJS API to AWS Lambda with TypeScript support and best practices for serverless architecture.

## Compatible types

- `nestjs-backend` → `nestjs-boilerplate`

## Files

- `serverless.yml` — Serverless Framework service definition
- `src/lambda.ts` — Lambda handler wrapping NestJS
- `tsconfig.bundle.json` — bundle TS config for esbuild
- `docs/DEPLOYMENT.md.template` — deployment guide (EJS)
- `package.json` — scripts `sls:*`, deps `serverless`, `@vendia/serverless-express`

## Apply

```sh
npx create-awesome-node-app my-app --template nestjs-boilerplate --addons serverless-framework
```

Or interactively:

```sh
npx create-awesome-node-app
# → pick a compatible template (see above)
# → select the addon: serverless-framework
```

## Verify

1. `node scripts/validate-templates.js` — templates.json references this extension correctly.
2. Scaffold smoke:
   ```sh
   npx create-awesome-node-app /tmp/scaffold --template <template> --addons <slug>
   npm --prefix /tmp/scaffold run build  # or `npm run lint` / `tsc --noEmit`
   ```
   Replace `<template>` with a compatible template from **Compatible types** and `<slug>` with `serverless-framework`.
