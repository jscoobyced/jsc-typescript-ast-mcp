import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Project } from 'ts-morph'
import { z } from 'zod'
import { createProject } from './project.js'

export const registerFindReferenceTool = (server: McpServer) => {
  server.registerTool(
    'find_reference',
    {
      description: 'Find references for a given class and method',
      inputSchema: {
        filePath: z.string().describe('Path to the file'),
        className: z.string().describe('Name of the class'),
        methodName: z.string().describe('Name of the method'),
      },
    },
    async ({ filePath, className, methodName }) => {
      const project = createProject()
      const references = getReferences(project, filePath, className, methodName)
      return {
        content: [
          {
            type: 'text',
            text: references.join('\n'),
          },
        ],
      }
    },
  )
}

const getReferences = (
  project: Project,
  fileName: string,
  className: string,
  methodName: string,
) => {
  const source = project.getSourceFileOrThrow(fileName)

  const method = source.getClass(className)!.getMethod(methodName)!

  const references = method.findReferences()

  const referencePaths: string[] = []

  references.forEach((reference) => {
    reference.getReferences().forEach((currentReference) => {
      const referenceNode = currentReference.getNode()
      const lineNumber = referenceNode.getStartLineNumber()
      const filePath = referenceNode.getSourceFile().getFilePath()
      referencePaths.push(`${filePath}:${lineNumber}`)
    })
  })

  return referencePaths
}
