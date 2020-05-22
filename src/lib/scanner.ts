import { CharCode } from "./charcode";

/**
 * Tagged Template Scanner.
 */
export interface TaggedTemplateScanner {
  /** statics */
  readonly stat: string[] | TemplateStringsArray;
  /** current static string */
  text: string;
  /** text index */
  i: number;
  /** stat index */
  s: number;
}

/**
 * Creates tagged template scanner.
 *
 * @param stat Statics.
 * @returns {@link TaggedTemplateScanner} instance.
 */
export const createTaggedTemplateScanner = (
  stat: string[] | TemplateStringsArray,
): TaggedTemplateScanner => ({
  stat,
  text: stat[0],
  i: 0,
  s: 0,
});

/**
 * Returns `true` when scanner at the end position.
 *
 * @param scanner Tagged template scanner.
 * @returns `true` when scanner at the end position.
 */
export const isEnd = (scanner: TaggedTemplateScanner): boolean => (
  scanner.i === scanner.text.length &&
  scanner.s === scanner.stat.length
);

/**
 * Returns `true` when scanner at the expression position.
 *
 * @param scanner Tagged template scanner.
 * @returns `true` when scanner at the expression position.
 */
export const isExpr = (scanner: TaggedTemplateScanner): boolean => (
  scanner.i === scanner.text.length &&
  scanner.s < scanner.stat.length
);

/**
 * Consumes expression and returns expression index.
 *
 * @param scanner Tagged template scanner.
 * @returns Expression index.
 */
export const consumeExpr = (scanner: TaggedTemplateScanner): number => {
  if (isExpr(scanner) === true) {
    const index = scanner.s++;
    scanner.text = scanner.stat[scanner.s];
    scanner.i = 0;
    return index;
  }
  return -1;
};

/**
 * Peeks next character.
 *
 * @param scanner Tagged template scanner.
 * @returns Next character.
 */
export const peek = (scanner: TaggedTemplateScanner): string => (
  (scanner.i < scanner.text.length) ?
    scanner.text[scanner.i] :
    ""
);

/**
 * Peeks next char code.
 *
 * @param scanner Tagged template scanner.
 * @returns Next char code.
 */
export const peekCharCode = (scanner: TaggedTemplateScanner): number => (
  (scanner.i < scanner.text.length) ?
    scanner.text.charCodeAt(scanner.i) :
    -1
);

/**
 * Consumes char code.
 *
 * @param scanner Tagged template scanner.
 * @param charCode Char code to consume.
 * @returns `true` if char code were consumed.
 */
export const consumeCharCode = (scanner: TaggedTemplateScanner, charCode: number): boolean => {
  const text = scanner.text;
  const i = scanner.i;
  if (i < text.length && text.charCodeAt(i) === charCode) {
    scanner.i++;
    return true;
  }
  return false;
};

/**
 * Scans for a match with a string.
 *
 * @param scanner Tagged template scanner.
 * @param s String to match.
 * @returns `true` if string is matched.
 */
export const matchString = (scanner: TaggedTemplateScanner, s: string): boolean => {
  const text = scanner.text;
  const end = scanner.i + s.length;
  return (
    end <= text.length &&
    text.substring(scanner.i, end) === s
  );
};

/**
 * Consumes a string when it is matched.
 *
 * @param scanner Tagged template scanner.
 * @param s String to match.
 * @returns `true` if string is consumed.
 */
export const consumeString = (scanner: TaggedTemplateScanner, s: string): boolean => {
  if (matchString(scanner, s) === true) {
    scanner.i += s.length;
    return true;
  }
  return false;
};

/**
 * Scans for a match with a RegExp.
 *
 * @param scanner Tagged template scanner.
 * @param re RegExp to match.
 * @returns Matched string.
 */
export const matchRegExp = (scanner: TaggedTemplateScanner, re: RegExp): string => {
  if (!re.global) {
    throw Error("RegExp global flag must be set");
  }

  re.lastIndex = scanner.i;
  const match = re.exec(scanner.text);
  if (match === null || match.index !== scanner.i) {
    return "";
  }
  return match[0];
};

/**
 * Consumes a matched RegExp value.
 *
 * @param scanner Tagged template scanner.
 * @param re RegExp to match.
 * @returns Consumed string.
 */
export const consumeRegExp = (scanner: TaggedTemplateScanner, re: RegExp): string => {
  const match = matchRegExp(scanner, re);
  if (match !== "") {
    scanner.i += match.length;
  }
  return match;
};

/**
 * Scans for an ellipsis "...".
 *
 * @param scanner Tagged template scanner.
 * @returns `true` if ellipsis is matched.
 */
export const matchEllipsis = (scanner: TaggedTemplateScanner): boolean => {
  const text = scanner.text;
  const i = scanner.i;
  return (
    text.length > 2 &&
    text.charCodeAt(i) === CharCode.Period &&
    text.charCodeAt(i + 1) === CharCode.Period &&
    text.charCodeAt(i + 2) === CharCode.Period
  );
};

/**
 * Consume while condition is true.
 *
 * @param scanner Tagged template scanner.
 * @returns Consumed string.
 */
export const consumeWhile = (scanner: TaggedTemplateScanner, cond: (charCode: number) => boolean): string => {
  let start = scanner.i;
  while (cond(peekCharCode(scanner)) === true) {
    scanner.i++;
  }
  return scanner.text.substring(start, scanner.i);
};

/**
 * Consume an ellipsis "...".
 *
 * @param scanner Tagged template scanner.
 * @returns `true` if ellipsis is consumed.
 */
export const consumeEllipsis = (scanner: TaggedTemplateScanner): boolean => {
  if (matchEllipsis(scanner) === true) {
    scanner.i += 3;
    return true;
  }
  return false;
};

/**
 * Returns `true` if char code is a whitespace [ \n\r\t].
 *
 * @param c Char code.
 * @returns `true` if char code is a whitespace.
 */
export const isWhitespace = (c: number): boolean => (
  c === CharCode.Space ||
  c === CharCode.Newline ||
  c === CharCode.CarriageReturn ||
  c === CharCode.Tab
);

/**
 * Consumes whitespace characters.
 *
 * @param scanner Tagged template scanner.
 * @returns The number of consumed characters.
 */
export const consumeWhitespace = (scanner: TaggedTemplateScanner): number => {
  let i = 0;
  while (isWhitespace(peekCharCode(scanner)) === true) {
    i++;
    scanner.i++;
  }
  return i;
};
