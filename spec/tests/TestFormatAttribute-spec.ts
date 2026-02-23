import { Binder } from "../../core/binder/Binder";
import { IFormatter } from "../../core/binder/formatters/IFormatter";
import { FormatterRegistry } from "../../core/binder/formatters/FormatterRegistry";

describe('Format Attribute Tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('bind directive with format', () => {
    it('should format numbers with decimal places (no padding)', () => {
      const context = { price: 123.456789 };
      const template = '<input bind="this.price" format="number:2" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('123.46');
    });

    it('should format numbers with decimal places and fixed padding', () => {
      const context = { price: 10.5 };
      const template = '<input bind="this.price" format="number:2,f" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('10.50');
    });

    it('should format numbers without padding when no flag', () => {
      const context = { price: 10.5 };
      const template = '<input bind="this.price" format="number:2" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('10.5');
    });

    it('should format numbers with 4 decimal places and fixed padding', () => {
      const context = { value: 1.2 };
      const template = '<input bind="this.value" format="number:4,f" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('1.2000');
    });

    it('should format locale numbers', () => {
      const context = { amount: 1234567.89 };
      const template = '<input bind="this.amount" format="localenumber:2" type="text" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      // Should have locale-specific formatting (e.g., "1,234,567.89" in en-US)
      expect(input.value).toContain('1');
      expect(input.value).toContain('234');
    });

    it('should format boolean values with custom labels', () => {
      const context = { isActive: true };
      const template = '<input bind="this.isActive" format="boolean:Active,Inactive" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('Active');
    });
  });

  describe('[text] directive with format', () => {
    it('should format numbers with decimal places', () => {
      const context = { price: 123.456789 };
      const template = '<span [text]="this.price" format="number:2"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('123.46');
    });

    it('should format locale numbers', () => {
      const context = { amount: 1234567.89 };
      const template = '<div [text]="this.amount" format="localenumber:2"></div>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const div = container.querySelector('div') as HTMLDivElement;
      // Should have locale-specific formatting
      expect(div.innerText).toContain('1');
      expect(div.innerText).toContain('234');
    });

    it('should format boolean values with custom labels', () => {
      const context = { isActive: true };
      const template = '<p [text]="this.isActive" format="boolean:Yes,No"></p>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const p = container.querySelector('p') as HTMLParagraphElement;
      expect(p.innerText).toBe('Yes');
    });

    it('should format boolean as No when false', () => {
      const context = { isActive: false };
      const template = '<p [text]="this.isActive" format="boolean:Yes,No"></p>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const p = container.querySelector('p') as HTMLParagraphElement;
      expect(p.innerText).toBe('No');
    });

    it('should update formatted text when value changes', () => {
      const context = { price: 100.5 };
      const template = '<span [text]="this.price" format="number:2"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('100.5');
      
      context.price = 200.789;
      binder.updateElements();
      expect(span.innerText).toBe('200.79');
    });

    it('should update formatted text with fixed padding when value changes', () => {
      const context = { price: 100.5 };
      const template = '<span [text]="this.price" format="number:2,f"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('100.50');
      
      context.price = 200.789;
      binder.updateElements();
      expect(span.innerText).toBe('200.79');
    });

    it('should handle null values gracefully', () => {
      const context = { price: null };
      const template = '<span [text]="this.price" format="number:2"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('');
    });

    it('should handle undefined values gracefully', () => {
      const context = { price: undefined };
      const template = '<span [text]="this.price" format="number:2"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('');
    });
  });

  describe('Dynamic format expressions', () => {
    it('should support dynamic decimal places from context', () => {
      const context = { price: 123.456789, decimalPlaces: 3 };
      const template = '<span [text]="this.price" format="number:this.decimalPlaces"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('123.457');
    });
  });

  describe('Format without directive', () => {
    it('should work with bind on text content (mustache)', () => {
      const context = { price: 123.456 };
      const template = '<div><span [text]="this.price" format="number:2"></span></div>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('123.46');
    });
  });

  describe('Custom Formatter Tests', () => {
    // Clean up custom formatters after each test
    afterEach(() => {
      FormatterRegistry.unregister('percentage');
      FormatterRegistry.unregister('currency');
    });

    it('should register and use custom percentage formatter', () => {

      // Create custom percentage formatter
      class PercentageFormatter implements IFormatter {
        format(value: any, params: string[]): any {
          if (value === null || value === undefined || value === '') {
            return '';
          }
          const num = Number(value);
          if (isNaN(num)) return '0%';
          const decimals = params[0] ? parseInt(params[0]) : 0;
          return (num * 100).toFixed(decimals) + '%';
        }

        parse(value: any, params: string[]): any {
          if (value === '') return null;
          const cleaned = value.replace('%', '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num / 100;
        }
      }

      // Register the custom formatter
      FormatterRegistry.register('percentage', new PercentageFormatter());

      // Test with bind directive
      const context = { discountRate: 0.15 };
      const template = '<input bind="this.discountRate" format="percentage:0" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('15%');

      // Test parsing (two-way binding)
      input.value = '25%';
      input.dispatchEvent(new Event('input'));
      expect(context.discountRate).toBe(0.25);
    });

    it('should support custom percentage formatter with decimal places', () => {
      class PercentageFormatter implements IFormatter {
        format(value: any, params: string[]): any {
          if (value === null || value === undefined || value === '') {
            return '';
          }
          const num = Number(value);
          if (isNaN(num)) return '0%';
          const decimals = params[0] ? parseInt(params[0]) : 0;
          return (num * 100).toFixed(decimals) + '%';
        }

        parse(value: any, params: string[]): any {
          if (value === '') return null;
          const cleaned = value.replace('%', '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num / 100;
        }
      }

      FormatterRegistry.register('percentage', new PercentageFormatter());

      const context = { taxRate: 0.0825 };
      const template = '<span [text]="this.taxRate" format="percentage:2"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('8.25%');
    });

    it('should register and use custom currency formatter with parameters', () => {
      // Create custom currency formatter
      class CurrencyFormatter implements IFormatter {
        format(value: any, params: string[]): any {
          if (value === null || value === undefined || value === '') {
            return '';
          }
          const amount = Number(value);
          if (isNaN(amount)) return '$0.00';
          const symbol = params[0] || '$';
          return symbol + amount.toFixed(2);
        }

        parse(value: any, params: string[]): any {
          if (value === '') return null;
          // Remove currency symbols and commas
          const cleaned = value.replace(/[$€£¥,]/g, '');
          const amount = parseFloat(cleaned);
          return isNaN(amount) ? 0 : amount;
        }
      }

      // Register the custom formatter
      FormatterRegistry.register('currency', new CurrencyFormatter());

      // Test with default currency symbol ($)
      const context1 = { price: 99.5 };
      const template1 = '<input bind="this.price" format="currency" />';
      
      const binder1 = new Binder(context1).bindElements(null, template1);
      container.appendChild(binder1.vdom!.elem!);
      
      const input1 = container.querySelector('input') as HTMLInputElement;
      expect(input1.value).toBe('$99.50');

      // Test parsing
      input1.value = '$125.75';
      input1.dispatchEvent(new Event('input'));
      expect(context1.price).toBe(125.75);

      // Clean up for next test
      container.innerHTML = '';

      // Test with custom currency symbol (€)
      const context2 = { price: 99.5 };
      const template2 = '<span [text]="this.price" format="currency:€"></span>';
      
      const binder2 = new Binder(context2).bindElements(null, template2);
      container.appendChild(binder2.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('€99.50');
    });

    it('should handle null values in custom formatter', () => {
      class PercentageFormatter implements IFormatter {
        format(value: any, params: string[]): any {
          if (value === null || value === undefined || value === '') {
            return '';
          }
          const num = Number(value);
          if (isNaN(num)) return '0%';
          const decimals = params[0] ? parseInt(params[0]) : 0;
          return (num * 100).toFixed(decimals) + '%';
        }

        parse(value: any): any {
          if (value === '') return null;
          const cleaned = value.replace('%', '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num / 100;
        }
      }

      FormatterRegistry.register('percentage', new PercentageFormatter());

      const context = { rate: null };
      const template = '<span [text]="this.rate" format="percentage:1"></span>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('');
    });

    it('should support multiple custom formatters simultaneously', () => {
      class PercentageFormatter implements IFormatter {
        format(value: any, params: string[]): any {
          if (value === null || value === undefined || value === '') return '';
          const num = Number(value);
          if (isNaN(num)) return '0%';
          const decimals = params[0] ? parseInt(params[0]) : 0;
          return (num * 100).toFixed(decimals) + '%';
        }
        parse(value: any): any {
          if (value === '') return null;
          const cleaned = value.replace('%', '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num / 100;
        }
      }

      class CurrencyFormatter implements IFormatter {
        format(value: any, params: string[]): any {
          if (value === null || value === undefined || value === '') return '';
          const amount = Number(value);
          if (isNaN(amount)) return '$0.00';
          const symbol = params[0] || '$';
          return symbol + amount.toFixed(2);
        }
        parse(value: any): any {
          if (value === '') return null;
          const cleaned = value.replace(/[$€£¥,]/g, '');
          const amount = parseFloat(cleaned);
          return isNaN(amount) ? 0 : amount;
        }
      }

      FormatterRegistry.register('percentage', new PercentageFormatter());
      FormatterRegistry.register('currency', new CurrencyFormatter());

      const context = { taxRate: 0.08, price: 100 };
      const template = `
        <div>
          <span id="tax" [text]="this.taxRate" format="percentage:1"></span>
          <span id="price" [text]="this.price" format="currency"></span>
        </div>
      `;
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const taxSpan = container.querySelector('#tax') as HTMLSpanElement;
      const priceSpan = container.querySelector('#price') as HTMLSpanElement;
      
      expect(taxSpan.innerText).toBe('8.0%');
      expect(priceSpan.innerText).toBe('$100.00');
    });
  });
});
