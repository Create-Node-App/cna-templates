module.exports = function resolvePackage(setup, { appName, command, srcDir }) {
  const devDependencies = {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.3.0",
    "@types/jest": "^28.1.1",
    jest: "^28.1.1",
    "jest-environment-jsdom": "^28.1.1",
    "jest-transform-stub": "^2.0.0",
    "ts-jest": "^28.0.5",
  };

  const nextPackageJson = {
    ...packageJson,
    scripts: {
      ...packageJson.scripts,
      test: "jest --runInBand --detectOpenHandles --passWithNoTests",
      "test:watch":
        "jest -u --runInBand --verbose --watch --detectOpenHandles --passWithNoTests",
      "test:coverage":
        "jest -u --coverage --verbose --runInBand --detectOpenHandles --passWithNoTests",
    },
  };

  return {
    ...nextPackageJson,
    devDependencies: [...setup.devDependencies, ...devDependencies],
  };
};
