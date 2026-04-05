import type { ToolUseConfirm } from './PermissionRequest.js'

type CompletionType =
  | 'str_replace_single'
  | 'str_replace_multi'
  | 'write_file_single'
  | 'tool_use_single'

export function logUnaryPermissionEvent(
  completion_type: CompletionType,
  toolUseConfirm: ToolUseConfirm,
  event: 'accept' | 'reject',
  hasFeedback?: boolean,
): void {
  void completion_type
  void toolUseConfirm
  void event
  void hasFeedback
}
