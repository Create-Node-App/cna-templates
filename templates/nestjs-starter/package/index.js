const dependencies = require('./dependencies');
const devDependencies = require('./devDependencies');

module.exports = function resolvePackage(setup, { appName, runCommand }) {
  const packageJson = {
    name: appName,
    private: true,
    version: '1.0.0',
    description: 'Nest TypeScript starter repository',
    license: 'MIT',
    scripts: {
      build: 'nest build',
      format: 'prettier --write "**/*.{js,ts,md,json,yml,yaml}"',
      start: 'nest start',
      dev: 'nest start --watch',
      'dev:debug': 'nest start --debug --watch',
      'preview': 'node dist/main',
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
      'test:debug':
        'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
      'test:e2e': 'jest --config ./test/jest-e2e.json',
    },
    jest: {
      moduleFileExtensions: ['js', 'json', 'ts'],
      rootDir: 'src',
      testRegex: '.*\\.spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: ['**/*.(t|j)s'],
      coverageDirectory: '../coverage',
      testEnvironment: 'node',
    },
  };

  return { ...packageJson, dependencies, devDependencies };
};
