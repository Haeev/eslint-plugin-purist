import { preferArrowConst } from '../../src/rules/prefer-arrow-const.js'
import { ruleTester } from '../setup.js'

ruleTester.run('prefer-arrow-const', preferArrowConst, {
  valid: [
    'const foo = () => {}',
    'export const PageLayout = ({ children }: { children: React.ReactNode }) => <main>{children}</main>',
    'export const foo = () => {}',
    {
      code: 'export function foo() {}',
      options: [{ allowNamedExports: true }],
    },
    'declare function external(): void',
    {
      code: 'function Button() { return <div /> }',
      options: [{ ignoreJsxComponents: true }],
    },
  ],
  invalid: [
    {
      code: 'function foo() {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const foo = () => {}',
    },
    {
      code: 'async function foo() { await Promise.resolve() }',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const foo = async () => { await Promise.resolve() }',
    },
    {
      code: 'export function foo() {}',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'function Button() { return <div /> }',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const Button = () => { return <div /> }',
    },
    {
      code: 'function* gen() {}',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'export default function() { return 1 }',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'export default function foo() {}',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'function outer() { return inner() }\nfunction inner() { return 1 }',
      errors: [{ messageId: 'preferArrowConst' }, { messageId: 'preferArrowConst' }],
      output: 'const outer = () => { return inner() }\nfunction inner() { return 1 }',
    },
    {
      code: 'function usesThis() { return this.value }',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'function outer() { const inner = function() { return this }; return inner }',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const outer = () => { const inner = function() { return this }; return inner }',
    },
    {
      code: 'function usesArgs() { return arguments[0] }',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'function usesArgs(arguments) { return arguments[0] }',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const usesArgs = arguments => { return arguments[0] }',
    },
    {
      code: 'function outer() { const inner = function() { return arguments[0] }; return inner }',
      errors: [{ messageId: 'preferArrowConst' }],
      output:
        'const outer = () => { const inner = function() { return arguments[0] }; return inner }',
    },
    {
      code: '// foo\nfunction foo() {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: '// foo\nconst foo = () => {}',
    },
    {
      code: 'const label = "foo"\nfunction foo() {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const label = "foo"\nconst foo = () => {}',
    },
    {
      code: 'function typed(): void {}',
      errors: [{ messageId: 'preferArrowConst' }],
    },
    {
      code: 'function withParams(a: string, b: number) {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const withParams = (a: string, b: number) => {}',
    },
    {
      code: 'function withRest(...items: string[]) {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const withRest = (...items: string[]) => {}',
    },
    {
      code: 'function single(x) {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const single = x => {}',
    },
    {
      code: 'function single(x: string) {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const single = (x: string) => {}',
    },
    {
      code: 'function withDefault(x = 1) {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const withDefault = (x = 1) => {}',
    },
    {
      code: 'function destructured({ a }: Props) {}',
      errors: [{ messageId: 'preferArrowConst' }],
      output: 'const destructured = ({ a }: Props) => {}',
    },
  ],
})
