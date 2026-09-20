import type { Plugin } from 'vite';

/**
 * Extension point for composable Vite plugin injection.
 *
 * Extensions contribute plugins by shipping a `vite.extensions.ts.append`
 * file (see docs/AUTHORING.md). Entries run before the base plugins —
 * notably before `@vitejs/plugin-react`, which plugins like StyleX
 * require to preserve Fast Refresh.
 *
 * Empty by default: projects without extensions behave exactly as before.
 */
export const viteExtensionPlugins: Plugin[] = [];
