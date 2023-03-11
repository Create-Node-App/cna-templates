module.exports = function resolvePackage(setup) {
  const dependencies = {
    mobx: "^6.8.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
