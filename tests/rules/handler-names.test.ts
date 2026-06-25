import { handlerNames } from '../../src/rules/handler-names.js'
import { ruleTester } from '../setup.js'

ruleTester.run('handler-names', handlerNames, {
  valid: [
    'const handleClick = () => {}; <button onClick={handleClick} />',
    '<button onClick={() => handleClick()} />',
    {
      code: '<button onClick={onClick} />',
      options: [{ allowNames: ['onClick'] }],
    },
    {
      code: '<button onClick={submit} />',
      options: [{ allowNames: ['submit'] }],
    },
    '<button onClick />',
    '<button onClick="handleClick" />',
    '<button data-onClick={click} />',
    '<button onClick={handleClick.extra} />',
    '<button onClick={} />',
  ],
  invalid: [
    {
      code: 'const click = () => {}; <button onClick={click} />',
      errors: [{ messageId: 'handlerPrefix' }],
    },
    {
      code: '<button onClick={doThing} />',
      errors: [{ messageId: 'handlerPrefix' }],
    },
    {
      code: '<button onClick={() => doThing()} />',
      options: [{ checkInlineFunctions: true }],
      errors: [{ messageId: 'inlineHandlerPrefix' }],
    },
  ],
})
