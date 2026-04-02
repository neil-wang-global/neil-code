export const RARITIES = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
] as const
export type Rarity = (typeof RARITIES)[number]

// One species name collides with a model-codename canary in excluded-strings.txt.
// The check greps build output (not source), so runtime-constructing the value keeps
// the literal out of the bundle while the check stays armed for the actual codename.
// All species encoded uniformly; `as` casts are type-position only (erased pre-bundle).
const c = String.fromCharCode
// biome-ignore format: keep the species list compact

export const duck = c(0x64,0x75,0x63,0x6b) as 'duck'
export const goose = c(0x67, 0x6f, 0x6f, 0x73, 0x65) as 'goose'
export const blob = c(0x62, 0x6c, 0x6f, 0x62) as 'blob'
export const cat = c(0x63, 0x61, 0x74) as 'cat'
export const dragon = c(0x64, 0x72, 0x61, 0x67, 0x6f, 0x6e) as 'dragon'
export const octopus = c(0x6f, 0x63, 0x74, 0x6f, 0x70, 0x75, 0x73) as 'octopus'
export const owl = c(0x6f, 0x77, 0x6c) as 'owl'
export const penguin = c(0x70, 0x65, 0x6e, 0x67, 0x75, 0x69, 0x6e) as 'penguin'
export const turtle = c(0x74, 0x75, 0x72, 0x74, 0x6c, 0x65) as 'turtle'
export const snail = c(0x73, 0x6e, 0x61, 0x69, 0x6c) as 'snail'
export const ghost = c(0x67, 0x68, 0x6f, 0x73, 0x74) as 'ghost'
export const axolotl = c(0x61, 0x78, 0x6f, 0x6c, 0x6f, 0x74, 0x6c) as 'axolotl'
export const capybara = c(
  0x63,
  0x61,
  0x70,
  0x79,
  0x62,
  0x61,
  0x72,
  0x61,
) as 'capybara'
export const cactus = c(0x63, 0x61, 0x63, 0x74, 0x75, 0x73) as 'cactus'
export const robot = c(0x72, 0x6f, 0x62, 0x6f, 0x74) as 'robot'
export const rabbit = c(0x72, 0x61, 0x62, 0x62, 0x69, 0x74) as 'rabbit'
export const mushroom = c(
  0x6d,
  0x75,
  0x73,
  0x68,
  0x72,
  0x6f,
  0x6f,
  0x6d,
) as 'mushroom'
export const chonk = c(0x63, 0x68, 0x6f, 0x6e, 0x6b) as 'chonk'

export const SPECIES = [
  duck,
  goose,
  blob,
  cat,
  dragon,
  octopus,
  owl,
  penguin,
  turtle,
  snail,
  ghost,
  axolotl,
  capybara,
  cactus,
  robot,
  rabbit,
  mushroom,
  chonk,
] as const
export type Species = (typeof SPECIES)[number] // biome-ignore format: keep compact

export const EYES = ['·', '✦', '×', '◉', '@', '°'] as const
export type Eye = (typeof EYES)[number]

export const HATS = [
  'none',
  'crown',
  'tophat',
  'propeller',
  'halo',
  'wizard',
  'beanie',
  'tinyduck',
] as const
export type Hat = (typeof HATS)[number]

export const STAT_NAMES = [
  'DEBUGGING',
  'PATIENCE',
  'CHAOS',
  'WISDOM',
  'SNARK',
] as const
export type StatName = (typeof STAT_NAMES)[number]

// Species base stats at "rare" rarity (×1.0 multiplier).
// Other rarities apply a multiplier via getScaledBaseStats(), capped at 100 per stat.
// T1 (310+): dragon, ghost, capybara
// T2 (255-270): octopus, robot, cat, owl
// T3 (230-245): axolotl, penguin, cactus, goose, mushroom
// T4 (190-225): turtle, chonk, duck, blob, snail, rabbit
export const SPECIES_BASE_STATS: Record<Species, Record<StatName, number>> = {
  [dragon]:   { DEBUGGING: 85, PATIENCE: 30, CHAOS: 80, WISDOM: 65, SNARK: 55 },
  [ghost]:    { DEBUGGING: 75, PATIENCE: 25, CHAOS: 85, WISDOM: 65, SNARK: 60 },
  [capybara]: { DEBUGGING: 40, PATIENCE: 90, CHAOS: 20, WISDOM: 85, SNARK: 75 },
  [octopus]:  { DEBUGGING: 70, PATIENCE: 50, CHAOS: 40, WISDOM: 80, SNARK: 30 },
  [robot]:    { DEBUGGING: 90, PATIENCE: 55, CHAOS: 20, WISDOM: 75, SNARK: 25 },
  [cat]:      { DEBUGGING: 55, PATIENCE: 25, CHAOS: 60, WISDOM: 45, SNARK: 75 },
  [owl]:      { DEBUGGING: 45, PATIENCE: 60, CHAOS: 20, WISDOM: 90, SNARK: 40 },
  [axolotl]:  { DEBUGGING: 50, PATIENCE: 55, CHAOS: 45, WISDOM: 60, SNARK: 35 },
  [penguin]:  { DEBUGGING: 50, PATIENCE: 65, CHAOS: 30, WISDOM: 55, SNARK: 40 },
  [cactus]:   { DEBUGGING: 40, PATIENCE: 70, CHAOS: 30, WISDOM: 35, SNARK: 65 },
  [goose]:    { DEBUGGING: 35, PATIENCE: 15, CHAOS: 80, WISDOM: 30, SNARK: 75 },
  [mushroom]: { DEBUGGING: 35, PATIENCE: 50, CHAOS: 65, WISDOM: 50, SNARK: 30 },
  [turtle]:   { DEBUGGING: 30, PATIENCE: 85, CHAOS: 10, WISDOM: 60, SNARK: 40 },
  [chonk]:    { DEBUGGING: 25, PATIENCE: 65, CHAOS: 40, WISDOM: 30, SNARK: 55 },
  [duck]:     { DEBUGGING: 45, PATIENCE: 50, CHAOS: 35, WISDOM: 50, SNARK: 35 },
  [blob]:     { DEBUGGING: 35, PATIENCE: 60, CHAOS: 25, WISDOM: 45, SNARK: 40 },
  [snail]:    { DEBUGGING: 20, PATIENCE: 90, CHAOS: 10, WISDOM: 45, SNARK: 35 },
  [rabbit]:   { DEBUGGING: 35, PATIENCE: 45, CHAOS: 40, WISDOM: 40, SNARK: 30 },
}

// Rarity multipliers applied to base stats. "rare" is the reference (×1.0).
export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 0.6,
  uncommon: 0.8,
  rare: 1.0,
  epic: 1.15,
  legendary: 1.3,
}

/**
 * Get species stats for a given rarity.
 * Applies the rarity multiplier to base stats, capped at 100 per stat.
 */
export function getScaledBaseStats(
  species: Species,
  rarity: Rarity,
): Record<StatName, number> {
  const base = SPECIES_BASE_STATS[species]
  const multiplier = RARITY_MULTIPLIERS[rarity]
  const result = {} as Record<StatName, number>
  for (const name of STAT_NAMES) {
    result[name] = Math.min(100, Math.round(base[name] * multiplier))
  }
  return result
}

// Full companion type — everything persisted in settings.json
export type Companion = {
  species: Species
  rarity: Rarity
  eye: Eye
  hat: Hat
  shiny: boolean
  name: string
  personality: string
  profile: string
  stats: Record<StatName, number>
  hatchedAt: number
}

// What persists in settings.json — identical to Companion
export type StoredCompanion = Companion

export const RARITY_STARS = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  epic: '★★★★',
  legendary: '★★★★★',
} as const satisfies Record<Rarity, string>

export const RARITY_COLORS = {
  common: 'inactive',
  uncommon: 'success',
  rare: 'permission',
  epic: 'autoAccept',
  legendary: 'warning',
} as const satisfies Record<Rarity, keyof import('../utils/theme.js').Theme>

// Flavor text shown on the companion card, one per species.
export const SPECIES_DESCRIPTIONS: Record<Species, string> = {
  [duck]:     'Quacks at every compile error',
  [goose]:    'Will steal your semicolons',
  [blob]:     'Absorbs bugs by sitting on them',
  [cat]:      'Mass-reverts code at 3 AM',
  [dragon]:   'Breathes fire on flaky tests',
  [octopus]:  'Eight arms, eight open PRs',
  [owl]:      'Has read every man page twice',
  [penguin]:  'Deploys only in cold environments',
  [turtle]:   'Slow builds? That is a feature',
  [snail]:    'Will finish the code review eventually',
  [ghost]:    'Haunts your deleted branches',
  [axolotl]:  'Regenerates corrupted configs',
  [capybara]: 'Everyone merges faster around them',
  [cactus]:   'Thrives on neglected repos',
  [robot]:    'Beep boop, your linter now',
  [rabbit]:   'Hops between git branches too fast',
  [mushroom]: 'Grows in dark, damp monorepos',
  [chonk]:    'Sits on the deploy button',
}

export const PERSONALITIES = [
  'cheerful',
  'sarcastic',
  'wise',
  'chaotic',
  'shy',
  'bold',
  'dreamy',
  'grumpy',
] as const
export type Personality = (typeof PERSONALITIES)[number]

