import { interactiveA11y } from '../../src/rules/interactive-a11y.js'
import { ruleTester } from '../setup.js'

ruleTester.run('interactive-a11y', interactiveA11y, {
  valid: [
    '<div />',
    '<button onClick={handleClick}>Save</button>',
    '<div onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Save" />',
    '<div onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0}>Save</div>',
    '<a href="/home" onClick={handleClick}>Home</a>',
    '<input onClick={handleClick} />',
    '<Button onClick={handleClick} />',
    '<Custom.Button onClick={handleClick} />',
    '<Custom.Panel onClick={handleClick} />',
    '<x:div onClick={handleClick} />',
    '<div xml:lang="fr" onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} aria-label="Open" />',
  ],
  invalid: [
    {
      code: '<div onClick={handleClick} />',
      errors: [
        { messageId: 'missingKeyboardHandler' },
        {
          messageId: 'missingTabIndex',
          suggestions: [
            {
              messageId: 'missingTabIndex',
              output: '<div onClick={handleClick} tabIndex={0} />',
            },
          ],
        },
        { messageId: 'missingAccessibleName' },
      ],
    },
    {
      code: '<a onClick={handleClick}>Open</a>',
      errors: [
        { messageId: 'missingKeyboardHandler' },
        {
          messageId: 'missingTabIndex',
          suggestions: [
            {
              messageId: 'missingTabIndex',
              output: '<a onClick={handleClick} tabIndex={0}>Open</a>',
            },
          ],
        },
      ],
    },
    {
      code: '<div onClick={handleClick} onKeyDown={handleKeyDown} role="button" aria-label="Save" />',
      errors: [
        {
          messageId: 'missingTabIndex',
          suggestions: [
            {
              messageId: 'missingTabIndex',
              output:
                '<div onClick={handleClick} onKeyDown={handleKeyDown} role="button" aria-label="Save" tabIndex={0} />',
            },
          ],
        },
      ],
    },
    {
      code: '<><div onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} /></>',
      errors: [{ messageId: 'missingAccessibleName' }],
    },
    {
      code: '<div onClick={handleClick} tabIndex={0} role="button" aria-label="Save" />',
      errors: [{ messageId: 'missingKeyboardHandler' }],
    },
  ],
})
