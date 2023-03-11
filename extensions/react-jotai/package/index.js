module.exports = function resolvePackage(setup) {
  const dependencies = {
    jotai: "^2.0.3",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
