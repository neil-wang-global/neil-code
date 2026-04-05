import type { Eye, Hat, Species } from './types.js'

// Minimal shape needed by render functions — works with both full Companion and partial data during hatch
type SpriteInput = { species: Species; eye: Eye; hat: Hat }
import {
  axolotl,
  blob,
  bulbasaur,
  cactus,
  capybara,
  cat,
  bajie,
  charmander,
  chonk,
  cndragon,
  dodo,
  dragon,
  duck,
  gamabunta,
  ghost,
  goose,
  koromon,
  mew,
  mewtwo,
  mushroom,
  octopus,
  owl,
  penguin,
  pikachu,
  rabbit,
  robot,
  shiba,
  snail,
  squirtle,
  thanos,
  totoro,
  trex,
  turtle,
  wukong,
} from './types.js'

// Each sprite is 5 lines tall, 12 wide (after {E}→1char substitution).
// Multiple frames per species for idle fidget animation.
// Line 0 is the hat slot — must be blank in frames 0-1; frame 2 may use it.
const BODIES: Record<Species, string[][]> = {
  [duck]: [
    [
      '            ',
      '    __      ',
      '  <({E} )___  ',
      '   (  ._>   ',
      '    `--´    ',
    ],
    [
      '            ',
      '    __      ',
      '  <({E} )___  ',
      '   (  ._>   ',
      '    `--´~   ',
    ],
    [
      '            ',
      '    __      ',
      '  <({E} )___  ',
      '   (  .__>  ',
      '    `--´    ',
    ],
  ],
  [goose]: [
    [
      '            ',
      '     ({E}>    ',
      '     ||     ',
      '   _(__)_   ',
      '    ^^^^    ',
    ],
    [
      '            ',
      '    ({E}>     ',
      '     ||     ',
      '   _(__)_   ',
      '    ^^^^    ',
    ],
    [
      '            ',
      '     ({E}>>   ',
      '     ||     ',
      '   _(__)_   ',
      '    ^^^^    ',
    ],
  ],
  [blob]: [
    [
      '            ',
      '   .----.   ',
      '  ( {E}  {E} )  ',
      '  (      )  ',
      '   `----´   ',
    ],
    [
      '            ',
      '  .------.  ',
      ' (  {E}  {E}  ) ',
      ' (        ) ',
      '  `------´  ',
    ],
    [
      '            ',
      '    .--.    ',
      '   ({E}  {E})   ',
      '   (    )   ',
      '    `--´    ',
    ],
  ],
  [cat]: [
    [
      '            ',
      '   /\\_/\\    ',
      '  ( {E}   {E})  ',
      '  (  ω  )   ',
      '  (")_(")   ',
    ],
    [
      '            ',
      '   /\\_/\\    ',
      '  ( {E}   {E})  ',
      '  (  ω  )   ',
      '  (")_(")~  ',
    ],
    [
      '            ',
      '   /\\-/\\    ',
      '  ( {E}   {E})  ',
      '  (  ω  )   ',
      '  (")_(")   ',
    ],
  ],
  [dragon]: [
    [
      '            ',
      '  /^\\  /^\\  ',
      ' <  {E}  {E}  > ',
      ' (   ~~   ) ',
      '  `-vvvv-´  ',
    ],
    [
      '            ',
      '  /^\\  /^\\  ',
      ' <  {E}  {E}  > ',
      ' (        ) ',
      '  `-vvvv-´  ',
    ],
    [
      '   ~    ~   ',
      '  /^\\  /^\\  ',
      ' <  {E}  {E}  > ',
      ' (   ~~   ) ',
      '  `-vvvv-´  ',
    ],
  ],
  [octopus]: [
    [
      '            ',
      '   .----.   ',
      '  ( {E}  {E} )  ',
      '  (______)  ',
      '  /\\/\\/\\/\\  ',
    ],
    [
      '            ',
      '   .----.   ',
      '  ( {E}  {E} )  ',
      '  (______)  ',
      '  \\/\\/\\/\\/  ',
    ],
    [
      '     o      ',
      '   .----.   ',
      '  ( {E}  {E} )  ',
      '  (______)  ',
      '  /\\/\\/\\/\\  ',
    ],
  ],
  [owl]: [
    [
      '            ',
      '   /\\  /\\   ',
      '  (({E})({E}))  ',
      '  (  ><  )  ',
      '   `----´   ',
    ],
    [
      '            ',
      '   /\\  /\\   ',
      '  (({E})({E}))  ',
      '  (  ><  )  ',
      '   .----.   ',
    ],
    [
      '            ',
      '   /\\  /\\   ',
      '  (({E})(-))  ',
      '  (  ><  )  ',
      '   `----´   ',
    ],
  ],
  [penguin]: [
    [
      '            ',
      '  .---.     ',
      '  ({E}>{E})     ',
      ' /(   )\\    ',
      '  `---´     ',
    ],
    [
      '            ',
      '  .---.     ',
      '  ({E}>{E})     ',
      ' |(   )|    ',
      '  `---´     ',
    ],
    [
      '  .---.     ',
      '  ({E}>{E})     ',
      ' /(   )\\    ',
      '  `---´     ',
      '   ~ ~      ',
    ],
  ],
  [turtle]: [
    [
      '            ',
      '   _,--._   ',
      '  ( {E}  {E} )  ',
      ' /[______]\\ ',
      '  ``    ``  ',
    ],
    [
      '            ',
      '   _,--._   ',
      '  ( {E}  {E} )  ',
      ' /[______]\\ ',
      '   ``  ``   ',
    ],
    [
      '            ',
      '   _,--._   ',
      '  ( {E}  {E} )  ',
      ' /[======]\\ ',
      '  ``    ``  ',
    ],
  ],
  [snail]: [
    [
      '            ',
      ' {E}    .--.  ',
      '  \\  ( @ )  ',
      '   \\_`--´   ',
      '  ~~~~~~~   ',
    ],
    [
      '            ',
      '  {E}   .--.  ',
      '  |  ( @ )  ',
      '   \\_`--´   ',
      '  ~~~~~~~   ',
    ],
    [
      '            ',
      ' {E}    .--.  ',
      '  \\  ( @  ) ',
      '   \\_`--´   ',
      '   ~~~~~~   ',
    ],
  ],
  [ghost]: [
    [
      '            ',
      '   .----.   ',
      '  / {E}  {E} \\  ',
      '  |      |  ',
      '  ~`~``~`~  ',
    ],
    [
      '            ',
      '   .----.   ',
      '  / {E}  {E} \\  ',
      '  |      |  ',
      '  `~`~~`~`  ',
    ],
    [
      '    ~  ~    ',
      '   .----.   ',
      '  / {E}  {E} \\  ',
      '  |      |  ',
      '  ~~`~~`~~  ',
    ],
  ],
  [axolotl]: [
    [
      '            ',
      '}~(______)~{',
      '}~({E} .. {E})~{',
      '  ( .--. )  ',
      '  (_/  \\_)  ',
    ],
    [
      '            ',
      '~}(______){~',
      '~}({E} .. {E}){~',
      '  ( .--. )  ',
      '  (_/  \\_)  ',
    ],
    [
      '            ',
      '}~(______)~{',
      '}~({E} .. {E})~{',
      '  (  --  )  ',
      '  ~_/  \\_~  ',
    ],
  ],
  [capybara]: [
    [
      '            ',
      '  n______n  ',
      ' ( {E}    {E} ) ',
      ' (   oo   ) ',
      '  `------´  ',
    ],
    [
      '            ',
      '  n______n  ',
      ' ( {E}    {E} ) ',
      ' (   Oo   ) ',
      '  `------´  ',
    ],
    [
      '    ~  ~    ',
      '  u______n  ',
      ' ( {E}    {E} ) ',
      ' (   oo   ) ',
      '  `------´  ',
    ],
  ],
  [cactus]: [
    [
      '            ',
      ' n  ____  n ',
      ' | |{E}  {E}| | ',
      ' |_|    |_| ',
      '   |    |   ',
    ],
    [
      '            ',
      '    ____    ',
      ' n |{E}  {E}| n ',
      ' |_|    |_| ',
      '   |    |   ',
    ],
    [
      ' n        n ',
      ' |  ____  | ',
      ' | |{E}  {E}| | ',
      ' |_|    |_| ',
      '   |    |   ',
    ],
  ],
  [robot]: [
    [
      '            ',
      '   .[||].   ',
      '  [ {E}  {E} ]  ',
      '  [ ==== ]  ',
      '  `------´  ',
    ],
    [
      '            ',
      '   .[||].   ',
      '  [ {E}  {E} ]  ',
      '  [ -==- ]  ',
      '  `------´  ',
    ],
    [
      '     *      ',
      '   .[||].   ',
      '  [ {E}  {E} ]  ',
      '  [ ==== ]  ',
      '  `------´  ',
    ],
  ],
  [rabbit]: [
    [
      '            ',
      '   (\\__/)   ',
      '  ( {E}  {E} )  ',
      ' =(  ..  )= ',
      '  (")__(")  ',
    ],
    [
      '            ',
      '   (|__/)   ',
      '  ( {E}  {E} )  ',
      ' =(  ..  )= ',
      '  (")__(")  ',
    ],
    [
      '            ',
      '   (\\__/)   ',
      '  ( {E}  {E} )  ',
      ' =( .  . )= ',
      '  (")__(")  ',
    ],
  ],
  [mushroom]: [
    [
      '            ',
      ' .-o-OO-o-. ',
      '(__________)',
      '   |{E}  {E}|   ',
      '   |____|   ',
    ],
    [
      '            ',
      ' .-O-oo-O-. ',
      '(__________)',
      '   |{E}  {E}|   ',
      '   |____|   ',
    ],
    [
      '   . o  .   ',
      ' .-o-OO-o-. ',
      '(__________)',
      '   |{E}  {E}|   ',
      '   |____|   ',
    ],
  ],
  [chonk]: [
    [
      '            ',
      '  /\\    /\\  ',
      ' ( {E}    {E} ) ',
      ' (   ..   ) ',
      '  `------´  ',
    ],
    [
      '            ',
      '  /\\    /|  ',
      ' ( {E}    {E} ) ',
      ' (   ..   ) ',
      '  `------´  ',
    ],
    [
      '            ',
      '  /\\    /\\  ',
      ' ( {E}    {E} ) ',
      ' (   ..   ) ',
      '  `------´~ ',
    ],
  ],
  [cndragon]: [
    [
      '   //\\ //\\  ',
      ' _//  V  \\\_ ',
      '<_ {E} -- {E} _>~',
      '  \\  ==  // ',
      ' ~==\\____//~ ',
    ],
    [
      '   //\\ //\\  ',
      ' _//  V  \\\_ ',
      '<_ {E} -- {E} _>~',
      '  \\  ==  /~ ',
      ' ~==\\____/  ',
    ],
    [
      ' ~ //\\ //\\ ~',
      ' _//  V  \\\_ ',
      '<_ {E} -- {E} _>~',
      '  \\  ==  // ',
      ' ~==\\____//~ ',
    ],
  ],
  [wukong]: [
    [
      '  ~^|=====|^~  ',
      ' {E}  ( oYo )  {E} ',
      '  (  \\_^_/  )  ',
      '   \\_|--|_/    ',
      '    |=====|    ',
    ],
    [
      '  ~^|=====|^~  ',
      ' {E}  ( oYo )  {E} ',
      '  (  /__^\\  )  ',
      '   \\_|--|_/    ',
      '    |=====|    ',
    ],
    [
      ' ~~^|=====|^~~ ',
      ' {E}  ( oYo )  {E} ',
      '  (  \\_^_/  )  ',
      '   \\_|--|_/    ',
      '     |===|     ',
    ],
  ],
  [totoro]: [
    [
      '   /\\    /\\  ',
      '  /  \\__/  \\ ',
      ' /   {E}    {E}   \\\\ ',
      ' |    /^^\\    | ',
      '  \\__(____)__/ ',
    ],
    [
      '   /\\    /\\  ',
      '  /  \\__/  \\ ',
      ' /   {E}    {E}   \\\\ ',
      ' |    \\^^/    | ',
      '  \\__(____)__/ ',
    ],
    [
      '   ~~~~~~~~   ',
      '  /  \\__/  \\ ',
      ' /   {E}    {E}   \\\\ ',
      ' |    /^^\\    | ',
      '  \\__(____)__/ ',
    ],
  ],
  [gamabunta]: [
    [
      '    .----.   ',
      '  _/ --  \\_ ',
      ' ( {E}  __  {E} ) ',
      '  \\ .____. / ',
      '   ^^    ^^  ',
    ],
    [
      '    .----.   ',
      '  _/ --  \\_ ',
      ' ( {E}  __  {E} ) ',
      '  \\ .====. / ',
      '   ^^    ^^  ',
    ],
    [
      '   ~ .--. ~  ',
      '  _/      \\_ ',
      ' ( {E}  __  {E} ) ',
      '  \\ .____. / ',
      '   ^^    ^^  ',
    ],
  ],
  [mewtwo]: [
    [
      '    /\\__/\\  ',
      '   /  {E}  {E}\\ ',
      '  |    --    | ',
      '  |   /__\\   | ',
      '   \\__==__/~ ',
    ],
    [
      '    /\\__/\\  ',
      '   /  {E}  {E}\\ ',
      '  |    ~~    | ',
      '  |   /__\\   | ',
      '   \\__==__/~ ',
    ],
    [
      '   * /\\__/\\ ',
      '   /  {E}  {E}\\ ',
      '  |    --    | ',
      '  |   /__\\   | ',
      '   \\__==__*/ ',
    ],
  ],
  [bajie]: [
    [
      '   .----.   ',
      '  / o  o\\  ',
      ' (  {E} () {E} ) ',
      ' (   __   ) ',
      '  /|_||_|\\ ',
    ],
    [
      '   .----.   ',
      '  / o  o\\  ',
      ' (  {E} () {E} ) ',
      ' (  .__.  ) ',
      '  /|_||_|\\ ',
    ],
    [
      '   ~----~   ',
      '  / o  o\\  ',
      ' (  {E} () {E} ) ',
      ' (   __   ) ',
      '   _||||_   ',
    ],
  ],
  [pikachu]: [
    [
      '  /\\    /\\  ',
      ' /  {E} __ {E} \\ ',
      '(    ..    )',
      ' \\  \\__/  / ',
      '  ~~    ~~  ',
    ],
    [
      '  /\\    /\\  ',
      ' /  {E} __ {E} \\ ',
      '(    ..    )',
      ' \\  /__\\  / ',
      '  ~~    ~~  ',
    ],
    [
      ' /\\  **  /\\ ',
      ' /  {E} __ {E} \\ ',
      '(    ..    )',
      ' \\  \\__/  / ',
      '  ~~    ~~  ',
    ],
  ],
  [koromon]: [
    [
      '   .----.   ',
      '  /  {E}  {E}\\  ',
      ' (   ====   ) ',
      ' (   .__.   ) ',
      '  `-(____)-´ ',
    ],
    [
      '   .----.   ',
      '  /  {E}  {E}\\  ',
      ' (   ====   ) ',
      ' (   \\__/   ) ',
      '  `-(____)-´ ',
    ],
    [
      '   *----*   ',
      '  /  {E}  {E}\\  ',
      ' (   ====   ) ',
      ' (   .__.   ) ',
      '  `-(____)-´ ',
    ],
  ],
  [dodo]: [
    [
      '            ',
      '   .---.    ',
      '  ({E}  )>   ',
      ' (  ____)   ',
      '  ~~  ~~    ',
    ],
    [
      '            ',
      '   .---.    ',
      '  ({E}  )>>  ',
      ' (  ____)   ',
      '  ~~  ~~    ',
    ],
    [
      '    ~ ~     ',
      '   .---.    ',
      '  ({E}  )>   ',
      ' (  ____)   ',
      '  ~~  ~~    ',
    ],
  ],
  [trex]: [
    [
      '            ',
      '  /^---^\\   ',
      ' < {E}   {E} >  ',
      '  \\ === /   ',
      '   \\/\\/\\/   ',
    ],
    [
      '            ',
      '  /^---^\\   ',
      ' < {E}   {E} >  ',
      '  \\ -=- /   ',
      '   \\/\\/\\/   ',
    ],
    [
      '   ~   ~    ',
      '  /^---^\\   ',
      ' < {E}   {E} >  ',
      '  \\ === /   ',
      '   \\/\\/\\/   ',
    ],
  ],
  [thanos]: [
    [
      '   /===\\    ',
      '  / {E}  {E} \\  ',
      ' |  ====  | ',
      ' | \\____/ | ',
      '  \\______/  ',
    ],
    [
      '   /===\\    ',
      '  / {E}  {E} \\  ',
      ' |  ~~~~  | ',
      ' | \\____/ | ',
      '  \\______/  ',
    ],
    [
      '  */===\\*   ',
      '  / {E}  {E} \\  ',
      ' |  ====  | ',
      ' | \\____/ | ',
      '  \\______/  ',
    ],
  ],
  [mew]: [
    [
      '            ',
      '   .~-~.    ',
      '  ( {E}  {E} )  ',
      '   ( .. )   ',
      '    ~--~  ~ ',
    ],
    [
      '            ',
      '   .~-~.    ',
      '  ( {E}  {E} )  ',
      '   ( .. )   ',
      '   ~--~   ~ ',
    ],
    [
      '     *      ',
      '   .~-~.    ',
      '  ( {E}  {E} )  ',
      '   ( .. )   ',
      '    ~--~ *  ',
    ],
  ],
  [charmander]: [
    [
      '            ',
      '   .---.    ',
      '  ( {E}  {E} )  ',
      '  (  __  )  ',
      '   `--´ *   ',
    ],
    [
      '            ',
      '   .---.    ',
      '  ( {E}  {E} )  ',
      '  (  __  )  ',
      '   `--´ **  ',
    ],
    [
      '            ',
      '   .---.    ',
      '  ( {E}  {E} )  ',
      '  ( .--. )  ',
      '   `--´*    ',
    ],
  ],
  [squirtle]: [
    [
      '            ',
      '   .---.    ',
      '  ( {E}  {E} )  ',
      '  (  __  )  ',
      '  [_/  \\_]  ',
    ],
    [
      '            ',
      '   .---.    ',
      '  ( {E}  {E} )  ',
      '  ( .--. )  ',
      '  [_/  \\_]  ',
    ],
    [
      '    ~ ~     ',
      '   .---.    ',
      '  ( {E}  {E} )  ',
      '  (  __  )  ',
      '  [_/  \\_]  ',
    ],
  ],
  [bulbasaur]: [
    [
      '            ',
      '  \\~~~~~//  ',
      '  ({E} __ {E})  ',
      '  ( .--. )  ',
      '   ``  ``   ',
    ],
    [
      '            ',
      '  //~~~~~\\  ',
      '  ({E} __ {E})  ',
      '  ( .--. )  ',
      '   ``  ``   ',
    ],
    [
      '    ~~~~    ',
      '  \\~~~~~//  ',
      '  ({E} __ {E})  ',
      '  ( .--. )  ',
      '   ``  ``   ',
    ],
  ],
  [shiba]: [
    [
      '            ',
      '  /\\    /\\  ',
      ' ( {E}    {E} ) ',
      ' (  \\__/  ) ',
      '  `------´  ',
    ],
    [
      '            ',
      '  /\\    /|  ',
      ' ( {E}    {E} ) ',
      ' (  \\__/  ) ',
      '  `------´~ ',
    ],
    [
      '            ',
      '  /\\    /\\  ',
      ' ( {E}    {E} ) ',
      ' (   __   ) ',
      '  `------´  ',
    ],
  ],
}

const HAT_LINES: Record<Hat, string> = {
  none: '',
  crown: '   \\^^^/    ',
  tophat: '   [___]    ',
  propeller: '    -+-     ',
  halo: '   (   )    ',
  wizard: '    /^\\     ',
  beanie: '   (___)    ',
  tinyduck: '    ,>      ',
}

export function renderSprite(bones: SpriteInput, frame = 0): string[] {
  const frames = BODIES[bones.species]
  const body = frames[frame % frames.length]!.map(line =>
    line.replaceAll('{E}', bones.eye),
  )
  const lines = [...body]
  // Only replace with hat if line 0 is empty (some fidget frames use it for smoke etc)
  if (bones.hat !== 'none' && !lines[0]!.trim()) {
    lines[0] = HAT_LINES[bones.hat]
  }
  // Drop blank hat slot — wastes a row in the Card and ambient sprite when
  // there's no hat and the frame isn't using it for smoke/antenna/etc.
  // Only safe when ALL frames have blank line 0; otherwise heights oscillate.
  if (!lines[0]!.trim() && frames.every(f => !f[0]!.trim())) lines.shift()
  return lines
}

export function spriteFrameCount(species: Species): number {
  return BODIES[species].length
}

/** Max display width (columns) of any rendered frame for the given species. */
export function spriteBodyWidth(species: Species): number {
  let max = 0
  for (const frame of BODIES[species]) {
    for (const line of frame) {
      const w = line.replaceAll('{E}', 'x').length
      if (w > max) max = w
    }
  }
  return max
}

export function renderFace(bones: SpriteInput): string {
  const eye: Eye = bones.eye
  switch (bones.species) {
    case duck:
    case goose:
      return `(${eye}>`
    case blob:
      return `(${eye}${eye})`
    case cat:
      return `=${eye}ω${eye}=`
    case dragon:
      return `<${eye}~${eye}>`
    case octopus:
      return `~(${eye}${eye})~`
    case owl:
      return `(${eye})(${eye})`
    case penguin:
      return `(${eye}>)`
    case turtle:
      return `[${eye}_${eye}]`
    case snail:
      return `${eye}(@)`
    case ghost:
      return `/${eye}${eye}\\`
    case axolotl:
      return `}${eye}.${eye}{`
    case capybara:
      return `(${eye}oo${eye})`
    case cactus:
      return `|${eye}  ${eye}|`
    case robot:
      return `[${eye}${eye}]`
    case rabbit:
      return `(${eye}..${eye})`
    case mushroom:
      return `|${eye}  ${eye}|`
    case chonk:
      return `(${eye}.${eye})`
    case cndragon:
      return `<${eye}=${eye}>`
    case wukong:
      return `@${eye}v${eye}@`
    case totoro:
      return `(${eye}^^${eye})`
    case gamabunta:
      return `(${eye}__${eye})`
    case mewtwo:
      return `/${eye}==${eye}\\`
    case bajie:
      return `(${eye}()${eye})`
    case pikachu:
      return `^${eye}__${eye}^`
    case koromon:
      return `(${eye}==${eye})`
    case dodo:
      return `(${eye}~>)`
    case trex:
      return `<${eye}vv${eye}>`
    case thanos:
      return `{${eye}==${eye}}`
    case mew:
      return `~${eye}..${eye}~`
    case charmander:
      return `(${eye}__${eye})*`
    case squirtle:
      return `(${eye}__${eye})`
    case bulbasaur:
      return `(${eye}~~${eye})`
    case shiba:
      return `(${eye}w${eye})`
  }
}
