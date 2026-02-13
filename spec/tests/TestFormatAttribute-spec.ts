import { Binder } from "../../core/binder/BinderNew";

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
    it('should format numbers with decimal places', () => {
      const context = { price: 123.456789 };
      const template = '<input bind="this.price" format="number:2" />';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('123.46');
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
      const template = '<div><span bind="this.price" format="number:2"></span></div>';
      
      const binder = new Binder(context).bindElements(null, template);
      container.appendChild(binder.vdom!.elem!);
      
      const span = container.querySelector('span') as HTMLSpanElement;
      expect(span.innerText).toBe('123.46');
    });
  });
});
