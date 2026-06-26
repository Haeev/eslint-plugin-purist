# Require event handler references to use a handle prefix (`purist/handler-names`)

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Options

<!-- begin auto-generated rule options list -->

| Name                   | Type     |
| :--------------------- | :------- |
| `allowNames`           | String[] |
| `checkInlineFunctions` | Boolean  |

<!-- end auto-generated rule options list -->

Suggestions rename local bindings only. Imported handlers and member expressions are reported without an automatic rename.
