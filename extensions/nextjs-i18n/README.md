# next-intl (i18n) for Next.js

Adds [next-intl](https://next-intl.dev/) internationalization to a Next.js App Router project, with English and Spanish messages, locale routing, and typed locale configuration.

## Compatibility

This extension is compatible with templates whose type is `nextjs`.

## Apply

```sh
npx create-awesome-node-app my-app --template nextjs-starter --addons nextjs-i18n
```

## What it adds

- `messages/en.json` and `messages/es.json` — starter English and Spanish messages
- `src/i18n/config.ts` — supported locales, the default locale, and the `Locale` type
- `src/i18n/request.ts` — request locale validation and message loading
- `src/i18n/client.ts` — client-side next-intl hook exports
- `src/middleware-handlers.ts` — locale-aware request middleware
- `next.config.mjs` — next-intl plugin configuration
- `next-intl` — runtime dependency

## Verify

After scaffolding the app, install dependencies and run a production build:

```sh
cd my-app
npm install
npm run build
```

## Resources

- [next-intl documentation](https://next-intl.dev/docs/getting-started/app-router)
