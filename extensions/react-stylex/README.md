# react-stylex

StyleX integration for `react-vite-starter`.

This extension integrates [StyleX](https://stylexjs.com) for type-safe, atomic CSS-in-JS.

Choose it when you want styles declared in TypeScript and extracted into atomic
CSS at build time. If your team prefers utility classes in markup, use
[`react-tailwindcss`](../react-tailwindcss/README.md) instead. For the Next.js
App Router, use [`nextjs-stylex`](../nextjs-stylex/README.md); that integration
uses Babel and does not compile styles with `next dev --turbo`.

## Technical Details

- **Pilot:** Developed as the Vite/React pilot for the StyleX epic.
- **Composable plugin injection:** This extension contributes its Vite and ESLint plugins through the base template's `vite.extensions.ts` / `eslint.extensions.mjs` extension points, so the base `dev` / `build` / `lint` scripts keep working untouched and multiple extensions compose instead of overwriting each other's configs.
- **CSS Entrypoint:** Ensures a base `stylex.css` is imported in `theme/index.ts` to allow the Vite plugin to emit the aggregated atomic CSS asset.
