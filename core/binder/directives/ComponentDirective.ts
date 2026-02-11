import { BaseComponent } from '../../../components/BaseComponent';
import { isFunction } from '../../helpers';
import { tryCall } from '../../helpers';
import { Objects } from '../../Objects';
import { DOM } from '../../DOM';
import { EAttrResult } from '../types';
import type { VDom, DirectiveContext } from '../types';

/**
 * Get a readable class name from an object
 */
function getClassName(object: any): string {
  const ret = object.constructor ? object.constructor.name : object.toString();
  return ret.replace(/bound /g, '');
}

/**
 * Copy HTML attributes from parent element to child element.
 * Existing child attributes are appended to rather than overwritten.
 */
function copyAttributes(pElem: HTMLElement, cElem: HTMLElement): void {
  for (let ii = 0; ii < pElem.attributes.length; ii++) {
    const attr = pElem.attributes[ii];
    if (!cElem.getAttribute(attr.name)) {
      cElem.setAttribute(attr.name, attr.value);
    } else {
      cElem.setAttribute(attr.name, cElem.getAttribute(attr.name) + ' ' + attr.value);
    }
  }
}

/**
 * Wire parent getters to component properties.
 */
function wireProperties(
  component: BaseComponent,
  pVDom: VDom,
  cVDom: VDom,
  inject: any,
  directiveRegistry: Record<string, any>
): void {
  Objects.forEach(pVDom.getters, (getter: Function, key: string | number) => {
    const k = String(key);
    cVDom.getters[k] = getter;
    if (k.indexOf('.') >= 0) {
      Objects.setPropertyByPath(component, k, getter(inject));
    } else {
      if ((component as any)[k] === undefined && !directiveRegistry[k]) {
        console.warn(
          `Warning. Trying to set undefined property '${k}' in Component '${getClassName(component)}'. Please define property in component constructor!`
        );
      }
      (component as any)[k] = getter(inject);
    }
  });
}

/**
 * Wire two-way bindings: creates {prop}Change_2 callback methods on the component.
 */
function wireTwoWayBindings(
  component: BaseComponent,
  pVDom: VDom,
  cVDom: VDom,
  inject: any
): string[] {
  const dynamicEvents: string[] = [];

  Objects.forEach(pVDom.setters, (setter: Function, key: string | number) => {
    const k = String(key);
    cVDom.setters[k] = setter;
    if (isFunction((component as any)[k + 'Change_2'])) {
      throw new Error(
        `Component can not have method ${k + 'Change_2'} it is used exclusively for 2-way data binding with ${k}`
      );
    }
    dynamicEvents.push(k + 'Change_2');
    (component as any)[k + 'Change_2'] = function (val: any) {
      return cVDom.setters[k](inject, val);
    };
  });

  return dynamicEvents;
}

/**
 * Wire event callers from parent onto the component instance.
 */
function wireEventCallers(
  component: BaseComponent,
  pVDom: VDom,
  cVDom: VDom,
  dynamicEvents: string[]
): void {
  Objects.forEach(pVDom.callers, (caller: Function, key: string | number) => {
    const k = String(key);
    if (dynamicEvents.indexOf(k) >= 0) {
      throw new Error(
        `Component ${getClassName(component)} can not override 2-way event (${k})!`
      );
    }
    
    // Wrap the caller to inject $event from the first argument
    const wrappedCaller = function(...args: any[]) {
      const eventInject = Object.assign({}, pVDom.INJECT || {}, { $event: args[0] });
      return caller(eventInject);
    };
    
    cVDom.callers[k] = (component as any)[k] = wrappedCaller;
  });
}

/**
 * Set plain (non-reactive) attributes as properties on the component.
 */
function setPlainAttributes(component: BaseComponent, pVDom: VDom): void {
  Objects.forEach(pVDom.plainAttrs, (value: any, key: string | number) => {
    const k = String(key);
    if (value !== null) {
      (component as any)[k] = value;
      component.attributes[k] = value;
    }
  });
}

/**
 * [component] directive — full component lifecycle management.
 * Instantiates BaseComponent subclasses, wires property/event bindings,
 * manages child templates, and handles content projection.
 */
export function componentDirective(on: VDom, inject: any, ctx: DirectiveContext): EAttrResult | void {
  const key = 'component';
  const getter = on.getters[key];
  let component: any = getter(inject);

  // If component is a class (not yet instantiated), instantiate it
  if (!on.values[key] && component && component.prototype instanceof BaseComponent) {
    component = new component();
  } else if (component && component.prototype instanceof BaseComponent) {
    // Same component type — reuse existing instance
    component = on.values[key];
  }

  if (on.values[key] !== component) {
    // --- New or changed component ---

    // Clear any previous component elements
    ctx.removeVDomItems(on.items);
    if (on.values[key] && on.values[key].binder) {
      ctx.removeElement(on.values[key].binder.vdom.elem);
      ctx.removeVDomItems(on.values[key].binder.vdom.items);
    }

    on.values[key] = component;

    if (!(component instanceof BaseComponent)) {
      return EAttrResult.SkipChildren;
    }

    const inj = Object.assign({}, inject);

    if (component.template) {
      on.values[key] = component;

      // Build parent vDom in the parent scope, with component detection disabled to avoid infinite recursion
      const pVDom = on.itemBuilder!(Object.assign({}, inject, { __skipComponentDetection: false }));
      if (pVDom instanceof DocumentFragment) {
        throw Error('Component container ' + JSON.stringify(on.elem) + ' can not be a fragment!');
      }

      // Create a new Binder for the component's own template
      // We use ctx.binder constructor to create a new Binder instance
      const BinderClass = ctx.binder.constructor;
      component.binder = new BinderClass(component).setInjectVars(inj).bindElements(component.events, component.template);
      const cVDom = component.binder!.vdom;

      // Wire properties, two-way bindings, and event callers
      wireProperties(component, pVDom, cVDom, inject, ctx.binder.getDirectiveRegistry());
      const dynamicEvents = wireTwoWayBindings(component, pVDom, cVDom, inject);
      wireEventCallers(component, pVDom, cVDom, dynamicEvents);

      // Copy HTML attributes from parent to child
      if (!(cVDom.elem instanceof DocumentFragment) && !(cVDom.elem instanceof Comment)) {
        copyAttributes(pVDom.elem as HTMLElement, cVDom.elem as HTMLElement);
      }

      // Set plain attributes as component properties
      setPlainAttributes(component, pVDom);

      // Content projection: move host children to a fragment
      const pFrag = document.createDocumentFragment();
      DOM(pFrag).append((pVDom.elem as HTMLElement).childNodes);

      component.parentPage = ctx.context;
      component.templateFragment = pFrag;
      component.templateUpdate = function () {
        ctx.checkVDomNode(on, inject);
      };

      on.items = [pVDom];

      // Insert component vDom after the [component] anchor element
      ctx.insertVDomElementAfter(cVDom, on.elem!);

      // Call onInit
      if (!(cVDom.elem instanceof DocumentFragment)) {
        tryCall(component, component._onInit, cVDom.elem);
      }
    } else {
      // Component does not have own template — render host template
      const pVDom = on.itemBuilder!(inject);
      on.items[0] = pVDom;

      // Insert parent vDom after the [component] anchor element
      ctx.insertVDomElementAfter(pVDom, on.elem!);

      tryCall(component, component._onInit, pVDom.elem);
    }
  } else {
    // --- Same component, just update ---
    for (const i in on.items) {
      if (!on.items.hasOwnProperty(i)) continue;
      ctx.checkVDomNode(on.items[i], inject);
    }
    if (!component.container) {
      tryCall(component, component._onInit, (on.elem as any)?.parentElement);
    }
    if (component && component.binder) {
      tryCall(component, component.update);
    }
  }

  return EAttrResult.SkipChildren;
}