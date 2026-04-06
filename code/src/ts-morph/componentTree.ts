import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import z from 'zod'
import { createProject } from './project.js'
import { analyzeComponent } from './utils/analyzeComponent.js'
import { getComponent } from './utils/component.js'
import { TreeNode } from './utils/types.js'

export const registerComponentTreeTool = (server: McpServer) => {
  server.registerTool(
    'component_tree',
    {
      description:
        'Get the component tree for a given entry file and maximum depth',
      inputSchema: {
        entryFilePath: z.string().describe('Path to the entry file'),
        maxDepth: z
          .number()
          .default(3)
          .describe('Maximum depth of the component tree (default: 3)'),
        'data-id': z
          .string()
          .optional()
          .describe(
            'Optional attribute name to capture as TreeNode.dataId (example: data-attribute-id)',
          ),
      },
    },
    async ({ entryFilePath, maxDepth, ['data-id']: dataIdAttribute }) => {
      const tree = getComponentTree(entryFilePath, maxDepth, dataIdAttribute)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tree, null, 2),
          },
        ],
      }
    },
  )
}

const getComponentTree = (
  entryFilePath: string,
  maxDepth: number,
  dataIdAttribute?: string,
): TreeNode | null => {
  const project = createProject()
  const sourceFile = project.getSourceFile(entryFilePath)
  if (!sourceFile) {
    throw new Error(`File not found: ${entryFilePath}`)
  }

  const component = getComponent(sourceFile)

  return analyzeComponent(
    component,
    project,
    {
      maxDepth,
      dataIdAttribute,
    },
    0,
  )
}
