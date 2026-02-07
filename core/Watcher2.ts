import { isObject, isArray, isDate, isObjLiteral } from "./helpers";

function isSymbol(val: any): val is symbol {
  return typeof val === 'symbol';
}

const isProxy = Symbol("isProxy");
const isWatched = Symbol("isWatched");

const propertyChangeCallbacks = Symbol("propertyChangeCallbacks");
const objectChangeCallbacks = Symbol("objectChangeCallbacks");

export const isSkipUpdate = Symbol("isSkipUpdate");

type PropertyChangeCallback = (target: any, property: any, value: any) => void;
type ObjectChangeCallback = () => void;

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
export const Watcher2 = {
  skip: isSkipUpdate,
  watched: isWatched,

  /**
   * Watch for object changes.
   * @param object - object to watch for changes
   * @param onPropertyChangeCallback - called for each changed property
   * @param onObjectChangeCallback - timeout 0 de-bounced callback. called on the next frame after all onPropertyChangeCallbacks are executed
   * @param ignoreProperties
   */
  on<T extends object>(
    object: T & WatchedObject,
    onPropertyChangeCallback?: PropertyChangeCallback,
    onObjectChangeCallback?: ObjectChangeCallback,
    ignoreProperties?: string[]
  ): T {
    if (!object[propertyChangeCallbacks]) {
      object[propertyChangeCallbacks] = [];
    }

    if (onPropertyChangeCallback) {
      object[propertyChangeCallbacks]!.push(onPropertyChangeCallback);
    }

    if (onObjectChangeCallback) {
      if (!object[objectChangeCallbacks]) {
        object[objectChangeCallbacks] = [];
      }
      object[objectChangeCallbacks]!.push(onObjectChangeCallback);
    }

    function propertyChangeHandler(target: WatchedObject, property: string | symbol, value: any): void {
      if (
        target[property as string] === value ||
        isSymbol(property) ||
        !object[isWatched]
      ) {
        return;
      }

      const isSkip = object[isSkipUpdate];
      // Skip any subsequent updates triggered by all onChange Callbacks
      object[isSkipUpdate] = true;

      object[propertyChangeCallbacks]?.forEach(function (callback) {
        try {
          callback(target, property, value);
        } catch (ex) {
          console.warn(ex);
        }
      });

      object[isSkipUpdate] = isSkip;

      if (target !== object && target[propertyChangeCallbacks] && target[isWatched]) {
        const isSkip2 = target[isSkipUpdate];
        target[isSkipUpdate] = true;
        target[propertyChangeCallbacks]?.forEach(function (callback) {
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
      if (object[isSkipUpdate] || !object[isWatched]) {
        return;
      }

      object[isSkipUpdate] = true;

      setTimeout(function scheduledUpdate() {
        if (!object[isWatched]) {
          return;
        }

        // Prevent changes in object from calling other updates while onUpdateCallback is executing
        object[isSkipUpdate] = true;
        object[objectChangeCallbacks]?.forEach(function (onUpdateCallback) {
          try {
            onUpdateCallback();
          } catch (ex) {
            console.warn(ex);
          }
        });
        object[isSkipUpdate] = false;
      }, 0);
    }

    function scheduleTargetCallback(target: WatchedObject): void {
      if (target === object) {
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

        // Prevent changes in object from calling other updates while onUpdateCallback is executing
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

    object[isWatched] = true;
    return getWatchedObject(object, propertyChangeHandler, ignoreProperties);
  },

  off: function (object: WatchedObject, handler?: PropertyChangeCallback): void {
    if (!handler) {
      delete object[isWatched];
      delete object[propertyChangeCallbacks];
      delete object[objectChangeCallbacks];
    } else {
      const propCallbacks = object[propertyChangeCallbacks];
      if (propCallbacks) {
        for (let i = propCallbacks.length - 1; i >= 0; i--) {
          if (propCallbacks[i] === handler) {
            propCallbacks.splice(i, 1);
          }
        }
      }
    }
  }
};

function getWatchedObject<T extends object>(
  object: T & WatchedObject,
  onPropertyChange: PropertyChangeCallback,
  ignoreProperties?: string[]
): T {
  ignoreProperties = ignoreProperties || [];

  if (window['Proxy'] && window['Reflect']) {
    const handler: ProxyHandler<any> = {
      get(target, property, receiver) {
        if (property === isProxy) return true;

        const value = Reflect.get(target, property, receiver);

        // Return as-is if its a primitive
        if (!isObject(value)) return value;
        if (value && isObject(value) && value[isProxy]) return value;

        // Return non-modifiable objects as-is
        const desc = Object.getOwnPropertyDescriptor(target, property);
        if (desc && !desc.writable && !desc.configurable) return value;

        // Return objects, instantiated with `new` as-is
        if (!isArray(value) && isObject(value) && !isObjLiteral(value)) return value;

        try {
          return new Proxy(target[property], handler);
        } catch (error) {
          return value;
        }
      },
      set(target, property, value) {
        if (typeof property === 'string' && ignoreProperties!.indexOf(property) < 0) {
          onPropertyChange(target, property, value);
        }
        return Reflect.set(target, property, value);
      },
      defineProperty(target, property, descriptor) {
        if (typeof property === 'string' && ignoreProperties!.indexOf(property) < 0) {
          onPropertyChange(target, property, descriptor);
        }
        return Reflect.defineProperty(target, property, descriptor);
      },
      deleteProperty(target, property) {
        if (typeof property === 'string' && ignoreProperties!.indexOf(property) < 0) {
          onPropertyChange(target, property, undefined);
        }
        return Reflect.deleteProperty(target, property);
      }
    };

    return new Proxy(object, handler) as T;
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

  let refObject: any = {}; // Reference copy of the object we are watching

  const checkHash = function (): void {
    // Throttle the request animation to 50ms
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
  const ret: Record<string | number, any> = isArray(newObj) ? [] : {};

  for (const i in oldKeys) {
    const k = oldKeys[i];
    if (newObj[k] !== undefined) {
      // New object has the old key
      if (ignoreProperties.indexOf(String(k)) < 0) {
        // If key is not in the ignore array
        if (isDate(oldObj[k]) && isDate(newObj[k])) {
          if (oldObj[k].getTime() !== newObj[k].getTime()) {
            onPropertyChangeCallback(newObj, k, newObj[k]);
            oldObj[k] = new Date(newObj[k]);
          }
        } else if (isObject(oldObj[k]) && isObject(newObj[k])) {
          if (isArray(newObj[k]) || isObjLiteral(newObj[k])) {
            if (oldObj[k].length !== newObj[k].length) {
              onPropertyChangeCallback(newObj, k, newObj[k]);
            }
            ret[k] = objectCloneCompare(oldObj[k], newObj[k], onPropertyChangeCallback, ignoreProperties);
          } else {
            // New object is not an array and is a complex object
            if (oldObj[k] !== newObj[k]) {
              // Check them by reference
              onPropertyChangeCallback(newObj, k, newObj[k]);
            }
            // Do not scan complex children
            ret[k] = newObj[k];
          }
        } else if (isObject(oldObj[k]) !== isObject(newObj[k])) {
          // Old isObject is not the same as new isObject
          onPropertyChangeCallback(newObj, k, newObj[k]);
        } else {
          // In the end compare values the normal way
          if (oldObj[k] !== newObj[k]) {
            onPropertyChangeCallback(newObj, k, newObj[k]);
          }
          ret[k] = newObj[k];
        }
      }
      if (ret[k] === undefined) {
        ret[k] = newObj[k];
      }
      // Delete newKey
      newChecked.push(k);
    } else {
      // Key does not exist in the new object
      if (oldObj[k] !== undefined) {
        onPropertyChangeCallback(newObj, k, undefined);
      } else {
        // Both old and new objects properties are undefined
        newChecked.push(k);
      }
    }
  }

  // Iterate over keys that are NOT in the old object
  for (const i in newKeys) {
    const k = newKeys[i];
    if (newObj[k] === undefined || newChecked.indexOf(k) >= 0 || ignoreProperties.indexOf(String(k)) >= 0) {
      continue;
    }

    onPropertyChangeCallback(newObj, k, newObj[k]);
    ret[k] = {};
    if (!isArray(newObj) && !isObjLiteral(newObj)) {
      ret[k] = newObj[k];
    } else {
      ret[k] = objectCloneCompare({}, newObj[k], onPropertyChangeCallback, ignoreProperties);
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
      return Array.apply(null, Array(obj.length)).map(function (_v: any, i: number) {
        return i;
      });
    } else {
      return Object.keys(obj);
    }
  }
  return [];
}