import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const CLASSNAME_HELPERS = ['cn', 'clsx'] as const

export type ClassNameHelperName = (typeof CLASSNAME_HELPERS)[number]

const isResolvableHelperBinding = (variable: TSESLint.Scope.Variable): boolean => {
  return variable.defs.some((def) => {
    return def.type === 'ImportBinding' || def.type === 'Variable' || def.type === 'FunctionName'
  })
}

const getModuleLikeScope = (sourceCode: TSESLint.SourceCode): TSESLint.Scope.Scope | null => {
  const scopes = sourceCode.scopeManager?.scopes

  if (!scopes) {
    return null
  }

  return (
    scopes.find((scope) => scope.type === 'module') ??
    scopes.find((scope) => scope.type === 'global') ??
    null
  )
}

const isHelperDeclaredInProgram = (
  sourceCode: TSESLint.SourceCode,
  helperName: ClassNameHelperName,
): boolean => {
  for (const statement of sourceCode.ast.body) {
    if (statement.type === 'ImportDeclaration') {
      for (const specifier of statement.specifiers) {
        if ('local' in specifier && specifier.local.name === helperName) {
          return true
        }
      }
    }

    if (statement.type === 'VariableDeclaration') {
      for (const declaration of statement.declarations) {
        if (declaration.id.type === 'Identifier' && declaration.id.name === helperName) {
          return true
        }
      }
    }

    if (statement.type === 'FunctionDeclaration' && statement.id?.name === helperName) {
      return true
    }
  }

  return false
}

export const findAvailableClassNameHelper = (
  sourceCode: TSESLint.SourceCode,
  preferred: ClassNameHelperName,
): ClassNameHelperName | null => {
  const preference = preferred === 'cn' ? CLASSNAME_HELPERS : (['clsx', 'cn'] as const)

  for (const helperName of preference) {
    const moduleScope = getModuleLikeScope(sourceCode)
    const scopedVariable = moduleScope?.set.get(helperName)

    if (scopedVariable && isResolvableHelperBinding(scopedVariable)) {
      return helperName
    }

    if (isHelperDeclaredInProgram(sourceCode, helperName)) {
      return helperName
    }
  }

  return null
}

export const getBlockInnerText = (
  block: TSESTree.BlockStatement,
  sourceCode: TSESLint.SourceCode,
): string => {
  const openBrace = sourceCode.getFirstToken(block, (token) => token.value === '{')
  const closeBrace = sourceCode.getLastToken(block, (token) => token.value === '}')

  if (!openBrace?.range || !closeBrace?.range) {
    return ''
  }

  return sourceCode.getText().slice(openBrace.range[1], closeBrace.range[0])
}

export const getStatementIndent = (
  statement: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): string => {
  if (!statement.loc) {
    return ''
  }

  return ' '.repeat(statement.loc.start.column)
}

export const getGuardReturnIndent = (
  ifStatement: TSESTree.IfStatement,
  sourceCode: TSESLint.SourceCode,
): string => {
  if (ifStatement.consequent.type !== 'BlockStatement') {
    return `${getStatementIndent(ifStatement, sourceCode)}  `
  }

  const consequentBlock = ifStatement.consequent
  const isSingleLineBlock = consequentBlock.loc!.start.line === consequentBlock.loc!.end.line

  if (isSingleLineBlock) {
    return `${getStatementIndent(ifStatement, sourceCode)}  `
  }

  const firstStatement = consequentBlock.body[0]

  if (firstStatement) {
    return getStatementIndent(firstStatement, sourceCode)
  }

  return `${getStatementIndent(ifStatement, sourceCode)}  `
}
