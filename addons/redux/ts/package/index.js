module.exports = function resolvePackage(setup) {
  const devDependencies = {
    "@types/redux-logger": "latest",
    "@types/react-redux": "latest",
  };

  return {
    ...setup,
    devDependencies: { ...setup.devDependencies, ...devDependencies },
  };
};
