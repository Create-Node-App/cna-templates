module.exports = function resolvePackage(_setup, { appName, usePnpm, scope }) {
  // customOptions (e.g. scope) are passed on the second argument by CNA core,
  // not on the first mergedSetup object from template.json.
  // Non-interactive scaffolds do not always apply cna.config.json `initial`,
  // so default to `@app/` to match workspace package names.
  const packageScope =
    typeof scope === 'string' && scope.trim() !== '' ? scope : '@app/';
  const eslintConfigBaseName = `${packageScope}eslint-config-base`;
  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'turbo run dev',
      build: 'turbo run build',
      'build-storybook': 'turbo run build-storybook',
      changeset: 'changeset',
      format: 'prettier --ignore-path .gitignore -u --write .',
      lint: 'turbo run lint',
      'lint:fix': 'turbo run lint:fix',
      'publish-packages':
        'turbo run lint && changeset version && turbo run build && changeset publish',
      storybook: 'turbo run storybook',
      test: 'turbo run test',
      'type-check': 'turbo run type-check',
    },
    devDependencies: {
      '@changesets/cli': '^2.31.0',
      [eslintConfigBaseName]: '0.0.0',
      prettier: '^3.9.4',
      turbo: '^2.10.2',
    },
    packageManager: 'npm@10.9.0',
    dependencies: {
      tsup: '^6.2.3',
    },
    // Storybook 6 (playground) peers older React; keep workspace on React 18.
    overrides: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    engines: {
      node: '>=18.18.0',
    },
  };

  if (!usePnpm) {
    packageJson.workspaces = ['packages/*', 'apps/*'];
  }

  return packageJson;
};
