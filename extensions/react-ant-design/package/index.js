module.exports = function resolvePackage(setup) {
  const dependencies = {
    antd: "^5.3.0",
    "@ant-design/icons": "^5.0.1",
  };

  return {
    ...setup,
    dependencies: {
      ...setup.dependencies,
      ...dependencies,
    },
  };
};
