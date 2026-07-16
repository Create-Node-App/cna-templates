const turboConfig = require('eslint-config-turbo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...turboConfig.default,
  {
    languageOptions: {
      globals: {
        browser: true,
        commonjs: true,
        node: true,
        es2020: true,
      },
    },
  },
  prettierConfig,
];
