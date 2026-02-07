import { isSkipUpdate, PropertyChangeCallback, ObjectChangeCallback } from './Watcher';
declare const propChangeHandler: unique symbol;
declare const objectChangeHandler: unique symbol;
export declare class ChangeWatcher {
    [isSkipUpdate]: boolean;
    [propChangeHandler]: PropertyChangeCallback;
    [objectChangeHandler]: ObjectChangeCallback;
    constructor();
    startWatch(): void;
    stopWatch(): void;
    /**
     * Called when the binder can finally be updated
     * Children must override this method
     */
    update(): void;
}
export {};
