const baseConfig = require('eslint-config-base');
const tseslint = require('typescript-eslint');

module.exports = [
  ...baseConfig,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description', minimumDescriptionLength: 10 }],
    },
  },
];
