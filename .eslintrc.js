module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2022,
    project: ['./tsconfig.json'],
  },
  env: {
    browser: false,
    commonjs: true,
    node: true,
  },
  reportUnusedDisableDirectives: true,

  ignorePatterns: ['docs'],

  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': 'allow-with-description',
            'ts-nocheck': 'allow-with-description',
            'ts-check': 'allow-with-description',
          },
        ],
        '@typescript-no-unsafe-assignment': 'off',
        'no-restricted-syntax': [
          'off',
          {
            selector: 'ForOfStatement',
          },
        ],
        'no-void': 'off',
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
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
      },
    },

    {
      files: ['examples/*.js', 'examples/*.ts'],
      rules: {
        'no-console': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],
};
