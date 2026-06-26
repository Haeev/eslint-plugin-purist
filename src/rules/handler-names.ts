import type { TSESLint, TSESTree } from '@typescript-eslint/utils'
import { ASTUtils } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'

type Options = [
  {
    checkInlineFunctions?: boolean
    allowNames?: string[]
  },
]

type MessageIds = 'handlerPrefix' | 'inlineHandlerPrefix'

const defaultOptions: Options[0] = {
  checkInlineFunctions: false,
  allowNames: [],
}

const isEventHandlerProp = (name: string): boolean => /^on[A-Z]/.test(name)

const hasHandlePrefix = (name: string): boolean => name.startsWith('handle')

const toHandlePrefixedName = (name: string): string => {
  if (hasHandlePrefix(name)) {
    return name
  }

  return `handle${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

const getLocalVariable = (
  context: TSESLint.RuleContext<MessageIds, Options>,
  identifier: TSESTree.Identifier,
): ReturnType<typeof ASTUtils.findVariable> => {
  const scope = context.sourceCode.getScope(identifier)

  return ASTUtils.findVariable(scope, identifier)
}

const canRenameLocalHandler = (
  context: TSESLint.RuleContext<MessageIds, Options>,
  identifier: TSESTree.Identifier,
): boolean => {
  const variable = getLocalVariable(context, identifier)

  if (!variable) {
    return false
  }

  return variable.defs.some((def) => {
    return (
      def.type === 'Variable' ||
      def.type === 'FunctionName' ||
      def.type === 'Parameter' ||
      def.type === 'ImportBinding'
    )
  })
}

export const handlerNames = createRule<Options, MessageIds>({
  name: 'handler-names',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require event handler references to use a handle prefix',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          checkInlineFunctions: { type: 'boolean' },
          allowNames: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      handlerPrefix: "Rename '{{name}}' to use a 'handle' prefix.",
      inlineHandlerPrefix: 'Extract inline event handlers to a handle-prefixed function.',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const mergedOptions = { ...defaultOptions, ...options }
    const allowSet = new Set(mergedOptions.allowNames)

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !isEventHandlerProp(node.name.name)) {
          return
        }

        const value = node.value

        if (!value || value.type !== 'JSXExpressionContainer') {
          return
        }

        const expression = value.expression

        if (expression.type === 'JSXEmptyExpression') {
          return
        }

        if (
          expression.type === 'ArrowFunctionExpression' ||
          expression.type === 'FunctionExpression'
        ) {
          if (!mergedOptions.checkInlineFunctions) {
            return
          }

          context.report({
            node: expression,
            messageId: 'inlineHandlerPrefix',
          })
          return
        }

        if (expression.type !== 'Identifier') {
          return
        }

        const handlerName = expression.name

        if (hasHandlePrefix(handlerName) || allowSet.has(handlerName)) {
          return
        }

        const suggestedName = toHandlePrefixedName(handlerName)
        const canRename = canRenameLocalHandler(context, expression)

        context.report({
          node: expression,
          messageId: 'handlerPrefix',
          data: { name: handlerName },
          suggest: canRename
            ? [
                {
                  messageId: 'handlerPrefix',
                  data: { name: handlerName },
                  fix(fixer) {
                    const variable = getLocalVariable(context, expression)!

                    const identifiers = new Set<TSESTree.Identifier>()

                    for (const reference of variable.references) {
                      if (reference.identifier.type === 'Identifier') {
                        identifiers.add(reference.identifier)
                      }
                    }

                    for (const def of variable.defs) {
                      if (def.name.type === 'Identifier') {
                        identifiers.add(def.name)
                      }
                    }

                    return [...identifiers].map((identifier) =>
                      fixer.replaceText(identifier, suggestedName),
                    )
                  },
                },
              ]
            : undefined,
        })
      },
    }
  },
})
