# Require keyboard support and accessible names on clickable non-native JSX elements (`purist/interactive-a11y`)

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Scope

This rule targets native DOM elements with `onClick` that are not already keyboard accessible by default (for example `div` and `span`). It does not lint custom React components or native controls such as `button`, `input`, or links with `href`.

## What it checks

- A keyboard handler (`onKeyDown` or `onKeyUp`) is present alongside `onClick`
- `tabIndex` is present so the element can receive focus
- The element has an accessible name through `aria-label`, `aria-labelledby`, `title`, or non-empty child text

## What it does not replace

`purist/interactive-a11y` is a lightweight guardrail for the most common clickable `div` pattern. It is not a replacement for `eslint-plugin-jsx-a11y`, which covers focus management, ARIA roles, anchors, labels, and many more accessibility edge cases.
