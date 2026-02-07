/**
 * DeBouncer module
 */
export const DeBouncer = {
  /**
   * Run debounced function FIRST only ONCE per life of the debouncer
   */
  onceFirst: function <T extends (...args: any[]) => any>(func?: T): (...args: Parameters<T>) => void {
    let _executedOnce = false;
    return function (this: any, ...args: Parameters<T>): void {
      const context = this;
      if (!_executedOnce && (_executedOnce = true)) {
        if (typeof func !== 'function')
          (args[0] as Function).apply(context);
        else
          func.apply(context, args);
      }
    };
  },

  /**
   * Run debounced function LAST only ONCE per life of the debouncer
   */
  onceLast: function <T extends (...args: any[]) => any>(func?: T): (...args: Parameters<T>) => void {
    let _executedOnce = false;
    return function (this: any, ...args: Parameters<T>): void {
      const context = this;
      if (!_executedOnce && (_executedOnce = true)) {
        if (typeof func !== 'function')
          (args[0] as Function).apply(context);
        else
          func.apply(context, args);
      }
    };
  },

  /**
   * Run debounced function FIRST only ONCE per animation FRAME
   */
  frameFirst: function <T extends (...args: any[]) => any>(func?: T): (...args: Parameters<T>) => void {
    let firstQueue = 0;
    let firstQueueExecuted = false;
    return function (this: any, ...args: Parameters<T>): void {
      const context = this;
      if (!firstQueueExecuted && (firstQueueExecuted = true)) {
        if (typeof func !== 'function')
          (args[0] as Function).apply(context);
        else
          func.apply(context, args);
      }
      firstQueue++;
      setTimeout(function () {
        firstQueue--;
        if (firstQueue === 0) {
          firstQueueExecuted = false;
        }
      }, 0);
    };
  },

  /**
   * Run debounced function LAST only ONCE per animation FRAME
   */
  frameLast: function <T extends (...args: any[]) => any>(func?: T): (...args: Parameters<T>) => void {
    let lastQueue = 0;
    return function (this: any, ...args: Parameters<T>): void {
      lastQueue++;
      const context = this;
      setTimeout(function () {
        lastQueue--;
        if (lastQueue === 0) {
          if (typeof func !== 'function')
            (args[0] as Function).apply(context);
          else
            func.apply(context, args);
        }
      }, 0);
    };
  },

  /**
   * Run debounced function FIRST only ONCE per TIMEOUT
   */
  timeoutFirst: function <T extends (...args: any[]) => any>(timeoutMs: number, func?: T): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function (this: any, ...args: Parameters<T>): void {
      const context = this;

      if (timeout) {
        clearTimeout(timeout);
      } else {
        if (typeof func !== 'function')
          (args[0] as Function).apply(context);
        else
          func.apply(context, args);
      }
      timeout = setTimeout(function () {
        if (timeout) clearTimeout(timeout);
        timeout = null;
      }, timeoutMs);
    };
  },

  /**
   * Run debounced function LAST only ONCE per TIMEOUT
   */
  timeoutLast: function <T extends (...args: any[]) => any>(timeoutMs: number, func?: T): (...args: Parameters<T>) => void {
    return (function () {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      return function (this: any, ...args: Parameters<T>): void {
        const context = this;
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        timeout = setTimeout(function () {
          if (typeof func !== 'function')
            (args[0] as Function).apply(context);
          else
            func.apply(context, args);
        }, timeoutMs);
      };
    })();
  }
};