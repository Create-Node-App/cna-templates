module.exports = function resolvePackage(setup) {
  const { "redux-thunk": _, ...dependencies } = setup.dependencies;

  return {
    ...setup,
    dependencies: {
      ...dependencies,
      "redux-saga": "latest",
    },
  };
};
