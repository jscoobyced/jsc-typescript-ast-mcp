export type Condition = {
  expression: string
}

export type TreeNode = {
  name: string
  type: 'component' | 'html' | 'fragment'
  children: TreeNode[]
  condition?: Condition
}

export type AnalyzeOptions = {
  maxDepth: number
}
