import { IFormatter } from './IFormatter';
import { numberFromLocaleString } from '../../helpers';

/**
 * Formatter for locale-specific numeric values.
 * Format: "localenumber" or "localenumber:decimals"
 * - Formats numbers according to user's locale (e.g., "1,234.56" in en-US)
 * - Only applies locale formatting when element type is not "number"
 */
export class LocaleNumberFormatter implements IFormatter {
  /**
   * Round a number to the specified decimals.
   */
  private round(num: number, decimals: number = 0): number {
    const scale = Math.pow(10, decimals);
    return Math.round(num * scale) / scale;
  }

  format(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    if (v !== '' && v !== null && v !== undefined) {
      v = v * 1;
      if (isNaN(v)) v = 0;
      
      if (params.length > 0) {
        // Get decimal places (either static number or dynamic expression)
        const ln = !isNaN(params[0] as any)
          ? params[0]
          : (getFormatExpression ? getFormatExpression(elem, 'format', params[0]) : params[0]);
        const decimals = parseInt(ln);
        v = this.round(v, decimals);
      }
      
      // Only apply locale formatting if element is not a number input type
      if (elem.getAttribute && elem.getAttribute('type') !== 'number' && Number(v).toLocaleString) {
        v = Number(v).toLocaleString();
      }
    }
    
    return v;
  }

  parse(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    if (value === '') {
      v = null;
    } else {
      v = numberFromLocaleString(value);
      if (isNaN(v)) v = 0;
      
      if (params.length > 0) {
        const ln = !isNaN(params[0] as any)
          ? params[0]
          : (getFormatExpression ? getFormatExpression(elem, 'format', params[0]) : params[0]);
        v = this.round(v, parseInt(ln));
      }
    }
    
    return v;
  }
}
