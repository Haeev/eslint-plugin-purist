import type { TSESLint, TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'
import {
  functionBodyUsesArguments,
  functionBodyUsesThis,
  isFunctionUsedBeforeDeclaration,
  isJsxComponentDeclaration,
} from '../utils/ast.js'

type Options = [
  {
    allowNamedExports?: boolean
    ignoreJsxComponents?: boolean
  },
]

type MessageIds = 'preferArrowConst'

const defaultOptions: Options[0] = {
  allowNamedExports: false,
  ignoreJsxComponents: false,
}

const buildArrowFunction = (
  node: TSESTree.FunctionDeclaration,
  sourceCode: TSESLint.SourceCode,
): string => {
  const asyncPrefix = node.async ? 'async ' : ''
  const params =
    node.params.length === 0
      ? '()'
      : node.params.length === 1 && node.params[0]!.type !== 'RestElement'
        ? sourceCode.getText(node.params[0]!)
        : `(${node.params.map((param) => sourceCode.getText(param)).join(', ')})`
  const body = sourceCode.getText(node.body)
  const name = node.id!.name

  return `const ${name} = ${asyncPrefix}${params} => ${body}`
}

export const preferArrowConst = createRule<Options, MessageIds>({
  name: 'prefer-arrow-const',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer const arrow functions over function declarations',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowNamedExports: { type: 'boolean' },
          ignoreJsxComponents: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferArrowConst: 'Use a const arrow function instead of a function declaration.',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const mergedOptions = { ...defaultOptions, ...options }

    const canFix = (node: TSESTree.FunctionDeclaration): boolean => {
      if (!node.id) {
        return false
      }

      if (node.generator) {
        return false
      }

      if (node.id?.typeAnnotation || node.returnType || node.typeParameters) {
        return false
      }

      if (functionBodyUsesThis(node) || functionBodyUsesArguments(node)) {
        return false
      }

      if (isFunctionUsedBeforeDeclaration(node, context.sourceCode)) {
        return false
      }

      const parent = node.parent

      if (parent?.type === 'ExportDefaultDeclaration') {
        return false
      }

      if (parent?.type === 'ExportNamedDeclaration' && !mergedOptions.allowNamedExports) {
        return false
      }

      return true
    }

    const shouldSkip = (node: TSESTree.FunctionDeclaration): boolean => {
      if (mergedOptions.ignoreJsxComponents && isJsxComponentDeclaration(node)) {
        return true
      }

      const parent = node.parent

      if (parent?.type === 'ExportNamedDeclaration' && mergedOptions.allowNamedExports) {
        return true
      }

      return false
    }

    return {
      FunctionDeclaration(node) {
        if (shouldSkip(node)) {
          return
        }

        context.report({
          node,
          messageId: 'preferArrowConst',
          fix: canFix(node)
            ? (fixer) => fixer.replaceText(node, buildArrowFunction(node, context.sourceCode))
            : undefined,
        })
      },
    }
  },
})
