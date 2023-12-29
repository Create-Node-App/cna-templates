module.exports = function resolvePackage(setup, { appName, usePnpm }) {
  const packageJson = {
    "name": appName,
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "build": "turbo run build",
      "build-storybook": "turbo run build-storybook",
      "changeset": "changeset",
      "format": "prettier --write .",
      "lint": "turbo run lint",
      "lint:fix": "turbo run lint:fix",
      "publish-packages": "turbo run lint && changeset version && turbo run build && changeset publish",
      "storybook": "turbo run storybook",
      "test": "turbo run test",
      "type-check": "turbo run type-check"
    },
    "devDependencies": {
      "@changesets/cli": "^2.25.0",
      "eslint-config-base": "*",
      "prettier": "^2.7.1",
      "turbo": "^1.5.5"
    },
    "dependencies": {
      "tsup": "^6.2.3"
    },
    "engines": {
      "node": ">=16.16.0"
    }
  };

  if (!usePnpm) {
    packageJson.workspaces = ['packages/*', 'apps/*'];
  }

  return packageJson;
};
