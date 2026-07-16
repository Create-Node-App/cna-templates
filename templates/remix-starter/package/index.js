const dependencies = require('./dependencies');
const devDependencies = require('./devDependencies');

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageJson = {
    name: appName,
    version: '0.1.0',
    description: 'A React Router v7 application created by create-awesome-node-app',
    private: true,
    engines: {
      node: '>=22.14.0',
    },
    scripts: {
      dev: 'react-router dev',
      build: 'react-router build',
      start: 'react-router-serve ./build/server/index.js',
      format: 'prettier --ignore-path .gitignore --write .',
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      'type-check': 'react-router typegen && tsc --noEmit',
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
