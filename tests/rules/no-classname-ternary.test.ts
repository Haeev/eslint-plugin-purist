import { noClassnameTernary } from '../../src/rules/no-classname-ternary.js'
import { ruleTester } from '../setup.js'

ruleTester.run('no-classname-ternary', noClassnameTernary, {
  valid: [
    '<div className="static" />',
    'import { cn } from "clsx"\n<div className={cn("a", active && "b")} />',
    'import { cn } from "clsx"\n<div class={cn("a", active ? "b" : "c")} />',
    'import { cn } from "clsx"\n<div className={value} />',
    '<div data-className={active ? "on" : "off"} />',
    '<div className={[active ? "on" : "off"]} />',
  ],
  invalid: [
    {
      code: 'import { cn } from "clsx"\n<div className={active ? "on" : "off"} />',
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output:
                'import { cn } from "clsx"\n<div className={cn(active && "on", !(active) && "off")} />',
            },
          ],
        },
      ],
    },
    {
      code: 'import clsx from "clsx"\n<div className={active ? "on" : "off"} />',
      options: [{ helper: 'clsx' }],
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output:
                'import clsx from "clsx"\n<div className={clsx(active && "on", !(active) && "off")} />',
            },
          ],
        },
      ],
    },
    {
      code: 'import { cn } from "clsx"\n<div className={outer ? (inner ? "a" : "b") : "c"} />',
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output:
                'import { cn } from "clsx"\n<div className={cn(outer && inner ? "a" : "b", !(outer) && "c")} />',
            },
          ],
        },
      ],
    },
    {
      code: 'import { cn } from "clsx"\n<div class={enabled ? "yes" : "no"} />',
      errors: [
        {
          messageId: 'noClassnameTernary',
          suggestions: [
            {
              messageId: 'noClassnameTernary',
              output:
                'import { cn } from "clsx"\n<div class={cn(enabled && "yes", !(enabled) && "no")} />',
            },
          ],
        },
      ],
    },
    {
      code: '<div className={active ? "on" : "off"} />',
      errors: [{ messageId: 'noClassnameTernary' }],
    },
  ],
})
