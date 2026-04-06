import {
  JsxAttribute,
  JsxElement,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  Node,
} from 'ts-morph'
import { ReactComponentProps } from './types.js'

const extractPropValue = (attribute: JsxAttribute): unknown => {
  const initializer = attribute.getInitializer()
  if (!initializer) {
    return true
  }

  if (Node.isStringLiteral(initializer)) {
    return initializer.getLiteralText()
  }

  if (Node.isJsxExpression(initializer)) {
    const expression = initializer.getExpression()
    if (!expression) {
      return true
    }

    return expression.getText()
  }

  return initializer.getText()
}

const addSpreadProps = (
  props: Record<string, unknown>,
  spreadAttribute: JsxSpreadAttribute,
): void => {
  const expression = spreadAttribute.getExpression()
  const expressionText = expression.getText()

  // Keep spread attributes as references so callers can resolve them later if needed.
  props[`...${expressionText}`] = expressionText
}

export const extractPropsFromNode = (
  node: JsxElement | JsxSelfClosingElement,
): ReactComponentProps | undefined => {
  const attributes = Node.isJsxElement(node)
    ? node.getOpeningElement().getAttributes()
    : node.getAttributes()

  if (attributes.length === 0) {
    return undefined
  }

  const props: Record<string, unknown> = {}

  for (const attribute of attributes) {
    if (Node.isJsxAttribute(attribute)) {
      props[attribute.getNameNode().getText()] = extractPropValue(attribute)
      continue
    }

    if (Node.isJsxSpreadAttribute(attribute)) {
      addSpreadProps(props, attribute)
    }
  }

  if (Object.keys(props).length === 0) {
    return undefined
  }

  return props
}
