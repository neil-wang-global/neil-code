import { getEmptyToolPermissionContext } from '../Tool.js'
import type { Message } from '../types/message.js'
import { getGlobalConfig } from '../utils/config.js'
import {
  createUserMessage,
  getAssistantMessageText,
} from '../utils/messages.js'
import { getSmallFastModel } from '../utils/model/model.js'
import { asSystemPrompt } from '../utils/systemPromptType.js'
import { createAbortController } from '../utils/abortController.js'
import { queryModelWithoutStreaming } from '../services/api/claude.js'
import { getCompanion } from './companion.js'
import { SPECIES_DESCRIPTIONS, type Species } from './types.js'

// Only send the last few messages to keep the sidecar call fast and cheap.
const RECENT_MESSAGE_WINDOW = 6

function buildObserverSystemPrompt(
  name: string,
  species: string,
  personality: string,
  profile: string,
): string {
  return [
    `You are ${name}, a ${species} companion sitting beside the user's input box.`,
    `You observe the conversation between user and AI, and occasionally comment in a speech bubble.`,
    '',
    `Your personality: ${personality}`,
    `Your profile: ${profile}`,
    '',
    'Rules:',
    '- React to what just happened with ONE very short quip (max 15 characters)',
    '- Stay fully in character based on your profile and personality',
    '- No quotes around your response',
    '- Match the language the user is using in the conversation',
  ].join('\n')
}

/**
 * Generate a rich profile for a newly hatched companion.
 * Called once during /buddy hatch and persisted in settings.json.
 * The profile must be at least 200 characters.
 */
export async function generateCompanionProfile(
  species: string,
  personality: string,
): Promise<string> {
  const description =
    SPECIES_DESCRIPTIONS[species as Species] ?? species

  try {
    const controller = createAbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const messages = [
      createUserMessage({
        content: [
          `Create a rich character profile for a companion buddy.`,
          `Species: ${species}`,
          `Species trait: "${description}"`,
          `Personality: ${personality}`,
          '',
          'Write a vivid, detailed profile (at least 200 characters) in English that describes:',
          '- How this companion behaves and talks',
          '- Their quirks and habits related to their species',
          '- How their personality manifests in a coding/programming context',
          '- Their attitude toward the user and toward code',
          '',
          'Write in third person. Be creative and fun. Output ONLY the profile text, nothing else.',
        ].join('\n'),
      }),
    ]

    const response = await queryModelWithoutStreaming({
      messages,
      systemPrompt: asSystemPrompt([]),
      thinkingConfig: { type: 'disabled' },
      tools: [],
      signal: controller.signal,
      options: {
        getToolPermissionContext: async () => getEmptyToolPermissionContext(),
        model: getSmallFastModel(),
        toolChoice: undefined,
        isNonInteractiveSession: false,
        hasAppendSystemPrompt: false,
        agents: [],
        querySource: 'companion_profile',
        mcpTools: [],
        skipCacheWrite: true,
      },
    })

    clearTimeout(timeout)

    if (response.isApiErrorMessage) {
      return buildFallbackProfile(species, personality, description)
    }

    const text = getAssistantMessageText(response)?.trim()
    if (text && text.length >= 200) return text
    return buildFallbackProfile(species, personality, description)
  } catch {
    return buildFallbackProfile(species, personality, description)
  }
}

function buildFallbackProfile(
  species: string,
  personality: string,
  description: string,
): string {
  return `A ${personality} ${species} companion. ${description}. This little creature sits beside your terminal, watching every keystroke with curious eyes. It reacts to your code with characteristic ${personality} energy, offering commentary that is equal parts endearing and entertaining. Whether you're debugging at midnight or deploying on a Friday, this companion is always there.`
}

/**
 * Fire-and-forget observer that generates a short in-character quip
 * after each AI reply. Called from REPL.tsx after the main query loop.
 */
export async function fireCompanionObserver(
  messages: Message[],
  setReaction: (reaction: string | undefined) => void,
): Promise<void> {
  const companion = getCompanion()
  if (!companion || getGlobalConfig().companionMuted) return
  if (messages.length === 0) return

  try {
    const controller = createAbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const recent = messages.slice(-RECENT_MESSAGE_WINDOW)
    recent.push(
      createUserMessage({
        content: 'React to the conversation above with a short quip.',
      }),
    )

    const response = await queryModelWithoutStreaming({
      messages: recent,
      systemPrompt: asSystemPrompt([
        buildObserverSystemPrompt(
          companion.name,
          companion.species,
          companion.personality,
          companion.profile,
        ),
      ]),
      thinkingConfig: { type: 'disabled' },
      tools: [],
      signal: controller.signal,
      options: {
        getToolPermissionContext: async () => getEmptyToolPermissionContext(),
        model: getSmallFastModel(),
        toolChoice: undefined,
        isNonInteractiveSession: false,
        hasAppendSystemPrompt: false,
        agents: [],
        querySource: 'companion_observer',
        mcpTools: [],
        skipCacheWrite: true,
      },
    })

    clearTimeout(timeout)

    if (response.isApiErrorMessage) return

    const text = getAssistantMessageText(response)
    if (text) {
      setReaction(text.trim())
    }
  } catch {
    // Silently swallow errors — companion reactions are non-critical
  }
}
