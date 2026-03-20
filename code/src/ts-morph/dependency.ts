import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Project } from 'ts-morph'
import z from 'zod'
import { createProject } from './project.js'

export const registerFindDependencyTool = (server: McpServer) => {
  server.registerTool(
    'find_dependency',
    {
      description: 'Find files with a given dependency',
      inputSchema: {
        dependencyName: z
          .string()
          .describe('Name of the dependency to search for'),
      },
    },
    async ({ dependencyName }) => {
      const project = createProject()
      const files = getFilesWithDependency(project, dependencyName)
      return {
        content: [
          {
            type: 'text',
            text: files.join('\n'),
          },
        ],
      }
    },
  )
}

const getFilesWithDependency = (project: Project, dependencyName: string) => {
  const sourceFiles = project.getSourceFiles()
  const filesWithDependency: string[] = []

  sourceFiles.forEach((sourceFile) => {
    const importDeclarations = sourceFile.getImportDeclarations()
    importDeclarations.forEach((importDeclaration) => {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue()
      if (
        moduleSpecifier === dependencyName ||
        moduleSpecifier.includes(`${dependencyName}/`)
      ) {
        filesWithDependency.push(sourceFile.getFilePath())
      }
    })
  })

  return filesWithDependency
}

export const findFilesWithDependency = (dependencyName: string) => {
  const project = createProject()
  return getFilesWithDependency(project, dependencyName)
}
