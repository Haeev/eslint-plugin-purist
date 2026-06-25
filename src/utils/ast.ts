import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const visitNode = (node: TSESTree.Node, visitor: (node: TSESTree.Node) => boolean): boolean => {
  if (visitor(node)) {
    return true
  }

  for (const key of Object.keys(node) as Array<keyof TSESTree.Node>) {
    if (key === 'parent' || key === 'range' || key === 'loc') {
      continue
    }

    const value = node[key]

    if (!value) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && 'type' in item) {
          if (visitNode(item as TSESTree.Node, visitor)) {
            return true
          }
        }
      }

      continue
    }

    if (typeof value === 'object' && 'type' in value) {
      if (visitNode(value as TSESTree.Node, visitor)) {
        return true
      }
    }
  }

  return false
}

export const isFunctionUsedBeforeDeclaration = (
  node: TSESTree.FunctionDeclaration,
  sourceCode: TSESLint.SourceCode,
): boolean => {
  if (!node.id) {
    return false
  }

  const { name } = node.id
  const textBeforeDeclaration = sourceCode.getText().slice(0, node.range[0])
  const namePattern = new RegExp(`\\b${name}\\b`)

  return namePattern.test(textBeforeDeclaration)
}

export const functionBodyUsesThis = (node: TSESTree.FunctionDeclaration): boolean => {
  if (!node.body) {
    return false
  }

  return visitNode(node.body, (current) => current.type === 'ThisExpression')
}

export const functionBodyUsesArguments = (node: TSESTree.FunctionDeclaration): boolean => {
  if (!node.body) {
    return false
  }

  return visitNode(
    node.body,
    (current) => current.type === 'Identifier' && current.name === 'arguments',
  )
}

export const isJsxComponentDeclaration = (node: TSESTree.FunctionDeclaration): boolean => {
  if (!node.id || !/^[A-Z]/.test(node.id.name)) {
    return false
  }

  if (!node.body) {
    return false
  }

  return visitNode(
    node.body,
    (current) => current.type === 'JSXElement' || current.type === 'JSXFragment',
  )
}

export const countStatements = (body: TSESTree.BlockStatement): number => {
  return body.body.length
}
