import { getCompanion, saveCompanion } from './companion.js'
import { STAT_NAMES, type StatName } from './types.js'

const GROWTH_CHANCE = 0.15
const MAX_EFFORT = 50
const MAX_STAT_VALUE = 100

export type GrowthResult = {
  stat: StatName
  oldValue: number
  newValue: number
  companionName: string
} | null

/**
 * Roll for stat growth after a conversation turn.
 * Returns the growth result if a stat increased, null otherwise.
 */
export function tryBuddyStatGrowth(): GrowthResult {
  const companion = getCompanion()
  if (!companion) return null
  if (companion.effortUsed >= MAX_EFFORT) return null
  if (Math.random() >= GROWTH_CHANCE) return null

  const growable = STAT_NAMES.filter(s => companion.stats[s] < MAX_STAT_VALUE)
  if (growable.length === 0) return null

  const stat = growable[Math.floor(Math.random() * growable.length)]!
  const oldValue = companion.stats[stat]
  const newValue = oldValue + 1

  companion.stats[stat] = newValue
  companion.effortUsed += 1
  saveCompanion(companion)

  return { stat, oldValue, newValue, companionName: companion.name }
}
