declare global {
  interface Window {
    empty: (value: any) => boolean;
    device?: {
      platform: string;
      model: string;
    };
    platform?: string;
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame: (handle: number) => void;
  }

  interface Element {
    repaint(): void;
  }
}

(window as any).empty = function (value: any): boolean {
  return typeof value === "undefined" || value === null || value === "" || value === 0 || value === false;
};

if (!('remove' in Element.prototype)) {
  (Element.prototype as any).remove = function (this: Element) {
    this.parentNode?.removeChild(this);
  };
}

if (!('repaint' in Element.prototype)) {
  (Element.prototype as any).repaint = function (this: HTMLElement) {
    const d = this.style.display;
    this.style.display = 'none';
    this.offsetHeight; // Force reflow
    this.style.display = d;
  };
}

if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function <T>(this: T[], searchElement: T, fromIndex?: number): number {
    if (this == null)
      throw new TypeError();

    const t = Object(this);
    const len = t.length >>> 0;
    if (len === 0)
      return -1;

    let n: number = len;
    if (fromIndex !== undefined) {
      n = Number(fromIndex);
      if (isNaN(n))
        n = 0;
      else if (n != 0 && n != (1 / 0) && n != -(1 / 0))
        n = (n > 0 ? 1 : -1) * Math.floor(Math.abs(n));
    }

    let k = n >= 0
      ? Math.min(n, len - 1)
      : len - Math.abs(n);

    for (; k >= 0; k--) {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function (count: number): string {
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    const str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    let rpt = '';
    for (let i = 0; i < count; i++) {
      rpt += str;
    }
    return rpt;
  };
}

if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, "assign", {
    value: function assign(target: any, ...sources: any[]) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      const to = Object(target);

      for (let index = 0; index < sources.length; index++) {
        const nextSource = sources[index];

        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
  Object.defineProperty(HTMLElement.prototype, 'classList', {
    get: function (this: HTMLElement) {
      const self = this;
      function update(fn: (classes: string[], index: number, value: string) => void) {
        return function (value: string) {
          const classes = self.className.split(/\s+/);
          const index = classes.indexOf(value);
          fn(classes, index, value);
          self.className = classes.join(" ");
        };
      }

      const ret = {
        add: update(function (classes, index, value) {
          ~index || classes.push(value);
        }),

        remove: update(function (classes, index) {
          ~index && classes.splice(index, 1);
        }),

        toggle: update(function (classes, index, value) {
          ~index ? classes.splice(index, 1) : classes.push(value);
        }),

        contains: function (value: string) {
          return !!~self.className.split(/\s+/).indexOf(value);
        },

        item: function (i: number) {
          return self.className.split(/\s+/)[i] || null;
        }
      };

      Object.defineProperty(ret, 'length', {
        get: function () {
          return self.className.split(/\s+/).length;
        }
      });

      return ret;
    }
  });
}

if (!(window as any)['device']) {
  (window as any)['device'] = {
    platform: (window as any).platform,
    model: "Unknown",
  };
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// requestAnimationFrame polyfill by Erik Möller
// MIT license
(function () {
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = (window as any)[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = (window as any)[vendors[x] + 'CancelAnimationFrame']
      || (window as any)[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    (window as any).requestAnimationFrame = function (callback: FrameRequestCallback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(function () { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id: number) {
      clearTimeout(id);
    };
}());

export default () => { };