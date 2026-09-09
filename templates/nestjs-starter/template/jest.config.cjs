module.exports = {
  // ESM mode: @nestjs/* v12 ships ECMAScript modules only (see migration
  // notes in docs). Run jest with NODE_OPTIONS=--experimental-vm-modules
  // (wired into the npm test scripts).
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { useESM: true }],
  },
  // Map ESM-style `.js` relative imports back to TypeScript sources.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
