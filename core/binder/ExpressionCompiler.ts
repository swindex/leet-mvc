import { empty } from '../helpers';

/**
 * Compiles binding expressions into getter, setter, and caller functions.
 * Uses `new Function()` for dynamic evaluation, bound to the provided context.
 * Results are cached for performance.
 */
export class ExpressionCompiler {
  private cache: Record<string, Function> = {};

  /**
   * Create a getter function that evaluates the expression and returns a value.
   * @param expression - The binding expression (e.g., "this.name", "this.items.length > 0")
   * @param inject - The current inject variables (used to build the preamble)
   * @param context - The context object to bind the function to
   * @param key - The attribute key (for error messages)
   */
  createGetter(expression: string, inject: any, context: any, key: string): Function {
    const preamble = this.buildInjectPreamble(inject);
    const cacheKey = preamble + expression;

    if (this.cache.hasOwnProperty(cacheKey)) {
      return this.cache[cacheKey];
    }

    try {
      const getter = new Function('inject',
        `${preamble}; return ${expression};`
      );
      const bound = getter.bind(context);
      this.cache[cacheKey] = bound;
      return bound;
    } catch (ex: any) {
      throw new Error(
        `${ex.message} creating getter for attribute ${key}="${expression}"\nGetter must be a valid expression`
      );
    }
  }

  /**
   * Create a setter function that assigns a value to the expression path.
   * @param expression - The binding expression (must be assignable, e.g., "this.name")
   * @param inject - The current inject variables
   * @param context - The context object to bind the function to
   */
  createSetter(expression: string, inject: any, context: any): Function {
    const preamble = this.buildInjectPreamble(inject);

    try {
      const setter = new Function('inject', 'value',
        `${preamble}; return ${expression} = value;`
      );
      return setter.bind(context);
    } catch (ex: any) {
      console.error(`Error creating setter for expression "${expression}": ${ex.message}`);
      throw ex;
    }
  }

  /**
   * Create a caller function that executes the expression without returning a value.
   * Used for event handlers like (click)="this.doSomething()".
   * @param expression - The expression to execute
   * @param inject - The current inject variables
   * @param context - The context object to bind the function to
   */
  createCaller(expression: string, inject: any, context: any): Function | null {
    const preamble = this.buildInjectPreamble(inject);
    // Always include $event for callers since they're primarily used for event handlers
    const eventPreamble = preamble + (preamble.includes("$event") ? "" : "var $event=inject?.['$event'];\n");
    const cacheKey = eventPreamble + expression;

    if (this.cache.hasOwnProperty(cacheKey)) {
      return this.cache[cacheKey];
    }

    try {
      const caller = new Function('inject',
        `${eventPreamble}; ${expression};`
      );
      const bound = caller.bind(context);
      this.cache[cacheKey] = bound;
      return bound;
    } catch (ex: any) {
      console.error(`Error creating caller for expression "${expression}": ${ex.message}`);
      return null;
    }
  }

  /**
   * Build the JavaScript preamble that destructures inject variables into local vars.
   * For example, if inject = { index: 0, item: {...} }, this produces:
   *   "var index = inject['index'];\nvar item = inject['item'];\n"
   */
  buildInjectPreamble(vars: any): string {
    let preamble = '';
    if (!empty(vars)) {
      for (const key in vars){
        if (!vars.hasOwnProperty(key)) continue;
        preamble += `var ${key}=inject?.['${key}'];\n`;
      }
    }
    return preamble;
  }

  /**
   * Clear the expression cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Safely invoke a setter function with comprehensive error handling and reporting.
   * @param setter - The setter function to invoke
   * @param inject - The inject variables to pass to the setter
   * @param value - The value to set
   * @param expression - The expression string (for error reporting)
   * @param elem - Optional DOM element (for error context)
   * @throws Error with detailed message if setter fails
   */
  static invokeSetter(
    setter: Function,
    inject: any,
    value: any,
    expression: string,
    elem?: HTMLElement
  ): void {
    try {
      setter(inject, value);
    } catch (ex: any) {
      const errorContext = elem 
        ? `Element: <${elem.tagName?.toLowerCase() || 'unknown'}${elem.id ? ' id="' + elem.id + '"' : ''}>`
        : 'Component property binding';
      
      throw new Error(
        `[bind] directive error: Cannot assign value to expression "${expression}"\n` +
        `${errorContext}\n` +
        `Error: ${ex.message}\n\n` +
        `The [bind] directive requires an assignable expression (e.g., "this.property" or "this.obj.prop").\n` +
        `Expressions with operators like "a + b", "this.x * 2", or function calls cannot be assigned to.\n` +
        `For computed/display-only values, use the [text] directive instead.`
      );
    }
  }
}
