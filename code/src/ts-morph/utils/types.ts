export type Condition = {
  expression: string
}

export type TreeNode = {
  name: string
  type: 'component' | 'html' | 'fragment'
  children: TreeNode[]
  condition?: Condition
  props?: ReactComponentProps
  filePath?: string
  dataId?: string
}

export type AnalyzeOptions = {
  maxDepth: number
  dataIdAttribute?: string
}

export type ReactComponentProps<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = TProps
