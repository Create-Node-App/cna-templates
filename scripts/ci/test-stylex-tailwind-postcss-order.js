#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repositoryRoot = path.join(__dirname, '..', '..');
const extensionFiles = {
  stylex: path.join(
    repositoryRoot,
    'extensions/nextjs-stylex/postcss.config.mjs.append',
  ),
  tailwind: path.join(
    repositoryRoot,
    'extensions/nextjs-tailwindcss/postcss.config.mjs.append',
  ),
};

const initialPlugins = {
  '@tailwindcss/postcss': { nesting: true },
  autoprefixer: { grid: true },
  customPlugin: { enabled: true },
};

for (const order of [
  ['stylex', 'tailwind'],
  ['tailwind', 'stylex'],
]) {
  const config = {
    plugins: structuredClone(initialPlugins),
  };

  for (const extension of order) {
    const source = fs.readFileSync(extensionFiles[extension], 'utf8');
    vm.runInNewContext(
      source,
      { config },
      { filename: extensionFiles[extension] },
    );
  }

  const pluginNames = Object.keys(config.plugins);
  assert.ok(
    pluginNames.indexOf('@stylexjs/postcss-plugin') <
      pluginNames.indexOf('@tailwindcss/postcss'),
    `${order.join(' then ')} must put StyleX before Tailwind`,
  );
  assert.ok(
    pluginNames.indexOf('@tailwindcss/postcss') <
      pluginNames.indexOf('autoprefixer'),
    `${order.join(' then ')} must put Tailwind before Autoprefixer`,
  );
  assert.deepEqual(config.plugins['@tailwindcss/postcss'], { nesting: true });
  assert.deepEqual(config.plugins.autoprefixer, { grid: true });
  assert.deepEqual(config.plugins.customPlugin, { enabled: true });
}

console.log(
  'StyleX and Tailwind PostCSS order is stable in both addon orders.',
);
