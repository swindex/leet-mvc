/**
 * Formatters module - provides extensible value formatting for FormBinding.
 * 
 * This module exports:
 * - IFormatter interface for creating custom formatters
 * - FormatterRegistry for registering/retrieving formatters
 * - Built-in formatter implementations (NumberFormatter, BooleanFormatter, etc.)
 * 
 * Built-in formatters are automatically registered on module load.
 * 
 * Example usage:
 * ```typescript
 * import { FormatterRegistry, IFormatter } from './formatters';
 * 
 * class CurrencyFormatter implements IFormatter {
 *   toDisplay(value, params) { return `$${value.toFixed(2)}`; }
 *   fromDisplay(value, params) { return parseFloat(value.replace('$', '')); }
 * }
 * 
 * FormatterRegistry.register('currency', new CurrencyFormatter());
 * ```
 */

export type { IFormatter } from './IFormatter';
export { FormatterRegistry } from './FormatterRegistry';
export { NumberFormatter } from './NumberFormatter';
export { LocaleNumberFormatter } from './LocaleNumberFormatter';
export { BooleanFormatter } from './BooleanFormatter';
export { DateTimeFormatter } from './DateTimeFormatter';

// Auto-register built-in formatters
import { FormatterRegistry } from './FormatterRegistry';
import { NumberFormatter } from './NumberFormatter';
import { LocaleNumberFormatter } from './LocaleNumberFormatter';
import { BooleanFormatter } from './BooleanFormatter';
import { DateTimeFormatter } from './DateTimeFormatter';

FormatterRegistry.register('number', new NumberFormatter());
FormatterRegistry.register('localenumber', new LocaleNumberFormatter());
FormatterRegistry.register('boolean', new BooleanFormatter());
FormatterRegistry.register('dateTime', new DateTimeFormatter('dateTime'));
FormatterRegistry.register('date', new DateTimeFormatter('date'));
FormatterRegistry.register('time', new DateTimeFormatter('time'));
