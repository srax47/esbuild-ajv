import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ),
  eslintConfigPrettier,
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'no-multi-spaces': ['error'],
      'max-len': [
        'error',
        {
          code: 80,
          ignoreComments: true,
          ignoreTemplateLiterals: true,
          ignoreStrings: true,
        },
      ],
      complexity: [
        'error',
        {
          max: 60,
        },
      ],
      'dot-notation': 'off',
      'no-unused-vars': 'off',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      'eol-last': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    ignores: ['**/dist', 'node_modules', 'coverage'],
  },
]
