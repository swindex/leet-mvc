import { empty, tryCall, isObject, isString, isArray, isFunction } from '../helpers';
import { BaseComponent } from '../../components/BaseComponent';
import { isSkipUpdate } from '../Watcher';
import { Objects } from '../Objects';
import { DOM } from '../DOM';

import type {
  VDom, EventCallbacks, ReactivityType, DirectiveContext, DirectiveHandler, IRNode,
} from './types';
import { EAttrResult, createVDomNode } from './types';
import { ExpressionCompiler } from './ExpressionCompiler';
import { FormBinding } from './FormBinding';
import { VDomOps } from './VDomOps';
import { TemplateParser } from './TemplateParser';
import { directiveRegistry } from './directives';
import { parseForeachExpression } from './directives/ForeachDirective';

/**
 * The new class-based Binder — the template engine and reactive data-binding core.
 *
 * Responsibilities:
 * - Parse HTML templates into an IR tree
 * - Execute the IR to build a vDom tree of real DOM elements
 * - Maintain reactive bindings (getters, setters, callers) between model and view
 * - Dispatch to directive handlers for structural/reactive attributes
 * - Provide updateElements() for the change detection cycle
 */
export class Binder {
  vdom: VDom | null = null;
  context: any;
  injectVars: Record<string, any> = {};
  eventCallbacks: EventCallbacks = { change: null, focus: null, input: null, click: null };

  private compiler: ExpressionCompiler = new ExpressionCompiler();
  private parser: TemplateParser = new TemplateParser();

  constructor(context: object) {
    this.context = context || this;
  }

  // --- Public API ---

  setContext(context: any): this {
    this.context = context;
    return this;
  }

  setInjectVars(vars: Record<string, any>): this {
    this.injectVars = vars;
    return this;
  }

  /**
   * Bind DOM elements with model.
   * Parses the template, builds the vDom, and returns this for chaining.
   */
  bindElements(eventCallbacks: any, template: string): this {
    if (typeof eventCallbacks === 'function') {
      this.eventCallbacks.change = eventCallbacks;
    } else if (typeof eventCallbacks === 'object' && eventCallbacks) {
      this.eventCallbacks = Object.assign(this.eventCallbacks, eventCallbacks);
    }

    if (!(this.context as any).injectVars) {
      (this.context as any).injectVars = {};
    }

    const ir = this.parser.parse(template);
    this.vdom = this.executeIR(ir, this.injectVars);
    return this;
  }

  /**
   * Update DOM elements according to bindings (the change detection cycle).
   */
  updateElements(): this {
    this.context[isSkipUpdate] = true;
    this.checkVDomNode(this.vdom!, this.injectVars);
    this.context[isSkipUpdate] = false;
    return this;
  }

  /**
   * Destroy the root DOM and vDom elements and all hooks.
   */
  destroy(): void {
    if (this.vdom) {
      VDomOps.removeVDOMElement(this.vdom);
      this.vdom = null;
    }
  }

  /**
   * Return the directive registry (used by ComponentDirective to check known attributes).
   */
  getDirectiveRegistry(): Record<string, DirectiveHandler> {
    return directiveRegistry;
  }

  // --- IR Execution (replaces string-based code generation) ---

  /**
   * Execute an IR tree, creating real DOM elements and building the vDom tree.
   */
  private executeIR(ir: IRNode, inject: any): VDom {
    if (ir.type === 'text') {
      return this.createTextNode(ir, inject);
    }

    if (ir.type === 'directive') {
      return this.createDirectiveNode(ir, inject);
    }

    // type === 'element'
    return this.createElementNode(ir, inject);
  }

  /**
   * Create a vDom node for a text IR node.
   */
  private createTextNode(ir: IRNode, inject: any): VDom {
    if (ir.bindExpression) {
      // Bound text node
      const elem = document.createTextNode('');
      const getters: Record<string, Function> = {
        bind: this.compiler.createGetter(ir.bindExpression, inject, this.context, 'bind'),
      };
      const vdom = createVDomNode({
        elem, getters, setters: {}, context: this.context,
      });
      this.executeAttribute('bind', vdom, inject);
      return vdom;
    }

    // Plain text node
    const elem = document.createTextNode(ir.textContent || '');
    return createVDomNode({ elem, context: this.context });
  }

  /**
   * Create a vDom node for a directive IR node ([if], [foreach], [component], etc.)
   */
  private createDirectiveNode(ir: IRNode, inject: any): VDom {
    const directiveFragment = document.createDocumentFragment();
    const dirKey = ir.directive!.key;
    const dirExpression = ir.directive!.expression;

    const rType = this.getReactivityType(dirKey);
    const key = rType.key;

    // Create comment anchor for the directive [if], [component], etc. 
    const elem = document.createComment(`${dirKey}=${dirExpression} `);
    directiveFragment.appendChild(elem);

    const getters: Record<string, Function | any> = {};

    if (dirExpression) {
      if (key === 'foreach') {
        getters[key] = parseForeachExpression(dirExpression);
      } else {
        getters[key] = this.compiler.createGetter(dirExpression, inject, this.context, key);
      }
    }

    // itemBuilder: lazily creates children from the IR
    const self = this;
    const itemBuilder = (inj: any): VDom => {
      // Check if the IR has directive attributes (for nested directives like [if] + [component])
      const DIRECTIVE_ATTRS = new Set(['[foreach]', '[transition]', '[html]', '[component]', '[if]']);
      let hasDirectiveAttr = false;
      for (const attrKey in ir.attributes) {
        if (DIRECTIVE_ATTRS.has(attrKey)) {
          hasDirectiveAttr = true;
          break;
        }
      }

      // If there are directive attributes, create a new IR node with the first directive
      if (hasDirectiveAttr) {
        const directives: Array<{ key: string; expression: string }> = [];
        const nonDirectiveAttrs: Record<string, string> = {};
        
        for (const attrKey in ir.attributes) {
          if (DIRECTIVE_ATTRS.has(attrKey)) {
            directives.push({ key: attrKey, expression: ir.attributes[attrKey] });
          } else {
            nonDirectiveAttrs[attrKey] = ir.attributes[attrKey];
          }
        }

        // Create a directive IR node for the first directive found
        if (directives.length > 0) {
          const directiveIR: IRNode = {
            type: 'directive',
            tag: ir.tag,
            attributes: nonDirectiveAttrs,
            children: ir.children,
            directive: directives[0],
          };
          return self.createDirectiveNode(directiveIR, inj);
        }
      }

      // No directive attributes, process as normal element
      const childVDom = self.createElementNode(ir, inj);
      // If the element has a "fragment" attribute, convert to DocumentFragment
      if (childVDom.elem instanceof HTMLElement && childVDom.elem.getAttribute && childVDom.elem.getAttribute('fragment') !== null) {
        const frag = document.createDocumentFragment();
        DOM(frag).append(childVDom.elem.childNodes);
        childVDom.elem = frag;
      }
      return childVDom;
    };

    const vdom = createVDomNode({
      elem,
      fragment: directiveFragment,
      getters,
      itemBuilder,
      INJECT: key === 'foreach' ? inject : null,
    });

    this.executeAttribute(key, vdom, inject);
    return vdom;
  }

  /**
   * Create a vDom node for an element IR node.
   */
  private createElementNode(ir: IRNode, inject: any): VDom {
    inject = inject || {};

    // Handle __textgroup__: flatten multiple text children
    if (ir.tag === '__textgroup__') {
      const items: VDom[] = [];
      const frag = document.createDocumentFragment();
      for (const child of ir.children) {
        const childVDom = this.executeIR(child, inject);
        items.push(childVDom);
        frag.appendChild(childVDom.elem!);
      }
      return createVDomNode({ elem: frag, items, context: this.context });
    }

    // Check if this tag is a registered component (but not if we're inside a component directive's itemBuilder)
    const tag = ir.tag!;
    const componentClass = this.tryGetComponent(tag);
    if (componentClass && !(this.context instanceof componentClass) && !inject.__skipComponentDetection) {
      // Convert this element into a component directive
      const componentIR: IRNode = {
        type: 'directive',
        tag: 'component-tag-does-not-render',
        attributes: { ...ir.attributes },
        directive: { key: '[component]', expression: `Registered('${tag}')` },
        children: ir.children,
      };
      return this.createDirectiveNode(componentIR, inject);
    }

    let elem: HTMLElement | DocumentFragment = document.createElement(ir.tag!);
    const vdomItems: VDom[] = [];
    const getters: Record<string, Function> = {};
    const setters: Record<string, Function> = {};
    const callers: Record<string, Function> = {};
    const plainAttrs: Record<string, string | null> = {};
    const renderImmediately: string[] = [];

    // Process attributes
    const attrKeys = Object.keys(ir.attributes);
    for (const attrName of attrKeys) {
      const bindExpression = ir.attributes[attrName];
      const rType = this.getReactivityType(attrName);
      const key = rType.key;

      if (!bindExpression) {
        plainAttrs[key] = null;
        (elem as HTMLElement).setAttribute(key, ir.attributes[attrName]);
        continue;
      }

      switch (rType.type) {
        case 'get-set':
          getters[key] = this.compiler.createGetter(bindExpression, inject, this.context, key);
          setters[key] = this.compiler.createSetter(bindExpression, inject, this.context);
          if (FormBinding.isFormElement(elem as HTMLElement)) {
            this.applyCallbacks(elem as HTMLElement, this.context, this.eventCallbacks);
            if ((inject as any).component && (inject as any).component.events) {
              this.applyCallbacks(elem as HTMLElement, (inject as any).component, (inject as any).component.events);
            }
          }
          renderImmediately.push(key);
          (elem as HTMLElement).setAttribute(key, ir.attributes[attrName]);
          break;
        case 'get':
          getters[key] = this.compiler.createGetter(bindExpression, inject, this.context, key);
          renderImmediately.push(key);
          break;
        case 'call': {
          const caller = this.compiler.createCaller(bindExpression, inject, this.context);
          if (caller) callers[key] = caller;
          break;
        }
        default:
          plainAttrs[key] = bindExpression;
          (elem as HTMLElement).setAttribute(key, ir.attributes[attrName]);
          break;
      }
    }

    // If element has "fragment" attribute, convert to DocumentFragment
    if (plainAttrs['fragment'] !== undefined) {
      const frag = document.createDocumentFragment();
      // Move any existing children from the element to the fragment
      DOM(frag).append(elem.childNodes);
      elem = frag;
    }

    // Process children
    for (const child of ir.children) {
      const childVDom = this.executeIR(child, inject);
      if (childVDom) {
        if (childVDom.elem instanceof DocumentFragment) {
          // Fragment children get inlined
          for (const item of childVDom.items) {
            vdomItems.push(item);
          }
          elem.appendChild(childVDom.elem);
        } else {
          vdomItems.push(childVDom);
          elem.appendChild(childVDom.fragment || childVDom.elem!);
        }
      }
    }

    const vdom = createVDomNode({
      elem,
      getters,
      setters,
      callers,
      plainAttrs,
      items: vdomItems,
      context: this.context,
    });
    (elem as any)['VDOM'] = vdom;

    // Execute immediately-renderable attributes
    for (const key of renderImmediately) {
      this.executeAttribute(key, vdom, inject);
    }

    // Bind DOM events to context
    if (plainAttrs['fragment'] === undefined && elem instanceof HTMLElement) {
      this.bindEventsToContext(elem, inject);
    }

    return vdom;
  }
  
  dumpHumanDeadableError(msg: string, elem: HTMLElement, ex: Error) {
    console.error(msg, elem.innerText, ex);
  }

  // --- Attribute Execution ---

  /**
   * Execute a single attribute/directive on a vDom node.
   */
  private executeAttribute(attribute: string, on: VDom, inject: any): EAttrResult {
    const old = on.values[attribute];
    let ret: EAttrResult | void = EAttrResult.None;

    try {
      const handler = directiveRegistry[attribute];
      if (handler) {
        ret = handler(on, inject, this.createDirectiveContext());
      } else {
        // Custom/unknown attribute — apply getter value
        if (on.getters[attribute]) {
          const value = on.getters[attribute](inject);
          if (this.context instanceof BaseComponent) {
            if (on.elem === (this.context as any).container && (this.context as any)[attribute] !== value) {
              (this.context as any)[attribute] = value;
            }
            if (typeof (this.context as any)[attribute + '$Set'] === 'function') {
              (this.context as any)[attribute + '$Set'](value);
            }
          }
          if (on.elem) {
            (on.elem as any)[attribute] = value;
          }
        }
      }
    } catch (ex: any) {
      throw new Error(`${ex.message} executing attribute '${attribute}'`);
    }

    if (old !== on.values[attribute] && ret !== EAttrResult.SkipChildren) {
      ret = EAttrResult.NodeChanged;
    }
    return ret as EAttrResult;
  }

  /**
   * Recursively walk and update a vDom subtree.
   */
  private checkVDomNode(on: VDom, inject: any): EAttrResult {
    let nodeChanged = EAttrResult.None;
    if (on && on.getters) {
      for (const key in on.getters) {
        if (!on.getters.hasOwnProperty(key)) continue;
        const dirResult = this.executeAttribute(key, on, inject);
        if (dirResult === EAttrResult.SkipChildren) {
          return EAttrResult.SkipChildren;
        }
      }
      for (const i in on.items) {
        if (!on.items.hasOwnProperty(i)) continue;
        if (this.checkVDomNode(on.items[i], inject) === EAttrResult.NodeChanged) {
          nodeChanged = EAttrResult.NodeChanged;
        }
      }
    }
    return nodeChanged;
  }

  // --- Reactivity Type Parsing ---

  /**
   * Parse an attribute name to determine its reactivity type.
   */
  private getReactivityType(attrName: string): ReactivityType {
    // [()]
    let matches = attrName.match(/^\[\((.*)\)\]$/);
    if (matches) return { type: 'get-set', key: matches[1] };
    // ()
    matches = attrName.match(/^\((.*)\)$/);
    if (matches) return { type: 'call', key: matches[1] };
    // []
    matches = attrName.match(/^\[(.*)\]$/);
    if (matches) {
      const key = matches[1];
      // Special case: [bind] should be get-set for two-way binding, not just get
      if (key === 'bind') {
        return { type: 'get-set', key };
      }
      return { type: 'get', key };
    }
    // Plain bind without brackets (for backward compatibility)
    if (attrName === 'bind') {
      return { type: 'get-set', key: attrName };
    }

    return { type: null, key: attrName };
  }

  // --- Event Binding ---

  /**
   * Bind element's DOM events (onclick, onchange, etc.) to the context.
   */
  private bindEventsToContext(elem: HTMLElement, inject: any): void {
    const attrs = Array.prototype.slice.call(elem.attributes);
    for (const attr of attrs) {
      if (typeof (elem as any)[attr.name] === 'function') {
        (elem as any)[attr.name] = null;
        const sName = attr.name.substr(2);
        const self = this;
        const handler = function (evt: Event) {
          const target = (evt as any).currentTarget;
          self.updateBoundContextProperty(target);
          const inj = Object.assign({}, self.injectVars, { '$event': evt }, inject, self.findElemInject(elem));
          const eventHandler = self.compiler.createCaller(attr.value, inj, self.context);
          if (eventHandler) eventHandler(inj);
          // Immediately update the target HTML element value in case the handler changed it
          if (target && target.VDOM && FormBinding.isFormElement(target) && target.getAttribute('bind')) {
            const bindHandler = directiveRegistry['bind'];
            if (bindHandler) {
              bindHandler(target.VDOM, inject, self.createDirectiveContext());
            }
          }
        };
        DOM(elem).addEventListener(sName, handler);
      }
    }
  }

  /**
   * Apply form-related event callbacks (change, input, custom) to an element.
   */
  private applyCallbacks(elem: HTMLElement, context: any, callbacks: any): void {
    for (const k in callbacks) {
      if (empty(callbacks[k]) || k === 'change' || k === 'input') continue;
      this.applyCallback(elem, context, k, callbacks[k]);
    }
    if (FormBinding.isFormElement(elem)) {
      if (FormBinding.isInputOnInputElement(elem)) {
        this.applyCallback(elem, context, 'input', callbacks['input'], true);
      }
      this.applyCallback(elem, context, 'change', callbacks['change']);
    }
  }

  private applyCallback(elem: HTMLElement, context: any, evName: string, callback: any, cancelUIUpdate?: boolean): void {
    const self = this;
    DOM(elem).addEventListener(evName, function (event: Event) {
      self.updateBoundContextProperty((event as any).target, cancelUIUpdate);
      if (callback && tryCall(context, callback, event) && (event.target as any)?.parentNode) {
        self.repaint((event.target as any).parentNode);
      }
    });
  }

  // --- Form Binding Wrappers ---

  /**
   * Update a bound element's displayed value.
   */
  private updateBoundElement(elem: any, value: any): void {
    const self = this;
    FormBinding.updateBoundElement(
      elem,
      value,
      (el, attrName, attrValue) => this.createExecuteElemAttrGetter(el, attrName, attrValue),
      (el) => this.updateBoundContextProperty(el)
    );
  }

  /**
   * Read a form element's value and write it back to the model.
   */
  private updateBoundContextProperty(elem: any, skipUpdate?: boolean): void {
    FormBinding.updateBoundContextProperty(
      elem,
      skipUpdate,
      this.injectVars,
      (el) => this.findElemInject(el),
      this.context,
      (el, attrName, attrValue) => this.createExecuteElemAttrGetter(el, attrName, attrValue)
    );
  }

  /**
   * Create and execute a getter for a dynamic attribute value on a specific element.
   */
  private createExecuteElemAttrGetter(elem: any, attrName: string, attrValue: string): any {
    try {
      const inj = this.findElemInject(elem);
      if (empty(elem.VDOM.getters[attrName])) {
        elem.VDOM.getters[attrName] = this.compiler.createGetter(attrValue, inj, this.context, attrName);
      }
      return elem.VDOM.getters[attrName](inj);
    } catch (ex) {
      return null;
    }
  }

  // --- Helpers ---

  /**
   * Find the closest INJECT object by walking up the DOM tree.
   */
  private findElemInject(elem: any): any {
    if (elem && elem.VDOM && elem.VDOM.INJECT) {
      return elem.VDOM.INJECT;
    }
    if (elem && elem.parentNode) {
      return this.findElemInject(elem.parentNode);
    }
    return null;
  }

  /**
   * Parse a template and execute it, returning a VDom tree.
   * Used by directives that need to dynamically render templates.
   */
  private parseAndExecute(template: string, inject: any): VDom {
    const ir = this.parser.parse(template);
    return this.executeIR(ir, inject);
  }

  /**
   * Try to get a registered component class by tag name.
   */
  private tryGetComponent(tagName: string): any {
    return (window as any)['LEET_REGISTER'] ? (window as any)['LEET_REGISTER'][tagName] : null;
  }

  /**
   * Force repaint of an element.
   */
  private repaint(element: HTMLElement): void {
    const old = element.style.display;
    element.style.display = 'none';
    element.style.display = old;
  }

  /**
   * Create the DirectiveContext object that is passed to all directive handlers.
   */
  private createDirectiveContext(): DirectiveContext {
    return {
      binder: this,
      executeAttribute: (attr, on, inj) => this.executeAttribute(attr, on, inj),
      checkVDomNode: (on, inj) => this.checkVDomNode(on, inj),
      vDomCreateItems: (on, inj) => VDomOps.vDomCreateItems(on, inj),
      createGetter: (expr, inj, key) => this.compiler.createGetter(expr, inj, this.context, key),
      insertVDomElementAfter: (vdom, ref) => VDomOps.insertVDomElementAfter(vdom, ref),
      insertVDomItemsAfter: (items, ref) => VDomOps.insertVDomItemsAfter(items, ref),
      removeVDomItems: (items, keepEvents) => VDomOps.removeVDomItems(items, keepEvents),
      removeElement: (elem, keepEvents) => VDomOps.removeElement(elem, keepEvents),
      updateBoundElement: (elem, value) => this.updateBoundElement(elem, value),
      updateBoundContextProperty: (elem, skip) => this.updateBoundContextProperty(elem, skip),
      parseAndExecute: (template, inj) => this.parseAndExecute(template, inj),
      context: this.context,
      injectVars: this.injectVars,
      eventCallbacks: this.eventCallbacks,
    };
  }
}

/**
 * Recursively destroy a vDom tree (exported for use by BasePage/BaseComponent cleanup).
 */
export function removeVDOMElement(en: any): void {
  VDomOps.removeVDOMElement(en);
}