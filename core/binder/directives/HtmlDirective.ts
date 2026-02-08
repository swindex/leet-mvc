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

  // If the directive value is a BaseComponent, delegate to the component handler
  if (html instanceof BaseComponent) {
    on.getters['component'] = getter;
    return ctx.executeAttribute('component', on, inject);
  }

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
      const pVDom = on.itemBuilder!(inject);

      if (!(cVDom.elem instanceof DocumentFragment)) {
        // Copy getters from parent to child
        Objects.forEach(pVDom.getters, (g: Function, k: string | number) => {
          cVDom!.getters[String(k)] = g;
        });

        // Copy HTML attributes
        if ((cVDom.elem as HTMLElement)?.attributes) {
          const pElem = pVDom.elem as HTMLElement;
          const cElem = cVDom.elem as HTMLElement;
          for (let ii = 0; ii < pElem.attributes.length; ii++) {
            const attr = pElem.attributes[ii];
            if (!cElem.getAttribute(attr.name)) {
              cElem.setAttribute(attr.name, attr.value);
            } else {
              cElem.setAttribute(attr.name, cElem.getAttribute(attr.name) + ' ' + attr.value);
            }
          }
        }
        on.items = [cVDom];
      } else {
        on.items = cVDom.items;
      }

      ctx.insertVDomElementAfter(cVDom, on.elem!);

      for (const i in on.items) {
        if (!on.items.hasOwnProperty(i)) continue;
        ctx.checkVDomNode(on.items[i], inject);
      }
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