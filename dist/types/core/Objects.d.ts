export type FilterCallback<T = any> = (elem: T, key: string | number) => boolean;
export type MapCallback<T = any, R = any> = (elem: T, key: string | number) => R;
export type FindCallback<T = any> = (elem: T, key: string | number) => boolean;
export type ForEachCallback<T = any> = (elem: T, key: string | number) => boolean | void;
export type WalkCallback = (obj: any, key: string | number) => boolean | void;
export type Walk2Callback = (obj1: any, obj2: any, key: string | number) => any;
export declare const Objects: {
    filter: <T = any>(data: any, callback: FilterCallback<T>) => Record<string, T> | T[];
    map: <T_1 = any, R = any>(data: any, callback: MapCallback<T_1, R>) => Record<string, R> | R[];
    find: <T_2 = any>(data: any, callback: FindCallback<T_2>) => T_2;
    /**
     * Cycle through objects in an array
     */
    forEach: <T_3 = any>(data: any, callback: ForEachCallback<T_3>) => void;
    keyBy: <T_4 extends Record<string, any>>(array: T_4[], columnName: keyof T_4, columnNames?: string | string[]) => Record<string, any>;
    /**
     * Set Object properties to null.
     */
    clear: (obj: any) => void;
    /**
     * Overwrite object, preserving reference
     */
    overwrite: <T_5>(obj: T_5, src: T_5) => T_5;
    /**
     * Copy object, breaking reference
     */
    copy: <T_6>(src: T_6) => T_6;
    /**
     * Walk object calling callback on every node
     */
    walk: (obj1: any, callback: WalkCallback) => void;
    /**
     * Walk 2 objects side by side
     */
    walk2: (obj1: any, obj2: any, callback: Walk2Callback) => void;
    /**
     * Get object property using path
     */
    getPropertyByPath(obj: any, pathArray: string[] | string): any;
    /**
     * Set object property using path
     */
    setPropertyByPath(obj: any, pathArray: string[] | string, value: any): void;
    /**
     * Delete object property using path
     */
    deletePropertyByPath(obj: any, pathArray: string[] | string): void;
    getMethods(object: any): string[];
    getProperties(object: any): string[];
    bindMethods(context: any): void;
    strip(object: any): void;
};
