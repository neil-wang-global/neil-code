import { spawnSync } from 'child_process'
import { z } from 'zod/v4'
import { buildTool, type ToolDef } from '../../Tool.js'
import { lazySchema } from '../../utils/lazySchema.js'
import { getTerminalPanelSocket } from '../../utils/terminalPanel.js'
import {
  DESCRIPTION,
  PROMPT,
  TERMINAL_CAPTURE_TOOL_NAME,
} from './prompt.js'

const TMUX_SESSION = 'panel'

const inputSchema = lazySchema(() =>
  z.strictObject({
    lines: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .optional()
      .describe(
        'Number of scrollback lines to capture. Defaults to the visible pane height. ' +
          'Use a larger value to see scrollback history.',
      ),
  }),
)
type InputSchema = ReturnType<typeof inputSchema>

const outputSchema = lazySchema(() =>
  z.object({
    content: z.string().describe('The captured terminal content'),
    lines: z.number().describe('Number of lines captured'),
  }),
)
type OutputSchema = ReturnType<typeof outputSchema>
type Output = z.infer<OutputSchema>

function hasSession(): boolean {
  const result = spawnSync(
    'tmux',
    ['-L', getTerminalPanelSocket(), 'has-session', '-t', TMUX_SESSION],
    { encoding: 'utf-8' },
  )
  return result.status === 0
}

function capturePane(lines?: number): { content: string; lineCount: number } {
  const socket = getTerminalPanelSocket()
  const args = ['-L', socket, 'capture-pane', '-t', TMUX_SESSION, '-p']

  if (lines !== undefined) {
    // -S -N captures N lines of scrollback from the top of the history
    args.push('-S', `-${lines}`)
  }

  const result = spawnSync('tmux', args, { encoding: 'utf-8' })

  if (result.status !== 0) {
    throw new Error(
      `Failed to capture terminal panel: ${result.stderr?.trim() || 'unknown error'}`,
    )
  }

  const content = result.stdout
  // Trim trailing empty lines but preserve internal structure
  const trimmed = content.replace(/\n+$/, '')
  const lineCount = trimmed === '' ? 0 : trimmed.split('\n').length

  return { content: trimmed, lineCount }
}

export const TerminalCaptureTool = buildTool({
  name: TERMINAL_CAPTURE_TOOL_NAME,
  searchHint: 'read the contents of the built-in terminal panel',
  maxResultSizeChars: 100_000,
  get inputSchema(): InputSchema {
    return inputSchema()
  },
  get outputSchema(): OutputSchema {
    return outputSchema()
  },
  isReadOnly() {
    return true
  },
  isConcurrencySafe() {
    return true
  },
  async description() {
    return DESCRIPTION
  },
  async prompt() {
    return PROMPT
  },
  async call(
    input: z.infer<InputSchema>,
  ): Promise<{ data: Output } | { error: string }> {
    // Check if the terminal panel tmux session exists
    if (!hasSession()) {
      return {
        error:
          'Terminal panel is not active. The user has not opened the terminal panel yet ' +
          '(Alt+J), or tmux is not available on this system.',
      }
    }

    try {
      const { content, lineCount } = capturePane(input.lines)

      if (lineCount === 0) {
        return { data: { content: '(terminal is empty)', lines: 0 } }
      }

      return { data: { content, lines: lineCount } }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to capture terminal panel content',
      }
    }
  },
} satisfies ToolDef<InputSchema, Output>)
