import { isArray, isDate, isObject } from "./helpers";

const isProxy = Symbol("isProxy");
const isWatched = Symbol("isWatched");

const propertyChangeCallbacks = Symbol("propertyChangeCallbacks");
const objectChangeCallbacks = Symbol("objectChangeCallbacks");

let updatesHalted = false;

export const isSkipUpdate = Symbol("isSkipUpdate");

export type PropertyChangeCallback = (target: any, property: string, value: any) => void;
export type ObjectChangeCallback = () => void;

interface WatchedObject {
  [isWatched]?: boolean;
  [isSkipUpdate]?: boolean;
  [propertyChangeCallbacks]?: PropertyChangeCallback[];
  [objectChangeCallbacks]?: ObjectChangeCallback[];
  [key: string]: any;
}

/**
 * The watch function creates proxy from any object and watches its changes. 
 * Triggers only when own properties change or properties of its simple properties
 */
export const Watcher = {
  noChange(callback: () => void): void {
    updatesHalted = true;
    callback();
    updatesHalted = false;
  },

  /**
   * Watch for object changes.
   * @param object - object to watch for changes
   * @param onPropertyChangeCallback - called for each changed property
   * @param onObjectChangeCallback - timeout 0 de-bounced callback. called on the next frame after all onPropertyChangeCallbacks are executed
   * @param ignoreProperties
   */
  on<T extends object>(
    object: T,
    onPropertyChangeCallback?: PropertyChangeCallback,
    onObjectChangeCallback?: ObjectChangeCallback,
    ignoreProperties?: string[]
  ): T {
    const watchedObj = object as WatchedObject;
    watchedObj[isWatched] = true;

    if (!watchedObj[propertyChangeCallbacks]) {
      watchedObj[propertyChangeCallbacks] = [];
    }
    if (onPropertyChangeCallback) {
      watchedObj[propertyChangeCallbacks]!.push(onPropertyChangeCallback);
    }

    if (onObjectChangeCallback) {
      if (!watchedObj[objectChangeCallbacks]) {
        watchedObj[objectChangeCallbacks] = [];
      }
      watchedObj[objectChangeCallbacks]!.push(onObjectChangeCallback);
    }

    function propertyChangeHandler(target: any, property: string, value: any): void {
      if (
        updatesHalted === true ||
        target[property] === value ||
        typeof property === "symbol" ||
        !watchedObj[isWatched]
      ) {
        return;
      }

      const isSkip = watchedObj[isSkipUpdate];
      watchedObj[isSkipUpdate] = true;

      watchedObj[propertyChangeCallbacks]?.forEach(function (callback) {
        try {
          callback(target, property, value);
        } catch (ex) {
          console.warn(ex);
        }
      });

      watchedObj[isSkipUpdate] = isSkip;

      if (target !== watchedObj && target[propertyChangeCallbacks] && target[isWatched]) {
        const isSkip2 = target[isSkipUpdate];
        target[isSkipUpdate] = true;
        target[propertyChangeCallbacks].forEach(function (callback: PropertyChangeCallback) {
          try {
            callback(target, property, value);
          } catch (ex) {
            console.warn(ex);
          }
        });
        target[isSkipUpdate] = isSkip2;
      }

      scheduleTargetCallback(target);
      scheduleCallback();
    }

    function scheduleCallback(): void {
      if (watchedObj[isSkipUpdate] || !watchedObj[isWatched]) {
        return;
      }

      watchedObj[isSkipUpdate] = true;

      setTimeout(function scheduledUpdate() {
        if (!watchedObj[isWatched]) {
          return;
        }

        watchedObj[isSkipUpdate] = true;
        watchedObj[objectChangeCallbacks]?.forEach(function (onUpdateCallback) {
          try {
            onUpdateCallback();
          } catch (ex) {
            console.warn(ex);
          }
        });
        watchedObj[isSkipUpdate] = false;
      }, 0);
    }

    function scheduleTargetCallback(target: WatchedObject): void {
      if (target === watchedObj) {
        return;
      }

      if (target[isSkipUpdate] || !target[isWatched] || !target[objectChangeCallbacks]) {
        return;
      }

      target[isSkipUpdate] = true;

      setTimeout(function scheduledUpdate() {
        if (!target[isWatched]) {
          return;
        }

        target[isSkipUpdate] = true;

        target[objectChangeCallbacks]?.forEach(function (onUpdateCallback) {
          try {
            onUpdateCallback();
          } catch (ex) {
            console.warn(ex);
          }
        });
        target[isSkipUpdate] = false;
      }, 0);
    }

    return getWatchedObject(watchedObj, propertyChangeHandler, ignoreProperties) as T;
  },

  off: function (object: WatchedObject, handler?: PropertyChangeCallback | ObjectChangeCallback): void {
    if (!handler) {
      delete object[isWatched];
      delete object[propertyChangeCallbacks];
      delete object[objectChangeCallbacks];
    } else {
      if (object[propertyChangeCallbacks]) {
        for (let i = object[propertyChangeCallbacks].length - 1; i >= 0; i--) {
          if (object[propertyChangeCallbacks][i] === handler) {
            object[propertyChangeCallbacks].splice(i, 1);
          }
        }
      }
      if (object[objectChangeCallbacks]) {
        for (let i = object[objectChangeCallbacks].length - 1; i >= 0; i--) {
          if (object[objectChangeCallbacks][i] === handler) {
            object[objectChangeCallbacks].splice(i, 1);
          }
        }
      }
    }
  }
};

function getWatchedObject<T extends object>(
  object: T,
  onPropertyChange: PropertyChangeCallback,
  ignoreProperties?: string[]
): T {
  ignoreProperties = ignoreProperties || [];

  if ((window as any)['Proxy'] && (window as any)['Reflect']) {
    const handler: ProxyHandler<any> = {
      get(target, property, receiver) {
        if (property === isProxy)
          return true;

        const value = Reflect.get(target, property, receiver);

        if (!isObject(value))
          return value;

        if (value && isObject(value) && (value as any)[isProxy])
          return value;

        const desc = Object.getOwnPropertyDescriptor(target, property);
        if (desc && !desc.writable && !desc.configurable) return value;

        if (!isArray(value) && isObject(value) && !isObjLiteral(value))
          return value;

        try {
          return new Proxy(target[property as string], handler);
        } catch (error) {
          return value;
        }
      },
      set(target, property, value) {
        if (ignoreProperties!.indexOf(property as string) < 0)
          onPropertyChange(target, property as string, value);

        // Attempt to set the property
        const result = Reflect.set(target, property, value);
        
        // If Reflect.set returns false (e.g., property is read-only), 
        // check if it's a getter-only property and handle gracefully
        /*if (!result) {
          const descriptor = Object.getOwnPropertyDescriptor(target, property) ||
                            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), property);
          
          // If it's a getter-only property (no setter), return true to prevent TypeError
          // This allows the code to continue even when trying to set read-only properties
          if (descriptor && descriptor.get && !descriptor.set) {
            return true;
          }
        }*/
        
        return result;
      },
      defineProperty(target, property, descriptor) {
        if (ignoreProperties!.indexOf(property as string) < 0)
          onPropertyChange(target, property as string, descriptor);
        return Reflect.defineProperty(target, property, descriptor);
      },
      deleteProperty(target, property) {
        if (ignoreProperties!.indexOf(property as string) < 0)
          onPropertyChange(target, property as string, undefined);
        return Reflect.deleteProperty(target, property);
      }
    };

    return new Proxy(object, handler);
  } else {
    onObjectDirtyChange(
      object,
      (target, property, value) => {
        onPropertyChange(target, property, value);
      },
      ignoreProperties
    );
    return object;
  }
}

function isObjLiteral(_obj: unknown): _obj is Record<string, any> {
  let _test = _obj;
  return (
    typeof _obj !== 'object' || _obj === null ?
      false :
      (
        (function () {
          while (true) {
            _test = Object.getPrototypeOf(_test);
            if (_test === null || Object.getPrototypeOf(_test) === null) {
              break;
            }
          }
          return Object.getPrototypeOf(_obj) === _test;
        })()
      )
  );
}

/**
 * Dirty-Listen to object changes
 * Callback is fired for every changed property
 */
export function onObjectDirtyChange(
  object: WatchedObject,
  onPropertyChangeCallback: PropertyChangeCallback,
  ignoreProperties?: string[]
): void {
  ignoreProperties = ignoreProperties || [];

  let refObject: any = {};
  const checkHash = function () {
    setTimeout(function () {
      const checked = objectCloneCompare(refObject, object, onPropertyChangeCallback, ignoreProperties!);

      if (object[isWatched]) {
        refObject = checked;
        window.requestAnimationFrame(checkHash);
      }
    }, 50);
  };
  window.requestAnimationFrame(checkHash);
}

/**
 * Compares old object and new object.
 * Does not clone classes or functions. they are compared by reference only.
 * Callback is fired for every changed property.
 * Returns the cloned copy of the new object for subsequent change checking
 */
export function objectCloneCompare(
  oldObj: any,
  newObj: any,
  onPropertyChangeCallback: PropertyChangeCallback,
  ignoreProperties: string[]
): any {
  ignoreProperties = ignoreProperties || [];
  const oldKeys = getObjKeys(oldObj);
  const newKeys = getObjKeys(newObj);
  const newChecked: (string | number)[] = [];
  const ret: any = isArray(newObj) ? [] : {};

  for (const i in oldKeys) {
    const k = oldKeys[i];
    if (newObj[k] !== undefined) {
      if (ignoreProperties.indexOf(k as string) < 0) {
        if (isDate(oldObj[k]) && isDate(newObj[k])) {
          if (oldObj[k].getTime() !== newObj[k].getTime()) {
            onPropertyChangeCallback(newObj, k as string, newObj[k]);
            oldObj[k] = new Date(newObj[k]);
          }
        } else if (isObject(oldObj[k]) && isObject(newObj[k])) {
          if (isArray(newObj[k]) || isObjLiteral(newObj[k])) {
            if ((oldObj[k] as any).length !== (newObj[k] as any).length) {
              onPropertyChangeCallback(newObj, k as string, newObj[k]);
            }
            ret[k] = objectCloneCompare(oldObj[k], newObj[k], onPropertyChangeCallback, ignoreProperties);
          } else {
            if (oldObj[k] !== newObj[k]) {
              onPropertyChangeCallback(newObj, k as string, newObj[k]);
            }
            ret[k] = newObj[k];
          }
        } else if (isObject(oldObj[k]) !== isObject(newObj[k])) {
          onPropertyChangeCallback(newObj, k as string, newObj[k]);
        } else {
          if (oldObj[k] !== newObj[k]) {
            onPropertyChangeCallback(newObj, k as string, newObj[k]);
          }
          ret[k] = newObj[k];
        }
      }
      if (ret[k] === undefined) {
        ret[k] = newObj[k];
      }
      newChecked.push(k);
    } else {
      if (oldObj[k] !== undefined) {
        onPropertyChangeCallback(newObj, k as string, undefined);
      } else {
        newChecked.push(k);
      }
    }
  }

  for (const i in newKeys) {
    const k = newKeys[i];
    if (newObj[k] === undefined || newChecked.indexOf(k) >= 0 || ignoreProperties.indexOf(k as string) >= 0) {
      continue;
    }

    onPropertyChangeCallback(newObj, k as string, newObj[k]);
    ret[k] = {};
    if (!isArray(newObj) && !isObjLiteral(newObj)) {
      ret[k] = newObj[k];
    } else {
      ret[k] = objectCloneCompare({}, (newObj as any)[k], onPropertyChangeCallback, ignoreProperties);
    }
  }

  if (!isObject(newObj)) {
    return newObj;
  }

  return ret;
}

function getObjKeys(obj: any): (string | number)[] {
  if (isObject(obj)) {
    if (isArray(obj)) {
      return Array.apply(null, Array(obj.length)).map(function (v: any, i: number) { return i; });
    } else {
      return Object.keys(obj);
    }
  }
  return [];
}