import {
  ListResourcesResultSchema,
  ReadResourceResultSchema,
  type ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js'
import type { MCPServerConnection } from '../services/mcp/types.js'
import type { Command } from '../types/command.js'
import { errorMessage } from '../utils/errors.js'
import { parseFrontmatter } from '../utils/frontmatterParser.js'
import { logMCPError } from '../utils/log.js'
import { memoizeWithLRU } from '../utils/memoize.js'
import { normalizeNameForMCP } from '../services/mcp/normalization.js'
import { getMCPSkillBuilders } from './mcpSkillBuilders.js'

const MCP_FETCH_CACHE_SIZE = 20
const SKILL_URI_PREFIX = 'skill://'

export const fetchMcpSkillsForClient = memoizeWithLRU(
  async (client: MCPServerConnection): Promise<Command[]> => {
    if (client.type !== 'connected') return []

    try {
      if (!client.capabilities?.resources) return []

      const result = await client.client.request(
        { method: 'resources/list' },
        ListResourcesResultSchema,
      )

      if (!result.resources) return []

      const skillResources = result.resources.filter(r =>
        r.uri.startsWith(SKILL_URI_PREFIX),
      )

      if (skillResources.length === 0) return []

      const { parseSkillFrontmatterFields, createSkillCommand } =
        getMCPSkillBuilders()
      const serverPrefix = 'mcp__' + normalizeNameForMCP(client.name) + '__'

      const commands = await Promise.all(
        skillResources.map(async resource => {
          try {
            const readResult = (await client.client.request(
              { method: 'resources/read', params: { uri: resource.uri } },
              ReadResourceResultSchema,
            )) as ReadResourceResult

            const content = readResult.contents?.[0]
            if (!content || !('text' in content)) return null

            const { frontmatter, content: markdownContent } = parseFrontmatter(
              content.text,
            )

            const skillName =
              resource.name || resource.uri.slice(SKILL_URI_PREFIX.length)
            const resolvedName = serverPrefix + skillName

            const parsed = parseSkillFrontmatterFields(
              frontmatter,
              markdownContent,
              resolvedName,
            )

            return createSkillCommand({
              ...parsed,
              skillName: resolvedName,
              markdownContent,
              source: 'mcp',
              baseDir: undefined,
              loadedFrom: 'mcp',
              paths: undefined,
            })
          } catch (error) {
            logMCPError(
              client.name,
              `Failed to read skill resource ${resource.uri}: ${errorMessage(error)}`,
            )
            return null
          }
        }),
      )

      return commands.filter((c): c is Command => c !== null)
    } catch (error) {
      logMCPError(
        client.name,
        `Failed to fetch skills: ${errorMessage(error)}`,
      )
      return []
    }
  },
  (client: MCPServerConnection) => client.name,
  MCP_FETCH_CACHE_SIZE,
)
