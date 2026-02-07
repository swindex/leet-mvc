type TransformFn<T> = (val: any) => T | null;
export declare const DataShape: {
    ANY_KEY: symbol;
    /** Returns a transform function for integers */
    integer: (def?: number | null) => TransformFn<number>;
    /** Returns a transform function for floats */
    float: (def?: number | null) => TransformFn<number>;
    /** Returns a transform function for booleans */
    boolean: (def?: boolean | null) => TransformFn<boolean>;
    /** Returns a transform function for strings */
    string: (def?: string | null) => TransformFn<string>;
    /** Returns a transform function for dates */
    date: (def?: Date | null) => TransformFn<Date>;
    /**
     * Copy object data using DataShape template
     * @param obj - object to create a copy of
     * @param templateObject - template object. shape of object that will be used for copying
     * @param checkSource - false - no error reporting (default); true - Throw errors; 1 - Throw warnings
     * @param path - internal path to property. passed within the function for proper error reporting
     */
    copy: <T>(obj: any, templateObject?: T, checkSource?: boolean | 1, path?: string) => T;
};
export {};
