module.exports = function resolvePackage(setup) {
  const dependencies = {
    "@risingstack/react-easy-state": "^6.3.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
