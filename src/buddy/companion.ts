import { existsSync, readFileSync, unlinkSync } from 'fs'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { writeFileSyncAndFlush_DEPRECATED } from '../utils/file.js'
import { computeHmac, verifyHmac } from './integrity.js'
import {
  type BuddySettings,
  type Companion,
  type StoredCompanion,
  SPECIES,
  RARITIES,
  EYES,
  HATS,
  PERSONALITIES,
  STAT_NAMES,
  MAX_EV_PER_STAT,
  MAX_EV_TOTAL,
  getLevelFromExp,
  type StatName,
} from './types.js'

function getBuddySettingsPath(): string {
  return join(getClaudeConfigHomeDir(), 'buddy.settings.json')
}

function getHmacPath(): string {
  return join(getClaudeConfigHomeDir(), '.buddy.hmac')
}

function isBuddySettings(data: unknown): data is BuddySettings {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return candidate.version === 4 && Array.isArray(candidate.companions)
}

function isBuddySettingsV3(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  return candidate.version === 3 && Array.isArray(candidate.companions)
}

function randomIv(): number {
  return Math.floor(Math.random() * 32)
}

function generateRandomIvs(): Record<StatName, number> {
  const ivs = {} as Record<StatName, number>
  for (const stat of STAT_NAMES) {
    ivs[stat] = randomIv()
  }
  return ivs
}

function zeroEvs(): Record<StatName, number> {
  const evs = {} as Record<StatName, number>
  for (const stat of STAT_NAMES) {
    evs[stat] = 0
  }
  return evs
}

/**
 * Reset stats to initial values (used on tamper detection).
 * Preserves identity fields: id, species, name, personality, profile, hat, eye, shiny, rarity, hatchedAt, adoptedAt.
 */
function resetCompanionStats(companion: StoredCompanion): StoredCompanion {
  return {
    ...companion,
    exp: 0,
    level: 1,
    ivs: generateRandomIvs(),
    evs: zeroEvs(),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(value)))
}

function normalizeStoredCompanion(companion: StoredCompanion): StoredCompanion {
  // Validate enums — if invalid, these are signs of corruption, not tampering,
  // so we clamp rather than reset.
  const species = SPECIES.includes(companion.species as typeof SPECIES[number])
    ? companion.species
    : SPECIES[0]!
  const rarity = RARITIES.includes(companion.rarity as typeof RARITIES[number])
    ? companion.rarity
    : RARITIES[0]!
  const eye = EYES.includes(companion.eye as typeof EYES[number])
    ? companion.eye
    : EYES[0]!
  const hat = HATS.includes(companion.hat as typeof HATS[number])
    ? companion.hat
    : HATS[0]!
  const personality = PERSONALITIES.includes(companion.personality as typeof PERSONALITIES[number])
    ? companion.personality
    : PERSONALITIES[0]!

  // Validate IVs: 0-31
  const ivs = {} as Record<StatName, number>
  for (const stat of STAT_NAMES) {
    ivs[stat] = clamp(companion.ivs?.[stat] ?? randomIv(), 0, 31)
  }

  // Validate EVs: 0-252 per stat, 510 total
  const evs = {} as Record<StatName, number>
  let evTotal = 0
  for (const stat of STAT_NAMES) {
    const raw = clamp(companion.evs?.[stat] ?? 0, 0, MAX_EV_PER_STAT)
    const capped = Math.min(raw, MAX_EV_TOTAL - evTotal)
    evs[stat] = capped
    evTotal += capped
  }

  // Validate exp/level consistency
  const exp = Math.max(0, companion.exp ?? 0)
  const level = getLevelFromExp(exp)

  return {
    ...companion,
    id: companion.id ?? randomUUID(),
    adoptedAt: companion.adoptedAt ?? companion.hatchedAt,
    species,
    rarity,
    eye,
    hat,
    personality,
    shiny: typeof companion.shiny === 'boolean' ? companion.shiny : false,
    ivs,
    evs,
    exp,
    level,
  }
}

function normalizeBuddySettings(settings: BuddySettings): BuddySettings {
  const companions = settings.companions.map(normalizeStoredCompanion)
  const activeExists = companions.some(c => c.id === settings.activeCompanionId)
  return {
    version: 4,
    companions,
    activeCompanionId:
      activeExists || companions.length === 0
        ? settings.activeCompanionId
        : companions[0]!.id,
  }
}

/**
 * Read all buddy settings from ~/.claude/buddy.settings.json.
 * Handles migration from v3, HMAC verification, and field validation.
 */
export function getBuddySettings(): BuddySettings {
  const path = getBuddySettingsPath()
  if (!existsSync(path)) {
    return { version: 4, companions: [] }
  }

  try {
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw) as unknown

    if (isBuddySettings(data)) {
      // v4 — verify HMAC
      const hmacPath = getHmacPath()
      let tampered = true
      if (existsSync(hmacPath)) {
        try {
          const storedHmac = readFileSync(hmacPath, 'utf-8').trim()
          tampered = !verifyHmac(raw, storedHmac)
        } catch {
          tampered = true
        }
      }

      let settings = normalizeBuddySettings(data)

      if (tampered) {
        // Reset stats on all companions, preserve identity
        settings = {
          ...settings,
          companions: settings.companions.map(resetCompanionStats),
        }
        saveBuddySettings(settings)
      } else {
        // Re-save only if normalization changed anything (field clamping)
        const normalized = normalizeBuddySettings(data)
        if (JSON.stringify(normalized) !== JSON.stringify(data)) {
          saveBuddySettings(normalized)
        }
      }

      return settings
    }

    // v3 → v4 migration: keep data, generate signature
    if (isBuddySettingsV3(data)) {
      const v3 = data as { companions: StoredCompanion[]; activeCompanionId?: string }
      const migrated: BuddySettings = {
        version: 4,
        companions: v3.companions,
        activeCompanionId: v3.activeCompanionId,
      }
      const normalized = normalizeBuddySettings(migrated)
      saveBuddySettings(normalized)
      return normalized
    }

    // v1/v2/versionless — wipe and start fresh
    const candidate = data as Record<string, unknown>
    if (candidate.version === 1 || candidate.version === 2 || !candidate.version) {
      unlinkSync(path)
      return { version: 4, companions: [] }
    }
  } catch {
    return { version: 4, companions: [] }
  }

  return { version: 4, companions: [] }
}

/**
 * Save all buddy settings to ~/.claude/buddy.settings.json and write HMAC.
 */
export function saveBuddySettings(settings: BuddySettings): void {
  const path = getBuddySettingsPath()
  const normalized = normalizeBuddySettings(settings)
  const json = JSON.stringify(normalized, null, 2)
  writeFileSyncAndFlush_DEPRECATED(path, json)
  writeFileSyncAndFlush_DEPRECATED(getHmacPath(), computeHmac(json))
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
    version: 4,
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
    version: 4,
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
