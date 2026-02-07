import { isArray, isFunction, isObject, isBoolean } from "./helpers";
import { Objects } from "./Objects";

const ANY_KEY = Symbol("__KEY__");

type TransformFn<T> = (val: any) => T | null;

export const DataShape = {
  ANY_KEY: ANY_KEY,

  /** Returns a transform function for integers */
  integer: (def?: number | null): TransformFn<number> =>
    (val: any): number | null => {
      if (typeof def === 'undefined') def = null;
      if (typeof val === 'undefined') return def;
      const ret = parseInt(val);
      return isNaN(ret) ? def : ret;
    },

  /** Returns a transform function for floats */
  float: (def?: number | null): TransformFn<number> =>
    (val: any): number | null => {
      if (typeof def === 'undefined') def = null;
      if (typeof val === 'undefined') return def;
      const ret = parseFloat(val);
      return isNaN(ret) ? def : ret;
    },

  /** Returns a transform function for booleans */
  boolean: (def?: boolean | null): TransformFn<boolean> =>
    (val: any): boolean | null => {
      if (typeof def === 'undefined') def = null;
      if (typeof val === 'undefined') return def;
      if (isBoolean(val))
        return val;
      if (val === 'f' || val === 'false')
        return false;
      if (val === 't' || val === 'true')
        return true;
      const ret = Number(val);
      return isNaN(ret) ? def : ret !== 0;
    },

  /** Returns a transform function for strings */
  string: (def?: string | null): TransformFn<string> =>
    (val: any): string | null => {
      if (typeof def === 'undefined') def = null;
      if (typeof val === 'undefined') return def;
      return typeof val === 'undefined' || val === null ? def : val + '';
    },

  /** Returns a transform function for dates */
  date: (def?: Date | null): TransformFn<Date> =>
    (val: any): Date | null => {
      if (typeof def === 'undefined') def = null;
      if (typeof val === 'undefined') return def;
      return new Date(val);
    },

  /**
   * Copy object data using DataShape template
   * @param obj - object to create a copy of
   * @param templateObject - template object. shape of object that will be used for copying
   * @param checkSource - false - no error reporting (default); true - Throw errors; 1 - Throw warnings
   * @param path - internal path to property. passed within the function for proper error reporting
   */
  copy: function <T>(obj: any, templateObject?: T, checkSource?: boolean | 1, path?: string): T {
    path = path || "";
    checkSource = checkSource || false;

    let newObj: any;

    if (isArray(templateObject)) {
      // Special handling of array template
      newObj = [];
      // Simply apply the first element of the template array to each element in the object array!
      if (isArray(obj)) {
        Objects.forEach(obj, (objEl: any, i: string | number) => {
          newObj[i] = DataShape.copy(objEl, (templateObject as any[])[0], checkSource, path + '.' + i);
        });
        return newObj;
      } else {
        templateObject = [] as any;
      }
    } else if (isObject(templateObject)) {
      newObj = {};
      // If the template object contains ANY_KEY property, implement the template value to each key of the corresponding source object property
      if ((templateObject as any).hasOwnProperty(ANY_KEY) && obj !== null && obj !== undefined) {
        Object.keys(obj).forEach(function (key) {
          // Only assign dynamic key template if the template object does not yet have the same key present
          if (!(templateObject as any).hasOwnProperty(key)) {
            newObj[key] = DataShape.copy(obj[key], (templateObject as any)[ANY_KEY], checkSource, path + '.' + key);
          }
        });
      }
    } else if (isFunction(templateObject)) {
      return (templateObject as Function)(obj);
    } else {
      // If primitive, return as is
      if (typeof obj === 'undefined' && templateObject === null)
        return null as any;
      return obj;
    }

    // Copy object properties
    Objects.forEach(templateObject as any, (tEl: any, i: string | number) => {
      if (obj && typeof obj[i] === 'undefined' && checkSource === true) {
        throw new Error(`A Required Property ${i} of template${path} does not exist in source object${path}`);
      } else {
        let e;
        if (!isObject(obj)) {
          if (checkSource === 1) {
            console.warn(`A Required Property ${i} of template${path} does not exist in source object${path}`, new Error().stack);
          }
        } else {
          e = obj[i];
        }
        newObj[i] = DataShape.copy(e, tEl, checkSource, path + '.' + i);
      }
    });

    return newObj;
  },
};