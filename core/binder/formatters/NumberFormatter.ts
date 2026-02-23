import { IFormatter } from './IFormatter';

/**
 * Formatter for numeric values with decimal precision.
 * Format: "number" or "number:decimals" or "number:decimals,f"
 * - "number" rounds to integer (no padding)
 * - "number:2" rounds to 2 decimal places (no padding, e.g., 0.5 becomes "0.5")
 * - "number:2,f" rounds to 2 decimal places with fixed zero padding (e.g., 0.5 becomes "0.50")
 * - "number:this.decimals" supports dynamic decimal places from context
 * - "number:this.decimals,f" supports dynamic decimal places with fixed padding
 */
export class NumberFormatter implements IFormatter {
  /**
   * Round a number to the specified decimals.
   */
  private round(num: number, decimals: number = 0): number {
    const scale = Math.pow(10, decimals);
    return Math.round(num * scale) / scale;
  }

  /**
   * Parse format parameters to extract decimal places and flags.
   * @param params - Format parameters (e.g., ["2,f"] or ["2", "f"])
   * @returns Object with decimals and hasFixedFlag
   */
  private parseFormatParams(params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): { decimals: number | null, hasFixedFlag: boolean } {
    if (params.length === 0) {
      return { decimals: null, hasFixedFlag: false };
    }

    // Check if the first param contains a comma (e.g., "2,f")
    const firstParam = params[0];
    let decimalsStr: string;
    let hasFixedFlag = false;

    if (firstParam.includes(',')) {
      const parts = firstParam.split(',');
      decimalsStr = parts[0];
      hasFixedFlag = parts[1] === 'f';
    } else {
      decimalsStr = firstParam;
      // Check if there's a second param that is "f"
      if (params.length > 1 && params[1] === 'f') {
        hasFixedFlag = true;
      }
    }

    // Get decimal places (either static number or dynamic expression)
    const ln = !isNaN(decimalsStr as any)
      ? decimalsStr
      : (getFormatExpression ? getFormatExpression(elem, 'format', decimalsStr) : decimalsStr);
    const decimals = parseInt(ln);

    return { decimals, hasFixedFlag };
  }

  format(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    if (v !== '' && v !== null && v !== undefined) {
      v = v * 1;
      if (isNaN(v)) v = 0;
      
      const { decimals, hasFixedFlag } = this.parseFormatParams(params, elem, getFormatExpression);
      
      if (decimals !== null) {
        v = this.round(v, decimals);
        // Use toFixed only if the fixed flag (,f) is present
        if (hasFixedFlag) {
          v = v.toFixed(decimals);
        } else {
          // Convert to string without padding
          v = String(v);
        }
      } else {
        // No decimal places specified, convert to integer
        v = Math.round(v).toString();
      }
    }
    
    return v;
  }

  parse(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    if (value === '') {
      v = null;
    } else {
      v = Number(value);
      if (isNaN(v)) v = 0;
      
      const { decimals } = this.parseFormatParams(params, elem, getFormatExpression);
      
      if (decimals !== null) {
        v = this.round(v, decimals);
      }
    }
    
    return v;
  }
}
