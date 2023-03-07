module.exports = function resolvePackage(setup) {
  const dependencies = {
    "@material-ui/core": "^4.12.4",
    "@material-ui/icons": "^4.11.3",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
