export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['repo', 'web', 'api', 'db', 'contracts', 'config', 'e2e', 'deploy', 'docs', 'deps'],
    ],
  },
};
