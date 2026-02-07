import { isArray, isObject, isString } from "./helpers";

export type FilterCallback<T> = (elem: T, key: string | number) => boolean;
export type MapCallback<T, R> = (elem: T, key: string | number) => R;
export type FindCallback<T> = (elem: T, key: string | number) => boolean;
export type ForEachCallback<T> = (elem: T, key: string | number) => boolean | void;
export type WalkCallback = (obj: any, key: string | number) => boolean | void;
export type Walk2Callback = (obj1: any, obj2: any, key: string | number) => any;

export const Objects = {
  filter: function <T>(data: Record<string, T> | T[], callback: FilterCallback<T>): Record<string, T> | T[] | undefined {
    let ret: Record<string, T> | T[] | undefined;
    if (isObject(data) && !isArray(data)) {
      ret = {};
      for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        const elem = data[key];
        if (elem != null && callback(elem, key)) {
          ret[key] = elem;
        }
      }
    } else if (isArray(data)) {
      ret = [];
      for (let i = 0; i < data.length; i++) {
        const elem = data[i];
        if (elem != null && callback(elem, i)) {
          ret.push(elem);
        }
      }
    }
    return ret;
  },

  map: function <T, R>(data: Record<string, T> | T[], callback: MapCallback<T, R>): Record<string, R> | R[] | undefined {
    let ret: Record<string, R> | R[] | undefined;
    if (isObject(data) && !isArray(data)) {
      ret = {};
      for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        const elem = data[key];
        if (elem != null) {
          ret[key] = callback(elem, key);
        }
      }
    } else if (isArray(data)) {
      ret = [];
      for (let i = 0; i < data.length; i++) {
        const elem = data[i];
        if (elem != null) {
          ret.push(callback(elem, i));
        }
      }
    }
    return ret;
  },

  find: function <T>(data: Record<string, T> | T[], callback: FindCallback<T>): T | undefined {
    if (isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const elem = data[i];
        if (elem != null && callback(elem, i)) {
          return elem;
        }
      }
    } else {
      for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        const elem = data[key];
        if (elem != null && callback(elem, key)) {
          return elem;
        }
      }
    }
    return undefined;
  },

  /**
   * Cycle through objects in an array
   */
  forEach: function <T>(data: Record<string, T> | T[], callback: ForEachCallback<T>): void {
    if (isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        if (callback(data[i], i) === false)
          return;
      }
    } else {
      for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        if (callback(data[key], key) === false)
          return;
      }
    }
  },

  keyBy: function <T extends Record<string, any>>(
    array: T[],
    columnName: keyof T,
    columnNames?: string | string[]
  ): Record<string, T | any> {
    const ret: Record<string, T | any> = {};
    for (const k in array) {
      if (!array.hasOwnProperty(k)) continue;
      if (!columnNames)
        ret[array[k][columnName]] = array[k];
      else {
        if (isString(columnNames)) {
          ret[array[k][columnName]] = array[k][columnNames];
        } else if (isArray(columnNames)) {
          const r: Record<string, any> = {};
          Objects.forEach(columnNames, function (cn: string) {
            r[cn] = array[k][cn];
          });
          ret[array[k][columnName]] = r;
        }
      }
    }
    return ret;
  },

  /**
   * Set Object properties to null.
   */
  clear: function (obj: any): void {
    if (isObject(obj)) {
      Objects.forEach(obj, (el: any, i: string | number) => {
        if (!isObject(el))
          obj[i] = null;
        else
          Objects.clear(el);
      });
    } else {
      obj = null;
    }
  },

  /**
   * Overwrite object, preserving reference
   */
  overwrite: function <T>(obj: T, src: T): T {
    if (!isObject(obj)) {
      return src;
    }
    if (isObject(src)) {
      if (!isObject(obj)) {
        obj = src;
      } else {
        if (obj instanceof Date) {
          obj = src;
        } else {
          if (isArray(src) && isArray(obj)) {
            (obj as any[]).length = (src as any[]).length;
          } else {
            const keys: string[] = [];
            for (const i in src as any) {
              keys.push(i);
            }
            for (const i in obj as any) {
              if (keys.indexOf(i) < 0) {
                delete (obj as any)[i];
              }
            }
          }
          for (const i in src as any) {
            (obj as any)[i] = (src as any)[i];
          }
        }
      }
    } else {
      obj = src;
    }
    return obj;
  },

  /**
   * Copy object, breaking reference
   */
  copy: function <T>(src: T): T {
    if (!isObject(src)) {
      return src;
    }
    let obj: any;
    if (src instanceof Date)
      return new Date(src.getTime()) as any;
    else {
      if (isArray(src))
        obj = [];
      else
        obj = {};

      for (const i in src as any) {
        obj[i] = Objects.copy((src as any)[i]);
      }
    }
    return obj;
  },

  /**
   * Walk object calling callback on every node
   */
  walk: function (obj1: any, callback: WalkCallback): void {
    if (isObject(obj1)) {
      for (const i in obj1) {
        if (obj1.hasOwnProperty(i)) {
          if (callback(obj1, i) !== false && isObject(obj1[i])) {
            Objects.walk(obj1[i], callback);
          }
        }
      }
    }
  },

  /**
   * Walk 2 objects side by side
   */
  walk2: function (obj1: any, obj2: any, callback: Walk2Callback): void {
    if (isObject(obj1)) {
      for (const i in obj1) {
        if (obj1.hasOwnProperty(i)) {
          callback(obj1, obj2, i);
          if (isObject(obj1[i])) {
            Objects.walk2(obj1[i], isObject(obj2) ? obj2[i] : undefined, callback);
          }
        }
      }
    }
  },

  /**
   * Get object property using path
   */
  getPropertyByPath(obj: any, pathArray: string[] | string): any {
    if (pathArray === "" || pathArray === null || pathArray === undefined) {
      throw new Error(`Property path in object ${JSON.stringify(obj)} can not be empty!`);
    }
    let pathArr: string[];
    if (!Array.isArray(pathArray)) {
      const pathStr = ("" + pathArray).replace(/\]./g, '.').replace(/\]/g, '.').replace(/\[/g, '.');
      pathArr = pathStr.split('.');
      if (pathArr[pathArr.length - 1] === '') {
        pathArr.pop();
      }
    } else {
      pathArr = pathArray.slice();
    }

    if (pathArr.length > 1) {
      const cVal = obj[pathArr.shift()!];
      if (cVal == undefined) return cVal;
      return Objects.getPropertyByPath(cVal, pathArr);
    } else
      return obj[pathArr.shift()!];
  },

  /**
   * Set object property using path
   */
  setPropertyByPath(obj: any, pathArray: string[] | string, value: any): void {
    if (pathArray === "" || pathArray === null || pathArray === undefined) {
      throw new Error(`Property path in object ${JSON.stringify(obj)} can not be empty!`);
    }
    let pathArr: string[];
    if (!Array.isArray(pathArray)) {
      const pathStr = ("" + pathArray).replace(/\]./g, '.').replace(/\]/g, '.').replace(/\[/g, '.');
      pathArr = pathStr.split('.');
      if (pathArr[pathArr.length - 1] === '') {
        pathArr.pop();
      }
    } else {
      pathArr = pathArray.slice();
    }

    if (pathArr.length > 1) {
      const shft = pathArr.shift()!;
      if (!isObject(obj[shft])) {
        obj[shft] = {};
      }
      Objects.setPropertyByPath(obj[shft], pathArr, value);
    } else
      obj[pathArr.shift()!] = value;
  },

  /**
   * Delete object property using path
   */
  deletePropertyByPath(obj: any, pathArray: string[] | string): void {
    if (pathArray === "" || pathArray === null || pathArray === undefined) {
      throw new Error(`Property path in object ${JSON.stringify(obj)} can not be empty!`);
    }
    let pathArr: string[];
    if (!Array.isArray(pathArray)) {
      pathArr = ("" + pathArray).split('.');
    } else {
      pathArr = pathArray.slice();
    }

    if (pathArr.length > 1)
      Objects.deletePropertyByPath(obj[pathArr.shift()!], pathArr);
    else
      delete obj[pathArr.shift()!];
  },

  getMethods(object: any): string[] {
    let methods: string[] = [];
    let iObj = object;
    do {
      methods = methods.concat(Object.getOwnPropertyNames(iObj));
    } while ((iObj = Object.getPrototypeOf(iObj)) && iObj != Object.prototype);

    methods = Objects.filter(methods, (key: string) => typeof object[key] === 'function') as string[];

    return methods;
  },

  getProperties(object: any): string[] {
    const properties: string[] = [];
    Object.keys(object).forEach((key) => {
      properties.push(key);
    });
    return properties;
  },

  bindMethods(context: any): void {
    const methods = Objects.getMethods(context);
    methods.forEach((name: string) => {
      context[name] = context[name].bind(context);
    });
  },

  strip(object: any): void {
    Objects.getMethods(object).forEach((i: string) => {
      delete object[i];
    });
    Objects.getProperties(object).forEach((i: string) => {
      delete object[i];
    });
  }
};