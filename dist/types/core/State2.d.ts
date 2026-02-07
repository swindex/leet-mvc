export interface State2Listener<T, E = any> {
    index: number;
    destroy: () => void;
    remove: () => void;
    onSet: (callback: (data: T) => void) => State2Listener<T, E>;
    onError: (callback: (error: E) => void) => State2Listener<T, E>;
    onStatus: (callback: (isRunning: boolean) => void) => State2Listener<T, E>;
}
export interface State2Instance<T, E = any> {
    newListener: () => State2Listener<T, E>;
    error: E;
    isRunning: boolean;
    data: T;
    destroy: () => void;
    remove: (listener: State2Listener<T, E>) => boolean;
    setData: (data: T | undefined) => void;
    setError: (error: E) => void;
    setRunning: (newStatus: boolean) => void;
}
/**
 * This factory function allows to create shared state across multiple modules with listeners, getters and emitters
 */
export declare function State2<T, E = any>(data: T): State2Instance<T, E>;
