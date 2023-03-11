module.exports = function resolvePackage(setup) {
  const dependencies = {
    teaful: "^0.11.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
