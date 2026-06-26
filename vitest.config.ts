import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/rules/**/*.ts', 'src/utils/ast.ts', 'src/utils/scope.ts'],
      thresholds: {
        'src/rules/**': {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
      },
    },
  },
})
