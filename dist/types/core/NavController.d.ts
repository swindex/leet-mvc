import { BasePage } from "../pages/BasePage";
export interface PageFrame {
    name: string;
    element: HTMLElement;
    page: any;
}
export interface WindowSize {
    width: number | null;
    height: number | null;
}
export declare class NavController {
    stack: PageFrame[];
    windowSize: WindowSize;
    isLoadingRoot: boolean;
    backTimeout: number;
    backTimeoutRunning: boolean;
    transitionTime: number;
    pageContainer: HTMLElement;
    constructor();
    windowResizeHandler(ev: Event): void;
    documentBackButtonHandler(): void;
    /**
     * Set the container element for pages
     */
    setContainer(container: HTMLElement, listenTobBackButton?: boolean): void;
    /**
     * Remove all pages and load passed page Constructor as Root
     */
    setRoot<T extends BasePage>(pageConstructor: new (...args: any[]) => T | Promise<new (...args: any[]) => T>, ...parameters: any[]): T | Promise<T>;
    /**
     * Remove All Pages
     */
    removeAll(): void;
    /**
     * Push a page on top of stack.
     */
    push<T extends BasePage>(pageConstructor: new (...args: any[]) => T | Promise<new (...args: any[]) => T>, ...parameters: any[]): T | Promise<T>;
    /**
     * Push a page on top of stack INTO a specified element
     */
    pushInto<T extends BasePage>(container: HTMLElement, pageConstructor: new (...args: any[]) => T | Promise<new (...args: any[]) => T>, ...parameters: any[]): T | Promise<T>;
    /**
     * Navigate Back
     * Returns true if success, null if last page and can not go back
     */
    back(): boolean | null;
    /**
     * Remove page from stack
     */
    remove(pageObject: any): void;
    /**
     * Get a list of displayed pages
     */
    getPageNames(): string[];
    /**
     * Get Pages Stack
     */
    getPages(): PageFrame[];
    /**
     * Create page
     */
    _createPage(container: HTMLElement, pageConstructor: any, args: any[]): any;
    getMaxStackZIndex(): number;
    checkPageOnBeforeDestroy(frame: PageFrame): any;
    removeFrame(frame: PageFrame): boolean;
    removeLastFrame(): boolean | null;
    /**
     * Return current page frame
     */
    currentFrame(): PageFrame | null;
    removeAllFrames(): void;
    /**
     * Set Page instance UI state value
     */
    setPageState(page: any, state: 'isDeleting' | 'isCreating' | 'isHiding' | 'isShowing' | 'isVisible' | 'isHidden'): void;
    /**
     * Recalculate pages' visibility
     */
    _resetPagesVisibility(): void;
    /**
     * Show particular page DOM element
     */
    showPageElement(frame: PageFrame, inactive?: boolean): void;
    /**
     * Hide particular page DOM element
     */
    hidePageElement(frame: PageFrame, isDeleting?: boolean): void;
    /**
     * Delete Event handlers that were created by the Nav instance
     */
    destroy(): void;
    /**
     * ***Override***
     * Callback fired when Back button is clicked on LAST page of the app
     */
    onRootPageBackPressed(name: string): void;
    /**
     * ***Override***
     * Callback fired on page forward
     */
    onPageNavigateTo(name: string, pageObject: any, args: any[]): void;
    /**
     * Callback fired when root page is removed
     */
    onRootPageRemoved(pageObject: any): void;
    /**
     * ***Override***
     * Callback fired when page is created
     */
    onPageCreated(page: any): void;
    /**
     * Callback fired when page is navigated "back" to
     */
    onPageNavigateBack(name: string, pageObject: any): void;
    /**
     * Callback fired when page is destroyed
     */
    onDestroyPage(name: string, pageObject: any, frameIndex: number): void;
}
