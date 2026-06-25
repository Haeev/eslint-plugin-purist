import * as vitest from 'vitest'
import { RuleTester } from '@typescript-eslint/rule-tester'
import tsParser from '@typescript-eslint/parser'

RuleTester.afterAll = vitest.afterAll
RuleTester.describe = vitest.describe
RuleTester.it = vitest.it
RuleTester.itOnly = vitest.it.only

export const ruleTester = new RuleTester({
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
})
