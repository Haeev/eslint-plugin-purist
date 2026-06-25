import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'
import { countStatements } from '../utils/ast.js'

type Options = [
  {
    minBodyStatements?: number
  },
]

type MessageIds = 'preferGuardClause'

const defaultOptions: Options[0] = {
  minBodyStatements: 3,
}

const getFunctionBody = (
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression,
): TSESTree.BlockStatement | null => {
  if (node.body?.type === 'BlockStatement') {
    return node.body
  }

  return null
}

const hasBlockScopedBindings = (block: TSESTree.BlockStatement): boolean => {
  return block.body.some((statement) => {
    if (statement.type === 'VariableDeclaration') {
      return statement.kind === 'const' || statement.kind === 'let'
    }

    if (statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') {
      return true
    }

    return false
  })
}

export const preferGuardClause = createRule<Options, MessageIds>({
  name: 'prefer-guard-clause',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer early returns over wrapping function bodies in a single if block',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          minBodyStatements: { type: 'number', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferGuardClause:
        'Prefer an early return guard clause instead of wrapping the function body in an if block.',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const mergedOptions = { ...defaultOptions, ...options }
    const minStatements = mergedOptions.minBodyStatements!

    const checkBody = (body: TSESTree.BlockStatement) => {
      if (body.body.length !== 1) {
        return
      }

      const onlyStatement = body.body[0]

      if (!onlyStatement || onlyStatement.type !== 'IfStatement' || onlyStatement.alternate) {
        return
      }

      if (onlyStatement.consequent.type !== 'BlockStatement') {
        return
      }

      const consequentBlock = onlyStatement.consequent

      if (hasBlockScopedBindings(consequentBlock)) {
        return
      }

      if (countStatements(consequentBlock) < minStatements) {
        return
      }

      context.report({
        node: onlyStatement,
        messageId: 'preferGuardClause',
        suggest: [
          {
            messageId: 'preferGuardClause',
            fix(fixer) {
              const sourceCode = context.sourceCode
              const test = sourceCode.getText(onlyStatement.test)
              const innerStatements = consequentBlock.body
                .map((statement: TSESTree.Statement) => sourceCode.getText(statement))
                .join('\n')

              return fixer.replaceText(
                onlyStatement,
                `if (!(${test})) {\n  return\n}\n${innerStatements}`,
              )
            },
          },
        ],
      })
    }

    return {
      'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression'(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.ArrowFunctionExpression,
      ) {
        const body = getFunctionBody(node)

        if (!body) {
          return
        }

        checkBody(body)
      },
    }
  },
})
