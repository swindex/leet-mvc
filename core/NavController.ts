import { tryCall, argumentsToArray, empty, isObject } from "./helpers";
import { BasePage } from "../pages/BasePage";
import { isSkipUpdate } from "./Watcher";
import { Objects } from "./Objects";
import { DOM } from "./DOM";

export interface PageFrame {
  name: string;
  element: HTMLElement;
  page: any;
}

export interface WindowSize {
  width: number | null;
  height: number | null;
}

export class NavController {
  stack: PageFrame[];
  windowSize: WindowSize;
  isLoadingRoot: boolean;
  backTimeout: number;
  backTimeoutRunning: boolean;
  transitionTime: number;
  pageContainer: HTMLElement;

  constructor() {
    this.stack = [];

    this.windowSize = { width: null, height: null };

    this.isLoadingRoot = false;

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
    DOM(window).addEventListener('resize', this.windowResizeHandler);

    DOM(document).addEventListener("backbutton", this.documentBackButtonHandler);
  }

  windowResizeHandler(ev: Event): void {
    this.windowSize.width = window.innerWidth;
    this.windowSize.height = window.innerHeight;

    for (let i = 0; i < this.stack.length; i++) {
      //recalcContentHeight(this.stack[i].element);
      tryCall(this.stack[i].page, this.stack[i].page.resize, this.windowSize);
    }
  }

  documentBackButtonHandler(): void {
    const cf = this.currentFrame();
    if (cf && tryCall(cf.page, cf.page.onBackNavigate) !== false && this.back() === null) {
      this.onRootPageBackPressed(cf.name);
    }
  }

  /**
   * Set the container element for pages
   */
  setContainer(container: HTMLElement, listenTobBackButton: boolean = false): void {
    this.pageContainer = container;
    //if container is not document, remove the back button handler
    if (this.pageContainer != document.body && !listenTobBackButton) {
      DOM(document).off('backbutton');
    }
  }

  /**
   * Remove all pages and load passed page Constructor as Root
   */
  setRoot<T extends BasePage>(pageConstructor: new (...args: any[]) => T | Promise<new (...args: any[]) => T>, ...parameters: any[]): T | Promise<T> {
    this.isLoadingRoot = true;
    this.removeAllFrames();
    //self.onPageNavigateTo(pageConstructor.name);
    const page = this._createPage(this.pageContainer, pageConstructor, argumentsToArray(arguments, 1));
    //self.onPageCreated(page);
    this.isLoadingRoot = false;
    return page as T | Promise<T>;
  }

  /**
   * Remove All Pages
   */
  removeAll(): void {
    this.removeAllFrames();
  }

  /**
   * Push a page on top of stack.
   */
  push<T extends BasePage>(pageConstructor: new (...args: any[]) => T | Promise<new (...args: any[]) => T>, ...parameters: any[]): T | Promise<T> {
    if (this.currentFrame())
      tryCall(this.currentFrame()!.page, this.currentFrame()!.page.onLeave);
    //self.onPageNavigateTo(pageConstructor.name);
    const page = this._createPage(this.pageContainer, pageConstructor, argumentsToArray(arguments, 1));
    //self.onPageCreated(page);
    //pushState(pageConstructor.name);
    return page as T | Promise<T>;
  }

  /**
   * Push a page on top of stack INTO a specified element
   */
  pushInto<T extends BasePage>(container: HTMLElement, pageConstructor: new (...args: any[]) => T | Promise<new (...args: any[]) => T>, ...parameters: any[]): T | Promise<T> {
    if (this.currentFrame())
      tryCall(this.currentFrame()!.page, this.currentFrame()!.page.onLeave);
    //self.onPageNavigateTo(pageConstructor.name);
    const page = this._createPage(container, pageConstructor, argumentsToArray(arguments, 2));
    //self.onPageCreated(page);
    return page as T | Promise<T>;
  }

  /**
   * Navigate Back
   * Returns true if success, null if last page and can not go back
   */
  back(): boolean | null {
    if (this.stack.length > 1) { //can not back on root page!
      if (this.backTimeoutRunning) return false;
      this.backTimeoutRunning = true;
      setTimeout(() => {
        this.backTimeoutRunning = false;
      }, this.backTimeout);

      const cf = this.currentFrame()!;
      if (this.checkPageOnBeforeDestroy(cf) === false)
        return false;
      this.removeLastFrame();
      this.onPageNavigateBack(cf.name, cf.page);
      this._resetPagesVisibility();

      return true;
    }
    return null;
  }

  /**
   * Remove page from stack
   */
  remove(pageObject: any): void {
    const frame = this.stack.find(el => el.page === pageObject);

    if (!frame) {
      console.warn(`Can't remove page ${pageObject?.constructor?.name} from the stack because it's already gone!`);
    } else {
      if (this.checkPageOnBeforeDestroy(frame) === false) {
        return;
      }
      this.removeFrame(frame);
    }

    this._resetPagesVisibility();
    const lastEntry = this.stack[this.stack.length - 1];
    if (lastEntry) {
      this.onPageNavigateBack(lastEntry.name, lastEntry.page);
    } else {
      this.onRootPageRemoved(pageObject);
    }
  }

  /**
   * Get a list of displayed pages
   */
  getPageNames(): string[] {
    const ret: string[] = [];
    Objects.forEach(this.stack, function(el: PageFrame) { ret.push(el.name); });
    return ret;
  }

  /**
   * Get Pages Stack
   */
  getPages(): PageFrame[] {
    return this.stack;
  }

  /**
   * Create page
   */
  _createPage(container: HTMLElement, pageConstructor: any, args: any[]): any {

    const insertIntoDOM = (pageObject: any) => {
      this.onPageNavigateTo(pageObject.name, pageObject, args);
      if (this.stack.length == 0) {
        //history.setRoot(null, pageObject.name, "#" + pageObject.name );
      } else {
        //history.push(null, pageObject.name, "#" + pageObject.name );
      }
      //if object is vue, mount it first
      if (pageObject._isVue) {
        const newEl = document.createElement('div');
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

      const classes = !empty(pageObject.className) ? (pageObject.className).split(" ") : [];
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
    };

    if (pageConstructor instanceof Promise) {
      //constructor is a promise.
      //Resolve it!
      return pageConstructor.then((_pageConstructor: any) => {
        //call it again
        return this._createPage(container, _pageConstructor, args);
      });
    } else if (typeof pageConstructor == "function") {

      const pageName = pageConstructor.pageName || pageConstructor.name;

      var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + pageName;
      var className = pageConstructor.className ? pageConstructor.className : "";

      //create page object in a new scope
      let pageObject: any;
      if (pageConstructor._isVue && isObject(args[0])) {
        pageObject = new pageConstructor({ propsData: args[0] });
      } else {
        pageObject = new pageConstructor(...args);
      }
      //pageObject.visibleParent = pageObject.visibleParent===null ? pageConstructor.visibleParent : pageObject.visibleParent;
      pageObject.name = pageName;
      //empty(pageObject.className) ? pageObject.className = className : null;
      pageObject.selector = selector;
      return insertIntoDOM(pageObject);

    } else {
      //create page object in a new scope
      const pageObject = pageConstructor;
      pageConstructor = pageObject.constructor;

      const name = (pageConstructor.name + "").replace(/bound /g, "");

      //var selector = pageConstructor.selector ? pageConstructor.selector : 'page-' + name;
      var className = pageConstructor.className ? pageConstructor.className : "";

      pageObject.name = name;
      //empty(pageObject.className) ? pageObject.className = className : null;
      //pageObject.selector = selector;
      return insertIntoDOM(pageObject);
    }

  }

  getMaxStackZIndex(): number {
    let maxZ = 0;
    for (let i = 0; i < this.stack.length; i++) {
      const frame = this.stack[i];
      maxZ = Math.max(maxZ, frame.page.style.zIndex);
    }
    return maxZ;
  }

  checkPageOnBeforeDestroy(frame: PageFrame): any {
    return tryCall(frame.page, frame.page.onBeforeDestroy);
  }

  removeFrame(frame: PageFrame): boolean {
    const frameIndex = this.stack.findIndex(el => el === frame);
    //remove from stack
    this.stack.splice(frameIndex, 1)[0];
    //tryCall(frame.page, frame.page.onBeforeDestroy);
    tryCall(frame.page, frame.page.onLeave);

    //tryCall(frame.page, frame.page._onDestroy);
    this.onDestroyPage(frame.name, frame.page, frameIndex);
    this.hidePageElement(frame, true);
    //history.pop();		

    return true;
  }

  removeLastFrame(): boolean | null {
    if (this.stack.length === 0)
      return null;
    return this.removeFrame(this.stack[this.stack.length - 1]);
  }

  /**
   * Return current page frame
   */
  currentFrame(): PageFrame | null {
    if (this.stack.length === 0)
      return null;
    return this.stack[this.stack.length - 1];
  }

  removeAllFrames(): void {
    if (this.stack.length === 0)
      return;

    const frame = this.stack[this.stack.length - 1];
    if (this.checkPageOnBeforeDestroy(frame) === false) {
      console.warn("Warning: Page " + frame.name + " was deleted despite it's onBeforeDestroy returning false!");
    }

    if (this.removeLastFrame())
      this.removeAllFrames();
  }

  /**
   * Set Page instance UI state value
   */
  setPageState(page: any, state: 'isDeleting' | 'isCreating' | 'isHiding' | 'isShowing' | 'isVisible' | 'isHidden'): void {
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
  _resetPagesVisibility(): void {
    let n = 0;
    let hideAfter = 1;
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const frame = this.stack[i];
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
   */
  showPageElement(frame: PageFrame, inactive?: boolean): void {
    setTimeout(() => {
      if (frame.page.isDeleting) {
        return;
      }

      if (frame.page.isHidden) {
        this.setPageState(frame.page, 'isShowing');
        setTimeout(() => {
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
      setTimeout(() => {
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
   */
  hidePageElement(frame: PageFrame, isDeleting?: boolean): void {
    const element = frame.element;
    isDeleting = isDeleting || false;

    if (frame.page.isDeleting)
      return;
    const doHideElem = (shouldDelete?: boolean) => {
      window.requestAnimationFrame(() => {
        this.setPageState(frame.page, 'isHidden');
        if (shouldDelete) {
          frame.page[isSkipUpdate] = true;
          frame.page.Nav = null;
          frame.page._cleanup(true);
        }
      });
    };
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
  destroy(): void {
    DOM(window).removeEventListener('resize', this.windowResizeHandler);
    DOM(document).removeEventListener('backbutton', this.documentBackButtonHandler);
  }

  /**
   * ***Override***
   * Callback fired when Back button is clicked on LAST page of the app
   */
  onRootPageBackPressed(name: string): void { }

  /**
   * ***Override***
   * Callback fired on page forward
   */
  onPageNavigateTo(name: string, pageObject: any, args: any[]): void { }

  /**
   * Callback fired when root page is removed
   */
  onRootPageRemoved(pageObject: any): void { }

  /**
   * ***Override***
   * Callback fired when page is created
   */
  onPageCreated(page: any): void { }

  /**
   * Callback fired when page is navigated "back" to
   */
  onPageNavigateBack(name: string, pageObject: any): void { }

  /**
   * Callback fired when page is destroyed
   */
  onDestroyPage(name: string, pageObject: any, frameIndex: number): void { }
}