import { empty, isBoolean, numberFromLocaleString } from '../helpers';
import { DateTime } from '../DateTime';
import { DOM } from '../DOM';
import { isSkipUpdate, Watcher } from '../Watcher';

/**
 * Handles two-way data binding for form elements (INPUT, SELECT, TEXTAREA, etc.)
 * including value formatting, display updates, and reading values back from the DOM.
 */
export class FormBinding {
  /**
   * Check if an element is a form input that can set values
   */
  static isFormElement(elem: HTMLElement): boolean {
    switch (elem.tagName) {
      case 'SELECT':
      case 'OPTION':
      case 'TEXTAREA':
      case 'INPUT':
        return true;
      default:
        return false;
    }
  }

  /**
   * Check if the form element should react to 'input' events (vs only 'change')
   */
  static isInputOnInputElement(elem: HTMLElement): boolean {
    if (elem.tagName === 'TEXTAREA') return true;
    switch (elem.tagName + ':' + (elem as HTMLInputElement).type) {
      case 'INPUT:text':
      case 'INPUT:password':
      case 'INPUT:email':
      case 'INPUT:number':
      case 'INPUT:search':
      case 'INPUT:week':
      case 'INPUT:url':
      case 'INPUT:time':
      case 'INPUT:tel':
      case 'INPUT:range':
      case 'INPUT:month':
      case 'INPUT:datetime':
      case 'INPUT:date':
      case 'INPUT:color':
      case 'INPUT:file':
        return true;
      default:
        return false;
    }
  }

  /**
   * Convert null/undefined to empty string for display
   */
  static toInputValue(val: any): any {
    if (typeof val === 'undefined' || val === null) return '';
    return val;
  }

  /**
   * Round a number to the specified decimals
   */
  static round(num: number, decimals: number = 0): number {
    const scale = Math.pow(10, decimals);
    return Math.round(num * scale) / scale;
  }

  /**
   * Format a value for display in an element, applying the element's `format` attribute.
   * Handles number, localenumber, boolean, dateTime, date, time formats.
   */
  static formatValueForDisplay(elem: any, v: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    const format = elem.getAttribute ? elem.getAttribute('format') : null;
    if (format === null) return v;

    const formats = format.split(':');

    if (formats.length > 0 && (formats[0] === 'number' || formats[0] === 'localenumber')) {
      if (v !== '' && v !== null) {
        v = v * 1;
        if (isNaN(v)) v = 0;
        if (formats.length === 2) {
          const ln = !isNaN(formats[1])
            ? formats[1]
            : (getFormatExpression ? getFormatExpression(elem, 'format', formats[1]) : formats[1]);
          v = FormBinding.round(v, parseInt(ln));
        }
        if (formats[0] === 'localenumber' && elem.getAttribute('type') !== 'number' && Number(v).toLocaleString) {
          v = Number(v).toLocaleString();
        }
      }
    }

    if (formats.length > 0 && formats[0] === 'boolean') {
      if (formats.length === 2) {
        const titles = formats[1].split(',');
        v = titles[v === true ? 0 : 1];
        if (v === undefined) throw Error("Value of bind is not part of format's boolean options");
      }
    }

    if (formats.length > 0 && formats[0] === 'dateTime') {
      v = DateTime.toHumanDateTime(v);
    }
    if (formats.length > 0 && formats[0] === 'date') {
      v = DateTime.toHumanDate(v);
    }
    if (formats.length > 0 && formats[0] === 'time') {
      v = DateTime.toHumanTime(v);
    }

    return v;
  }

  /**
   * Format a value from a form element back to the model type, applying format transformations.
   */
  static formatValueFromElement(elem: HTMLElement, value: any, getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any): any {
    const format = elem.getAttribute('format');
    let v = value;

    if (!empty(format)) {
      const formats = format!.split(':');

      if (formats.length > 0 && (formats[0] === 'number' || formats[0] === 'localenumber')) {
        if (value === '') {
          v = null;
        } else {
          if (formats[0] === 'localenumber') {
            v = numberFromLocaleString(value);
          } else {
            v = Number(value);
          }
          if (isNaN(v)) v = 0;
          if (formats.length === 2) {
            const ln = !isNaN(formats[1] as any)
              ? formats[1]
              : (getFormatExpression ? getFormatExpression(elem, 'format', formats[1]) : formats[1]);
            v = FormBinding.round(v, parseInt(ln));
          }
        }
      }

      if (formats.length > 0 && formats[0] === 'boolean') {
        if (formats.length === 2) {
          const titles = formats[1].split(',');
          if (titles.length >= 1)
            v = value === titles[0];
          else
            v = parseInt(value) !== 0;
        } else {
          if (value === 'true') v = true;
          else if (value === 'false') v = false;
          else v = parseInt(value) !== 0;
        }
      }

      if (formats.length > 0 && formats[0] === 'dateTime') {
        if (formats.length === 1) {
          v = DateTime.fromHumanDateTime(value);
        }
      }
      if (formats.length > 0 && formats[0] === 'date') {
        if (formats.length === 1) {
          v = DateTime.fromHumanDate(value);
        }
      }
      if (formats.length > 0 && formats[0] === 'time') {
        if (formats.length === 1) {
          v = DateTime.fromHumanTime(value);
        }
      }
    }

    return v;
  }

  /**
   * Update a DOM element's displayed value based on the model value.
   * Handles SELECT, INPUT (radio, checkbox, file, text), IMG, text nodes, and other elements.
   */
  static updateBoundElement(
    elem: any,
    value: any,
    getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any,
    updateBoundContextPropertyFn?: (elem: any) => void
  ): void {
    let v = FormBinding.formatValueForDisplay(elem, value, getFormatExpression);

    switch (elem.tagName) {
      case 'SELECT': {
        const firstOption: HTMLOptionElement | undefined = DOM(elem).find('option')[0] as any;
        if (v === null || v === undefined) {
          let fVal: string | null = null;
          if (firstOption) {
            firstOption.selected = true;
            fVal = firstOption.value;
          }
          if (fVal !== null) {
            elem.value = fVal;
            if (updateBoundContextPropertyFn) updateBoundContextPropertyFn(elem);
          }
        } else {
          const sel: HTMLOptionElement | undefined = DOM(elem).find("option[value='" + v + "']")[0] as any;
          if (sel) {
            sel.selected = true;
            elem.value = v;
          } else {
            DOM(elem).find('option[selected]').attr('selected', null);
          }
        }
        break;
      }
      case 'TEXTAREA':
        elem.value = FormBinding.toInputValue(v);
        break;
      case 'OPTION':
      case 'INPUT':
        switch ((elem as HTMLInputElement).type) {
          case 'radio': {
            let cv: any = elem.value;
            if (isBoolean(v)) {
              cv = elem.value === 'true';
            }
            (elem as HTMLInputElement).checked = (v == cv || (v === null && elem.value === ''));
            break;
          }
          case 'checkbox':
            (elem as HTMLInputElement).checked = v;
            break;
          case 'file':
            // file value cannot be set programmatically
            break;
          default:
            elem.value = FormBinding.toInputValue(v);
            break;
        }
        break;
      case 'IMG':
        if (elem.src !== v) elem.src = FormBinding.toInputValue(v);
        break;
      case undefined:
        // Text node
        if (elem.nodeValue !== v) elem.nodeValue = FormBinding.toInputValue(v);
        break;
      default:
        if (elem.innerText !== v) elem.innerText = FormBinding.toInputValue(v);
        break;
    }
  }

  /**
   * Read a form element's current value and write it back to the model via the setter.
   * @param elem - The DOM element
   * @param skipUpdate - If true, skip triggering watcher updates
   * @param injectVars - The binder's inject variables
   * @param findElemInject - Function to find inject vars from parent elements
   * @param context - The context object
   * @param getFormatExpression - Optional function to evaluate dynamic format expressions
   */
  static updateBoundContextProperty(
    elem: any,
    skipUpdate: boolean | undefined,
    injectVars: Record<string, any>,
    findElemInject: (elem: any) => any,
    context: any,
    getFormatExpression?: (elem: any, attrName: string, attrValue: string) => any
  ): void {
    if (
      !FormBinding.isFormElement(elem) ||
      empty(elem['VDOM']) ||
      empty(elem['VDOM'].setters) ||
      empty(elem['VDOM'].setters.bind)
    ) {
      return;
    }

    let v: any;
    const type = elem.getAttribute('type');

    switch (elem.tagName) {
      case 'SELECT': {
        const sel = DOM(elem).find('option:checked')[0] as HTMLOptionElement | undefined;
        if (sel) {
          v = FormBinding.formatValueFromElement(elem, sel.getAttribute('value'), getFormatExpression);
        }
        break;
      }
      case 'OPTION':
      case 'INPUT':
        switch (type) {
          case 'checkbox':
            v = elem.checked;
            break;
          case 'file':
            v = elem.value;
            break;
          default:
            v = FormBinding.formatValueFromElement(elem, elem.value, getFormatExpression);
            break;
        }
        break;
      default:
        v = elem.value;
    }

    const inj = Object.assign({}, injectVars, findElemInject(elem));
    const domElVal = elem['VDOM'].getters.bind(inj);
    const vDomElVal = elem['VDOM'].values.bind;

    if (domElVal !== v || v !== vDomElVal) {
      if (skipUpdate && context[isSkipUpdate] === false) {
        Watcher.noChange(() => {
          elem['VDOM'].setters.bind(inj, v);
        });
      } else {
        // Set to dummy first to ensure the watcher triggers even if value is the same
        elem['VDOM'].setters.bind(inj, Symbol('dummy'));
        elem['VDOM'].setters.bind(inj, v);
      }
    }
  }
}