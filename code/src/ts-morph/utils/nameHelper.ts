import { JsxElement, JsxSelfClosingElement, Node } from 'ts-morph'

export const getTagName = (
  node: JsxElement | JsxSelfClosingElement,
): string => {
  if (Node.isJsxElement(node)) {
    return node.getOpeningElement().getTagNameNode().getText()
  }
  return node.getTagNameNode().getText()
}

export const getComponentName = (node: Node): string => {
  if (Node.isFunctionDeclaration(node) && node.getName()) {
    return node.getName()!
  }

  if (Node.isVariableDeclaration(node)) {
    return node.getName()
  }

  return 'AnonymousComponent'
}
