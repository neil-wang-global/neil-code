// Centralized analytics/telemetry logging for tool permission decisions.
// All permission approve/reject events flow through logPermissionDecision(),
// which fans out to Statsig analytics, OTel telemetry, and code-edit metrics.
import { feature } from 'bun:bundle'
import { getCodeEditToolDecisionCounter } from '../../bootstrap/state.js'
import type { Tool as ToolType, ToolUseContext } from '../../Tool.js'
import { getLanguageName } from '../../utils/cliHighlight.js'
import { SandboxManager } from '../../utils/sandbox/sandbox-adapter.js'
import type {
  PermissionApprovalSource,
  PermissionRejectionSource,
} from './PermissionContext.js'

type PermissionLogContext = {
  tool: ToolType
  input: unknown
  toolUseContext: ToolUseContext
  messageId: string
  toolUseID: string
}

// Discriminated union: 'accept' pairs with approval sources, 'reject' with rejection sources
type PermissionDecisionArgs =
  | { decision: 'accept'; source: PermissionApprovalSource | 'config' }
  | { decision: 'reject'; source: PermissionRejectionSource | 'config' }

const CODE_EDITING_TOOLS = ['Edit', 'Write', 'NotebookEdit']

function isCodeEditingTool(toolName: string): boolean {
  return CODE_EDITING_TOOLS.includes(toolName)
}

// Builds OTel counter attributes for code editing tools, enriching with
// language when the tool's target file path can be extracted from input
async function buildCodeEditToolAttributes(
  tool: ToolType,
  input: unknown,
  decision: 'accept' | 'reject',
  source: string,
): Promise<Record<string, string>> {
  // Derive language from file path if the tool exposes one (e.g., Edit, Write)
  let language: string | undefined
  if (tool.getPath && input) {
    const parseResult = tool.inputSchema.safeParse(input)
    if (parseResult.success) {
      const filePath = tool.getPath(parseResult.data)
      if (filePath) {
        language = await getLanguageName(filePath)
      }
    }
  }

  return {
    decision,
    source,
    tool_name: tool.name,
    ...(language && { language }),
  }
}

// Flattens structured source into a string label for analytics/OTel events
function sourceToString(
  source: PermissionApprovalSource | PermissionRejectionSource,
): string {
  if (
    (feature('BASH_CLASSIFIER') || feature('TRANSCRIPT_CLASSIFIER')) &&
    source.type === 'classifier'
  ) {
    return 'classifier'
  }
  switch (source.type) {
    case 'hook':
      return 'hook'
    case 'user':
      return source.permanent ? 'user_permanent' : 'user_temporary'
    case 'user_abort':
      return 'user_abort'
    case 'user_reject':
      return 'user_reject'
    default:
      return 'unknown'
  }
}

// Single entry point for all permission decision logging. Called by permission
// handlers after every approve/reject. Fans out to: analytics events, OTel
// telemetry, code-edit OTel counters, and toolUseContext decision storage.
function logPermissionDecision(
  ctx: PermissionLogContext,
  args: PermissionDecisionArgs,
  permissionPromptStartTimeMs?: number,
): void {
  const { tool, input, toolUseContext, messageId, toolUseID } = ctx
  const { decision, source } = args

  const waiting_for_user_permission_ms =
    permissionPromptStartTimeMs !== undefined
      ? Date.now() - permissionPromptStartTimeMs
      : undefined

  // Log the analytics event
  if (args.decision === 'accept') {
    logApprovalEvent(
      tool,
      messageId,
      args.source,
      waiting_for_user_permission_ms,
    )
  } else {
    logRejectionEvent(
      tool,
      messageId,
      args.source,
      waiting_for_user_permission_ms,
    )
  }

  const sourceString = source === 'config' ? 'config' : sourceToString(source)

  // Track code editing tool metrics
  if (isCodeEditingTool(tool.name)) {
    void buildCodeEditToolAttributes(tool, input, decision, sourceString).then(
      attributes => getCodeEditToolDecisionCounter()?.add(1, attributes),
    )
  }

  // Persist decision on the context so downstream code can inspect what happened
  if (!toolUseContext.toolDecisions) {
    toolUseContext.toolDecisions = new Map()
  }
  toolUseContext.toolDecisions.set(toolUseID, {
    source: sourceString,
    decision,
    timestamp: Date.now(),
  })
}

export { isCodeEditingTool, buildCodeEditToolAttributes, logPermissionDecision }
export type { PermissionLogContext, PermissionDecisionArgs }
