/**
 * Extension point for composable ESLint flat-config injection.
 *
 * Extensions contribute config blocks by shipping an
 * `eslint.extensions.mjs.append` file (see docs/AUTHORING.md). Entries are
 * appended after the base config, so extension rules refine rather than
 * replace the base setup.
 *
 * Empty by default: projects without extensions behave exactly as before.
 */
export const eslintExtensionConfigs = [];
