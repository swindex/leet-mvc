import { empty } from '../../helpers';
import { Objects } from '../../Objects';
import { FormBinding } from '../FormBinding';
import type { VDom, DirectiveContext } from '../types';

/**
 * [selected] directive — toggles the 'selected' HTML attribute.
 */
export function selectedDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const getter = on.getters['selected'];
  const newValue = getter(inject);
  const elem = on.elem as HTMLElement;
  if (newValue) {
    elem.setAttribute('selected', '');
  } else {
    elem.removeAttribute('selected');
  }
}

/**
 * [style] directive — applies a style object to the element.
 */
export function styleDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const getter = on.getters['style'];
  const newValue = getter(inject);
  if (typeof newValue === 'object') {
    const elem = on.elem as HTMLElement;
    Objects.forEach(newValue, (prop: any, i: string | number) => {
      if (prop !== null)
        (elem.style as any)[i] = prop;
      else
        (elem.style as any)[i] = 'auto';
    });
  }
}

/**
 * [attribute] directive — applies a map of HTML attributes to the element.
 */
export function attributeDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const getter = on.getters['attribute'];
  const newValue = getter(inject);
  if (typeof newValue === 'object') {
    const elem = on.elem as HTMLElement;
    Objects.forEach(newValue, (prop: any, i: string | number) => {
      const key = String(i);
      if (prop !== elem.getAttribute(key)) {
        if (prop !== null) {
          elem.setAttribute(key, prop);
        } else {
          elem.removeAttribute(key);
        }
      }
    });
  }
}

/**
 * [display] directive — sets the element's display style directly.
 */
export function displayDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'display';
  const getter = on.getters[key];
  const newValue = getter(inject);
  const elem = on.elem as HTMLElement;

  if (on.values[key] !== newValue) {
    on.values[key] = newValue;
    if (!on.valuesD.hasOwnProperty(key)) {
      on.valuesD[key] = elem.style.display;
    }
    elem.style.display = newValue;
  }
}

/**
 * [show] directive — toggles visibility by setting display to 'none' or restoring original.
 */
export function showDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'show';
  const getter = on.getters[key];
  const newValue = getter(inject);
  const elem = on.elem as HTMLElement;

  if (on.values[key] !== newValue) {
    on.values[key] = newValue;
    if (!on.valuesD.hasOwnProperty(key)) {
      on.valuesD[key] = elem.style.display;
    }
    if (newValue) {
      elem.style.display = on.valuesD[key];
    } else {
      elem.style.display = 'none';
    }
  }
}

/**
 * [class] directive — adds a dynamic CSS class to the element.
 */
export function classDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'class';
  const getter = on.getters[key];
  const newValue = getter(inject);
  const elem = on.elem as HTMLElement;

  if (on.values[key] !== newValue) {
    on.values[key] = newValue;
    if (!on.valuesD.hasOwnProperty(key)) {
      on.valuesD[key] = elem.className;
    } else {
      elem.className = on.valuesD[key];
    }
    if (!empty(newValue) && elem.className.indexOf(newValue) < 0) {
      elem.className += (elem.className ? ' ' : '') + newValue;
    }
  }
}

/**
 * [innerhtml] directive — sets the element's innerHTML.
 */
export function innerhtmlDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'innerhtml';
  const getter = on.getters[key];
  const newValue = getter(inject);
  const elem = on.elem as HTMLElement;

  if (on.values[key] !== newValue) {
    on.values[key] = newValue;
    elem.innerHTML = newValue;
  }
}

/**
 * [text] directive — one-way data binding for text content.
 * Sets the element's innerText or textContent for display purposes only.
 * For two-way binding with form elements, use [bind] instead.
 * Supports format attribute for number, date, boolean, and other value transformations.
 */
export function textDirective(on: VDom, inject: any, ctx: DirectiveContext): void {
  const key = 'text';
  const getter = on.getters[key];
  
  let newValue: any;
  try {
    newValue = getter(inject);
  } catch (ex) {
    // Swallow errors — leave value undefined
  }

  // Update if value changed, or if this is the first render (on.values[key] === undefined)
  if ((on.values[key] !== newValue || !(key in on.values)) && on.elem) {
    on.values[key] = newValue;
    
    // Apply format transformation if format attribute is present
    let displayValue = newValue;
    if (on.elem instanceof HTMLElement) {
      displayValue = FormBinding.formatValueForDisplay(on.elem, newValue, ctx.getFormatExpression);
    }
    
    // Convert to string for display (handle all types including numbers, null, undefined)
    if (displayValue === null || displayValue === undefined) {
      displayValue = '';
    } else if (typeof displayValue !== 'string') {
      displayValue = String(displayValue);
    }
    
    if (on.elem.nodeType === Node.TEXT_NODE) {
      // Text node
      on.elem.nodeValue = displayValue;
    } else if (on.elem instanceof HTMLElement) {
      // Element node
      // Beware jstest doesnt relaibly see innerHTML of elements that have had their text set using innerText
      on.elem.innerText = displayValue;
    }
  }
}
