module.exports = function resolvePackage(setup) {
  const dependencies = {
    "@hookstate/core": "^4.0.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
