module.exports = function resolvePackage(setup) {
  const dependencies = {
    "@material-ui/core": "latest",
    "@material-ui/icons": "latest",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
