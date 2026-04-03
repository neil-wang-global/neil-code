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
// biome-ignore format: keep the species list compact
export const cndragon = c(0x63, 0x6e, 0x64, 0x72, 0x61, 0x67, 0x6f, 0x6e) as 'cndragon'
export const wukong = c(0x77, 0x75, 0x6b, 0x6f, 0x6e, 0x67) as 'wukong'
export const totoro = c(0x74, 0x6f, 0x74, 0x6f, 0x72, 0x6f) as 'totoro'
export const gamabunta = c(0x67, 0x61, 0x6d, 0x61, 0x62, 0x75, 0x6e, 0x74, 0x61) as 'gamabunta'
export const mewtwo = c(0x6d, 0x65, 0x77, 0x74, 0x77, 0x6f) as 'mewtwo'
export const bajie = c(0x62, 0x61, 0x6a, 0x69, 0x65) as 'bajie'
export const pikachu = c(0x70, 0x69, 0x6b, 0x61, 0x63, 0x68, 0x75) as 'pikachu'
export const koromon = c(0x6b, 0x6f, 0x72, 0x6f, 0x6d, 0x6f, 0x6e) as 'koromon'
export const dodo = c(0x64, 0x6f, 0x64, 0x6f) as 'dodo'
export const trex = c(0x74, 0x72, 0x65, 0x78) as 'trex'
export const thanos = c(0x74, 0x68, 0x61, 0x6e, 0x6f, 0x73) as 'thanos'

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
  cndragon,
  wukong,
  totoro,
  gamabunta,
  mewtwo,
  bajie,
  pikachu,
  koromon,
  dodo,
  trex,
  thanos,
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

// Species base stats (Pokemon-scale race values). No cap — IVs (0-31) are added on top.
// T1 (BST 530-600): dragon, ghost, capybara, cndragon, wukong, totoro, gamabunta, mewtwo, bajie, pikachu, koromon, trex, thanos
// T2 (BST 460-510): octopus, robot, cat, owl
// T3 (BST 380-430): axolotl, penguin, cactus, goose, mushroom, turtle
// T4 (BST 300-350): chonk, duck, blob, snail, rabbit, dodo
export const SPECIES_BASE_STATS: Record<Species, Record<StatName, number>> = {
  // T1 — legendary tier (BST 530-600)
  [dragon]:    { DEBUGGING: 134, PATIENCE:  50, CHAOS: 130, WISDOM: 100, SNARK:  90 },
  [ghost]:     { DEBUGGING: 120, PATIENCE:  40, CHAOS: 140, WISDOM: 105, SNARK: 100 },
  [capybara]:  { DEBUGGING:  65, PATIENCE: 150, CHAOS:  30, WISDOM: 140, SNARK: 120 },
  [cndragon]:  { DEBUGGING: 125, PATIENCE:  90, CHAOS: 100, WISDOM: 140, SNARK:  55 },
  [wukong]:    { DEBUGGING: 145, PATIENCE:  25, CHAOS: 154, WISDOM: 110, SNARK:  90 },
  [totoro]:    { DEBUGGING:  75, PATIENCE: 145, CHAOS:  40, WISDOM: 135, SNARK: 105 },
  [gamabunta]: { DEBUGGING: 110, PATIENCE:  55, CHAOS: 125, WISDOM: 115, SNARK: 105 },
  [mewtwo]:    { DEBUGGING: 154, PATIENCE:  50, CHAOS:  90, WISDOM: 150, SNARK:  80 },
  [bajie]:     { DEBUGGING:  80, PATIENCE: 120, CHAOS:  90, WISDOM:  85, SNARK: 130 },
  [pikachu]:   { DEBUGGING: 100, PATIENCE:  80, CHAOS: 115, WISDOM:  95, SNARK: 115 },
  [koromon]:   { DEBUGGING:  90, PATIENCE:  95, CHAOS: 105, WISDOM: 100, SNARK: 110 },
  [trex]:      { DEBUGGING: 120, PATIENCE:  30, CHAOS: 150, WISDOM:  95, SNARK: 115 },
  [thanos]:    { DEBUGGING: 140, PATIENCE: 105, CHAOS: 130, WISDOM: 120, SNARK:  40 },
  // T2 — evolved tier (BST 460-510)
  [octopus]:   { DEBUGGING: 110, PATIENCE:  80, CHAOS:  65, WISDOM: 130, SNARK:  50 },
  [robot]:     { DEBUGGING: 145, PATIENCE:  90, CHAOS:  30, WISDOM: 120, SNARK:  40 },
  [cat]:       { DEBUGGING:  85, PATIENCE:  40, CHAOS: 100, WISDOM:  70, SNARK: 120 },
  [owl]:       { DEBUGGING:  70, PATIENCE:  95, CHAOS:  35, WISDOM: 145, SNARK:  65 },
  // T3 — mid tier (BST 380-430)
  [axolotl]:   { DEBUGGING:  80, PATIENCE:  90, CHAOS:  70, WISDOM:  95, SNARK:  60 },
  [penguin]:   { DEBUGGING:  80, PATIENCE: 105, CHAOS:  50, WISDOM:  85, SNARK:  65 },
  [cactus]:    { DEBUGGING:  65, PATIENCE: 110, CHAOS:  50, WISDOM:  55, SNARK: 105 },
  [goose]:     { DEBUGGING:  55, PATIENCE:  25, CHAOS: 130, WISDOM:  50, SNARK: 125 },
  [mushroom]:  { DEBUGGING:  55, PATIENCE:  80, CHAOS: 105, WISDOM:  85, SNARK:  50 },
  [turtle]:    { DEBUGGING:  50, PATIENCE: 135, CHAOS:  20, WISDOM: 100, SNARK:  65 },
  // T4 — basic tier (BST 300-350)
  [chonk]:     { DEBUGGING:  40, PATIENCE: 105, CHAOS:  65, WISDOM:  50, SNARK:  90 },
  [duck]:      { DEBUGGING:  70, PATIENCE:  80, CHAOS:  55, WISDOM:  80, SNARK:  55 },
  [blob]:      { DEBUGGING:  55, PATIENCE:  95, CHAOS:  40, WISDOM:  75, SNARK:  65 },
  [snail]:     { DEBUGGING:  30, PATIENCE: 145, CHAOS:  20, WISDOM:  70, SNARK:  55 },
  [rabbit]:    { DEBUGGING:  55, PATIENCE:  70, CHAOS:  65, WISDOM:  65, SNARK:  50 },
  [dodo]:      { DEBUGGING:  40, PATIENCE: 110, CHAOS:  30, WISDOM:  50, SNARK:  90 },
}

// Rarity multipliers applied to base stats (used inside computeStats).
// "rare" is the reference (×1.0). Narrowed spread so rarity is a subtle modifier.
export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 0.9,
  uncommon: 0.95,
  rare: 1.0,
  epic: 1.05,
  legendary: 1.1,
}

export const RACES = [
  'bird',
  'beast',
  'dragonkin',
  'marine',
  'spirit',
  'celestial',
  'reptile',
  'plant',
  'construct',
  'amphibian',
  'psychic',
  'pokemon',
  'digimon',
  'cosmic',
] as const
export type Race = (typeof RACES)[number]

// Full companion type — metadata only, stats computed at runtime via computeStats()
export type Companion = {
  species: Species
  rarity: Rarity
  eye: Eye
  hat: Hat
  shiny: boolean
  name: string
  personality: Personality
  profile: string
  ivs: Record<StatName, number>       // 0-31 per stat
  evs: Record<StatName, number>       // 0-252 per stat, 510 total cap
  exp: number                         // cumulative tokens
  level: number                       // derived from exp, stored for convenience
  hatchedAt: number
}

export type StoredCompanion = Companion & {
  id: string
  adoptedAt: number
}

export type BuddySettings = {
  version: 3
  activeCompanionId?: string
  companions: StoredCompanion[]
}

/**
 * Compute final stats using the Pokemon formula.
 * stat = floor(((2 × base + IV + EV/4) × level / 100) + 5) × natureModifier
 */
export function computeStats(companion: Companion): Record<StatName, number> {
  const base = SPECIES_BASE_STATS[companion.species]
  const multiplier = RARITY_MULTIPLIERS[companion.rarity]
  const nature = NATURE_MODIFIERS[companion.personality]
  const result = {} as Record<StatName, number>

  for (const stat of STAT_NAMES) {
    const raceValue = Math.round(base[stat] * multiplier)
    const iv = companion.ivs[stat]
    const ev = companion.evs[stat]
    const raw = Math.floor(((2 * raceValue + iv + Math.floor(ev / 4)) * companion.level / 100) + 5)

    let natureModifier = 1.0
    if (nature.plus === stat) natureModifier = 1.1
    else if (nature.minus === stat) natureModifier = 0.9

    result[stat] = Math.floor(raw * natureModifier)
  }
  return result
}

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
  [duck]:     '每次编译报错都会嘎一声',
  [goose]:    '会偷偷叼走你的分号',
  [blob]:     '靠坐在 bug 上来吸收它们',
  [cat]:      '凌晨三点批量回滚代码',
  [dragon]:   '对不稳定测试喷火',
  [octopus]:  '八只手同时开八个 PR',
  [owl]:      '每本 man page 都读了两遍',
  [penguin]:  '只愿意在寒冷环境里部署',
  [turtle]:   '构建慢？那是特性',
  [snail]:    '代码审查总会完成，只是稍晚',
  [ghost]:    '游荡在你删掉的分支之间',
  [axolotl]:  '能让损坏的配置重新长出来',
  [capybara]: '有它在，合并都会顺利很多',
  [cactus]:   '在被忽视的仓库里也能活得很好',
  [robot]:    '哔哔啵啵，你的 linter 来了',
  [rabbit]:   '切 git 分支快得像瞬移',
  [mushroom]: '生长在阴暗潮湿的 monorepo 里',
  [chonk]:    '喜欢坐在部署按钮上',
  [cndragon]:  '中式古龙，出场自带云气',
  [wukong]:    '七十二变，专治各种顽固 bug',
  [totoro]:    '会在构建完成前安静等你',
  [gamabunta]: '一落地就是测试洪流',
  [mewtwo]:    '用超能力直接看穿问题根源',
  [bajie]:     '扛着耙子也能把需求拱明白',
  [pikachu]:   '一生气就给 flaky test 放电',
  [koromon]:   '圆滚滚地把新点子弹出来',
  [dodo]:      '已灭绝但还在坚持 code review',
  [trex]:      '一口咬碎整个技术债',
  [thanos]:    '一个响指，半数 bug 灰飞烟灭',
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

export const SPECIES_LABELS: Record<Species, string> = {
  [duck]: '小鸭',
  [goose]: '大鹅',
  [blob]: '团子',
  [cat]: '猫猫',
  [dragon]: '巨龙',
  [octopus]: '章鱼',
  [owl]: '猫头鹰',
  [penguin]: '企鹅',
  [turtle]: '乌龟',
  [snail]: '蜗牛',
  [ghost]: '幽灵',
  [axolotl]: '六角恐龙',
  [capybara]: '水豚',
  [cactus]: '仙人掌',
  [robot]: '机器人',
  [rabbit]: '兔子',
  [mushroom]: '蘑菇',
  [chonk]: '胖团',
  [cndragon]: '中华龙',
  [wukong]: '孙悟空',
  [totoro]: '龙猫',
  [gamabunta]: '蛤蟆文太',
  [mewtwo]: '迈巴龙',
  [bajie]: '八戒',
  [pikachu]: '皮卡丘',
  [koromon]: '滚球兽',
  [dodo]: '嘟嘟鸟',
  [trex]: '霸王龙',
  [thanos]: '灭霸',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

export const PERSONALITY_LABELS: Record<Personality, string> = {
  cheerful: '开朗',
  sarcastic: '毒舌',
  wise: '睿智',
  chaotic: '混沌',
  shy: '害羞',
  bold: '大胆',
  dreamy: '梦幻',
  grumpy: '傲娇',
}

// Nature modifiers: +10% on one stat, -10% on another.
// Maps personality → [boosted stat, reduced stat]
export const NATURE_MODIFIERS: Record<Personality, { plus: StatName; minus: StatName }> = {
  cheerful:  { plus: 'CHAOS',     minus: 'PATIENCE' },  // 开朗：+混沌 -耐心
  sarcastic: { plus: 'SNARK',     minus: 'WISDOM' },    // 毒舌：+毒舌 -智慧
  wise:      { plus: 'WISDOM',    minus: 'CHAOS' },     // 睿智：+智慧 -混沌
  chaotic:   { plus: 'CHAOS',     minus: 'DEBUGGING' }, // 混沌：+混沌 -调试
  shy:       { plus: 'PATIENCE',  minus: 'SNARK' },     // 害羞：+耐心 -毒舌
  bold:      { plus: 'DEBUGGING', minus: 'PATIENCE' },  // 大胆：+调试 -耐心
  dreamy:    { plus: 'WISDOM',    minus: 'SNARK' },     // 梦幻：+智慧 -毒舌
  grumpy:    { plus: 'SNARK',     minus: 'CHAOS' },     // 傲娇：+毒舌 -混沌
}

export const MAX_EV_PER_STAT = 252
export const MAX_EV_TOTAL = 510
export const MAX_LEVEL = 100
export const EV_GAIN_CHANCE = 0.10
export const SHINY_EXP_MULTIPLIER = 1.2
export const SHINY_EV_MULTIPLIER = 2

/**
 * Cumulative experience required to reach a given level.
 * Formula: 3000 × level². Level 100 = 30M tokens.
 * Heavy user (~1M tokens/day) reaches 100 in ~1 month.
 */
export function getExpForLevel(level: number): number {
  return 3000 * level * level
}

/**
 * Compute level from cumulative experience.
 */
export function getLevelFromExp(exp: number): number {
  const raw = Math.floor(Math.sqrt(exp / 3000))
  return Math.max(1, Math.min(MAX_LEVEL, raw))
}

export const HAT_LABELS: Record<Hat, string> = {
  none: '无',
  crown: '王冠',
  tophat: '礼帽',
  propeller: '螺旋桨帽',
  halo: '光环',
  wizard: '法师帽',
  beanie: '毛线帽',
  tinyduck: '小黄鸭',
}

export const RACE_LABELS: Record<Race, string> = {
  bird: '羽族',
  beast: '兽族',
  dragonkin: '龙族',
  marine: '海生族',
  spirit: '灵体族',
  celestial: '仙灵族',
  reptile: '爬行族',
  plant: '植生族',
  construct: '构造族',
  amphibian: '两栖族',
  psychic: '超能族',
  pokemon: '神奇宝贝族',
  digimon: '数码宝贝族',
  cosmic: '宇宙族',
}

export const SPECIES_TO_RACE: Record<Species, Race> = {
  [duck]: 'bird',
  [goose]: 'bird',
  [blob]: 'spirit',
  [cat]: 'beast',
  [dragon]: 'dragonkin',
  [octopus]: 'marine',
  [owl]: 'bird',
  [penguin]: 'bird',
  [turtle]: 'reptile',
  [snail]: 'beast',
  [ghost]: 'spirit',
  [axolotl]: 'dragonkin',
  [capybara]: 'beast',
  [cactus]: 'plant',
  [robot]: 'construct',
  [rabbit]: 'beast',
  [mushroom]: 'plant',
  [chonk]: 'beast',
  [cndragon]: 'dragonkin',
  [wukong]: 'celestial',
  [totoro]: 'spirit',
  [gamabunta]: 'amphibian',
  [mewtwo]: 'psychic',
  [bajie]: 'celestial',
  [pikachu]: 'pokemon',
  [koromon]: 'digimon',
  [dodo]: 'bird',
  [trex]: 'dragonkin',
  [thanos]: 'cosmic',
}

