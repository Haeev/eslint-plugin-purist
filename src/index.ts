import type { ESLint, Linter } from 'eslint'
import { buildCore } from './configs/core.js'
import { buildRecommended } from './configs/recommended.js'
import { handlerNames } from './rules/handler-names.js'
import { interactiveA11y } from './rules/interactive-a11y.js'
import { noClassnameTernary } from './rules/no-classname-ternary.js'
import { noInlineStyles } from './rules/no-inline-styles.js'
import { preferArrowConst } from './rules/prefer-arrow-const.js'
import { preferGuardClause } from './rules/prefer-guard-clause.js'
import { PURIST_VERSION } from './version.js'

const rules = {
  'prefer-arrow-const': preferArrowConst,
  'handler-names': handlerNames,
  'no-classname-ternary': noClassnameTernary,
  'no-inline-styles': noInlineStyles,
  'interactive-a11y': interactiveA11y,
  'prefer-guard-clause': preferGuardClause,
}

export type PuristPlugin = ESLint.Plugin & {
  configs: {
    recommended: Linter.Config
    core: Linter.Config
  }
}

const plugin = {
  meta: {
    name: 'eslint-plugin-purist',
    version: PURIST_VERSION,
    namespace: 'purist',
  },
  rules,
  configs: {},
} as unknown as PuristPlugin

Object.assign(plugin.configs, {
  recommended: buildRecommended(plugin),
  core: buildCore(plugin),
})

export default plugin
export { plugin as purist, rules }
export { buildCore, buildRecommended }
