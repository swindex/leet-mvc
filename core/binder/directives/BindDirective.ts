import type { VDom, DirectiveContext } from '../types';

/**
 * Helper function to check if an element is a form element or text node.
 */
function isFormElementOrTextNode(elem: any): boolean {
  if (!elem) return false;
  
  // Text nodes are valid
  if (elem.nodeType === Node.TEXT_NODE) return true;
  
  // Form elements
  if (elem.tagName) {
    switch (elem.tagName) {
      case 'INPUT':
      case 'TEXTAREA':
      case 'SELECT':
      case 'OPTION':
        return true;
    }
  }
  
  return false;
}

/**
 * bind directive — two-way data binding for form elements.
 * For display-only text content, use [text] directive instead.
 * Reads the model value and updates the DOM element's displayed value.
 */
export function bindDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'bind';
  const getter = on.getters[key];

  // Runtime validation: warn if bind is used on non-form elements
  if (on.elem && !isFormElementOrTextNode(on.elem)) {
    console.warn(
      `[bind] directive should only be used for two-way binding on form elements (input, select, textarea). ` +
      `For display-only text content, use [text] directive instead. ` +
      `Element: <${(on.elem as HTMLElement).tagName?.toLowerCase() || 'unknown'}>`,
      on.elem
    );
  }

  let newValue: any;
  try {
    newValue = getter(inject);
  } catch (ex) {
    // Swallow errors — leave value undefined
  }

  on.values[key] = newValue;
  ctx.updateBoundElement(on.elem, newValue);
}
