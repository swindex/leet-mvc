import { Injector } from "./Injector";
import { isString, argumentsToArray } from "./helpers";
import { Objects } from "./Objects";

const Inject = Injector;

/**
 * This function replaces {1},{2},{3}, in LangConstText with corresponding replaceValues
 */
export function ReplaceValues(LangConstText: string, ...replaceValues: (string | number)[]): string {
  const args = [LangConstText, ...replaceValues];
  if (args.length === 1)
    return LangConstText;
  return LangConstText.replace(/\{(\d+)\}/g, function (match, contents) {
    return String(args[parseInt(contents)]);
  });
}

/**
 * Translate a key or text
 * @param keyOrText - key string, or [key, subkey] array of strings
 * @param replaceValues - text items that replace {1},{2},{3} placeholders in the translated text.
 */
export function Translate(keyOrText: string | string[], ...replaceValues: (string | number)[]): string {
  if (!Inject['LNG'])
    return keyOrText !== null ? keyOrText.toString() : "";

  let ret: any;

  if (Array.isArray(keyOrText)) {
    let val = Objects.getPropertyByPath(Inject['LNG'], keyOrText);
    if (val === undefined) {
      const newk = keyOrText.slice();
      newk[keyOrText.length - 1] = ""; // get default key
      val = Objects.getPropertyByPath(Inject['LNG'], newk);
      if (val === undefined) {
        val = keyOrText[keyOrText.length - 1];
      }
    }
    ret = val;
  } else {
    ret = Inject['LNG'][keyOrText] ? Inject['LNG'][keyOrText] : keyOrText;
  }

  if (replaceValues.length > 0 && isString(ret)) {
    return ReplaceValues(ret, ...replaceValues);
  }

  return ret;
}