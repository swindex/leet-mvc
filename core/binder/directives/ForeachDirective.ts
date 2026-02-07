import { isObject, isObjLiteral } from '../../helpers';
import { EAttrResult } from '../types';
import type { VDom, DirectiveContext, ForeachParts } from '../types';
import { VDomOps } from '../VDomOps';

/**
 * [foreach] directive — list rendering.
 * Iterates over data, creates/updates/removes items with efficient diffing.
 * Syntax: [foreach]="index in this.items as item"
 */
export function foreachDirective(on: VDom, inject: any, ctx: DirectiveContext): EAttrResult | void {
  const key = 'foreach';
  const parts = on.getters[key] as unknown as ForeachParts;
  const data = ctx.createGetter(parts.data!, inject, 'foreach')(inject) || [];

  const fo = document.createDocumentFragment();
  const fo1 = document.createDocumentFragment();

  const touchedKeys: Record<string, null> = {};

  // Remove all items temporarily (not right away)
  function moveAllToFragment(): void {
    for (const index in on.items) {
      if (!on.items.hasOwnProperty(index)) continue;
      fo.appendChild(on.items[index].elem!);
    }
  }

  let hasNew = false;

  for (const index in data) {
    if (!data.hasOwnProperty(index)) continue;
    const item = data[index];
    if (item === undefined) continue;

    touchedKeys[index] = null;

    let inj: any = {};
    inj[parts.index] = index;
    inj[parts.item] = item;
    inj = Object.assign({}, inject, inj);

    if (on.items[index as any] && isObject(item) && !isObjLiteral(item)) {
      // Complex object — handle differently
      if (on.items[index as any].INJECT && on.items[index as any].INJECT[parts.item] !== item) {
        // Element's injected item is not the same as current item
        if (on.items[index as any].elem == null || on.items[index as any].elem instanceof DocumentFragment) {
          ctx.removeVDomItems(on.items[index as any].items);
        }
        ctx.removeElement(on.items[index as any].elem!);
        delete on.items[index as any];
      }
    }

    if (!on.items.hasOwnProperty(index)) {
      // A new item appeared
      if (!hasNew) {
        hasNew = true;
        moveAllToFragment();
      }

      const vdom = on.itemBuilder!(inj);
      on.items[index as any] = vdom;
      fo1.appendChild(on.items[index as any].fragment || on.items[index as any].elem!);
    } else {
      if (!(on.items[index as any].elem as any)?.parentElement) {
        // Items have been removed from DOM
        return EAttrResult.SkipChildren;
      }
      on.items[index as any].INJECT = inj;
      VDomOps.insertBefore(fo1, on.items[index as any].elem!);
      ctx.checkVDomNode(on.items[index as any], inj);
    }
  }

  // Delete vdom items that were not in the data object
  for (const index in on.items) {
    if (!on.items.hasOwnProperty(index)) continue;
    if (touchedKeys.hasOwnProperty(index)) continue;

    if (on.items[index as any].elem == null || on.items[index as any].elem instanceof DocumentFragment) {
      ctx.removeVDomItems(on.items[index as any].items);
    }
    ctx.removeElement(on.items[index as any].elem!);
    delete on.items[index as any];
  }

  fo.appendChild(fo1);

  if ((on.elem as any)?.parentNode) {
    if (hasNew) {
      VDomOps.insertAfter(fo, on.elem!);
    }
  } else {
    console.warn('[ForEach]: element does not have a parent!', on.elem);
  }

  return EAttrResult.SkipChildren;
}

/**
 * Parse a [foreach] attribute value into its parts.
 * Syntax: "index in this.items as item" or "this.items as item" or just "this.items"
 */
export function parseForeachExpression(attrValue: string): ForeachParts | null {
  if (!attrValue) return null;

  const parts = attrValue.split(/ (in|as|where) /g);
  const p: ForeachParts = {
    data: null,
    index: 'index',
    item: 'item',
    where: null,
  };

  let pName: keyof ForeachParts = 'data';
  for (const part of parts) {
    switch (part) {
      case 'in':
        p.index = p.data!; // first item must have been index
        pName = 'data';    // set data next
        break;
      case 'as':
        pName = 'item';    // set item next
        break;
      case 'where':
        pName = 'where';   // set where next
        break;
      default:
        (p as any)[pName] = part;
    }
  }
  return p;
}