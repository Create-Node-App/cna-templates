module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    "node": true,
    "es6": true
  },
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    "@typescript-eslint"
  ],
  ignorePatterns: ['.eslintrc.js'],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    semi: [
      "error",
      "always"
    ],
    quotes: [
      "error",
      "single"
    ],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-ignore": "allow-with-description",
        "minimumDescriptionLength": 10
      }
    ],
    "@typescript-eslint/no-var-requires": "off"
  }
}
