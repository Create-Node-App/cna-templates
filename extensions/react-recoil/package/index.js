module.exports = function resolvePackage(setup) {
  const dependencies = {
    recoil: "latest",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
