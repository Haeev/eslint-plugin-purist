# eslint-plugin-purist

[![CI](https://github.com/loicnowakowski/eslint-plugin-purist/actions/workflows/ci.yml/badge.svg)](https://github.com/loicnowakowski/eslint-plugin-purist/actions/workflows/ci.yml)

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

| Name                                                       | Description                                                                          | 🔧 | 💡 |
| :--------------------------------------------------------- | :----------------------------------------------------------------------------------- | :- | :- |
| [handler-names](docs/rules/handler-names.md)               | Require event handler references to use a handle prefix                              |    |    |
| [interactive-a11y](docs/rules/interactive-a11y.md)         | Require keyboard support and accessible names on non-native interactive JSX elements |    | 💡 |
| [no-classname-ternary](docs/rules/no-classname-ternary.md) | Disallow ternary expressions as direct className values                              |    | 💡 |
| [no-inline-styles](docs/rules/no-inline-styles.md)         | Disallow inline style attributes in JSX                                              |    |    |
| [prefer-arrow-const](docs/rules/prefer-arrow-const.md)     | Prefer const arrow functions over function declarations                              | 🔧 |    |
| [prefer-guard-clause](docs/rules/prefer-guard-clause.md)   | Prefer early returns over wrapping function bodies in a single if block              |    | 💡 |

<!-- end auto-generated rules list -->

## Configs

<!-- begin auto-generated configs list -->
<!-- end auto-generated configs list -->

| Config               | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `purist/recommended` | Opinionated React/TypeScript setup with purist rules and `no-else-return`. |
| `purist/core`        | Purist custom rules only, without parser or core ESLint rules.             |

## Known limitations

- `purist/prefer-arrow-const` only targets `function` declarations (not `const x = function () {}`).
- `purist/handler-names` suggests local renames only; it will flag `onClick={onClick}` when drilling props unless you add `allowNames`.
- `purist/interactive-a11y` checks `aria-label`, `aria-labelledby`, and `title` only (not child text content).
- `purist/no-inline-styles` can allow CSS custom properties with `allowCssVariables: true`.

## License

MIT
