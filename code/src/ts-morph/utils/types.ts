export type Condition = {
  expression: string
}

export type TreeNode = {
  name: string
  type: 'component' | 'html' | 'fragment'
  children: TreeNode[]
  condition?: Condition
  props?: ReactComponentProps
  onClick?: OnClickInfo
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

export type OnClickInfo = {
  attribute: 'onClick'
  expression: string
  kind:
    | 'identifier'
    | 'member-expression'
    | 'call-expression'
    | 'arrow-function'
    | 'function-expression'
    | 'string-literal'
    | 'boolean-shorthand'
    | 'expression'
}
