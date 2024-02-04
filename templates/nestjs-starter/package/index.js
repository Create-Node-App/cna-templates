const dependencies = require('./dependencies');
const devDependencies = require('./devDependencies');

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageJson = {
    name: appName,
    version: '0.1.0',
    description: 'Nest TypeScript project created by create-awesome-node-app',
    scripts: {
      build: 'nest build',
      format: 'prettier -u --write .',
      start: 'nest start',
      dev: 'nest start --watch',
      'dev:debug': 'nest start --debug --watch',
      preview: 'node dist/main',
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
      'test:debug':
        'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
      'test:e2e': 'jest --config ./test/jest-e2e.json',
      'type-check': 'tsc --noEmit',
      compose: './docker/docker-compose.sh',
      'compose:up': './docker/docker-compose.sh up',
      'compose:up-d': './docker/docker-compose.sh up -d',
      'compose:down': './docker/docker-compose.sh down',
      'compose:down-v': './docker/docker-compose.sh down -v',
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
