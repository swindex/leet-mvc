export interface StateListener {
    index: number;
    remove: () => void;
}
export interface StateInstance<T> {
    readonly isRunning: boolean;
    get: () => T;
    data: T;
    onChange: (dataChanged?: (data: T) => void, statusChanged?: (isRunning: boolean) => void) => StateListener;
    onSet: (dataChanged?: (data: T) => void, statusChanged?: (isRunning: boolean) => void) => StateListener;
    remove: (listener: StateListener) => boolean;
    set: (data: T | undefined) => void;
}
/**
 * This factory function allows to create shared state across multiple modules with listeners, getters and emitters
 */
export declare function State<T>(data: T): StateInstance<T>;
