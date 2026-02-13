import { BaseComponent } from '../../../components/BaseComponent';
import { isFunction } from '../../helpers';
import { tryCall } from '../../helpers';
import { Objects } from '../../Objects';
import { DOM } from '../../DOM';
import { EAttrResult } from '../types';
import type { VDom, DirectiveContext } from '../types';
import { ExpressionCompiler } from '../ExpressionCompiler';

/**
 * Get a readable class name from an object
 */
function getClassName(object: any): string {
  const ret = object.constructor ? object.constructor.name : object.toString();
  return ret.replace(/bound /g, '');
}

/**
 * Wire parent getters to component properties.
 */
function wireProperties(
  component: BaseComponent,
  hostVDom: VDom,
  componentVDom: VDom,
  inject: any,
  directiveRegistry: Record<string, any>
): void {
  Objects.forEach(hostVDom.getters, (getter: Function, key: string | number) => {
    const k = String(key);
    // Skip the 'component' getter itself
    if (k === 'component') return;
    
    componentVDom.getters[k] = getter;
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
  hostVDom: VDom,
  componentVDom: VDom,
  inject: any
): string[] {
  const dynamicEvents: string[] = [];

  Objects.forEach(hostVDom.setters, (setter: Function, key: string | number) => {
    const k = String(key);
    componentVDom.setters[k] = setter;
    if (isFunction((component as any)[k + 'Change_2'])) {
      throw new Error(
        `Component can not have method ${k + 'Change_2'} it is used exclusively for 2-way data binding with ${k}`
      );
    }
    dynamicEvents.push(k + 'Change_2');
    (component as any)[k + 'Change_2'] = function (val: any) {
      return ExpressionCompiler.invokeSetter(componentVDom.setters[k], inject, val, k);
    };
  });

  return dynamicEvents;
}

/**
 * Wire event callers from parent onto the component instance.
 */
function wireEventCallers(
  component: BaseComponent,
  hostVDom: VDom,
  componentVDom: VDom,
  dynamicEvents: string[]
): void {
  Objects.forEach(hostVDom.callers, (caller: Function, key: string | number) => {
    const k = String(key);
    if (dynamicEvents.indexOf(k) >= 0) {
      throw new Error(
        `Component ${getClassName(component)} can not override 2-way event (${k})!`
      );
    }
    
    // Wrap the caller to inject $event from the first argument
    const wrappedCaller = function(...args: any[]) {
      const eventInject = Object.assign({}, hostVDom.INJECT || {}, { $event: args[0] });
      return caller(eventInject);
    };
    
    componentVDom.callers[k] = (component as any)[k] = wrappedCaller;
  });
}

/**
 * Set plain (non-reactive) attributes as properties on the component.
 */
function setPlainAttributes(component: BaseComponent, hostVDom: VDom): void {
  Objects.forEach(hostVDom.plainAttrs, (value: any, key: string | number) => {
    const k = String(key);
    if (value !== null && k !== 'component') {
      (component as any)[k] = value;
      component.attributes[k] = value;
    }
  });
}

/**
 * Handle content projection: move projected children into <content> placeholder(s).
 * 
 * IMPORTANT: By the time this function is called, projected children are ALREADY BOUND
 * to the parent page's context by BinderNew. This function only handles DOM placement.
 * 
 * @param hostElem The host element containing the component
 * @param projectedChildren VDom nodes representing children (already bound to parent context)
 * @returns Combined array of component items + projected children for tracking
 */
function handleContentProjection(
  hostElem: HTMLElement,
  componentItems: VDom[],
  projectedChildren: VDom[]
): VDom[] {
  const contentPlaceholders = hostElem.querySelectorAll('content');
  
  if (contentPlaceholders.length === 0) {
    // No <content> tags - just return component items
    return componentItems;
  }
  
  if (projectedChildren.length === 0) {
    // No children to project - remove empty placeholders
    for (let i = 0; i < contentPlaceholders.length; i++) {
      const placeholder = contentPlaceholders[i];
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    }
    return componentItems;
  }
  
  // Project children into the first <content> placeholder
  const placeholder = contentPlaceholders[0];
  const parent = placeholder.parentNode;
  
  if (parent) {
    // Insert the actual VDom elements (not clones) to preserve reactivity
    for (const childVDom of projectedChildren) {
      if (childVDom.elem) {
        const node = childVDom.fragment || childVDom.elem;
        parent.insertBefore(node, placeholder);
      }
    }
    
    // Remove the placeholder
    parent.removeChild(placeholder);
    
    // Remove any additional content placeholders
    for (let i = 1; i < contentPlaceholders.length; i++) {
      const extraPlaceholder = contentPlaceholders[i];
      if (extraPlaceholder.parentNode) {
        extraPlaceholder.parentNode.removeChild(extraPlaceholder);
      }
    }
  }
  
  // Return combined items for change detection tracking
  return componentItems.concat(projectedChildren);
}

/**
 * Create a cloned DocumentFragment of projected children for special components
 * that need access to the template (e.g., SwiperComponent, ItemList).
 * 
 * Note: This is separate from content projection and only needed by components
 * that explicitly use templateFragment in their logic.
 */
function createTemplateFragment(projectedChildren: VDom[]): DocumentFragment {
  const templateFrag = document.createDocumentFragment();
  for (const childVDom of projectedChildren) {
    if (childVDom.elem) {
      const node = childVDom.fragment || childVDom.elem;
      templateFrag.appendChild(node.cloneNode(true));
    }
  }
  return templateFrag;
}

/**
 * [component] directive — simplified component lifecycle management.
 * Renders component template as children of the host element.
 * 
 * IMPORTANT: Projected children (the children of the host element) are ALREADY BOUND
 * to the parent context by BinderNew before this directive runs. This directive only:
 * - Instantiates/manages the component instance
 * - Wires properties, events, and two-way bindings
 * - Renders the component's own template
 * - Handles DOM placement of projected content
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

    // Clear any previous component
    if (on.values[key] && on.values[key].binder) {
      ctx.removeVDomItems(on.values[key].binder.vdom.items);
      on.values[key].binder.destroy();
    }
    ctx.removeVDomItems(on.items);

    on.values[key] = component;

    if (!(component instanceof BaseComponent)) {
      return EAttrResult.SkipChildren;
    }

    const inj = Object.assign({}, inject);

    if (component.template) {
      // Create a new Binder for the component's own template
      const BinderClass = ctx.binder.constructor;
      component.binder = new BinderClass(component)
        .setInjectVars(inj)
        .bindElements(component.events, component.template);
      
      const componentVDom = component.binder!.vdom;

      // Wire properties, two-way bindings, and event callers
      wireProperties(component, on, componentVDom, inject, ctx.binder.getDirectiveRegistry());
      const dynamicEvents = wireTwoWayBindings(component, on, componentVDom, inject);
      wireEventCallers(component, on, componentVDom, dynamicEvents);
      setPlainAttributes(component, on);

      // IMPORTANT: on.items contains projected children that are ALREADY BOUND to parent context
      const hostElem = on.elem as HTMLElement;
      const projectedChildren: VDom[] = on.items.slice(); // Copy references
      
      // Create templateFragment for special components that need it (cloned copy)
      component.templateFragment = createTemplateFragment(projectedChildren);
      
      // Set up component context and update callback
      component.parentPage = ctx.context;
      component.templateUpdate = function () {
        ctx.checkVDomNode(on, inject);
      };

      // Clear host element and append component's rendered DOM
      hostElem.innerHTML = '';
      
      if (componentVDom.elem instanceof DocumentFragment) {
        hostElem.appendChild(componentVDom.elem);
        on.items = componentVDom.items;
      } else if (componentVDom.fragment) {
        hostElem.appendChild(componentVDom.fragment);
        on.items = [componentVDom];
      } else {
        hostElem.appendChild(componentVDom.elem!);
        on.items = [componentVDom];
      }
      
      // Store count of component's own items before adding projected children
      const componentItemCount = on.items.length;
      
      // Handle content projection: move pre-bound children into <content> placeholders
      on.items = handleContentProjection(hostElem, on.items, projectedChildren);
      
      // Store the projected children count for use during updates
      on.values['__projectedStartIndex'] = componentItemCount;

      // Call onInit with the host element
      tryCall(component, component._onInit, hostElem);
      
    } else {
      // Component does not have own template — keeping for compatibility
      const hostElem = on.elem as HTMLElement;
      component.parentPage = ctx.context;
      
      on.items = [];
      tryCall(component, component._onInit, hostElem);
    }
  } else {
    // --- Same component, just update ---
    if (component && component.binder) {
      const componentVDom = component.binder.vdom;
      
      // Re-wire properties to pick up any changes from parent
      wireProperties(component, on, componentVDom, inject, ctx.binder.getDirectiveRegistry());
      
      // Update the component
      tryCall(component, component.update);
      
      // IMPORTANT: Manually check projected children since we return SkipChildren
      // Projected children are bound to parent context and need to be updated
      // They're stored in on.items after the component's own items
      const projectedStartIndex = on.values['__projectedStartIndex'] || 0;
      for (let i = projectedStartIndex; i < on.items.length; i++) {
        ctx.checkVDomNode(on.items[i], inject);
      }
    }
  }

  return EAttrResult.SkipChildren;
}
