declare global {
  interface Window {
    LEET_REGISTER: Record<string, any>;
    Registered: typeof Registered;
  }
}

/**
 * Register a component name or get registered component by name
 */
window['LEET_REGISTER'] = {};
window['Registered'] = Registered;

/**
 * Register component to be used anywhere
 */
export function RegisterComponent<T>(componentClass: T, tagName: string): T {
  if (!tagName) {
    throw new Error(`Component name must not be empty`);
  }
  window['LEET_REGISTER'][tagName] = componentClass;
  return componentClass;
}

/**
 * Get registered component by name
 */
export function Registered<T = any>(name: string): T {
  if (!name) {
    throw new Error(`component name must not be empty`);
  }
  return window['LEET_REGISTER'][name];
}