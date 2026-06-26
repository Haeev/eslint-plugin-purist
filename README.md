# eslint-plugin-purist

[![CI](https://github.com/Haeev/eslint-plugin-purist/actions/workflows/ci.yml/badge.svg)](https://github.com/Haeev/eslint-plugin-purist/actions/workflows/ci.yml)

ESLint plugin that encodes a strict React/TypeScript style guide with one safe autofix and opinionated suggestions.

## Quick start

```bash
pnpm add -D eslint-plugin-purist @typescript-eslint/parser typescript
```

```ts
// eslint.config.ts
import { defineConfig } from 'eslint/config'
import purist from 'eslint-plugin-purist'

export default defineConfig([purist.configs.recommended])
```

Use `purist.configs.core` when you only want the six custom rules without the TypeScript parser or `no-else-return`.

## Formatting

This plugin intentionally avoids formatting rules. Pair it with Prettier:

```json
{
  "semi": false
}
```

## Optional: `id-length`

`id-length` is **not** included in `purist/recommended` because it creates noise in AST-heavy plugin code. Add it manually if you want short identifier enforcement:

```ts
rules: {
  'id-length': ['error', { min: 2 }],
}
```

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                       | Description                                                                        | 🔧 | 💡 |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------------- | :- | :- |
| [handler-names](docs/rules/handler-names.md)               | Require event handler references to use a handle prefix                            |    | 💡 |
| [interactive-a11y](docs/rules/interactive-a11y.md)         | Require keyboard support and accessible names on clickable non-native JSX elements |    | 💡 |
| [no-classname-ternary](docs/rules/no-classname-ternary.md) | Disallow ternary expressions as direct className values                            |    | 💡 |
| [no-inline-styles](docs/rules/no-inline-styles.md)         | Disallow inline style attributes in JSX                                            |    |    |
| [prefer-arrow-const](docs/rules/prefer-arrow-const.md)     | Prefer const arrow functions over function declarations                            | 🔧 |    |
| [prefer-guard-clause](docs/rules/prefer-guard-clause.md)   | Prefer early returns over wrapping function bodies in a single if block            |    | 💡 |

<!-- end auto-generated rules list -->

## Configs

<!-- begin auto-generated configs list -->
<!-- end auto-generated configs list -->

| Config               | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `purist/recommended` | Opinionated React/TypeScript setup with purist rules and `no-else-return`. |
| `purist/core`        | Purist custom rules only, without parser or core ESLint rules.             |

## Design decisions

### One autofix that must never break consumers

`prefer-arrow-const` is the only rule with `--fix` support. It uses scope analysis instead of text heuristics to skip declarations that rely on hoisting, `this`, or the lexical `arguments` object. The goal is zero semantic surprises: if the fix is uncertain, the rule reports without rewriting code.

### Suggestions instead of risky rewrites

Rules such as `no-classname-ternary`, `prefer-guard-clause`, and `handler-names` expose editor suggestions. Suggestions are withheld when they could introduce undefined identifiers (for example `cn` or `clsx` that are not imported) or when a rename cannot be proven safe across the file.

### No formatting rules

Formatting belongs to Prettier. Purist focuses on React and TypeScript conventions that change behavior or readability, not whitespace or quote style.

### Accessibility scope is intentionally narrow

`interactive-a11y` only guards clickable native elements (`div`, `span`, `a` without `href`, and similar) that use `onClick` without keyboard support or an accessible name. It does not attempt to replace `eslint-plugin-jsx-a11y`.

### `no-else-return` in recommended only

`purist/recommended` enables ESLint core `no-else-return` because it pairs naturally with `prefer-guard-clause`. `purist/core` keeps the plugin portable for consumers that bring their own base config.

## Known limitations

- `purist/prefer-arrow-const` only targets `function` declarations (not `const x = function () {}`).
- `purist/handler-names` renames local bindings only. Imported handlers and member expressions are reported without an automatic rename.
- `purist/interactive-a11y` checks `aria-label`, `aria-labelledby`, `title`, and non-empty child text only.
- `purist/no-classname-ternary` suggests `cn`/`clsx` conversions only when the helper is already in scope.
- `purist/no-inline-styles` can allow CSS custom properties with `allowCssVariables: true`.

## License

MIT
