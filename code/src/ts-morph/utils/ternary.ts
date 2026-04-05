import { ConditionalExpression, Project } from 'ts-morph'
import { extractJSX } from './extractJsx.js'
import { AnalyzeOptions, TreeNode } from './types.js'

export const handleTernary = (
  node: ConditionalExpression,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode[] => {
  const condition = node.getCondition().getText()

  const whenTrue = extractJSX(node.getWhenTrue(), project, options, depth)
  const whenFalse = extractJSX(node.getWhenFalse(), project, options, depth)

  whenTrue.forEach((n) => {
    n.condition = { expression: condition }
  })

  whenFalse.forEach((n) => {
    n.condition = { expression: `!(${condition})` }
  })

  return [...whenTrue, ...whenFalse]
}
