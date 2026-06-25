import { noInlineStyles } from '../../src/rules/no-inline-styles.js'
import { ruleTester } from '../setup.js'

ruleTester.run('no-inline-styles', noInlineStyles, {
  valid: [
    '<div className="p-4" />',
    {
      code: '<div style={{ "--x": 1 }} />',
      options: [{ allowCssVariables: true }],
    },
    '<div style="color: red" />',
    '<div style />',
    '<div style={} />',
  ],
  invalid: [
    {
      code: '<div style={{ color: "red" }} />',
      errors: [{ messageId: 'noInlineStyles' }],
    },
    {
      code: '<div style={{ "--accent": color, color: "red" }} />',
      options: [{ allowCssVariables: true }],
      errors: [{ messageId: 'noInlineStyles' }],
    },
    {
      code: '<div style={{ ...styles }} />',
      options: [{ allowCssVariables: true }],
      errors: [{ messageId: 'noInlineStyles' }],
    },
    {
      code: '<div style={{}} />',
      options: [{ allowCssVariables: true }],
      errors: [{ messageId: 'noInlineStyles' }],
    },
    {
      code: '<div style={{ [`--${name}`]: value }} />',
      options: [{ allowCssVariables: true }],
      errors: [{ messageId: 'noInlineStyles' }],
    },
  ],
})
