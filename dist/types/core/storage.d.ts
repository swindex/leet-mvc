export declare const Storage: {
    set: <T>(key: string, value: T, callback?: () => void) => T;
    get: <T_1>(key: string, defaultValue?: T_1, callback?: (value: T_1) => void) => T_1;
    update: <T_2>(key: string, obj: T_2, callback?: () => void) => T_2;
    delete: (key: string, callback?: () => void) => void;
    clear: (callback?: () => void) => void;
};
