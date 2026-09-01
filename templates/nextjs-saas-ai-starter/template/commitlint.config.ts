module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Header rules - more lenient
    'header-max-length': [2, 'always', 100], // Increased from default 72
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [0], // Disable case checking for subject
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    // Body rules - much more lenient
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [1, 'always', 200], // Warning only, increased from 72
    'body-max-length': [1, 'always', 1000], // Warning only, very lenient
    // Footer rules - lenient
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [1, 'always', 200], // Warning only
    'footer-max-length': [1, 'always', 500], // Warning only
  },
};
