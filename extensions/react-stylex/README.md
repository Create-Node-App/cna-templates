# react-stylex

StyleX integration for `react-vite-starter`.

This extension integrates [StyleX](https://stylexjs.com) for type-safe, atomic CSS-in-JS.

## Technical Details

- **Pilot:** Developed as the Vite/React pilot for the StyleX epic.
- **Config Wrapper Pattern:** This extension avoids clobbering the base template's configuration by providing `vite.config.stylex.mjs` and `eslint.config.stylex.mjs`, which dynamically import and modify the base configuration. The `package.json` scripts are updated to point to these wrappers.
- **CSS Entrypoint:** Ensures a base `stylex.css` is imported in `main.tsx` to allow the Vite plugin to emit the aggregated atomic CSS asset.
