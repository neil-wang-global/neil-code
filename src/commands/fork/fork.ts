import type { LocalJSXCommandOnDone } from '../../types/command.js'
import type { LocalJSXCommandContext } from '../../commands.js'

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: LocalJSXCommandContext,
  args: string,
): Promise<React.ReactNode> {
  const directive = args?.trim()
  if (!directive) {
    onDone('Usage: /fork <directive>\nProvide a directive for the forked agent.')
    return null
  }

  onDone(undefined, {
    nextInput: directive,
    submitNextInput: true,
  })
  return null
}
