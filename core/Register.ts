import { BaseComponent } from "components/BaseComponent";

/**
 * Registry for components used by the binder.
 * Allows registration of custom components for extensibility.
 */
export class ComponentRegistry {
  private static components: Map<string, any> = new Map();

  /**
   * Register a component with the given tag name.
   * @param tagName - The component tag name (e.g., "app-card", "select-multiple")
   * @param componentClass - The component class
   */
  static register(tagName: string, componentClass: any): void {
    if (!tagName) {
      throw new Error(`Component name must not be empty`);
    }
    this.components.set(tagName, componentClass);
  }

  /**
   * Get a component by tag name.
   * @param name - The component tag name
   * @returns The component class, or undefined if not found
   */
  static get(name: string): any | undefined {
    if (!name) {
      throw new Error(`component name must not be empty`);
    }
    return this.components.get(name);
  }

  /**
   * Check if a component is registered.
   * @param name - The component tag name
   * @returns True if the component exists
   */
  static has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Unregister a component (useful for testing).
   * @param name - The component tag name
   */
  static unregister(name: string): void {
    this.components.delete(name);
  }

  /**
   * Clear all components (useful for testing).
   */
  static clear(): void {
    this.components.clear();
  }
}

/**
 * Register component to be used anywhere (backward compatibility)
 * @param componentClass - The component class
 * @param tagName - The component tag name
 * @returns The component class (for decorator chaining)
 */
export function RegisterComponent<T>(componentClass: T, tagName: string): T {
  ComponentRegistry.register(tagName, componentClass);
  return componentClass;
}

/**
 * Get registered component by name (backward compatibility)
 * @param name - The component tag name
 * @returns The component class
 */
export function RegisteredComponent<T = BaseComponent>(name: string): T {
  return ComponentRegistry.get(name);
}
