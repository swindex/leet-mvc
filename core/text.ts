import { isString, empty } from "./helpers";

export const Text = {
  escapeHTML: function (unsafe: string | any, convertNewlines: boolean = false): string {
    const str = isString(unsafe) ? unsafe : "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, convertNewlines ? "<br />" : '');
  },

  escapeAttribute: function (unsafe: string | any): string {
    if (!isString(unsafe)) return "";

    return unsafe.replace(/"/g, "&quot;");
  },

  /**
   * Safely convert to string. Null or undefined convert to an empty string
   */
  toString(val: any): string {
    if (val == null) val = "";
    return String(val);
  },

  /**
   * Safely lower-case a string
   */
  toLowerCase(val: any): string {
    return Text.toString(val).toLowerCase();
  },

  /**
   * Format phone number while typing
   * @param text - phone number to format
   * @param mask - default: { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' }
   */
  formatPhone: function (text: string | null, mask?: Record<number, string>): string {
    if (text == null)
      text = "";
    const numbers = text.replace(/\D/g, '');
    mask = mask || { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' };
    let result = '';
    for (let i = 0; i < numbers.length; i++) {
      result += (mask[i] || '') + numbers[i];
    }
    return result;
  },

  /**
   * Get File Extension (without DOT)
   */
  fileExtension: function (fName: string | null): string {
    fName = fName || "";
    const li = fName.lastIndexOf('.');
    if (li < 0 || li >= fName.length)
      return "";
    return fName.substr(li + 1);
  },

  /**
   * Get File Name.Extension
   */
  fileFullName: function (fileName: string | null): string {
    fileName = fileName || "";
    if (!fileName || !isString(fileName)) {
      return "";
    }
    return fileName.split(/\\|\//).pop() || "";
  },

  /**
   * Get File Name without Extension
   */
  fileName: function (fileName: string | null): string {
    fileName = fileName || "";
    if (!fileName || !isString(fileName)) {
      return "";
    }
    const parts = fileName.split(/\\|\//).pop();
    return parts ? parts.split('.').shift() || "" : "";
  },

  /**
   * Join file path bits making sure there is / between them and no duplicates
   */
  joinPath: function (...args: string[]): string {
    let path = "";
    args.forEach((el) => {
      if (path.split('').pop() === '/' && el.split('').shift() === '/')
        path = path + el.substr(1);
      else
        path = path + el;
    });
    return path;
  },

  /**
   * Capitalize text
   */
  capitalize(value: string | any): string {
    if (empty(value)) return "";
    value = value + "";
    return (value.toLowerCase()).replace(/(?:^|\s)\S/g, function (a: string) { return a.toUpperCase(); });
  }
};