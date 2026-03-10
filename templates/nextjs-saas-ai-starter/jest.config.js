/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  // The test environment that will be used for testing, jsdom for browser environment
  // https://jestjs.io/docs/configuration#testenvironment-string
  testEnvironment: 'jsdom',

  // A list of paths to directories that Jest should use to search for files in
  // https://jestjs.io/docs/configuration#roots-arraystring
  roots: ['<rootDir>/src/'],

  // The glob patterns Jest uses to detect test files.
  // https://jestjs.io/docs/configuration#testmatch-arraystring
  testMatch: ['**/*.(test|spec).ts?(x)'],

  // Jest transformations
  // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed
  // https://jestjs.io/docs/configuration#setupfilesafterenv-array
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],

  // Code coverage config
  // https://jestjs.io/docs/configuration#collectcoveragefrom-array
  coverageDirectory: '<rootDir>/coverage/',
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!**/__mocks__/**', '!**/node_modules/**', '!**/*.d.ts'],

  // Coverage thresholds - Goal: 100%
  // These are set to current levels to prevent regression while we work toward 100%
  // Increase thresholds as coverage improves
  coverageThreshold: {
    global: {
      branches: 6,
      functions: 7,
      lines: 12,
      statements: 12,
    },
  },

  // Important: order matters, specific rules should be defined first
  // https://jestjs.io/fr/docs/configuration#modulenamemapper-objectstring-string--arraystring
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    '^.+\\.module\\.(css|sass|scss|less)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss|less)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle static assets
    // https://jestjs.io/docs/webpack#handling-static-assets
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg|ttf|woff|woff2)$': `<rootDir>/__mocks__/fileMock.js`,

    // Handle TypeScript path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform ESM modules from node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(next-intl|use-intl|next-themes|next-auth|@auth|@heroicons|lucide-react|drizzle-orm)/)',
  ],

  verbose: true,
  testTimeout: 30000,
};
