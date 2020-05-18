import { empty, tryCall, numberFromLocaleString, isObjLiteral } from "./helpers";
import { BaseComponent } from "../components/BaseComponent";
import { isObject, isString, isBoolean } from "util";

import { isSkipUpdate } from "./Watcher";
import { DateTime } from "./DateTime";
import { isArray } from "util";
import { isFunction } from "util";
import { Objects } from "./Objects";
import { DOM } from "./DOM";

var htmlparser = require("htmlparser2");

/** 
 * @constructor 
 * @param {*} context
 */
export var Binder = function (context) {
  var getterCashe = {};
  /** @type {Binder} */
  var self = this;
  /** @type {vDom} */
  this.vdom = null;
  this.context = context || this;
  /** @type {{[key:string]:any}} */
  this.injectVars = {};

  var EAttrResult = {
    None: undefined,
    NodeChanged: 1,
    SkipChildren: 2,
    NodeChangedSkipChildren: 3,
  };

  this.eventCallbacks = { change: null, focus: null, input: null, click: null };

  function insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
  }

  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
  /**
   * Insert vDom element and its children after reference Node
   * @param {vDom} vDom 
   * @param {HTMLElement} referenceNode 
   */
  function insertVDomElementAfter(vDom, referenceNode) {
    insertAfter(vDom.elem, referenceNode);
    if (vDom.elem instanceof Comment) {
      insertVDomItemsAfter(vDom.items, vDom.elem);
    }
  }

  function insertVDomItemsAfter(items, referenceNode) {
    if (isArray(items)) {
      var frag = document.createDocumentFragment();
      Objects.forEach(items, item => {
        frag.appendChild(item.elem);
        if (item.elem instanceof Comment) {
          insertVDomItemsAfter(item.items, item.elem);
          //if item is a componenet, re-insert its children too.
          if (item.getters.component) {
            var component = item.getters.component(self, {});
            insertVDomElementAfter(component.binder.vdom, item.elem);
          }
        }
      });
      insertAfter(frag, referenceNode);
    }
  }

  /**
   * 
   * @param {HTMLElement} elem 
   * @param {boolean} [keepEvents] - default false
   */
  function removeElement(elem, keepEvents) {
    if (keepEvents === true) {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    } else {
      removeDOMElement(elem);
    }
  }

  function removeVDomItems(items, keepEvents) {
    if (isArray(items)) {
      Objects.forEach(items, item => {
        removeElement(item.elem, keepEvents);
        //if item is a comment, remove its items too
        if (item.elem instanceof Comment) {
          removeVDomItems(item.items, keepEvents);
          //if item is a componenet, remove its vDOM element too.
          if (item.getters.component) {
            var component = item.getters.component(self, {});
            if (component.binder) {
              removeElement(component.binder.vdom.elem, keepEvents);
            }
          }
        }
      });
    }
  }

  function replaceElement(newNode, oldNode) {
    insertBefore(newNode, oldNode);
    removeElement(oldNode);
  }

  this.setContext = function (context) {
    this.context = context;
    return self;
  };
  /**
   * Inject Variables into the scope of the binder
   * @param {{[varName:string]:any}} vars 
   */
  this.setInjectVars = function (vars) {
    self.injectVars = vars;
    return self;
  };

  /**
   * Bind DOM elements that have "bind" attribute with model
   * @eventCallbacks Object, common event handler , {change:function(event){}, focus:function(event){}}
   */
  this.bindElements = function (eventCallbacks, template) {
    //if callbacks is a function then it is change by default
    if (typeof eventCallbacks === "function")
      self.eventCallbacks.change = eventCallbacks;
    else if (typeof eventCallbacks === "object")
      self.eventCallbacks = Object.assign(self.eventCallbacks, eventCallbacks);

    if (!self.context.injectVars) {
      context.injectVars = {};
    }

    var vdom = executeSource(parseElement(template), self.injectVars);
    self.vdom = vdom;

    return self;
  };

  /**
   * Destroy the root DOM and vDOM elements and ALL Hooks
   */
  this.destroy = function () {
    if (self.vdom) {
      removeVDOMElement(self.vdom);
      self.vdom = null;
    }
  };

  //escape attribute value
  function escapeAttribute(attrValue) {
    return attrValue.replace(/\n/g, '\\n').
      replace(/"/g, '\\"');
  }

  function parseElement(template) {

    var handler = new htmlparser.DomHandler(function (error, dom) {
      if (error) {

      } else {

      }
    });
    var parser = new htmlparser.Parser(handler, { lowerCaseAttributeNames: false, decodeEntities: true });
    parser.parseComplete(template);
    //console.log(handler.dom);
    var rootelements = Objects.filter(handler.dom, el => el.type == 'tag');
    if (rootelements.length != 1) {
      //throw Error("Error: Template must contain exactly one root element: "+template);
      //wrap elements in fragment			
      return parseAST({
        data: 'div',
        type: 'tag',
        name: 'div',
        attribs: { fragment: "" },
        children: rootelements
      });
    }
    return parseAST(rootelements[0]);
  }

  /**
   * Turn template HTML into a createDomElement function
   * @param {ASTObject} obj
   * @return {string}
   */
  function parseAST(obj) {
    var thisSorurce = "";
    var wrapDirective = "";
    if (obj.type == 'text') {
      var escaped = escapeAttribute(obj.data);
      //parse {{moustache}} template within the text node
      var bits = escaped.split(/({{[^{}]*}})/gmi);
      var splitNodes = [];
      Objects.forEach(bits, function (el) {
        var ret = null;
        el.replace(/{{([^{}]+)}}|(.*)/g, function (a, p1, p2, d) {
          if (p1) {
            splitNodes.push('createElement("#text",{bind:"' + p1 + '"},[], inject)');
          } else if (p2) {
            splitNodes.push('createElement("#text",{},"' + p2 + '", inject)');
          }
        });
      });
      thisSorurce = splitNodes.join(',');
    } else if (obj.type == 'comment') {
      //skip comments
      thisSorurce = null;
    } else {
      thisSorurce = "createElement(";
      var tag = obj.name;

      var componenet = tryGetComponenet(tag);
      //add '[component]' attribute only if tag name is registered and current context is NOT the instance of that same component class (avoid callstack exception if same tag name is used inside the component.html)
      if (componenet && !(self.context instanceof componenet)) {
        obj.attribs['[component]'] = `Registered('${tag}')`;
        delete obj.attribs['[directive]'];
      }

      //var attrText = "{";
      var attributes = {};
      if (obj.attribs) {
        Objects.forEach(obj.attribs, function (value, key) {
          //value = escapeAttribute(value);
          switch (key) {
            case '[foreach]':
            case '[transition]':
            case '[directive]':
            case '[component]':
            case '[if]':
              wrapDirective = `"${key}":"${value}"`;
              break;
            default:
              attributes[key] = value;
          }

        });
      }
      //attrText +="}"
      thisSorurce += "'" + tag + "', " + JSON.stringify(attributes) + "";
      thisSorurce += ",[";

      if (obj.children && obj.children.length > 0) {
        Array.prototype.slice.call(obj.children).forEach(function (child) {
          thisSorurce += parseAST(child);
          thisSorurce += ",";
        });
      }
      thisSorurce += "], inject)";

      if (!empty(wrapDirective)) {
        thisSorurce = "createDirectiveElement('" + tag + "',{" + wrapDirective + "}, function(inject){ return [ " + thisSorurce + "]},inject)";
      }
    }

    return thisSorurce;
  }

  function getHtmlFromRender(tag, attrs) {
    var attrs_str = [""];
    Objects.forEach(attrs, (atr, key) => { attrs_str.push(`${key}="${atr}"`); });
    return `<${tag}${attrs_str.join(' ')}></${tag}>`;
  }

  this.vdom = null;
  /**
   * @return {vDom}
   */
  function executeSource(parsedSource, inj) {

    //var vdom = [];
    var scope = {
      /** Any kind of element that creates it's own scope AND returns vDOM with fragment and itemBuilder  */
      createDirectiveElement: function (tag, attributes, createElements, inject) {
        try {
          //create directive fragment element, into which the deirective contents will be appended
          var directiveFragment = document.createDocumentFragment();

          var attrKeys = Object.keys(attributes);
          var getters = {};

          var attrName = attrKeys[0];
          var bindExpression = attributes[attrName];

          //create comment element that will become the anchor for the directive.
          var elem = document.createComment(attrName + "=" + bindExpression + " ");
          directiveFragment.appendChild(elem);

          var rType = getReactivityType(attrName);
          var key = rType.key;

          if (bindExpression) {
            if (key == "foreach") {
              //special handling for foreach. because getter can not be created from foreach attribute [foreach] = "index in this.items as item"
              getters[key] = getForeachAttrParts(bindExpression);
            } else {
              //for all other attributes like [if] = "this.isVisible" create getter for the attribute value
              getters[key] = createGetter(bindExpression, inject);
            }
          }
          //because directive children are likely to be re-rendered, do not immediately render them. create itemBuilder function
          var itemBuilder = function (inject) {
            var items = createElements(inject);
            if (items[0] && items[0].elem.getAttribute && items[0].elem.getAttribute("fragment") !== null) {
              var frag = document.createDocumentFragment();
              DOM(frag).append(items[0].elem.childNodes);
              items[0].elem = frag;
            }
            items[0].INJECT = inject;
            return items[0];
          };
          var vdom = { values: {}, getters: getters, setters: {}, callers: {}, fragment: directiveFragment, elem: elem, items: [], itemBuilder: itemBuilder };
          executeAttribute(key, vdom, inject);

          return vdom;
        } catch (ex) {
          console.error(ex.message + "\n At " + getHtmlFromRender(tag, attributes));
        }
      },
      /**
       * Create element
       * @param {string} tag
       * @param {string[]} attributes
       * @param {string|vDom[]} createElements
       * @param {any} inject
       */
      createElement: function (tag, attributes, createElements, inject) {
        try {
          inject = inject || {};
          var vdomItems = [];
          var elem;
          var attrKeys = Object.keys(attributes);
          var getters = {};
          var setters = {};
          var callers = {};
          var plainAttrs = {};
          var renderImmediately = [];

          if (tag == "#text") {
            if (isString(createElements)) {
              elem = document.createTextNode(createElements);
              var vdom = { values: {}, valuesD: {}, getters: getters, setters: setters, fragment: null, elem: elem, items: vdomItems, itemBuilder: null, context: self.context };

            } else {
              elem = document.createTextNode("");
              getters = { 'bind': createGetter(attributes['bind'], inject) };
              var vdom = { values: {}, valuesD: {}, getters: getters, setters: setters, fragment: null, elem: elem, items: vdomItems, itemBuilder: null, context: self.context };
              executeAttribute('bind', vdom, inject);
            }

            return vdom;
          }

          elem = document.createElement(tag);

          for (var i in attrKeys) {
            var bindExpression = null;

            var attrName = attrKeys[i];
            bindExpression = attributes[attrName];

            var rType = getReactivityType(attrName);
            var key = rType.key;

            if (!bindExpression) {
              plainAttrs[key] = null;
              elem.setAttribute(key, attributes[key]);
              continue;
            }

            switch (rType.type) {
              case 'get-set':
                getters[key] = createGetter(bindExpression, inject);
                setters[key] = createSetter(bindExpression, inject);

                //if element is directly setting, then apply all change and input callbacks
                if (isElementSetting(elem)) {
                  applyCallbacks(elem, self.context, self.eventCallbacks);
                  if (inject.component && inject.component.events) {
                    applyCallbacks(elem, inject.component, inject.component.events);
                  }
                }
                renderImmediately.push(key);
                elem.setAttribute(key, attributes[key]);
                break;
              case 'get':
                getters[key] = createGetter(bindExpression, inject);
                renderImmediately.push(key);
                break;
              case 'call':
                callers[key] = createCaller(bindExpression, inject);
                break;
              default:
                //normal attribute
                //add it to the list of plain string-only attributes - will be used in component
                plainAttrs[key] = bindExpression;
                elem.setAttribute(key, attributes[key]);
                break;
            }
          }

          //if element has an attribute "fragment" then make the element a fragment so its children can be added directly
          if (plainAttrs['fragment'] !== undefined) {
            elem = document.createDocumentFragment();
          }

          for (var ii = 0; ii < createElements.length; ii++) {
            if (isObject(createElements[ii])) {
              if (isArray(createElements[ii])) {
                if (createElements[ii].length > 0)
                  createElements[ii].map(function (el) {
                    if (el.vdom)
                      vdomItems.push(el.vdom);
                    elem.appendChild(el.fragment || el.elem);
                  });
              } else {
                if (createElements[ii])
                  vdomItems.push(createElements[ii]);
                elem.appendChild(createElements[ii].fragment || createElements[ii].elem);
              }
            } else if (isFunction(createElements[ii])) {
              throw new Error("Item must be an vDom object");
            }
          }

          var vdom = { values: {}, valuesD: {}, getters: getters, setters: setters, callers: callers, plainAttrs: plainAttrs, fragment: null, elem: elem, items: vdomItems, itemBuilder: null, context: self.context };
          elem['VDOM'] = vdom;

          for (var ii = 0; ii < renderImmediately.length; ii++) {
            executeAttribute(renderImmediately[ii], vdom, inject);
          }
          if (plainAttrs['fragment'] === undefined) {
            bindEventsToContext(elem, inject);
          }
          return vdom;
        } catch (ex) {
          console.error(ex.message + "\n At " + getHtmlFromRender(tag, attributes));
        }
      }
    };

    var exec = new Function('createElement', 'createDirectiveElement', 'context', 'inject',
      `return (function(createElement,context,inject){return ${parsedSource}}).call(context,createElement,context, inject);`
    );
    var ret = exec(scope.createElement, scope.createDirectiveElement, self.context, inj);

    return ret;
  }

  /**
   * 
   * @param {string} attrValue 
   */
  function isReactiveGetter(attrValue) {
    var matches = attrValue.match(/^\[(.*)\]$/);
    if (matches) {
      return matches[1];
    }
  }
  /**
   * 
   * @param {string} attrName 
   * @return {{type:'get'|'get-set'|'call'|null,key:string}}
   */
  function getReactivityType(attrName) {
    if (attrName == 'bind') {
      return { type: 'get-set', key: attrName };
    }
    // [()]
    var matches = attrName.match(/^\[\((.*)\)\]$/);
    if (matches) {
      return { type: 'get-set', key: matches[1] };
    }
    // ()
    var matches = attrName.match(/^\((.*)\)$/);
    if (matches) {
      return { type: 'call', key: matches[1] };
    }
    // []
    var matches = attrName.match(/^\[(.*)\]$/);
    if (matches) {
      return { type: 'get', key: matches[1] };
    }
    return { type: null, key: attrName };
  }

  /**
   * 
   * @param {vDom} on 
   */
  function vDomCreateItems(on, inj) {

    var vdom = on.itemBuilder(inj);
    if (vdom.elem instanceof DocumentFragment) {
      on.items = vdom.items;
    } else {
      on.items.push(vdom);
    }
    insertAfter(vdom.elem, on.elem);
  }

  /**
   * Bind element's events to context
   * @param {HTMLElement|Element} elem
   */
  function bindEventsToContext(elem, inject) {
    Objects.forEach(Array.prototype.slice.call(elem.attributes), function (attr) {
      if (typeof elem[attr.name] == 'function') {
        //var inject = self.injectVars;
        elem[attr.name] = null;

        let s_name = attr.name.substr(2);

        let handler = function (evt) {
          updateBoundContextProperty(evt.target);
          var inj = Object.assign({}, self.injectVars, { '$event': evt }, inject, findElemInject(elem));
          var c = createCaller(attr.value, inj);
          c(inj);
        };

        DOM(elem).addEventListener(s_name, handler);
      }
    });
  }
  /**
   * Find closest element with INJECT
   * @param {HTMLElement|Element|Node} elem
   */

  function findElemInject(elem) {
    if (elem.VDOM && elem.VDOM.INJECT) {
      return elem.VDOM.INJECT;
    }
    if (elem.parentNode) {
      return findElemInject(elem.parentNode);
    }
    return null;
  }

  /**
   * Update DOM elements according to bindings
   */
  this.updateElements = function () {
    self.context[isSkipUpdate] = true;
    checkVDomNode(self.vdom, self.injectVars);
    self.context[isSkipUpdate] = false;
    return self;
  };

  /** 
   * @param {vDom} on  
   */
  function checkVDomNode(on, inject) {
    //console.log(on);
    var nodeChanged = EAttrResult.None;
    if (on && on.getters) {
      for (var key in on.getters) {
        if (!on.getters.hasOwnProperty(key)) {
          continue;
        }

        var dirResult = executeAttribute(key, on, inject);
        //if directives[key](on, inject) returns false, means return right away
        if (dirResult === EAttrResult.SkipChildren)
          return EAttrResult.SkipChildren;

      }

      for (var i in on.items) {
        if (!on.items.hasOwnProperty(i))
          continue;
        if (checkVDomNode(on.items[i], inject) === EAttrResult.NodeChanged) {
          nodeChanged = EAttrResult.NodeChanged;
        }
      }
    } else if (!on) {
      console.log("AAAA");
    }
    return nodeChanged;
  }

  function getClassName(object){
    var ret = object.constructor ? object.constructor.name : object.toString();
    return ret.replace(/bound /g, '');
  }

  function executeAttribute(attribute, on, inject) {
    var old = on.values[attribute];
    //try{
    //if a built-in attribute
    if (attributes[attribute]) {
      var ret = attributes[attribute](on, inject);
    } else {
      //attribute is not in the standard attribute list
      if (on.getters[attribute]) {
        //getter exists
        var value = on.getters[attribute](inject);
        //-----------Below code used to set the property of the componenet to the value returned by the getter. I dont know why. Maybe remothe the whole thing. and do nothing with custom getters....
        if (self.context instanceof BaseComponent && self.context[attribute] !== value) {
          self.context[attribute] = value;
        }
        //set attribute of the HTML element to the value;
        if (on.elem) {
          on.elem[attribute] = value;
        }
      }
    }
    /*}catch(ex){
  console.warn(ex);
}/**/
    if (old !== on.values[attribute] && ret !== EAttrResult.SkipChildren) {
      ret = EAttrResult.NodeChanged;
    }
    return ret;
  }

  /**
   * Custom attribute handling goes here
   */
  var attributes = {
    'if': function (on, inject) {
      var key = "if";
      var getter = on.getters[key];
      var isTrue;
      try {
        isTrue = getter(inject);
      } catch (ex) {
        isTrue = undefined;
      }
      if (on.values[key] !== isTrue) {
        on.values[key] = isTrue;
        if (isTrue) {
          if (on.items.length == 0) {
            //if if directive does not have any children, create them
            vDomCreateItems(on, inject);
          } else {
            //if (on.items[0] instanceof DocumentFragment)
            insertVDomItemsAfter(on.items, on.elem);
          }

        } else {
          if (on.items.length > 0 && on.items[0].elem.parentNode) {
            removeVDomItems(on.items, true);
          }
          return EAttrResult.SkipChildren;
        }

      }
      if (!isTrue) {
        return EAttrResult.SkipChildren;
      }
    },
    'transition': function (on, inject) {
      var key = "transition";
      var getter = on.getters[key];
      var options;
      try {
        options = getter(inject);
      } catch (ex) {
        options = {};
      }

      options = Object.assign({
        trigger: null,
        duration: 0,
        enter: 'enter',
        enter_active: 'enter_active',
        enter_to: 'enter_to',
        leave: 'leave',
        leave_active: 'leave_active',
        leave_to: 'leave_to'
      }, options);

      if (on.values[key] !== options.trigger) {
        on.values[key] = options.trigger;
        if (on.items.length == 0) {
          //if if directive does not have any children, create them
          vDomCreateItems(on, inject);
        } else {
          if (options.duration) {
            vDomCreateItems(on, inject);

            on.items[1].elem.classList.add(options.enter_active);
            on.items[0].elem.classList.add(options.leave_active);

            on.items[1].elem.classList.add(options.enter);
            on.items[0].elem.classList.add(options.leave);

            setTimeout(function () {
              on.items[1].elem.classList.remove(options.enter);
              on.items[0].elem.classList.remove(options.leave);

              on.items[1].elem.classList.add(options.enter_to);
              on.items[0].elem.classList.add(options.leave_to);
            }, 0);
            //discard vDom nodes of the element that will be removed
            on.items[0].items = [];
            setTimeout(function () {
              on.items[1].elem.classList.remove(options.enter_active);
              on.items[0].elem.classList.remove(options.leave_active);
              on.items[1].elem.classList.remove(options.enter_to);
              on.items[0].elem.classList.remove(options.leave_to);

              removeElement(on.items[0].elem);
              on.items.shift();
            }, options.duration);
            return EAttrResult.SkipChildren;
          }
          checkVDomNode(on.items[0], {});
        }
      } else {
        checkVDomNode(on.items[0], {});
      }
    },
    'bind': function (on, inject) {
      var key = "bind";
      var getter = on.getters[key];
      var newValue = undefined;
      try {
        newValue = getter(inject);
      } catch (ex) { }
      on.values[key] = newValue;
      updateBoundElement(on.elem, newValue);

    },
    'selected': function (on, inject) {
      var key = "selected";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (newValue) {
        on.elem.setAttribute('selected', "");
      } else {
        on.elem.removeAttribute('selected');
      }
    },
    'style': function (on, inject) {
      var key = "style";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (typeof newValue == 'object') {
        Objects.forEach(newValue, function (prop, i) {
          if (prop !== null)
            on.elem.style[i] = prop;
          else
            on.elem.style[i] = 'auto';
        });
      }
    },
    'attribute': function (on, inject) {
      var key = "attribute";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (typeof newValue == 'object') {
        Objects.forEach(newValue, function (prop, i) {
          if (prop !== on.elem.getAttribute(i)){
            if (prop !== null) {
               on.elem.setAttribute(i, prop);
            } else {
              on.elem.removeAttribute(i);
            }
          }
        });
      }
    },
    'display': function (on, inject) {
      var key = "display";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (on.values[key] !== newValue) {
        on.values[key] = newValue;
        if (!on.valuesD.hasOwnProperty(key)) {
          on.valuesD[key] = on.elem.style.display;
        }

        on.elem.style.display = newValue;

      }
    },
    'show': function (on, inject) {
      var key = "show";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (on.values[key] !== newValue) {
        on.values[key] = newValue;
        if (!on.valuesD.hasOwnProperty(key)) {
          on.valuesD[key] = on.elem.style.display;
        }

        if (newValue) {
          on.elem.style.display = on.valuesD[key];
        } else {
          on.elem.style.display = 'none';
        }
      }
    },
    'class': function (on, inject) {
      var key = "class";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (on.values[key] !== newValue) {
        on.values[key] = newValue;
        if (!on.valuesD.hasOwnProperty(key)) {
          on.valuesD[key] = on.elem.className;
        } else {
          on.elem.className = on.valuesD[key];
        }

        if (!empty(newValue) && on.elem.className.indexOf(newValue) < 0) {
          on.elem.className += (on.elem.className ? " " : "") + newValue;
        }
      }
    },
    'innerhtml': function (on, inject) {
      var key = "innerhtml";
      var getter = on.getters[key];
      var newValue = getter(inject);
      if (on.values[key] !== newValue) {
        on.values[key] = newValue;
        on.elem.innerHTML = newValue;
      }
    },
    /**
     * 
     * @param {vDom} on 
     * @param {*} inject 
     */
    'foreach': function (on, inject) {
      var key = "foreach";
      var getter = on.getters[key];
      /** @type {{data:string,index:string,item:string}}*/
      var parts = getter;
      var data = createGetter(parts.data, inject)(inject) || [];

      var fo = document.createDocumentFragment();

      var fo1 = document.createDocumentFragment();


      var touchedKeys = {};
      //var touchedObjects = [];
      //remove all items temporarely (not right away)
      function moveAllToFragment() {
        for (var index in on.items) {
          if (!on.items.hasOwnProperty(index))
            continue;
          fo.appendChild(on.items[index].elem);
        }
      }

      //create a new fragment for new/updated items
      var hasNew = false;
      var hasDeleted = false;
      var hasChanges = 0;

      for (var index in data) {
        if (!data.hasOwnProperty(index))
          continue;
        var item = data[index];
        if (item === undefined)
          continue;
        touchedKeys[index] = null;
        var inj = {};
        inj[parts.index] = index;
        inj[parts.item] = item;
        inj = Object.assign({}, inject, inj);

        if (on.items[index] && isObject(item) && !isObjLiteral(item)) {
          //it is some sort of complex object. Handle it differently
          if (on.items[index].INJECT[parts.item] != item) {
            //element's injected item is not the same as current item (can not hot-swap complex instances!)
            //delete object
            hasDeleted = true;
            if (on.items[index].elem == null || on.items[index].elem instanceof DocumentFragment) {
              removeVDomItems(on.items[index].items);
            }
            removeElement(on.items[index].elem);
            delete on.items[index];
          }
        }

        if (!on.items.hasOwnProperty(index)
          /*||
on.items[index].INJECT[parts.item] != item*/
        ) {
          //a new item appeared
          if (!hasNew) {
            hasNew = true;
            moveAllToFragment();
          }

          var vdom = on.itemBuilder(inj);
          on.items[index] = vdom;
          fo1.appendChild(on.items[index].fragment || on.items[index].elem);
        } else {
          if (!on.items[index].elem.parentElement) {
            //Items have been removed from DOM
            return EAttrResult.SkipChildren;
          }
          on.items[index].INJECT = inj;
          insertBefore(fo1, on.items[index].elem);
          if (checkVDomNode(on.items[index], inj) === true) {
            hasChanges++;
          }
        }
      }
      //delete vdom.items that were not in the data object
      for (var index in on.items) {

        //if (!isObject(on.items[index].INJECT)){
        if (!on.items.hasOwnProperty(index))
          continue;
        if (touchedKeys.hasOwnProperty(index))
          continue;

        hasDeleted = true;
        if (on.items[index].elem == null || on.items[index].elem instanceof DocumentFragment) {
          removeVDomItems(on.items[index].items);
        }
        removeElement(on.items[index].elem);

        delete on.items[index];
      }

      fo.appendChild(fo1);

      if (on.elem.parentNode) {
        //if new or deleted elements, remove the old frag and insert the new one
        if (hasNew) {
          insertAfter(fo, on.elem);
        }
      } else {
        console.warn("[ForEach]: element does not have a parent!", on.elem);
      }

      return EAttrResult.SkipChildren;
    },
    /**
     * @param {vDom} on  
     * @param {*} inject 
     */
    'directive': function (on, inject) {
      var key = "directive";
      var getter = on.getters[key];
      var html = getter(inject);

      if (html instanceof BaseComponent) {
        on.getters["component"] = getter;
        return attributes["component"](on, inject);
      }

      if (on.values[key] !== html) {
        on.values[key] = html;

        //clear any previous component elements
        removeVDomItems(on.items);

        /** @type {vDom} */
        var c_vDom = null;

        if (html) {
          if (html instanceof DocumentFragment) {
            c_vDom = { elem: html, fragment: null, items: [], values: {}, valuesD: {}, getters: {}, setters: {}, itemBuilder: null, inject: {} };
          } else {
            c_vDom = executeSource(parseElement(html), inject);
          }
        }
        if (c_vDom) {
          var p_vDom = on.itemBuilder(inject);
          if (!(c_vDom.elem instanceof DocumentFragment)) {
            Objects.forEach(p_vDom.getters, (getter, key) => {
              c_vDom.getters[key] = getter;
            });

            //copy html attributes
            if (c_vDom.elem.attributes) {
              for (var ii = 0; ii < p_vDom.elem.attributes.length; ii++) {
                var attr = p_vDom.elem.attributes[ii];
                //only overwrite non-existing clild attrs
                if (!c_vDom.elem.getAttribute(attr.name)) {
                  c_vDom.elem.setAttribute(attr.name, attr.value);
                } else {
                  c_vDom.elem.setAttribute(attr.name, c_vDom.elem.getAttribute(attr.name) + " " + attr.value);
                }
              }
            }
            on.items = [c_vDom];
          } else {
            on.items = c_vDom.items;
          }

          insertVDomElementAfter(c_vDom, on.elem);

          for (var i in on.items) {
            if (!on.items.hasOwnProperty(i))
              continue;
            checkVDomNode(on.items[i], inject);
          }
        }
      } else {
        //just update its items
        for (var i in on.items) {
          if (!on.items.hasOwnProperty(i))
            continue;
          checkVDomNode(on.items[i], inject);
        }
      }

      return EAttrResult.SkipChildren;
    },
    /**
     * 
     * @param {vDom} on  
     * @param {*} inject 
     */
    'component': function (on, inject) {
      var key = "component";
      var getter = on.getters[key];
      /** @type {BaseComponent} */
      var component = getter(inject);

      //if component is actually a class and component value is not yet set, then instantiate the constructor
      if (!on.values[key] && component && component.prototype instanceof BaseComponent) {
        component = new component;
      } else if (component && component.prototype instanceof BaseComponent) {
        //if same component type, then do not check exact match.
        component = on.values[key];
      }

      if (on.values[key] !== component) {
        //clear any previous component elements
        removeVDomItems(on.items);
        if (on.values[key] && on.values[key].binder) {
          removeElement(on.values[key].binder.vdom.elem);
          removeVDomItems(on.values[key].binder.vdom.items);
        }

        on.values[key] = component;

        if (!(component instanceof BaseComponent)) {
          return EAttrResult.SkipChildren;
        }


        var inj = Object.assign({}, inject);
        if (component.template) {
          on.values[key] = component;
          //build parent vDom in the parent scope
          /** @type {vDom} */
          var p_vDom = on.itemBuilder(inject);
          if (p_vDom instanceof DocumentFragment) {
            throw Error("Component container " + JSON.stringify(on.elem) + " can not be a fragment!");
          }

          component.binder = new Binder(component).setInjectVars(inj).bindElements(component.events, component.template);
          var c_vDom = component.binder.vdom;

          //link componenet properties to getter values
          Objects.forEach(p_vDom.getters, (getter, key) => {
            c_vDom.getters[key] = getter;
            if (component[key] === undefined){
              console.warn(`Warning. Trying to set undefined property '${key}' in Component '${getClassName(component)}'. Please define property in component constructor!`);
            }

            component[key] = getter(inject);
          });

          var dynamicEvents = [];

          //Copy over setters into the componenet
          //Copy over 2Way binding callbacks into the componenet
          Objects.forEach(p_vDom.setters, (setter, key) => {
            c_vDom.setters[key] = setter;
            //add change listener to the context
            if (isFunction(component[key + 'Change_2'])) {
              throw new Error(`Component can not have method ${key + 'Change_2'} it is used excusively for 2-way data binding with ${key}`);
            }
            dynamicEvents.push(key + 'Change_2');
            component[key + 'Change_2'] = function (val) {
              return c_vDom.setters[key](inject, val);
            };

          });

          //Copy over callers into the componenet
          Objects.forEach(p_vDom.callers, (caller, key) => {
            if (dynamicEvents.indexOf(key) >= 0) {
              throw new Error(`Component ${getClassName(component)} can not override 2-way event (${key})!`);
            }
            c_vDom.callers[key] = component[key] = caller;
          });

          //copy html attributes
          if (!(c_vDom.elem instanceof DocumentFragment) && !(c_vDom.elem instanceof Comment)) {
            for (var ii = 0; ii < p_vDom.elem.attributes.length; ii++) {
              var attr = p_vDom.elem.attributes[ii];
              //only overwrite non-existing clild attrs
              if (!c_vDom.elem.getAttribute(attr.name)) {
                c_vDom.elem.setAttribute(attr.name, attr.value);
              } else {
                c_vDom.elem.setAttribute(attr.name, c_vDom.elem.getAttribute(attr.name) + " " + attr.value);
              }
            }
          }
          //set plainAttrs as properties of our component instance
          Objects.forEach(p_vDom.plainAttrs, (value, key) => {
            //only create property if value is not null: attribute has the value part
            if (value !== null) {
              component[key] = value;
              component.attributes[key] = value;
            }
          });

          var p_frag = document.createDocumentFragment();

          //move host children to temp fragment
          // @ts-ignore
          DOM(p_frag).append(p_vDom.elem.childNodes);


          component.parentPage = self.context;
          //let component decide where to put parent's children
          component.templateFragment = p_frag;
          component.templateUpdate = function () {
            checkVDomNode(on, inject);
          };

          on.items = [p_vDom];

          //no real need to call _init 
          //tryCall(component,component._init);	

          //insert component vDom with new children after the [component] vDom element
          insertVDomElementAfter(c_vDom, on.elem);

          //call onInit method in the next frame
          //setTimeout(function(){
          if (!(c_vDom.elem instanceof DocumentFragment)) {
            tryCall(component, component._onInit, c_vDom.elem);
          }
        } else {
          //component does not have own template. Render host template
          p_vDom = on.itemBuilder(inject);
          on.items[0] = p_vDom;

          //insert parent vDom with new children after the [component] vDom element
          insertAfter(p_vDom.elem, on.elem);

          //call onInit method in the next frame
          //setTimeout(function(){
          tryCall(component, component._onInit, p_vDom.elem);
          //});
        }
        //parent vDom items still belong to the directive vDom node

      } else {
        //same component. Just update own parent elem vDom items
        //component items do not get updated by this!
        for (var i in on.items) {
          if (!on.items.hasOwnProperty(i))
            continue;
          checkVDomNode(on.items[i], inject);
        }
        if (!component.container) {
          tryCall(component, component._onInit, on.elem.parentElement);
        }
        if (component && component.binder) {
          tryCall(component, component.update);
        }
      }

      return EAttrResult.SkipChildren;
    }
  };

  function applyCallBack(elem, context, evName, callback, cancelUIUpdate) {
    DOM(elem).addEventListener(evName, function (event) {
      updateBoundContextProperty(event.target, cancelUIUpdate); //skip formatting for input event
      if (callback && tryCall(context, callback, event) && event.target['parentNode'])
        repaint(event.target['parentNode']);
    });
  }

  function applyCallbacks(elem, context, callbacks) {
    for (var k in callbacks) {
      //skip if custom callback is empty or input or change
      if (empty(callbacks[k]) || k == 'change' || k == 'input')
        continue;
      applyCallBack(elem, context, k, callbacks[k]);
    }
    //change or input are added separately if element is setting
    if (isElementSetting(elem)) {
      if (isElementSettingOnInput(elem)) {
        applyCallBack(elem, context, 'input', callbacks['input'], true);
      }
      applyCallBack(elem, context, 'change', callbacks['change']);
    }
  }

  function createExecuteElemAttrGetter(elem, attrName, attrValue) {

    try {
      var inj = findElemInject(elem);
      if (empty(elem.VDOM.getters[attrName]))
        elem.VDOM.getters[attrName] = createGetter(attrValue, inj);
      var result = elem.VDOM.getters[attrName](self, inj);
    } catch (ex) {
      var result = null;
    }
    return result;
  }

  function updateBoundElement(elem, v) {
    var format = elem.getAttribute ? elem.getAttribute('format') : null;
    if (format !== null) {
      var formats = format.split(":");
      if (formats.length > 0 && (formats[0] === "number" || formats[0] === "localenumber")) {
        if (v !== "" && v !== null) {
          v = v * 1;
          if (isNaN(v)) v = 0;
          if (formats.length == 2) {
            var ln = !isNaN(formats[1]) ? formats[1] : createExecuteElemAttrGetter(elem, 'format', formats[1]);

            v = round(v, parseInt(ln));
          }
          if (formats[0] === "localenumber" && elem.getAttribute('type') != 'number' && Number(v).toLocaleString) {
            v = Number(v).toLocaleString();
          }
        }
      }
      if (formats.length > 0 && formats[0] === "boolean") {
        if (formats.length === 2) {
          var titles = formats[1].split(",");
          v = titles[(v === true ? 0 : 1)];
          if (v === undefined)
            throw Error("Value of bind is not part of format's boolean options");
        }
      }
      //if (v !== undefined && v !== "null" && v !== null ){
      if (formats.length > 0 && formats[0] === "dateTime") {
        v = DateTime.toHumanDateTime(v);
      }
      if (formats.length > 0 && formats[0] === "date") {
        v = DateTime.toHumanDate(v);
      }
      if (formats.length > 0 && formats[0] === "time") {
        v = DateTime.toHumanTime(v);
      }
      //}
    }
    switch (elem.tagName) {
      case "SELECT":
        //DOM(elem).find("option").forEach((e)=>{e.selected = false});
        //setTimeout(()=>{
        /** @type {HTMLOptionElement} */
        // @ts-ignore
        let firstOption = DOM(elem).find("option")[0];
        if (v === null || v === undefined) {
          /** @type {HTMLOptionElement} */
          // @ts-ignore
          firstOption.selected = true;
          var fVal = firstOption.value;
          if (fVal !== null) {
            elem.value = fVal;
            updateBoundContextProperty(elem);
          }
        } else {
          /** @type {HTMLOptionElement} */
          // @ts-ignore
          let sel = DOM(elem).find("option[value='" + v + "']")[0];
          if (sel) {
            sel.selected = true;
            elem.value = v; //this is important
          } else {
            firstOption.selected = true;
            //opdate data property to keep it in sync with element; 
            updateBoundContextProperty(elem);
          }
        }
        //});
        break;
      case "OPTION":
      case "INPUT":
        switch (elem.type) {
          case "radio":
            var cv = elem.value;
            if (isBoolean(v)) {
              cv = elem.value == "true";
            }
            elem.checked = (v == cv || (v === null && elem.value == ""));
            break;
          case "checkbox":
            elem.checked = v;
            break;
          case "file":
            //file value can not be set programmatically!
            break;
          default:
            elem.value = toInputValue(v);
            break;
        }
        break;
      case "IMG":
        if (elem.src !== v)
          elem.src = toInputValue(v);
        break;
      case undefined: //for text nodes
        if (elem.nodeValue !== v)
          elem.nodeValue = toInputValue(v);
        break;
      default:
        if (elem.innerText !== v)
          elem.innerText = toInputValue(v);
        break;
    }
  }

  function toInputValue(val) {
    if (typeof val == 'undefined' || val === null)
      return "";
    return val;
  }

  function isElementSetting(elem) {
    switch (elem.tagName) {
      case "SELECT":
      case "OPTION":
      case "TEXTAREA":
      case "INPUT":
        return true;
      default:
        return false;
    }
  }

  function isElementSettingOnInput(elem) {
    switch (elem.tagName + ":" + elem.type) {
      case "INPUT:text":
      case "INPUT:password":
      case "INPUT:email":
      case "INPUT:number":
      case "INPUT:search":
      case "INPUT:week":
      case "INPUT:url":
      case "INPUT:time":
      case "INPUT:tel":
      case "INPUT:range":
      case "INPUT:month":
      case "INPUT:datetime":
      case "INPUT:date":
      case "INPUT:color":
      case "INPUT:file":
      case "TEXTAREA":

        return true;
      default:
        return false;
    }
  }

  function formatValueToElem(elem, value) {
    var format = elem.getAttribute('format');

    var v = value;
    if (!empty(format)) {
      var formats = format.split(":");
      if (formats.length > 0 && (formats[0] === "number" || formats[0] === "localenumber")) {
        if (value === "")
          v = null;
        else {
          if (formats[0] === "localenumber") {
            v = numberFromLocaleString(value);
          } else {
            v = Number(value);
          }

          //v = value * 1;
          if (isNaN(v)) v = 0;
          if (formats.length == 2) {
            var ln = !isNaN(formats[1]) ? formats[1] : createExecuteElemAttrGetter(elem, 'format', formats[1]);

            v = round(v, parseInt(ln));
          }
        }
      }
      if (formats.length > 0 && formats[0] === "boolean") {
        if (formats.length === 2) {
          var titles = formats[1].split(",");
          if (titles.length >= 1)
            v = value === titles[0];
          else
            v = parseInt(value) != 0;
        } else {
          if (value == "true")
            v = true;
          else if (value == "false")
            v = false;
          else
            v = parseInt(value) != 0;
        }
      }
      if (formats.length > 0 && formats[0] === "dateTime") {
        if (formats.length == 1) {
          v = DateTime.fromHumanDateTime(value);
        }
      }
      if (formats.length > 0 && formats[0] == "date") {
        if (formats.length == 1) {
          v = DateTime.fromHumanDate(value);
        }
      }
      if (formats.length > 0 && formats[0] == "time") {
        if (formats.length == 1) {
          v = DateTime.fromHumanTime(value);
        }
      }
    } else {
      v = value;
    }
    return v;
  }

  function updateBoundContextProperty(elem, skipUpdate) {


    if (!isElementSetting(elem) || empty(elem['VDOM']) || empty(elem['VDOM'].setters) || empty(elem['VDOM'].setters.bind))
      return;
    var v;

    var format = elem.getAttribute('format');
    var type = elem.getAttribute('type');

    switch (elem.tagName) {
      case "SELECT":
        let sel = DOM(elem).find("option:checked")[0];
        if (sel) {
          v = formatValueToElem(elem, sel.getAttribute('value'));
        }
        break;
      case "OPTION":
      case "INPUT":
        switch (type) {
          case 'checkbox':
            v = elem.checked;
            break;
          case 'file':
            v = elem.value;
            break;
          default:
            v = formatValueToElem(elem, elem.value);
            break;
        }
        break;
      default:
        v = elem.value;
    }
    var inj = Object.assign({}, self.injectVars, findElemInject(elem));

    var domElVal = elem['VDOM'].getters.bind(inj);
    var vDomdomElVal = elem['VDOM'].values.bind;
    if (domElVal !== v || v !== vDomdomElVal) {

      if (skipUpdate && self.context[isSkipUpdate] === false) {
        self.context[isSkipUpdate] = true;
        elem['VDOM'].setters.bind(inj, v);
        self.context[isSkipUpdate] = false;
      } else {
        //because upon change the value is likely to be the same, but we still want to trigger the update, set v to isSkipUpdate (that will not trigger anything) first and then re-set it back
        elem['VDOM'].setters.bind(inj, isSkipUpdate);
        //then immediately set the proper value
        elem['VDOM'].setters.bind(inj, v);
      }
    }
  }

  function getForeachAttrParts(attrValue) {
    if (empty(attrValue))
      return null;
    /** @type {string[]}*/
    var parts = attrValue.split(/ (in|as|where) /g);
    var p = {
      data: null,
      index: 'index',
      item: 'item',
      where: null
    };
    var p_name = 'data';
    Objects.forEach(parts, (part) => {
      switch (part) {
        case 'in':
          p.index = p.data; //first item must have been index
          p_name = 'data'; //set data next
          break;
        case 'as':
          p_name = 'item'; //set item next
          break;
        case 'where':
          p_name = 'where'; //set where next
          break;
        default:
          p[p_name] = part;
      }
    });
    return p;
  }
  /**
   * 
   * @param {string} expression 
   * @return {function(*)} callback
   */
  function createGetter(expression, inject) {
    var inj = createInjectVarText(inject);
    try {
      var cashe = inj + expression;
      if (getterCashe.hasOwnProperty(cashe))
        return getterCashe[cashe];

      var getter = new Function('inject',
        `${inj}; return ${expression};`
      );
      return getterCashe[cashe] = getter.bind(self.context);
    } catch (ex) {
      return null;
    }
  }

  /**
   * Create a caller that does not return any value. Can execute any number of methods.
   * @param {string} expression 
   * @return {function(*)} callback
   */
  function createCaller(expression, inject) {
    var inj = createInjectVarText(inject);
    try {
      var cashe = inj + expression;
      if (getterCashe.hasOwnProperty(cashe))
        return getterCashe[cashe];

      var getter = new Function('inject',
        `${inj}; ${expression};`
      );
      return getter.bind(self.context);
    } catch (ex) {
      return null;
    }
  }
  /**
   * 
   * @param {string} expression 
   * @param {object} inject
   * @return {function(*,*)} callback
   */
  function createSetter(expression, inject) {
    var inj = createInjectVarText(inject);

    try {
      // @ts-ignore
      var setter = new Function('inject', 'value',
        `${inj}; return ${expression} = value;`
      );
      return setter.bind(self.context);
    } catch (ex) {
      return null;
    }
  }

  function createInjectVarText(vars) {
    var inj = "";
    if (!empty(vars)) {
      for (var i in vars) {
        if (!vars.hasOwnProperty(i)) continue;
        inj += "var " + i + "= inject['" + i + "'];\n";
      }
    }
    return inj;
  }

  function repaint(element) {
    // in plain js
    var old = element.style.display;
    element.style.display = 'none';
    element.style.display = old;
  }

  function round(num, decimals) {
    decimals = decimals || 0;
    var scale = Math.pow(10, decimals);
    return Math.round(num * scale) / scale;
  }

  function tryGetComponenet(tagName) {
    return window['LEET_REGISTER'] ? window['LEET_REGISTER'][tagName] : null;
  }
};



function removeDOMElement(elem) {
  if (elem.parentNode) {
    elem.parentNode.removeChild(elem);
  }
}
/**
 * 
 * @param {vDom} en 
 */
export function removeVDOMElement(en) {
  if (en.items && en.items.length > 0) {
    for (var i in en.items) {
      if (!en.items.hasOwnProperty(i)) continue;
      removeVDOMElement(en.items[i]);
    }
    delete en.items;
  }

  if (en.elem) {
    delete en.elem.VDOM;
    removeDOMElement(en.elem);
    delete en.elem;
  }

  delete en.fragment;
  delete en.getters;
  delete en.setters;
  delete en.callers;
  delete en.itemBuilder;

  delete en.values;
  delete en.valuesD;
}