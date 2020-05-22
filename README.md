# Tagged Template Scanner

## Usage Example

Simple HTML-like parser

```ts
import * as s from "tagged-template-scanner";

export interface TElement {
  readonly type: "element";
  readonly tagName: string;
  readonly attributes: TAttribute[];
  readonly children: (TText | TElement | TExpression | null)[];
}

export interface TExpression {
  readonly type: "expression";
  readonly index: number;
}

export interface TText {
  readonly type: "text";
  readonly text: string;
}

export interface TAttribute {
  readonly type: "attribute";
  readonly key: string;
  readonly value: undefined | TText | TExpression;
}

export type TNode = TExpression | TAttribute | TElement | TText;

export class ParserError extends Error {
  readonly staticIndex: number;
  readonly textIndex: number;

  constructor(message: string, staticIndex: number, textIndex: number) {
    super(message);
    this.staticIndex = staticIndex;
    this.textIndex = textIndex;
  }
}

export function parseTemplate(statics: string[] | TemplateStringsArray): TElement {
  try {
    const scanner = s.createTaggedTemplateScanner(statics);
    s.consumeWhitespace(scanner);
    return parseElement(scanner);
  } catch (e) {
    if (e instanceof ParserError) {
      throw Error(s.formatError(statics, e.message, s.calcOffset(statics, e.staticIndex, e.textIndex)));
    }
    throw e;
  }
}

const IDENTIFIER = /[a-zA-Z][0-9a-zA-Z-_]*/g;
const ATTRIBUTE_VALUE = /[^"]*/g;

function parseElement(scanner: s.TaggedTemplateScanner): TElement {
  if (!s.consumeCharCode(scanner, s.CharCode.LessThan)) {
    throw error(scanner, `Invalid element, expected '<'`);
  }
  const tagName = s.consumeRegExp(scanner, IDENTIFIER);
  if (!tagName) {
    throw error(scanner, `Invalid element, expected element tag name`);
  }

  const attributes = parseAttributes(scanner);
  if (s.consumeCharCode(scanner, s.CharCode.Slash)) {
    if (!s.consumeCharCode(scanner, s.CharCode.MoreThan)) {
      throw error(scanner, `Invalid element, expected '>'`);
    }
    return { type: "element", tagName, attributes, children: [] };
  }
  if (!s.consumeCharCode(scanner, s.CharCode.MoreThan)) {
    throw error(scanner, `Invalid element, expected '>'`);
  }

  const children = parseElementChildren(scanner);

  if (!s.consumeCharCode(scanner, s.CharCode.LessThan)) {
    throw error(scanner, `Invalid element, expected '<'`);
  }
  if (!s.consumeCharCode(scanner, s.CharCode.Slash)) {
    throw error(scanner, `Invalid element, expected '/'`);
  }
  if (!s.consumeCharCode(scanner, s.CharCode.MoreThan)) {
    if (!s.consumeString(scanner, tagName)) {
      throw error(scanner, `Invalid element, expected tag name '${tagName}'`);
    }
    if (!s.consumeCharCode(scanner, s.CharCode.MoreThan)) {
      throw error(scanner, `Invalid element, expected '>'`);
    }
  }

  return { type: "element", tagName, attributes, children };
}

function parseElementChildren(scanner: s.TaggedTemplateScanner): (TElement | TExpression | TText)[] {
  const children: (TElement | TExpression | TText)[] = [];
  let c;
  s.consumeWhitespace(scanner);
  while (!s.isEnd(scanner)) {
    if (s.matchString(scanner, "</")) {
      return children;
    }
    if (c = parseNode(scanner)) {
      children.push(c);
    }
  }
  throw error(scanner, `Invalid element children list, unexpected end of template`);
}

function parseNode(scanner: s.TaggedTemplateScanner): TElement | TExpression | TText | null {
  let index;
  let text;
  if (s.isEnd(scanner)) {
    throw error(scanner, `Invalid node, unexpected end of template`);
  }
  if ((index = s.consumeExpr(scanner)) >= 0) {
    return { type: "expression", index };
  }
  if (s.peekCharCode(scanner) === s.CharCode.LessThan) {
    return parseElement(scanner);
  }
  if (text = parseText(scanner)) {
    return text;
  }
  return null;
}

function parseText(scanner: s.TaggedTemplateScanner): TText | null {
  let chars: number[] = [];
  let text: string;
  let c: number;

  while (true) {
    if (s.isEnd(scanner)) {
      throw error(scanner, `Invalid text, unexpected end of template`);
    }
    if (s.isExpr(scanner) || (c = s.peekCharCode(scanner)) === s.CharCode.LessThan) {
      break;
    }

    chars.push(c);
    scanner.i++;
  }

  if (chars.length > 0) {
    text = String.fromCharCode.apply(void 0, chars);
    if (text.length > 0) {
      return { type: "text", text };
    }
  }
  return null;
}

function parseAttributes(scanner: s.TaggedTemplateScanner): TAttribute[] {
  const properties: TAttribute[] = [];

  s.consumeWhitespace(scanner);
  let c = s.peekCharCode(scanner);
  if (c === s.CharCode.Slash || c === s.CharCode.MoreThan) {
    return properties;
  }

  while (true) {
    if (s.isEnd(scanner)) {
      throw error(scanner, `Invalid element properties, unexpected end of template`);
    }

    properties.push(parseAttribute(scanner));

    c = s.peekCharCode(scanner);
    if (c === s.CharCode.Slash || c === s.CharCode.MoreThan) {
      return properties;
    }

    if (!s.isWhitespace(c)) {
      throw error(scanner, `Invalid element properties, expected whitespace`);
    }
    s.consumeWhitespace(scanner);
  }
}

function parseAttribute(scanner: s.TaggedTemplateScanner): TAttribute {
  const key = s.consumeRegExp(scanner, IDENTIFIER);
  if (!key) {
    throw error(scanner, `Invalid attribute, expected attribute name`);
  }
  if (s.consumeCharCode(scanner, s.CharCode.EqualsTo)) {
    return { type: "attribute", key, value: parseAttributeValue(scanner) };
  }

  return { type: "attribute", key, value: void 0 };
}

function parseAttributeValue(scanner: s.TaggedTemplateScanner): TText | TExpression {
  const index = s.consumeExpr(scanner);
  if (index >= 0) {
    return { type: "expression", index };
  }

  if (!s.consumeCharCode(scanner, s.CharCode.DoubleQuote)) {
    throw error(scanner, `Invalid attribute value, expected '"'`);
  }

  const text = s.consumeRegExp(scanner, ATTRIBUTE_VALUE);
  if (!text || !s.consumeCharCode(scanner, s.CharCode.DoubleQuote)) {
    throw error(scanner, `Invalid attribute value, expected '"'`);
  }

  return { type: "text", text };
}

function error(scanner: s.TaggedTemplateScanner, message: string): ParserError {
  return new ParserError(message, scanner.s, scanner.i);
}
```
