module.exports = function resolvePackage(setup) {
  const dependencies = {
    i18next: "^21.8.9",
    "i18next-browser-languagedetector": "^6.1.4",
    "i18next-http-backend": "^1.4.1",
    "react-i18next": "^11.17.1",
  };

  return {
    ...setup,
    dependencies: { ...setup.dependencies, ...dependencies },
  };
};
