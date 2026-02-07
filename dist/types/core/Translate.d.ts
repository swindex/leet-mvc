/**
 * This function replaces {1},{2},{3}, in LangConstText with corresponding replaceValues
 */
export declare function ReplaceValues(LangConstText: string, ...replaceValues: (string | number)[]): string;
/**
 * Translate a key or text
 * @param keyOrText - key string, or [key, subkey] array of strings
 * @param replaceValues - text items that replace {1},{2},{3} placeholders in the translated text.
 */
export declare function Translate(keyOrText: string | string[], ...replaceValues: (string | number)[]): string;
