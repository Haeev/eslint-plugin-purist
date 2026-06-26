import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'
import { findAvailableClassNameHelper } from '../utils/scope.js'

type Options = [
  {
    helper?: 'cn' | 'clsx'
  },
]

type MessageIds = 'noClassnameTernary'

const defaultOptions: Options[0] = {
  helper: 'cn',
}

const isClassNameAttribute = (name: string): boolean => name === 'className' || name === 'class'

export const noClassnameTernary = createRule<Options, MessageIds>({
  name: 'no-classname-ternary',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow ternary expressions as direct className values',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          helper: {
            type: 'string',
            enum: ['cn', 'clsx'],
            description: 'Preferred className helper to target in suggestions.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noClassnameTernary: 'Avoid ternary expressions in className. Use cn() or clsx() instead.',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const mergedOptions = { ...defaultOptions, ...options }

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !isClassNameAttribute(node.name.name)) {
          return
        }

        const value = node.value

        if (!value || value.type !== 'JSXExpressionContainer') {
          return
        }

        const expression = value.expression

        if (expression.type !== 'ConditionalExpression') {
          return
        }

        const helperName = findAvailableClassNameHelper(context.sourceCode, mergedOptions.helper!)

        context.report({
          node: expression,
          messageId: 'noClassnameTernary',
          suggest: helperName
            ? [
                {
                  messageId: 'noClassnameTernary',
                  fix(fixer) {
                    const sourceCode = context.sourceCode
                    const whenTrue = sourceCode.getText(expression.consequent)
                    const whenFalse = sourceCode.getText(expression.alternate)
                    const test = sourceCode.getText(expression.test)

                    return fixer.replaceText(
                      expression,
                      `${helperName}(${test} && ${whenTrue}, !(${test}) && ${whenFalse})`,
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
