import { interactiveA11y } from '../../src/rules/interactive-a11y.js'
import { ruleTester } from '../setup.js'

ruleTester.run('interactive-a11y', interactiveA11y, {
  valid: [
    '<div />',
    '<button onClick={handleClick}>Save</button>',
    '<div onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Save" />',
    '<a href="/home" onClick={handleClick}>Home</a>',
    '<span onClick={handleClick} onKeyUp={handleKeyUp} tabIndex={0} role="button" title="Open" />',
    '<input onClick={handleClick} />',
    '<Custom.Button onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Save" />',
    '<div xml:lang="fr" onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Open" />',
    '<Custom.Panel onClick={handleClick} onKeyDown={handleKeyDown} tabIndex={0} role="button" aria-label="Open" />',
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
        { messageId: 'missingRole' },
        { messageId: 'missingAccessibleName' },
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
      code: '<div onClick={handleClick} tabIndex={0} role="button" aria-label="Save" />',
      errors: [{ messageId: 'missingKeyboardHandler' }],
    },
  ],
})
