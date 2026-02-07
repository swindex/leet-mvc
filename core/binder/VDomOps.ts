import { isArray } from '../helpers';
import { Objects } from '../Objects';
import type { VDom } from './types';

/**
 * DOM manipulation helpers for the virtual DOM tree.
 * Handles inserting, removing, and replacing vDom nodes in the real DOM.
 */
export class VDomOps {
  /**
   * Insert a real DOM node before a reference node
   */
  static insertBefore(newNode: Node, referenceNode: Node): void {
    referenceNode.parentNode!.insertBefore(newNode, referenceNode);
  }

  /**
   * Insert a real DOM node after a reference node
   */
  static insertAfter(newNode: Node, referenceNode: Node): void {
    referenceNode.parentNode!.insertBefore(newNode, referenceNode.nextSibling);
  }

  /**
   * Insert a vDom element and its children after a reference node.
   * If the vDom element is a Comment (directive anchor), also inserts child items.
   */
  static insertVDomElementAfter(vdom: VDom, referenceNode: Node): void {
    VDomOps.insertAfter(vdom.elem!, referenceNode);
    if (vdom.elem instanceof Comment) {
      VDomOps.insertVDomItemsAfter(vdom.items, vdom.elem);
    }
  }

  /**
   * Insert an array of vDom items after a reference node.
   * Handles nested comments and component re-insertion.
   */
  static insertVDomItemsAfter(items: VDom[], referenceNode: Node): void {
    if (isArray(items)) {
      const frag = document.createDocumentFragment();
      Objects.forEach(items, (item: VDom) => {
        frag.appendChild(item.elem!);
        if (item.elem instanceof Comment) {
          VDomOps.insertVDomItemsAfter(item.items, item.elem);
          // If item is a component, re-insert its children too
          if (item.getters.component) {
            const component = (item.getters.component as any)(null, {});
            if (component && component.binder) {
              VDomOps.insertVDomElementAfter(component.binder.vdom, item.elem);
            }
          }
        }
      });
      VDomOps.insertAfter(frag, referenceNode);
    }
  }

  /**
   * Remove an element from the DOM.
   * @param keepEvents - If true, only removes from parent without cleaning up event listeners
   */
  static removeElement(elem: Node, keepEvents?: boolean): void {
    if (keepEvents === true) {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    } else {
      VDomOps.removeDOMElement(elem);
    }
  }

  /**
   * Remove a plain DOM element from its parent
   */
  static removeDOMElement(elem: Node): void {
    if (elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }

  /**
   * Remove all vDom items from the DOM.
   * Recursively handles comments (directive anchors) and component children.
   */
  static removeVDomItems(items: VDom[], keepEvents?: boolean): void {
    if (isArray(items)) {
      Objects.forEach(items, (item: VDom) => {
        VDomOps.removeElement(item.elem!, keepEvents);
        // If item is a comment, remove its items too
        if (item.elem instanceof Comment) {
          VDomOps.removeVDomItems(item.items, keepEvents);
          // If item is a component, remove its vDOM element too
          if (item.getters.component) {
            const component = (item.getters.component as any)(null, {});
            if (component && component.binder) {
              VDomOps.removeElement(component.binder.vdom.elem, keepEvents);
            }
          }
        }
      });
    }
  }

  /**
   * Recursively destroy a vDom tree: remove all DOM elements and clean up references.
   */
  static removeVDOMElement(en: VDom): void {
    if (en.items && en.items.length > 0) {
      for (const i in en.items) {
        if (!en.items.hasOwnProperty(i)) continue;
        VDomOps.removeVDOMElement(en.items[i]);
      }
      delete (en as any).items;
    }

    if (en.elem) {
      delete (en.elem as any).VDOM;
      VDomOps.removeDOMElement(en.elem);
      delete (en as any).elem;
    }

    delete (en as any).fragment;
    delete (en as any).getters;
    delete (en as any).setters;
    delete (en as any).callers;
    delete (en as any).itemBuilder;
    delete (en as any).values;
    delete (en as any).valuesD;
  }

  /**
   * Create items from a vDom node's itemBuilder and insert them after the anchor element.
   */
  static vDomCreateItems(on: VDom, inject: any): void {
    const vdom = on.itemBuilder!(inject);
    if (vdom.elem instanceof DocumentFragment) {
      on.items = vdom.items;
    } else {
      on.items.push(vdom);
    }
    VDomOps.insertAfter(vdom.elem!, on.elem!);
  }
}