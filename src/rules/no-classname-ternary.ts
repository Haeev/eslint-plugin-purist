import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'

type Options = []
type MessageIds = 'noClassnameTernary'

const isClassNameAttribute = (name: string): boolean => name === 'className' || name === 'class'

export const noClassnameTernary = createRule<Options, MessageIds>({
  name: 'no-classname-ternary',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow ternary expressions as direct className values',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noClassnameTernary: 'Avoid ternary expressions in className. Use cn() or clsx() instead.',
    },
  },
  defaultOptions: [],
  create(context) {
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

        context.report({
          node: expression,
          messageId: 'noClassnameTernary',
          suggest: [
            {
              messageId: 'noClassnameTernary',
              fix(fixer) {
                const sourceCode = context.sourceCode
                const whenTrue = sourceCode.getText(expression.consequent)
                const whenFalse = sourceCode.getText(expression.alternate)
                const test = sourceCode.getText(expression.test)

                return fixer.replaceText(
                  expression,
                  `cn(${whenTrue}, ${test} && ${whenTrue}, !${test} && ${whenFalse})`,
                )
              },
            },
          ],
        })
      },
    }
  },
})
