import type { ToolUseConfirm } from '../../components/permissions/PermissionRequest.js'

type CompletionType =
  | 'str_replace_single'
  | 'str_replace_multi'
  | 'write_file_single'
  | 'tool_use_single'

export type UnaryEvent = {
  completion_type: CompletionType
  language_name: string | Promise<string>
}

/**
 * Telemetry has been removed from permission request logging. Keep the hook
 * signature so callers do not need to change.
 */
export function usePermissionRequestLogging(
  toolUseConfirm: ToolUseConfirm,
  unaryEvent: UnaryEvent,
): void {
  void toolUseConfirm
  void unaryEvent
}
