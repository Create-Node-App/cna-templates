# nextjs-stylex

Adds StyleX to Next.js App Router projects.

- Configures Babel, PostCSS, and ESLint flat config.
- Implements atomic CSS injection via `globals.css.append`.
- Works alongside existing Next.js setups.

## Turbopack and SWC limitation

**Important:** The official StyleX Next.js integration relies on `@stylexjs/babel-plugin`. 
Next.js will automatically opt out of the SWC compiler when it detects `babel.config.js`. 
Therefore, `next dev --turbo` will ignore the Babel configuration and StyleX will not compile during a Turbopack dev session. 
This is an accepted tradeoff as documented by the official StyleX Next.js setup guidelines.
