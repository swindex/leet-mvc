import { ChangeWatcher } from "../core/ChangeWatcher";
export interface IBinder {
    updateElements(): void;
    destroy(): void;
    vdom: any;
    bindElements(eventCallbacks: any, template: any): any;
    setInjectVars(vars: any): any;
    setContext(context: any): any;
    context: any;
    injectVars: any;
    eventCallbacks: any;
}
export declare class BaseComponent extends ChangeWatcher {
    [key: string]: any;
    binder: IBinder | null;
    template: string | null;
    events: Record<string, (event: Event) => void> | null;
    /** fragment with children */
    templateFragment: DocumentFragment | null;
    /** update children */
    templateUpdate: () => void;
    /** reference to the parent page */
    parentPage: any;
    container: HTMLElement | null;
    attributes: Record<string, any>;
    components: BaseComponent[];
    constructor();
    /**
     * ***DO NOT OVERRIDE***
     * This function is called once after the container is bound to context
     */
    _onInit(container: HTMLElement): void;
    /** @override */
    returnContext(context: this): void;
    /**
     * ***Override***
     * This function is called once after the container is bound to context
     */
    onInit(container: HTMLElement): void;
    /**
     * Overrides ChangeWatcher.update method
     */
    update(): void;
    destroy(): void;
    /**
     * ***Override***
     */
    onDestroy(): void;
    /**
     * ***Override***
     * Called before UI is updated
     * Return false to cancel update
     */
    onBeforeUpdate(): void | boolean;
    /**
     * ***Override***
     */
    onUpdate(): void;
}
