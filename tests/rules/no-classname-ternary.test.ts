import { noClassnameTernary } from '../../src/rules/no-classname-ternary.js'
import { ruleTester } from '../setup.js'

ruleTester.run('no-classname-ternary', noClassnameTernary, {
  valid: [
    '<div className="static" />',
    '<div className={cn("a", active && "b")} />',
    '<div class={cn("a", active ? "b" : "c")} />',
    '<div className={value} />',
    '<div data-className={active ? "on" : "off"} />',
    '<div className={[active ? "on" : "off"]} />',
  ],
  invalid: [
    {
      code: '<div className={active ? "on" : "off"} />',
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output: '<div className={cn("on", active && "on", !active && "off")} />',
            },
          ],
        },
      ],
    },
    {
      code: '<div className={outer ? (inner ? "a" : "b") : "c"} />',
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output:
                '<div className={cn(inner ? "a" : "b", outer && inner ? "a" : "b", !outer && "c")} />',
            },
          ],
        },
      ],
    },
    {
      code: '<div class={enabled ? "yes" : "no"} />',
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output: '<div class={cn("yes", enabled && "yes", !enabled && "no")} />',
            },
          ],
        },
      ],
    },
  ],
})
