import type { BaseComponent } from '../../components/BaseComponent';

/**
 * Result codes for directive/attribute execution
 */
export const enum EAttrResult {
  None = 0,
  NodeChanged = 1,
  SkipChildren = 2,
  NodeChangedSkipChildren = 3,
}

/**
 * Virtual DOM node - the core bookkeeping structure mapping real DOM nodes to reactive bindings
 */
export interface VDom {
  /** The real DOM element (HTMLElement, Text, Comment, or DocumentFragment) */
  elem: HTMLElement | Text | Comment | DocumentFragment | null;
  /** Optional DocumentFragment used during construction */
  fragment: DocumentFragment | null;
  /** Child vDom nodes */
  items: VDom[];
  /** Cached values for dirty-checking (keyed by attribute name) */
  values: Record<string, any>;
  /** Default/original values (e.g., original display style before [show] hides it) */
  valuesD: Record<string, any>;
  /** Getter functions for reactive attributes (keyed by attribute name) */
  getters: Record<string, Function>;
  /** Setter functions for two-way bound attributes */
  setters: Record<string, Function>;
  /** Caller functions for event handlers */
  callers: Record<string, Function>;
  /** Plain (non-reactive) attributes */
  plainAttrs: Record<string, string | null>;
  /** Factory function to build child items (used by directives like [if], [foreach]) */
  itemBuilder: ((inject: any) => VDom) | null;
  /** Reference to the context object (page or component) */
  context: any;
  /** Injected variables for the current scope (e.g., foreach item/index) */
  INJECT: any;
}

/**
 * Event callbacks that can be attached to bound elements
 */
export interface EventCallbacks {
  change: ((event: Event) => void) | null;
  focus: ((event: Event) => void) | null;
  input: ((event: Event) => void) | null;
  click: ((event: Event) => void) | null;
  [key: string]: ((event: Event) => void) | null;
}

/**
 * Reactivity type parsed from attribute name syntax
 */
export interface ReactivityType {
  /** 'get' for [], 'get-set' for [()] or bind, 'call' for (), null for plain */
  type: 'get' | 'get-set' | 'call' | null;
  /** The actual attribute key without brackets/parens */
  key: string;
}

/**
 * Parsed [foreach] expression parts
 */
export interface ForeachParts {
  data: string | null;
  index: string;
  item: string;
  where: string | null;
}

/**
 * IR node - intermediate representation produced by the template parser
 */
export interface IRNode {
  type: 'element' | 'text' | 'managed';
  tag?: string;
  /** Reactive and plain attributes */
  attributes: Record<string, string>;
  /** If this is a directive wrapper, contains the directive attribute info */
  directive?: { key: string; expression: string };
  /** Child IR nodes */
  children: IRNode[];
  /** For text nodes: the text content (null if it's a bound text node) */
  textContent?: string;
  /** For bound text nodes: the bind expression */
  bindExpression?: string;
}

/**
 * Context passed to directive handlers, providing access to binder internals
 */
export interface DirectiveContext {
  /** The binder instance */
  binder: any;
  /** Execute an attribute handler */
  executeAttribute: (attribute: string, on: VDom, inject: any) => EAttrResult;
  /** Walk and update a vDom subtree */
  checkVDomNode: (on: VDom, inject: any) => EAttrResult;
  /** Create items from an itemBuilder */
  vDomCreateItems: (on: VDom, inject: any) => void;
  /** Create a getter function from an expression */
  createGetter: (expression: string, inject: any, key: string) => Function;
  /** Insert vDom element after a reference node */
  insertVDomElementAfter: (vdom: VDom, referenceNode: Node) => void;
  /** Insert vDom items after a reference node */
  insertVDomItemsAfter: (items: VDom[], referenceNode: Node) => void;
  /** Remove vDom items from the DOM */
  removeVDomItems: (items: VDom[], keepEvents?: boolean) => void;
  /** Remove a single element from the DOM */
  removeElement: (elem: Node, keepEvents?: boolean) => void;
  /** Update a bound HTML element's displayed value */
  updateBoundElement: (elem: any, value: any) => void;
  /** Update the context property from a form element's current value */
  updateBoundContextProperty: (elem: any, skipUpdate?: boolean) => void;
  /** Parse a template and execute it, returning a VDom tree */
  parseAndExecute: (template: string, inject: any) => VDom;
  /** Create and execute a getter for a dynamic attribute value on a specific element */
  getFormatExpression: (elem: any, attrName: string, attrValue: string) => any;
  /** The context object (page or component instance) */
  context: any;
  /** Injected variables at the binder level */
  injectVars: Record<string, any>;
  /** Event callbacks */
  eventCallbacks: EventCallbacks;
}

/**
 * Signature for a directive handler function
 */
export type DirectiveHandler = (on: VDom, inject: any, ctx: DirectiveContext) => EAttrResult | void;

/**
 * Factory function to create a properly initialized VDom node
 */
export function createVDomNode(overrides: Partial<VDom> = {}): VDom {
  return {
    elem: null,
    fragment: null,
    items: [],
    values: {},
    valuesD: {},
    getters: {},
    setters: {},
    callers: {},
    plainAttrs: {},
    itemBuilder: null,
    context: null,
    INJECT: null,
    ...overrides,
  };
}