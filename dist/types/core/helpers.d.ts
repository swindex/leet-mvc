/**
 * Check if object is empty
 */
export declare function empty(value: unknown): boolean;
/**
 * Round numeric value to n decimals
 */
export declare function round(value: number, n?: number): number;
/**
 * Convert string formatted as locale number to number
 */
export declare function numberFromLocaleString(stringValue: string | null, locale?: string): number | null;
/**
 * Try calling a function under context.
 * Same as Function.call but with check if callback exists
 */
export declare function tryCall<T = any>(context: any, callback: ((...args: any[]) => T) | undefined | null, ...args: any[]): T | undefined;
/**
 * Push function arguments into array starting from nStart
 */
export declare function argumentsToArray<T = any>(args: IArguments | any[], nStart?: number): T[];
/**
 * Override Function or a method
 */
export declare function Override<T extends (...args: any[]) => any>(originalContext: any, originalFunction: T, overrideFunction: (next: T, ...args: Parameters<T>) => ReturnType<T>): (...args: Parameters<T>) => ReturnType<T>;
/**
 * Extend Child Class With the Parent
 */
export declare function Extend<P extends new (...args: any[]) => any, C extends new (...args: any[]) => any>(parentConstructor: P, childConstructor: C): C;
export declare function GUID(): string;
export declare function isObjLiteral(_obj: unknown): _obj is Record<string, any>;
export declare function isIterable(obj: unknown): obj is Iterable<any>;
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isBoolean(value: unknown): value is boolean;
export declare function isObject(value: unknown): value is object;
export declare function isArray(value: unknown): value is any[];
export declare function isFunction(value: unknown): value is Function;
export declare function isDate(value: unknown): value is Date;
