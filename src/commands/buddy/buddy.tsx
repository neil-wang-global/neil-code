import * as React from 'react'
import { Box, Text, useInput } from '../../ink.js'
import { useSetAppState } from '../../state/AppState.js'
import { saveGlobalConfig } from '../../utils/config.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import {
  addCompanion,
  getCompanion,
  listCompanions,
  removeCompanion,
  setActiveCompanion,
} from '../../buddy/companion.js'
import { generateCompanionProfile, chatWithCompanion } from '../../buddy/observer.js'
import { renderFace, renderSprite } from '../../buddy/sprites.js'
import {
  EYES,
  HATS,
  HAT_LABELS,
  PERSONALITIES,
  PERSONALITY_LABELS,
  RARITIES,
  RARITY_COLORS,
  RARITY_LABELS,
  RARITY_MULTIPLIERS,
  RARITY_STARS,
  RACE_LABELS,
  SPECIES,
  SPECIES_DESCRIPTIONS,
  SPECIES_LABELS,
  SPECIES_TO_RACE,
  STAT_NAMES,
  type Companion,
  type Eye,
  type Hat,
  type Personality,
  type Rarity,
  type Species,
  type StatName,
  getScaledBaseStats,
} from '../../buddy/types.js'

const CARD_WIDTH = 44

type OwnedCompanion = NonNullable<ReturnType<typeof getCompanion>>

function StatBar({
  name,
  value,
  color,
}: {
  name: string
  value: number
  color: string
}): React.ReactNode {
  return (
    <Text>
      <Text dimColor>{name.padEnd(10)}</Text>
      <Text color={color}>{String(value).padStart(4)}</Text>
    </Text>
  )
}

function CompanionCard({
  companion,
  onDone,
}: {
  companion: OwnedCompanion | Companion
  onDone: () => void
}): React.ReactNode {
  const color = RARITY_COLORS[companion.rarity]
  const sprite = renderSprite(companion)
  const stars = RARITY_STARS[companion.rarity]
  const raceLabel = RACE_LABELS[SPECIES_TO_RACE[companion.species]]

  useInput((_input, key) => {
    if (key.escape || key.return) {
      onDone()
    }
  })

  return (
    <>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={color}
        paddingX={2}
        paddingY={1}
        width={CARD_WIDTH}
      >
        <Box justifyContent="space-between">
          <Text bold color={color}>
            {companion.name}{stars}
          </Text>
          <Text dimColor>{SPECIES_LABELS[companion.species]}</Text>
        </Box>
        <Box justifyContent="center" flexDirection="column" alignItems="center">
          <Text dimColor>
            {companion.shiny
              ? `✨ ${RARITY_LABELS[companion.rarity]} ✨`
              : RARITY_LABELS[companion.rarity]}
          </Text>
          <Text dimColor>{raceLabel}</Text>
        </Box>
        <Box flexDirection="column" alignItems="center" marginTop={1}>
          {sprite.map((line, i) => (
            <Text key={i} color={color}>
              {line}
            </Text>
          ))}
        </Box>
        <Box flexDirection="column" alignItems="center" marginTop={1}>
          <Text dimColor italic>
            "{SPECIES_DESCRIPTIONS[companion.species]}"
          </Text>
        </Box>
        <Box
          flexDirection="column"
          marginTop={1}
          borderStyle="single"
          borderColor={color}
          borderLeft={false}
          borderRight={false}
          borderBottom={false}
          paddingTop={1}
        >
          {STAT_NAMES.map(stat => (
            <StatBar
              key={stat}
              name={stat}
              value={companion.stats[stat]}
              color={color}
            />
          ))}
        </Box>
        <Box justifyContent="center" marginTop={1}>
          <Text dimColor>按 Esc 或 Enter 关闭</Text>
        </Box>
      </Box>
      <Box paddingX={2} marginTop={1}>
        <Text dimColor italic>{companion.profile}</Text>
      </Box>
    </>
  )
}

type HatchStep =
  | 'species'
  | 'rarity'
  | 'shiny'
  | 'eye'
  | 'hat'
  | 'name'
  | 'personality'
  | 'iv'
  | 'imagine'
  | 'generating'
  | 'done'

function ListSelector<T extends string>({
  items,
  labels,
  onSelect,
  title,
}: {
  items: readonly T[]
  labels?: (item: T, index: number) => string
  onSelect: (item: T) => void
  title: string
}): React.ReactNode {
  const [index, setIndex] = React.useState(0)

  useInput((_input, key) => {
    if (key.upArrow) setIndex(i => Math.max(0, i - 1))
    else if (key.downArrow) setIndex(i => Math.min(items.length - 1, i + 1))
    else if (key.return) onSelect(items[index]!)
  })

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Text dimColor>（↑↓ 选择，Enter 确认）</Text>
      <Box flexDirection="column" marginTop={1}>
        {items.map((item, i) => (
          <Text key={item}>
            {i === index ? '▸ ' : '  '}
            {labels ? labels(item, i) : item}
          </Text>
        ))}
      </Box>
    </Box>
  )
}

function TextInput({
  title,
  onSubmit,
}: {
  title: string
  onSubmit: (value: string) => void
}): React.ReactNode {
  const [value, setValue] = React.useState('')

  useInput((input, key) => {
    if (key.return && value.trim()) {
      onSubmit(value.trim())
    } else if (key.backspace || key.delete) {
      setValue(v => v.slice(0, -1))
    } else if (input && !key.ctrl && !key.meta) {
      setValue(v => v + input)
    }
  })

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Box marginTop={1}>
        <Text>{'> '}</Text>
        <Text>{value}</Text>
        <Text dimColor>_</Text>
      </Box>
    </Box>
  )
}

function ImagineInput({
  onSubmit,
}: {
  onSubmit: (value: string) => void
}): React.ReactNode {
  const [value, setValue] = React.useState('')

  useInput((input, key) => {
    if (key.return) {
      onSubmit(value.trim())
    } else if (key.backspace || key.delete) {
      setValue(v => v.slice(0, -1))
    } else if (input && !key.ctrl && !key.meta) {
      setValue(v => v + input)
    }
  })

  return (
    <Box flexDirection="column">
      <Text bold>描述一下你的同伴——你想象它长什么样？</Text>
      <Text dimColor>这会影响它的性格档案。直接按 Enter 可跳过。</Text>
      <Box marginTop={1}>
        <Text>{'> '}</Text>
        <Text>{value}</Text>
        <Text dimColor>_</Text>
      </Box>
    </Box>
  )
}

const SPINNER_FRAMES = ['◐', '◓', '◑', '◒']

function GeneratingProfile({
  species,
  personality,
  userImagine,
  onDone,
}: {
  species: string
  personality: string
  userImagine: string
  onDone: (profile: string) => void
}): React.ReactNode {
  const [frame, setFrame] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length)
    }, 120)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    void generateCompanionProfile(species, personality, userImagine || undefined).then(onDone)
  }, [species, personality, userImagine, onDone])

  return (
    <Box flexDirection="column">
      <Text bold>{SPINNER_FRAMES[frame]} 同伴正在加入你的队伍中...</Text>
    </Box>
  )
}

const IV_BAR_WIDTH = 16

function IvAllocatorScreen({
  ivs,
  cursor,
  onChangeIvs,
  onChangeCursor,
  onDone,
}: {
  ivs: Record<StatName, number>
  cursor: number
  onChangeIvs: (updater: (prev: Record<StatName, number>) => Record<StatName, number>) => void
  onChangeCursor: (updater: (prev: number) => number) => void
  onDone: () => void
}): React.ReactNode {
  useInput((_input, key) => {
    if (key.upArrow) onChangeCursor(i => Math.max(0, i - 1))
    else if (key.downArrow) onChangeCursor(i => Math.min(STAT_NAMES.length - 1, i + 1))
    else if (key.rightArrow) {
      const stat = STAT_NAMES[cursor]!
      if (ivs[stat] < 31) {
        onChangeIvs(prev => ({ ...prev, [stat]: prev[stat] + 1 }))
      }
    } else if (key.leftArrow) {
      const stat = STAT_NAMES[cursor]!
      if (ivs[stat] > 0) {
        onChangeIvs(prev => ({ ...prev, [stat]: prev[stat] - 1 }))
      }
    } else if (key.return) {
      onDone()
    }
  })

  return (
    <Box flexDirection="column">
      <Text bold>调整个体值（0-31）</Text>
      <Text dimColor>（↑↓ 选择维度，←→ 调整，Enter 确认）</Text>
      <Box flexDirection="column" marginTop={1}>
        {STAT_NAMES.map((stat, i) => {
          const val = ivs[stat]
          const filled = Math.round((val / 31) * IV_BAR_WIDTH)
          const empty = IV_BAR_WIDTH - filled
          return (
            <Text key={stat}>
              {i === cursor ? '▸ ' : '  '}
              <Text dimColor>{stat.padEnd(10)}</Text>
              <Text color="green">{'█'.repeat(filled)}</Text>
              <Text dimColor>{'░'.repeat(empty)}</Text>
              <Text bold>{` ${String(val).padStart(2)}`}</Text>
            </Text>
          )
        })}
      </Box>
    </Box>
  )
}

function HatchScreen({
  onDone,
}: {
  onDone: (result?: string) => void
}): React.ReactNode {
  const [step, setStep] = React.useState<HatchStep>('species')
  const [species, setSpecies] = React.useState<Species>(SPECIES[0]!)
  const [rarity, setRarity] = React.useState<Rarity>('rare')
  const [shiny, setShiny] = React.useState(false)
  const [eye, setEye] = React.useState<Eye>(EYES[0]!)
  const [hat, setHat] = React.useState<Hat>('none')
  const [name, setName] = React.useState('')
  const [personality, setPersonality] = React.useState<Personality>(PERSONALITIES[0]!)
  const [userImagine, setUserImagine] = React.useState('')
  const [ivs, setIvs] = React.useState<Record<StatName, number> | null>(null)
  const [ivCursor, setIvCursor] = React.useState(0)
  const [companion, setCompanion] = React.useState<OwnedCompanion | null>(null)

  if (step === 'species') {
    return (
      <ListSelector
        title="请选择要领养的同伴物种："
        items={SPECIES}
        labels={sp => {
          const face = renderFace({ species: sp, eye: '·', hat: 'none' })
          const race = RACE_LABELS[SPECIES_TO_RACE[sp]]
          return `${face}  ${SPECIES_LABELS[sp]} · ${race}`
        }}
        onSelect={sp => {
          setSpecies(sp)
          setStep('rarity')
        }}
      />
    )
  }

  if (step === 'rarity') {
    return (
      <ListSelector
        title="请选择稀有度："
        items={RARITIES}
        labels={r => `${RARITY_STARS[r]} ${RARITY_LABELS[r]} (×${RARITY_MULTIPLIERS[r]})`}
        onSelect={r => {
          setRarity(r)
          setStep('shiny')
        }}
      />
    )
  }

  if (step === 'shiny') {
    return (
      <ListSelector
        title="是否为闪光形态？"
        items={['no', 'yes'] as const}
        labels={item => (item === 'yes' ? '✨ 是，闪光！' : '否，普通形态')}
        onSelect={item => {
          setShiny(item === 'yes')
          setStep('eye')
        }}
      />
    )
  }

  if (step === 'eye') {
    return (
      <ListSelector
        title="请选择眼睛样式："
        items={EYES}
        labels={e => {
          const face = renderFace({ species, eye: e, hat: 'none' })
          return `${face}  (${e})`
        }}
        onSelect={e => {
          setEye(e)
          setStep('hat')
        }}
      />
    )
  }

  if (step === 'hat') {
    const availableHats = rarity === 'common' ? (['none'] as const) : HATS
    if (rarity === 'common') {
      setHat('none')
      setStep('name')
      return null
    }
    return (
      <ListSelector
        title="请选择帽子："
        items={availableHats}
        labels={h => HAT_LABELS[h as Hat]}
        onSelect={h => {
          setHat(h as Hat)
          setStep('name')
        }}
      />
    )
  }

  if (step === 'name') {
    return (
      <TextInput
        title="给你的同伴起个名字："
        onSubmit={n => {
          setName(n)
          setStep('personality')
        }}
      />
    )
  }

  if (step === 'personality') {
    return (
      <ListSelector
        title="请选择性格："
        items={PERSONALITIES}
        labels={p => PERSONALITY_LABELS[p]}
        onSelect={p => {
          setPersonality(p)
          const randomIvs = {} as Record<StatName, number>
          for (const stat of STAT_NAMES) {
            randomIvs[stat] = Math.floor(Math.random() * 32)
          }
          setIvs(randomIvs)
          setIvCursor(0)
          setStep('iv')
        }}
      />
    )
  }

  if (step === 'iv' && ivs) {
    return (
      <IvAllocatorScreen
        ivs={ivs}
        cursor={ivCursor}
        onChangeIvs={setIvs as (updater: (prev: Record<StatName, number>) => Record<StatName, number>) => void}
        onChangeCursor={setIvCursor}
        onDone={() => setStep('imagine')}
      />
    )
  }

  if (step === 'imagine') {
    return (
      <ImagineInput
        onSubmit={text => {
          setUserImagine(text)
          setStep('generating')
        }}
      />
    )
  }

  if (step === 'generating') {
    return (
      <GeneratingProfile
        species={species}
        personality={personality}
        userImagine={userImagine}
        onDone={profile => {
          const baseStats = getScaledBaseStats(species, rarity)
          const finalStats = {} as Record<StatName, number>
          for (const stat of STAT_NAMES) {
            finalStats[stat] = baseStats[stat] + (ivs?.[stat] ?? 0)
          }
          const newCompanion: Companion = {
            species,
            rarity,
            eye,
            hat,
            shiny,
            name,
            personality,
            profile,
            stats: finalStats,
            hatchedAt: Date.now(),
            effortUsed: 0,
          }
          const stored = addCompanion(newCompanion)
          setCompanion(stored)
          setStep('done')
        }}
      />
    )
  }

  if (step === 'done' && companion) {
    return (
      <Box flexDirection="column">
        <Text bold color={RARITY_COLORS[companion.rarity]}>
          新同伴已加入你的收藏！
        </Text>
        <CompanionCard companion={companion} onDone={() => onDone()} />
      </Box>
    )
  }

  return null
}

function CompanionListScreen({
  onDone,
}: {
  onDone: (result?: string) => void
}): React.ReactNode {
  const companions = listCompanions()
  const active = getCompanion()
  const [index, setIndex] = React.useState(
    Math.max(
      0,
      companions.findIndex(companion => companion.id === active?.id),
    ),
  )

  useInput((_input, key) => {
    if (key.escape) {
      onDone()
      return
    }
    if (key.upArrow) setIndex(i => Math.max(0, i - 1))
    else if (key.downArrow) setIndex(i => Math.min(companions.length - 1, i + 1))
    else if (key.return) {
      const selected = companions[index]
      if (!selected) return
      setActiveCompanion(selected.id)
      onDone(`已切换到 ${selected.name}`)
    }
  })

  if (companions.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold>你还没有领养任何同伴</Text>
        <Text dimColor>使用 /buddy hatch 开始领养。</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold>我的同伴列表</Text>
      <Text dimColor>（↑↓ 选择，Enter 切换当前展示，Esc 关闭）</Text>
      <Box flexDirection="column" marginTop={1}>
        {companions.map((companion, i) => {
          const isActive = companion.id === active?.id
          const rarity = RARITY_LABELS[companion.rarity]
          const species = SPECIES_LABELS[companion.species]
          const race = RACE_LABELS[SPECIES_TO_RACE[companion.species]]
          return (
            <Text key={companion.id} color={isActive ? RARITY_COLORS[companion.rarity] : undefined}>
              {i === index ? '▸ ' : '  '}
              {isActive ? '[当前] ' : ''}
              {companion.name} · {species} · {race} · {rarity} · 努力值 {companion.effortUsed}
            </Text>
          )
        })}
      </Box>
    </Box>
  )
}

function ReleaseScreen({
  onDone,
}: {
  onDone: (result?: string) => void
}): React.ReactNode {
  const companions = listCompanions()
  const [index, setIndex] = React.useState(0)
  const [confirming, setConfirming] = React.useState(false)

  useInput((_input, key) => {
    if (confirming) {
      const selected = companions[index]!
      if (key.return) {
        removeCompanion(selected.id)
        onDone(`${selected.name} 已被放归自然，一路顺风！`)
      } else if (key.escape) {
        setConfirming(false)
      }
      return
    }
    if (key.escape) {
      onDone()
      return
    }
    if (key.upArrow) setIndex(i => Math.max(0, i - 1))
    else if (key.downArrow) setIndex(i => Math.min(companions.length - 1, i + 1))
    else if (key.return) {
      setConfirming(true)
    }
  })

  const selected = companions[index]

  if (confirming && selected) {
    return (
      <Box flexDirection="column">
        <Text bold color="red">
          确定要放生 {selected.name}（{SPECIES_LABELS[selected.species]}）吗？
        </Text>
        <Text dimColor>此操作不可撤销。</Text>
        <Text dimColor>Enter 确认放生，Esc 取消</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text bold>选择要放生的同伴</Text>
      <Text dimColor>（↑↓ 选择，Enter 放生，Esc 取消）</Text>
      <Box flexDirection="column" marginTop={1}>
        {companions.map((companion, i) => {
          const species = SPECIES_LABELS[companion.species]
          const rarity = RARITY_LABELS[companion.rarity]
          return (
            <Text key={companion.id} color={i === index ? RARITY_COLORS[companion.rarity] : undefined}>
              {i === index ? '▸ ' : '  '}
              {companion.name} · {species} · {rarity}
            </Text>
          )
        })}
      </Box>
    </Box>
  )
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  const sub = args.trim().toLowerCase()

  if (sub === 'release') {
    const companions = listCompanions()
    if (companions.length === 0) {
      onDone('你还没有同伴，先试试 /buddy hatch 吧！')
      return null
    }
    return <ReleaseScreen onDone={onDone} />
  }

  if (sub.startsWith('chat ')) {
    const content = args.trim().slice(5).trim()
    if (!content) {
      onDone('用法：/buddy chat <消息>')
      return null
    }
    const companion = getCompanion()
    if (!companion) {
      onDone('你还没有同伴，先试试 /buddy hatch 吧！')
      return null
    }
    const ChatAction = (): React.ReactNode => {
      const setAppState = useSetAppState()
      React.useEffect(() => {
        void chatWithCompanion(content).then(reply => {
          if (reply) {
            setAppState(prev => ({ ...prev, companionReaction: reply }))
          }
          onDone()
        })
      }, [setAppState])
      return null
    }
    return <ChatAction />
  }

  if (sub === 'pet') {
    const companion = getCompanion()
    if (!companion) {
      onDone('你还没有同伴，先试试 /buddy hatch 吧！')
      return null
    }
    const PetAction = (): React.ReactNode => {
      const setAppState = useSetAppState()
      React.useEffect(() => {
        setAppState(prev => ({ ...prev, companionPetAt: Date.now() }))
        onDone(`你摸了摸 ${companion.name}！`)
      }, [setAppState])
      return null
    }
    return <PetAction />
  }

  if (sub === 'card') {
    const companion = getCompanion()
    if (!companion) {
      onDone('你还没有同伴，先试试 /buddy hatch 吧！')
      return null
    }
    return <CompanionCard companion={companion} onDone={() => onDone()} />
  }

  if (sub === 'list') {
    return <CompanionListScreen onDone={onDone} />
  }

  if (sub === 'mute') {
    saveGlobalConfig(config => ({ ...config, companionMuted: true }))
    const companion = getCompanion()
    const name = companion?.name ?? '同伴'
    const muteMessages = [
      `${name}正在闲逛，使用 /buddy unmute 让它回来。`,
      `${name}跑去摸鱼了，使用 /buddy unmute 叫它回来。`,
      `${name}溜出去散步了，使用 /buddy unmute 喊它回来。`,
      `${name}躲进了草丛里，使用 /buddy unmute 把它找回来。`,
      `${name}去小卖部买零食了，使用 /buddy unmute 催它回来。`,
      `${name}正在打盹，使用 /buddy unmute 叫醒它。`,
      `${name}钻进了代码缝隙里藏好了，使用 /buddy unmute 把它揪出来。`,
      `${name}偷偷跑去隔壁终端串门了，使用 /buddy unmute 叫它回来。`,
      `${name}抱着键盘睡着了，使用 /buddy unmute 戳戳它。`,
      `${name}正蹲在角落画圈圈，使用 /buddy unmute 安慰一下它。`,
      `${name}假装自己是注释，藏在代码里了，使用 /buddy unmute 让它现身。`,
      `${name}骑着光标去兜风了，使用 /buddy unmute 等它回来。`,
      `${name}在 node_modules 深处探险呢，使用 /buddy unmute 救它出来。`,
      `${name}去给 bug 们讲故事了，使用 /buddy unmute 召唤它。`,
      `${name}正在和编译器谈心，使用 /buddy unmute 打断它。`,
      `${name}缩成一团假装是个像素点，使用 /buddy unmute 让它变回来。`,
      `${name}去翻 git log 考古了，使用 /buddy unmute 叫它回来。`,
      `${name}偷溜去数星星了，使用 /buddy unmute 喊它回来干活。`,
      `${name}正趴在进度条上滑滑梯，使用 /buddy unmute 接住它。`,
      `${name}跳进了回收站躲清静，使用 /buddy unmute 把它捞出来。`,
    ]
    onDone(muteMessages[Math.floor(Math.random() * muteMessages.length)]!)
    return null
  }

  if (sub === 'unmute') {
    saveGlobalConfig(config => ({ ...config, companionMuted: false }))
    const companion = getCompanion()
    const name = companion?.name ?? '同伴'
    const unmuteMessages = [
      `${name}回来了，精神满满！`,
      `${name}打着哈欠晃回来了。`,
      `${name}从草丛里蹦了出来！`,
      `${name}气喘吁吁地跑回来了，手里还拎着零食。`,
      `${name}探出头来：「想我了吧？」`,
      `${name}拍了拍身上的灰，重新上岗了。`,
      `${name}带着一堆八卦从隔壁终端回来了。`,
      `${name}从 node_modules 深处爬了出来，看起来见了不少世面。`,
      `${name}收到召唤，瞬间归位！`,
      `${name}揉了揉眼睛：「啊，轮到我了？」`,
    ]
    onDone(unmuteMessages[Math.floor(Math.random() * unmuteMessages.length)]!)
    return null
  }

  if (sub === 'hatch' || sub === '') {
    const existing = getCompanion()
    if (existing && sub === '') {
      return <CompanionCard companion={existing} onDone={() => onDone()} />
    }
    return <HatchScreen onDone={onDone} />
  }

  onDone(
    `未知子命令：${sub}。可用命令：/buddy、/buddy hatch、/buddy list（在列表里直接切换）、/buddy release（放生）、/buddy chat <消息>、/buddy pet、/buddy card、/buddy mute、/buddy unmute`,
  )
  return null
}
