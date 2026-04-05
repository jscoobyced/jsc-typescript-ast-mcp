import { SourceFile, SyntaxKind } from 'ts-morph'
import { getComponentName } from './nameHelper.js'

export const getComponent = (sourceFile: SourceFile) => {
  const component = sourceFile.getDefaultExportSymbol()?.getDeclarations()?.[0]

  if (!component) {
    throw new Error(`Component not found in ${sourceFile.getFilePath()}`)
  }

  const componentName = getComponentName(component)
  if (componentName !== 'AnonymousComponent') return component
  const components = sourceFile.getVariableDeclarations().filter((v) => {
    const initializer = v.getInitializer()
    return initializer?.getKind() === SyntaxKind.ArrowFunction
  })

  return components[0]
}
