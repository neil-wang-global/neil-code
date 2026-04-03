import { existsSync, readFileSync, unlinkSync } from 'fs'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { writeFileSyncAndFlush_DEPRECATED } from '../utils/file.js'
import type { BuddySettings, StoredCompanion } from './types.js'

function getBuddySettingsPath(): string {
  return join(getClaudeConfigHomeDir(), 'buddy.settings.json')
}

function isBuddySettings(data: unknown): data is BuddySettings {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return candidate.version === 3 && Array.isArray(candidate.companions)
}

function normalizeStoredCompanion(companion: StoredCompanion): StoredCompanion {
  return {
    ...companion,
    id: companion.id ?? randomUUID(),
    adoptedAt: companion.adoptedAt ?? companion.hatchedAt,
  }
}

function normalizeBuddySettings(settings: BuddySettings): BuddySettings {
  const companions = settings.companions.map(normalizeStoredCompanion)
  const activeExists = companions.some(c => c.id === settings.activeCompanionId)
  return {
    version: 3,
    companions,
    activeCompanionId:
      activeExists || companions.length === 0
        ? settings.activeCompanionId
        : companions[0]!.id,
  }
}

/**
 * Read all buddy settings from ~/.claude/buddy.settings.json.
 */
export function getBuddySettings(): BuddySettings {
  const path = getBuddySettingsPath()
  if (!existsSync(path)) {
    return { version: 3, companions: [] }
  }

  try {
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw) as unknown

    if (isBuddySettings(data)) {
      const normalized = normalizeBuddySettings(data)
      if (JSON.stringify(normalized) !== JSON.stringify(data)) {
        saveBuddySettings(normalized)
      }
      return normalized
    }

    // v1/v2 data is incompatible with v3 — wipe and start fresh
    const candidate = data as Record<string, unknown>
    if (candidate.version === 1 || candidate.version === 2) {
      unlinkSync(path)
      return { version: 3, companions: [] }
    }
  } catch {
    return { version: 3, companions: [] }
  }

  return { version: 3, companions: [] }
}

/**
 * Save all buddy settings to ~/.claude/buddy.settings.json.
 */
export function saveBuddySettings(settings: BuddySettings): void {
  const path = getBuddySettingsPath()
  const normalized = normalizeBuddySettings(settings)
  writeFileSyncAndFlush_DEPRECATED(path, JSON.stringify(normalized, null, 2))
}

/**
 * Read the currently active companion.
 */
export function getActiveCompanion(): StoredCompanion | undefined {
  const settings = getBuddySettings()
  if (settings.companions.length === 0) return undefined
  if (!settings.activeCompanionId) return settings.companions[0]
  return (
    settings.companions.find(c => c.id === settings.activeCompanionId) ??
    settings.companions[0]
  )
}

/**
 * Backwards-compatible alias for callers expecting a single current companion.
 */
export function getCompanion(): StoredCompanion | undefined {
  return getActiveCompanion()
}

export function listCompanions(): StoredCompanion[] {
  return getBuddySettings().companions
}

export function hasAnyCompanions(): boolean {
  return listCompanions().length > 0
}

export function addCompanion(companion: Companion | StoredCompanion): StoredCompanion {
  const settings = getBuddySettings()
  const stored = normalizeStoredCompanion(companion)
  saveBuddySettings({
    version: 3,
    companions: [...settings.companions, stored],
    activeCompanionId: stored.id,
  })
  return stored
}

export function setActiveCompanion(companionId: string): void {
  const settings = getBuddySettings()
  if (!settings.companions.some(c => c.id === companionId)) return
  saveBuddySettings({
    ...settings,
    activeCompanionId: companionId,
  })
}

export function removeCompanion(companionId: string): boolean {
  const settings = getBuddySettings()
  const idx = settings.companions.findIndex(c => c.id === companionId)
  if (idx === -1) return false

  const remaining = settings.companions.filter(c => c.id !== companionId)
  const needNewActive = settings.activeCompanionId === companionId
  saveBuddySettings({
    version: 3,
    companions: remaining,
    activeCompanionId: needNewActive
      ? (remaining[0]?.id ?? undefined)
      : settings.activeCompanionId,
  })
  return true
}

export function updateCompanion(
  companionId: string,
  updater: (companion: StoredCompanion) => StoredCompanion,
): StoredCompanion | undefined {
  const settings = getBuddySettings()
  let updated: StoredCompanion | undefined
  const companions = settings.companions.map(companion => {
    if (companion.id !== companionId) return companion
    updated = normalizeStoredCompanion(updater(companion))
    return updated
  })

  if (!updated) return undefined

  saveBuddySettings({
    ...settings,
    companions,
  })
  return updated
}

export function updateActiveCompanion(
  updater: (companion: StoredCompanion) => StoredCompanion,
): StoredCompanion | undefined {
  const active = getActiveCompanion()
  if (!active) return undefined
  return updateCompanion(active.id, updater)
}

/**
 * Save a companion as the active companion.
 * Existing callers can keep using this and it will update by id when present.
 */
export function saveCompanion(companion: StoredCompanion): void {
  const settings = getBuddySettings()
  if (settings.companions.some(c => c.id === companion.id)) {
    updateCompanion(companion.id, () => normalizeStoredCompanion(companion))
    setActiveCompanion(companion.id)
    return
  }

  addCompanion(companion)
}
