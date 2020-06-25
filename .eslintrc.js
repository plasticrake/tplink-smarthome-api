module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
  },
  env: {
    browser: false,
    commonjs: true,
    node: true,
  },
  reportUnusedDisableDirectives: true,

  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc'],
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@typescript-eslint/ban-ts-ignore': ['off'],
        'no-restricted-syntax': [
          'off',
          {
            selector: 'ForOfStatement',
          },
        ],
        'tsdoc/syntax': 'off', // 'warn',
      },
    },

    {
      files: ['*.js'],
      extends: ['airbnb-base', 'plugin:prettier/recommended'],
      rules: {
        'no-restricted-syntax': [
          'off',
          {
            selector: 'ForOfStatement',
          },
        ],
        'import/no-unresolved': 'off',
      },
    },

    {
      files: ['examples/*.js'],
      rules: {
        'no-console': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],
};
