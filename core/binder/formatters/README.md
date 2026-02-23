# Extensible Formatters

The formatter system provides an extensible architecture for formatting values in form bindings and text directives. All formatters are registered in a central registry, allowing you to add custom formatters alongside the built-in ones.

## Built-in Formatters

### NumberFormatter
Format numbers with decimal precision, with optional fixed zero padding.

**Syntax:** `format="number"` or `format="number:decimals"` or `format="number:decimals,f"`

**Examples:**
```html
<!-- Format to integer -->
<input bind="this.count" format="number" />
<!-- 123.456 → "123" -->

<!-- Format with 2 decimal places (no padding) -->
<input bind="this.price" format="number:2" />
<!-- 10.5 → "10.5" -->
<!-- 0.5002 → "0.5" -->
<!-- 123.456 → "123.46" -->

<!-- Format with 2 decimal places (with fixed zero padding using ,f flag) -->
<input bind="this.price" format="number:2,f" />
<!-- 10.5 → "10.50" -->
<!-- 0.5 → "0.50" -->
<!-- 123.456 → "123.46" -->

<!-- Format with 4 decimal places and fixed padding -->
<input bind="this.value" format="number:4,f" />
<!-- 1.2 → "1.2000" -->

<!-- Dynamic decimal places from context -->
<input bind="this.value" format="number:this.decimals" />

<!-- Dynamic decimal places with fixed padding -->
<input bind="this.value" format="number:this.decimals,f" />
```

### LocaleNumberFormatter
Format numbers according to the user's locale (with thousand separators, etc.).

**Syntax:** `format="localenumber"` or `format="localenumber:decimals"`

**Examples:**
```html
<!-- Format with locale-specific separators -->
<span [text]="this.amount" format="localenumber:2"></span>
<!-- 1234567.89 → "1,234,567.89" (in en-US) -->
```

**Note:** Locale formatting is only applied when the input element type is NOT "number" (to avoid conflicts with browser number input validation).

### BooleanFormatter
Convert boolean values to custom text labels.

**Syntax:** `format="boolean"` or `format="boolean:trueLabel,falseLabel"`

**Examples:**
```html
<!-- Default boolean strings -->
<input bind="this.enabled" format="boolean" />
<!-- true → "true", false → "false" -->

<!-- Custom labels -->
<span [text]="this.isActive" format="boolean:Active,Inactive"></span>
<!-- true → "Active", false → "Inactive" -->

<span [text]="this.hasPermission" format="boolean:Yes,No"></span>
<!-- true → "Yes", false → "No" -->
```

### DateTimeFormatter
Format date/time values using the DateTime helper class.

**Syntax:** `format="dateTime"`, `format="date"`, or `format="time"`

**Examples:**
```html
<!-- Full date and time -->
<span [text]="this.timestamp" format="dateTime"></span>

<!-- Date only -->
<span [text]="this.birthDate" format="date"></span>

<!-- Time only -->
<span [text]="this.appointmentTime" format="time"></span>
```

## Creating Custom Formatters

You can easily create and register custom formatters by implementing the `IFormatter` interface.

### Example 1: Currency Formatter

```typescript
import { FormatterRegistry, IFormatter } from 'leet-mvc/core/binder/formatters';

class CurrencyFormatter implements IFormatter {
  toDisplay(value: any, params: string[]): any {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const amount = Number(value);
    if (isNaN(amount)) return '$0.00';
    
    // Optional: support currency symbol parameter
    const symbol = params[0] || '$';
    return symbol + amount.toFixed(2);
  }

  fromDisplay(value: any, params: string[]): any {
    if (value === '') return null;
    
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '');
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
  }
}

// Register the formatter
FormatterRegistry.register('currency', new CurrencyFormatter());
```

**Usage:**
```html
<input bind="this.price" format="currency" />
<!-- 99.5 → "$99.50" -->

<span [text]="this.price" format="currency:€"></span>
<!-- 99.5 → "€99.50" -->
```

### Example 2: Percentage Formatter

```typescript
class PercentageFormatter implements IFormatter {
  toDisplay(value: any, params: string[]): any {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const num = Number(value);
    if (isNaN(num)) return '0%';
    
    const decimals = params[0] ? parseInt(params[0]) : 0;
    return (num * 100).toFixed(decimals) + '%';
  }

  fromDisplay(value: any, params: string[]): any {
    if (value === '') return null;
    
    const cleaned = value.replace('%', '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num / 100;
  }
}

FormatterRegistry.register('percentage', new PercentageFormatter());
```

**Usage:**
```html
<input bind="this.discountRate" format="percentage:1" />
<!-- 0.075 → "7.5%" -->

<span [text]="this.taxRate" format="percentage:2"></span>
<!-- 0.0825 → "8.25%" -->
```

### Example 3: Number Without Padding (Alternative to number format)

If you want numbers formatted without trailing zeros:

```typescript
class DecimalFormatter implements IFormatter {
  private round(num: number, decimals: number = 0): number {
    const scale = Math.pow(10, decimals);
    return Math.round(num * scale) / scale;
  }

  toDisplay(value: any, params: string[], elem: any, getFormatExpression?: Function): any {
    if (value === '' || value === null || value === undefined) {
      return value;
    }
    
    let v = Number(value);
    if (isNaN(v)) v = 0;
    
    if (params.length > 0) {
      const ln = !isNaN(params[0] as any)
        ? params[0]
        : (getFormatExpression ? getFormatExpression(elem, 'format', params[0]) : params[0]);
      const decimals = parseInt(ln);
      v = this.round(v, decimals);
    }
    
    // Return as number, JavaScript will convert to string without trailing zeros
    return String(v);
  }

  fromDisplay(value: any, params: string[], elem: any, getFormatExpression?: Function): any {
    if (value === '') return null;
    
    let v = Number(value);
    if (isNaN(v)) v = 0;
    
    if (params.length > 0) {
      const ln = !isNaN(params[0] as any)
        ? params[0]
        : (getFormatExpression ? getFormatExpression(elem, 'format', params[0]) : params[0]);
      v = this.round(v, parseInt(ln));
    }
    
    return v;
  }
}

FormatterRegistry.register('decimal', new DecimalFormatter());
```

**Usage:**
```html
<input bind="this.measurement" format="decimal:3" />
<!-- 0.5002 → "0.5" (no trailing zeros!) -->
<!-- 1.2567 → "1.257" -->
```

## Architecture

The formatter system consists of three main components:

1. **IFormatter Interface**: Defines the contract for all formatters
   - `toDisplay()`: Converts model value → display value
   - `fromDisplay()`: Converts display value → model value

2. **FormatterRegistry**: Central registry for managing formatters
   - `register(name, formatter)`: Register a formatter
   - `get(name)`: Retrieve a formatter
   - `has(name)`: Check if formatter exists

3. **FormBinding**: Uses the registry to apply formatting
   - `formatValueForDisplay()`: Delegates to `toDisplay()`
   - `formatValueFromElement()`: Delegates to `fromDisplay()`

## Benefits

✅ **Extensible**: Add custom formatters without modifying core code  
✅ **Maintainable**: Each formatter is self-contained and testable  
✅ **Type Safe**: Clear interfaces prevent errors  
✅ **Backward Compatible**: All existing format strings continue to work  
✅ **Flexible**: Support for dynamic parameters via expressions

## Registration

Formatters can be registered at application startup:

```typescript
// In your app initialization
import { FormatterRegistry } from 'leet-mvc/core/binder/formatters';
import { CurrencyFormatter } from './formatters/CurrencyFormatter';
import { PercentageFormatter } from './formatters/PercentageFormatter';

FormatterRegistry.register('currency', new CurrencyFormatter());
FormatterRegistry.register('percentage', new PercentageFormatter());
FormatterRegistry.register('decimal', new DecimalFormatter());
```

Built-in formatters are automatically registered when the formatters module is imported.
