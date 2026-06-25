import { describe, expect, it } from 'vitest'
import { escapeRegExp } from '../../src/utils/ast.js'

describe('escapeRegExp', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegExp('$foo.bar')).toBe('\\$foo\\.bar')
  })
})
