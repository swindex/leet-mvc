import { IFormatter } from './IFormatter';

/**
 * Formatter for boolean values with custom labels.
 * Format: "boolean" or "boolean:trueLabel,falseLabel"
 * - "boolean" converts to/from "true"/"false" strings or numeric 0/1
 * - "boolean:Yes,No" displays "Yes" for true, "No" for false
 */
export class BooleanFormatter implements IFormatter {
  format(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    if (params.length > 0) {
      const titles = params[0].split(',');
      v = titles[v === true ? 0 : 1];
      if (v === undefined) {
        throw Error("Value of bind is not part of format's boolean options");
      }
    }
    
    return v;
  }

  parse(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    if (params.length > 0) {
      const titles = params[0].split(',');
      if (titles.length >= 1) {
        v = value === titles[0];
      } else {
        v = parseInt(value) !== 0;
      }
    } else {
      if (value === 'true') {
        v = true;
      } else if (value === 'false') {
        v = false;
      } else {
        v = parseInt(value) !== 0;
      }
    }
    
    return v;
  }
}
