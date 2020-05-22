/**
 * Calculates offset from the current scanner position.
 *
 * @param scanner Tagged template scanner.
 * @returns Current offset.
 */
export const calcOffset = (
  statics: string[] | TemplateStringsArray,
  staticIndex: number,
  textIndex: number,
): number => {
  for (let i = 0; i < staticIndex; i++) {
    if (i > 0) {
      textIndex += 4 + (Math.log10(i) | 0); // ${i}
    }
    textIndex += statics[i].length;
  }
  return textIndex;
};

/**
 * Formats error message.
 *
 * @param statics Statics.
 * @param errorMsg Error message.
 * @param errorOffset Error offset.
 * @returns Formatted error message.
 */
export function formatError(statics: string[] | TemplateStringsArray, errorMsg: string, errorOffset: number): string {
  let msg = "\n";
  let htm = statics[0];
  for (let i = 1; i < statics.length; i++) {
    htm += "${" + (i - 1) + "}" + statics[i];
  }

  htm.split("\n").forEach((line) => {
    msg += line + "\n";
    if (errorOffset >= 0 && errorOffset < line.length) {
      msg += injectErrorMessage(errorMsg, errorOffset);
    }
    errorOffset -= (line.length + 1);
  });

  if (errorOffset >= 0) {
    msg += injectErrorMessage(errorMsg, errorOffset);
  }

  return msg;
}

function injectErrorMessage(errorMsg: string, errorCol: number): string {
  let msg = "";
  while (--errorCol >= 0) {
    msg += " ";
  }
  msg += "^\nError: " + errorMsg + "\n";
  return msg;
}
