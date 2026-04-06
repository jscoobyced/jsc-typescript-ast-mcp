import {
  Expression,
  JsxAttribute,
  JsxElement,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  Node,
} from 'ts-morph'
import { CtaInfo, ReactComponentProps } from './types.js'

const EXCLUDE_HTML_ATTRIBUTES = new Set([
  'accept',
  'acceptcharset',
  //  'action',
  'allow',
  'allowfullscreen',
  //  'alt',
  'as',
  'async',
  'autocapitalize',
  'autocomplete',
  'autocorrect',
  'autofocus',
  'autoplay',
  'capture',
  'cellpadding',
  'cellspacing',
  'charset',
  'challenge',
  //  'checked',
  'cite',
  'class',
  'classname',
  'cols',
  'colspan',
  //  'content',
  'contenteditable',
  'controls',
  'coords',
  'crossorigin',
  //  'data',
  //  'datetime',
  'decoding',
  'default',
  'defer',
  'dir',
  'dirname',
  //  'disabled',
  'download',
  'draggable',
  'enctype',
  'fetchpriority',
  //  'for',
  'form',
  'formaction',
  'formenctype',
  'formmethod',
  'formnovalidate',
  'formtarget',
  'frameborder',
  'headers',
  //  'height',
  //  'hidden',
  'high',
  'href',
  'hreflang',
  'htmlfor',
  'httpequiv',
  //  'id',
  'inputmode',
  'integrity',
  'is',
  //  'key',
  'kind',
  //  'label',
  'lang',
  'list',
  'loading',
  'loop',
  'low',
  'max',
  'maxlength',
  'media',
  'method',
  'min',
  'minlength',
  'multiple',
  'muted',
  //  'name',
  'nomodule',
  'nonce',
  'novalidate',
  'open',
  'optimum',
  'pattern',
  //  'placeholder',
  'playsinline',
  'poster',
  'preload',
  //  'readonly',
  'referrerpolicy',
  //  'rel',
  'required',
  'reversed',
  //  'role',
  'rows',
  'rowspan',
  'sandbox',
  'scope',
  'selected',
  'shape',
  'size',
  'sizes',
  'slot',
  'span',
  'spellcheck',
  'src',
  'srcdoc',
  'srclang',
  'srcset',
  'start',
  'step',
  'style',
  'tabindex',
  'target',
  //  'title',
  'translate',
  'type',
  'usemap',
  //  'value',
  //  'width',
  'wrap',
  // Common DOM event handler props
  'onabort',
  'onanimationend',
  'onanimationiteration',
  'onanimationstart',
  'onauxclick',
  'onbeforeinput',
  'onblur',
  'oncanplay',
  'oncanplaythrough',
  'onchange',
  'onclick',
  'oncompositionend',
  'oncompositionstart',
  'oncompositionupdate',
  'oncontextmenu',
  'oncopy',
  'oncut',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragexit',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'ondurationchange',
  'onemptied',
  'onended',
  'onerror',
  'onfocus',
  'onfocusin',
  'onfocusout',
  'onfullscreenchange',
  'onfullscreenerror',
  'ongotpointercapture',
  'oninput',
  'oninvalid',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onload',
  'onloadeddata',
  'onloadedmetadata',
  'onloadstart',
  'onlostpointercapture',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseover',
  'onmouseup',
  'onpaste',
  'onpause',
  'onplay',
  'onplaying',
  'onpointercancel',
  'onpointerdown',
  'onpointerenter',
  'onpointerleave',
  'onpointermove',
  'onpointerout',
  'onpointerover',
  'onpointerup',
  'onprogress',
  'onratechange',
  'onreset',
  'onresize',
  'onscroll',
  'onseeked',
  'onseeking',
  'onselect',
  'onstalled',
  'onsubmit',
  'onsuspend',
  'ontimeupdate',
  'ontoggle',
  'ontransitionend',
  'onvolumechange',
  'onwaiting',
  'onwheel',
])

const CTA_EVENTS = new Set([
  'onClick',
  'onChange',
  'onInput',
  'onSubmit',
  'onSelect',
  'onKeyDown',
  'onKeyUp',
  'onBlur',
])

const isStandardHtmlAttribute = (name: string): boolean => {
  const normalizedName = name.toLowerCase()

  if (normalizedName.startsWith('aria-')) {
    return true
  }

  return EXCLUDE_HTML_ATTRIBUTES.has(normalizedName)
}

const normalizeAttributeName = (name: string): string =>
  name.replace(/[-_]/g, '').toLowerCase()

const matchesAttributeName = (name: string, target: string): boolean =>
  normalizeAttributeName(name) === normalizeAttributeName(target)

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
  excludedAttributeName?: string,
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
      const attributeName = attribute.getNameNode().getText()
      const isExcludedDataIdAttribute =
        excludedAttributeName !== undefined &&
        matchesAttributeName(attributeName, excludedAttributeName)

      if (isStandardHtmlAttribute(attributeName) || isExcludedDataIdAttribute) {
        continue
      }

      props[attributeName] = extractPropValue(attribute)
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

export const extractAttributeValueFromNode = (
  node: JsxElement | JsxSelfClosingElement,
  attributeName: string,
): unknown => {
  const attributes = Node.isJsxElement(node)
    ? node.getOpeningElement().getAttributes()
    : node.getAttributes()

  const matchedAttribute = attributes.find(
    (attribute) =>
      Node.isJsxAttribute(attribute) &&
      matchesAttributeName(attribute.getNameNode().getText(), attributeName),
  )

  if (!matchedAttribute || !Node.isJsxAttribute(matchedAttribute)) {
    return undefined
  }

  return extractPropValue(matchedAttribute)
}

const getExpressionKind = (expression: Expression): CtaInfo['kind'] => {
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

export const extractCtaInfoFromNode = (
  node: JsxElement | JsxSelfClosingElement,
): CtaInfo | undefined => {
  const attributes = Node.isJsxElement(node)
    ? node.getOpeningElement().getAttributes()
    : node.getAttributes()

  const ctaAttribute = attributes.find(
    (attribute) =>
      Node.isJsxAttribute(attribute) &&
      CTA_EVENTS.has(attribute.getNameNode().getText()),
  )

  if (!ctaAttribute || !Node.isJsxAttribute(ctaAttribute)) {
    return undefined
  }

  const eventAttributeName = ctaAttribute.getNameNode().getText()

  const initializer = ctaAttribute.getInitializer()
  if (!initializer) {
    return {
      attribute: eventAttributeName,
      expression: 'true',
      kind: 'boolean-shorthand',
    }
  }

  if (Node.isStringLiteral(initializer)) {
    return {
      attribute: eventAttributeName,
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
      attribute: eventAttributeName,
      expression: expression.getText(),
      kind: getExpressionKind(expression),
    }
  }

  return {
    attribute: eventAttributeName,
    expression: initializer.getText(),
    kind: 'expression',
  }
}
