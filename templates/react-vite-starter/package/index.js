const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageJson = {
    name: appName,
    version: "0.1.0",
    description: "A web application starter template",
    private: true,
    engines: {
      node: ">=18.15",
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
      "prepare:git-hooks": "is-ci || husky install",
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      format:
        'prettier --write "**/*.{js,jsx,ts,tsx,json,css,sass,scss,less,html,md,yml,yaml}"',
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      start: `${runCommand} dev`,
      "lint-staged": "lint-staged",
      typecheck: "tsc --noEmit",
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
