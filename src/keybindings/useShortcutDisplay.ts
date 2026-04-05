import { useOptionalKeybindingContext } from './KeybindingContext.js'
import type { KeybindingContextName } from './types.js'

// TODO(keybindings-migration): Remove fallback parameter after migration is complete.
// The fallback exists as a safety net during migration - if bindings fail to load
// or an action isn't found, we fall back to hardcoded values. Once stable, callers
// should be able to trust that getBindingDisplayText always returns a value for
// known actions, and we can remove this defensive pattern.

/**
 * Hook to get the display text for a configured shortcut.
 * Returns the configured binding or a fallback if unavailable.
 *
 * @param action - The action name (e.g., 'app:toggleTranscript')
 * @param context - The keybinding context (e.g., 'Global')
 * @param fallback - Fallback text if keybinding context unavailable
 * @returns The configured shortcut display text
 *
 * @example
 * const expandShortcut = useShortcutDisplay('app:toggleTranscript', 'Global', 'ctrl+o')
 * // Returns the user's configured binding, or 'ctrl+o' as default
 */
export function useShortcutDisplay(
  action: string,
  context: KeybindingContextName,
  fallback: string,
): string {
  const keybindingContext = useOptionalKeybindingContext()
  const resolved = keybindingContext?.getDisplayText(action, context)
  return resolved === undefined ? fallback : resolved
}
