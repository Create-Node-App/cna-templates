module.exports = function resolvePackage(setup) {
  const dependencies = {
    i18next: "latest",
    "i18next-browser-languagedetector": "latest",
    "i18next-http-backend": "latest",
    "react-i18next": "latest",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
