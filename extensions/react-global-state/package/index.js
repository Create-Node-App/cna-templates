module.exports = function resolvePackage(setup) {
  const dependencies = {
    "react-hooks-global-state": "^2.1.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
