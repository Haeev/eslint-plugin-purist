import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import plugin from './src/index.ts'

export default defineConfig([
  {
    ignores: ['dist/**', 'coverage/**', 'docs/**', 'examples/**', 'tests/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.ts'],
    extends: [plugin.configs.recommended, eslintConfigPrettier],
  },
])
