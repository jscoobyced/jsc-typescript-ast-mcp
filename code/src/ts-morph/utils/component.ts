import { Node, SourceFile, SyntaxKind } from 'ts-morph'

const isComponentVariableDeclaration = (node: Node): boolean => {
  if (!Node.isVariableDeclaration(node)) {
    return false
  }

  const initializer = node.getInitializer()
  if (!initializer) {
    return false
  }

  return (
    initializer.getKind() === SyntaxKind.ArrowFunction ||
    initializer.getKind() === SyntaxKind.FunctionExpression
  )
}

const isComponentDeclaration = (node: Node): boolean => {
  if (Node.isFunctionDeclaration(node)) {
    return true
  }

  return isComponentVariableDeclaration(node)
}

const getFirstExportedComponent = (
  sourceFile: SourceFile,
): Node | undefined => {
  const exportedDeclarations = sourceFile.getExportedDeclarations()

  for (const declarations of exportedDeclarations.values()) {
    const componentDeclaration = declarations.find(isComponentDeclaration)
    if (componentDeclaration) {
      return componentDeclaration
    }
  }

  return undefined
}

export const getComponent = (sourceFile: SourceFile) => {
  const defaultExportDeclaration = sourceFile
    .getDefaultExportSymbol()
    ?.getDeclarations()
    ?.find(isComponentDeclaration)

  if (defaultExportDeclaration) {
    return defaultExportDeclaration
  }

  const firstExportedComponent = getFirstExportedComponent(sourceFile)
  if (firstExportedComponent) {
    return firstExportedComponent
  }

  const localVariableComponent = sourceFile
    .getVariableDeclarations()
    .find(isComponentVariableDeclaration)
  if (localVariableComponent) {
    return localVariableComponent
  }

  const localFunctionComponent = sourceFile.getFunctions()[0]
  if (localFunctionComponent) {
    return localFunctionComponent
  }

  throw new Error(`Component not found in ${sourceFile.getFilePath()}`)
}
