import { Node, Project } from 'ts-morph'
import { extractJSX, findReturnedJSX } from './extractJsx.js'
import { getComponentName } from './nameHelper.js'
import { AnalyzeOptions, TreeNode } from './types.js'

export const analyzeComponent = (
  node: Node,
  project: Project,
  options: AnalyzeOptions,
  currentDepth: number,
): TreeNode => {
  const name = getComponentName(node)

  console.error(`Analyzing component: ${name}, depth: ${currentDepth}`)

  const root: TreeNode = {
    name,
    type: 'component',
    children: [],
  }

  if (currentDepth >= options.maxDepth) {
    return root
  }

  const jsx = findReturnedJSX(node)
  if (!jsx) return root

  root.children = extractJSX(jsx, project, options, currentDepth + 1)

  return root
}
