import { BaseComponent } from '../../../components/BaseComponent';
import { Objects } from '../../Objects';
import { EAttrResult } from '../types';
import type { VDom, DirectiveContext } from '../types';

/**
 * [html] directive — dynamic template/component injection.
 * Accepts an HTML string, DocumentFragment, or BaseComponent instance.
 */
export function htmlDirective(on: VDom, inject: any, ctx: DirectiveContext): EAttrResult | void {
  const key = 'html';
  const getter = on.getters[key];
  const html = getter(inject);

  if (on.values[key] !== html) {
    on.values[key] = html;

    // Clear any previous elements
    ctx.removeVDomItems(on.items);

    let cVDom: VDom | null = null;

    if (html) {
      if (html instanceof DocumentFragment) {
        cVDom = {
          elem: html, fragment: null, items: [], values: {}, valuesD: {},
          getters: {}, setters: {}, callers: {}, plainAttrs: {},
          itemBuilder: null, context: null, INJECT: inject,
        };
      } else {
        cVDom = ctx.parseAndExecute(html, inject);
      }
    }

    if (cVDom) {
      if (!(cVDom.elem instanceof DocumentFragment)) {
        on.items = [cVDom];
      } else {
        on.items = cVDom.items;
      }

      on.elem!.appendChild(cVDom.fragment || cVDom.elem!);

      //Quite possibly we dont need to recheck because we just created the template!
      /*for (const i in on.items) {
        if (!on.items.hasOwnProperty(i)) continue;
        ctx.checkVDomNode(on.items[i], inject);
      }*/
    }
  } else {
    // Just update existing items
    for (const i in on.items) {
      if (!on.items.hasOwnProperty(i)) continue;
      ctx.checkVDomNode(on.items[i], inject);
    }
  }

  return EAttrResult.SkipChildren;
}