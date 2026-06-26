import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'

type Options = [
  {
    allowCssVariables?: boolean
  },
]

type MessageIds = 'noInlineStyles'

const defaultOptions: Options[0] = {
  allowCssVariables: false,
}

const isCssCustomPropertyKey = (key: TSESTree.Property['key']): boolean => {
  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value.startsWith('--')
  }

  return false
}

const objectExpressionOnlyHasCssVariables = (expression: TSESTree.ObjectExpression): boolean => {
  if (expression.properties.length === 0) {
    return false
  }

  return expression.properties.every((property) => {
    if (property.type !== 'Property') {
      return false
    }

    return isCssCustomPropertyKey(property.key)
  })
}

export const noInlineStyles = createRule<Options, MessageIds>({
  name: 'no-inline-styles',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow inline style attributes in JSX',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowCssVariables: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noInlineStyles: 'Avoid inline style attributes. Use Tailwind classes instead.',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const mergedOptions = { ...defaultOptions, ...options }

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'style') {
          return
        }

        const value = node.value

        if (!value) {
          context.report({
            node,
            messageId: 'noInlineStyles',
          })
          return
        }

        if (value.type === 'JSXExpressionContainer') {
          const expression = value.expression

          if (expression.type === 'JSXEmptyExpression') {
            return
          }

          if (
            mergedOptions.allowCssVariables &&
            expression.type === 'ObjectExpression' &&
            objectExpressionOnlyHasCssVariables(expression)
          ) {
            return
          }
        }

        context.report({
          node,
          messageId: 'noInlineStyles',
        })
      },
    }
  },
})
