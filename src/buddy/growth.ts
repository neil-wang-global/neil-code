import { getActiveCompanion, updateActiveCompanion } from './companion.js'
import {
  getLevelFromExp,
  MAX_EV_PER_STAT,
  MAX_EV_TOTAL,
  SHINY_EXP_MULTIPLIER,
  SHINY_EV_MULTIPLIER,
  EV_GAIN_CHANCE,
  STAT_NAMES,
  type StatName,
} from './types.js'

export type LevelUpResult = {
  companionName: string
  oldLevel: number
  newLevel: number
} | null

/**
 * Add experience based on tokens used in a conversation turn.
 * Shiny companions get 1.2× exp.
 * Returns level-up info if the companion leveled up.
 */
export function addExperience(inputTokens: number, outputTokens: number): LevelUpResult {
  const companion = getActiveCompanion()
  if (!companion) return null

  const rawExp = inputTokens + outputTokens
  const exp = companion.shiny ? Math.floor(rawExp * SHINY_EXP_MULTIPLIER) : rawExp
  const oldLevel = companion.level

  const updated = updateActiveCompanion(current => {
    const newExp = current.exp + exp
    const newLevel = getLevelFromExp(newExp)
    return { ...current, exp: newExp, level: newLevel }
  })

  if (!updated) return null
  if (updated.level > oldLevel) {
    return { companionName: updated.name, oldLevel, newLevel: updated.level }
  }
  return null
}

export type EvGainResult = {
  companionName: string
  stat: StatName
  amount: number
} | null

/**
 * 10% chance per turn to gain EV in the dimension classified by Haiku.
 * Shiny companions gain 2× EV.
 * Returns false if no roll should happen (either by chance or cap).
 */
export function shouldRollForEv(): boolean {
  const companion = getActiveCompanion()
  if (!companion) return false
  const totalEvs = STAT_NAMES.reduce((sum, s) => sum + companion.evs[s], 0)
  if (totalEvs >= MAX_EV_TOTAL) return false
  return Math.random() < EV_GAIN_CHANCE
}

/**
 * Apply EV gain to the given stat dimension.
 * Called after Haiku classifies the conversation.
 */
export function applyEvGain(stat: StatName): EvGainResult {
  const companion = getActiveCompanion()
  if (!companion) return null

  const amount = companion.shiny ? SHINY_EV_MULTIPLIER : 1
  const totalEvs = STAT_NAMES.reduce((sum, s) => sum + companion.evs[s], 0)
  if (totalEvs >= MAX_EV_TOTAL) return null
  if (companion.evs[stat] >= MAX_EV_PER_STAT) return null

  const actualGain = Math.min(
    amount,
    MAX_EV_PER_STAT - companion.evs[stat],
    MAX_EV_TOTAL - totalEvs,
  )
  if (actualGain <= 0) return null

  const updated = updateActiveCompanion(current => ({
    ...current,
    evs: { ...current.evs, [stat]: current.evs[stat] + actualGain },
  }))

  if (!updated) return null
  return { companionName: updated.name, stat, amount: actualGain }
}
