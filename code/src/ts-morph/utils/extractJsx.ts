import {
  BinaryExpression,
  Expression,
  Identifier,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  Node,
  Project,
  SyntaxKind,
} from 'ts-morph'
import { analyzeComponent } from './analyzeComponent.js'
import { getComponent } from './component.js'
import { getTagName } from './nameHelper.js'
import { extractPropsFromNode } from './props.js'
import { handleTernary } from './ternary.js'
import { AnalyzeOptions, TreeNode } from './types.js'

export const extractFromExpression = (
  expression: Expression,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode[] => {
  if (Node.isConditionalExpression(expression)) {
    return handleTernary(expression, project, options, depth)
  }

  if (Node.isBinaryExpression(expression)) {
    return handleLogicalAnd(expression, project, options, depth)
  }

  if (Node.isIdentifier(expression)) {
    return extractFromIdentifier(expression, project, options, depth)
  }

  return extractJSX(expression, project, options, depth)
}

export const handleLogicalAnd = (
  expression: BinaryExpression,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode[] => {
  if (expression.getOperatorToken().getText() !== '&&') {
    return []
  }

  const condition = expression.getLeft().getText()
  const right = expression.getRight()

  const nodes = extractJSX(right, project, options, depth)
  nodes.forEach((n) => {
    n.condition = { expression: condition }
  })

  return nodes
}

const extractFromIdentifier = (
  expression: Identifier,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode[] => {
  const declaration = expression.getSymbol()?.getDeclarations()?.[0]
  if (!declaration || !Node.isVariableDeclaration(declaration)) {
    return []
  }

  const initializer = declaration.getInitializer()
  if (!initializer) {
    return []
  }

  return extractFromExpression(initializer, project, options, depth)
}

const buildNodeFromJsxFragment = (
  node: JsxFragment,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode => ({
  name: 'Fragment',
  type: 'fragment',
  children: extractJSX(node, project, options, depth),
})

export const extractJSX = (
  node: Node,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode[] => {
  const results: TreeNode[] = []

  node.forEachChild((child) => {
    // 1. JSX Elements
    if (Node.isJsxElement(child) || Node.isJsxSelfClosingElement(child)) {
      const element = buildNodeFromJSX(child, project, options, depth)
      if (element) results.push(element)
      return
    }

    // 2. Fragment
    if (Node.isJsxFragment(child)) {
      results.push(buildNodeFromJsxFragment(child, project, options, depth))
      return
    }

    // 3. JSX Expression container
    if (Node.isJsxExpression(child)) {
      const expression = child.getExpression()
      if (!expression) {
        return
      }

      results.push(
        ...extractFromExpression(expression, project, options, depth),
      )
      return
    }

    // 4. Ternary
    if (Node.isConditionalExpression(child)) {
      results.push(...handleTernary(child, project, options, depth))
      return
    }

    // 5. Logical AND
    if (Node.isBinaryExpression(child)) {
      results.push(...handleLogicalAnd(child, project, options, depth))
      return
    }

    results.push(...extractJSX(child, project, options, depth))
  })

  return results
}

const resolveComponentFile = (
  node: JsxElement | JsxSelfClosingElement,
): Node | null => {
  const tagName = getTagName(node)

  const sourceFile = node.getSourceFile()
  const importDecls = sourceFile.getImportDeclarations()

  for (const imp of importDecls) {
    const named = imp.getNamedImports()
    const defaultImport = imp.getDefaultImport()

    if (defaultImport?.getText() === tagName) {
      const file = imp.getModuleSpecifierSourceFile()
      const component = getComponent(file!)
      return component ?? null
    }

    for (const n of named) {
      if (n.getName() === tagName) {
        const file = imp.getModuleSpecifierSourceFile()
        const component = getComponent(file!)
        return component ?? null
      }
    }
  }

  return null
}

const buildNodeFromJSX = (
  node: JsxElement | JsxSelfClosingElement,
  project: Project,
  options: AnalyzeOptions,
  depth: number,
): TreeNode | null => {
  const tagName = getTagName(node)

  const isHtml = tagName[0] === tagName[0].toLowerCase()

  const treeNode: TreeNode = {
    name: tagName,
    type: isHtml ? 'html' : 'component',
    children: [],
  }

  if (!isHtml) {
    treeNode.filePath = node.getSourceFile().getFilePath()
  }

  const props = extractPropsFromNode(node)
  if (props) {
    treeNode.props = props

    if (options.dataIdAttribute && options.dataIdAttribute in props) {
      const dataIdValue = props[options.dataIdAttribute]
      if (dataIdValue !== undefined && dataIdValue !== null) {
        treeNode.dataId = String(dataIdValue)
      }
    }
  }

  // Recurse into children
  if (Node.isJsxElement(node)) {
    const children = node.getJsxChildren()
    children.forEach((child) => {
      if (Node.isJsxElement(child) || Node.isJsxSelfClosingElement(child)) {
        const childNode = buildNodeFromJSX(child, project, options, depth)
        if (childNode) {
          treeNode.children.push(childNode)
        }
        return
      }

      if (Node.isJsxFragment(child)) {
        treeNode.children.push(
          buildNodeFromJsxFragment(child, project, options, depth),
        )
        return
      }

      if (Node.isJsxExpression(child)) {
        const expression = child.getExpression()
        if (expression) {
          treeNode.children.push(
            ...extractFromExpression(expression, project, options, depth),
          )
        }
        return
      }

      treeNode.children.push(...extractJSX(child, project, options, depth))
    })
  }

  // Resolve component if custom
  if (!isHtml && depth < options.maxDepth) {
    const resolved = resolveComponentFile(node)
    if (resolved) {
      treeNode.filePath = resolved.getSourceFile().getFilePath()
      const subTree = analyzeComponent(resolved, project, options, depth)
      treeNode.children.push(...subTree.children)
    }
  }

  return treeNode
}

export const findReturnedJSX = (node: Node): Node | null => {
  const returnStmt = node.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0]

  if (returnStmt) {
    return returnStmt.getExpression() ?? null
  }

  // Arrow function implicit return
  if (Node.isArrowFunction(node)) {
    const body = node.getBody()
    if (
      Node.isJsxElement(body) ||
      Node.isJsxSelfClosingElement(body) ||
      Node.isJsxFragment(body)
    ) {
      return body
    }
  }

  return null
}
