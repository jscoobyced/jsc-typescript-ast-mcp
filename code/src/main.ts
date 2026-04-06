import { getComponentTree } from './ts-morph/componentTree.js'

const testApp = getComponentTree(
  '/home/cedric/workspaces/jsc-typescript-ast-mcp/sample-app/src/App.tsx',
  5,
  'my-data-id',
)

console.log(JSON.stringify(testApp, null, 2))
