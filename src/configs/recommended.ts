import type { ESLint, Linter } from 'eslint'
import tsParser from '@typescript-eslint/parser'

const puristRules = {
  'purist/prefer-arrow-const': 'error',
  'purist/handler-names': 'error',
  'purist/no-classname-ternary': 'error',
  'purist/no-inline-styles': 'error',
  'purist/interactive-a11y': 'error',
  'purist/prefer-guard-clause': 'warn',
} as const

export const buildRecommended = (plugin: ESLint.Plugin): Linter.Config => ({
  name: 'purist/recommended',
  files: ['**/*.{ts,tsx}'],
  plugins: {
    purist: plugin,
  },
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  rules: {
    ...puristRules,
    'no-else-return': ['error', { allowElseIf: false }],
  },
})

export const buildCore = (plugin: ESLint.Plugin): Linter.Config => ({
  name: 'purist/core',
  plugins: {
    purist: plugin,
  },
  rules: {
    ...puristRules,
  },
})
