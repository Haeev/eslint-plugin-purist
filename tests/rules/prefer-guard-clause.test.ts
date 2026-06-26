import { preferGuardClause } from '../../src/rules/prefer-guard-clause.js'
import { ruleTester } from '../setup.js'

ruleTester.run('prefer-guard-clause', preferGuardClause, {
  valid: [
    'const foo = () => { if (ready) { return } doWork() }',
    'const foo = () => { if (ready) { a(); b() } }',
    'const foo = () => { if (ready) { a(); b(); c() } else { d() } }',
    {
      code: 'const foo = () => { if (ready) { a(); b() } }',
      options: [{ minBodyStatements: 3 }],
    },
    'const foo = () => { if (ready) return; a(); b(); c() }',
    'const foo = () => { if (ready) doWork() }',
    'const foo = () => ready && work()',
    'function empty() {}',
    'const foo = () => { if (ready) { let x = 1; a(); b(); c() } }',
    'const foo = () => { if (ready) { const x = 1; a(); b(); c() } }',
    'const foo = () => { if (ready) { class Inner {} a(); b(); c() } }',
  ],
  invalid: [
    {
      code: 'const foo = () => { if (ready) { a(); b(); c() } }',
      errors: [
        {
          messageId: 'preferGuardClause',
          suggestions: [
            {
              messageId: 'preferGuardClause',
              output:
                'const foo = () => { if (!(ready)) {\n                      return\n                    }\n a(); b(); c()  }',
            },
          ],
        },
      ],
    },
    {
      code: 'const foo = () => { if (ready) { a(); /* keep */ b(); c() } }',
      errors: [
        {
          messageId: 'preferGuardClause',
          suggestions: [
            {
              messageId: 'preferGuardClause',
              output:
                'const foo = () => { if (!(ready)) {\n                      return\n                    }\n a(); /* keep */ b(); c()  }',
            },
          ],
        },
      ],
    },
    {
      code: 'const foo = () => {\n    if (ready) {\n        a();\n        b();\n        c();\n    }\n}',
      errors: [
        {
          messageId: 'preferGuardClause',
          suggestions: [
            {
              messageId: 'preferGuardClause',
              output:
                'const foo = () => {\n    if (!(ready)) {\n        return\n    }\n\n        a();\n        b();\n        c();\n    \n}',
            },
          ],
        },
      ],
    },
    {
      code: 'function foo() { if (ready) { a(); b(); c(); d() } }',
      errors: [
        {
          messageId: 'preferGuardClause',
          suggestions: [
            {
              messageId: 'preferGuardClause',
              output:
                'function foo() { if (!(ready)) {\n                   return\n                 }\n a(); b(); c(); d()  }',
            },
          ],
        },
      ],
    },
  ],
})
