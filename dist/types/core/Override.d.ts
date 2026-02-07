/**
 * Override Function or a method
 * @param originalContext - context to call the original function from
 * @param originalFunction - method or function to override
 * @param overrideFunction - callback to execute instead of the original function/method
 */
export declare function Override<T extends (...args: any[]) => any>(originalContext: any, originalFunction: T, overrideFunction: (next: (...args: any[]) => ReturnType<T>, ...args: Parameters<T>) => ReturnType<T>): (...args: Parameters<T>) => ReturnType<T>;
