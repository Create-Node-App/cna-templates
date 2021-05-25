module.exports = function resolvePackage(setup, { srcDir }) {
  const devDependencies = {
    "@babel/preset-typescript": "latest",
    "@types/jest": "latest",
    "@types/enzyme": "latest",
    "@types/enzyme-adapter-react-16": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/react-router": "latest",
    "@types/react-router-dom": "latest",
    "@types/react-test-renderer": "latest",
    "@typescript-eslint/eslint-plugin": "latest",
    "@typescript-eslint/parser": "latest",
    "awesome-typescript-loader": "latest",
    "ts-jest": "latest",
    typescript: "latest",
  };

  const packageJson = setup;

  // update formater for ts and tsx files
  packageJson.scripts.lint = `prettier --ignore-path .eslintignore --check \"**/*.{js,jsx,ts,tsx,json,css,sass,scss,less,html,md}\" && eslint ${srcDir}`;
  packageJson.scripts[
    "lint:fix"
  ] = `prettier --ignore-path .eslintignore --write \"**/*.{js,jsx,ts,tsx,json,css,sass,scss,less,html,md}\" && eslint ${srcDir} --fix`;

  // update pre-commit stage
  packageJson["lint-staged"] = {
    ...(packageJson["lint-staged"] || {}),
    "*.{ts,tsx}": ["prettier --write", "yarn lint:fix", "git add"],
  };

  return {
    ...setup,
    ...packageJson,
    devDependencies: { ...setup.devDependencies, ...devDependencies },
  };
};
