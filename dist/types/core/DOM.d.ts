export interface DOMInstance {
    identity: symbol;
    length: number;
    [index: number]: HTMLElement | Element;
    each(callback: (elem: HTMLElement | Element, index: string | number) => void): void;
    get(index: number): HTMLElement | Element | undefined;
    first(): HTMLElement | Element | undefined;
    attr(key: string, value?: string | null): string | null | void;
    removeAttr(key: string): void;
    css(styles?: string | string[] | Record<string, string | number | null>, value?: string | number): CSSStyleDeclaration | string | Record<string, string> | void;
    addClass(className: string): void;
    removeClass(className: string): void;
    toggleClass(className: string): void;
    remove(onRemoveElement?: (elem: HTMLElement | Element) => void): void;
    append(childOrChildren: Node | Node[] | NodeList | HTMLCollection): void;
    insertAfter(refChild: HTMLElement): void;
    insertBefore(refChild: HTMLElement): void;
    replaceWith(newElement: HTMLElement): void;
    parent(): DOMInstance;
    addEventListener(events: string, handler: (event: Event) => void, capture?: boolean | AddEventListenerOptions): void;
    removeEventListener(events: string, removeHandler?: (event: Event) => void): void;
    removeAllEventListeners(): void;
    on(event: string, handler: string | ((event: Event) => void), capture?: boolean | AddEventListenerOptions): void;
    off(event: string, handler?: (event: Event) => void): void;
    onChild(event: string, query: string, handler: (event: Event) => void): void;
    repaint(): void;
    closest(query: string): DOMInstance;
    find(query: string): DOMInstance;
    width(value?: number | string): number | void;
    height(value?: number | string): number | void;
    position(): {
        top: number;
        left: number;
    };
    offset(): {
        top: number;
        left: number;
    };
    innerHeight(): number;
    innerWidth(): number;
    offsetTop(): number;
    offsetLeft(): number;
    scrollTo(options: ScrollToOptions & {
        behavior?: 'auto' | 'smooth';
    }): void;
    scrollLeft(offset?: number, behavior?: 'auto' | 'smooth'): number | void;
    scrollTop(offset?: number, behavior?: 'auto' | 'smooth'): number | void;
    val(value?: string | number): string | undefined | void;
    show(): void;
    hide(): void;
    focus(): void;
}
type DOMQueryInput = Window | Document | HTMLElement | DocumentFragment | Element | string | number | NodeList | HTMLCollection | Node[] | DOMInstance;
/**
 * jQuery replacement
 */
export declare function DOM(elemOrQuery: DOMQueryInput): DOMInstance;
export {};
