import { handlerNames } from '../../src/rules/handler-names.js'
import { ruleTester } from '../setup.js'

ruleTester.run('handler-names', handlerNames, {
  valid: [
    'const handleClick = () => {}; <button onClick={handleClick} />',
    'import { cn } from "clsx"\nexport const Card = ({ active }: { active: boolean }) => <article className={cn("card", active && "card-active")} />',
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
    '<button onClick={props.onSave} />',
    '(handleSave) => <button onClick={handleSave} />',
  ],
  invalid: [
    {
      code: 'const click = () => {}; <button onClick={click} />',
      errors: [
        {
          messageId: 'handlerPrefix',
          suggestions: [
            {
              messageId: 'handlerPrefix',
              output: 'const handleClick = () => {}; <button onClick={handleClick} />',
            },
          ],
        },
      ],
    },
    {
      code: 'function save() {}\n<button onClick={save} />',
      errors: [
        {
          messageId: 'handlerPrefix',
          suggestions: [
            {
              messageId: 'handlerPrefix',
              output: 'function handleSave() {}\n<button onClick={handleSave} />',
            },
          ],
        },
      ],
    },
    {
      code: 'import { save } from "./api"\n<button onClick={save} />',
      errors: [
        {
          messageId: 'handlerPrefix',
          suggestions: [
            {
              messageId: 'handlerPrefix',
              output: 'import { handleSave } from "./api"\n<button onClick={handleSave} />',
            },
          ],
        },
      ],
    },
    {
      code: '<button onClick={() => doThing()} />',
      options: [{ checkInlineFunctions: true }],
      errors: [{ messageId: 'inlineHandlerPrefix' }],
    },
  ],
})
