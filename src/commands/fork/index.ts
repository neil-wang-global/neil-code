import type { Command } from '../../commands.js'

const fork = {
  type: 'local-jsx',
  name: 'fork',
  description: 'Fork a subagent with the current conversation context',
  argumentHint: '<directive>',
  isHidden: true,
  load: () => import('./fork.js'),
} satisfies Command

export default fork
