type Constructor<T = {}> = new (...args: any[]) => T;
type MixinFunction<T extends Constructor> = (superclass: T) => T;
/**
 * Instance to extend, that allows to inherit more than one class
 */
export declare const Mix: <T extends Constructor<{}>>(superclass: T) => MixinBuilder<T>;
declare class MixinBuilder<T extends Constructor> {
    private superclass;
    constructor(superclass: T);
    with<M extends MixinFunction<T>[]>(...mixins: M): T;
}
export {};
