const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(_setup, { appName }) {
  return {
    name: appName,
    version: "0.1.0",
    private: true,
    type: "module",
    description: "Hono TypeScript API created by create-awesome-node-app",
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
      format: "prettier --ignore-path .gitignore --write .",
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      "type-check": "tsc --noEmit",
      test: "vitest run",
      "test:watch": "vitest",
    },
    dependencies,
    devDependencies,
  };
};
