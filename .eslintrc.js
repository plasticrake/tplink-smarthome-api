module.exports = {
  env: {
    browser: false,
    commonjs: true,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['examples/*.js'],
      rules: {
        'no-console': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
  },
  reportUnusedDisableDirectives: true,
  rules: {
    'no-restricted-syntax': [
      'off',
      {
        selector: 'ForOfStatement',
      },
    ],
  },
};
