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
import {
  extractAttributeValueFromNode,
  extractCtaInfoFromNode,
  extractPropsFromNode,
} from './props.js'
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
  children:
    depth < options.maxDepth
      ? extractJSX(node, project, options, depth + 1)
      : [],
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
      if (!file || file.getFilePath().includes('/node_modules/')) {
        return null
      }

      try {
        const component = getComponent(file)
        return component ?? null
      } catch {
        return null
      }
    }

    for (const n of named) {
      if (n.getName() === tagName) {
        const file = imp.getModuleSpecifierSourceFile()
        if (!file || file.getFilePath().includes('/node_modules/')) {
          return null
        }

        try {
          const component = getComponent(file)
          return component ?? null
        } catch {
          return null
        }
      }
    }
  }

  return null
}

const resolveLocalComponentFilePath = (
  node: JsxElement | JsxSelfClosingElement,
): string | undefined => {
  const tagName = getTagName(node)
  const sourceFile = node.getSourceFile()

  for (const imp of sourceFile.getImportDeclarations()) {
    const matchesDefaultImport = imp.getDefaultImport()?.getText() === tagName
    const matchesNamedImport = imp
      .getNamedImports()
      .some((namedImport) => namedImport.getName() === tagName)

    if (!matchesDefaultImport && !matchesNamedImport) {
      continue
    }

    const moduleSpecifier = imp.getModuleSpecifierValue()
    const isLocalImport =
      moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/')
    if (!isLocalImport) {
      return undefined
    }

    const importedSourceFile = imp.getModuleSpecifierSourceFile()
    if (!importedSourceFile) {
      return undefined
    }

    const importedFilePath = importedSourceFile.getFilePath()
    if (importedFilePath.includes('/node_modules/')) {
      return undefined
    }

    return importedFilePath
  }

  // If there is no matching import, treat it as a component from the current local source file.
  return sourceFile.getFilePath()
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
    const localComponentFilePath = resolveLocalComponentFilePath(node)
    if (localComponentFilePath) {
      treeNode.filePath = localComponentFilePath
    }
  }

  const props = extractPropsFromNode(node, options.dataIdAttribute)
  if (props) {
    treeNode.props = props
  }

  if (options.dataIdAttribute) {
    const dataIdValue = extractAttributeValueFromNode(
      node,
      options.dataIdAttribute,
    )
    if (dataIdValue !== undefined && dataIdValue !== null) {
      treeNode.dataId = String(dataIdValue)
    }
  }

  const cta = extractCtaInfoFromNode(node)
  if (cta) {
    treeNode.cta = cta
  }

  // Recurse into children while under maxDepth.
  if (Node.isJsxElement(node) && depth < options.maxDepth) {
    const children = node.getJsxChildren()
    children.forEach((child) => {
      if (Node.isJsxElement(child) || Node.isJsxSelfClosingElement(child)) {
        const childNode = buildNodeFromJSX(child, project, options, depth + 1)
        if (childNode) {
          treeNode.children.push(childNode)
        }
        return
      }

      if (Node.isJsxFragment(child)) {
        treeNode.children.push(
          buildNodeFromJsxFragment(child, project, options, depth + 1),
        )
        return
      }

      if (Node.isJsxExpression(child)) {
        const expression = child.getExpression()
        if (expression) {
          treeNode.children.push(
            ...extractFromExpression(expression, project, options, depth + 1),
          )
        }
        return
      }

      treeNode.children.push(...extractJSX(child, project, options, depth + 1))
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
  const getReturnedJsxExpression = (expression: Expression): Node | null => {
    if (Node.isParenthesizedExpression(expression)) {
      const innerExpression = expression.getExpression()
      if (!innerExpression) {
        return null
      }

      return getReturnedJsxExpression(innerExpression)
    }

    if (
      Node.isJsxElement(expression) ||
      Node.isJsxSelfClosingElement(expression) ||
      Node.isJsxFragment(expression)
    ) {
      return expression
    }

    return null
  }

  const returnStatements = node.getDescendantsOfKind(SyntaxKind.ReturnStatement)

  for (const returnStmt of returnStatements) {
    const expression = returnStmt.getExpression()
    if (!expression) {
      continue
    }

    const returnedJsxExpression = getReturnedJsxExpression(expression)
    if (returnedJsxExpression) {
      return returnedJsxExpression
    }
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
