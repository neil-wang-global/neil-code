import type { Command } from '../../commands.js'

const buddy = {
  type: 'local-jsx',
  name: 'buddy',
  description: 'Hatch, pet, and interact with your AI companion',
  argumentHint: '[hatch | chat <msg> | pet | card | mute | unmute]',
  load: () => import('./buddy.js'),
} satisfies Command

export default buddy
