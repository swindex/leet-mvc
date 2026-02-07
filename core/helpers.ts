/**
 * Check if object is empty
 */
export function empty(value: unknown): boolean {
  return typeof value === "undefined" || value === 0 || value === null || value === "" || value === false;
}

/**
 * Round numeric value to n decimals
 */
export function round(value: number, n: number = 0): number {
  const scale = Math.pow(10, n);
  return Math.round(value * scale) / scale;
}

/**
 * Convert string formatted as locale number to number
 */
export function numberFromLocaleString(stringValue: string | null, locale?: string): number | null {
  const parts = Number(1111.11).toLocaleString(locale).replace(/\d+/g, '').split('');
  if (stringValue === null)
    return null;
  if (parts.length == 1) {
    parts.unshift('');
  }
  return Number(String(stringValue).replace(new RegExp(parts[0].replace(/\s/g, ' '), 'g'), '').replace(parts[1], "."));
}

/**
 * Try calling a function under context.
 * Same as Function.call but with check if callback exists
 */
export function tryCall<T = any>(context: any, callback: ((...args: any[]) => T) | undefined | null, ...args: any[]): T | undefined {
  if (typeof callback !== 'function')
    return;
  return callback.apply(context, args);
}

/**
 * Push function arguments into array starting from nStart
 */
export function argumentsToArray<T = any>(args: IArguments | any[], nStart: number = 0): T[] {
  return Array.prototype.slice.call(args).slice(nStart);
}

/**
 * Override Function or a method
 */
export function Override<T extends (...args: any[]) => any>(
  originalContext: any,
  originalFunction: T,
  overrideFunction: (next: T, ...args: Parameters<T>) => ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const argsWithNext: [T, ...Parameters<T>] = [
      ((...nextArgs: any[]) => {
        return originalFunction.apply(originalContext, nextArgs.length > 0 ? nextArgs : args);
      }) as T,
      ...args
    ];
    return overrideFunction.apply(originalContext, argsWithNext);
  };
}

/**
 * Extend Child Class With the Parent
 */
export function Extend<P extends new (...args: any[]) => any, C extends new (...args: any[]) => any>(
  parentConstructor: P,
  childConstructor: C
): C {
  childConstructor.prototype = Object.create(parentConstructor.prototype);
  childConstructor.prototype.constructor = childConstructor;
  childConstructor.prototype.super = function (...args: any[]) {
    return (parentConstructor as any).apply(this, args);
  };
  return childConstructor;
}

export function GUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function isObjLiteral(_obj: unknown): _obj is Record<string, any> {
  let _test = _obj;
  return (typeof _obj !== 'object' || _obj === null ?
    false :
    (
      (function () {
        while (true) {
          if (Object.getPrototypeOf(_test = Object.getPrototypeOf(_test)) === null) {
            break;
          }
        }
        return Object.getPrototypeOf(_obj) === _test;
      })()
    )
  );
}

export function isIterable(obj: unknown): obj is Iterable<any> {
  if (obj == null) {
    return false;
  }
  return typeof (obj as any)[Symbol.iterator] === 'function';
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}