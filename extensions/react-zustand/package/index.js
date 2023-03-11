module.exports = function resolvePackage(setup) {
  const dependencies = {
    zustand: "^4.3.6",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
