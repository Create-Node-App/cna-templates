module.exports = function resolvePackage(setup) {
  const dependencies = {
    "@xstate/react": "^3.2.1",
    "xstate": "^4.37.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
