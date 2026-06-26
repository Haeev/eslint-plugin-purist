import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../../src/index.js'

const eslint = new ESLint({
  overrideConfigFile: true,
  baseConfig: [plugin.configs.recommended],
})

describe('integration', () => {
  it('lints fixture files through purist/recommended flat config', async () => {
    const results = await eslint.lintFiles(['tests/integration/fixture/**/*.tsx'])

    const messages = results.flatMap((file) => file.messages)
    const messageIds = messages.map((message) => message.ruleId).sort()

    expect(messageIds).toEqual([
      'purist/handler-names',
      'purist/interactive-a11y',
      'purist/interactive-a11y',
      'purist/no-classname-ternary',
      'purist/no-inline-styles',
      'purist/prefer-arrow-const',
      'purist/prefer-guard-clause',
    ])
  })
})

describe('purist/core config', () => {
  it('exposes only purist rules without parser defaults', () => {
    expect(plugin.configs.core.rules).toMatchObject({
      'purist/prefer-arrow-const': 'error',
      'purist/prefer-guard-clause': 'warn',
    })
    expect(plugin.configs.recommended.languageOptions?.parser).toBeDefined()
    expect(plugin.configs.core.languageOptions?.parser).toBeUndefined()
  })
})
