import { ESLintUtils } from '@typescript-eslint/utils'

const DOCS_BASE = 'https://github.com/Haeev/eslint-plugin-purist/blob/main/docs/rules'

export const createRule = ESLintUtils.RuleCreator((name) => `${DOCS_BASE}/${name}.md`)
