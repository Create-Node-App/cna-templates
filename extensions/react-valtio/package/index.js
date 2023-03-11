module.exports = function resolvePackage(setup) {
  const dependencies = {
    valtio: "^1.10.3",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
