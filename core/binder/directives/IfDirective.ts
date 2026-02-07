import { isObject } from '../../helpers';
import { EAttrResult } from '../types';
import type { VDom, DirectiveContext } from '../types';

/**
 * [if] directive — conditional rendering.
 * Creates or removes DOM children based on a boolean expression.
 */
export function ifDirective(on: VDom, inject: any, ctx: DirectiveContext): EAttrResult | void {
  const key = 'if';
  const getter = on.getters[key];

  let isTrue: any;
  try {
    isTrue = getter(inject);
    // Objects can't be compared, so if expression is one, set it to true
    if (isObject(isTrue)) {
      isTrue = true;
    }
  } catch (ex) {
    isTrue = undefined;
  }

  if (on.values[key] !== isTrue) {
    on.values[key] = isTrue;

    if (isTrue) {
      if (on.items.length === 0) {
        // If directive does not have any children, create them
        ctx.vDomCreateItems(on, inject);
      } else {
        // Re-insert existing items
        ctx.insertVDomItemsAfter(on.items, on.elem!);
      }
    } else {
      if (on.items.length > 0 && on.items[0].elem && (on.items[0].elem as any).parentNode) {
        ctx.removeVDomItems(on.items, true);
      }
      return EAttrResult.SkipChildren;
    }
  }

  if (!isTrue) {
    return EAttrResult.SkipChildren;
  }
}