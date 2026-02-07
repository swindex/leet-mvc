export const Storage = {
  set: function <T>(key: string, value: T, callback?: () => void): T {
    const str = JSON.stringify(value);
    window.localStorage.setItem(key, str);
    if (typeof callback === 'function')
      callback();
    return value;
  },

  get: function <T>(key: string, defaultValue?: T, callback?: (value: T) => void): T {
    const defVal = (typeof defaultValue === 'undefined' ? null : defaultValue) as T;

    const str = window.localStorage.getItem(key);
    let value: T = defVal;
    if (str !== null) {
      try {
        value = JSON.parse(str);
      } catch (err) {
        setTimeout(() => {
          throw err;
        });
      }
    }
    if (typeof callback === 'function')
      callback(value);
    return value;
  },

  update: function <T>(key: string, obj: T, callback?: () => void): T {
    let oldData: any = null;
    if (typeof obj === 'object') {
      oldData = this.get(key, {} as any);
      for (const k in obj as any) {
        if (!(obj as any).hasOwnProperty(k)) continue;
        oldData[k] = (obj as any)[k];
      }
    } else {
      oldData = obj;
    }
    this.set(key, oldData, callback);
    return oldData;
  },

  delete: function (key: string, callback?: () => void): void {
    window.localStorage.removeItem(key);
    if (typeof callback === 'function')
      callback();
  },

  clear: function (callback?: () => void): void {
    window.localStorage.clear();
    if (typeof callback === 'function')
      callback();
  },
};