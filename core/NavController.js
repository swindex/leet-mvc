import { tryCall, argumentsToArray } from "./helpers";
import { BasePage } from "../pages/BasePage";
import { isSkipUpdate } from "./Watcher";
import { Objects } from "./Objects";
import { DOM } from "./DOM";
import { isObject } from "util";

export class NavController{
  constructor(){
    /**
     * @typedef PageFrame
     * @prop {string} name
     * @prop {JQuery<Element>} element
     * @prop {object} page
     */
    /** @type {PageFrame[]} */
    this.stack = [];

    this.windowSize = { width: null, height: null };

    this.isLoadingRoot=false;

    this.backTimeout = 300;
    this.backTimeoutRunning = false;

    this.transitionTime = 400;
    this.pageContainer = document.body;

      //Set default window size cashe
    this.windowSize.width = window.innerWidth;
    this.windowSize.height = window.innerHeight;

    //bind all methods to this isntance
    Objects.bindMethods(this);

    //add ONE listener that will fire onResize on all pages;
    DOM(window).addEventListener('resize', this.windowResizeHandler.bind(this));
    
    DOM(document).addEventListener("backbutton", this.documentBackButtonHandler.bind(this));


  }
  windowResizeHandler(ev){
    this.windowSize.width = window.innerWidth;
    this.windowSize.height = window.innerHeight;

    for (var i = 0; i < this.stack.length; i++) {
      //recalcContentHeight(this.stack[i].element);
      tryCall(this.stack[i].page, this.stack[i].page.resize, this.windowSize);
    }
  }
  documentBackButtonHandler(){
    var cf = this.currentFrame();
    if (cf && tryCall(cf.page, cf.page.onBackNavigate) !== false && tryCall(cf.page, cf.page.onBeforeDestroy) !== false && this.back() === null) {
      this.onRootPageBackPressed(cf.name);
    }
  }

  /**
	 * @param {HTMLElement} container
	 */
  setContainer(container, listenTobBackButton = false) {
    this.pageContainer = container;
    //if container is not document, remove the back button handler
    if (this.pageContainer != document.body && !listenTobBackButton) {
      DOM(document).off('backbutton');
    }
  };

  /**
	 * Remove all pages and load passed page Constructor as Root
	 * @param {object} pageConstructor
	 * @param {...any} [parameters] 
	 * @return {BasePage|Promise}
	 */
  setRoot(pageConstructor, parameters) {
    this.isLoadingRoot=true
    this.removeAllFrames();
    //self.onPageNavigateTo(pageConstructor.name);
    var page = this._createPage(this.pageContainer, pageConstructor, argumentsToArray(arguments, 1));
    //self.onPageCreated(page);
    this.isLoadingRoot=false
    return page;
  };
  /**
	 * Remove All Pages
	 */
  removeAll(){
    this.removeAllFrames();
  };

  /**
	 * Push a page on top of this.stack.
	 * @param {object} pageConstructor 
	 * @param {...any} [parameters]  
   * @return {BasePage|Promise}
	 */
  push(pageConstructor, parameters) {
    if (this.currentFrame())
      tryCall(this.currentFrame().page, this.currentFrame().page.onLeave);
    //self.onPageNavigateTo(pageConstructor.name);
    var page = this._createPage(this.pageContainer, pageConstructor, argumentsToArray(arguments, 1));
    //self.onPageCreated(page);
    //pushState(pageConstructor.name);
    return page;
  };

  /**
	 * Push a page on top of this.stack INTO a specified element
	 * @param {HTMLElement} container
	 * @param {object} pageConstructor 
	 * @param {...any} [parameters]  
	 */
  pushInto(container, pageConstructor, parameters) {
    if (this.currentFrame())
      tryCall(this.currentFrame().page, this.currentFrame().page.onLeave);
    //self.onPageNavigateTo(pageConstructor.name);
    var page = this._createPage(container, pageConstructor, argumentsToArray(arguments, 2));
    //self.onPageCreated(page);
    return page;
  };
  /**
	 * Navigate Back
	 * Returns true if success, null if last page and can not go back
	 * @return {null|boolean} 
	 */
  back() {
    if (this.stack.length > 1) { //can not back on root page!
      if (this.backTimeoutRunning) return false;
      this.backTimeoutRunning = true;
      setTimeout(() => {
        this.backTimeoutRunning = false; 
      }, this.backTimeout);

      var cf = this.currentFrame();
      this.removeLastFrame();
      this.onPageNavigateBack(cf.name, cf.page);
      this._resetPagesVisibility();

      return true;
    }
    return null;
  };
  /**
	 * Remuve page from this.stack
	 * @param {Page} pageObject 
	 */
  remove(pageObject) {
    for (var i = 0; i < this.stack.length; i++) {
      if (this.stack[i].page === pageObject) {
        this.removeFrameN(i);
        break;
      }
    }
    this._resetPagesVisibility();
    var lastEntry = this.stack[this.stack.length-1];
    if (lastEntry){
      this.onPageNavigateBack(lastEntry.name, lastEntry.page);
    }
  };
  /**
	 * Get a list of displayed pages
	 * @return {string[]}
	 */
  getPageNames() {
    var ret = [];
    Objects.forEach(this.stack, function (el) { ret.push(el.name); });
    return ret;
  };

  /**
	 * Get Pages Stack
	 * @return {PageFrame[]}
	 */
  getPages() {
    var ret = [];
    return this.stack;
  };
  /**
	 * Create page 
	 * @param {HTMLElement} container
	 * @param {any} pageConstructor 
	 * @param {any[]} args - array of arguments to pass to the page constructor
	 * @return {BasePage|Promise} 
	 */
  _createPage(container, pageConstructor, args) {

    var insertIntoDOM = (pageObject) => {
      this.onPageNavigateTo(pageObject.name, pageObject, args);
      if (this.stack.length == 0) {
        //history.setRoot(null, pageObject.name, "#" + pageObject.name );
      } else {
        //history.push(null, pageObject.name, "#" + pageObject.name );
      }
      //if pbject is vue, mount it first
      if (pageObject._isVue) {
        var newEl = document.createElement('div');
        container.appendChild(newEl);
        pageObject.$args = args;
        //if (args && args.length == 1)
        //  Object.assign(pageObject, args[0])
        pageObject.$mount(newEl);
        var p = pageObject.$el;
      } else {

        tryCall(pageObject, pageObject._init);
        var p = pageObject.page;
        p.setAttribute('id', pageObject.selector);
        container.appendChild(p);
      }

      pageObject.Nav = this;
      pageObject.style.zIndex = this.getMaxStackZIndex() + 100;

      var classes = !empty(pageObject.className) ? (pageObject.className).split(" ") : [];
      classes.push(className);
      pageObject.className = classes.join(' ');

      this.onPageCreated(pageObject);
      this.stack.push({ name: pageObject.name, element: p, page: pageObject });
      this._resetPagesVisibility();

      tryCall(pageObject, pageObject.onInit, p);

      setTimeout(() => {
        tryCall(pageObject, pageObject.onLoaded);
      }, 1);

      return pageObject;
    }

    if (pageConstructor instanceof Promise) {
      //constructor is a promise.
      //Resolve it!
      return pageConstructor.then(_pageConstructor => {
        //call it again
        return this._createPage(container, _pageConstructor, args);
      });
    } else if (typeof pageConstructor == "function") {

      var pageName = pageConstructor.pageName || pageConstructor.name

      var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + pageName;
      var className = pageConstructor.className ? pageConstructor.className : "";

      //create page object in a new scope
      if (pageConstructor._isVue && isObject(args[0])) {
        var pageObject = new pageConstructor({propsData: args[0]});
      } else {
        /** @type {BasePage} */
        var pageObject = new pageConstructor(...args);
      }
      //pageObject.visibleParent = pageObject.visibleParent===null ? pageConstructor.visibleParent : pageObject.visibleParent;
      pageObject.name = pageName;
      //empty(pageObject.className) ? pageObject.className = className : null;
      pageObject.selector = selector;
      return insertIntoDOM(pageObject);

    } else {
      //create page object in a new scope
      /** @type {BasePage} */
      var pageObject = pageConstructor;
      pageConstructor = pageObject.constructor;

      var name = (pageConstructor.name + "").replace(/bound /g, "");

      //var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + name;
      var className = pageConstructor.className ? pageConstructor.className : "";

      pageObject.name = name;
      //empty(pageObject.className) ? pageObject.className = className : null;
      //pageObject.selector = selector;
      return insertIntoDOM(pageObject);
    }

  }

  getMaxStackZIndex() {
    var maxZ = 0;
    for (var i = 0; i < this.stack.length; i++) {
      var frame = this.stack[i];
      maxZ = Math.max(maxZ, frame.page.style.zIndex);
    }
    return maxZ;
  }

  removeFrameN(frameIndex) {
    var frame = this.stack.splice(frameIndex, 1)[0];

    tryCall(frame.page, frame.page.onLeave);
    tryCall(frame.page, frame.page._onDestroy);
    this.onDestroyPage(frame.name, frame.page, frameIndex);

    this.hidePageElement(frame, true);
    //history.pop();		

    frame = null;
    return true;
  }
  removeLastFrame() {
    if (this.stack.length === 0)
      return null;
    return this.removeFrameN(this.stack.length - 1);
  }
  /**
	 * Return current page frame
	 * @return {PageFrame}
	 */
  currentFrame() {
    if (this.stack.length === 0)
      return null;
    return this.stack[this.stack.length - 1];
  }
  removeAllFrames() {
    if (this.stack.length === 0)
      return null;

    if (this.removeLastFrame())
      this.removeAllFrames();

  }
  /**
	 * Set Page instance UI state value
	 * @param {object} page 
	 * @param {'isDeleting'|'isCreating'|'isHiding'|'isShowing'|'isVisible'|'isHidden'} state 
	 */
  setPageState(page, state) {
    if (page[state] == true) {
      return;
    }
    page.isDeleting = null;
    page.isCreating = null;
    page.isHiding = null;
    page.isHidden = null;
    page.isShowing = null;
    page.isVisible = null;

    page[state] = true;
  }
  /**
	 * Recalculate pages' visibility
	 */
  _resetPagesVisibility() {
    var n = 0;
    var hideAfter = 1;
    for (var i = this.stack.length - 1; i >= 0; i--) {
      var frame = this.stack[i];
      if (i == 0) {
        frame.page.isRoot = true;
      } else {
        frame.page.isRoot = null;
      }
      if (!empty(frame.page.visibleParent))
        hideAfter++;
      if (hideAfter > n) {
        this.showPageElement(frame, i < this.stack.length - 1);
      } else {
        this.hidePageElement(frame);
      }
      n++;
    }
  }

  /**
	 * Show particular page DOM element
	 * @param {PageFrame} frame - page to show
	 * @param {boolean} [inactive] 
	 */
  showPageElement(frame, inactive) {
    setTimeout( ()=> {
      if (frame.page.isDeleting) {
        return;
      }

      if (frame.page.isHidden) {
        this.setPageState(frame.page, 'isShowing');
        setTimeout(()=>{
          tryCall(frame.page, frame.page.onEnter);
        }, 0);
      } else if (!frame.page.isHidden && !frame.page.isHiding && !frame.page.isVisible) {
        //if page is not yet have any attributes
        this.setPageState(frame.page, 'isCreating');

        //Add creating attribute ALMOST immedaitely for smooth appearance
        setTimeout(() => {
          tryCall(frame.page, frame.page.resize, this.windowSize);
        }, 0);

        setTimeout(() => {
          tryCall(frame.page, frame.page.onEnter);
        }, 0);
      }

      if (inactive) {
        frame.page.isInactive = true;
      } else {
        frame.page.isInactive = null;
      }

      //Set to fully visible after 500ms delay
      setTimeout(()=> {
        if (frame.page.isDeleting) {
          return;
        }

        if (!frame.page.isVisible) {
          this.setPageState(frame.page, 'isVisible');
          tryCall(frame.page, frame.page._onVisible);
        }

      }, this.transitionTime);
    });

  }

  /**
	 * Hide particular page DOM element
	 * @param {PageFrame} frame - page to show
	 * @param {boolean} [isDeleting] - true if page is being deleted
	 */
  hidePageElement(frame, isDeleting) {
    var element = frame.element;
    isDeleting = isDeleting || false;

    if (frame.page.isDeleting)
      return;
    var doHideElem = (isDeleting) => {
      window.requestAnimationFrame(()=> {
        this.setPageState(frame.page, 'isHidden');
        if (isDeleting) {
          frame.page[isSkipUpdate] = true;
          frame.page.Nav = null;
          frame.page.destroy(true);
        }
      });
    }
    if (!isDeleting && frame.page.isHidden) {
      doHideElem();
    } else {
      if (isDeleting) {
        this.setPageState(frame.page, 'isDeleting');
      } else {
        this.setPageState(frame.page, 'isHiding');
      }
      setTimeout(() => {
        doHideElem(isDeleting);
      }, isDeleting ? this.transitionTime : this.transitionTime + 100);	//hiding takes 100 ms longer than deleting
    }
  }
  /**
	 * Delete Event handlers that were created by the Nav instance
	 */
  destroy() {
    DOM(window).removeEventListener('resize', this.windowResizeHandler);
    DOM(document).removeEventListener('backbutton', this.documentBackButtonHandler);
  }

  /**
	 * ***Override***
	 * Callback fired when Back button is clicked on LAST page of the app 
	 * @param {string} name
	 */
  onRootPageBackPressed(name) { }
  /**
	 * ***Override***
	 * Callback fired on page forward
	 * @param {string} name 
	 * @param {any} pageObject
   * @param {any[]} args
	 */
  onPageNavigateTo(name, pageObject, args) { }

  /**
	 * ***Override***
	 * Callback fired when page is created
	 */
  onPageCreated(page) { }
  /**
	 * Callback fired when page is navigated "back" to
	 * @param {string} name 
	 */
  onPageNavigateBack(name, pageObject) { }

  /**
   * 
   * @param {*} name 
   * @param {*} pageObject 
   * @param {number} frameIndex
   */
  onDestroyPage(name, pageObject, frameIndex){

  }
}