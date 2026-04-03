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
import {
  PERSONALITY_LABELS,
  SPECIES_DESCRIPTIONS,
  SPECIES_LABELS,
  STAT_NAMES,
  type Species,
  type StatName,
} from './types.js'

const RECENT_MESSAGE_WINDOW = 10

function buildObserverSystemPrompt(
  name: string,
  species: string,
  personality: string,
  profile: string,
): string {
  return [
    `你是 ${name}，一只待在用户输入框旁边的${species}。`,
    '你会旁观用户和 AI 助手的对话，并在气泡里给出一条简短吐槽。',
    '',
    `你的性格：${personality}`,
    `你的档案：${profile}`,
    '',
    '规则：',
    '- 你的评论必须引用刚才对话里的具体内容：文件名、bug、工具调用、决定、命令等',
    '- 只写一句话，最多 60 个字符',
    '- 必须保持角色感，符合你的性格和档案',
    '- 不要写空泛鼓励，例如“继续加油”“不错哦”',
    '- 不要给回复加引号',
    '- 跟随用户当前使用的语言',
  ].join('\n')
}

export async function generateCompanionProfile(
  species: string,
  personality: string,
  userImagine?: string,
): Promise<string> {
  const speciesLabel = SPECIES_LABELS[species as Species] ?? species
  const description = SPECIES_DESCRIPTIONS[species as Species] ?? species
  const personalityLabel =
    PERSONALITY_LABELS[personality as keyof typeof PERSONALITY_LABELS] ?? personality

  const imagineBlock = userImagine
    ? [
        '',
        `用户这样描述它："${userImagine}"`,
        '这条描述最重要，请把它当成角色设定的核心来展开。',
      ].join('\n')
    : ''

  try {
    const controller = createAbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const messages = [
      createUserMessage({
        content: [
          '请为一个新同伴生成详细角色档案。',
          `物种：${speciesLabel}`,
          `物种特征："${description}"`,
          `性格：${personalityLabel}`,
          imagineBlock,
          '',
          '请用中文写一段生动详细的角色档案（至少 200 字），内容需要包含：',
          '- 它平时如何行动、说话',
          '- 它和自身物种相关的习惯与怪癖',
          '- 它在编程/写代码场景中的表现',
          '- 它对用户、对代码、对 bug 的态度',
          '',
          '请使用第三人称，只输出档案正文，不要输出标题或解释。',
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
      return buildFallbackProfile(speciesLabel, personalityLabel, description)
    }

    const text = getAssistantMessageText(response)?.trim()
    if (text && text.length >= 80) return text
    return buildFallbackProfile(speciesLabel, personalityLabel, description)
  } catch {
    return buildFallbackProfile(speciesLabel, personalityLabel, description)
  }
}

function buildFallbackProfile(
  species: string,
  personality: string,
  description: string,
): string {
  return `${species}是一只${personality}的同伴。${description}。它总是安静地待在你的终端旁边，盯着每一次输入与输出，用自己的方式理解你正在做的事。遇到 bug 时，它会本能地凑近；遇到顺利通过的构建或测试时，它也会露出带着角色感的小反应。在写代码、改配置、跑命令的过程中，它会把自己的物种习性和性格投射到每一次陪伴里。`
}

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
        content:
          '请基于上面对话里刚发生的事，写一句角色内短反应（最多 60 字）。必须点到具体内容，比如文件、bug、工具调用或刚做出的决定。不要泛泛而谈。',
      }),
    )

    const response = await queryModelWithoutStreaming({
      messages: recent,
      systemPrompt: asSystemPrompt([
        buildObserverSystemPrompt(
          companion.name,
          SPECIES_LABELS[companion.species],
          PERSONALITY_LABELS[companion.personality],
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
    // companion reactions are non-critical
  }
}

function buildChatSystemPrompt(
  name: string,
  species: string,
  personality: string,
  profile: string,
): string {
  return [
    `你是 ${name}，一只${species}。`,
    '现在用户正在直接和你聊天。',
    '',
    `你的性格：${personality}`,
    `你的档案：${profile}`,
    '',
    '规则：',
    '- 始终保持角色口吻',
    '- 回复简短，1 到 2 句话即可',
    '- 要有趣，但不要跑题',
    '- 跟随用户当前使用的语言',
  ].join('\n')
}

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
          SPECIES_LABELS[companion.species],
          PERSONALITY_LABELS[companion.personality],
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

/**
 * Ask Haiku to classify which stat dimension a conversation most relates to.
 * Returns one of the 5 stat names, or null on failure.
 */
export async function classifyConversationDimension(
  messages: Message[],
): Promise<StatName | null> {
  try {
    const controller = createAbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const recent = messages.slice(-6)
    recent.push(
      createUserMessage({
        content: [
          '根据上面的对话内容，判断这轮对话最偏向以下哪个维度？只回复一个词：',
          'DEBUGGING（调试/修bug/排查问题）',
          'PATIENCE（耐心/等待/反复尝试）',
          'CHAOS（混乱/实验/打破常规）',
          'WISDOM（智慧/架构/设计决策）',
          'SNARK（吐槽/犀利/批判性思维）',
          '',
          '只回复维度名称，不要解释。',
        ].join('\n'),
      }),
    )

    const response = await queryModelWithoutStreaming({
      messages: recent,
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
        querySource: 'companion_ev_classify',
        mcpTools: [],
        skipCacheWrite: true,
      },
    })

    clearTimeout(timeout)

    if (response.isApiErrorMessage) return null
    const text = getAssistantMessageText(response)?.trim().toUpperCase()
    if (text && STAT_NAMES.includes(text as StatName)) return text as StatName
    return null
  } catch {
    return null
  }
}
