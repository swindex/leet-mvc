/**
 * Interface for value formatters that handle conversion between model values and display values.
 * Formatters are used by the FormBinding to format values in form elements and text content.
 */
export interface IFormatter {
  /**
   * Format a value from the model for display in the UI.
   * @param value - The raw value from the model
   * @param params - Additional parameters from the format string (e.g., ["3"] for "number:3")
   * @param elem - The DOM element being formatted
   * @param getFormatExpression - Optional function to evaluate dynamic format expressions
   * @returns The formatted value for display
   */
  format(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any;

  /**
   * Parse a value from the display format back to the model format.
   * @param value - The formatted value from the UI
   * @param params - Additional parameters from the format string
   * @param elem - The DOM element being parsed
   * @param getFormatExpression - Optional function to evaluate dynamic format expressions
   * @returns The parsed value for the model
   */
  parse(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any;
}
