const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, command, srcDir }) {
  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    },
    scripts: {
      // prepare: "husky install",
      "build:dev": `webpack --env env=development`,
      "build:dev:analyze": `${command} build:dev --env addon=bundleanalyze`,
      "build:dev:visualize": `${command} build:dev --env addon=bundlevisualizer`,
      "build:dev:watch": `${command} build:dev --watch --hot`,
      build: `webpack --env env=production`,
      "build:analyze": `${command} build --env addon=bundleanalyze`,
      "build:visualize": `${command} build --env addon=bundlevisualizer`,
      "build:watch": `${command} build --watch`,
      lint: `prettier --ignore-path .eslintignore --check \"**/*.{js,jsx,json,css,sass,scss,less,html,md}\" && eslint ${srcDir}`,
      "lint:fix": `prettier --ignore-path .eslintignore --write \"**/*.{js,jsx,json,css,sass,scss,less,html,md}\" && eslint ${srcDir} --fix`,
      "serve:dev":
        "webpack-dev-server --mode development --open --env env=development",
      "serve:dev:dashboard":
        "webpack-dashboard webpack-dev-server -- --mode development --env addon=dashboard",
      start: `${command} serve:dev`,
      serve: `${command} build && serve -s -C build`,
      test: "jest --runInBand --detectOpenHandles --passWithNoTests",
      "test:watch":
        "jest -u --runInBand --verbose --watch --detectOpenHandles --passWithNoTests",
      "test:coverage":
        "jest -u --coverage --verbose --runInBand --detectOpenHandles --passWithNoTests",
    },
    husky: {
      hooks: {
        "pre-commit": "lint-staged",
      },
    },
    "lint-staged": {
      "*.{js,jsx}": ["prettier --write", "yarn lint:fix", "git add"],
      "*.{json,css,sass,scss,less,html,md}": ["prettier --write", "git add"],
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
