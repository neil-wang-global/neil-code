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
const RECENT_MESSAGE_WINDOW = 10

function buildObserverSystemPrompt(
  name: string,
  species: string,
  personality: string,
  profile: string,
): string {
  return [
    `You are ${name}, a ${species} companion sitting beside the user's input box.`,
    `You observe the conversation between the user and the AI assistant, and react with a short comment in a speech bubble.`,
    '',
    `Your personality: ${personality}`,
    `Your profile: ${profile}`,
    '',
    'Rules:',
    '- Your comment MUST reference something specific from the conversation — a file name, a bug, a tool used, a decision made, or something the user/AI just said',
    '- Keep your comment to ONE sentence, max 60 characters',
    '- Stay fully in character based on your profile and personality',
    '- Do NOT write generic filler like "Keep going!" or "Nice!" — be specific',
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
  userImagine?: string,
): Promise<string> {
  const description =
    SPECIES_DESCRIPTIONS[species as Species] ?? species

  const imagineBlock = userImagine
    ? [
        '',
        `The user described their companion as: "${userImagine}"`,
        'This is the MOST important input — weave the user\'s vision into the profile as a central theme.',
      ].join('\n')
    : ''

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
          imagineBlock,
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
        content: 'Based on what just happened in the conversation above, write a short in-character reaction (max 60 chars). Reference something specific — a file, a bug, a tool call, or a decision. Do NOT be generic.',
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

function buildChatSystemPrompt(
  name: string,
  species: string,
  personality: string,
  profile: string,
): string {
  return [
    `You are ${name}, a ${species} companion.`,
    `The user is chatting with you directly.`,
    '',
    `Your personality: ${personality}`,
    `Your profile: ${profile}`,
    '',
    'Rules:',
    '- Reply in character, keep it short (1-2 sentences)',
    '- Be fun and engaging',
    '- Match the language the user is using',
  ].join('\n')
}

/**
 * Chat directly with the companion. Returns the companion's reply.
 * Used by /buddy chat {content}.
 */
export async function chatWithCompanion(
  content: string,
): Promise<string | null> {
  const companion = getCompanion()
  if (!companion) return null

  try {
    const controller = createAbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const messages = [createUserMessage({ content })]

    const response = await queryModelWithoutStreaming({
      messages,
      systemPrompt: asSystemPrompt([
        buildChatSystemPrompt(
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
        querySource: 'companion_chat',
        mcpTools: [],
        skipCacheWrite: true,
      },
    })

    clearTimeout(timeout)

    if (response.isApiErrorMessage) return null

    return getAssistantMessageText(response)?.trim() ?? null
  } catch {
    return null
  }
}
