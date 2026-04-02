import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { writeFileSyncAndFlush_DEPRECATED } from '../utils/file.js'
import type { Companion, StoredCompanion } from './types.js'

function getBuddySettingsPath(): string {
  return join(getClaudeConfigHomeDir(), 'buddy.settings.json')
}

/**
 * Read the companion from ~/.claude/buddy.settings.json.
 * Returns undefined if no companion has been initialized via /buddy hatch.
 */
export function getCompanion(): Companion | undefined {
  const path = getBuddySettingsPath()
  if (!existsSync(path)) return undefined
  try {
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw) as StoredCompanion
    if (data.effortUsed === undefined) {
      ;(data as Record<string, unknown>).effortUsed = 0
    }
    return data
  } catch {
    return undefined
  }
}

/**
 * Save a companion to ~/.claude/buddy.settings.json.
 */
export function saveCompanion(companion: StoredCompanion): void {
  const path = getBuddySettingsPath()
  writeFileSyncAndFlush_DEPRECATED(path, JSON.stringify(companion, null, 2))
}
