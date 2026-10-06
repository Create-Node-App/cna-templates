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

The StyleX PostCSS plugin is prepended before the existing PostCSS plugins, so
it processes StyleX output before Tailwind and Autoprefixer. Keep both
extensions' configuration contributions in place; do not replace the generated
PostCSS config. The combined `nextjs-saas-ai-starter` setup passed lint,
type-check, and production build in [PR #465](https://github.com/Create-Node-App/cna-templates/pull/465).

## Turbopack and SWC limitation

**Important:** The official StyleX Next.js integration relies on `@stylexjs/babel-plugin`. 
Next.js will automatically opt out of the SWC compiler when it detects `babel.config.js`. 
Therefore, `next dev --turbo` will ignore the Babel configuration and StyleX will not compile during a Turbopack dev session. 
This is an accepted tradeoff as documented by the official StyleX Next.js setup guidelines.
