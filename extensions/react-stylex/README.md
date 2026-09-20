# react-stylex

StyleX integration for `react-vite-starter`.

This extension integrates [StyleX](https://stylexjs.com) for type-safe, atomic CSS-in-JS.

## Technical Details

- **Pilot:** Developed as the Vite/React pilot for the StyleX epic.
- **Composable plugin injection:** This extension contributes its Vite and ESLint plugins through the base template's `vite.extensions.ts` / `eslint.extensions.mjs` extension points, so the base `dev` / `build` / `lint` scripts keep working untouched and multiple extensions compose instead of overwriting each other's configs.
- **CSS Entrypoint:** Ensures a base `stylex.css` is imported in `theme/index.ts` to allow the Vite plugin to emit the aggregated atomic CSS asset.
