module.exports = {
  root: true,
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es2020: true,
  },
  plugins: ['import'],
  ignorePatterns: ['.eslintrc.js'],
};
