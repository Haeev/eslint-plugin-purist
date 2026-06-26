import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const isFunctionBoundary = (node: TSESTree.Node): boolean => {
  return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression'
}

const walkStoppingAtFunctionBoundaries = (
  root: TSESTree.Node,
  visitor: (node: TSESTree.Node) => boolean,
): boolean => {
  if (visitor(root)) {
    return true
  }

  for (const key of Object.keys(root) as Array<keyof TSESTree.Node>) {
    if (key === 'parent' || key === 'range' || key === 'loc') {
      continue
    }

    const value = root[key]

    if (!value) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item || typeof item !== 'object' || !('type' in item)) {
          continue
        }

        const child = item as TSESTree.Node

        if (isFunctionBoundary(child)) {
          continue
        }

        if (walkStoppingAtFunctionBoundaries(child, visitor)) {
          return true
        }
      }

      continue
    }

    if (typeof value === 'object' && 'type' in value) {
      const child = value as TSESTree.Node

      if (isFunctionBoundary(child)) {
        continue
      }

      if (walkStoppingAtFunctionBoundaries(child, visitor)) {
        return true
      }
    }
  }

  return false
}

const findVariableInScopes = (
  name: string,
  startScope: TSESLint.Scope.Scope,
): TSESLint.Scope.Variable | undefined => {
  let scope: TSESLint.Scope.Scope | null = startScope

  while (scope) {
    const variable = scope.set.get(name)

    if (variable) {
      return variable
    }

    scope = scope.upper
  }

  return undefined
}

const getFunctionScope = (
  node: TSESTree.FunctionDeclaration,
  sourceCode: TSESLint.SourceCode,
): TSESLint.Scope.Scope | null => {
  let scope: TSESLint.Scope.Scope | null = sourceCode.getScope(node)

  while (scope) {
    if (scope.type === 'function') {
      return scope
    }

    scope = scope.upper
  }

  return null
}

const isReferenceBeforeNode = (
  reference: TSESLint.Scope.Reference,
  declarationNode: TSESTree.FunctionDeclaration,
): boolean => {
  if (reference.identifier === declarationNode.id) {
    return false
  }

  return reference.identifier.range[0] < declarationNode.range[0]
}

export const isFunctionUsedBeforeDeclaration = (
  node: TSESTree.FunctionDeclaration,
  sourceCode: TSESLint.SourceCode,
): boolean => {
  if (!node.id) {
    return false
  }

  const variable = findVariableInScopes(node.id.name, sourceCode.getScope(node))

  if (!variable) {
    return false
  }

  return variable.references.some((reference) => isReferenceBeforeNode(reference, node))
}

// Non-arrow functions create their own `this` binding. Arrow functions inherit it lexically,
// so we traverse into arrows but stop at function declaration/expression boundaries.
export const functionBodyUsesThis = (node: TSESTree.FunctionDeclaration): boolean => {
  if (!node.body) {
    return false
  }

  return walkStoppingAtFunctionBoundaries(node.body, (current) => current.type === 'ThisExpression')
}

const isRangeWithin = (
  inner: readonly [number, number],
  outer: readonly [number, number],
): boolean => {
  return inner[0] >= outer[0] && inner[1] <= outer[1]
}

const collectNestedNonArrowFunctionBodies = (
  functionBody: TSESTree.BlockStatement,
): TSESTree.BlockStatement[] => {
  const nestedBodies: TSESTree.BlockStatement[] = []

  const collectFromNode = (node: TSESTree.Node): void => {
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
      if (node.body.type === 'BlockStatement') {
        nestedBodies.push(node.body)
      }

      return
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
            collectFromNode(item as TSESTree.Node)
          }
        }

        continue
      }

      if (typeof value === 'object' && 'type' in value) {
        collectFromNode(value as TSESTree.Node)
      }
    }
  }

  for (const statement of functionBody.body) {
    collectFromNode(statement)
  }

  return nestedBodies
}

const isReferenceInDirectFunctionBody = (
  identifier: TSESTree.Identifier,
  functionBody: TSESTree.BlockStatement,
): boolean => {
  if (!identifier.range || !functionBody.range) {
    return false
  }

  if (!isRangeWithin(identifier.range, functionBody.range)) {
    return false
  }

  return !collectNestedNonArrowFunctionBodies(functionBody).some(
    (nestedBody) => nestedBody.range && isRangeWithin(identifier.range!, nestedBody.range),
  )
}

export const functionBodyUsesArguments = (
  node: TSESTree.FunctionDeclaration,
  sourceCode: TSESLint.SourceCode,
): boolean => {
  if (!node.body) {
    return false
  }

  const functionScope = getFunctionScope(node, sourceCode)

  if (!functionScope) {
    return false
  }

  const argumentsVariable = functionScope.set.get('arguments')

  if (!argumentsVariable) {
    return false
  }

  if (argumentsVariable.defs.some((def) => def.type === 'Parameter')) {
    return false
  }

  return argumentsVariable.references.some((reference) => {
    if (reference.identifier.type !== 'Identifier') {
      return false
    }

    return isReferenceInDirectFunctionBody(reference.identifier, node.body!)
  })
}

export const isJsxComponentDeclaration = (node: TSESTree.FunctionDeclaration): boolean => {
  if (!node.id || !/^[A-Z]/.test(node.id.name) || !node.body) {
    return false
  }

  return node.body.body.some((statement) => {
    if (statement.type !== 'ReturnStatement' || !statement.argument) {
      return false
    }

    return statement.argument.type === 'JSXElement' || statement.argument.type === 'JSXFragment'
  })
}

export const countStatements = (body: TSESTree.BlockStatement): number => {
  return body.body.length
}
