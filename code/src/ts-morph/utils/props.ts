import {
  Expression,
  JsxAttribute,
  JsxElement,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  Node,
} from 'ts-morph'
import { OnClickInfo, ReactComponentProps } from './types.js'

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

const getExpressionKind = (expression: Expression): OnClickInfo['kind'] => {
  if (Node.isIdentifier(expression)) {
    return 'identifier'
  }

  if (Node.isPropertyAccessExpression(expression)) {
    return 'member-expression'
  }

  if (Node.isCallExpression(expression)) {
    return 'call-expression'
  }

  if (Node.isArrowFunction(expression)) {
    return 'arrow-function'
  }

  if (Node.isFunctionExpression(expression)) {
    return 'function-expression'
  }

  return 'expression'
}

export const extractOnClickInfoFromNode = (
  node: JsxElement | JsxSelfClosingElement,
): OnClickInfo | undefined => {
  const attributes = Node.isJsxElement(node)
    ? node.getOpeningElement().getAttributes()
    : node.getAttributes()

  const onClickAttribute = attributes.find(
    (attribute) =>
      Node.isJsxAttribute(attribute) &&
      attribute.getNameNode().getText() === 'onClick',
  )

  if (!onClickAttribute || !Node.isJsxAttribute(onClickAttribute)) {
    return undefined
  }

  const initializer = onClickAttribute.getInitializer()
  if (!initializer) {
    return {
      attribute: 'onClick',
      expression: 'true',
      kind: 'boolean-shorthand',
    }
  }

  if (Node.isStringLiteral(initializer)) {
    return {
      attribute: 'onClick',
      expression: initializer.getLiteralText(),
      kind: 'string-literal',
    }
  }

  if (Node.isJsxExpression(initializer)) {
    const expression = initializer.getExpression()
    if (!expression) {
      return undefined
    }

    return {
      attribute: 'onClick',
      expression: expression.getText(),
      kind: getExpressionKind(expression),
    }
  }

  return {
    attribute: 'onClick',
    expression: initializer.getText(),
    kind: 'expression',
  }
}
