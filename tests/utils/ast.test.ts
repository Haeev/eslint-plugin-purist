import tsParser from '@typescript-eslint/parser'
import { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/utils'
import { describe, expect, it } from 'vitest'
import {
  countStatements,
  functionBodyUsesArguments,
  functionBodyUsesThis,
  isFunctionUsedBeforeDeclaration,
  isJsxComponentDeclaration,
} from '../../src/utils/ast.js'
import {
  findAvailableClassNameHelper,
  getBlockInnerText,
  getGuardReturnIndent,
  getStatementIndent,
} from '../../src/utils/scope.js'

const createSourceCode = (code: string) => {
  const parseResult = tsParser.parseForESLint(code, {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2022,
    sourceType: 'module',
  })

  return new TSESLint.SourceCode({
    text: code,
    ast: parseResult.ast,
    scopeManager: parseResult.scopeManager,
    parserServices: parseResult.services,
    visitorKeys: parseResult.visitorKeys as TSESLint.Parser.VisitorKeys,
  })
}

const parseFunction = (code: string) => {
  const sourceCode = createSourceCode(code)
  const functionNode = sourceCode.ast.body.find(
    (statement) => statement.type === 'FunctionDeclaration',
  )

  if (!functionNode || functionNode.type !== 'FunctionDeclaration') {
    throw new Error('Expected a function declaration in fixture')
  }

  return { functionNode, sourceCode }
}

describe('isFunctionUsedBeforeDeclaration', () => {
  it('returns false when the name only appears in a comment', () => {
    const { functionNode, sourceCode } = parseFunction('// foo reference\nfunction foo() {}')

    expect(isFunctionUsedBeforeDeclaration(functionNode, sourceCode)).toBe(false)
  })

  it('returns false when the name only appears in a string literal', () => {
    const { functionNode, sourceCode } = parseFunction('const label = "foo"\nfunction foo() {}')

    expect(isFunctionUsedBeforeDeclaration(functionNode, sourceCode)).toBe(false)
  })

  it('returns true when a real reference precedes the declaration', () => {
    const sourceCode = createSourceCode('function outer() { return inner() }\nfunction inner() {}')
    const innerNode = sourceCode.ast.body[1]

    if (innerNode?.type !== 'FunctionDeclaration') {
      throw new Error('Expected inner function declaration')
    }

    expect(isFunctionUsedBeforeDeclaration(innerNode, sourceCode)).toBe(true)
  })

  it('returns false for anonymous inner functions', () => {
    const sourceCode = createSourceCode('export default function() {}')
    const functionNode = sourceCode.ast.body[0]

    if (functionNode?.type !== 'ExportDefaultDeclaration') {
      throw new Error('Expected export default declaration')
    }

    if (functionNode.declaration.type !== 'FunctionDeclaration') {
      throw new Error('Expected function declaration')
    }

    expect(isFunctionUsedBeforeDeclaration(functionNode.declaration, sourceCode)).toBe(false)
  })
})

describe('functionBodyUsesThis', () => {
  it('returns true when this is used directly in the function body', () => {
    const { functionNode } = parseFunction('function usesThis() { return this.value }')

    expect(functionBodyUsesThis(functionNode)).toBe(true)
  })

  it('returns false when this only appears inside a nested non-arrow function', () => {
    const { functionNode } = parseFunction(
      'function outer() { const inner = function() { return this }; return inner }',
    )

    expect(functionBodyUsesThis(functionNode)).toBe(false)
  })
})

describe('functionBodyUsesArguments', () => {
  it('returns true when implicit arguments is used in the function body', () => {
    const { functionNode, sourceCode } = parseFunction(
      'function usesArgs() { return arguments[0] }',
    )

    expect(functionBodyUsesArguments(functionNode, sourceCode)).toBe(true)
  })

  it('returns false when arguments is shadowed by a parameter', () => {
    const { functionNode, sourceCode } = parseFunction(
      'function usesArgs(arguments) { return arguments[0] }',
    )

    expect(functionBodyUsesArguments(functionNode, sourceCode)).toBe(false)
  })

  it('returns false when arguments only appears inside a nested non-arrow function', () => {
    const { functionNode, sourceCode } = parseFunction(
      'function outer() { const inner = function() { return arguments[0] }; return inner }',
    )

    expect(functionBodyUsesArguments(functionNode, sourceCode)).toBe(false)
  })

  it('returns true when arguments is referenced from a nested arrow function', () => {
    const { functionNode, sourceCode } = parseFunction(
      'function outer() { const inner = () => arguments[0]; return inner }',
    )

    expect(functionBodyUsesArguments(functionNode, sourceCode)).toBe(true)
  })
})

describe('isJsxComponentDeclaration', () => {
  it('detects JSX returned from a PascalCase function', () => {
    const { functionNode } = parseFunction('function Button() { return <div /> }')

    expect(isJsxComponentDeclaration(functionNode)).toBe(true)
  })

  it('returns false when the component does not return JSX directly', () => {
    const { functionNode } = parseFunction(
      'function Button() { const view = <div />; return view }',
    )

    expect(isJsxComponentDeclaration(functionNode)).toBe(false)
  })
})

describe('countStatements', () => {
  it('returns the number of statements in a block', () => {
    const { functionNode } = parseFunction('function demo() { a(); b() }')

    if (!functionNode.body) {
      throw new Error('Expected function body')
    }

    expect(countStatements(functionNode.body)).toBe(2)
  })
})

describe('findAvailableClassNameHelper', () => {
  it('prefers clsx when configured and imported as default', () => {
    const sourceCode = createSourceCode('import clsx from "clsx"\n<div />')

    expect(findAvailableClassNameHelper(sourceCode, 'clsx')).toBe('clsx')
  })

  it('detects module-level const helpers', () => {
    const sourceCode = createSourceCode('const cn = () => null')

    expect(findAvailableClassNameHelper(sourceCode, 'cn')).toBe('cn')
  })

  it('detects module-level function helpers', () => {
    const sourceCode = createSourceCode('function cn() { return "" }')

    expect(findAvailableClassNameHelper(sourceCode, 'cn')).toBe('cn')
  })

  it('returns null when no helper is declared', () => {
    const sourceCode = createSourceCode('<div />')

    expect(findAvailableClassNameHelper(sourceCode, 'cn')).toBeNull()
  })
})

describe('guard clause text helpers', () => {
  it('extracts block inner text and indentation', () => {
    const code = 'const fn = () => { if (ready) { a(); b() } }'
    const sourceCode = createSourceCode(code)
    const ifStatement = sourceCode.ast.body[0]

    if (ifStatement?.type !== 'VariableDeclaration') {
      throw new Error('Expected variable declaration')
    }

    const init = ifStatement.declarations[0]?.init

    if (!init || init.type !== 'ArrowFunctionExpression' || init.body.type !== 'BlockStatement') {
      throw new Error('Expected arrow function body')
    }

    const onlyStatement = init.body.body[0]

    if (!onlyStatement || onlyStatement.type !== 'IfStatement') {
      throw new Error('Expected if statement')
    }

    if (onlyStatement.consequent.type !== 'BlockStatement') {
      throw new Error('Expected block consequent')
    }

    expect(getBlockInnerText(onlyStatement.consequent, sourceCode)).toBe(' a(); b() ')
    expect(getStatementIndent(onlyStatement, sourceCode).length).toBeGreaterThan(0)
    expect(getGuardReturnIndent(onlyStatement, sourceCode).length).toBeGreaterThan(0)
  })

  it('handles non-block consequents and empty loc nodes', () => {
    const sourceCode = createSourceCode('if (ready) return')
    const ifStatement = sourceCode.ast.body[0]

    if (!ifStatement || ifStatement.type !== 'IfStatement') {
      throw new Error('Expected if statement')
    }

    expect(getGuardReturnIndent(ifStatement, sourceCode)).toBe('  ')
    expect(
      getStatementIndent({ type: 'EmptyStatement' } as TSESTree.EmptyStatement, sourceCode),
    ).toBe('')

    const emptyFunction = createSourceCode('function demo() {}').ast.body[0]

    if (
      emptyFunction?.type !== 'FunctionDeclaration' ||
      emptyFunction.body.type !== 'BlockStatement'
    ) {
      throw new Error('Expected empty function body')
    }

    expect(getBlockInnerText(emptyFunction.body, createSourceCode('function demo() {}'))).toBe('')

    const multilineSource = createSourceCode('if (ready) {\n}')
    const emptyBlockIf = multilineSource.ast.body[0]

    if (!emptyBlockIf || emptyBlockIf.type !== 'IfStatement') {
      throw new Error('Expected if statement')
    }

    expect(getGuardReturnIndent(emptyBlockIf, multilineSource)).toBe('  ')
  })
})
