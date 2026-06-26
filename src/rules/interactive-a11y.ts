import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'

type Options = []
type MessageIds = 'missingKeyboardHandler' | 'missingTabIndex' | 'missingAccessibleName'

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

const hasNonEmptyJsxTextChild = (element: TSESTree.JSXElement): boolean => {
  return element.children.some((child) => {
    if (child.type === 'JSXText') {
      return child.value.trim().length > 0
    }

    if (child.type === 'JSXExpressionContainer' && child.expression.type === 'Literal') {
      return typeof child.expression.value === 'string' && child.expression.value.trim().length > 0
    }

    return false
  })
}

const getParentJsxElement = (node: TSESTree.JSXOpeningElement): TSESTree.JSXElement | null => {
  const parent = node.parent

  if (parent?.type === 'JSXElement') {
    return parent
  }

  return null
}

export const interactiveA11y = createRule<Options, MessageIds>({
  name: 'interactive-a11y',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require keyboard support and accessible names on clickable non-native JSX elements',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      missingKeyboardHandler:
        'Add onKeyDown or onKeyUp alongside onClick for non-native clickable elements.',
      missingTabIndex: 'Add tabIndex to non-native clickable elements.',
      missingAccessibleName:
        'Add aria-label, aria-labelledby, title, or visible text content for clickable elements.',
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

        const parentElement = getParentJsxElement(node)
        const hasTextContent = parentElement ? hasNonEmptyJsxTextChild(parentElement) : false
        const hasName = hasAccessibleName(attributes) || hasTextContent

        if (!hasAttribute(attributes, ['onKeyDown', 'onKeyUp'])) {
          context.report({
            node,
            messageId: 'missingKeyboardHandler',
          })
        }

        if (!hasAttribute(attributes, ['tabIndex'])) {
          context.report({
            node,
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

        if (!hasName) {
          context.report({
            node,
            messageId: 'missingAccessibleName',
          })
        }
      },
    }
  },
})
