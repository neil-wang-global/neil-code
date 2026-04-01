export const TERMINAL_CAPTURE_TOOL_NAME = 'terminal_capture'

export const DESCRIPTION =
  'Capture the current visible content of the built-in terminal panel (Alt+J). ' +
  'Returns the text currently displayed in the terminal pane. ' +
  'Use this when you need to see what the user is looking at in their terminal panel — ' +
  'for example, to read command output, error messages, or logs from a running process.'

export const PROMPT =
  'Use this tool to read the contents of the built-in terminal panel. ' +
  'The terminal panel is a persistent shell session the user can toggle with Alt+J. ' +
  'This tool captures the visible text from that terminal. ' +
  'Use the `lines` parameter to control how many lines of scrollback history to capture. ' +
  'If the terminal panel has not been opened yet or tmux is not available, ' +
  'the tool will return an error explaining the situation.'
