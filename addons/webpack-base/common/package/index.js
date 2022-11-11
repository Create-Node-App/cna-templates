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
      prepare: "is-ci || husky install",
      "build:dev": `NODE_ENV=development webpack`,
      "build:dev:analyze": `${command} build:dev --env addon=bundleanalyze`,
      "build:dev:visualize": `${command} build:dev --env addon=bundlevisualizer`,
      "build:dev:watch": `${command} build:dev --watch --hot`,
      build: `NODE_ENV=production webpack`,
      "build:analyze": `${command} build --env addon=bundleanalyze`,
      "build:visualize": `${command} build --env addon=bundlevisualizer`,
      "build:watch": `${command} build --watch`,
      lint: `prettier --ignore-path .eslintignore --check \"**/*.{js,jsx,json,css,sass,scss,less,html,md}\" && eslint ${srcDir}`,
      "lint:fix": `prettier --ignore-path .eslintignore --write \"**/*.{js,jsx,json,css,sass,scss,less,html,md}\" && eslint ${srcDir} --fix`,
      "lint-staged": "lint-staged",
      "serve:dev":
        "NODE_ENV=development webpack-dev-server --mode development",
      "serve:dev:dashboard":
        "NODE_ENV=development webpack-dashboard webpack-dev-server -- --mode development --env addon=dashboard",
      start: `${command} serve:dev`,
      serve: `${command} build && serve -s -C build`,
      test: "jest --runInBand --detectOpenHandles --passWithNoTests",
      "test:watch":
        "jest -u --runInBand --verbose --watch --detectOpenHandles --passWithNoTests",
      "test:coverage":
        "jest -u --coverage --verbose --runInBand --detectOpenHandles --passWithNoTests",
    },
    "lint-staged": {
      "*.{js,jsx}": ["prettier --write", "yarn lint:fix", "git add"],
      "*.{json,css,sass,scss,less,html,md}": ["prettier --write", "git add"],
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
