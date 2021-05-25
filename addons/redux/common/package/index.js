module.exports = function resolvePackage(setup) {
  const dependencies = {
    "connected-react-router": "latest",
    history: "4.7.2",
    "react-redux": "latest",
    redux: "latest",
    "redux-logger": "latest",
    "redux-persist": "latest",
    "redux-thunk": "latest",
  };

  const devDependencies = {
    "redux-mock-store": "latest",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
    devDependencies: { ...setup.devDependencies, ...devDependencies },
  };
};
