const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, command, srcDir }) {
  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
    engines: {
      node: ">=16.13",
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
    scripts: {
      // prepare: "is-ci || husky install",
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      format:
        'prettier --write "**/*.{js,jsx,ts,tsx,json,css,sass,scss,less,html,md,yml,yaml}"',
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      start: `${command} dev`,
      test: "jest --runInBand --detectOpenHandles --passWithNoTests",
      "test:watch":
        "jest -u --runInBand --verbose --watch --detectOpenHandles --passWithNoTests",
      "test:coverage":
        "jest -u --coverage --verbose --runInBand --detectOpenHandles --passWithNoTests",
      "lint-staged": "lint-staged",
      typecheck: "tsc --noEmit",
    },
    "lint-staged": {
      "*.{js,jsx}": ["prettier --write", "npm run lint:fix"],
      "*.{json,css,sass,scss,less,html,md,yml,yaml}": ["prettier --write"],
      "*.{ts,tsx}": ["prettier --write", "npm run lint:fix"],
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
