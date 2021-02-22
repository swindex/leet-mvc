import { isIterable, empty } from './helpers';


const identitySymbol = Symbol('identitySymbol');
//Window|HTMLElement|DocumentFragment|Element|string
/**
 * jQuery replacement
 * @param {any} elemOrQuery 
 */
export function DOM(elemOrQuery) {

  /**
	 * @param {object} children 
	 * @return {object[]}
	 */
  function getArray(children) {
    if (isIterable(children) && !(children instanceof HTMLElement)) {
      return Array.prototype.slice.call(children);
    } else {
      return [children];
    }
  }

  function interpolateLine(p1, p2, steps, callback) {
    var N = steps;
    var step = 0;
    var anumateToDest = () => {
      if (step < N) {
        step++;
        var t = step / N;
        window.requestAnimationFrame(anumateToDest);
        var y = lerp(p1.y, p2.y, t);
        var x = lerp(p1.x, p2.x, t);
        callback({ x, y });
      }
    };
    anumateToDest();
  }
  function lerp(start, end, t) {
    return start + t * (end - start);
  }

  var pxRequiredKeys = ['top', 'left', 'height', 'width', 'right', 'bottom'];

  function remove(elem) {
    //remove children
    /*if (elem.children) {
      for (var i in elem.children) {
        if (!elem.children.hasOwnProperty(i)) continue;
        remove(elem.children[i]);
      }
    }*/

    if (elem.parentNode) {
      elem.parentNode.removeChild(elem);
      //removeAllEventListeners(elem);
    }
  }

  function removeAllEventListeners(elem) {
    var handlers = elem["__EVENTS__"];
    if (!handlers) {
      return;
    }
    for (var event in handlers) {
      removeEventListener(elem, event);
    }
    delete elem["__EVENTS__"];
  }

  function removeEventListener(elem, events, removeHandler = null) {
    var ar = events.split(' ');
    for (var j in ar) {
      if (!ar.hasOwnProperty(j)) continue;
      var event = ar[j];

      var eventHandlers = elem["__EVENTS__"][event];
      if (!eventHandlers) {
        return;
      }

      for (var i in eventHandlers) {
        var handler = eventHandlers[i];
        if (removeHandler && handler[0] == removeHandler) {
          elem.removeEventListener(event.split(".")[0], handler[0], handler[1]);
        } else if (!removeHandler) {
          elem.removeEventListener(event.split(".")[0], handler[0], handler[1]);
        }
      }

      delete elem["__EVENTS__"][event];
    };

  }


  function addPx(value, keyName) {
    if (isNaN(value))
      return value;
    if (keyName != undefined) {
      if (pxRequiredKeys.indexOf(keyName) >= 0)
        return ("" + value + "").replace(/px/, "") + "px";
      else
        return value;
    }

    return ("" + value + "").replace(/px/, "") + "px";
  }

  const self = {
    identity: identitySymbol,
    /**
     * Iterate ove reach element of the set
     * @param {function(HTMLElement, any):void} callback 
     */
    each(callback) {
      for (var i in elemArray) {
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
      if (elemArray[0] == undefined) return null;
      //remove children
      if (value == undefined) {
        return elemArray[0].getAttribute(key);
      }
      for (var i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].setAttribute(key, value);
      };
    },
    removeAttr(key) {
      for (var i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].removeAttribute(key);
      }
    },
    /**
     * Apply CSS rule to all elements
     * @param {{[key:string]:string}|string[]|string} styles - if styles is array, return the specified css properties
     * @param {string} [value]
     */
    css(styles, value) {
      if (elemArray[0] == undefined) return null;

      if (empty(styles)) {
        return getComputedStyle(elemArray[0]);
      }
      if (typeof styles == "string") {
        if (value === undefined)
          return getComputedStyle(elemArray[0])[styles];

        elemArray[0].style[styles] = addPx(value, styles);
        return;
      }
      if (Array.isArray(styles)) {
        var ret = {};
        var elStyles = getComputedStyle(elemArray[0]);
        for (var i in styles) {
          if (!styles.hasOwnProperty(i)) continue;
          var prop = styles[i];
          ret[prop] = elStyles[prop];
        }
        return ret;
      } else {
        for (var j in elemArray) {
          if (!elemArray.hasOwnProperty(j)) continue;
          var elem = elemArray[j];

          for (var i in styles) {
            if (!styles.hasOwnProperty(i)) continue;
            var prop = styles[i];

            if (prop !== null)
              elem.style[i] = addPx(prop, i);
            else
              elem.style[i] = 'auto';
          }
        };
      }
    },
    addClass(className) {
      for (var i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].classList.add(className);
      };
    },
    removeClass(className) {
      for (var i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].classList.remove(className);
      };
    },
    toggleClass(className) {
      for (var i in elemArray) {
        if (elemArray.hasOwnProperty(i))
          elemArray[i].classList.toggle(className);
      };
    },
    /**
     * Remove element and their children from DOM
     * @param {function(HTMLElement|Element): void} [onRemoveElement] 
     */
    remove(onRemoveElement) {
      //remove children
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];

        remove(elem);

        if (typeof onRemoveElement == "function") {
          onRemoveElement(elem);
        }
      };
    },

    /**
     * Append children to element
     * @param {*} childOrChildren 
     */
    append(childOrChildren) {
      var chArray = getArray(childOrChildren);
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];
        for (let k in chArray) {
          if (!chArray.hasOwnProperty(k)) continue;
          elem.appendChild(chArray[k]);
        }
      };
    },

    /**
     * Insert the first element of collection After the reference element
     * @param {HTMLElement} refChild 
     */
    insertAfter(refChild) {
      if (refChild.nextElementSibling) {
        for (var i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          var elem = elemArray[i];
          refChild.parentElement.insertBefore(elem, refChild.nextElementSibling);
        }
      } else {
        for (var i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          var elem = elemArray[i];
          refChild.parentElement.appendChild(elem);
        };
      }
    },

    /**
     * Insert the first element of collection Before the reference element
     * @param {HTMLElement} refChild 
     */
    insertBefore(refChild) {
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];
        refChild.parentElement.insertBefore(elem, refChild);
      };
    },

    /**
     * Replace first element of collection with new element
     * @param {HTMLElement} newElement 
     */
    replaceWith(newElement) {
      DOM(newElement).insertAfter(elemArray[0]);
      DOM(elemArray).remove();
    },

    /**
     * Gt Parent of each element in sequence
     */
    parent() {
      var ret = [];
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];
        ret.push(elem.parentElement);
      };
      return DOM(ret);
    },
    /**
     * Add event listener to element
     * @param {string} events 
     * @param {function(Event)} handler
     * @param {any} [capture]
     */
    addEventListener(events, handler, capture) {
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];

        var ar = events.split(' ');
        for (var ii in ar) {
          if (!ar.hasOwnProperty(ii)) continue;
          var event = ar[ii];
          if (!elem["__EVENTS__"]) {
            elem["__EVENTS__"] = {};
          }
          if (!(event in elem["__EVENTS__"])) {
            // each entry contains another entry for each event type
            elem["__EVENTS__"][event] = [];
          }
          // capture reference
          elem["__EVENTS__"][event].push([handler, capture]);
          elem.addEventListener(event.split(".")[0], handler, capture);
        };
      };
    },
    /**
     * Remove Event Listener
     * @param {string} events 
     * @param {function()} [removeHandler] - specific handler to remove. By default removes all events for specified event name
     */
    removeEventListener(events, removeHandler = null) {
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];
        removeEventListener(elem, events, removeHandler);
      };
    },

    /**
     * Remove All Event Listeners
     */
    removeAllEventListeners() {
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];

        removeAllEventListeners(elem);

      };
    },

    on(event, handler, capture) {
      if (typeof handler == "string") {
        return self.onChild(event, handler, capture);
      }
      return self.addEventListener(event, handler, capture);
    },
    off(event, handler) {
      return self.removeEventListener(event, handler);
    },

    onChild(event, query, handler) {
      return self.addEventListener(event, (event) => {
        if (event.target instanceof HTMLElement && (event.target.matches ? event.target.matches(query) : event.target.msMatchesSelector(query))) {
          handler(event);
        }
      }, true);
    },


    /**
     * Repaint element
     */
    repaint() {
      // in plain js
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var elem = elemArray[i];

        var old = elem.style.display;
        elem.style.display = 'none';
        elem.style.display = old;
      };
    },


    /**
     * Find a parent by query
     * @param {string} query 
     * //@vvreturn {HTMLElement[]|HTMLOptionElement[]|Element[]}
     */
    closest(query) {
      if (elemArray[0] == undefined) return DOM([]);
      var elements = [elemArray[0].closest(query)];
      // @ts-ignore
      return DOM(elements);
    },
    /**
     * Find children by query
     * @param {string} query 
     * //@vvreturn {HTMLElement[]|HTMLOptionElement[]|Element[]}
     */
    find(query) {
      if (elemArray[0] == undefined) return DOM([]);
      var elems = Array.from(elemArray[0].querySelectorAll(query));
      // @ts-ignore
      return DOM(elems);
    },
    width(value = undefined) {
      if (elemArray[0] == undefined) return 0;
      /** @type {HTMLElement} */
      var elem = elemArray[0];
      if (value === undefined)
        return elem.offsetWidth;
      elem.style.width = addPx(value);
    },
    height(value = undefined) {
      if (elemArray[0] == undefined) return 0;
      /** @type {HTMLElement} */
      var elem = elemArray[0];

      if (value === undefined)
        return elem.offsetHeight;

      elem.style.height = addPx(value);
    },

    position() {
      if (elemArray[0] == undefined) return { top: 0, left: 0 };
      return {
        top: elemArray[0].offsetTop,
        left: elemArray[0].offsetLeft,
      };
    },
    offset() {
      var box = { top: 0, left: 0 };
      if ( typeof elemArray[0].getBoundingClientRect == "function" ) {
        box = elemArray[0].getBoundingClientRect();
      }
      return {
        top: box.top  + (window.scrollY || window.pageYOffset),
        left: box.left + (window.scrollX || window.pageXOffset)
      };
    },
    innerHeight() {
      if (elemArray[0] == undefined) return 0;

      // Return our distance
      return elemArray[0].clientHeight;
    },
    innerWidth() {
      if (elemArray[0] == undefined) return 0;

      // Return our distance
      return elemArray[0].clientWidth;
    },
    offsetTop() {
      if (elemArray[0] == undefined) return 0;
      // Set our distance placeholder
      var distance = 0;
      var elem = elemArray[0];
      // Loop up the DOM
      if (elem.offsetParent) {
        do {
          distance += elem.offsetTop;
          elem = elem.offsetParent;
        } while (elem);
      }

      // Return our distance
      return distance < 0 ? 0 : distance;
    },
    offsetLeft() {
      if (elemArray[0] == undefined) return 0;
      // Set our distance placeholder
      var distance = 0;
      var elem = elemArray[0];
      // Loop up the DOM
      if (elem.offsetParent) {
        do {
          distance += elem.offsetLeft;
          elem = elem.offsetParent;
        } while (elem);
      }

      // Return our distance
      return distance < 0 ? 0 : distance;
    },
    /**
     * Scroll Element contents
     * @param {{behavior?:'auto'|'smooth', top?: number, left?:number}} options 
     */
    scrollTo(options) {
      if (elemArray[0] == undefined) return 0;

      if (typeof elemArray[0].scrollTo !== "function") {
        elemArray[0].scrollTo(options);
        return;
      }

      var el = elemArray[0];
      interpolateLine({
        x: el.scrollLeft,
        y: el.scrollTop
      },
        {
          x: options.left != undefined ? options.left : el.scrollLeft,
          y: options.top != undefined ? options.top : el.scrollTop
        },
        options.behavior == "smooth" ? 25 : 1,
        (p) => {
          el.scrollTop = p.y;
          el.scrollLeft = p.x;
        });

    },

    /**
     * Scroll Element contents
     * @param {number} [offset]
     * @param {'auto'|'smooth'} [behavior] 
     */
    scrollLeft(offset, behavior) {
      if (elemArray[0] == undefined) return 0;
      if (offset == undefined) {
        return elemArray[0].scrollLeft;
      } else {
        self.scrollTo({ left: offset, behavior: behavior });
      }
    },
    /**
     * Scroll Element contents
     * @param {number} [offset]
     * @param {'auto'|'smooth'} [behavior] 
     */
    scrollTop(offset, behavior) {
      if (elemArray[0] == undefined) return 0;
      if (offset == undefined) {
        return elemArray[0].scrollTop;
      } else {
        self.scrollTo({ top: offset, behavior: behavior });
      }
    },

    val(value) {
      if (elemArray[0] == undefined) return undefined;
      if (value == undefined) {
        return elemArray[0].value;
      } else {
        for (var i in elemArray) {
          if (!elemArray.hasOwnProperty(i)) continue;
          var elem = elemArray[i];

          elem.value = value;
        };
      }
    },
    show(value) {
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var el = elemArray[i];

        if (!el._DOM_oldStyle)
          el._DOM_oldStyle = {};
        if (!el._DOM_oldStyle.display)
          el._DOM_oldStyle.display = DOM(el).css('display');
        el.style.display = el._DOM_oldStyle.display;
      };
    },
    hide(value) {
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var el = elemArray[i];

        if (!el._DOM_oldStyle)
          el._DOM_oldStyle = {};
        if (!el._DOM_oldStyle.display)
          el._DOM_oldStyle.display = DOM(el).css('display');

        el.style.display = 'none';
      }
    },
    focus() {
      if (elemArray[0] == undefined) return undefined;
      for (var i in elemArray) {
        if (!elemArray.hasOwnProperty(i)) continue;
        var el = elemArray[i];

        el.focus();
      };
    }

  };

  if (elemOrQuery == null) {
    throw new Error("elemOrQuery can not be empty!");
  }

  /** @type {HTMLElement[]} */
  var elemArray = [];

  if (typeof elemOrQuery == "string" || typeof elemOrQuery == "number") {
    elemArray = Array.from(document.querySelectorAll(elemOrQuery));
  } else if (typeof elemOrQuery == "object") {
    //if passed element is already DOM object, then return it as-is
    if (elemOrQuery.identity == identitySymbol) {
      /** @type {self} */
      var ret = elemOrQuery;
      return ret;
    }
    elemArray = getArray(elemOrQuery);
  } else {
    throw new Error("Not Implemented");
  }

  /** @type {self} */
  var instance = Object.create(self);

  instance.length = elemArray.length;

  return Object.assign(instance, elemArray);
}