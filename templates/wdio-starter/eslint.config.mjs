import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules', 'tools', 'reports', 'allure-results', 'allure-report', 'docs', '.vscode', 'wdio.conf.js'],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description', minimumDescriptionLength: 10 }],
    },
  },
);
