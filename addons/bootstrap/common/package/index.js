module.exports = function resolvePackage(setup) {
  const dependencies = {
    "react-bootstrap": "latest",
    bootstrap: "latest",
  };

  return {
    ...setup,
    dependencies: {
      ...setup.dependencies,
      ...dependencies,
    },
  };
};
