import type { TSESTree } from '@typescript-eslint/utils'
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

const getHandlerName = (expression: TSESTree.Expression): string | null => {
  if (expression.type === 'Identifier') {
    return expression.name
  }

  return null
}

const hasHandlePrefix = (name: string): boolean => name.startsWith('handle')

export const handlerNames = createRule<Options, MessageIds>({
  name: 'handler-names',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require event handler references to use a handle prefix',
    },
    hasSuggestions: false,
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
      handlerPrefix: "Event handler '{{name}}' should use a 'handle' prefix.",
      inlineHandlerPrefix:
        'Inline event handlers should be extracted to a handle-prefixed function.',
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

        const handlerName = getHandlerName(expression)

        if (!handlerName) {
          return
        }

        if (hasHandlePrefix(handlerName) || allowSet.has(handlerName)) {
          return
        }

        context.report({
          node: expression,
          messageId: 'handlerPrefix',
          data: { name: handlerName },
        })
      },
    }
  },
})
