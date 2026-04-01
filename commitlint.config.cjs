// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'ci', 'perf', 'build'],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-case': [0],
    // scope is required
    'scope-empty': [2, 'never'],
    // body is required
    'body-empty': [2, 'never'],
    // BREAKING CHANGE footer allowed; co-author footer is intercepted by a separate script (see lefthook.yml)
  },
};
