module.exports = function resolvePackage(setup) {
  const dependencies = {
    antd: "latest",
    "@ant-design/icons": "latest",
  };

  return {
    ...setup,
    dependencies: {
      ...setup.dependencies,
      ...dependencies,
    },
  };
};
