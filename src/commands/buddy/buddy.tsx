import * as React from 'react'
import { Box, Text, useInput } from '../../ink.js'
import { useSetAppState } from '../../state/AppState.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import {
  getCompanion,
  companionUserId,
  roll,
} from '../../buddy/companion.js'
import { renderSprite } from '../../buddy/sprites.js'
import {
  RARITY_COLORS,
  RARITY_STARS,
  STAT_NAMES,
  type Companion,
} from '../../buddy/types.js'

// ── Card ──────────────────────────────────────────────────────────────

const CARD_WIDTH = 44

function StatBar({
  name,
  value,
  color,
}: {
  name: string
  value: number
  color: string
}): React.ReactNode {
  const filled = Math.round(value / 5)
  const empty = 20 - filled
  return (
    <Text>
      <Text dimColor>{name.padEnd(10)}</Text>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text dimColor>{'░'.repeat(empty)}</Text>
      <Text> {value}</Text>
    </Text>
  )
}

function CompanionCard({
  companion,
  onDone,
}: {
  companion: Companion
  onDone: () => void
}): React.ReactNode {
  const color = RARITY_COLORS[companion.rarity]
  const sprite = renderSprite(companion)
  const stars = RARITY_STARS[companion.rarity]

  useInput((_input, key) => {
    if (key.escape || key.return) {
      onDone()
    }
  })

  const shinyTag = companion.shiny ? ' [SHINY]' : ''
  const title = ` ${companion.name} `
  const subtitle = `${companion.species}${shinyTag}`

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={color}
      paddingX={2}
      paddingY={1}
      width={CARD_WIDTH}
    >
      {/* Header */}
      <Box justifyContent="center">
        <Text bold color={color}>
          {title}
        </Text>
      </Box>
      <Box justifyContent="center">
        <Text color={color}>{stars}</Text>
        <Text dimColor> {companion.rarity}{shinyTag}</Text>
      </Box>

      {/* Sprite */}
      <Box flexDirection="column" alignItems="center" marginTop={1}>
        {sprite.map((line, i) => (
          <Text key={i} color={color}>
            {line}
          </Text>
        ))}
      </Box>

      {/* Species + personality */}
      <Box flexDirection="column" alignItems="center" marginTop={1}>
        <Text dimColor>{subtitle}</Text>
        <Text dimColor italic>"{companion.personality}"</Text>
      </Box>

      {/* Stats */}
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

      {/* Footer hint */}
      <Box justifyContent="center" marginTop={1}>
        <Text dimColor>Press Esc or Enter to close</Text>
      </Box>
    </Box>
  )
}

// ── Hatch ─────────────────────────────────────────────────────────────

function HatchScreen({
  onDone,
}: {
  onDone: (result?: string) => void
}): React.ReactNode {
  const [companion, setCompanion] = React.useState<Companion | null>(null)

  React.useEffect(() => {
    const existing = getCompanion()
    if (existing) {
      setCompanion(existing)
      return
    }

    const userId = companionUserId()
    const { bones, inspirationSeed } = roll(userId)

    const names = [
      'Pip', 'Nox', 'Fizz', 'Boop', 'Wren', 'Tink', 'Mochi', 'Zeph',
      'Cosmo', 'Nimbus', 'Pixel', 'Sprout', 'Ember', 'Clover', 'Luna',
      'Ziggy', 'Pebble', 'Maple', 'Rusty', 'Misty',
    ]
    const name = names[inspirationSeed % names.length]!
    const personalities = [
      'cheerful and curious',
      'quietly observant',
      'mischievously playful',
      'wise beyond their years',
      'endlessly optimistic',
      'calm and collected',
      'energetic and bouncy',
      'thoughtful and kind',
    ]
    const personality =
      personalities[(inspirationSeed >> 4) % personalities.length]!

    const soul = { name, personality, hatchedAt: Date.now() }
    saveGlobalConfig(config => ({ ...config, companion: soul }))

    const fullCompanion: Companion = { ...bones, ...soul }
    setCompanion(fullCompanion)
  }, [])

  if (!companion) {
    return <Text>Hatching...</Text>
  }

  return (
    <Box flexDirection="column">
      <Text bold color={RARITY_COLORS[companion.rarity]}>
        Your companion hatched!
      </Text>
      <CompanionCard companion={companion} onDone={() => onDone()} />
    </Box>
  )
}

// ── Main command ──────────────────────────────────────────────────────

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  const sub = args.trim().toLowerCase()

  if (sub === 'pet') {
    const companion = getCompanion()
    if (!companion) {
      onDone('No companion yet — try /buddy hatch first!')
      return null
    }
    const PetAction = (): React.ReactNode => {
      const setAppState = useSetAppState()
      React.useEffect(() => {
        setAppState(prev => ({ ...prev, companionPetAt: Date.now() }))
        onDone(`You pet ${companion.name}!`)
      }, [setAppState])
      return null
    }
    return <PetAction />
  }

  if (sub === 'card') {
    const companion = getCompanion()
    if (!companion) {
      onDone('No companion yet — try /buddy hatch first!')
      return null
    }
    return <CompanionCard companion={companion} onDone={() => onDone()} />
  }

  if (sub === 'mute') {
    saveGlobalConfig(config => ({ ...config, companionMuted: true }))
    onDone('Companion muted. Use /buddy unmute to bring them back.')
    return null
  }

  if (sub === 'unmute') {
    saveGlobalConfig(config => ({ ...config, companionMuted: false }))
    onDone('Companion unmuted!')
    return null
  }

  if (sub === 'hatch' || sub === '') {
    const existing = getCompanion()
    if (existing && sub === '') {
      return <CompanionCard companion={existing} onDone={() => onDone()} />
    }
    if (existing && sub === 'hatch') {
      onDone(`You already have a companion: ${existing.name}!`)
      return null
    }
    return <HatchScreen onDone={onDone} />
  }

  onDone(
    `Unknown subcommand: ${sub}. Try: /buddy, /buddy hatch, /buddy pet, /buddy card, /buddy mute, /buddy unmute`,
  )
  return null
}
