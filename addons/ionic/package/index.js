module.exports = function resolvePackage(setup) {
  const dependencies = {
    "@ionic/react": "latest",
    "@ionic/react-router": "latest",
  };

  const devDependencies = {
    "@capacitor/android": "latest",
    "@capacitor/cli": "latest",
    "@capacitor/core": "latest",
    "@ionic/cli": "latest",
  };

  const packageJson = setup;
  packageJson.scripts["prepare:android"] =
    "ionic cap add android && ionic cap copy android";

  return {
    ...packageJson,
    dependencies: { ...setup.dependencies, ...dependencies },
    devDependencies: { ...setup.devDependencies, ...devDependencies },
  };
};
