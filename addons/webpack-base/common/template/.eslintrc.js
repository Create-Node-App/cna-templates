const path = require('path');

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es2020: true
    'jest/globals': true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, 'config', 'webpack.common.js'),
      },
    },
  },
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['react', 'jsx-a11y', 'import', 'jest'],
};
