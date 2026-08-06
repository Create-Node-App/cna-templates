const dependencies = require('./dependencies');
const devDependencies = require('./devDependencies');

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageJson = {
    name: appName,
    version: '0.1.0',
    description: 'An Astro site created by create-awesome-node-app',
    type: 'module',
    engines: {
      node: '>=22.22.0',
    },
    scripts: {
      dev: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      format: 'prettier --ignore-path .gitignore --write .',
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      'type-check': 'astro check',
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
