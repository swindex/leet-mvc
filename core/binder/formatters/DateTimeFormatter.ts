import { IFormatter } from './IFormatter';
import { DateTime } from '../../DateTime';

/**
 * Formatter for date and time values.
 * Supports three format types:
 * - "dateTime" - Full date and time
 * - "date" - Date only
 * - "time" - Time only
 * 
 * Uses the DateTime helper class for conversion to/from human-readable formats.
 */
export class DateTimeFormatter implements IFormatter {
  constructor(private mode: 'dateTime' | 'date' | 'time') {}

  format(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    switch (this.mode) {
      case 'dateTime':
        v = DateTime.toHumanDateTime(v);
        break;
      case 'date':
        v = DateTime.toHumanDate(v);
        break;
      case 'time':
        v = DateTime.toHumanTime(v);
        break;
    }
    
    return v;
  }

  parse(value: any, params: string[], elem: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    let v = value;
    
    // Only parse if no additional parameters specified (params.length === 0)
    // This maintains backward compatibility with existing behavior
    if (params.length === 0) {
      switch (this.mode) {
        case 'dateTime':
          v = DateTime.fromHumanDateTime(value);
          break;
        case 'date':
          v = DateTime.fromHumanDate(value);
          break;
        case 'time':
          v = DateTime.fromHumanTime(value);
          break;
      }
    }
    
    return v;
  }
}
