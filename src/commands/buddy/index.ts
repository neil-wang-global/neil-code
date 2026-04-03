import type { Command } from '../../commands.js'

const buddy = {
  type: 'local-jsx',
  name: 'buddy',
  description: '领养、查看、切换并陪伴你的 AI 同伴',
  argumentHint: '[hatch | list | release | chat <消息> | pet | card | mute | unmute]',
  load: () => import('./buddy.js'),
} satisfies Command

export default buddy
