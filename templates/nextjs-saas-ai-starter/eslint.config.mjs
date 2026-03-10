import eslintPluginNext from '@next/eslint-plugin-next';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
// eslint-plugin-tailwindcss is disabled: not compatible with Tailwind v4 (resolveConfig removed).
// Class names in TSX are not linted until the plugin adds v4 support. Use bg-linear-to-* (v4) not bg-gradient-to-*.
import typescriptEslint from 'typescript-eslint';
import * as fs from 'fs';

const eslintIgnore = [
  '.git/',
  '.next/',
  'node_modules/',
  'dist/',
  'build/',
  'coverage/',
  'tools/',
  '.sst/',
  'sst-cron/',
  'storybook-static/',
  '*.min.js',
  '*.config.js',
  '*.d.ts',
  '.sst/',
  '.open-next/',
];

const config = typescriptEslint.config(
  {
    ignores: eslintIgnore,
  },
  typescriptEslint.configs.recommended,
  eslintPluginImport.flatConfigs.recommended,
  {
    plugins: {
      '@next/next': eslintPluginNext,
      'react-hooks': eslintPluginReactHooks,
      'jsx-a11y': eslintPluginJsxA11y,
    },
    rules: {
      ...eslintPluginNext.configs.recommended.rules,
      ...eslintPluginNext.configs['core-web-vitals'].rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginJsxA11y.configs.recommended.rules,
      // Accessibility rules configuration
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
      'import/order': [
        'warn',
        {
          groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
          pathGroups: [
            ...getDirectoriesToSort().map((singleDir) => ({
              pattern: `${singleDir}/**`,
              group: 'internal',
            })),
            {
              pattern: 'env',
              group: 'internal',
            },
            {
              pattern: 'theme',
              group: 'internal',
            },
            {
              pattern: 'public/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['internal'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
);

function getDirectoriesToSort() {
  const ignoredSortingDirectories = ['.git', '.next', '.vscode', 'node_modules'];
  return fs
    .readdirSync(process.cwd())
    .filter((file) => fs.statSync(process.cwd() + '/' + file).isDirectory())
    .filter((f) => !ignoredSortingDirectories.includes(f));
}

export default config;
