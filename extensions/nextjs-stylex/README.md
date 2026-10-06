# nextjs-stylex

Adds StyleX to Next.js App Router projects.

- Configures Babel, PostCSS, and ESLint flat config.
- Implements atomic CSS injection via `globals.css.append`.
- Works alongside existing Next.js setups.

## Combining with Tailwind CSS

`nextjs-stylex` can be selected with `nextjs-tailwindcss` when you want both
StyleX's typed atomic styles and Tailwind's utility classes:

```sh
npx create-awesome-node-app my-app \
  --template nextjs-saas-ai-starter \
  --addons nextjs-stylex nextjs-tailwindcss
```

The generated PostCSS plugin order is stable in either selection order:
StyleX, Tailwind, then Autoprefixer. Keep both extensions' configuration
contributions in place; do not replace the generated PostCSS config. The
combined `nextjs-saas-ai-starter` setup passed lint, type-check, and production
build in [PR #465](https://github.com/Create-Node-App/cna-templates/pull/465).

## Turbopack compatibility

The StyleX Babel plugin transforms StyleX code, and the PostCSS plugin extracts
the generated CSS. Next.js 16 and later Turbopack supports detected Babel
configurations and PostCSS plugins; use Webpack with earlier Next.js versions.
See the [Next.js Turbopack compatibility table](https://nextjs.org/docs/app/api-reference/turbopack#supported-features).
