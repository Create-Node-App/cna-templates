const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageJson = {
    name: appName,
    version: "0.1.0",
    description: "A Web App created by create-awesome-node-app",
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
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      format: 'prettier -u --write .',
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      "type-check": "tsc --noEmit",
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
