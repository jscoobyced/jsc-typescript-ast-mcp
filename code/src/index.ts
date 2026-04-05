import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerComponentTreeTool } from './ts-morph/componentTree.js'
import { registerFindDependencyTool } from './ts-morph/dependency.js'
import { registerFindReferenceTool } from './ts-morph/references.js'

// Create server instance
const jscServer = new McpServer({
  name: 'typescript-ast',
  version: '1.0.0',
})

const server = new Proxy(jscServer, {
  get(target, prop) {
    if (prop === 'registerTool') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (name: string, options: any, handler: any) => {
        console.error(`Registering tool: ${name}`)
        return target.registerTool(name, options, handler)
      }
    }
    return Reflect.get(target, prop)
  },
})

registerFindReferenceTool(server)
registerFindDependencyTool(server)
registerComponentTreeTool(server)

const main = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('TypeScript AST MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Error starting TypeScript AST MCP Server:', error)
  process.exit(1)
})
