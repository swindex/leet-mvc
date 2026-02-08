import { isIterable, empty } from './helpers';

const identitySymbol = Symbol('identitySymbol');

interface ExtendedHTMLElement extends HTMLElement {
  __EVENTS__?: Record<string, Array<[EventListener, boolean | AddEventListenerOptions | undefined]>>;
  _DOM_oldStyle?: Record<string, string>;
}

type DOMQueryInput = Window | Document | HTMLElement | DocumentFragment | Element | string | number | NodeList | HTMLCollection | Node[] | { identity: symbol };

/**
 * jQuery replacement
 */
export function DOM(elemOrQuery: DOMQueryInput) {
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
        callback({ x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) });
      }
    };
    animateToDest();
  }

  function lerp(start: number, end: number, t: number): number {
    return start + t * (end - start);
  }

  const pxRequiredKeys = ['top', 'left', 'height', 'width', 'right', 'bottom'];

  function removeElem(elem: ExtendedHTMLElement): void {
    if (elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }

  function removeAllEvListeners(elem: ExtendedHTMLElement): void {
    const handlers = elem.__EVENTS__;
    if (!handlers) return;
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
      if (!eventHandlers) return;
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
    if (isNaN(value as number)) return value;
    if (keyName !== undefined) {
      if (pxRequiredKeys.indexOf(keyName) >= 0)
        return ("" + value + "").replace(/px/, "") + "px";
      else
        return value;
    }
    return ("" + value + "").replace(/px/, "") + "px";
  }

  if (elemOrQuery == null) {
    throw new Error("elemOrQuery can not be empty!");
  }

  let elemArray: (HTMLElement | Element)[] = [];

  if (typeof elemOrQuery === "string" || typeof elemOrQuery === "number") {
    elemArray = Array.from(document.querySelectorAll(String(elemOrQuery)));
  } else if (typeof elemOrQuery === "object") {
    if ((elemOrQuery as any).identity === identitySymbol) {
      return elemOrQuery as any;
    }
    elemArray = getArray(elemOrQuery);
  } else {
    throw new Error("Not Implemented");
  }

  function addEventListenerAll(events: string, handler: (event: Event) => void, capture?: boolean | AddEventListenerOptions) {
    for (const i in elemArray) {
      if (!elemArray.hasOwnProperty(i)) continue;
      const elem = elemArray[i] as ExtendedHTMLElement;
      const ar = events.split(' ');
      for (const ii in ar) {
        if (!ar.hasOwnProperty(ii)) continue;
        const event = ar[ii];
        if (!elem.__EVENTS__) elem.__EVENTS__ = {};
        if (!(event in elem.__EVENTS__)) elem.__EVENTS__[event] = [];
        elem.__EVENTS__[event].push([handler as EventListener, capture]);
        elem.addEventListener(event.split(".")[0], handler, capture);
      }
    }
  }

  function removeEventListenerAll(events: string, removeHandler?: (event: Event) => void) {
    for (const i in elemArray) {
      if (!elemArray.hasOwnProperty(i)) continue;
      const elem = elemArray[i] as ExtendedHTMLElement;
      removeEventListenerFromElem(elem, events, removeHandler || null);
    }
  }

  function onChildHandler(event: string, query: string, handler: (event: Event) => void) {
    return addEventListenerAll(event, (ev: Event) => {
      const target = ev.target;
      if (target instanceof HTMLElement) {
        const matches = target.matches || (target as any).msMatchesSelector;
        if (matches.call(target, query)) handler(ev);
      }
    }, true);
  }

  function scrollToImpl(options: ScrollToOptions & { behavior?: 'auto' | 'smooth' }) {
    if (elemArray[0] === undefined) return;
    const el = elemArray[0] as Element;
    if (typeof el.scrollTo === "function" && options.behavior !== "smooth") {
      el.scrollTo(options);
      return;
    }
    interpolateLine(
      { x: el.scrollLeft, y: el.scrollTop },
      {
        x: options.left !== undefined ? options.left : el.scrollLeft,
        y: options.top !== undefined ? options.top : el.scrollTop
      },
      options.behavior === "smooth" ? 25 : 1,
      (p) => { el.scrollTop = p.y; el.scrollLeft = p.x; }
    );
  }

  const self = {
    identity: identitySymbol as symbol,
    length: elemArray.length,

    each(callback: (elem: HTMLElement | Element, index: string | number) => void) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) callback(elemArray[i], i);
      }
    },

    get(index: number): HTMLElement | Element | undefined {
      return elemArray[index];
    },

    first(): HTMLElement | Element | undefined {
      return elemArray[0];
    },

    attr(key: string, value: string | null | undefined = undefined): string | null | void {
      if (elemArray[0] === undefined) return null;
      if (value === undefined) return elemArray[0].getAttribute(key);
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) {
          if (value === null) elemArray[i].removeAttribute(key);
          else elemArray[i].setAttribute(key, value);
        }
      }
    },

    removeAttr(key: string) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) elemArray[i].removeAttribute(key);
      }
    },

    css(styles?: string | string[] | Record<string, string | number | null>, value?: string | number): CSSStyleDeclaration | string | Record<string, string> | void {
      if (elemArray[0] === undefined) return undefined as any;
      if (empty(styles)) return getComputedStyle(elemArray[0] as Element);
      if (typeof styles === "string") {
        if (value === undefined) return (getComputedStyle(elemArray[0] as Element) as any)[styles];
        (elemArray[0] as HTMLElement).style[styles as any] = addPx(value, styles) as string;
        return;
      }
      if (Array.isArray(styles)) {
        const ret: Record<string, string> = {};
        const elStyles = getComputedStyle(elemArray[0] as Element);
        for (const i in styles) {
          if (!styles.hasOwnProperty(i)) continue;
          ret[styles[i]] = (elStyles as any)[styles[i]];
        }
        return ret;
      } else if (typeof styles === "object") {
        for (const j in elemArray) {
          if (!elemArray.hasOwnProperty(j)) continue;
          const elem = elemArray[j] as HTMLElement;
          for (const i in styles) {
            if (!styles.hasOwnProperty(i)) continue;
            const prop = (styles as Record<string, any>)[i];
            if (prop !== null) (elem.style as any)[i] = addPx(prop, i);
            else (elem.style as any)[i] = 'auto';
          }
        }
      }
    },

    addClass(className: string) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) elemArray[i].classList.add(className);
      }
    },

    removeClass(className: string) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) elemArray[i].classList.remove(className);
      }
    },

    toggleClass(className: string) {
      for (const i in elemArray) {
        if (elemArray.hasOwnProperty(i)) elemArray[i].classList.toggle(className);
      }
    },

    remove(onRemoveElement?: (elem: HTMLElement | Element) => void) {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as ExtendedHTMLElement;
        removeElem(elem);
        if (typeof onRemoveElement === "function") onRemoveElement(elem);
      }
    },

    append(childOrChildren: Node | Node[] | NodeList | HTMLCollection) {
      const chArray = getArray(childOrChildren);
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        for (const k in chArray) {
          if (!chArray.hasOwnProperty(k)) continue;
          elemArray[i].appendChild(chArray[k]);
        }
      }
    },

    insertAfter(refChild: HTMLElement) {
      if (refChild.nextElementSibling) {
        for (const i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          refChild.parentElement!.insertBefore(elemArray[i], refChild.nextElementSibling);
        }
      } else {
        for (const i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          refChild.parentElement!.appendChild(elemArray[i]);
        }
      }
    },

    insertBefore(refChild: HTMLElement) {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        refChild.parentElement!.insertBefore(elemArray[i], refChild);
      }
    },

    replaceWith(newElement: HTMLElement) {
      DOM(newElement).insertAfter(elemArray[0] as HTMLElement);
      DOM(elemArray).remove();
    },

    parent(): any {
      const ret: (Element | null)[] = [];
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        ret.push(elemArray[i].parentElement);
      }
      return DOM(ret as any);
    },

    addEventListener: addEventListenerAll,
    removeEventListener: removeEventListenerAll,

    removeAllEventListeners() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        removeAllEvListeners(elemArray[i] as ExtendedHTMLElement);
      }
    },

    on(event: string, handler: string | ((event: Event) => void), capture?: boolean | AddEventListenerOptions) {
      if (typeof handler === "string") return onChildHandler(event, handler, capture as (event: Event) => void);
      return addEventListenerAll(event, handler, capture);
    },

    off(event: string, handler?: (event: Event) => void) {
      return removeEventListenerAll(event, handler);
    },

    onChild: onChildHandler,

    repaint() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const elem = elemArray[i] as HTMLElement;
        const old = elem.style.display;
        elem.style.display = 'none';
        elem.style.display = old;
      }
    },

    closest(query: string): any {
      if (elemArray[0] === undefined) return DOM([]);
      return DOM([elemArray[0].closest(query)] as any);
    },

    find(query: string): any {
      if (elemArray[0] === undefined) return DOM([]);
      return DOM(Array.from(elemArray[0].querySelectorAll(query)) as any);
    },

    width(value?: number | string): number | void {
      if (elemArray[0] === undefined) return 0;
      const elem = elemArray[0] as HTMLElement;
      if (value === undefined) return elem.offsetWidth;
      elem.style.width = addPx(value) as string;
    },

    height(value?: number | string): number | void {
      if (elemArray[0] === undefined) return 0;
      const elem = elemArray[0] as HTMLElement;
      if (value === undefined) return elem.offsetHeight;
      elem.style.height = addPx(value) as string;
    },

    position() {
      if (elemArray[0] === undefined) return { top: 0, left: 0 };
      const elem = elemArray[0] as HTMLElement;
      return { top: elem.offsetTop, left: elem.offsetLeft };
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
      let el: HTMLElement | null = elemArray[0] as HTMLElement;
      if (el.offsetParent) {
        do {
          distance += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        } while (el);
      }
      return distance < 0 ? 0 : distance;
    },

    offsetLeft() {
      if (elemArray[0] === undefined) return 0;
      let distance = 0;
      let el: HTMLElement | null = elemArray[0] as HTMLElement;
      if (el.offsetParent) {
        do {
          distance += el.offsetLeft;
          el = el.offsetParent as HTMLElement | null;
        } while (el);
      }
      return distance < 0 ? 0 : distance;
    },

    scrollTo: scrollToImpl,

    scrollLeft(offset?: number, behavior?: 'auto' | 'smooth'): number | void {
      if (elemArray[0] === undefined) return 0;
      if (offset === undefined) return (elemArray[0] as Element).scrollLeft;
      scrollToImpl({ left: offset, behavior: behavior });
    },

    scrollTop(offset?: number, behavior?: 'auto' | 'smooth'): number | void {
      if (elemArray[0] === undefined) return 0;
      if (offset === undefined) return (elemArray[0] as Element).scrollTop;
      scrollToImpl({ top: offset, behavior: behavior });
    },

    val(value?: string | number): string | undefined | void {
      if (elemArray[0] === undefined) return undefined;
      if (value === undefined) return (elemArray[0] as HTMLInputElement).value;
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        (elemArray[i] as HTMLInputElement).value = String(value);
      }
    },

    show() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const el = elemArray[i] as ExtendedHTMLElement;
        if (!el._DOM_oldStyle) el._DOM_oldStyle = {};
        if (!el._DOM_oldStyle.display) el._DOM_oldStyle.display = DOM(el).css('display') as string;
        el.style.display = el._DOM_oldStyle.display;
      }
    },

    hide() {
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        const el = elemArray[i] as ExtendedHTMLElement;
        if (!el._DOM_oldStyle) el._DOM_oldStyle = {};
        if (!el._DOM_oldStyle.display) el._DOM_oldStyle.display = DOM(el).css('display') as string;
        el.style.display = 'none';
      }
    },

    focus() {
      if (elemArray[0] === undefined) return;
      for (const i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        (elemArray[i] as HTMLElement).focus();
      }
    }
  };

  return Object.assign(Object.create(self), elemArray) as typeof self;
}

export type DOMInstance = ReturnType<typeof DOM>;