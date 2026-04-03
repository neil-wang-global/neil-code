import { existsSync, readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { writeFileSyncAndFlush_DEPRECATED } from '../utils/file.js'
import type { BuddySettings, Companion, StoredCompanion } from './types.js'

function getBuddySettingsPath(): string {
  return join(getClaudeConfigHomeDir(), 'buddy.settings.json')
}

type LegacyStoredCompanion = Companion

function isLegacyCompanion(data: unknown): data is LegacyStoredCompanion {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return (
    typeof candidate.species === 'string' &&
    typeof candidate.rarity === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.profile === 'string' &&
    typeof candidate.hatchedAt === 'number'
  )
}

function isBuddySettings(data: unknown): data is BuddySettings {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return candidate.version === 2 && Array.isArray(candidate.companions)
}

function normalizeStoredCompanion(
  companion: LegacyStoredCompanion | StoredCompanion,
): StoredCompanion {
  const candidate = companion as StoredCompanion & { effortUsed?: number }
  return {
    ...candidate,
    id: candidate.id ?? randomUUID(),
    adoptedAt: candidate.adoptedAt ?? candidate.hatchedAt,
    effortUsed: candidate.effortUsed ?? 0,
  }
}

function normalizeBuddySettings(settings: BuddySettings): BuddySettings {
  const companions = settings.companions.map(normalizeStoredCompanion)
  const activeExists = companions.some(c => c.id === settings.activeCompanionId)
  return {
    version: 2,
    companions,
    activeCompanionId:
      activeExists || companions.length === 0
        ? settings.activeCompanionId
        : companions[0]!.id,
  }
}

function migrateLegacyCompanion(companion: LegacyStoredCompanion): BuddySettings {
  const normalized = normalizeStoredCompanion(companion)
  return {
    version: 2,
    companions: [normalized],
    activeCompanionId: normalized.id,
  }
}

/**
 * Read all buddy settings from ~/.claude/buddy.settings.json.
 * Migrates legacy single-companion files to the new multi-companion format.
 */
export function getBuddySettings(): BuddySettings {
  const path = getBuddySettingsPath()
  if (!existsSync(path)) {
    return { version: 2, companions: [] }
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

    if (isLegacyCompanion(data)) {
      const migrated = migrateLegacyCompanion(data)
      saveBuddySettings(migrated)
      return migrated
    }
  } catch {
    return { version: 2, companions: [] }
  }

  return { version: 2, companions: [] }
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
    version: 2,
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
    version: 2,
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
