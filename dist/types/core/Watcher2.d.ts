declare const isWatched: unique symbol;
declare const propertyChangeCallbacks: unique symbol;
declare const objectChangeCallbacks: unique symbol;
export declare const isSkipUpdate: unique symbol;
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
export declare const Watcher2: {
    skip: symbol;
    watched: symbol;
    /**
     * Watch for object changes.
     * @param object - object to watch for changes
     * @param onPropertyChangeCallback - called for each changed property
     * @param onObjectChangeCallback - timeout 0 de-bounced callback. called on the next frame after all onPropertyChangeCallbacks are executed
     * @param ignoreProperties
     */
    on<T extends object>(object: T & WatchedObject, onPropertyChangeCallback?: PropertyChangeCallback, onObjectChangeCallback?: ObjectChangeCallback, ignoreProperties?: string[]): T;
    off: (object: WatchedObject, handler?: PropertyChangeCallback) => void;
};
/**
 * Dirty-Listen to object changes
 * Callback is fired for every changed property
 */
export declare function onObjectDirtyChange(object: WatchedObject, onPropertyChangeCallback: PropertyChangeCallback, ignoreProperties?: string[]): void;
/**
 * Compares old object and new object.
 * Does not clone classes or functions. they are compared by reference only.
 * Callback is fired for every changed property.
 * Returns the cloned copy of the new object for subsequent change checking
 */
export declare function objectCloneCompare(oldObj: any, newObj: any, onPropertyChangeCallback: PropertyChangeCallback, ignoreProperties: string[]): any;
export {};
