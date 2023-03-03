module.exports = function resolvePackage(setup) {
  const dependencies = {
    "semantic-ui-less": "latest",
    "semantic-ui-react": "latest",
  };

  const devDependencies = {
    less: "2.7.3",
    "less-loader": "^5.0.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
    devDependencies: {
      ...setup.devDependencies,
      ...devDependencies,
    },
  };
};
