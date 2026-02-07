import type { VDom, DirectiveContext } from '../types';

/**
 * bind directive — two-way data binding for form elements and text nodes.
 * Reads the model value and updates the DOM element's displayed value.
 */
export function bindDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'bind';
  const getter = on.getters[key];

  let newValue: any;
  try {
    newValue = getter(inject);
  } catch (ex) {
    // Swallow errors — leave value undefined
  }

  on.values[key] = newValue;
  ctx.updateBoundElement(on.elem, newValue);
}