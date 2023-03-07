module.exports = function resolvePackage(setup) {
  const dependencies = {
    recoil: "^0.7.7",
    "recoil-devtools": "^0.4.0",
    "recoil-devtools-dock": "^0.4.0",
    "recoil-devtools-log-monitor": "^0.4.0",
    "recoil-devtools-logger": "^0.4.0",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
