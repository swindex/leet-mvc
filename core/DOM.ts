import { isIterable, empty } from './helpers';

const identitySymbol = Symbol('identitySymbol');

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
  position(): { top: number; left: number };
  offset(): { top: number; left: number };
  innerHeight(): number;
  innerWidth(): number;
  offsetTop(): number;
  offsetLeft(): number;
  scrollTo(options: ScrollToOptions & { behavior?: 'auto' | 'smooth' }): void;
  scrollLeft(offset?: number, behavior?: 'auto' | 'smooth'): number | void;
  scrollTop(offset?: number, behavior?: 'auto' | 'smooth'): number | void;
  val(value?: string | number): string | undefined | void;
  show(): void;
  hide(): void;
  focus(): void;
}

interface ExtendedHTMLElement extends HTMLElement {
  __EVENTS__?: Record<string, Array<[EventListener, boolean | AddEventListenerOptions | undefined]>>;
  _DOM_oldStyle?: Record<string, string>;
}

type DOMQueryInput = Window | HTMLElement | DocumentFragment | Element | string | number | NodeList | HTMLCollection | Node[] | DOMInstance;

/**
 * jQuery replacement
 */
export function DOM(elemOrQuery: DOMQueryInput): DOMInstance {
  function getArray(children: any): any[] {
    if (isIterable(children) && !(children instanceof HTMLElement)) {
      return Array.prototype.slice.call(children);
    } else {
      return [children];
    }
  }

  function interpolateLine(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    steps: number,
    callback: (p: { x: number; y: number }) => void
  ): void {
    const N = steps;
    let step = 0;
    const animateToDest = () => {
      if (step < N) {
        step++;
        const t = step / N;
        window.requestAnimationFrame(animateToDest);
        const y = lerp(p1.y, p2.y, t);
        const x = lerp(p1.x, p2.x, t);
        callback({ x, y });
      }
    };
    animateToDest();
  }

  function lerp(start: number, end: number, t: number): number {
    return start + t * (end - start);
  }

  const pxRequiredKeys = ['top', 'left', 'height', 'width', 'right', 'bottom'];

  function remove(elem: ExtendedHTMLElement): void {
    if (elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }

  function removeAllEventListeners(elem: ExtendedHTMLElement): void {
    const handlers = elem.__EVENTS__;
    if (!handlers) {
      return;
    }
    for (const event in handlers) {
      removeEventListenerFromElem(elem, event);
    }
    delete elem.__EVENTS__;
  }

  function removeEventListenerFromElem(
    elem: ExtendedHTMLElement,
    events: string,
    removeHandler: EventListener | null = null
  ): void {
    const ar = events.split(' ');
    for (const j in ar) {
      if (!ar.hasOwnProperty(j)) continue;
      const event = ar[j];

      const eventHandlers = elem.__EVENTS__?.[event];
      if (!eventHandlers) {
        return;
      }

      for (const i in eventHandlers) {
        const handler = eventHandlers[i];
        if (removeHandler && handler[0] === removeHandler) {
          elem.removeEventListener(event.split(".")[0], handler[0], handler[1] as boolean);
        } else if (!removeHandler) {
          elem.removeEventListener(event.split(".")[0], handler[0], handler[1] as boolean);
        }
      }

      delete elem.__EVENTS__![event];
    }
  }

  function addPx(value: string | number, keyName?: string): string | number {
    if (isNaN(value as number))
      return value;
    if (keyName !== undefined) {
      if (pxRequiredKeys.indexOf(keyName) >= 0)
        return ("" + value + "").replace(/px/, "") + "px";
      else
        return value;
    }

    return ("" + value + "").replace(/px/, "") + "px";
  }

  const self: DOMInstance = {
    identity: identitySymbol,
    length: 0,

    each(callback) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          callback(elemArray[i], i);
      }
    },

    get(index) {
      return elemArray[index];
    },

    first() {
      return elemArray[0];
    },

    attr(key, value = undefined) {
      if (elemArray[0] === undefined) return null;
      if (value === undefined) {
        return elemArray[0].getAttribute(key);
      }
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) {
          if (value === null) {
            elemArray[i].removeAttribute(key);
          } else {
            elemArray[i].setAttribute(key, value);
          }
        }
      }
    },

    removeAttr(key) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].removeAttribute(key);
      }
    },

    css(styles?, value?) {
      if (elemArray[0] === undefined) return undefined as any;

      if (empty(styles)) {
        return getComputedStyle(elemArray[0] as Element);
      }
      if (typeof styles === "string") {
        if (value === undefined)
          return (getComputedStyle(elemArray[0] as Element) as any)[styles];

        (elemArray[0] as HTMLElement).style[styles as any] = addPx(value, styles) as string;
        return;
      }
      if (Array.isArray(styles)) {
        const ret: Record<string, string> = {};
        const elStyles = getComputedStyle(elemArray[0] as Element);
        for (const i in styles) {
          if (!styles.hasOwnProperty(i)) continue;
          const prop = styles[i];
          ret[prop] = (elStyles as any)[prop];
        }
        return ret;
      } else if (typeof styles === "object") {
        for (const j in elemArray) {
          if (!elemArray.hasOwnProperty(j)) continue;
          const elem = elemArray[j] as HTMLElement;

          for (const i in styles) {
            if (!styles.hasOwnProperty(i)) continue;
            const prop = (styles as Record<string, any>)[i];

            if (prop !== null)
              (elem.style as any)[i] = addPx(prop, i);
            else
              (elem.style as any)[i] = 'auto';
          }
        }
      }
    },

    addClass(className) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].classList.add(className);
      }
    },

    removeClass(className) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].classList.remove(className);
      }
    },

    toggleClass(className) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].classList.toggle(className);
      }
    },

    remove(onRemoveElement?) {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as ExtendedHTMLElement;

        remove(elem);

        if (typeof onRemoveElement === "function") {
          onRemoveElement(elem);
        }
      }
    },

    append(childOrChildren) {
      const chArray = getArray(childOrChildren);
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i];
        for (const k in chArray) {
          if (!chArray.hasOwnProperty(k)) continue;
          elem.appendChild(chArray[k]);
        }
      }
    },

    insertAfter(refChild) {
      if (refChild.nextElementSibling) {
        for (const i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          const elem = elemArray[i];
          refChild.parentElement!.insertBefore(elem, refChild.nextElementSibling);
        }
      } else {
        for (const i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          const elem = elemArray[i];
          refChild.parentElement!.appendChild(elem);
        }
      }
    },

    insertBefore(refChild) {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i];
        refChild.parentElement!.insertBefore(elem, refChild);
      }
    },

    replaceWith(newElement) {
      DOM(newElement).insertAfter(elemArray[0] as HTMLElement);
      DOM(elemArray).remove();
    },

    parent() {
      const ret: (Element | null)[] = [];
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i];
        ret.push(elem.parentElement);
      }
      return DOM(ret as any);
    },

    addEventListener(events, handler, capture?) {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as ExtendedHTMLElement;

        const ar = events.split(' ');
        for (const ii in ar) {
          if (!ar.hasOwnProperty(ii)) continue;
          const event = ar[ii];
          if (!elem.__EVENTS__) {
            elem.__EVENTS__ = {};
          }
          if (!(event in elem.__EVENTS__)) {
            elem.__EVENTS__[event] = [];
          }
          elem.__EVENTS__[event].push([handler as EventListener, capture]);
          elem.addEventListener(event.split(".")[0], handler, capture);
        }
      }
    },

    removeEventListener(events, removeHandler = undefined) {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as ExtendedHTMLElement;
        removeEventListenerFromElem(elem, events, removeHandler || null);
      }
    },

    removeAllEventListeners() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as ExtendedHTMLElement;
        removeAllEventListeners(elem);
      }
    },

    on(event, handler, capture?) {
      if (typeof handler === "string") {
        return self.onChild(event, handler, capture as (event: Event) => void);
      }
      return self.addEventListener(event, handler, capture);
    },

    off(event, handler?) {
      return self.removeEventListener(event, handler);
    },

    onChild(event, query, handler) {
      return self.addEventListener(event, (event) => {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const matches = target.matches || (target as any).msMatchesSelector;
          if (matches.call(target, query)) {
            handler(event);
          }
        }
      }, true);
    },

    repaint() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as HTMLElement;

        const old = elem.style.display;
        elem.style.display = 'none';
        elem.style.display = old;
      }
    },

    closest(query) {
      if (elemArray[0] === undefined) return DOM([]);
      const elements = [elemArray[0].closest(query)];
      return DOM(elements as any);
    },

    find(query) {
      if (elemArray[0] === undefined) return DOM([]);
      const elems = Array.from(elemArray[0].querySelectorAll(query));
      return DOM(elems as any);
    },

    width(value = undefined) {
      if (elemArray[0] === undefined) return 0;
      const elem = elemArray[0] as HTMLElement;
      if (value === undefined)
        return elem.offsetWidth;
      elem.style.width = addPx(value) as string;
    },

    height(value = undefined) {
      if (elemArray[0] === undefined) return 0;
      const elem = elemArray[0] as HTMLElement;

      if (value === undefined)
        return elem.offsetHeight;

      elem.style.height = addPx(value) as string;
    },

    position() {
      if (elemArray[0] === undefined) return { top: 0, left: 0 };
      const elem = elemArray[0] as HTMLElement;
      return {
        top: elem.offsetTop,
        left: elem.offsetLeft,
      };
    },

    offset() {
      let box = { top: 0, left: 0 };
      if (typeof (elemArray[0] as Element).getBoundingClientRect === "function") {
        box = (elemArray[0] as Element).getBoundingClientRect();
      }
      return {
        top: box.top + (window.scrollY || (window as any).pageYOffset),
        left: box.left + (window.scrollX || (window as any).pageXOffset)
      };
    },

    innerHeight() {
      if (elemArray[0] === undefined) return 0;
      return (elemArray[0] as Element).clientHeight;
    },

    innerWidth() {
      if (elemArray[0] === undefined) return 0;
      return (elemArray[0] as Element).clientWidth;
    },

    offsetTop() {
      if (elemArray[0] === undefined) return 0;
      let distance = 0;
      let elem: HTMLElement | null = elemArray[0] as HTMLElement;
      if (elem.offsetParent) {
        do {
          distance += elem.offsetTop;
          elem = elem.offsetParent as HTMLElement | null;
        } while (elem);
      }
      return distance < 0 ? 0 : distance;
    },

    offsetLeft() {
      if (elemArray[0] === undefined) return 0;
      let distance = 0;
      let elem: HTMLElement | null = elemArray[0] as HTMLElement;
      if (elem.offsetParent) {
        do {
          distance += elem.offsetLeft;
          elem = elem.offsetParent as HTMLElement | null;
        } while (elem);
      }
      return distance < 0 ? 0 : distance;
    },

    scrollTo(options) {
      if (elemArray[0] === undefined) return;

      const el = elemArray[0] as Element;

      if (typeof el.scrollTo === "function" && options.behavior !== "smooth") {
        el.scrollTo(options);
        return;
      }

      interpolateLine(
        {
          x: el.scrollLeft,
          y: el.scrollTop
        },
        {
          x: options.left !== undefined ? options.left : el.scrollLeft,
          y: options.top !== undefined ? options.top : el.scrollTop
        },
        options.behavior === "smooth" ? 25 : 1,
        (p) => {
          el.scrollTop = p.y;
          el.scrollLeft = p.x;
        }
      );
    },

    scrollLeft(offset?, behavior?) {
      if (elemArray[0] === undefined) return 0;
      if (offset === undefined) {
        return (elemArray[0] as Element).scrollLeft;
      } else {
        self.scrollTo({ left: offset, behavior: behavior });
      }
    },

    scrollTop(offset?, behavior?) {
      if (elemArray[0] === undefined) return 0;
      if (offset === undefined) {
        return (elemArray[0] as Element).scrollTop;
      } else {
        self.scrollTo({ top: offset, behavior: behavior });
      }
    },

    val(value?) {
      if (elemArray[0] === undefined) return undefined;
      if (value === undefined) {
        return (elemArray[0] as HTMLInputElement).value;
      } else {
        for (const i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          const elem = elemArray[i] as HTMLInputElement;
          elem.value = String(value);
        }
      }
    },

    show() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const el = elemArray[i] as ExtendedHTMLElement;

        if (!el._DOM_oldStyle)
          el._DOM_oldStyle = {};
        if (!el._DOM_oldStyle.display)
          el._DOM_oldStyle.display = DOM(el).css('display') as string;
        el.style.display = el._DOM_oldStyle.display;
      }
    },

    hide() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const el = elemArray[i] as ExtendedHTMLElement;

        if (!el._DOM_oldStyle)
          el._DOM_oldStyle = {};
        if (!el._DOM_oldStyle.display)
          el._DOM_oldStyle.display = DOM(el).css('display') as string;

        el.style.display = 'none';
      }
    },

    focus() {
      if (elemArray[0] === undefined) return;
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const el = elemArray[i] as HTMLElement;
        el.focus();
      }
    }
  };

  if (elemOrQuery == null) {
    throw new Error("elemOrQuery can not be empty!");
  }

  let elemArray: (HTMLElement | Element)[] = [];

  if (typeof elemOrQuery === "string" || typeof elemOrQuery === "number") {
    elemArray = Array.from(document.querySelectorAll(String(elemOrQuery)));
  } else if (typeof elemOrQuery === "object") {
    if ((elemOrQuery as DOMInstance).identity === identitySymbol) {
      return elemOrQuery as DOMInstance;
    }
    elemArray = getArray(elemOrQuery);
  } else {
    throw new Error("Not Implemented");
  }

  const instance = Object.create(self) as DOMInstance;
  instance.length = elemArray.length;

  return Object.assign(instance, elemArray);
}