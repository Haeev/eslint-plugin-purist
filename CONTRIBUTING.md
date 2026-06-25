# Contributing

Thanks for helping improve eslint-plugin-purist.

## Development setup

```bash
corepack enable
pnpm install
```

## Scripts

| Command                   | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `pnpm typecheck`          | TypeScript strict check                    |
| `pnpm test`               | Vitest + 100% coverage on `src/rules/`     |
| `pnpm build`              | ESM/CJS + types via tsup                   |
| `pnpm lint`               | Dogfood ESLint on `src/` only              |
| `pnpm format:check`       | Prettier check                             |
| `pnpm update:eslint-docs` | Regenerate `docs/rules/` and README tables |

## Adding a rule

1. Create `src/rules/your-rule.ts` with `createRule` from `src/utils/createRule.ts`.
2. Export a complete `meta` object (`type`, `docs`, `schema`, `messages`, and `fixable`/`hasSuggestions` when relevant).
3. Register the rule in `src/index.ts`.
4. Add `tests/rules/your-rule.test.ts` with valid/invalid cases (and fix/suggestion output assertions).
5. Run `pnpm update:eslint-docs` and document rationale in the generated `docs/rules/your-rule.md`.
6. Ensure `pnpm lint` passes on `src/` without overrides.

## Commits

This repository uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

## Pull requests

- Keep changes focused.
- Include tests for rule behaviour changes.
- Do not edit auto-generated README rule table markers by hand; run `pnpm update:eslint-docs`.
