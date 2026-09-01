import astro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  ...astro.configs['flat/recommended'],
];
