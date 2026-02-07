/**
 * Override Function or a method
 * @param originalContext - context to call the original function from
 * @param originalFunction - method or function to override
 * @param overrideFunction - callback to execute instead of the original function/method
 */
export function Override<T extends (...args: any[]) => any>(
  originalContext: any,
  originalFunction: T,
  overrideFunction: (next: (...args: any[]) => ReturnType<T>, ...args: Parameters<T>) => ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const argsWithNext: [(...args: any[]) => ReturnType<T>, ...Parameters<T>] = [
      (...nextArgs: any[]) => {
        return originalFunction.apply(originalContext, nextArgs.length > 0 ? nextArgs : args);
      },
      ...args
    ];
    return overrideFunction.apply(originalContext, argsWithNext);
  };
}