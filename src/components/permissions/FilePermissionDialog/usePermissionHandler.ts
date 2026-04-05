import type { ToolPermissionContext } from '../../../Tool.js'
import {
  CLAUDE_FOLDER_PERMISSION_PATTERN,
  FILE_EDIT_TOOL_NAME,
  GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN,
} from '../../../tools/FileEditTool/constants.js'
import { generateSuggestions } from '../../../utils/permissions/filesystem.js'
import type { PermissionUpdate } from '../../../utils/permissions/PermissionUpdateSchema.js'
type CompletionType =
  | 'str_replace_single'
  | 'str_replace_multi'
  | 'write_file_single'
  | 'tool_use_single'
import type { ToolUseConfirm } from '../PermissionRequest.js'
import type {
  FileOperationType,
  PermissionOption,
} from './permissionOptions.js'

function logPermissionEvent(
  event: 'accept' | 'reject',
  completionType: CompletionType,
  languageName: string | Promise<string>,
  messageId: string,
  hasFeedback?: boolean,
): void {
  void event
  void completionType
  void languageName
  void messageId
  void hasFeedback
}

export type PermissionHandlerParams = {
  messageId: string
  path: string | null
  toolUseConfirm: ToolUseConfirm
  toolPermissionContext: ToolPermissionContext
  onDone: () => void
  onReject: () => void
  completionType: CompletionType
  languageName: string | Promise<string>
  operationType: FileOperationType
}

export type PermissionHandlerOptions = {
  hasFeedback?: boolean
  feedback?: string
  enteredFeedbackMode?: boolean
  scope?: 'claude-folder' | 'global-claude-folder'
}

function handleAcceptOnce(
  params: PermissionHandlerParams,
  options?: PermissionHandlerOptions,
): void {
  const { messageId, toolUseConfirm, onDone, completionType, languageName } =
    params

  logPermissionEvent('accept', completionType, languageName, messageId)

  onDone()
  toolUseConfirm.onAllow(toolUseConfirm.input, [], options?.feedback)
}

function handleAcceptSession(
  params: PermissionHandlerParams,
  options?: PermissionHandlerOptions,
): void {
  const {
    messageId,
    path,
    toolUseConfirm,
    toolPermissionContext,
    onDone,
    completionType,
    languageName,
    operationType,
  } = params

  logPermissionEvent('accept', completionType, languageName, messageId)

  // For claude-folder scope, grant session-level access to all .claude/ files
  if (
    options?.scope === 'claude-folder' ||
    options?.scope === 'global-claude-folder'
  ) {
    const pattern =
      options.scope === 'global-claude-folder'
        ? GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN
        : CLAUDE_FOLDER_PERMISSION_PATTERN
    const suggestions: PermissionUpdate[] = [
      {
        type: 'addRules',
        rules: [
          {
            toolName: FILE_EDIT_TOOL_NAME,
            ruleContent: pattern,
          },
        ],
        behavior: 'allow',
        destination: 'session',
      },
    ]
    onDone()
    toolUseConfirm.onAllow(toolUseConfirm.input, suggestions)
    return
  }

  // Generate permission updates if path is provided
  const suggestions = path
    ? generateSuggestions(path, operationType, toolPermissionContext)
    : []

  onDone()
  // Pass permission updates directly to onAllow
  toolUseConfirm.onAllow(toolUseConfirm.input, suggestions)
}

function handleReject(
  params: PermissionHandlerParams,
  options?: PermissionHandlerOptions,
): void {
  const {
    messageId,
    toolUseConfirm,
    onDone,
    onReject,
    completionType,
    languageName,
  } = params

  logPermissionEvent(
    'reject',
    completionType,
    languageName,
    messageId,
    options?.hasFeedback,
  )

  onDone()
  onReject()
  toolUseConfirm.onReject(options?.feedback)
}

export const PERMISSION_HANDLERS: Record<
  PermissionOption['type'],
  (params: PermissionHandlerParams, options?: PermissionHandlerOptions) => void
> = {
  'accept-once': handleAcceptOnce,
  'accept-session': handleAcceptSession,
  reject: handleReject,
}
