import { IFormatter } from './IFormatter';

/**
 * Registry for value formatters used by FormBinding.
 * Allows registration of custom formatters for extensibility.
 */
export class FormatterRegistry {
  private static formatters: Map<string, IFormatter> = new Map();

  /**
   * Register a formatter with the given name.
   * @param name - The format name (e.g., "number", "currency", "percentage")
   * @param formatter - The formatter instance
   */
  static register(name: string, formatter: IFormatter): void {
    this.formatters.set(name, formatter);
  }

  /**
   * Get a formatter by name.
   * @param name - The format name
   * @returns The formatter instance, or undefined if not found
   */
  static get(name: string): IFormatter | undefined {
    return this.formatters.get(name);
  }

  /**
   * Check if a formatter is registered.
   * @param name - The format name
   * @returns True if the formatter exists
   */
  static has(name: string): boolean {
    return this.formatters.has(name);
  }

  /**
   * Unregister a formatter (useful for testing).
   * @param name - The format name
   */
  static unregister(name: string): void {
    this.formatters.delete(name);
  }

  /**
   * Clear all formatters (useful for testing).
   */
  static clear(): void {
    this.formatters.clear();
  }
}
