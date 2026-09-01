# Tailwind CSS for Next.js

Adds Tailwind CSS v4 to a Next.js project with PostCSS configuration, utility-first styling, class-based dark mode, and starter theme variables.

## Compatibility

This extension is compatible with templates whose type is `nextjs`.

## Apply

```sh
npx create-awesome-node-app my-app --template nextjs-starter --addons nextjs-tailwindcss
```

## What it adds

- `postcss.config.mjs` - configures `@tailwindcss/postcss` and `autoprefixer`
- `tailwind.config.ts` - configures source-file scanning and class-based dark mode
- `src/app/globals.css` - imports Tailwind CSS and adds light and dark theme variables
- `tailwindcss` and `@tailwindcss/postcss` - Tailwind CSS dependencies
- `postcss` and `autoprefixer` - PostCSS development dependencies

## Verify

After scaffolding the app, install dependencies and run a production build:

```sh
cd my-app
npm install
npm run build
```