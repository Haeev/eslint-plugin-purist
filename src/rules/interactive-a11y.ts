import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'

type Options = []
type MessageIds =
  | 'missingKeyboardHandler'
  | 'missingTabIndex'
  | 'missingRole'
  | 'missingAccessibleName'

const NATIVE_INTERACTIVE_ELEMENTS = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'option',
  'summary',
])

const hasAttribute = (attributes: TSESTree.JSXAttribute[], names: string[]): boolean => {
  return attributes.some((attribute) => {
    if (attribute.name.type !== 'JSXIdentifier') {
      return false
    }

    return names.includes(attribute.name.name)
  })
}

const getElementName = (openingElement: TSESTree.JSXOpeningElement): string | null => {
  const name = openingElement.name

  if (name.type === 'JSXIdentifier') {
    return name.name
  }

  return null
}

const isCustomComponent = (openingElement: TSESTree.JSXOpeningElement): boolean => {
  const name = openingElement.name

  if (name.type === 'JSXMemberExpression') {
    return true
  }

  if (name.type === 'JSXIdentifier' && /^[A-Z]/.test(name.name)) {
    return true
  }

  return false
}

const isNativeInteractive = (elementName: string, attributes: TSESTree.JSXAttribute[]): boolean => {
  if (elementName === 'a') {
    return hasAttribute(attributes, ['href'])
  }

  return NATIVE_INTERACTIVE_ELEMENTS.has(elementName)
}

const hasAccessibleName = (attributes: TSESTree.JSXAttribute[]): boolean => {
  return hasAttribute(attributes, ['aria-label', 'aria-labelledby', 'title'])
}

export const interactiveA11y = createRule<Options, MessageIds>({
  name: 'interactive-a11y',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require keyboard support and accessible names on non-native interactive JSX elements',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      missingKeyboardHandler:
        'Interactive elements must include onKeyDown or onKeyUp alongside onClick.',
      missingTabIndex: 'Interactive elements must include tabIndex.',
      missingRole: 'Interactive elements must include an explicit role.',
      missingAccessibleName:
        'Interactive elements must include aria-label, aria-labelledby, or title.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes.filter(
          (attribute): attribute is TSESTree.JSXAttribute => attribute.type === 'JSXAttribute',
        )

        if (!hasAttribute(attributes, ['onClick'])) {
          return
        }

        if (isCustomComponent(node)) {
          return
        }

        const elementName = getElementName(node)

        if (!elementName || isNativeInteractive(elementName, attributes)) {
          return
        }

        const reports: Array<{
          messageId: MessageIds
          suggest?: Parameters<typeof context.report>[0]['suggest']
        }> = []

        if (!hasAttribute(attributes, ['onKeyDown', 'onKeyUp'])) {
          reports.push({ messageId: 'missingKeyboardHandler' })
        }

        if (!hasAttribute(attributes, ['tabIndex'])) {
          reports.push({
            messageId: 'missingTabIndex',
            suggest: [
              {
                messageId: 'missingTabIndex',
                fix(fixer) {
                  const lastAttribute = attributes.at(-1)!

                  return fixer.insertTextAfter(lastAttribute, ' tabIndex={0}')
                },
              },
            ],
          })
        }

        if (!hasAttribute(attributes, ['role'])) {
          reports.push({ messageId: 'missingRole' })
        }

        if (!hasAccessibleName(attributes)) {
          reports.push({ messageId: 'missingAccessibleName' })
        }

        for (const report of reports) {
          context.report({
            node,
            messageId: report.messageId,
            suggest: report.suggest,
          })
        }
      },
    }
  },
})
